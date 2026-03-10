import React, { useState, useRef, useEffect } from 'react';
import type { DragEvent, MouseEvent } from 'react';

type MeasurementMode = 'segmentos' | 'puntos';

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

    const [segments, setSegments] = useState<Segment[]>([]);
    const [currentSegmentStart, setCurrentSegmentStart] = useState<Point | null>(null);
    const [points, setPoints] = useState<Point[]>([]);
    const [detections, setDetections] = useState<any[]>([]);
    const [confidenceThreshold, setConfidenceThreshold] = useState(0.0);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageElementRef = useRef<HTMLImageElement | null>(null);
    const roboflowImageRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        redrawCanvas();
    }, [segments, points, mode, imageSrc, detections, confidenceThreshold]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            loadImage(file);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            loadImage(file);
        }
    };

    const loadImage = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const src = event.target?.result as string;
            setImageSrc(src);
            const img = new Image();
            img.onload = () => {
                imageElementRef.current = img;
                roboflowImageRef.current = null; // Resetear imagen Roboflow al cargar una nueva

                // Volvemos al tamaño fijo de 1200x900 que pediste antes
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

            // 1. Predicciones para el slider de confianza
            const preds: any[] = Array.isArray(data.predictions) ? data.predictions : [];
            console.log(`[Roboflow] Predicciones recibidas: ${preds.length}`, preds);
            setDetections(preds);

            // 2. Imagen ya renderizada por Roboflow con TODAS las etiquetas y colores
            if (data.output_image && typeof data.output_image === 'string') {
                const imgSrc = data.output_image.startsWith('data:')
                    ? data.output_image
                    : `data:image/jpeg;base64,${data.output_image}`;

                const roboImg = new Image();
                roboImg.onload = () => {
                    roboflowImageRef.current = roboImg;
                    console.log(`[Roboflow] output_image cargado: ${roboImg.width}x${roboImg.height}`);
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

    const getSegmentationFromRoboflow = async (image: string): Promise<any> => {
        console.log("Segmentando con Roboflow...");
        try {
            const response = await fetch("http://localhost:8765/api/measure/roboflow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image })
            });
            const data = await response.json();
            if (!data.ok) throw new Error(data.error);
            return data.result;
        } catch (error) {
            console.error("Roboflow Error:", error);
            throw error;
        }
    };

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

            setMeasurementResult(`Cota: ${resultVal.toFixed(2)} píxeles / mm`);
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
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
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
                        Subir Imagen
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                </div>

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

                <div style={styles.modeSelector}>
                    <h3>Modo de Medición</h3>
                    <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                        <label style={styles.radioLabel}>
                            <input
                                type="radio"
                                name="measureMode"
                                value="segmentos"
                                checked={mode === 'segmentos'}
                                onChange={() => { setMode('segmentos'); clearCanvasState(); }}
                            />
                            Modo Segmentos
                        </label>
                        <label style={styles.radioLabel}>
                            <input
                                type="radio"
                                name="measureMode"
                                value="puntos"
                                checked={mode === 'puntos'}
                                onChange={() => { setMode('puntos'); clearCanvasState(); }}
                            />
                            Modo Punto a Punto
                        </label>
                    </div>
                </div>

                <div style={styles.actionButtons}>
                    <button
                        style={{ ...styles.button, backgroundColor: '#007aff', color: 'white' }}
                        onClick={processAndMeasure}
                        disabled={!imageSrc || isProcessing}
                    >
                        Procesar y Medir
                    </button>
                    <button
                        style={{ ...styles.button, backgroundColor: '#333', color: 'white' }}
                        onClick={() => clearCanvasState()}
                    >
                        Limpiar Canvas
                    </button>
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
        width: '100%',
        padding: '20px',
        gap: '20px',
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
        width: '320px',
        backgroundColor: '#252526',
        borderRadius: '8px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
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
