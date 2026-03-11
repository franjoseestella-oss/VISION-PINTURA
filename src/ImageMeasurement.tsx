import React, { useState, useRef, useEffect } from 'react';
import type { MouseEvent } from 'react';

type MeasurementMode = 'segmentos' | 'puntos';
type SourceType = 'image' | 'video';

interface Point {
    x: number;
    y: number;
}

interface Segment {
    start: Point;
    end: Point;
}

const ImageMeasurement: React.FC = () => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [mode, setMode] = useState<MeasurementMode>('segmentos');
    const [isProcessing, setIsProcessing] = useState(false);
    const [measurementResult, setMeasurementResult] = useState<string | null>(null);
    const [sourceType, setSourceType] = useState<SourceType>('image');
    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [videoCurrentTime, setVideoCurrentTime] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);
    const [videoInferenceStatus, setVideoInferenceStatus] = useState<'idle' | 'inferring' | 'done'>('idle');

    const [segments, setSegments] = useState<Segment[]>([]);
    const [currentSegmentStart, setCurrentSegmentStart] = useState<Point | null>(null);
    const [points, setPoints] = useState<Point[]>([]);
    const [detections, setDetections] = useState<any[]>([]);
    const [confidenceThreshold, setConfidenceThreshold] = useState(0.0);

    // ── Calibración (lee de localStorage, se guarda desde la pantalla de Calibración)
    const [mmPerPx, setMmPerPx] = useState<number>(() => {
        const saved = localStorage.getItem('calibration_mmPerPx');
        return saved ? parseFloat(saved) : 0;
    });

    // Escuchar cambios de calibración hechos desde otra pestaña/componente
    useEffect(() => {
        const onStorage = () => {
            const saved = localStorage.getItem('calibration_mmPerPx');
            setMmPerPx(saved ? parseFloat(saved) : 0);
        };
        window.addEventListener('storage', onStorage);
        // Also poll for same-tab changes
        const interval = setInterval(onStorage, 2000);
        return () => { window.removeEventListener('storage', onStorage); clearInterval(interval); };
    }, []);

    // Track specification (from calibration screen)
    const [trackSpec, setTrackSpec] = useState<any>(() => {
        const saved = localStorage.getItem('trackSpec');
        return saved ? JSON.parse(saved) : null;
    });
    useEffect(() => {
        const onStorage = () => {
            const saved = localStorage.getItem('trackSpec');
            setTrackSpec(saved ? JSON.parse(saved) : null);
        };
        window.addEventListener('storage', onStorage);
        const interval = setInterval(onStorage, 2000);
        return () => { window.removeEventListener('storage', onStorage); clearInterval(interval); };
    }, []);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageElementRef = useRef<HTMLImageElement | null>(null);
    const roboflowImageRef = useRef<HTMLImageElement | null>(null);
    const videoElementRef = useRef<HTMLVideoElement | null>(null);
    const videoDetectionsRef = useRef<any[]>([]);
    const videoAnimFrameRef = useRef<number>(0);
    const lastInferenceTimeRef = useRef<number>(0);
    const isInferringRef = useRef<boolean>(false);
    const confidenceRef = useRef<number>(0.0);

    // Keep confidenceRef in sync
    useEffect(() => { confidenceRef.current = confidenceThreshold; }, [confidenceThreshold]);

    useEffect(() => {
        if (sourceType === 'image') redrawCanvas();
    }, [segments, points, mode, imageSrc, detections, confidenceThreshold]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSourceType('image');
            setVideoSrc(null);
            loadImage(file);
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Max 500MB to avoid memory issues with base64
        const MAX_VIDEO_SIZE = 500 * 1024 * 1024;
        if (file.size > MAX_VIDEO_SIZE) {
            setMeasurementResult(`Error: El vídeo es demasiado grande (${(file.size / 1024 / 1024).toFixed(0)}MB). Máximo 500MB.`);
            return;
        }

        // Stop any existing video loop
        if (videoAnimFrameRef.current) cancelAnimationFrame(videoAnimFrameRef.current);
        setSourceType('video');
        setImageSrc(null);
        roboflowImageRef.current = null;
        imageElementRef.current = null;
        setDetections([]);
        videoDetectionsRef.current = [];
        lastInferenceTimeRef.current = 0;
        isInferringRef.current = false;

        const canvas = canvasRef.current;
        if (canvas) { canvas.width = 1200; canvas.height = 900; }

        // Check if format is browser-compatible
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const browserFormats = ['mp4', 'webm', 'ogg', 'ogv'];

        if (browserFormats.includes(ext)) {
            // Direct playback — wrap in try/catch and validate
            try {
                const blobUrl = URL.createObjectURL(file);
                // Test if the browser can actually decode this video
                const testVideo = document.createElement('video');
                testVideo.preload = 'metadata';
                await new Promise<void>((resolve, reject) => {
                    testVideo.onloadedmetadata = () => resolve();
                    testVideo.onerror = () => reject(new Error(
                        `El navegador no puede reproducir este vídeo (${ext}). Puede que el códec no sea compatible.`
                    ));
                    // Timeout after 10 seconds
                    setTimeout(() => reject(new Error('Tiempo agotado al cargar el vídeo.')), 10000);
                    testVideo.src = blobUrl;
                });
                testVideo.src = ''; // cleanup test element
                setVideoSrc(blobUrl);
            } catch (err: any) {
                console.error('Video load error:', err);
                setMeasurementResult(`Error: ${err.message}`);
                setSourceType('image');
            }
        } else {
            // AVI, MOV, WMV, MKV etc. → convert via backend
            setIsProcessing(true);
            setMeasurementResult(`Convirtiendo vídeo (${ext.toUpperCase()})...`);
            try {
                const reader = new FileReader();
                const b64 = await new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = () => reject(new Error('Error leyendo el archivo de vídeo'));
                    reader.readAsDataURL(file);
                });

                const resp = await fetch('http://localhost:8765/api/video/convert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ video: b64 })
                });

                if (!resp.ok) {
                    throw new Error(`Error del servidor: ${resp.status} ${resp.statusText}`);
                }

                const data = await resp.json();
                if (!data.ok) throw new Error(data.error || 'Error desconocido en la conversión');

                // Create blob URL from returned MP4
                const mp4Bytes = Uint8Array.from(atob(data.mp4_base64), c => c.charCodeAt(0));
                const blob = new Blob([mp4Bytes], { type: 'video/mp4' });
                setVideoSrc(URL.createObjectURL(blob));
                setMeasurementResult(null);
            } catch (err: any) {
                console.error('Video conversion error:', err);
                setMeasurementResult(`Error convirtiendo vídeo: ${err.message}`);
                setSourceType('image');
            } finally {
                setIsProcessing(false);
            }
        }
    };

    // Callback ref for the video element — fires when React attaches/detaches it from the DOM
    const videoCallbackRef = (node: HTMLVideoElement | null) => {
        videoElementRef.current = node;
        if (!node || !videoSrc) return;

        const onCanPlay = () => {
            setVideoDuration(node.duration);
            setVideoCurrentTime(0);
            node.play().then(() => {
                setIsVideoPlaying(true);
                startVideoRenderLoop();
            }).catch((err: any) => {
                console.error('Autoplay blocked, click play:', err);
            });
            node.removeEventListener('canplay', onCanPlay);
        };

        if (node.readyState >= 3) {
            // Already ready
            onCanPlay();
        } else {
            node.addEventListener('canplay', onCanPlay);
        }
    };

    // Cleanup video loop when switching away from video
    useEffect(() => {
        return () => {
            if (videoAnimFrameRef.current) cancelAnimationFrame(videoAnimFrameRef.current);
        };
    }, [sourceType]);

    // ═══ VIDEO RENDER LOOP WITH REAL-TIME ROBOFLOW INFERENCE ═══
    const startVideoRenderLoop = () => {
        // Send FIRST frame immediately
        const video0 = videoElementRef.current;
        if (video0 && !isInferringRef.current) {
            isInferringRef.current = true;
            lastInferenceTimeRef.current = performance.now();
            setVideoInferenceStatus('inferring');
            sendFrameToRoboflow(video0).then(preds => {
                videoDetectionsRef.current = preds;
                isInferringRef.current = false;
                setVideoInferenceStatus('done');
            }).catch(() => {
                isInferringRef.current = false;
                setVideoInferenceStatus('idle');
            });
        }

        const renderFrame = () => {
            const video = videoElementRef.current;
            const canvas = canvasRef.current;
            if (!video || !canvas || video.paused || video.ended) {
                if (video?.ended) setIsVideoPlaying(false);
                return;
            }
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Update time state
            setVideoCurrentTime(video.currentTime);

            // Draw video frame scaled to canvas
            const vw = video.videoWidth;
            const vh = video.videoHeight;
            const scale = Math.min(canvas.width / vw, canvas.height / vh);
            const offX = (canvas.width - vw * scale) / 2;
            const offY = (canvas.height - vh * scale) / 2;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, offX, offY, vw * scale, vh * scale);

            // Draw current detections overlay
            const dets = videoDetectionsRef.current;
            if (dets && dets.length > 0) {
                drawDetectionsOnCanvas(ctx, dets, vw, vh, scale, offX, offY, confidenceRef.current);
                // Draw track overlay
                const ts = localStorage.getItem('trackSpec');
                if (ts) drawTrackOverlay(ctx, dets, vw, vh, scale, offX, offY, confidenceRef.current, JSON.parse(ts));
            }

            // Send next frame IMMEDIATELY when previous inference is done (no interval!)
            if (!isInferringRef.current) {
                isInferringRef.current = true;
                lastInferenceTimeRef.current = performance.now();
                setVideoInferenceStatus('inferring');
                sendFrameToRoboflow(video).then(preds => {
                    videoDetectionsRef.current = preds;
                    isInferringRef.current = false;
                    setVideoInferenceStatus('done');
                }).catch(() => {
                    isInferringRef.current = false;
                    setVideoInferenceStatus('idle');
                });
            }

            videoAnimFrameRef.current = requestAnimationFrame(renderFrame);
        };

        videoAnimFrameRef.current = requestAnimationFrame(renderFrame);
    };

    // Send a single frame to Roboflow — downscaled for speed
    const sendFrameToRoboflow = async (video: HTMLVideoElement): Promise<any[]> => {
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        // Downscale to max 640px wide for faster upload
        const MAX_W = 640;
        const downscale = vw > MAX_W ? MAX_W / vw : 1;
        const tw = Math.round(vw * downscale);
        const th = Math.round(vh * downscale);

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = tw;
        tempCanvas.height = th;
        const tCtx = tempCanvas.getContext('2d');
        if (!tCtx) return [];
        tCtx.drawImage(video, 0, 0, tw, th);
        const frameSrc = tempCanvas.toDataURL('image/jpeg', 0.5);

        try {
            const response = await fetch('http://localhost:8765/api/measure/roboflow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: frameSrc })
            });
            const data = await response.json();
            if (!data.ok) return [];
            const preds = Array.isArray(data.predictions) ? data.predictions : [];

            // Scale predictions back to original video resolution
            if (downscale < 1 && preds.length > 0) {
                const upscale = 1 / downscale;
                return preds.map((det: any) => {
                    const scaled: any = { ...det };
                    // Only scale if coords are in pixel space (not normalized 0-1)
                    const isNorm = (det.x > 0 && det.x <= 1.1) && (det.width > 0 && det.width <= 1.1);
                    if (!isNorm) {
                        if (det.x !== undefined) scaled.x = det.x * upscale;
                        if (det.y !== undefined) scaled.y = det.y * upscale;
                        if (det.width !== undefined) scaled.width = det.width * upscale;
                        if (det.height !== undefined) scaled.height = det.height * upscale;
                    }
                    // Scale segmentation points too
                    if (det.points && Array.isArray(det.points)) {
                        scaled.points = det.points.map((pt: any) => {
                            const pNorm = (pt.x > 0 && pt.x <= 1.1) && (pt.y > 0 && pt.y <= 1.1);
                            if (pNorm) return pt;
                            return { ...pt, x: pt.x * upscale, y: pt.y * upscale };
                        });
                    }
                    return scaled;
                });
            }
            return preds;
        } catch {
            return [];
        }
    };

    // Helper: draw detections on any canvas context
    const drawDetectionsOnCanvas = (
        ctx: CanvasRenderingContext2D, dets: any[],
        imgW: number, imgH: number, scale: number, offX: number, offY: number,
        threshold: number
    ) => {
        const getClassColor = (className: string) => {
            const colors = ['#BD00FF', '#00FFFF', '#FF00FF', '#70FF00', '#FFBD00', '#FF0000', '#0070FF', '#FF00BD', '#00FF70', '#BDFF00'];
            let hash = 0;
            if (className) { for (let i = 0; i < className.length; i++) hash = className.charCodeAt(i) + ((hash << 5) - hash); }
            return colors[Math.abs(hash) % colors.length];
        };
        const hexToRgba = (hex: string, alpha: number) => {
            const r = parseInt(hex.slice(1, 3), 16) || 0, g = parseInt(hex.slice(3, 5), 16) || 0, b = parseInt(hex.slice(5, 7), 16) || 0;
            return `rgba(${r},${g},${b},${alpha})`;
        };

        dets.forEach(det => {
            const conf = det.confidence ?? 1.0;
            if (conf < threshold) return;

            const baseColor = det.class ? getClassColor(det.class) : '#BD00FF';
            let dx = det.x, dy = det.y, dw = det.width, dh = det.height;
            const isNorm = (dx > 0 && dx <= 1.1) && (dw > 0 && dw <= 1.1);
            if (isNorm) { dx *= imgW; dy *= imgH; dw *= imgW; dh *= imgH; }

            // Segmentation polygon
            if (det.points && Array.isArray(det.points) && det.points.length > 0) {
                ctx.beginPath();
                det.points.forEach((pt: any, idx: number) => {
                    let ptx = pt.x, pty = pt.y;
                    if (isNorm) { ptx *= imgW; pty *= imgH; }
                    const fx = offX + ptx * scale, fy = offY + pty * scale;
                    idx === 0 ? ctx.moveTo(fx, fy) : ctx.lineTo(fx, fy);
                });
                ctx.closePath();
                ctx.fillStyle = hexToRgba(baseColor, 0.35);
                ctx.fill();
                ctx.strokeStyle = baseColor;
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Bounding box + label
            if (dx !== undefined && dw !== undefined) {
                const bx = offX + (dx - dw / 2) * scale;
                const by = offY + (dy - dh / 2) * scale;
                const bw = dw * scale;
                const bh = dh * scale;
                ctx.strokeStyle = baseColor;
                ctx.lineWidth = 3;
                ctx.strokeRect(bx, by, bw, bh);

                const label = `${det.class || 'Obj'} ${(conf * 100).toFixed(0)}%`;
                const fontSize = Math.max(13, Math.floor(18 * scale));
                ctx.font = `bold ${fontSize}px Inter, sans-serif`;
                const tw = ctx.measureText(label).width;
                ctx.fillStyle = baseColor;
                ctx.fillRect(bx - 1, by - fontSize - 8, tw + 12, fontSize + 8);
                ctx.fillStyle = '#fff';
                ctx.fillText(label, bx + 5, by - 5);
            }
        });
    };

    // Draw track overlay: find matching classes and show distance
    const drawTrackOverlay = (
        ctx: CanvasRenderingContext2D, dets: any[],
        imgW: number, imgH: number, scale: number, offX: number, offY: number,
        threshold: number, spec: any
    ) => {
        if (!spec || !spec.classA || !spec.classB) return;
        // Find best matching detections
        const findBest = (className: string) => {
            let best: any = null;
            for (const det of dets) {
                if ((det.confidence ?? 1) < threshold) continue;
                if (det.class === className && (!best || det.confidence > best.confidence)) best = det;
            }
            return best;
        };
        const detA = findBest(spec.classA);
        const detB = findBest(spec.classB);
        if (!detA || !detB) return;

        const getCenter = (det: any) => {
            let dx = det.x, dy = det.y, dw = det.width, dh = det.height;
            const isNorm = (dx > 0 && dx <= 1.1) && (dw > 0 && dw <= 1.1);
            if (isNorm) { dx *= imgW; dy *= imgH; dw *= imgW; dh *= imgH; }
            return { x: offX + dx * scale, y: offY + dy * scale, bx: offX + (dx - dw / 2) * scale, by: offY + (dy - dh / 2) * scale, bw: dw * scale, bh: dh * scale };
        };
        const a = getCenter(detA), b = getCenter(detB);

        // Highlight boxes
        ctx.strokeStyle = '#00FFFF'; ctx.lineWidth = 3; ctx.setLineDash([8, 4]);
        ctx.strokeRect(a.bx, a.by, a.bw, a.bh); ctx.setLineDash([]);
        ctx.strokeStyle = '#FF00FF'; ctx.setLineDash([8, 4]);
        ctx.strokeRect(b.bx, b.by, b.bw, b.bh); ctx.setLineDash([]);

        // Connecting line
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = '#FFFF00'; ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]); ctx.stroke(); ctx.setLineDash([]);

        // Distance
        const distPx = Math.hypot(
            (detB.x - detA.x) * (((detA.x > 0 && detA.x <= 1.1) ? imgW : 1)),
            (detB.y - detA.y) * (((detA.y > 0 && detA.y <= 1.1) ? imgH : 1))
        );
        const distMm = spec.mmPerPx > 0 ? distPx * spec.mmPerPx : 0;
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const fs = Math.max(14, 18 * scale);
        const text = distMm > 0 ? `${distPx.toFixed(1)} px = ${distMm.toFixed(2)} mm` : `${distPx.toFixed(1)} px`;
        ctx.font = `bold ${fs}px Inter, sans-serif`;
        const tw = ctx.measureText(text).width;
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(mx - tw / 2 - 8, my - fs / 2 - 4, tw + 16, fs + 8);
        ctx.fillStyle = '#FFFF00'; ctx.textAlign = 'center';
        ctx.fillText(text, mx, my + fs * 0.35);
    };

    const toggleVideoPlayPause = () => {
        const video = videoElementRef.current;
        if (!video) return;
        if (video.paused) {
            video.play().then(() => {
                setIsVideoPlaying(true);
                startVideoRenderLoop();
            });
        } else {
            video.pause();
            setIsVideoPlaying(false);
            if (videoAnimFrameRef.current) cancelAnimationFrame(videoAnimFrameRef.current);
        }
    };

    const seekVideo = (time: number) => {
        const video = videoElementRef.current;
        if (!video) return;
        video.currentTime = time;
        setVideoCurrentTime(time);
    };

    const loadImage = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const src = event.target?.result as string;
            setImageSrc(src);
            const img = new Image();
            img.onload = () => {
                imageElementRef.current = img;
                roboflowImageRef.current = null;
                const canvas = canvasRef.current;
                if (canvas) {
                    canvas.width = 1200;
                    canvas.height = 900;
                }
                clearCanvasState(false);
                redrawCanvas();
                loadDetections(src);
            };
            img.src = src;
        };
        reader.readAsDataURL(file);
    };

    const loadDetections = async (src: string) => {
        setIsProcessing(true);
        try {
            const response = await fetch("http://localhost:8765/api/measure/roboflow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: src })
            });
            const data = await response.json();
            if (!data.ok) throw new Error(data.error);
            const preds: any[] = Array.isArray(data.predictions) ? data.predictions : [];
            setDetections(preds);
            if (data.output_image && typeof data.output_image === 'string') {
                const imgSrc = data.output_image.startsWith('data:')
                    ? data.output_image
                    : `data:image/jpeg;base64,${data.output_image}`;
                const roboImg = new Image();
                roboImg.onload = () => {
                    roboflowImageRef.current = roboImg;
                    redrawCanvas();
                };
                roboImg.onerror = () => console.error("[Roboflow] Error cargando output_image");
                roboImg.src = imgSrc;
            }
        } catch (error) {
            console.error("Error Roboflow:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };






    const clearCanvasState = (clearImageDetections: boolean = true) => {
        setSegments([]);
        setPoints([]);
        setCurrentSegmentStart(null);
        setMeasurementResult(null);
        if (clearImageDetections) {
            setDetections([]);
        }
    };

    const redrawCanvas = (liveEndPoint?: Point) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Paleta de colores Roboflow vibrante
        const getClassColor = (className: string) => {
            const colors = [
                '#BD00FF', '#00FFFF', '#FF00FF', '#70FF00', '#FFBD00',
                '#FF0000', '#0070FF', '#FF00BD', '#00FF70', '#BDFF00'
            ];
            let hash = 0;
            if (className) {
                for (let i = 0; i < className.length; i++) {
                    hash = className.charCodeAt(i) + ((hash << 5) - hash);
                }
            }
            return colors[Math.abs(hash) % colors.length];
        };

        const hexToRgba = (hex: string, alpha: number) => {
            if (hex.startsWith('hsl')) return hex.replace('hsl', 'hsla').replace(')', `, ${alpha})`);
            const r = parseInt(hex.slice(1, 3), 16) || 0;
            const g = parseInt(hex.slice(3, 5), 16) || 0;
            const b = parseInt(hex.slice(5, 7), 16) || 0;
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        // Determinar qué imagen base dibujar:
        // Si Roboflow ya envió su imagen renderizada, la usamos; si no, la original.
        const baseImg = roboflowImageRef.current || imageElementRef.current;
        // Para mapeo de coordenadas de predicciones siempre usamos la imagen original
        const origImg = imageElementRef.current;

        if (baseImg) {
            const scale = Math.min(canvas.width / baseImg.width, canvas.height / baseImg.height);
            const offsetX = (canvas.width / 2) - (baseImg.width / 2) * scale;
            const offsetY = (canvas.height / 2) - (baseImg.height / 2) * scale;

            ctx.drawImage(baseImg, offsetX, offsetY, baseImg.width * scale, baseImg.height * scale);

            // Sobre la imagen base, dibujamos las predicciones interactivas (para el slider)
            // Solo si hay predicciones y podemos mapear sus coordenadas
            if (detections && detections.length > 0 && origImg) {
                detections.forEach(det => {
                    const conf = det.confidence !== undefined ? det.confidence : 1.0;
                    if (conf < confidenceThreshold) return;

                    const baseColor = det.class ? getClassColor(det.class) : '#BD00FF';

                    // Coordenadas en píxeles de la imagen original
                    let dx = det.x;
                    let dy = det.y;
                    let dw = det.width;
                    let dh = det.height;

                    // Si los valores son normalizados (0-1), convertir a píxeles
                    const isNorm = (dx > 0 && dx <= 1.1) && (dw > 0 && dw <= 1.1);
                    if (isNorm && origImg) {
                        dx *= origImg.width;
                        dy *= origImg.height;
                        dw *= origImg.width;
                        dh *= origImg.height;
                    }

                    // Escala para mapear de coords imagen original a canvas
                    const coordScale = Math.min(canvas.width / origImg.width, canvas.height / origImg.height);
                    const coordOffsetX = (canvas.width / 2) - (origImg.width / 2) * coordScale;
                    const coordOffsetY = (canvas.height / 2) - (origImg.height / 2) * coordScale;

                    // 1. DIBUJAR SEGMENTACIÓN
                    if (det.points && Array.isArray(det.points) && det.points.length > 0) {
                        ctx.beginPath();
                        det.points.forEach((pt: any, idx: number) => {
                            let ptx = pt.x;
                            let pty = pt.y;
                            if (isNorm && origImg) {
                                ptx *= origImg.width;
                                pty *= origImg.height;
                            }
                            const finalX = coordOffsetX + ptx * coordScale;
                            const finalY = coordOffsetY + pty * coordScale;
                            if (idx === 0) ctx.moveTo(finalX, finalY);
                            else ctx.lineTo(finalX, finalY);
                        });
                        ctx.closePath();

                        ctx.fillStyle = hexToRgba(baseColor, 0.4);
                        ctx.fill();

                        ctx.strokeStyle = baseColor;
                        ctx.lineWidth = Math.max(2, 2 * coordScale);
                        ctx.stroke();
                    }

                    // 2. DIBUJAR BBOX Y LABEL
                    if (dx !== undefined && dy !== undefined && dw !== undefined && dh !== undefined) {
                        const boxX = coordOffsetX + (dx - dw / 2) * coordScale;
                        const boxY = coordOffsetY + (dy - dh / 2) * coordScale;
                        const boxW = dw * coordScale;
                        const boxH = dh * coordScale;

                        ctx.strokeStyle = baseColor;
                        ctx.lineWidth = Math.max(3, 3 * coordScale);
                        ctx.strokeRect(boxX, boxY, boxW, boxH);

                        const label = `${det.class || 'Obj'} ${(conf * 100).toFixed(0)}%`;
                        const fontSize = Math.max(14, Math.floor(20 * coordScale));
                        ctx.font = `bold ${fontSize}px Inter, sans-serif`;

                        const textW = ctx.measureText(label).width;
                        ctx.fillStyle = baseColor;
                        ctx.fillRect(boxX - 1.5, boxY - fontSize - 10, textW + 15, fontSize + 10);

                        ctx.fillStyle = '#fff';
                        ctx.fillText(label, boxX + 6, boxY - 7);
                    }
                });

                // Draw track overlay on image
                if (trackSpec && origImg) {
                    const tScale = Math.min(canvas.width / origImg.width, canvas.height / origImg.height);
                    const tOffX = (canvas.width / 2) - (origImg.width / 2) * tScale;
                    const tOffY = (canvas.height / 2) - (origImg.height / 2) * tScale;
                    drawTrackOverlay(ctx, detections, origImg.width, origImg.height, tScale, tOffX, tOffY, confidenceThreshold, trackSpec);
                }
            }
        } else {
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#444';
            ctx.font = '20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Arrastra una imagen o usa el botón subir', canvas.width / 2, canvas.height / 2);
        }

        if (mode === 'segmentos') {
            segments.forEach((seg, idx) => {
                ctx.beginPath();
                ctx.moveTo(seg.start.x, seg.start.y);
                ctx.lineTo(seg.end.x, seg.end.y);
                ctx.strokeStyle = idx === 0 ? '#ff3b30' : '#34c759';
                ctx.lineWidth = 3;
                ctx.stroke();
            });

            if (currentSegmentStart && liveEndPoint) {
                ctx.beginPath();
                ctx.moveTo(currentSegmentStart.x, currentSegmentStart.y);
                ctx.lineTo(liveEndPoint.x, liveEndPoint.y);
                ctx.strokeStyle = segments.length === 0 ? '#ff3b30' : '#34c759';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        } else {
            points.forEach((pt, idx) => {
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 6, 0, 2 * Math.PI);
                ctx.fillStyle = idx === 0 ? '#ff3b30' : '#34c759';
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
            });
        }
    };

    const getCanvasPoint = (e: MouseEvent<HTMLCanvasElement>): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
        if (!imageSrc) return;
        const pt = getCanvasPoint(e);

        if (mode === 'segmentos') {
            if (segments.length < 2) {
                setCurrentSegmentStart(pt);
            }
        } else {
            if (points.length < 2) {
                setPoints([...points, pt]);
            }
        }
    };

    const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
        if (mode === 'segmentos' && currentSegmentStart) {
            redrawCanvas(getCanvasPoint(e));
        }
    };

    const handleMouseUp = (e: MouseEvent<HTMLCanvasElement>) => {
        if (mode === 'segmentos' && currentSegmentStart) {
            const pt = getCanvasPoint(e);
            // Avoid tiny segments
            const dist = Math.hypot(pt.x - currentSegmentStart.x, pt.y - currentSegmentStart.y);
            if (dist > 5) {
                setSegments([...segments, { start: currentSegmentStart, end: pt }]);
            }
            setCurrentSegmentStart(null);
        }
    };

    // --- Lógica y Flujo de Datos ---



    const applyCannyAndFindEdges = async (image: string): Promise<any> => {
        console.log("Aplicando algoritmo Canny...");
        try {
            const response = await fetch("http://localhost:8765/api/measure/canny", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image })
            });
            const data = await response.json();
            if (!data.ok) throw new Error(data.error);
            return data.edges_image;
        } catch (error) {
            console.error("Canny Error:", error);
            throw error;
        }
    };

    const calculateSegmentDimension = (_cannyEdgesImageBase64: any, segA: Segment, segB: Segment): number => {
        // En una implementación final real, la distancia se calcularía enviando 
        // los puntos a python y resolviendo con álgebra lineal las líneas.
        console.log("Calculando cota entre segmentos...", segA, segB);
        const midXA = (segA.start.x + segA.end.x) / 2;
        const midYA = (segA.start.y + segA.end.y) / 2;
        const midXB = (segB.start.x + segB.end.x) / 2;
        const midYB = (segB.start.y + segB.end.y) / 2;
        return Math.hypot(midXA - midXB, midYA - midYB); // Distancia EUCLIDIANA simulada
    };

    const calculatePointDimension = (_cannyEdgesImageBase64: any, point1: Point, point2: Point): number => {
        // En el futuro, se buscará el píxel blanco (borde) más cercano usando cannyEdgesImageBase64
        console.log("Calculando cota de punto a punto...", point1, point2);
        return Math.hypot(point1.x - point2.x, point1.y - point2.y);
    };

    const processAndMeasure = async () => {
        if (!imageSrc) return;

        if (mode === 'segmentos' && segments.length < 2) {
            alert("Por favor, dibuja 2 segmentos en el canvas.");
            return;
        }
        if (mode === 'puntos' && points.length < 2) {
            alert("Por favor, marca 2 puntos en el canvas.");
            return;
        }

        setIsProcessing(true);
        setMeasurementResult(null);

        try {
            // Si no estuviéramos guardando las predicciones automáticas, aquí llamaríamos de nuevo a Roboflow.
            // Puesto que se ha inferido al cargar, saltamos directo al procesamiento de bordes:
            const cannyEdges = await applyCannyAndFindEdges(imageSrc);

            // 3. Cálculo de Cotas
            let resultVal = 0;
            if (mode === 'segmentos') {
                resultVal = calculateSegmentDimension(cannyEdges, segments[0], segments[1]);
            } else {
                resultVal = calculatePointDimension(cannyEdges, points[0], points[1]);
            }

            setMeasurementResult(
                mmPerPx > 0
                    ? `Cota: ${(resultVal * mmPerPx).toFixed(2)} mm  (${resultVal.toFixed(1)} px)`
                    : `Cota: ${resultVal.toFixed(2)} píxeles (sin calibración)`
            );
        } catch (error) {
            console.error(error);
            setMeasurementResult("Error procesando imagen");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={styles.container}>
            <div
                style={styles.canvasArea}
            >
                {/* Hidden video element in DOM for browser autoplay support */}
                {sourceType === 'video' && videoSrc && (
                    <video
                        ref={videoCallbackRef}
                        src={videoSrc}
                        muted
                        playsInline
                        preload="auto"
                        style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
                    />
                )}

                {/* Video controls overlay when in video mode */}
                {sourceType === 'video' && videoSrc && (
                    <div style={{
                        position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
                        display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10,
                        backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '10px', padding: '8px 18px',
                        backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)'
                    }}>
                        <button onClick={toggleVideoPlayPause} style={{
                            background: 'none', border: 'none', color: '#fff', fontSize: '22px', cursor: 'pointer', padding: '2px 6px'
                        }}>{isVideoPlaying ? '⏸️' : '▶️'}</button>
                        <span style={{ color: '#aaa', fontSize: '12px', fontFamily: 'monospace', minWidth: '40px' }}>{formatTime(videoCurrentTime)}</span>
                        <input
                            type="range" min={0} max={videoDuration} step={0.1}
                            value={videoCurrentTime}
                            onChange={(e) => seekVideo(parseFloat(e.target.value))}
                            style={{ flex: 1, width: '200px', accentColor: '#ff9500', cursor: 'pointer' }}
                        />
                        <span style={{ color: '#aaa', fontSize: '12px', fontFamily: 'monospace', minWidth: '40px' }}>{formatTime(videoDuration)}</span>
                        <div style={{
                            width: '10px', height: '10px', borderRadius: '50%',
                            backgroundColor: videoInferenceStatus === 'inferring' ? '#ff9500' : videoInferenceStatus === 'done' ? '#34c759' : '#555',
                            animation: videoInferenceStatus === 'inferring' ? 'pulse 1s infinite' : 'none',
                            boxShadow: videoInferenceStatus === 'inferring' ? '0 0 8px #ff9500' : 'none'
                        }} title={videoInferenceStatus === 'inferring' ? 'Analizando...' : 'Listo'} />
                    </div>
                )}


                {/* Canvas (visible when image source is active or no source) */}
                <canvas
                    ref={canvasRef}
                    width={1200}
                    height={900}
                    style={styles.canvas}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
                {isProcessing && (
                    <div style={styles.spinnerOverlay}>
                        <div className="spinner" style={styles.spinner}></div>
                        <p style={{ marginTop: 10, color: 'white' }}>Procesando imagen y calculando cotas...</p>
                    </div>
                )}
            </div>

            <div style={styles.controlPanel}>
                <h2>Medición de Piezas</h2>

                <div style={styles.uploadSection}>
                    <label style={styles.uploadButton}>
                        📷 Subir Imagen
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                    <label style={{ ...styles.uploadButton, backgroundColor: '#ff9500', color: '#000', marginTop: '8px' }}>
                        🎥 Subir Vídeo
                        <input type="file" accept="video/*" onChange={handleVideoUpload} style={{ display: 'none' }} />
                    </label>
                </div>

                {/* ── Status de calibración (solo lectura) ── */}
                {mmPerPx > 0 && (
                    <div style={{ ...styles.modeSelector, borderTop: '1px solid #444', paddingTop: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 style={{ margin: 0, fontSize: '14px' }}>📐 Calibración</h3>
                            <span style={{ fontSize: '11px', background: 'rgba(0,255,100,0.15)', color: '#00ff64', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>ACTIVA</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#8b949e', background: '#1c1c1e', padding: '6px 8px', borderRadius: 6, border: '1px solid #333' }}>
                            Escala: <strong style={{ color: '#00ff64' }}>{mmPerPx.toFixed(4)} mm/px</strong>
                        </div>
                    </div>
                )}

                <div style={styles.modeSelector}>
                    <h3>Filtro Roboflow</h3>
                    <div style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span style={{ fontSize: '13px', color: '#aaa' }}>Confidence Threshold</span>
                            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#BD00FF' }}>{(confidenceThreshold * 100).toFixed(0)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={confidenceThreshold}
                            onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                            style={styles.slider}
                        />
                    </div>
                </div>

                {measurementResult && (
                    <div style={styles.resultCard}>
                        <h3>Resultado</h3>
                        <p style={styles.resultText}>{measurementResult}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Algunos estilos básicos inline para el componente
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        flexDirection: 'row',
        height: '100%',
        minHeight: '600px',
        width: '100%',
        padding: '12px',
        gap: '12px',
        backgroundColor: 'transparent',
        color: '#fff',
        boxSizing: 'border-box'
    },
    canvasArea: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#1e1e1e',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        border: '2px solid #333'
    },
    canvas: {
        cursor: 'crosshair',
        maxWidth: '100%',
        maxHeight: '100%',
        display: 'block'
    },
    spinnerOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10
    },
    spinner: {
        border: '4px solid rgba(255,255,255,0.3)',
        borderRadius: '50%',
        borderTop: '4px solid #fff',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite'
    },
    controlPanel: {
        width: '280px',
        minWidth: '280px',
        backgroundColor: '#252526',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        overflowY: 'auto'
    },
    uploadSection: {
        borderBottom: '1px solid #444',
        paddingBottom: '16px'
    },
    uploadButton: {
        display: 'block',
        textAlign: 'center',
        backgroundColor: '#007aff',
        color: '#fff',
        padding: '10px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    modeSelector: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    radioLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        fontSize: '15px'
    },
    actionButtons: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    button: {
        padding: '12px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '16px',
        transition: 'opacity 0.2s'
    },
    resultCard: {
        marginTop: 'auto',
        backgroundColor: '#1c1c1e',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #34c759',
        textAlign: 'center'
    },
    resultText: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#34c759',
        margin: 0,
        marginTop: '8px'
    },
    slider: {
        width: '100%',
        accentColor: '#BD00FF',
        cursor: 'pointer',
        height: '6px',
        borderRadius: '3px',
        outline: 'none'
    }
};

export default ImageMeasurement;
