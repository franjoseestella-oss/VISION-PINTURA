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
    const [mode, _setMode] = useState<MeasurementMode>('segmentos');
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
    const [confidenceThreshold, _setConfidenceThreshold] = useState(0.0);

    // ── SAM 3 Person Detection ──
    const [_sam3Confidence, _setSam3Confidence] = useState(0.85);
    const [sam3Loading, setSam3Loading] = useState(false);
    const [sam3Result, setSam3Result] = useState<string | null>(null);
    const [sam3Active, setSam3Active] = useState(false);
    const [sam3Detections, setSam3Detections] = useState<any[]>([]);
    const sam3DetectionsRef = useRef<any[]>([]);

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

    // Track specifications (from calibration screen) — supports multiple measurements
    const [trackSpecs, setTrackSpecs] = useState<any[]>(() => {
        const saved = localStorage.getItem('trackSpecs');
        if (saved) return JSON.parse(saved);
        // Backward compat: migrate old single trackSpec
        const old = localStorage.getItem('trackSpec');
        if (old) {
            const arr = [JSON.parse(old)];
            localStorage.setItem('trackSpecs', JSON.stringify(arr));
            localStorage.removeItem('trackSpec');
            return arr;
        }
        return [];
    });
    useEffect(() => {
        const onStorage = () => {
            const saved = localStorage.getItem('trackSpecs');
            if (saved) { setTrackSpecs(JSON.parse(saved)); return; }
            // Backward compat
            const old = localStorage.getItem('trackSpec');
            setTrackSpecs(old ? [JSON.parse(old)] : []);
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
    // SAM3 continuous tracking refs
    const sam3ActiveRef = useRef<boolean>(false);
    const sam3InferringRef = useRef<boolean>(false);
    const sam3ConfidenceRef = useRef<number>(0.85);

    // ── Draggable dimension labels (same as calibration) ──
    const testDimOffsets = useRef<{ x: { dx: number; dy: number }; y: { dx: number; dy: number }; total: { dx: number; dy: number } }>({ x: { dx: 0, dy: 0 }, y: { dx: 0, dy: 0 }, total: { dx: 0, dy: 0 } });
    const testDimDrag = useRef<{ which: 'x' | 'y' | 'total'; startMouse: { x: number; y: number }; startOffset: { dx: number; dy: number } } | null>(null);
    const testDimRects = useRef<{ x: { x: number; y: number; w: number; h: number }; y: { x: number; y: number; w: number; h: number }; total: { x: number; y: number; w: number; h: number } } | null>(null);
    const [testMoveDimLabels, setTestMoveDimLabels] = useState(false);
    // Tolerance result for the panel
    const [toleranceResults, setToleranceResults] = useState<Array<{ label: string; xMm: number; refMm: number; tolPlus: number; tolMinus: number; ok: boolean; hasRef: boolean }>>([]);

    // Global detection label visibility (synced with ConfigScreen/Calibration)
    const [showDetLabels, setShowDetLabels] = useState<boolean>(() => {
        const saved = localStorage.getItem('showDetectionLabels');
        return saved !== null ? saved === 'true' : true;
    });
    const showDetLabelsRef = useRef(showDetLabels);
    useEffect(() => { showDetLabelsRef.current = showDetLabels; }, [showDetLabels]);

    // Track per-class visibility changes from ConfigScreen
    const [_tolVersion, setTolVersion] = useState(0);
    const _lastTolJson = useRef(localStorage.getItem('trackTolerances') || '');

    useEffect(() => {
        const onStorage = () => {
            const saved = localStorage.getItem('showDetectionLabels');
            if (saved !== null) setShowDetLabels(saved === 'true');
            // Also check trackTolerances for per-class visibility changes
            const tolNow = localStorage.getItem('trackTolerances') || '';
            if (tolNow !== _lastTolJson.current) {
                _lastTolJson.current = tolNow;
                setTolVersion(v => v + 1);
            }
        };
        window.addEventListener('storage', onStorage);
        const interval = setInterval(onStorage, 1500);
        return () => { window.removeEventListener('storage', onStorage); clearInterval(interval); };
    }, []);

    // Keep confidenceRef in sync
    useEffect(() => { confidenceRef.current = confidenceThreshold; }, [confidenceThreshold]);
    // Keep sam3DetectionsRef in sync with state so video render loop can access it
    useEffect(() => { sam3DetectionsRef.current = sam3Detections; }, [sam3Detections]);
    // Keep sam3ActiveRef in sync
    useEffect(() => { sam3ActiveRef.current = sam3Active; }, [sam3Active]);

    useEffect(() => {
        if (sourceType === 'image') redrawCanvas();
    }, [segments, points, mode, imageSrc, detections, confidenceThreshold, showDetLabels, _tolVersion]);

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

        setIsProcessing(true);
        setMeasurementResult(`Analizando vídeo con Roboflow WebRTC...`);
        try {
            const blobUrl = URL.createObjectURL(file);
            setVideoSrc(blobUrl);
            setMeasurementResult(`Vídeo cargado localmente. Preparado para reproducir.`);
        } catch (err: any) {
            console.error('Video load error:', err);
            setMeasurementResult(`Error analizando vídeo: ${err.message}`);
            setSourceType('image');
        } finally {
            setIsProcessing(false);
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

    // ═══ VIDEO RENDER LOOP (PLAYBACK DE VIDEO YA ANALIZADO MASIVAMENTE) ═══
    const startVideoRenderLoop = () => {
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

            // Fetch generic Roboflow predictions ~3 FPS
            const now = Date.now();
            if (now - lastInferenceTimeRef.current > 300 && !isInferringRef.current) {
                isInferringRef.current = true;
                lastInferenceTimeRef.current = now;

                sendFrameToRoboflow(video).then(preds => {
                    videoDetectionsRef.current = preds;
                    setDetections(preds);
                }).catch(err => {
                    console.error("Frame analysis error:", err);
                }).finally(() => {
                    isInferringRef.current = false;
                });
            }

            // Draw Roboflow detections
            const currentDets = videoDetectionsRef.current;
            if (currentDets && currentDets.length > 0) {
                drawDetectionsOnCanvas(ctx, currentDets, vw, vh, scale, offX, offY, 0);
            }

            // SAM3 person detections overlay (continuous tracking)
            const sam3Dets = sam3DetectionsRef.current;
            if (sam3Dets && sam3Dets.length > 0) {
                drawDetectionsOnCanvas(ctx, sam3Dets, vw, vh, scale, offX, offY, 0);
            }

            // SAM3 continuous person tracking — runs in parallel
            if (sam3ActiveRef.current && !sam3InferringRef.current) {
                sam3InferringRef.current = true;
                sendFrameToSam3(video).then(personDets => {
                    sam3DetectionsRef.current = personDets;
                    sam3InferringRef.current = false;
                }).catch(() => {
                    sam3InferringRef.current = false;
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

            preds.forEach((p: any) => {
                if (p.points && Array.isArray(p.points) && p.points.length > 0) {
                    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                    p.points.forEach((pt: any) => {
                        if (pt.x < minX) minX = pt.x;
                        if (pt.x > maxX) maxX = pt.x;
                        if (pt.y < minY) minY = pt.y;
                        if (pt.y > maxY) maxY = pt.y;
                    });
                    if (minX <= maxX && minY <= maxY) {
                        p.x = minX + (maxX - minX) / 2;
                        p.y = minY + (maxY - minY) / 2;
                        p.width = maxX - minX;
                        p.height = maxY - minY;
                    }
                }
            });

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

    // Send a single frame to SAM3 for person detection — runs in parallel with Roboflow
    const sendFrameToSam3 = async (video: HTMLVideoElement): Promise<any[]> => {
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        // Downscale aggressively for fastest possible upload
        const MAX_W = 320;
        const downscale = vw > MAX_W ? MAX_W / vw : 1;
        const tw = Math.round(vw * downscale);
        const th = Math.round(vh * downscale);

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = tw;
        tempCanvas.height = th;
        const tCtx = tempCanvas.getContext('2d');
        if (!tCtx) return [];
        tCtx.drawImage(video, 0, 0, tw, th);
        const frameSrc = tempCanvas.toDataURL('image/jpeg', 0.3);

        try {
            const response = await fetch('http://localhost:8765/api/sam3/detect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: frameSrc,
                    concepts: ['person', 'forklift'],
                    confidence: sam3ConfidenceRef.current,
                    remove: false,
                }),
            });
            const data = await response.json();
            if (!data.ok) return sam3DetectionsRef.current; // keep previous detections
            const rawDets: any[] = data.detections || [];
            // Tag with class PERSONA and _sam3 marker
            const personDets = rawDets.map((d: any) => ({
                ...d,
                class: 'PERSONA',
                _sam3: true,
            }));
            // Scale predictions back to original video resolution if downscaled
            if (downscale < 1 && personDets.length > 0) {
                const upscale = 1 / downscale;
                return personDets.map((det: any) => {
                    const scaled: any = { ...det };
                    const isNorm = (det.x > 0 && det.x <= 1.1) && (det.width > 0 && det.width <= 1.1);
                    if (!isNorm) {
                        if (det.x !== undefined) scaled.x = det.x * upscale;
                        if (det.y !== undefined) scaled.y = det.y * upscale;
                        if (det.width !== undefined) scaled.width = det.width * upscale;
                        if (det.height !== undefined) scaled.height = det.height * upscale;
                    }
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
            return personDets;
        } catch {
            return sam3DetectionsRef.current; // keep previous on error
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

        // Read per-class visibility from tolerance config
        const _tolSaved = localStorage.getItem('trackTolerances');
        const _hiddenClasses = new Set<string>();
        if (_tolSaved) {
            try {
                const _tolArr: any[] = JSON.parse(_tolSaved);
                _tolArr.forEach(t => { if (t.visible === false) _hiddenClasses.add(t.className); });
            } catch (_) { /* ignore */ }
        }

        dets.forEach(det => {
            const conf = det.confidence ?? 1.0;
            if (conf < threshold) return;
            if (det.class && _hiddenClasses.has(det.class)) return;

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
                if (showDetLabelsRef.current) {
                    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
                    const tw = ctx.measureText(label).width;
                    ctx.fillStyle = baseColor;
                    ctx.fillRect(bx - 1, by - fontSize - 8, tw + 12, fontSize + 8);
                    ctx.fillStyle = '#fff';
                    ctx.fillText(label, bx + 5, by - 5);
                }
            }
        });
    };

    // Draw track overlay: find matching classes and show distance + tolerance check
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

        // Get measurement point respecting the same mode/edge as calibration spec
        const getPoint = (det: any, mode: string | undefined, edge: string | undefined) => {
            let dx = det.x, dy = det.y, dw = det.width, dh = det.height;
            const isNorm = (dx > 0 && dx <= 1.1) && (dw > 0 && dw <= 1.1);
            if (isNorm) { dx *= imgW; dy *= imgH; dw *= imgW; dh *= imgH; }
            const bx = dx - dw / 2, by = dy - dh / 2;
            // Calculate measurement point based on mode
            let px = dx, py = dy; // default: center
            if (mode === 'arista' && edge) {
                if (edge === 'left') { px = bx; py = dy; }
                else if (edge === 'right') { px = bx + dw; py = dy; }
                else if (edge === 'top') { px = dx; py = by; }
                else if (edge === 'bottom') { px = dx; py = by + dh; }
            }
            return {
                x: offX + px * scale, y: offY + py * scale,
                bx: offX + bx * scale, by: offY + by * scale, bw: dw * scale, bh: dh * scale,
                rawX: px, rawY: py,
            };
        };
        const a = getPoint(detA, spec.pieceAMode, spec.pieceAEdge);
        const b = getPoint(detB, spec.pieceBMode, spec.pieceBEdge);

        // ── TRACE JSON spec for debugging ──
        console.log('[TEST drawTrackOverlay] JSON spec:', JSON.stringify({
            classA: spec.classA, pieceAMode: spec.pieceAMode, pieceAEdge: spec.pieceAEdge,
            classB: spec.classB, pieceBMode: spec.pieceBMode, pieceBEdge: spec.pieceBEdge,
            mmPerPx: spec.mmPerPx,
            matchedToleranceLabels: spec.matchedToleranceLabels,
            'calibración distanceXMm': spec.distanceXMm,
            'calibración distanceYMm': spec.distanceYMm,
        }, null, 2));
        console.log('[TEST drawTrackOverlay] detA:', { class: detA.class, x: detA.x, y: detA.y, w: detA.width, h: detA.height });
        console.log('[TEST drawTrackOverlay] detB:', { class: detB.class, x: detB.x, y: detB.y, w: detB.width, h: detB.height });
        console.log('[TEST drawTrackOverlay] Punto A (rawX, rawY):', a.rawX.toFixed(1), a.rawY.toFixed(1),
            `[modo=${spec.pieceAMode}, arista=${spec.pieceAEdge || 'centro'}]`);
        console.log('[TEST drawTrackOverlay] Punto B (rawX, rawY):', b.rawX.toFixed(1), b.rawY.toFixed(1),
            `[modo=${spec.pieceBMode}, arista=${spec.pieceBEdge || 'centro'}]`);
        const traceXpx = Math.abs(b.rawX - a.rawX);
        const traceXmm = spec.mmPerPx > 0 ? traceXpx * spec.mmPerPx : 0;
        console.log('[TEST drawTrackOverlay] Distancia X:', traceXpx.toFixed(1), 'px =', traceXmm.toFixed(2), 'mm');

        // Highlight boxes
        ctx.strokeStyle = '#00FFFF'; ctx.lineWidth = 3; ctx.setLineDash([8, 4]);
        ctx.strokeRect(a.bx, a.by, a.bw, a.bh); ctx.setLineDash([]);
        ctx.strokeStyle = '#FF00FF'; ctx.setLineDash([8, 4]);
        ctx.strokeRect(b.bx, b.by, b.bw, b.bh); ctx.setLineDash([]);

        // Compute distances in pixels (raw image coords)
        const dxPxRaw = Math.abs(b.rawX - a.rawX);
        const dyPxRaw = Math.abs(b.rawY - a.rawY);
        const distPxRaw = Math.hypot(dxPxRaw, dyPxRaw);
        const dxMm = spec.mmPerPx > 0 ? dxPxRaw * spec.mmPerPx : 0;
        const dyMm = spec.mmPerPx > 0 ? dyPxRaw * spec.mmPerPx : 0;
        const distMm = spec.mmPerPx > 0 ? distPxRaw * spec.mmPerPx : 0;

        const lw = Math.max(2, 3 * scale);
        const fs = Math.max(12, 16 * scale);

        // Connecting line (diagonal)
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = '#FFFF00'; ctx.lineWidth = lw;
        ctx.setLineDash([6, 4]); ctx.stroke(); ctx.setLineDash([]);

        // X guide line (horizontal)
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, a.y);
        ctx.strokeStyle = '#FF6600'; ctx.lineWidth = lw * 0.7;
        ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);

        // Y guide line (vertical)
        ctx.beginPath(); ctx.moveTo(b.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = '#00FF66'; ctx.lineWidth = lw * 0.7;
        ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);

        // X label (draggable)
        const xOff = testDimOffsets.current.x;
        const xMid = (a.x + b.x) / 2 + xOff.dx * scale, xTxtY = a.y - fs * 0.8 + xOff.dy * scale;
        const xText = dxMm > 0 ? `X: ${dxMm.toFixed(2)} mm` : `X: ${dxPxRaw.toFixed(1)} px`;
        ctx.font = `bold ${fs * 0.85}px Inter, sans-serif`; ctx.textAlign = 'center';
        const xTw = ctx.measureText(xText).width;
        const xRect = { x: xMid - xTw / 2 - 6, y: xTxtY - fs * 0.4, w: xTw + 12, h: fs * 0.9 };
        ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(xRect.x, xRect.y, xRect.w, xRect.h);
        ctx.fillStyle = '#FF6600'; ctx.fillText(xText, xMid, xTxtY + fs * 0.25);

        // Y label (draggable)
        const yOff = testDimOffsets.current.y;
        const yTxtX = b.x + fs * 0.6 + yOff.dx * scale, yMid = (a.y + b.y) / 2 + yOff.dy * scale;
        const yText = dyMm > 0 ? `Y: ${dyMm.toFixed(2)} mm` : `Y: ${dyPxRaw.toFixed(1)} px`;
        const yTw = ctx.measureText(yText).width;
        const yRect = { x: yTxtX - 6, y: yMid - fs * 0.4, w: yTw + 12, h: fs * 0.9 };
        ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(yRect.x, yRect.y, yRect.w, yRect.h);
        ctx.fillStyle = '#00FF66'; ctx.fillText(yText, yTxtX + yTw / 2, yMid + fs * 0.25);
        ctx.textAlign = 'center';

        // Total distance label (draggable)
        const tOff = testDimOffsets.current.total;
        const mx = (a.x + b.x) / 2 + tOff.dx * scale, my = (a.y + b.y) / 2 + tOff.dy * scale;
        const totalText = distMm > 0 ? `${distPxRaw.toFixed(1)} px = ${distMm.toFixed(2)} mm` : `${distPxRaw.toFixed(1)} px`;
        ctx.font = `bold ${fs}px Inter, sans-serif`;
        const tw = ctx.measureText(totalText).width;
        const tRect = { x: mx - tw / 2 - 8, y: my - fs / 2 - 4, w: tw + 16, h: fs + 8 };
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(tRect.x, tRect.y, tRect.w, tRect.h);
        ctx.fillStyle = '#FFFF00'; ctx.fillText(totalText, mx, my + fs * 0.35);

        // Store hit rects for dragging (in canvas coords)
        testDimRects.current = {
            x: xRect, y: yRect, total: tRect,
        };

        // ═══ TOLERANCE MATCHING (use DETECTED classes, not calibration-time labels) ═══
        const savedTol = localStorage.getItem('trackTolerances');
        if (savedTol && dxMm > 0) {
            const tolerances: Array<{ className: string; enabled: boolean; compareEnabled?: boolean; measuredValue: number; tolerancePlus: number; toleranceMinus: number }> = JSON.parse(savedTol);

            // Find unique class names actually detected in the current image with enabled tolerance
            const detectedClasses = new Set<string>();
            for (const det of dets) {
                const conf = det.confidence ?? 1;
                if (conf < threshold) continue;
                const cn = (det.class || '').trim();
                if (cn) detectedClasses.add(cn);
            }

            const results: typeof toleranceResults = [];
            for (const cn of detectedClasses) {
                // Find tolerance entry matching this detected class (enabled tick = first column, compareEnabled = third column)
                const tolEntry = tolerances.find(t => t.enabled && t.compareEnabled !== false && t.className.trim().toLowerCase() === cn.toLowerCase());
                if (tolEntry) {
                    const refValue = tolEntry.measuredValue;
                    const isOk = refValue > 0 && dxMm >= (refValue - tolEntry.toleranceMinus) && dxMm <= (refValue + tolEntry.tolerancePlus);
                    results.push({
                        label: cn, xMm: dxMm, refMm: refValue,
                        tolPlus: tolEntry.tolerancePlus, tolMinus: tolEntry.toleranceMinus,
                        ok: isOk, hasRef: refValue > 0,
                    });
                }
            }
            // Update state for the UI panel (avoid re-render loop by checking for changes)
            setToleranceResults(prev => {
                if (JSON.stringify(prev) === JSON.stringify(results)) return prev;
                return results;
            });
        }
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
        console.log(`[Roboflow] loadDetections called, src length: ${src?.length ?? 0}, starts with: ${src?.substring(0, 30)}`);
        if (!src || src.length < 10) {
            console.error("[Roboflow] src vacío o inválido, cancelando petición");
            setIsProcessing(false);
            return;
        }
        try {
            const bodyPayload = JSON.stringify({ image: src });
            console.log(`[Roboflow] Enviando petición, body size: ${bodyPayload.length}`);
            const response = await fetch("http://localhost:8765/api/measure/roboflow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: bodyPayload
            });
            const data = await response.json();
            if (!data.ok) throw new Error(data.error);
            const preds: any[] = Array.isArray(data.predictions) ? data.predictions : [];
            
            preds.forEach((p: any) => {
                if (p.points && Array.isArray(p.points) && p.points.length > 0) {
                    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                    p.points.forEach((pt: any) => {
                        if (pt.x < minX) minX = pt.x;
                        if (pt.x > maxX) maxX = pt.x;
                        if (pt.y < minY) minY = pt.y;
                        if (pt.y > maxY) maxY = pt.y;
                    });
                    if (minX <= maxX && minY <= maxY) {
                        p.x = minX + (maxX - minX) / 2;
                        p.y = minY + (maxY - minY) / 2;
                        p.width = maxX - minX;
                        p.height = maxY - minY;
                    }
                }
            });

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

        // Always use the original clean image so visibility filtering works correctly.
        // (roboflowImageRef has all detections pre-painted by the backend, ignoring visibility settings)
        const baseImg = imageElementRef.current;
        // For coordinate mapping we also use the original image
        const origImg = imageElementRef.current;

        if (baseImg) {
            const scale = Math.min(canvas.width / baseImg.width, canvas.height / baseImg.height);
            const offsetX = (canvas.width / 2) - (baseImg.width / 2) * scale;
            const offsetY = (canvas.height / 2) - (baseImg.height / 2) * scale;

            ctx.drawImage(baseImg, offsetX, offsetY, baseImg.width * scale, baseImg.height * scale);

            // Sobre la imagen base, dibujamos las predicciones interactivas (para el slider)
            // Solo si hay predicciones y podemos mapear sus coordenadas
            if (detections && detections.length > 0 && origImg) {
                // Read per-class visibility from tolerance config
                const _tolSaved2 = localStorage.getItem('trackTolerances');
                const _hiddenClasses2 = new Set<string>();
                if (_tolSaved2) {
                    try {
                        const _tolArr2: any[] = JSON.parse(_tolSaved2);
                        _tolArr2.forEach(t => { if (t.visible === false) _hiddenClasses2.add(t.className); });
                    } catch (_) { /* ignore */ }
                }

                detections.forEach(det => {
                    const conf = det.confidence !== undefined ? det.confidence : 1.0;
                    if (conf < confidenceThreshold) return;
                    if (det.class && _hiddenClasses2.has(det.class)) return;

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

                        if (showDetLabels) {
                            const label = `${det.class || 'Obj'} ${(conf * 100).toFixed(0)}%`;
                            const fontSize = Math.max(14, Math.floor(20 * coordScale));
                            ctx.font = `bold ${fontSize}px Inter, sans-serif`;

                            const textW = ctx.measureText(label).width;
                            ctx.fillStyle = baseColor;
                            ctx.fillRect(boxX - 1.5, boxY - fontSize - 10, textW + 15, fontSize + 10);

                            ctx.fillStyle = '#fff';
                            ctx.fillText(label, boxX + 6, boxY - 7);
                        }
                    }
                });

                // Draw track overlay on image
                const specs = trackSpecs;
                if (specs.length > 0 && origImg) {
                    for (const spec of specs) {
                        const tScale = Math.min(1200 / origImg.width, 900 / origImg.height);
                        const tOffX = (1200 - origImg.width * tScale) / 2;
                        const tOffY = (900 - origImg.height * tScale) / 2;
                        drawTrackOverlay(ctx, detections, origImg.width, origImg.height, tScale, tOffX, tOffY, confidenceThreshold, spec);
                    }
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
        // Check for dimension label dragging first
        if (testMoveDimLabels && e.button === 0 && testDimRects.current) {
            const canvas = canvasRef.current;
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                const scX = canvas.width / rect.width, scY = canvas.height / rect.height;
                const cx = (e.clientX - rect.left) * scX, cy = (e.clientY - rect.top) * scY;
                const rects = testDimRects.current;
                for (const key of ['x', 'y', 'total'] as const) {
                    const r = rects[key];
                    if (cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h) {
                        e.preventDefault();
                        testDimDrag.current = { which: key, startMouse: { x: cx, y: cy }, startOffset: { ...testDimOffsets.current[key] } };
                        return;
                    }
                }
            }
        }
        if (testMoveDimLabels) return; // block other actions while in move mode
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
        // Dragging a dimension label
        if (testDimDrag.current) {
            const canvas = canvasRef.current;
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                const scX = canvas.width / rect.width, scY = canvas.height / rect.height;
                const cx = (e.clientX - rect.left) * scX, cy = (e.clientY - rect.top) * scY;
                const d = testDimDrag.current;
                testDimOffsets.current[d.which] = {
                    dx: d.startOffset.dx + (cx - d.startMouse.x),
                    dy: d.startOffset.dy + (cy - d.startMouse.y),
                };
                redrawCanvas();
            }
            return;
        }
        if (mode === 'segmentos' && currentSegmentStart) {
            redrawCanvas(getCanvasPoint(e));
        }
    };

    const handleMouseUp = (e: MouseEvent<HTMLCanvasElement>) => {
        if (testDimDrag.current) {
            testDimDrag.current = null;
            return;
        }
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

    const _processAndMeasure = async () => {
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

                {/* ══ PIEZA MAL COLGADA — flashing red banner ══ */}
                {toleranceResults.some(r => r.hasRef && !r.ok) && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 20,
                        animation: 'bannerBlink 0.8s ease-in-out infinite',
                        pointerEvents: 'none',
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #cc0000, #ff0000, #cc0000)',
                            color: '#fff',
                            textAlign: 'center',
                            padding: '14px 20px',
                            fontSize: 'clamp(18px, 3vw, 32px)',
                            fontWeight: 900,
                            fontFamily: 'Inter, Arial Black, sans-serif',
                            letterSpacing: '3px',
                            textTransform: 'uppercase',
                            textShadow: '0 0 10px #000, 0 0 30px #ff0000, 0 2px 4px rgba(0,0,0,0.8)',
                            boxShadow: '0 4px 20px rgba(255,0,0,0.6), inset 0 -2px 6px rgba(0,0,0,0.3)',
                            borderBottom: '3px solid #990000',
                        }}>
                            ⚠ PIEZA MAL COLGADA ⚠
                        </div>
                    </div>
                )}

                {/* ══ ETIQUETA ENCONTRADA — bottom sign ══ */}
                {(() => {
                    // Get current detections (image or video)
                    const currentDets = sourceType === 'video' ? videoDetectionsRef.current : detections;
                    if (!currentDets || currentDets.length === 0) return null;

                    // Read tolerance config — only show classes with enabled tick (first column)
                    const _tolSavedBanner = localStorage.getItem('trackTolerances');
                    const enabledClasses = new Set<string>();
                    if (_tolSavedBanner) {
                        try {
                            const arr: any[] = JSON.parse(_tolSavedBanner);
                            arr.forEach(t => { if (t.enabled) enabledClasses.add(t.className.trim().toLowerCase()); });
                        } catch (_) { /* */ }
                    }
                    if (enabledClasses.size === 0) return null;

                    // Get unique visible class names above threshold AND matching an enabled tolerance
                    const foundClasses = new Map<string, number>(); // className -> best confidence
                    currentDets.forEach((det: any) => {
                        const conf = det.confidence ?? 1.0;
                        if (conf < confidenceThreshold) return;
                        const cn = det.class || '';
                        if (!cn) return;
                        // Only include if this class has the enabled tick in tolerances
                        if (!enabledClasses.has(cn.trim().toLowerCase())) return;
                        const prev = foundClasses.get(cn) ?? 0;
                        if (conf > prev) foundClasses.set(cn, conf);
                    });

                    if (foundClasses.size === 0) return null;

                    // Color helper
                    const getClassColor = (className: string) => {
                        const colors = ['#BD00FF', '#00FFFF', '#FF00FF', '#70FF00', '#FFBD00', '#FF0000', '#0070FF', '#FF00BD', '#00FF70', '#BDFF00'];
                        let hash = 0;
                        for (let i = 0; i < className.length; i++) hash = className.charCodeAt(i) + ((hash << 5) - hash);
                        return colors[Math.abs(hash) % colors.length];
                    };

                    // Determine global OK/FUERA from tolerance results
                    const hasAnyFuera = toleranceResults.some(r => r.hasRef && !r.ok);
                    const hasAnyOk = toleranceResults.some(r => r.hasRef && r.ok);
                    const statusBorder = hasAnyFuera ? '#ff0000' : hasAnyOk ? '#00ff64' : '#1f6feb';
                    const statusBg = hasAnyFuera ? 'rgba(255,0,0,0.2)' : hasAnyOk ? 'rgba(0,255,100,0.15)' : 'rgba(31,111,235,0.15)';
                    const statusGlow = hasAnyFuera ? 'rgba(255,0,0,0.6)' : hasAnyOk ? 'rgba(0,255,100,0.5)' : 'rgba(31,111,235,0.4)';

                    return (
                        <div style={{
                            position: 'absolute',
                            bottom: sourceType === 'video' && videoSrc ? 65 : 12,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 18,
                            pointerEvents: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            maxWidth: '98%',
                            background: statusBg,
                            backdropFilter: 'blur(12px)',
                            border: `3px solid ${statusBorder}`,
                            borderRadius: 14,
                            padding: '14px 32px',
                            boxShadow: `0 0 30px ${statusGlow}, 0 4px 12px rgba(0,0,0,0.7)`,
                            animation: hasAnyFuera ? 'labelBannerPulse 1.2s ease-in-out infinite' : 'none',
                        }}>
                            {/* Pulsing indicator dot */}
                            <div style={{
                                width: 20, height: 20, borderRadius: '50%',
                                background: statusBorder,
                                boxShadow: `0 0 16px ${statusBorder}`,
                                flexShrink: 0,
                                animation: 'labelDotPulse 2s ease-in-out infinite',
                            }} />
                            {/* Found detection class names */}
                            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                                {Array.from(foundClasses.entries()).map(([cn, _conf]) => {
                                    const color = getClassColor(cn);
                                    return (
                                        <span key={cn} style={{
                                            fontSize: 'clamp(22px, 3.5vw, 38px)',
                                            fontWeight: 900,
                                            color: color,
                                            fontFamily: 'Inter, Arial Black, sans-serif',
                                            letterSpacing: '2px',
                                            textShadow: `0 2px 8px rgba(0,0,0,0.9), 0 0 20px ${color}40`,
                                        }}>
                                            {cn}
                                        </span>
                                    );
                                })}
                            </div>
                            {/* Tolerance status badge (if available) */}
                            {toleranceResults.length > 0 && (() => {
                                const isFuera = hasAnyFuera;
                                const isOk = hasAnyOk && !hasAnyFuera;
                                const textColor = isFuera ? '#ff4444' : isOk ? '#00ff64' : '#58a6ff';
                                const statusIcon = isFuera ? '✗' : isOk ? '✓' : '—';
                                const statusText = isFuera ? 'FUERA' : isOk ? 'OK' : 'SIN REF';
                                return (
                                    <div style={{
                                        background: isFuera ? '#ff000040' : isOk ? '#00ff6430' : '#1f6feb30',
                                        border: `2px solid ${statusBorder}`,
                                        borderRadius: 8,
                                        padding: '6px 16px',
                                        fontSize: 'clamp(16px, 2.5vw, 26px)',
                                        fontWeight: 900,
                                        color: textColor,
                                        fontFamily: 'Inter, sans-serif',
                                        letterSpacing: '2px',
                                        textShadow: `0 0 12px ${statusGlow}`,
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {statusIcon} {statusText}
                                    </div>
                                );
                            })()}
                        </div>
                    );
                })()}

                {/* Keyframes injected via style tag */}
                <style>{`
                    @keyframes bannerBlink {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.25; }
                    }
                    @keyframes labelBannerPulse {
                        0%, 100% { box-shadow: 0 0 20px rgba(255,0,0,0.5), 0 2px 8px rgba(0,0,0,0.6); }
                        50% { box-shadow: 0 0 35px rgba(255,0,0,0.8), 0 2px 16px rgba(0,0,0,0.8); }
                    }
                    @keyframes labelDotPulse {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.6; transform: scale(0.85); }
                    }
                `}</style>

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



                {/* ── SAM 3 — Detección de Personas ── */}
                <div style={{
                    ...styles.modeSelector,
                    borderTop: '2px solid #7c3aed',
                    paddingTop: 12,
                    background: 'linear-gradient(135deg, #7c3aed10, #dc262610)',
                    borderRadius: 8,
                    padding: 12,
                    border: `2px solid ${sam3Active ? '#7c3aed' : '#30363d'}`,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ margin: 0, fontSize: '14px', color: '#a78bfa' }}>🧠 SAM 3</h3>
                        <span style={{
                            fontSize: '9px',
                            background: sam3Active ? '#7c3aed30' : '#30363d30',
                            color: sam3Active ? '#a78bfa' : '#8b949e',
                            padding: '2px 6px',
                            borderRadius: 8,
                            fontWeight: 700,
                        }}>
                            {sam3Active ? 'ACTIVO' : 'OFF'}
                        </span>
                    </div>

                    <div style={{ fontSize: '10px', color: '#6e7681', marginTop: 2, marginBottom: 8 }}>
                        Detecta personas automáticamente en la imagen o vídeo
                    </div>


                    <button
                        disabled={sam3Loading || (!imageSrc && sourceType !== 'video')}
                        style={{
                            width: '100%', padding: '10px 12px', fontSize: '0.8rem', fontWeight: 700, borderRadius: 6,
                            cursor: sam3Loading ? 'wait' : 'pointer',
                            border: `2px solid ${sam3Active ? '#ef4444' : '#7c3aed'}`, color: '#fff',
                            background: sam3Loading
                                ? 'linear-gradient(135deg, #7c3aed40, #6d28d940)'
                                : sam3Active
                                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                                    : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                            opacity: ((!imageSrc && sourceType !== 'video') || sam3Loading) ? 0.5 : 1,
                            transition: 'all 0.2s',
                        }}
                        onClick={async () => {
                            if (sam3Loading) return;
                            // Toggle: if already active, deactivate
                            if (sam3Active) {
                                setSam3Active(false);
                                setSam3Result(null);
                                // Remove SAM3 detections from the main detections
                                setSam3Detections([]);
                                sam3DetectionsRef.current = [];
                                sam3InferringRef.current = false;
                                setDetections(prev => prev.filter(d => d._sam3 !== true));
                                return;
                            }
                            setSam3Loading(true);
                            setSam3Result(null);
                            try {
                                // Obtener imagen — de imagen cargada o capturar frame del vídeo
                                let imgToSend = imageSrc;
                                if (!imgToSend && sourceType === 'video' && videoElementRef.current) {
                                    const video = videoElementRef.current;
                                    const tempCanvas = document.createElement('canvas');
                                    tempCanvas.width = video.videoWidth;
                                    tempCanvas.height = video.videoHeight;
                                    const tCtx = tempCanvas.getContext('2d');
                                    if (tCtx) {
                                        tCtx.drawImage(video, 0, 0);
                                        imgToSend = tempCanvas.toDataURL('image/jpeg', 0.85);
                                    }
                                }
                                if (!imgToSend) {
                                    setSam3Result('❌ No hay imagen ni vídeo disponible');
                                    return;
                                }
                                const response = await fetch('http://localhost:8765/api/sam3/detect', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        image: imgToSend,
                                        concepts: ['person', 'forklift'],
                                        remove: false,
                                    }),
                                });
                                const data = await response.json();
                                if (data.ok) {
                                    const rawDets = data.detections || [];
                                    const count = rawDets.length;
                                    setSam3Result(`✅ ${count} objeto(s) detectado(s)`);
                                    if (count > 0) {
                                        setSam3Active(true);
                                        // Usar la clase real de Roboflow (person, forklift, etc.)
                                        const sam3Dets = rawDets.map((d: any) => ({
                                            ...d,
                                            class: (d.class || 'person').toUpperCase(),
                                            _sam3: true,
                                        }));
                                        setSam3Detections(sam3Dets);
                                        setDetections(prev => [
                                            ...prev.filter(d => d._sam3 !== true),
                                            ...sam3Dets,
                                        ]);
                                    } else {
                                        setSam3Active(false);
                                        setSam3Detections([]);
                                    }
                                } else {
                                    setSam3Result(`❌ ${data.error || 'Error desconocido'}`);
                                    setSam3Active(false);
                                }
                            } catch (err: any) {
                                setSam3Result(`❌ Error: ${err.message}`);
                                setSam3Active(false);
                            } finally {
                                setSam3Loading(false);
                            }
                        }}
                    >
                        {sam3Loading ? '⏳ Buscando personas...' : sam3Active ? '🛑 Desactivar SAM3' : '🧠 Activar SAM3'}
                    </button>

                    {sam3Result && (
                        <div style={{
                            fontSize: '11px', padding: '6px 8px', borderRadius: 6, marginTop: 6,
                            background: sam3Result.startsWith('✅') ? '#3fb95015' : '#f8514915',
                            border: `1px solid ${sam3Result.startsWith('✅') ? '#3fb95040' : '#f8514940'}`,
                            color: sam3Result.startsWith('✅') ? '#3fb950' : '#f85149',
                            wordBreak: 'break-word',
                        }}>
                            {sam3Result}
                        </div>
                    )}
                </div>

                {/* Mover Cotas toggle */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    <button
                        style={{
                            padding: '6px 12px', fontSize: '0.72rem', fontWeight: 600, borderRadius: 4, cursor: 'pointer',
                            border: `2px solid ${testMoveDimLabels ? '#FF6600' : '#30363d'}`,
                            background: testMoveDimLabels ? '#FF660018' : '#161b22',
                            color: testMoveDimLabels ? '#FF6600' : '#8b949e', flex: 1,
                        }}
                        onClick={() => setTestMoveDimLabels(v => !v)}
                    >
                        📌 {testMoveDimLabels ? 'MOVIENDO COTAS' : 'Mover Cotas'}
                    </button>
                    {testMoveDimLabels && (
                        <button
                            style={{
                                padding: '4px 8px', fontSize: '0.62rem', fontWeight: 600, borderRadius: 4, cursor: 'pointer',
                                border: '1px solid #30363d', background: '#161b22', color: '#8b949e',
                            }}
                            onClick={() => {
                                testDimOffsets.current = { x: { dx: 0, dy: 0 }, y: { dx: 0, dy: 0 }, total: { dx: 0, dy: 0 } };
                                redrawCanvas();
                            }}
                        >
                            ↺ Reset
                        </button>
                    )}
                </div>

                {/* Tolerance result panel */}
                {toleranceResults.length > 0 && (
                    <div style={{
                        background: '#0d1117', border: '2px solid #1f6feb', borderRadius: 8,
                        padding: '10px 12px', marginBottom: 10,
                    }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1f6feb', marginBottom: 6 }}>📐 Resultado Tolerancias</div>
                        {toleranceResults.map((r, i) => (
                            <div key={i} style={{
                                display: 'flex', flexDirection: 'column', gap: 2, padding: '6px 8px', borderRadius: 4, marginBottom: 4,
                                background: r.hasRef ? (r.ok ? '#3fb95010' : '#f8514910') : '#30363d10',
                                border: `1px solid ${r.hasRef ? (r.ok ? '#3fb95040' : '#f8514940') : '#30363d'}`,
                            }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e6edf3' }}>{r.label}</div>
                                <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>
                                    X medido: <span style={{ color: '#FF6600', fontWeight: 600 }}>{r.xMm.toFixed(2)} mm</span>
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>
                                    Referencia: <span style={{ color: '#e6edf3' }}>{r.refMm.toFixed(2)} mm</span>
                                    <span style={{ marginLeft: 4 }}>[+{r.tolPlus} / -{r.tolMinus}]</span>
                                </div>
                                <div style={{
                                    fontSize: '0.82rem', fontWeight: 700, marginTop: 2,
                                    color: r.hasRef ? (r.ok ? '#3fb950' : '#f85149') : '#8b949e',
                                }}>
                                    {r.hasRef ? (r.ok ? '✓ OK — dentro de tolerancia' : '✗ FUERA de tolerancia') : '— Sin valor de referencia'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

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
