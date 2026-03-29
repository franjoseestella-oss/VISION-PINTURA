import { useState, useEffect, useRef } from 'react';
import { useTranslation } from './i18n';
import ImageMeasurement from './ImageMeasurement';

// ─── Tipos reales basados en BaslerCameraCameraParams.h (acA1920-48gm) ────────

type PixelFormat = 'Mono8' | 'Mono10' | 'Mono10p';
type ExposureAuto = 'Off' | 'Once' | 'Continuous';
type GainAuto = 'Off' | 'Once' | 'Continuous';
type AcquisitionMode = 'Continuous' | 'SingleFrame';
type TriggerMode = 'Off' | 'On';
type TriggerSource = 'Software' | 'Line1' | 'Line3' | 'Action1';
type TriggerSelector = 'AcquisitionStart' | 'FrameStart';
type TransmissionType = 'Unicast' | 'Multicast' | 'LimitedBroadcast' | 'SubnetDirectedBroadcast';
type GevDriver = 'WindowsFilterDriver' | 'SocketDriver';
type ConnectionMode = 'auto' | 'serial' | 'ip';
type ConnectionStatus = 'disconnected' | 'scanning' | 'connecting' | 'connected' | 'error';

interface BaslerDevice {
    index: number;
    modelName: string;        // e.g. acA1920-48gm
    serialNumber: string;     // e.g. 40088454
    deviceType: 'GigE';
    ipAddress: string;
    subnetMask: string;
    macAddress: string;
    firmwareVersion: string;
    status: 'available' | 'connected' | 'error';
}

interface TLConfig {
    // BaslerCameraTLParams — Transport Layer GigE
    heartbeatTimeout: number;        // ms, default 1000
    connectionGuardEnable: boolean;  // PylonGigEConnectionGuard
    readTimeout: number;             // ms
    writeTimeout: number;            // ms
    maxRetryCountRead: number;
    maxRetryCountWrite: number;
    migrationModeEnable: boolean;    // SFNC 1.x → 2.x node mapping
    // IP persistente (ChangeIpConfiguration / SetPersistentIpAddress)
    enablePersistentIp: boolean;
    enableDhcp: boolean;
    persistentIp: string;
    persistentSubnet: string;
    persistentGateway: string;
}

interface CameraConfig {
    // Conexión
    connectionMode: ConnectionMode;
    serialNumber: string;
    ipAddress: string;
    timeout: number;           // ms
    // Imagen
    pixelFormat: PixelFormat;
    width: number;             // max 1920
    height: number;            // max 1200
    offsetX: number;
    offsetY: number;
    // Adquisición
    acquisitionMode: AcquisitionMode;
    acquisitionFrameRateEnable: boolean;
    acquisitionFrameRateAbs: number;   // float fps
    // Exposición
    exposureAuto: ExposureAuto;
    exposureTimeAbs: number;   // µs
    // Ganancia
    gainAuto: GainAuto;
    gainRaw: number;           // raw integer units
    // Trigger
    triggerMode: TriggerMode;
    triggerSelector: TriggerSelector;
    triggerSource: TriggerSource;
    // GigE Stream
    transmissionType: TransmissionType;
    gevDriver: GevDriver;
    packetSizeBytes: number;   // GigE packet size
    enableResend: boolean;
    // Buffers
    maxNumBuffer: number;
}

const DEFAULT_TL_CONFIG: TLConfig = {
    heartbeatTimeout: 1000,
    connectionGuardEnable: false,
    readTimeout: 500,
    writeTimeout: 500,
    maxRetryCountRead: 2,
    maxRetryCountWrite: 2,
    migrationModeEnable: false,
    enablePersistentIp: false,
    enableDhcp: true,
    persistentIp: '192.168.0.201',
    persistentSubnet: '255.255.255.0',
    persistentGateway: '192.168.0.1',
};

const DEFAULT_CONFIG: CameraConfig = {
    connectionMode: 'auto',
    serialNumber: '',
    ipAddress: '',
    timeout: 5000,
    pixelFormat: 'Mono8',
    width: 1920,
    height: 1200,
    offsetX: 0,
    offsetY: 0,
    acquisitionMode: 'Continuous',
    acquisitionFrameRateEnable: true,
    acquisitionFrameRateAbs: 48.0,
    exposureAuto: 'Off',
    exposureTimeAbs: 10000,
    gainAuto: 'Off',
    gainRaw: 0,
    triggerMode: 'Off',
    triggerSelector: 'FrameStart',
    triggerSource: 'Software',
    transmissionType: 'Unicast',
    gevDriver: 'WindowsFilterDriver',
    packetSizeBytes: 1500,
    enableResend: true,
    maxNumBuffer: 10,
};

export default function BaslerCamera() {
    const { t } = useTranslation();
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [devices, setDevices] = useState<BaslerDevice[]>([]);
    const [selected, setSelected] = useState<BaslerDevice | null>(null);
    const [config, setConfig] = useState<CameraConfig>(DEFAULT_CONFIG);
    const [tlConfig, setTLConfig] = useState<TLConfig>(DEFAULT_TL_CONFIG);
    const [scanProgress, setScanProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');
    const [activeTab, setActiveTab] = useState<'connection' | 'image' | 'acquisition' | 'trigger' | 'gige' | 'transport' | 'preview' | 'calibration' | 'test'>('connection');
    const [logs, setLogs] = useState<{ time: string; level: 'info' | 'warn' | 'error' | 'success'; msg: string }[]>([]);
    // Backend Python
    const [backendOk, setBackendOk] = useState<boolean | null>(null); // null=checking
    const [streamKey, setStreamKey] = useState(0);  // fuerza reload del img src
    const [serverFps, setServerFps] = useState(0);
    const [serverFrames, setServerFrames] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const logsEndRef = useRef<HTMLDivElement>(null);
    // ── Captura de fotos ──────────────────────────────────────────────────────
    const [saveDir, setSaveDir] = useState('C:\\Users\\franj\\OneDrive\\Escritorio\\COSAS  FRAN\\PROYECTOS\\PINTURA\\ROBOTFLOW\\FOTOS\\MASTILES');
    const [customFilename, setCustomFilename] = useState('');
    const [captureMsg, setCaptureMsg] = useState<{ ok: boolean; text: string } | null>(null);
    const [capturing, setCapturing] = useState(false);
    const [gallery, setGallery] = useState<{ filename: string; path: string; size_kb: number; time: string }[]>();
    // ── Grabación de vídeo ───────────────────────────────────────────────
    const [videoDir, setVideoDir] = useState('C:\\Users\\franj\\OneDrive\\Escritorio\\COSAS  FRAN\\PROYECTOS\\PINTURA\\ROBOTFLOW\\VIDEOS\\MASTILES');
    const [videoFilename, setVideoFilename] = useState('');
    const [videoFps, setVideoFps] = useState(10);
    const [videoCodec, setVideoCodec] = useState<'MJPG' | 'mp4v'>('MJPG');
    const [isRecording, setIsRecording] = useState(false);
    const [recElapsed, setRecElapsed] = useState(0);
    const [recFrames, setRecFrames] = useState(0);
    const [recMsg, setRecMsg] = useState<{ ok: boolean; text: string } | null>(null);
    const [videoGallery, setVideoGallery] = useState<{ filename: string; path: string; size_mb: number; duration_s: number; time: string }[]>();
    // ── SAM 3 — Eliminar personas en TIEMPO REAL (Live Preview) ────────────
    const [sam3LiveActive, setSam3LiveActive] = useState(false);
    const [sam3LiveLoading, setSam3LiveLoading] = useState(false);
    const [sam3LiveStatus, setSam3LiveStatus] = useState<{ active: boolean; persons_found: number; fps: number; frames_processed: number; error: string } | null>(null);
    const [sam3LiveConfidence, setSam3LiveConfidence] = useState(0.3);
    const [sam3FillColor, setSam3FillColor] = useState('#ffffff'); // Color de relleno
    // ── Zoom / Pan ─────────────────────────────────────────────────────────────
    const [zoomLevel, setZoomLevel] = useState(1.0);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const panStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });
    const streamWrapRef = useRef<HTMLDivElement>(null);
    const handleStreamClick = async (e: React.MouseEvent<HTMLImageElement>) => {
        if (!measureActive) return;
        const img = e.currentTarget;
        const rect = img.getBoundingClientRect();
        const nw = img.naturalWidth || config.width;
        const nh = img.naturalHeight || config.height;
        const scale = Math.min(rect.width / nw, rect.height / nh);
        const dispW = nw * scale;
        const dispH = nh * scale;
        const offX = (rect.width - dispW) / 2;
        const offY = (rect.height - dispH) / 2;
        const cx = e.clientX - rect.left - offX;
        const cy = e.clientY - rect.top - offY;
        if (cx >= 0 && cx <= dispW && cy >= 0 && cy <= dispH) {
            const ox = (cx / dispW) * nw;
            const oy = (cy / dispH) * nh;

            if (measureActive) {
                setMeasurePoints(prev => {
                    const next = [...prev, { x: ox, y: oy }];
                    if (next.length > 2) return [{ x: ox, y: oy }];
                    return next;
                });
            }
        }
    };


    const handleStreamMove = (e: React.MouseEvent<HTMLImageElement>) => {
        if (!measureActive) return;
        const img = e.currentTarget;
        const rect = img.getBoundingClientRect();
        const nw = img.naturalWidth || config.width;
        const nh = img.naturalHeight || config.height;
        const scale = Math.min(rect.width / nw, rect.height / nh);
        const dispW = nw * scale;
        const dispH = nh * scale;
        const offX = (rect.width - dispW) / 2;
        const offY = (rect.height - dispH) / 2;
        const cx = e.clientX - rect.left - offX;
        const cy = e.clientY - rect.top - offY;
        if (cx >= 0 && cx <= dispW && cy >= 0 && cy <= dispH) {
            const ox = (cx / dispW) * nw;
            const oy = (cy / dispH) * nh;
            setMeasureHover({ x: ox, y: oy });
        }
    };

    const handleStreamLeave = () => {
        setMeasureHover(null);
    };


    const [panelOpen, setPanelOpen] = useState(true);
    // ── Calibración de cámara ─────────────────────────────────────────────────
    const [calCols, setCalCols] = useState(9);         // esquinas internas X
    const [calRows, setCalRows] = useState(6);         // esquinas internas Y
    const [calSquare, setCalSquare] = useState(25.0);  // tamaño cuadrado (mm)
    const [calImages, setCalImages] = useState<{ filename: string; corners: boolean; time: string }[]>([]);
    const [calResult, setCalResult] = useState<{
        rms: number;
        fx: number; fy: number;
        cx: number; cy: number;
        k1: number; k2: number; p1: number; p2: number; k3: number;
        image_count: number;
        corrected_dir?: string;
        pattern_dir?: string;
        corrected_files?: string[];
        pattern_files?: string[];
    } | null>(null);
    const [calPreviewIdx, setCalPreviewIdx] = useState(0);
    const [calPreviewMode, setCalPreviewMode] = useState<'pattern' | 'corrected'>('pattern');
    const [calActive, setCalActive] = useState(false);
    const [calActiveRms, setCalActiveRms] = useState<number | null>(null);
    const [measureActive, setMeasureActive] = useState(false);
    const [measurePoints, setMeasurePoints] = useState<{ x: number, y: number }[]>([]);
    const [measureHover, setMeasureHover] = useState<{ x: number, y: number } | null>(null);
    const [measureMode, setMeasureMode] = useState<'punto' | 'segmentos'>('punto');
    const dragPointIdx = useRef<number | null>(null);
    const wasDraggingPoint = useRef(false);
    const dragTrackPoint = useRef<'A' | 'B' | null>(null);
    const [showLabels, setShowLabels] = useState(true);
    const [calBoardCollapsed, setCalBoardCollapsed] = useState(true);
    const [calMeasureCollapsed, setCalMeasureCollapsed] = useState(false);
    const [calDetections, setCalDetections] = useState<any[]>([]);
    const [calShowDetectionLabels, setCalShowDetectionLabels] = useState(() => {
        const saved = localStorage.getItem('showDetectionLabels');
        return saved !== null ? saved === 'true' : true;
    });
    // Sync calShowDetectionLabels ↔ localStorage (global setting)
    useEffect(() => {
        localStorage.setItem('showDetectionLabels', String(calShowDetectionLabels));
    }, [calShowDetectionLabels]);
    useEffect(() => {
        const onStorage = () => {
            const saved = localStorage.getItem('showDetectionLabels');
            if (saved !== null) setCalShowDetectionLabels(saved === 'true');
        };
        window.addEventListener('storage', onStorage);
        const interval = setInterval(onStorage, 2000);
        return () => { window.removeEventListener('storage', onStorage); clearInterval(interval); };
    }, []);
    const [calAnalyzing, setCalAnalyzing] = useState(false);
    const [calAnalyzeCollapsed, setCalAnalyzeCollapsed] = useState(false);
    // Per-detection visibility and selection
    const [calHiddenDetections, setCalHiddenDetections] = useState<Set<number>>(new Set());
    const [calSelectedDetIdx, setCalSelectedDetIdx] = useState<number | null>(null);

    // Track definition
    type TrackPiece = { det: any; point: { x: number; y: number }; mode: 'centro' | 'arista'; edge?: 'top' | 'bottom' | 'left' | 'right' };
    const [trackMode, setTrackMode] = useState(false);
    const [trackPointMode, setTrackPointMode] = useState<'centro' | 'arista'>('centro');
    const [trackPieceA, setTrackPieceA] = useState<TrackPiece | null>(null);
    const [trackPieceB, setTrackPieceB] = useState<TrackPiece | null>(null);
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

    // Draggable dimension labels (offsets from default position)
    const dimLabelOffsets = useRef<{ x: { dx: number; dy: number }; y: { dx: number; dy: number }; total: { dx: number; dy: number } }>({
        x: { dx: 0, dy: 0 }, y: { dx: 0, dy: 0 }, total: { dx: 0, dy: 0 },
    });
    const dragDimLabel = useRef<{ which: 'x' | 'y' | 'total'; startMouse: { x: number; y: number }; startOffset: { dx: number; dy: number } } | null>(null);
    // Store label hit areas for click detection
    const dimLabelRects = useRef<{ x: { x: number; y: number; w: number; h: number }; y: { x: number; y: number; w: number; h: number }; total: { x: number; y: number; w: number; h: number } } | null>(null);
    const [moveDimLabels, setMoveDimLabels] = useState(false);



    const [calCapturing, setCalCapturing] = useState(false);
    const [calComputing, setCalComputing] = useState(false);
    const [calMsg, setCalMsg] = useState<{ ok: boolean; text: string } | null>(null);
    const [calSaveDir, setCalSaveDir] = useState('C:\\Users\\franj\\OneDrive\\Escritorio\\COSAS  FRAN\\PROYECTOS\\PINTURA\\CALIBRACION');

    // ── Calibrar escala (imagen de referencia) ──────────────────────────────

    const [scaleCalImageSrc, setScaleCalImageSrc] = useState<string | null>(null);
    const [scaleCalPoints, setScaleCalPoints] = useState<{ x: number, y: number }[]>([]);
    const [scaleCalRealMm, setScaleCalRealMm] = useState<string>('');
    const [scaleCalMmPerPx, setScaleCalMmPerPx] = useState<number>(() => {
        const saved = localStorage.getItem('calibration_mmPerPx');
        return saved ? parseFloat(saved) : 0;
    });
    const scaleCalCanvasRef = useRef<HTMLCanvasElement>(null);
    const scaleCalImageRef = useRef<HTMLImageElement | null>(null);

    // Zoom & Pan state
    const [calZoom, setCalZoom] = useState(1);
    const [calPan, setCalPan] = useState({ x: 0, y: 0 });
    const [calZoomMode, setCalZoomMode] = useState(false);
    const [calPanMode, setCalPanMode] = useState(false);
    const calDragging = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);

    const redrawScaleCalCanvas = () => {
        const canvas = scaleCalCanvasRef.current;
        const img = scaleCalImageRef.current;
        if (!canvas || !img) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(calPan.x, calPan.y);
        ctx.scale(calZoom, calZoom);
        ctx.drawImage(img, 0, 0);

        // ── Draw Roboflow detections ──
        if (calDetections.length > 0) {
            const getClassColor = (cn: string) => {
                const cols = ['#BD00FF', '#00FFFF', '#FF00FF', '#70FF00', '#FFBD00', '#FF0000', '#0070FF', '#FF00BD', '#00FF70', '#BDFF00'];
                let h = 0; if (cn) for (let i = 0; i < cn.length; i++) h = cn.charCodeAt(i) + ((h << 5) - h);
                return cols[Math.abs(h) % cols.length];
            };
            const hexToRgba = (hex: string, a: number) => {
                const r = parseInt(hex.slice(1, 3), 16) || 0, g = parseInt(hex.slice(3, 5), 16) || 0, b = parseInt(hex.slice(5, 7), 16) || 0;
                return `rgba(${r},${g},${b},${a})`;
            };
            // Read per-class visibility from tolerance config
            const _tolSaved = localStorage.getItem('trackTolerances');
            const _hiddenClasses = new Set<string>();
            if (_tolSaved) {
                try {
                    const _tolArr: any[] = JSON.parse(_tolSaved);
                    _tolArr.forEach(t => { if (t.visible === false) _hiddenClasses.add(t.className); });
                } catch (_) { /* ignore parse errors */ }
            }

            calDetections.forEach((det, detIdx) => {
                // Skip hidden detections (per-index or per-class)
                if (calHiddenDetections.has(detIdx)) return;
                if (det.class && _hiddenClasses.has(det.class)) return;

                const conf = det.confidence ?? 1.0;
                const color = det.class ? getClassColor(det.class) : '#BD00FF';
                const isSelected = calSelectedDetIdx === detIdx;
                let dx = det.x, dy = det.y, dw = det.width, dh = det.height;
                const isNorm = (dx > 0 && dx <= 1.1) && (dw > 0 && dw <= 1.1);
                if (isNorm) { dx *= img.naturalWidth; dy *= img.naturalHeight; dw *= img.naturalWidth; dh *= img.naturalHeight; }

                // Segmentation polygon
                if (det.points && Array.isArray(det.points) && det.points.length > 0) {
                    ctx.beginPath();
                    det.points.forEach((pt: any, idx: number) => {
                        let ptx = pt.x, pty = pt.y;
                        if (isNorm) { ptx *= img.naturalWidth; pty *= img.naturalHeight; }
                        idx === 0 ? ctx.moveTo(ptx, pty) : ctx.lineTo(ptx, pty);
                    });
                    ctx.closePath();
                    ctx.fillStyle = hexToRgba(color, isSelected ? 0.5 : 0.3);
                    ctx.fill();
                    ctx.strokeStyle = isSelected ? '#FFFFFF' : color;
                    ctx.lineWidth = Math.max(isSelected ? 4 : 2, img.naturalWidth / (isSelected ? 400 : 600));
                    ctx.stroke();
                }

                // Bounding box
                if (dx !== undefined && dw !== undefined) {
                    const bx = dx - dw / 2, by = dy - dh / 2;
                    // Selected: draw a glowing highlight
                    if (isSelected) {
                        ctx.strokeStyle = '#FFFFFF';
                        ctx.lineWidth = Math.max(6, img.naturalWidth / 250);
                        ctx.setLineDash([]);
                        ctx.strokeRect(bx - 2, by - 2, dw + 4, dh + 4);
                    }
                    ctx.strokeStyle = color;
                    ctx.lineWidth = Math.max(isSelected ? 4 : 3, img.naturalWidth / (isSelected ? 350 : 500));
                    ctx.strokeRect(bx, by, dw, dh);

                    // Label
                    if (calShowDetectionLabels) {
                        const label = `${det.class || 'Obj'} ${(conf * 100).toFixed(0)}%`;
                        const fs = Math.max(14, img.naturalWidth / 100);
                        ctx.font = `bold ${fs}px Inter, sans-serif`;
                        const tw = ctx.measureText(label).width;
                        ctx.fillStyle = isSelected ? '#FFFFFF' : color;
                        ctx.fillRect(bx - 1, by - fs - 8, tw + 12, fs + 8);
                        ctx.fillStyle = isSelected ? '#000' : '#fff';
                        ctx.textAlign = 'left';
                        ctx.fillText(label, bx + 5, by - 5);
                    }
                }
            });
        }

        scaleCalPoints.forEach((p, i) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(8, img.naturalWidth / 200), 0, Math.PI * 2);
            ctx.fillStyle = i === 0 ? '#00ff64' : '#ff3b30';
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();
            if (showLabels) {
                ctx.fillStyle = '#fff';
                ctx.font = `bold ${Math.max(14, img.naturalWidth / 100)}px Inter, sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText(`P${i + 1}`, p.x, p.y - Math.max(14, img.naturalWidth / 100));
            }
        });
        if (scaleCalPoints.length === 2) {
            ctx.beginPath();
            ctx.moveTo(scaleCalPoints[0].x, scaleCalPoints[0].y);
            ctx.lineTo(scaleCalPoints[1].x, scaleCalPoints[1].y);
            ctx.strokeStyle = '#00ff64';
            ctx.lineWidth = Math.max(3, img.naturalWidth / 500);
            ctx.setLineDash([8, 6]);
            ctx.stroke();
            ctx.setLineDash([]);
            const distPx = Math.hypot(scaleCalPoints[1].x - scaleCalPoints[0].x, scaleCalPoints[1].y - scaleCalPoints[0].y);
            const mx = (scaleCalPoints[0].x + scaleCalPoints[1].x) / 2;
            const my = (scaleCalPoints[0].y + scaleCalPoints[1].y) / 2;
            if (showLabels) {
                const fs = Math.max(14, img.naturalWidth / 100);
                ctx.fillStyle = 'rgba(0,0,0,0.75)';
                ctx.fillRect(mx - fs * 4, my - fs * 1.6, fs * 8, fs * 1.8);
                ctx.fillStyle = '#00ff64';
                ctx.font = `bold ${fs}px monospace`;
                ctx.textAlign = 'center';
                ctx.fillText(`${distPx.toFixed(1)} px`, mx, my - 2);
            }
        }
        // Also draw measurePoints if measurement is active on uploaded image
        if (measureActive && measurePoints.length > 0) {
            const r = Math.max(4, img.naturalWidth / 400);
            const fs2 = Math.max(11, img.naturalWidth / 140);
            const lw = Math.max(2, img.naturalWidth / 600);
            const fs3 = Math.max(12, img.naturalWidth / 120);

            if (measureMode === 'punto') {
                // ── PUNTO mode: 2 points, 1 segment ──
                measurePoints.forEach((p, i) => {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                    ctx.fillStyle = i === 0 ? '#1f6feb' : '#ff6b35';
                    ctx.fill();
                    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
                });
                if (measurePoints.length === 2) {
                    const [p1, p2] = measurePoints;
                    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = '#1f6feb'; ctx.lineWidth = lw;
                    ctx.setLineDash([8, 5]); ctx.stroke(); ctx.setLineDash([]);
                    const dPx = Math.hypot(p2.x - p1.x, p2.y - p1.y);
                    const smx = (p1.x + p2.x) / 2, smy = (p1.y + p2.y) / 2;
                    const mmVal = scaleCalMmPerPx > 0 ? dPx * scaleCalMmPerPx : 0;
                    if (showLabels) {
                        const boxH = mmVal > 0 ? fs3 * 2.6 : fs3 * 1.5;
                        ctx.fillStyle = 'rgba(0,0,0,0.8)';
                        const labelW = fs3 * 7;
                        ctx.fillRect(smx - labelW / 2, smy + 6, labelW, boxH);
                        ctx.fillStyle = '#1f6feb'; ctx.font = `bold ${fs3}px monospace`; ctx.textAlign = 'center';
                        ctx.fillText(`${dPx.toFixed(1)} px`, smx, smy + 6 + fs3 * 1.1);
                        if (mmVal > 0) { ctx.fillStyle = '#00ff64'; ctx.fillText(`${mmVal.toFixed(2)} mm`, smx, smy + 6 + fs3 * 2.2); }
                    }
                }
            } else {
                // ── SEGMENTOS mode: 4 points = 2 segments, distance between them ──
                const colors = ['#1f6feb', '#1f6feb', '#ff6b35', '#ff6b35'];
                measurePoints.forEach((p, i) => {
                    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                    ctx.fillStyle = colors[i] || '#ff6b35'; ctx.fill();
                    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
                });
                // Segment A (points 0-1)
                if (measurePoints.length >= 2) {
                    const [a1, a2] = [measurePoints[0], measurePoints[1]];
                    ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(a2.x, a2.y);
                    ctx.strokeStyle = '#1f6feb'; ctx.lineWidth = lw;
                    ctx.setLineDash([8, 5]); ctx.stroke(); ctx.setLineDash([]);
                    const midAx = (a1.x + a2.x) / 2, midAy = (a1.y + a2.y) / 2;
                    if (showLabels) {
                        ctx.fillStyle = '#1f6feb'; ctx.font = `bold ${fs2}px monospace`;
                        ctx.textAlign = 'center';
                        ctx.fillText('A', midAx, midAy - fs2 * 0.8);
                    }
                }
                // Segment B (points 2-3)
                if (measurePoints.length >= 4) {
                    const [b1, b2] = [measurePoints[2], measurePoints[3]];
                    ctx.beginPath(); ctx.moveTo(b1.x, b1.y); ctx.lineTo(b2.x, b2.y);
                    ctx.strokeStyle = '#ff6b35'; ctx.lineWidth = lw;
                    ctx.setLineDash([8, 5]); ctx.stroke(); ctx.setLineDash([]);
                    const midBx = (b1.x + b2.x) / 2, midBy = (b1.y + b2.y) / 2;
                    if (showLabels) {
                        ctx.fillStyle = '#ff6b35'; ctx.font = `bold ${fs2}px monospace`;
                        ctx.textAlign = 'center';
                        ctx.fillText('B', midBx, midBy - fs2 * 0.8);
                    }

                    // Distance between midpoints of A and B
                    const [a1, a2] = [measurePoints[0], measurePoints[1]];
                    const midAx = (a1.x + a2.x) / 2, midAy = (a1.y + a2.y) / 2;
                    const distPx = Math.hypot(midBx - midAx, midBy - midAy);
                    const mmVal = scaleCalMmPerPx > 0 ? distPx * scaleCalMmPerPx : 0;

                    // Connector line between midpoints
                    ctx.beginPath(); ctx.moveTo(midAx, midAy); ctx.lineTo(midBx, midBy);
                    ctx.strokeStyle = '#00ff64'; ctx.lineWidth = lw;
                    ctx.setLineDash([6, 4]); ctx.stroke(); ctx.setLineDash([]);

                    // Label
                    const lx = (midAx + midBx) / 2, ly = (midAy + midBy) / 2;
                    if (showLabels) {
                        const boxH = mmVal > 0 ? fs3 * 2.8 : fs3 * 1.5;
                        const labelW = fs3 * 8;
                        ctx.fillStyle = 'rgba(0,0,0,0.85)';
                        ctx.fillRect(lx - labelW / 2, ly - boxH / 2, labelW, boxH);
                        ctx.fillStyle = '#00ff64'; ctx.font = `bold ${fs3 * 1.1}px monospace`; ctx.textAlign = 'center';
                        ctx.fillText(`${distPx.toFixed(1)} px`, lx, ly - (mmVal > 0 ? fs3 * 0.3 : 0) + fs3 * 0.3);
                        if (mmVal > 0) { ctx.fillText(`${mmVal.toFixed(2)} mm`, lx, ly + fs3 * 1.1); }
                    }
                }
            }
        }
        // ── Draw Track highlights ──
        const drawTrackPiece = (piece: TrackPiece, label: string, highlightColor: string) => {
            const det = piece.det;
            let dx = det.x, dy = det.y, dw = det.width, dh = det.height;
            const isNorm = (dx > 0 && dx <= 1.1) && (dw > 0 && dw <= 1.1);
            if (isNorm) { dx *= img.naturalWidth; dy *= img.naturalHeight; dw *= img.naturalWidth; dh *= img.naturalHeight; }
            const bx = dx - dw / 2, by = dy - dh / 2;
            // Bounding box
            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = Math.max(4, img.naturalWidth / 300);
            ctx.setLineDash([10, 5]);
            ctx.strokeRect(bx, by, dw, dh);
            ctx.setLineDash([]);
            // Label
            const fs = Math.max(16, img.naturalWidth / 80);
            ctx.font = `bold ${fs}px Inter, sans-serif`;
            ctx.fillStyle = highlightColor;
            ctx.textAlign = 'center';
            ctx.fillText(label, dx, by - fs * 0.5);

            // Highlight selected edge if arista mode
            if (piece.mode === 'arista' && piece.edge) {
                ctx.strokeStyle = '#FFFF00'; ctx.lineWidth = Math.max(5, img.naturalWidth / 200);
                ctx.setLineDash([]); ctx.beginPath();
                switch (piece.edge) {
                    case 'top': ctx.moveTo(bx, by); ctx.lineTo(bx + dw, by); break;
                    case 'bottom': ctx.moveTo(bx, by + dh); ctx.lineTo(bx + dw, by + dh); break;
                    case 'left': ctx.moveTo(bx, by); ctx.lineTo(bx, by + dh); break;
                    case 'right': ctx.moveTo(bx + dw, by); ctx.lineTo(bx + dw, by + dh); break;
                }
                ctx.stroke();
            }

            // Draw the measurement point
            const px = piece.point.x, py = piece.point.y;
            ctx.beginPath();
            ctx.arc(px, py, Math.max(6, img.naturalWidth / 250), 0, Math.PI * 2);
            ctx.fillStyle = highlightColor; ctx.fill();
            ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();

            return piece.point;
        };

        // ── Draw ALL saved measurements from trackSpecs (persistent overlays) ──
        for (let si = 0; si < trackSpecs.length; si++) {
            const sp = trackSpecs[si] as any;
            if (!sp.centerA || !sp.centerB) continue;
            const sA = sp.centerA;
            const sB = sp.centerB;
            const sDxPx = Math.abs(sB.x - sA.x);
            const sDyPx = Math.abs(sB.y - sA.y);
            const sDistPx = Math.hypot(sDxPx, sDyPx);
            const sDxMm = (sp.mmPerPx || scaleCalMmPerPx) > 0 ? sDxPx * (sp.mmPerPx || scaleCalMmPerPx) : 0;
            const sDyMm = (sp.mmPerPx || scaleCalMmPerPx) > 0 ? sDyPx * (sp.mmPerPx || scaleCalMmPerPx) : 0;
            const sDistMm = (sp.mmPerPx || scaleCalMmPerPx) > 0 ? sDistPx * (sp.mmPerPx || scaleCalMmPerPx) : 0;
            const slw = Math.max(2, img.naturalWidth / 500);
            const sfs = Math.max(12, img.naturalWidth / 90);

            // Points A and B
            const dotR = Math.max(5, img.naturalWidth / 300);
            ctx.beginPath(); ctx.arc(sA.x, sA.y, dotR, 0, Math.PI * 2);
            ctx.fillStyle = '#00FFFF80'; ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke();
            ctx.beginPath(); ctx.arc(sB.x, sB.y, dotR, 0, Math.PI * 2);
            ctx.fillStyle = '#FF00FF80'; ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke();

            // Connecting line
            ctx.beginPath(); ctx.moveTo(sA.x, sA.y); ctx.lineTo(sB.x, sB.y);
            ctx.strokeStyle = '#FFFF0090'; ctx.lineWidth = slw;
            ctx.setLineDash([6, 4]); ctx.stroke(); ctx.setLineDash([]);

            // X guide
            ctx.beginPath(); ctx.moveTo(sA.x, sA.y); ctx.lineTo(sB.x, sA.y);
            ctx.strokeStyle = '#FF660070'; ctx.lineWidth = slw * 0.7;
            ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);

            // Y guide
            ctx.beginPath(); ctx.moveTo(sB.x, sA.y); ctx.lineTo(sB.x, sB.y);
            ctx.strokeStyle = '#00FF6670'; ctx.lineWidth = slw * 0.7;
            ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);

            // Total label
            const tX = (sA.x + sB.x) / 2;
            const tY = (sA.y + sB.y) / 2;
            const tTxt = sDistMm > 0 ? `#${si + 1}: ${sDistMm.toFixed(2)} mm` : `#${si + 1}: ${sDistPx.toFixed(1)} px`;
            ctx.font = `bold ${sfs}px Inter, sans-serif`; ctx.textAlign = 'center';
            const sTw = ctx.measureText(tTxt).width;
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(tX - sTw / 2 - 6, tY - sfs / 2 - 4, sTw + 12, sfs + 8);
            ctx.fillStyle = '#FFFF00CC'; ctx.fillText(tTxt, tX, tY + sfs * 0.35);
        }

        // ── Draw current A/B selection (active pair being defined) ──
        let trackCenterA: { x: number, y: number } | null = null;
        let trackCenterB: { x: number, y: number } | null = null;
        if (trackPieceA) trackCenterA = drawTrackPiece(trackPieceA, `A: ${trackPieceA.det.class || 'Obj'}`, '#00FFFF');
        if (trackPieceB) trackCenterB = drawTrackPiece(trackPieceB, `B: ${trackPieceB.det.class || 'Obj'}`, '#FF00FF');

        if (trackCenterA && trackCenterB) {
            const dxPx = Math.abs(trackCenterB.x - trackCenterA.x);
            const dyPx = Math.abs(trackCenterB.y - trackCenterA.y);
            const distPx = Math.hypot(dxPx, dyPx);
            const dxMm = scaleCalMmPerPx > 0 ? dxPx * scaleCalMmPerPx : 0;
            const dyMm = scaleCalMmPerPx > 0 ? dyPx * scaleCalMmPerPx : 0;
            const distMm = scaleCalMmPerPx > 0 ? distPx * scaleCalMmPerPx : 0;
            const lw = Math.max(3, img.naturalWidth / 400);
            const fs = Math.max(16, img.naturalWidth / 70);

            // Connecting line (diagonal)
            ctx.beginPath(); ctx.moveTo(trackCenterA.x, trackCenterA.y); ctx.lineTo(trackCenterB.x, trackCenterB.y);
            ctx.strokeStyle = '#FFFF00'; ctx.lineWidth = lw;
            ctx.setLineDash([8, 5]); ctx.stroke(); ctx.setLineDash([]);

            // X guide line (horizontal)
            ctx.beginPath(); ctx.moveTo(trackCenterA.x, trackCenterA.y); ctx.lineTo(trackCenterB.x, trackCenterA.y);
            ctx.strokeStyle = '#FF6600'; ctx.lineWidth = lw * 0.7;
            ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);

            // Y guide line (vertical)
            ctx.beginPath(); ctx.moveTo(trackCenterB.x, trackCenterA.y); ctx.lineTo(trackCenterB.x, trackCenterB.y);
            ctx.strokeStyle = '#00FF66'; ctx.lineWidth = lw * 0.7;
            ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);

            // X label (draggable)
            const ofsX = dimLabelOffsets.current.x;
            const xLabelX = (trackCenterA.x + trackCenterB.x) / 2 + ofsX.dx;
            const xLabelY = trackCenterA.y - fs * 0.8 + ofsX.dy;
            const xText = dxMm > 0 ? `X: ${dxMm.toFixed(2)} mm` : `X: ${dxPx.toFixed(1)} px`;
            ctx.font = `bold ${fs * 0.85}px Inter, sans-serif`; ctx.textAlign = 'center';
            const xTw = ctx.measureText(xText).width;
            const xRectX = xLabelX - xTw / 2 - 6, xRectY = xLabelY - fs * 0.4, xRectW = xTw + 12, xRectH = fs * 0.9;
            ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(xRectX, xRectY, xRectW, xRectH);
            ctx.fillStyle = '#FF6600'; ctx.fillText(xText, xLabelX, xLabelY + fs * 0.25);

            // Y label (draggable)
            const ofsY = dimLabelOffsets.current.y;
            const yLabelX = trackCenterB.x + fs * 0.6 + ofsY.dx;
            const yLabelY = (trackCenterA.y + trackCenterB.y) / 2 + ofsY.dy;
            const yText = dyMm > 0 ? `Y: ${dyMm.toFixed(2)} mm` : `Y: ${dyPx.toFixed(1)} px`;
            const yTw = ctx.measureText(yText).width;
            const yRectX = yLabelX - 6, yRectY2 = yLabelY - fs * 0.4, yRectW = yTw + 12, yRectH = fs * 0.9;
            ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(yRectX, yRectY2, yRectW, yRectH);
            ctx.fillStyle = '#00FF66'; ctx.fillText(yText, yLabelX + yTw / 2, yLabelY + fs * 0.25);
            ctx.textAlign = 'center';

            // Total distance label (draggable)
            const ofsT = dimLabelOffsets.current.total;
            const tLabelX = (trackCenterA.x + trackCenterB.x) / 2 + ofsT.dx;
            const tLabelY = (trackCenterA.y + trackCenterB.y) / 2 + ofsT.dy;
            const totalText = distMm > 0 ? `${distPx.toFixed(1)} px = ${distMm.toFixed(2)} mm` : `${distPx.toFixed(1)} px`;
            ctx.font = `bold ${fs}px Inter, sans-serif`;
            const tw = ctx.measureText(totalText).width;
            const tRectX = tLabelX - tw / 2 - 10, tRectY = tLabelY - fs / 2 - 6, tRectW = tw + 20, tRectH = fs + 12;
            ctx.fillStyle = 'rgba(0,0,0,0.85)';
            ctx.fillRect(tRectX, tRectY, tRectW, tRectH);
            ctx.fillStyle = '#FFFF00'; ctx.fillText(totalText, tLabelX, tLabelY + fs * 0.35);

            // Store hit rects for drag detection (in image coordinates)
            dimLabelRects.current = {
                x: { x: xRectX, y: xRectY, w: xRectW, h: xRectH },
                y: { x: yRectX, y: yRectY2, w: yRectW, h: yRectH },
                total: { x: tRectX, y: tRectY, w: tRectW, h: tRectH },
            };
        }

        ctx.restore();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { redrawScaleCalCanvas(); }, [scaleCalImageSrc, scaleCalPoints, measurePoints, measureActive, calZoom, calPan, showLabels, calDetections, calShowDetectionLabels, trackPieceA, trackPieceB, calHiddenDetections, calSelectedDetIdx, trackSpecs]);

    // Analyze calibration image with Roboflow
    const analyzeCalImage = async () => {
        if (!scaleCalImageSrc) { log('error', 'No hay imagen para analizar'); return; }
        setCalAnalyzing(true);
        try {
            const res = await fetch('http://127.0.0.1:8765/api/measure/roboflow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: scaleCalImageSrc }),
            });
            const data = await res.json();
            if (!data.ok) throw new Error(data.error);
            const preds: any[] = Array.isArray(data.predictions) ? data.predictions : [];
            
            // Ajustar el recuadro (bounding box) para que coincida exactamente con el segmento (points)
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

            setCalDetections(preds);
            setCalHiddenDetections(new Set());
            setCalSelectedDetIdx(null);
            log('success', `Roboflow: ${preds.length} detecciones`);
        } catch (err: any) {
            console.error('[CAL Roboflow]', err);
            log('error', `Error Roboflow: ${err.message}`);
        } finally {
            setCalAnalyzing(false);
        }
    };

    // Redraw when returning to calibration tab
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (activeTab === 'calibration' && scaleCalImageSrc && scaleCalImageRef.current) {
            requestAnimationFrame(() => { requestAnimationFrame(() => { redrawScaleCalCanvas(); }); });
        }
    }, [activeTab]);

    const handleScaleCalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCalZoom(1); setCalPan({ x: 0, y: 0 });
        
        // Refrescar el análisis y tracks viejos
        setCalDetections([]);
        setCalSelectedDetIdx(null);
        setTrackPieceA(null);
        setTrackPieceB(null);
        setMeasurePoints([]);
        setTrackSpecs([]);
        localStorage.removeItem('trackSpecs');
        
        const reader = new FileReader();
        reader.onload = (ev) => {
            const src = ev.target?.result as string;
            // Load the image FIRST, then set state so canvas is rendered
            const img = new Image();
            img.onload = () => {
                scaleCalImageRef.current = img;
                setScaleCalPoints([]);
                setScaleCalImageSrc(src);
                // Wait for React to render the canvas, then draw
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        redrawScaleCalCanvas();
                    });
                });
            };
            img.src = src;
        };
        reader.readAsDataURL(file);
    };

    // Helper: convert screen event to image coordinates
    const screenToImageCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = scaleCalCanvasRef.current;
        const img = scaleCalImageRef.current;
        if (!canvas || !img) return null;
        const rect = canvas.getBoundingClientRect();
        const canvasScaleX = img.naturalWidth / rect.width;
        const canvasScaleY = img.naturalHeight / rect.height;
        const canvasX = (e.clientX - rect.left) * canvasScaleX;
        const canvasY = (e.clientY - rect.top) * canvasScaleY;
        return { x: (canvasX - calPan.x) / calZoom, y: (canvasY - calPan.y) / calZoom };
    };

    // Find if mouse is near an existing point (within threshold px in image space)
    const findNearPoint = (imgX: number, imgY: number, threshold = 15) => {
        for (let i = 0; i < measurePoints.length; i++) {
            const d = Math.hypot(measurePoints[i].x - imgX, measurePoints[i].y - imgY);
            if (d < threshold / calZoom) return i;
        }
        return -1;
    };

    // Find which detection is at a given image coordinate (returns detection + index)
    const findDetectionAtPoint = (imgX: number, imgY: number): { det: any; idx: number } | null => {
        const img = scaleCalImageRef.current;
        if (!img) return null;
        // Iterate in reverse so that top-drawn (later) detections are matched first
        for (let i = calDetections.length - 1; i >= 0; i--) {
            if (calHiddenDetections.has(i)) continue; // skip hidden
            const det = calDetections[i];
            let dx = det.x, dy = det.y, dw = det.width, dh = det.height;
            const isNorm = (dx > 0 && dx <= 1.1) && (dw > 0 && dw <= 1.1);
            if (isNorm) { dx *= img.naturalWidth; dy *= img.naturalHeight; dw *= img.naturalWidth; dh *= img.naturalHeight; }
            const left = dx - dw / 2, top = dy - dh / 2;
            // Also check the label area above the bounding box
            const fs = Math.max(14, img.naturalWidth / 100);
            const labelTop = top - fs - 8;
            if (imgX >= left && imgX <= left + dw && imgY >= labelTop && imgY <= top + dh) return { det, idx: i };
        }
        return null;
    };

    const handleScaleCalCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        // Block all click actions when moving dimension labels
        if (moveDimLabels) return;
        // Track mode: select pieces
        if (trackMode && calDetections.length > 0) {
            const coords = screenToImageCoords(e);
            if (!coords) return;
            const found = findDetectionAtPoint(coords.x, coords.y);
            if (!found) return;
            const det = found.det;

            const imgEl = scaleCalImageRef.current;
            if (!imgEl) return;

            // Resolve detection bbox in image pixels
            let dx = det.x, dy = det.y, dw = det.width, dh = det.height;
            const isNorm = (dx > 0 && dx <= 1.1) && (dw > 0 && dw <= 1.1);
            if (isNorm) { dx *= imgEl.naturalWidth; dy *= imgEl.naturalHeight; dw *= imgEl.naturalWidth; dh *= imgEl.naturalHeight; }
            const bx = dx - dw / 2, by = dy - dh / 2;

            let point: { x: number; y: number };
            let edgeName: 'top' | 'bottom' | 'left' | 'right' | undefined;

            if (trackPointMode === 'arista') {
                // Find closest edge to click
                const distances = [
                    { edge: 'top' as const, d: Math.abs(coords.y - by), pt: { x: bx + dw / 2, y: by } },
                    { edge: 'bottom' as const, d: Math.abs(coords.y - (by + dh)), pt: { x: bx + dw / 2, y: by + dh } },
                    { edge: 'left' as const, d: Math.abs(coords.x - bx), pt: { x: bx, y: by + dh / 2 } },
                    { edge: 'right' as const, d: Math.abs(coords.x - (bx + dw)), pt: { x: bx + dw, y: by + dh / 2 } },
                ];
                distances.sort((a, b) => a.d - b.d);
                edgeName = distances[0].edge;
                point = distances[0].pt;
            } else {
                // Centro mode
                point = { x: dx, y: dy };
            }

            const piece: TrackPiece = { det, point, mode: trackPointMode, edge: edgeName };

            if (!trackPieceA) {
                setTrackPieceA(piece);
                log('info', `Track pieza A: ${det.class || 'Obj'} (${trackPointMode}${edgeName ? ' ' + edgeName : ''})`);
            } else if (!trackPieceB) {
                setTrackPieceB(piece);
                log('info', `Track pieza B: ${det.class || 'Obj'} (${trackPointMode}${edgeName ? ' ' + edgeName : ''})`);
            } else {
                setTrackPieceA(piece);
                setTrackPieceB(null);
                log('info', `Track reiniciado. Pieza A: ${det.class || 'Obj'}`);
            }
            return;
        }

        // Click on detection to select/deselect it (when not in track mode or measure mode)
        if (!measureActive && calDetections.length > 0) {
            const coords2 = screenToImageCoords(e);
            if (coords2) {
                const found = findDetectionAtPoint(coords2.x, coords2.y);
                if (found) {
                    setCalSelectedDetIdx(prev => prev === found.idx ? null : found.idx);
                    return;
                } else {
                    // Click on empty area: deselect
                    setCalSelectedDetIdx(null);
                }
            }
            return;
        }
        if (!measureActive) return;
        if (calDragging.current) return;
        if (wasDraggingPoint.current) { wasDraggingPoint.current = false; return; }
        const coords = screenToImageCoords(e);
        if (!coords) return;
        const { x, y } = coords;
        if (findNearPoint(x, y) >= 0) return;
        if (measureMode === 'punto') {
            setMeasurePoints(prev => prev.length >= 2 ? [{ x, y }] : [...prev, { x, y }]);
        } else {
            setMeasurePoints(prev => prev.length >= 4 ? [{ x, y }] : [...prev, { x, y }]);
        }
    };

    // ── Add a single measurement to the in-memory list (no disk I/O) ──
    const addMeasurement = () => {
        if (!trackPieceA || !trackPieceB) return;
        const cA = trackPieceA.point;
        const cB = trackPieceB.point;
        const dxPx = Math.abs(cB.x - cA.x);
        const dyPx = Math.abs(cB.y - cA.y);
        const distPx = Math.hypot(dxPx, dyPx);
        const dxMm = scaleCalMmPerPx > 0 ? dxPx * scaleCalMmPerPx : 0;
        const dyMm = scaleCalMmPerPx > 0 ? dyPx * scaleCalMmPerPx : 0;
        const distMm = scaleCalMmPerPx > 0 ? distPx * scaleCalMmPerPx : 0;
        const newSpec = {
            classA: trackPieceA.det.class || 'Obj',
            classB: trackPieceB.det.class || 'Obj',
            distanceMm: distMm, distanceXMm: dxMm, distanceYMm: dyMm,
            distancePx: distPx, distanceXPx: dxPx, distanceYPx: dyPx,
            mmPerPx: scaleCalMmPerPx, centerA: cA, centerB: cB,
            pieceAMode: trackPieceA.mode, pieceAEdge: trackPieceA.edge,
            pieceBMode: trackPieceB.mode, pieceBEdge: trackPieceB.edge,
            savedAt: new Date().toISOString(),
        };
        setTrackSpecs(prev => {
            const next = [...prev, newSpec];
            localStorage.setItem('trackSpecs', JSON.stringify(next));
            return next;
        });
        log('info', `Medida añadida: ${newSpec.classA} ↔ ${newSpec.classB} = ${distMm.toFixed(2)} mm`);
    };

    // ── Save ALL measurements + image to disk ──
    const saveTrackSpecification = async () => {
        // Auto-add the currently selected points if they haven't been added yet
        let currentArray = trackSpecs;
        if (trackPieceA && trackPieceB) {
            const newSpec = {
                classA: trackPieceA.det.class || 'Obj',
                classB: trackPieceB.det.class || 'Obj',
                distanceMm: scaleCalMmPerPx > 0 ? Math.hypot(Math.abs(trackPieceB.point.x - trackPieceA.point.x), Math.abs(trackPieceB.point.y - trackPieceA.point.y)) * scaleCalMmPerPx : 0,
                distanceXMm: scaleCalMmPerPx > 0 ? Math.abs(trackPieceB.point.x - trackPieceA.point.x) * scaleCalMmPerPx : 0,
                distanceYMm: scaleCalMmPerPx > 0 ? Math.abs(trackPieceB.point.y - trackPieceA.point.y) * scaleCalMmPerPx : 0,
                distancePx: Math.hypot(Math.abs(trackPieceB.point.x - trackPieceA.point.x), Math.abs(trackPieceB.point.y - trackPieceA.point.y)),
                distanceXPx: Math.abs(trackPieceB.point.x - trackPieceA.point.x),
                distanceYPx: Math.abs(trackPieceB.point.y - trackPieceA.point.y),
                mmPerPx: scaleCalMmPerPx, centerA: trackPieceA.point, centerB: trackPieceB.point,
                pieceAMode: trackPieceA.mode, pieceAEdge: trackPieceA.edge,
                pieceBMode: trackPieceB.mode, pieceBEdge: trackPieceB.edge,
                savedAt: new Date().toISOString(),
            };
            // Check if this exact spec is already the last one, to avoid duplicates
            const last = currentArray[currentArray.length - 1];
            if (!last || last.centerA.x !== newSpec.centerA.x || last.centerB.x !== newSpec.centerB.x) {
                currentArray = [...currentArray, newSpec];
                setTrackSpecs(currentArray);
                localStorage.setItem('trackSpecs', JSON.stringify(currentArray));
                log('info', `Medida actual auto-añadida antes de guardar`);
            }
        }

        if (currentArray.length === 0) { alert('No hay medidas para guardar. Selecciona al menos dos puntos o añade una medida.'); return; }
        const img = scaleCalImageRef.current;
        if (!img) return;

        // Save image and JSON to disk
        const saveDir = 'C:\\Users\\franj\\OneDrive\\Escritorio\\COSAS  FRAN\\PROYECTOS\\PINTURA\\CALIBRACION\\ESPECIFICACION TRACK';
        let imageToSave: string | null = null;
        if (scaleCalCanvasRef.current) {
            try { imageToSave = scaleCalCanvasRef.current.toDataURL('image/png'); } catch { /* */ }
        }
        if (!imageToSave && scaleCalImageSrc) imageToSave = scaleCalImageSrc;
        if (!imageToSave) { alert('No hay imagen'); return; }

        try {
            // Read active tolerances from localStorage
            const savedTol = localStorage.getItem('trackTolerances');
            const tolerances: Array<{ className: string; enabled: boolean }> = savedTol ? JSON.parse(savedTol) : [];
            const activeLabels = tolerances.filter(t => t.enabled).map(t => t.className.trim());

            console.log('[TRACK SAVE] Active tolerance labels:', activeLabels);
            console.log('[TRACK SAVE] All detections:', calDetections.map((d: any) => d.class));

            // Find which active tolerance labels are present in the image detections
            const matchedLabels: string[] = [];
            for (const label of activeLabels) {
                const found = calDetections.some((d: any) =>
                    (d.class || '').trim().toLowerCase() === label.toLowerCase()
                );
                if (found) matchedLabels.push(label);
            }

            console.log('[TRACK SAVE] Matched active labels in image:', matchedLabels);

            // Build filename: use matched active labels, fallback to track piece classes
            const fileLabel = matchedLabels.length > 0
                ? matchedLabels.map(l => l.replace(/[^a-zA-Z0-9_-]/g, '_')).join('_')
                : currentArray.map((s: any) => `${(s.classA || 'A').replace(/[^a-zA-Z0-9_-]/g, '_')}_${(s.classB || 'B').replace(/[^a-zA-Z0-9_-]/g, '_')}`).join('_');
            const ts = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15);
            const imgFilename = `track_${fileLabel}_${ts}.png`;
            const specFilename = `track_spec_${fileLabel}.json`;
            console.log('[TRACK SAVE] Image filename:', imgFilename);

            // Save image
            const resImg = await fetch('http://127.0.0.1:8765/api/save-calibration-image', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageToSave, directory: saveDir, mmPerPx: scaleCalMmPerPx, filename: imgFilename }),
            });
            const dataImg = await resImg.json();

            // Save JSON spec (all measurements)
            const allSpecs = currentArray.map((s: any) => ({
                ...s,
                matchedToleranceLabels: matchedLabels,
            }));
            await fetch('http://127.0.0.1:8765/api/save-calibration-image', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: 'data:application/json;base64,' + btoa(JSON.stringify(allSpecs, null, 2)),
                    directory: saveDir,
                    mmPerPx: 0,
                    filename: specFilename,
                }),
            });

            if (dataImg.ok) {
                log('success', `Track guardado: ${dataImg.path}`);

                // Update tolerance measuredValue with X distance for matched classes
                if (matchedLabels.length > 0) {
                    const savedTolUpdate = localStorage.getItem('trackTolerances');
                    if (savedTolUpdate) {
                        const tolArr = JSON.parse(savedTolUpdate);
                        let updated = false;
                        for (const tol of tolArr) {
                            if (!matchedLabels.some(ml => ml.toLowerCase() === tol.className.trim().toLowerCase())) continue;
                            
                            // Find the measurement touching this class (either A or B)
                            const matchingSpec = currentArray.find((s: any) => 
                                s.classA?.toLowerCase() === tol.className.trim().toLowerCase() ||
                                s.classB?.toLowerCase() === tol.className.trim().toLowerCase()
                            );
                            if (matchingSpec) {
                                tol.measuredValue = parseFloat((matchingSpec.distanceXMm || 0).toFixed(2));
                                updated = true;
                            }
                        }
                        if (updated) {
                            localStorage.setItem('trackTolerances', JSON.stringify(tolArr));
                        }
                    }
                }

                // Desmarcar pieza actual (limpiar selección) después de guardado exitoso para forzar nuevo inicio de pieza
                setTrackPieceA(null);
                setTrackPieceB(null);

                const summary = currentArray.map((s: any, i: number) =>
                    `  #${i + 1}: ${s.classA} ↔ ${s.classB} = ${s.distanceMm?.toFixed(2)} mm`
                ).join('\n');
                alert(`✅ Track guardado con ${currentArray.length} medida(s).\n\n${summary}\n\nImagen: ${dataImg.path}`);
            } else {
                alert(`❌ Error: ${dataImg.error}`);
            }
        } catch (err: any) {
            alert(`❌ Error de conexión: ${err.message}`);
        }
    };


    // Zoom with mouse wheel (only when zoom mode active)
    const handleCalCanvasWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        if (!calZoomMode) return;
        const canvas = scaleCalCanvasRef.current;
        const img = scaleCalImageRef.current;
        if (!canvas || !img) return;
        const rect = canvas.getBoundingClientRect();
        const canvasScaleX = img.naturalWidth / rect.width;
        const canvasScaleY = img.naturalHeight / rect.height;
        const mouseX = (e.clientX - rect.left) * canvasScaleX;
        const mouseY = (e.clientY - rect.top) * canvasScaleY;
        const delta = e.deltaY < 0 ? 1.15 : 1 / 1.15;
        const newZoom = Math.max(0.2, Math.min(20, calZoom * delta));
        const newPanX = mouseX - (mouseX - calPan.x) * (newZoom / calZoom);
        const newPanY = mouseY - (mouseY - calPan.y) * (newZoom / calZoom);
        setCalZoom(newZoom);
        setCalPan({ x: newPanX, y: newPanY });
    };

    // Mouse down: start dragging a point OR start panning
    const handleCalCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        // Check for dimension label dragging first (only when mode active)
        if (moveDimLabels && e.button === 0 && dimLabelRects.current) {
            const coords = screenToImageCoords(e);
            if (coords) {
                const rects = dimLabelRects.current;
                for (const key of ['x', 'y', 'total'] as const) {
                    const r = rects[key];
                    if (coords.x >= r.x && coords.x <= r.x + r.w && coords.y >= r.y && coords.y <= r.y + r.h) {
                        e.preventDefault();
                        dragDimLabel.current = {
                            which: key,
                            startMouse: { x: coords.x, y: coords.y },
                            startOffset: { ...dimLabelOffsets.current[key] },
                        };
                        return;
                    }
                }
            }
        }
        // Check for track point dragging
        if (e.button === 0 && (trackPieceA || trackPieceB)) {
            const coords = screenToImageCoords(e);
            if (coords) {
                const threshold = 20 / calZoom;
                if (trackPieceA && Math.hypot(coords.x - trackPieceA.point.x, coords.y - trackPieceA.point.y) < threshold) {
                    e.preventDefault();
                    dragTrackPoint.current = 'A';
                    return;
                }
                if (trackPieceB && Math.hypot(coords.x - trackPieceB.point.x, coords.y - trackPieceB.point.y) < threshold) {
                    e.preventDefault();
                    dragTrackPoint.current = 'B';
                    return;
                }
            }
        }
        // Check for point dragging first (when measuring is active)
        if (measureActive && e.button === 0 && measurePoints.length > 0) {
            const coords = screenToImageCoords(e);
            if (coords) {
                const idx = findNearPoint(coords.x, coords.y);
                if (idx >= 0) {
                    e.preventDefault();
                    dragPointIdx.current = idx;
                    return;
                }
            }
        }
        // Pan mode
        if (!calPanMode) return;
        e.preventDefault();
        calDragging.current = { startX: e.clientX, startY: e.clientY, panX: calPan.x, panY: calPan.y };
    };

    const handleCalCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        // Dragging a dimension label
        if (dragDimLabel.current) {
            const coords = screenToImageCoords(e);
            if (coords) {
                const d = dragDimLabel.current;
                dimLabelOffsets.current[d.which] = {
                    dx: d.startOffset.dx + (coords.x - d.startMouse.x),
                    dy: d.startOffset.dy + (coords.y - d.startMouse.y),
                };
                redrawScaleCalCanvas();
            }
            return;
        }
        // Dragging a track point
        if (dragTrackPoint.current !== null) {
            const coords = screenToImageCoords(e);
            if (coords) {
                if (dragTrackPoint.current === 'A' && trackPieceA) {
                    setTrackPieceA({ ...trackPieceA, point: { x: coords.x, y: coords.y }, mode: 'arista', edge: undefined });
                } else if (dragTrackPoint.current === 'B' && trackPieceB) {
                    setTrackPieceB({ ...trackPieceB, point: { x: coords.x, y: coords.y }, mode: 'arista', edge: undefined });
                }
            }
            return;
        }
        // Dragging a measurement point
        if (dragPointIdx.current !== null) {
            const coords = screenToImageCoords(e);
            if (coords) {
                setMeasurePoints(prev => {
                    const updated = [...prev];
                    updated[dragPointIdx.current!] = { x: coords.x, y: coords.y };
                    return updated;
                });
            }
            return;
        }
        // Panning
        if (!calDragging.current) return;
        const canvas = scaleCalCanvasRef.current;
        const img = scaleCalImageRef.current;
        if (!canvas || !img) return;
        const rect = canvas.getBoundingClientRect();
        const canvasScaleX = img.naturalWidth / rect.width;
        const canvasScaleY = img.naturalHeight / rect.height;
        const dx = (e.clientX - calDragging.current.startX) * canvasScaleX;
        const dy = (e.clientY - calDragging.current.startY) * canvasScaleY;
        setCalPan({ x: calDragging.current.panX + dx, y: calDragging.current.panY + dy });
    };

    // Snap point to nearest detection edge
    const snapToDetectionEdge = (pt: { x: number; y: number }, snapThreshold: number): { point: { x: number; y: number }; edge: 'top' | 'bottom' | 'left' | 'right'; det: any } | null => {
        const imgEl = scaleCalImageRef.current;
        if (!imgEl) return null;
        let best: { point: { x: number; y: number }; edge: 'top' | 'bottom' | 'left' | 'right'; det: any; dist: number } | null = null;

        for (const det of calDetections) {
            let dx2 = det.x, dy2 = det.y, dw2 = det.width, dh2 = det.height;
            const isNorm = (dx2 > 0 && dx2 <= 1.1) && (dw2 > 0 && dw2 <= 1.1);
            if (isNorm) { dx2 *= imgEl.naturalWidth; dy2 *= imgEl.naturalHeight; dw2 *= imgEl.naturalWidth; dh2 *= imgEl.naturalHeight; }
            const bx = dx2 - dw2 / 2, by2 = dy2 - dh2 / 2;

            // For each edge, find the closest point ON the edge to the given point
            const edges: Array<{ edge: 'top' | 'bottom' | 'left' | 'right'; closest: { x: number; y: number } }> = [
                { edge: 'top', closest: { x: Math.max(bx, Math.min(bx + dw2, pt.x)), y: by2 } },
                { edge: 'bottom', closest: { x: Math.max(bx, Math.min(bx + dw2, pt.x)), y: by2 + dh2 } },
                { edge: 'left', closest: { x: bx, y: Math.max(by2, Math.min(by2 + dh2, pt.y)) } },
                { edge: 'right', closest: { x: bx + dw2, y: Math.max(by2, Math.min(by2 + dh2, pt.y)) } },
            ];

            for (const e of edges) {
                const d = Math.hypot(e.closest.x - pt.x, e.closest.y - pt.y);
                if (d < snapThreshold && (!best || d < best.dist)) {
                    best = { point: e.closest, edge: e.edge, det, dist: d };
                }
            }
        }
        return best ? { point: best.point, edge: best.edge, det: best.det } : null;
    };

    const handleCalCanvasMouseUp = () => {
        // Stop dragging dimension label
        if (dragDimLabel.current) {
            dragDimLabel.current = null;
            return;
        }
        // Snap track point to nearest detection edge
        if (dragTrackPoint.current !== null) {
            const which = dragTrackPoint.current;
            const piece = which === 'A' ? trackPieceA : trackPieceB;
            if (piece) {
                const snapThreshold = 30 / calZoom;
                const snap = snapToDetectionEdge(piece.point, snapThreshold);
                if (snap) {
                    const updated: TrackPiece = { ...piece, point: snap.point, mode: 'arista', edge: snap.edge, det: snap.det };
                    if (which === 'A') setTrackPieceA(updated);
                    else setTrackPieceB(updated);
                }
            }
            dragTrackPoint.current = null;
            wasDraggingPoint.current = true;
            return;
        }
        if (dragPointIdx.current !== null) {
            wasDraggingPoint.current = true;
            dragPointIdx.current = null;
        }
        calDragging.current = null;
    };

    const saveScaleCalibration = async () => {
        console.log('[CAL SAVE] saveScaleCalibration called', { measurePoints: measurePoints.length, scaleCalRealMm, measureMode });
        if (measurePoints.length < 2 || !scaleCalRealMm || parseFloat(scaleCalRealMm) <= 0) return;
        let distPx = 0;
        if (measureMode === 'punto' && measurePoints.length >= 2) {
            distPx = Math.hypot(measurePoints[1].x - measurePoints[0].x, measurePoints[1].y - measurePoints[0].y);
        } else if (measureMode === 'segmentos' && measurePoints.length >= 4) {
            // Distance between midpoints of the two segments
            const midAx = (measurePoints[0].x + measurePoints[1].x) / 2;
            const midAy = (measurePoints[0].y + measurePoints[1].y) / 2;
            const midBx = (measurePoints[2].x + measurePoints[3].x) / 2;
            const midBy = (measurePoints[2].y + measurePoints[3].y) / 2;
            distPx = Math.hypot(midBx - midAx, midBy - midAy);
        } else {
            return;
        }
        const ratio = parseFloat(scaleCalRealMm) / distPx;
        setScaleCalMmPerPx(ratio);
        localStorage.setItem('calibration_mmPerPx', ratio.toString());
        log('success', `📐 Escala calibrada: ${ratio.toFixed(6)} mm/px (${parseFloat(scaleCalRealMm)} mm = ${distPx.toFixed(1)} px)`);

        // Save canvas image (with drawings) to disk via backend
        let imageToSave: string | null = null;
        if (scaleCalCanvasRef.current) {
            try {
                imageToSave = scaleCalCanvasRef.current.toDataURL('image/png');
            } catch (canvasErr) {
                console.error('[CAL SAVE] canvas.toDataURL failed:', canvasErr);
            }
        }
        if (!imageToSave && scaleCalImageSrc) {
            imageToSave = scaleCalImageSrc;
        }
        const saveDir = calSaveDir || 'C:\\Users\\franj\\OneDrive\\Escritorio\\COSAS  FRAN\\PROYECTOS\\PINTURA\\CALIBRACION';
        if (!imageToSave) {
            log('error', 'No hay imagen para guardar');
            alert('Error: No hay imagen para guardar');
            return;
        }
        try {
            console.log('[CAL SAVE] Sending to backend, image length:', imageToSave.length, 'dir:', saveDir);
            const res = await fetch('http://127.0.0.1:8765/api/save-calibration-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: imageToSave,
                    directory: saveDir,
                    mmPerPx: ratio,
                }),
            });
            const data = await res.json();
            console.log('[CAL SAVE] Response:', data);
            if (data.ok) {
                log('success', `📁 Imagen guardada: ${data.path}`);
                alert(`✅ Imagen guardada en:\n${data.path}`);
            } else {
                log('error', `Error guardando imagen: ${data.error}`);
                alert(`❌ Error guardando imagen: ${data.error}`);
            }
        } catch (err: any) {
            console.error('[CAL SAVE] Fetch error:', err);
            log('error', `Error guardando imagen: ${err.message}`);
            alert(`❌ Error de conexión: ${err.message}\n\n¿Está camera_server.py corriendo?`);
        }
    };

    const clearScaleCalibration = () => {
        setScaleCalMmPerPx(0);
        localStorage.removeItem('calibration_mmPerPx');
        log('info', '📐 Calibración de escala borrada');
    };

    const BACKEND = 'http://127.0.0.1:8765';

    const log = (level: 'info' | 'warn' | 'error' | 'success', msg: string) => {
        const time = new Date().toLocaleTimeString('es-ES', { hour12: false });
        setLogs(prev => [...prev.slice(-59), { time, level, msg }]);
    };

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    // ── Comprobar disponibilidad del backend Python al montar ──────────────────
    useEffect(() => {
        const checkBackend = async () => {
            try {
                const r = await fetch(`${BACKEND}/api/status`, { signal: AbortSignal.timeout(2000) });
                if (r.ok) {
                    const data = await r.json();
                    setBackendOk(true);
                    log('success', `✓ camera_server.py detectado en ${BACKEND}`);
                    if (data.status === 'connected') {
                        setStatus('connected');
                        setActiveTab('preview');
                        log('success', `Cámara vinculada al stream activo automáticamente.`);
                    }
                } else {
                    setBackendOk(false);
                }
            } catch {
                setBackendOk(false);
                log('warn', 'camera_server.py NO detectado — modo simulación activo');
                log('info', 'Arranca con:  python camera_server.py');
            }
        };
        checkBackend();
    }, []);

    // ── Poll FPS desde backend cuando conectado ──────────────────────────────
    useEffect(() => {
        if (status !== 'connected' || !backendOk) return;
        const interval = setInterval(async () => {
            try {
                const r = await fetch(`${BACKEND}/api/status`);
                const data = await r.json();
                setServerFps(data.fps ?? 0);
                setServerFrames(data.frame_count ?? 0);

                const rc = await fetch(`${BACKEND}/api/calibration/status`);
                if (rc.ok) {
                    const dcal = await rc.json();
                    setCalActive(dcal.active);
                    setCalActiveRms(dcal.rms);
                }
            } catch { /* ignore */ }
        }, 1000);
        return () => clearInterval(interval);
    }, [status, backendOk]);

    // ── Poll estado grabación ────────────────────────────────────────────────
    useEffect(() => {
        if (!isRecording || !backendOk) return;
        const interval = setInterval(async () => {
            try {
                const r = await fetch(`${BACKEND}/api/record/status`);
                const data = await r.json();
                setRecElapsed(data.elapsed_s ?? 0);
                setRecFrames(data.frames_written ?? 0);
            } catch { /* ignore */ }
        }, 500);
        return () => clearInterval(interval);
    }, [isRecording, backendOk]);

    // ── Canvas simulado (fallback cuando SIN backend) ───────────────────────
    useEffect(() => {
        // Solo animar si NO hay backend o si el backend no está conectado
        if (backendOk || status !== 'connected' || activeTab !== 'preview') {
            cancelAnimationFrame(animRef.current);
            return;
        }
        let timeVar = 0;
        let frames = 0;
        const draw = () => {
            const canvas = canvasRef.current;
            if (!canvas) { animRef.current = requestAnimationFrame(draw); return; }
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const W = 640, H = 400;
            if (canvas.width !== W) canvas.width = W;
            if (canvas.height !== H) canvas.height = H;
            const imgData = ctx.createImageData(W, H);
            const d = imgData.data;
            for (let y = 0; y < H; y++) {
                for (let x = 0; x < W; x++) {
                    const i = (y * W + x) * 4;
                    const dist = Math.hypot(x - W / 2, y - H / 2);
                    const radial = Math.max(0, 1 - dist / (Math.min(W, H) * 0.44));
                    const wave = Math.sin((x + timeVar) * 0.022) * 20 + Math.cos((y + timeVar * 0.7) * 0.022) * 14;
                    const noise = (Math.random() - 0.5) * 12;
                    const expFactor = Math.min(1, config.exposureTimeAbs / 50000);
                    let v = 20 + expFactor * 160 * radial + wave + noise;
                    v = Math.max(0, Math.min(255, v));
                    d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
                }
            }
            ctx.putImageData(imgData, 0, 0);
            ctx.strokeStyle = 'rgba(0,255,100,0.6)'; ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H);
            ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(8, 8, 280, 96);
            ctx.fillStyle = '#ffa500'; ctx.font = 'bold 11px monospace';
            ctx.fillText(t('simulated'), 14, 24);
            ctx.fillStyle = '#cdd9e5'; ctx.font = '11px monospace';
            ctx.fillText(`SN:40002788  ID:10726304`, 14, 40);
            ctx.fillText(`IP: 192.168.0.201`, 14, 54);
            ctx.fillText(`Format: ${config.pixelFormat}  AOI: ${config.width}×${config.height}`, 14, 68);
            ctx.fillText(`Exp: ${config.exposureTimeAbs.toLocaleString()}µs  Gain: ${config.gainRaw}`, 14, 82);
            ctx.fillText(`Frame#: ${frames}  ${t('realInstall')}`, 14, 96);
            timeVar += 0.35; frames++;
            animRef.current = requestAnimationFrame(draw);
        };
        const timer = setTimeout(() => draw(), 80);
        return () => { clearTimeout(timer); cancelAnimationFrame(animRef.current); };
    }, [backendOk, status, activeTab, config]);

    // ── Escaneo ─────────────────────────────────────────────────────────────────
    const handleScan = async () => {
        setStatus('scanning'); setDevices([]); setSelected(null);
        setErrorMsg(''); setScanProgress(10);
        log('info', 'Iniciando TlFactory.GetInstance()...');
        log('info', 'Enumerando interfaces GigE Vision...');

        if (backendOk) {
            // ── Escaneo REAL via camera_server.py ────────────────────────────
            try {
                setScanProgress(40);
                const r = await fetch(`${BACKEND}/api/devices`);
                const data = await r.json();
                setScanProgress(100);
                const devs: BaslerDevice[] = data.devices ?? [];
                setDevices(devs);
                if (devs.length > 0) {
                    const realTag = data.pylon ? '✔ pylon real' : '⚠ pypylon no instalado';
                    log('success', `${devs.length} dispositivo(s) encontrado(s) [${realTag}]:`);
                    devs.forEach(d => log('info',
                        `  [${d.deviceType}] ${d.modelName} | SN:${d.serialNumber} | IP:${d.ipAddress} | FW:${d.firmwareVersion}`
                    ));

                    // Auto connection logic
                    log('info', 'Autoconectando a la cámara detectada...');
                    setSelected(devs[0]);
                    handleConnect(devs[0]);
                    return; // Prevent setting status to disconnected
                } else {
                    log('warn', 'No se encontraron cámaras Basler.');
                    log('info', '→ Comprueba que el cable Ethernet esté conectado.');
                    log('info', '→ Verifica que la IP de la NIC está en el rango 192.168.0.x');
                }
            } catch (e) {
                setScanProgress(0);
                log('error', `Error en escaneo: ${e}`);
                setErrorMsg('No se pudo contactar con camera_server.py');
            }
        } else {
            // ── Sin backend: no hay forma de detectar hardware real ──────────────
            for (let p = 10; p <= 90; p += 20) {
                await new Promise(r => setTimeout(r, 120));
                setScanProgress(p);
            }
            setScanProgress(100);
            // No añadimos ningún dispositivo — lista vacía
            setDevices([]);
            log('warn', 'camera_server.py no está ejecutándose.');
            log('info', '│  Para detectar la cámara real, abre una terminal y ejecuta:');
            log('info', '│  > python camera_server.py');
            log('info', '│  Luego instala dependencias si es necesario:');
            log('info', '└  > pip install pypylon opencv-python');
            setErrorMsg('Inicia camera_server.py para detectar cámaras reales');
        }
        setStatus('disconnected');
    };

    // ── Conexión ─────────────────────────────────────────────────────────────────
    const handleConnect = async (overrideCam?: BaslerDevice) => {
        setStatus('connecting'); setErrorMsg('');
        const cam = overrideCam ?? selected ?? (devices[0] ?? null);

        const actIP = (overrideCam && config.connectionMode === 'auto') ? overrideCam.ipAddress : (config.ipAddress || cam?.ipAddress || '192.168.0.201');
        const actSN = (overrideCam && config.connectionMode === 'auto') ? overrideCam.serialNumber : (config.serialNumber || cam?.serialNumber);

        log('info', '═════════════════════════════════════════');
        log('info', 'Creando BaslerCamera (CDeviceSpecificInstantCamera)...');
        if (config.connectionMode === 'serial' && actSN)
            log('info', `TlFactory::CreateFirstDevice() → SerialNumber="${actSN}"`);
        else if (config.connectionMode === 'ip' && actIP)
            log('info', `TlFactory::CreateFirstDevice() → IpAddress="${actIP}"`);
        else
            log('info', 'TlFactory::CreateFirstDevice() → auto');

        if (backendOk) {
            // ── Conexión REAL via camera_server.py ──────────────────────────────
            try {
                log('info', `Llamando a ${BACKEND}/api/connect...`);
                const r = await fetch(`${BACKEND}/api/connect`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        connectionMode: config.connectionMode,
                        serialNumber: actSN,
                        ipAddress: actIP,
                        pixelFormat: config.pixelFormat,
                        width: config.width,
                        height: config.height,
                        offsetX: config.offsetX,
                        offsetY: config.offsetY,
                        exposureAuto: config.exposureAuto,
                        exposureTimeAbs: config.exposureTimeAbs,
                        gainAuto: config.gainAuto,
                        gainRaw: config.gainRaw,
                        acquisitionMode: config.acquisitionMode,
                        acquisitionFrameRateEnable: config.acquisitionFrameRateEnable,
                        acquisitionFrameRateAbs: config.acquisitionFrameRateAbs,
                        triggerMode: config.triggerMode,
                        triggerSelector: config.triggerSelector,
                        triggerSource: config.triggerSource,
                    }),
                });
                const data = await r.json();
                if (data.ok) {
                    const simTag = data.simulated ? ' (SIMULADO — pypylon no instalado)' : ' (REAL ✔)';
                    log('success', `✓ Cámara conectada${simTag}`);
                    log('success', `✓ Stream MJPEG activo en ${BACKEND}/api/stream`);
                    setStatus('connected');
                    if (cam) setSelected({ ...cam, status: 'connected' });
                    setStreamKey(k => k + 1);  // fuerza reload del img
                    setActiveTab('preview');
                } else {
                    log('error', `Error al conectar: ${data.error}`);
                    setErrorMsg(data.error ?? 'Error de conexión');
                    setStatus('error');
                }
            } catch (e) {
                log('error', `Excepción: ${e}`);
                setErrorMsg(`No se pudo contactar con camera_server.py`);
                setStatus('error');
            }
        } else {
            // ── Conexión SIMULADA (sin backend) ────────────────────────────────
            log('warn', 'backend NO disponible — modo simulación');
            log('info', 'Arranca camera_server.py para imagen real');
            await new Promise(r => setTimeout(r, 600));
            log('info', `PixelFormat = ${config.pixelFormat}  ${config.width}×${config.height}`);
            log('info', `Exp: ${config.exposureTimeAbs}µs  Gain: ${config.gainRaw}`);
            log('info', 'StartGrabbing(GrabStrategy_LatestImageOnly)...');
            await new Promise(r => setTimeout(r, 300));
            log('success', '✓ Cámara simulada activa.');
            setStatus('connected');
            if (cam) setSelected({ ...cam, status: 'connected' });
            setActiveTab('preview');
        }
    };

    // ── Captura de foto ──────────────────────────────────────────────────────────
    const handleSnapshot = async () => {
        if (!saveDir.trim()) {
            setCaptureMsg({ ok: false, text: 'Indica un directorio de destino.' });
            return;
        }
        setCapturing(true);
        setCaptureMsg(null);
        try {
            const params = new URLSearchParams({
                dir: saveDir.trim(),
                ...(customFilename.trim() ? { filename: customFilename.trim() } : {}),
            });
            const r = await fetch(`${BACKEND}/api/snapshot_save?${params}`);
            const data = await r.json();
            if (data.ok) {
                const time = new Date().toLocaleTimeString('es-ES', { hour12: false });
                setCaptureMsg({ ok: true, text: `✔ Guardada: ${data.filename}  (${data.size_kb} KB)` });
                log('success', `📸 Foto guardada → ${data.path}  [${data.size_kb} KB]`);
                setGallery(prev => [{ filename: data.filename, path: data.path, size_kb: data.size_kb, time }, ...(prev ?? []).slice(0, 11)]);
                if (customFilename.trim()) setCustomFilename(''); // limpiar nombre personalizado
            } else {
                setCaptureMsg({ ok: false, text: `✖ Error: ${data.error}` });
                log('error', `📸 Error al guardar foto: ${data.error}`);
            }
        } catch (e) {
            setCaptureMsg({ ok: false, text: `✖ No se pudo contactar con camera_server.py` });
            log('error', `📸 Excepción: ${e}`);
        } finally {
            setCapturing(false);
        }
    };

    // ── Grabación de vídeo ───────────────────────────────────────────────────────────
    const handleRecordStart = async () => {
        if (!videoDir.trim()) {
            setRecMsg({ ok: false, text: 'Indica un directorio de destino.' });
            return;
        }
        setRecMsg(null);
        try {
            const r = await fetch(`${BACKEND}/api/record/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dir: videoDir.trim(),
                    filename: videoFilename.trim() || '',
                    fps: videoFps,
                    codec: videoCodec,
                }),
            });
            const data = await r.json();
            if (data.ok) {
                setIsRecording(true);
                setRecElapsed(0);
                setRecFrames(0);
                log('success', `🟥 REC iniciada → ${data.path}  @${data.fps}fps`);
                setRecMsg({ ok: true, text: `● REC activa: ${data.filename}` });
            } else {
                setRecMsg({ ok: false, text: `✖ ${data.error}` });
                log('error', `REC error: ${data.error}`);
            }
        } catch (e) {
            setRecMsg({ ok: false, text: '✖ No se pudo contactar con camera_server.py' });
        }
    };

    const handleRecordStop = async () => {
        try {
            const r = await fetch(`${BACKEND}/api/record/stop`, { method: 'POST' });
            const data = await r.json();
            setIsRecording(false);
            if (data.ok) {
                const time = new Date().toLocaleTimeString('es-ES', { hour12: false });
                const msg = `✔ Guardado: ${data.filename}  (${data.size_mb} MB · ${data.duration_s}s · ${data.frames_written}f)`;
                setRecMsg({ ok: true, text: msg });
                log('success', `🟥 REC detenida → ${data.path}  [${data.size_mb} MB, ${data.duration_s}s]`);
                setVideoGallery(prev => [{
                    filename: data.filename,
                    path: data.path,
                    size_mb: data.size_mb,
                    duration_s: data.duration_s,
                    time,
                }, ...(prev ?? []).slice(0, 7)]);
                if (videoFilename.trim()) setVideoFilename('');
            } else {
                setRecMsg({ ok: false, text: `✖ ${data.error}` });
            }
        } catch (e) {
            setIsRecording(false);
            setRecMsg({ ok: false, text: '✖ Error al detener la grabación' });
        }
    };

    // ── Eliminar personas EN TIEMPO REAL — Roboflow SAM3 find-people ──────────
    const handleSam3LiveToggle = async () => {
        setSam3LiveLoading(true);
        try {
            const action = sam3LiveActive ? 'stop' : 'start';
            // Convertir color hex a BGR para OpenCV
            const hexToBgr = (hex: string) => {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                return [b, g, r]; // BGR para OpenCV
            };
            const res = await fetch('http://127.0.0.1:8765/api/sam3/live-toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    fill_color: hexToBgr(sam3FillColor),
                    confidence: sam3LiveConfidence,
                }),
            });
            const data = await res.json();
            if (data.ok) {
                setSam3LiveActive(data.active);
                if (data.active) {
                    log('success', '🧠 Eliminación SAM3 activada — Roboflow find-people (~1-3 FPS)');
                } else {
                    log('info', '🧠 Eliminación de personas DESACTIVADA');
                    setSam3LiveStatus(null);
                }
            } else {
                log('error', `🧠 Error: ${data.error}`);
            }
        } catch (err: any) {
            log('error', `🧠 Excepción: ${err.message}`);
        } finally {
            setSam3LiveLoading(false);
        }
    };

    // Polling del estado de eliminación de personas en vivo
    useEffect(() => {
        if (!sam3LiveActive) return;
        const interval = setInterval(async () => {
            try {
                const res = await fetch('http://127.0.0.1:8765/api/sam3/live-status');
                const data = await res.json();
                setSam3LiveStatus(data);
                // Si el backend se desactivó por sí solo (error fatal, etc.)
                if (!data.active) {
                    setSam3LiveActive(false);
                    log('warn', '🧠 SAM 3: Se desactivó automáticamente');
                }
            } catch { /* ignore polling errors */ }
        }, 1500);
        return () => clearInterval(interval);
    }, [sam3LiveActive]);

    // ── Zoom con rueda del ratón ────────────────────────────────────────────────
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoomLevel(prev => Math.min(8, Math.max(1, parseFloat((prev + delta).toFixed(2)))));
        // Si volvemos a zoom 1 reset pan
        if (zoomLevel + delta <= 1) setPanOffset({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (zoomLevel <= 1) return;
        setIsPanning(true);
        panStart.current = { mx: e.clientX, my: e.clientY, px: panOffset.x, py: panOffset.y };
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isPanning) return;
        const dx = e.clientX - panStart.current.mx;
        const dy = e.clientY - panStart.current.my;
        setPanOffset({ x: panStart.current.px + dx, y: panStart.current.py + dy });
    };

    const handleMouseUp = () => setIsPanning(false);

    const zoomReset = () => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); };
    const zoomIn = () => setZoomLevel(prev => Math.min(8, parseFloat((prev + 0.25).toFixed(2))));
    const zoomOut = () => { const nv = Math.max(1, parseFloat((zoomLevel - 0.25).toFixed(2))); setZoomLevel(nv); if (nv <= 1) setPanOffset({ x: 0, y: 0 }); };

    // ── Desconexión ──────────────────────────────────────────────────────────────
    const handleDisconnect = async () => {
        cancelAnimationFrame(animRef.current);
        log('warn', 'StopGrabbing()...');
        if (backendOk) {
            try {
                await fetch(`${BACKEND}/api/disconnect`, { method: 'POST' });
                log('info', 'BaslerCamera.Close() via camera_server.py');
            } catch { /* ignore */ }
        }
        log('success', 'Cámara desconectada correctamente.');
        setStatus('disconnected');
        if (selected) setSelected({ ...selected, status: 'available' });
        setActiveTab('connection');
        setServerFps(0);
        setServerFrames(0);
    };

    // ── Conexión rápida — Cámara ON (1 click, sin escanear) ──────────────────
    const handleQuickConnect = async () => {
        if (isConnected) {
            await handleDisconnect();
            return;
        }
        setStatus('connecting');
        setErrorMsg('');
        log('info', '═════════════════════════════════════════');
        log('info', '⚡ Cámara ON — conexión rápida a 192.168.0.200...');

        const quickParams = {
            connectionMode: 'ip',
            ipAddress: '192.168.0.200',
            serialNumber: '40002788',
            pixelFormat: config.pixelFormat,
            width: config.width,
            height: config.height,
            offsetX: config.offsetX,
            offsetY: config.offsetY,
            exposureAuto: config.exposureAuto,
            exposureTimeAbs: config.exposureTimeAbs,
            gainAuto: config.gainAuto,
            gainRaw: config.gainRaw,
            acquisitionMode: config.acquisitionMode,
            acquisitionFrameRateEnable: config.acquisitionFrameRateEnable,
            acquisitionFrameRateAbs: config.acquisitionFrameRateAbs,
            triggerMode: config.triggerMode,
            triggerSelector: config.triggerSelector,
            triggerSource: config.triggerSource,
        };

        if (backendOk) {
            try {
                const r = await fetch(`${BACKEND}/api/connect`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(quickParams),
                });
                const data = await r.json();
                if (data.ok) {
                    const tag = data.simulated ? '(SIMULADO)' : '(REAL ✔)';
                    log('success', `✓ Cámara ON ${tag}`);
                    log('success', `✓ Stream MJPEG activo — ${BACKEND}/api/stream`);
                    const cam: BaslerDevice = {
                        index: 0, modelName: 'acA1920-48gm', serialNumber: '40002788',
                        deviceType: 'GigE', ipAddress: '192.168.0.200',
                        subnetMask: '255.255.255.0', macAddress: '', firmwareVersion: '', status: 'connected',
                    };
                    setSelected(cam);
                    setDevices([cam]);
                    setStatus('connected');
                    setStreamKey(k => k + 1);
                    setActiveTab('preview');
                } else {
                    log('error', `Error: ${data.error}`);
                    setErrorMsg(data.error ?? 'Error de conexión');
                    setStatus('error');
                }
            } catch (e) {
                log('error', `No se pudo contactar con camera_server.py: ${e}`);
                log('info', 'Asegúrate de que camera_server.py está en ejecución.');
                setErrorMsg('Inicia camera_server.py primero');
                setStatus('error');
            }
        } else {
            // Sin backend — simular
            log('warn', 'camera_server.py no disponible — modo simulación');
            await new Promise(r => setTimeout(r, 600));
            log('success', '✓ Cámara simulada activa.');
            const cam: BaslerDevice = {
                index: 0, modelName: 'acA1920-48gm', serialNumber: '40002788',
                deviceType: 'GigE', ipAddress: '192.168.0.200',
                subnetMask: '255.255.255.0', macAddress: '', firmwareVersion: 'V1.1-0', status: 'connected',
            };
            setSelected(cam);
            setDevices([cam]);
            setStatus('connected');
            setActiveTab('preview');
        }
    };

    const set = <K extends keyof CameraConfig>(key: K, value: CameraConfig[K]) =>
        setConfig(prev => ({ ...prev, [key]: value }));
    const setTL = <K extends keyof TLConfig>(key: K, value: TLConfig[K]) =>
        setTLConfig(prev => ({ ...prev, [key]: value }));

    const getStatusColor = () => {
        if (status === 'connected') return '#00ff64';
        if (status === 'connecting' || status === 'scanning') return '#ffa500';
        if (status === 'error') return '#ff4444';
        return '#8b949e';
    };

    const logColor = (level: string) => {
        if (level === 'success') return '#00ff64';
        if (level === 'warn') return '#ffa500';
        if (level === 'error') return '#ff4444';
        return '#8b949e';
    };

    const isConnected = status === 'connected';
    const isBusy = status === 'scanning' || status === 'connecting';

    // ── Calibración: capturar imagen del tablero ──────────────────────────────
    const handleCalCapture = async () => {
        setCalCapturing(true);
        setCalMsg(null);
        try {
            const params = new URLSearchParams({
                dir: calSaveDir.trim(),
                cols: String(calCols),
                rows: String(calRows),
            });
            const r = await fetch(`${BACKEND}/api/calibration/capture?${params}`);
            const data = await r.json();
            if (data.ok) {
                const time = new Date().toLocaleTimeString('es-ES', { hour12: false });
                setCalImages(prev => [{ filename: data.filename, corners: data.corners_found, time }, ...prev.slice(0, 19)]);
                setCalMsg({
                    ok: data.corners_found,
                    text: data.corners_found
                        ? `✔ ${data.filename} — ${t('calCornersFound')} (${calCols}×${calRows})`
                        : `⚠ ${data.filename} — ${t('calCornersNotFound')}`,
                });
                log(data.corners_found ? 'success' : 'warn', `📐 Cal capture: ${data.filename} corners=${data.corners_found}`);
            } else {
                setCalMsg({ ok: false, text: `✖ ${data.error}` });
            }
        } catch (e) {
            setCalMsg({ ok: false, text: '✖ No se pudo contactar con camera_server.py' });
        } finally {
            setCalCapturing(false);
        }
    };

    // ── Calibración: calcular parámetros ─────────────────────────────────────
    const handleCalCompute = async () => {
        setCalComputing(true);
        setCalMsg(null);
        try {
            const r = await fetch(`${BACKEND}/api/calibration/compute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dir: calSaveDir.trim(),
                    cols: calCols,
                    rows: calRows,
                    square_mm: calSquare,
                }),
            });
            const data = await r.json();
            if (data.ok) {
                setCalResult(data.result);
                setCalMsg({ ok: true, text: `✔ ${t('calDone')} — RMS: ${data.result.rms.toFixed(4)} px` });
                log('success', `📐 Calibración completada: RMS=${data.result.rms.toFixed(4)} con ${data.result.image_count} imágenes`);
            } else {
                setCalMsg({ ok: false, text: `✖ ${data.error}` });
                log('error', `📐 Calibración error: ${data.error}`);
            }
        } catch (e) {
            setCalMsg({ ok: false, text: '✖ No se pudo contactar con camera_server.py' });
        } finally {
            setCalComputing(false);
        }
    };

    // ── Calibración: limpiar imágenes ─────────────────────────────────────────
    const handleCalApply = async () => {
        if (!calResult) return;
        try {
            const r = await fetch(`${BACKEND}/api/calibration/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    matrix: [
                        [calResult.fx, 0, calResult.cx],
                        [0, calResult.fy, calResult.cy],
                        [0, 0, 1]
                    ],
                    dist: [[calResult.k1, calResult.k2, calResult.p1, calResult.p2, calResult.k3]],
                    rms: calResult.rms
                })
            });
            const data = await r.json();
            if (data.ok) {
                setCalActive(true);
                setCalActiveRms(calResult.rms);
                log('success', `💾 Calibración activada permanentemente (RMS: ${calResult.rms.toFixed(4)}).`);
            } else {
                log('error', `Error al aplicar calibración: ${data.error}`);
            }
        } catch (e) {
            log('error', 'Error aplicando calibración.');
        }
    };

    const handleCalRemove = async () => {
        try {
            const r = await fetch(`${BACKEND}/api/calibration/clear`, { method: 'POST' });
            if (r.ok) {
                setCalActive(false);
                setCalActiveRms(null);
                log('info', '🗑 Calibración eliminada del servidor.');
            }
        } catch (e) { /* ignore */ }
    };

    const handleCalClear = () => {
        setCalImages([]);
        setCalResult(null);
        setCalMsg(null);
        setCalPreviewIdx(0);
        setCalPreviewMode('pattern');
    };


    const tabs: { id: typeof activeTab; label: string }[] = [
        { id: 'connection', label: t('tabConn') },
        { id: 'image', label: t('tabImage') },
        { id: 'acquisition', label: t('tabAcq') },
        { id: 'trigger', label: t('tabTrig') },
        { id: 'gige', label: t('tabGigE') },
        { id: 'transport', label: t('tabTL') },
        { id: 'preview', label: t('tabPreview') },
        { id: 'calibration', label: t('tabCal') },
        { id: 'test', label: '📐 Test' },
    ];

    return (
        <div className="basler-page">

            {/* ── HEADER ── */}
            <div className="basler-header">
                <div className="basler-logo-badge">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <circle cx="14" cy="14" r="12" stroke="#00ff64" strokeWidth="1.8" />
                        <circle cx="14" cy="14" r="6" stroke="#00ff64" strokeWidth="1.2" />
                        <circle cx="14" cy="14" r="2" fill="#00ff64" />
                        {[0, 90, 180, 270].map(a => {
                            const r = a * Math.PI / 180;
                            return <line key={a} x1={14 + 8 * Math.cos(r)} y1={14 + 8 * Math.sin(r)} x2={14 + 12 * Math.cos(r)} y2={14 + 12 * Math.sin(r)} stroke="#00ff64" strokeWidth="1.5" />;
                        })}
                    </svg>
                    <div>
                        <div className="basler-title">Basler Camera · acA1920-48gm</div>
                        <div className="basler-subtitle">pylon SDK 7.x · GigE Vision · Mono · 1920×1200 · 48fps</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* ── Botón CÁMARA ON/OFF ─────────────────────── */}
                    <button
                        onClick={handleQuickConnect}
                        disabled={status === 'scanning' || status === 'connecting'}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '10px 20px', borderRadius: 8, fontWeight: 700,
                            fontSize: '0.95rem', cursor: isBusy ? 'wait' : 'pointer',
                            border: `2px solid ${isConnected ? '#ff4444' : '#00ff64'}`,
                            background: isConnected
                                ? 'rgba(255,68,68,0.12)'
                                : 'rgba(0,255,100,0.12)',
                            color: isConnected ? '#ff6666' : '#00ff64',
                            transition: 'all 0.2s',
                            boxShadow: isConnected
                                ? '0 0 14px rgba(255,68,68,0.3)'
                                : '0 0 14px rgba(0,255,100,0.3)',
                        }}
                        title={isConnected ? 'Desconectar cámara' : 'Conectar a acA1920-48gm · 192.168.0.200'}
                    >
                        {/* Icono power */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M12 2v6" />
                            <path d="M6.3 6.3a8 8 0 1 0 11.4 0" />
                        </svg>
                        {status === 'connecting'
                            ? 'Conectando…'
                            : isConnected
                                ? 'CÁMARA OFF'
                                : 'CÁMARA ON'}
                    </button>
                    <div className="basler-status-badge" style={{ color: getStatusColor(), borderColor: getStatusColor() }}>
                        {status === 'connected' ? t('grabbing') : status === 'scanning' ? t('scanningStatus') : status === 'connecting' ? t('opening') : status === 'error' ? t('error') : t('closed')}
                    </div>
                </div>
            </div>

            {/* ── TABS ── */}
            <div className="basler-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`basler-tab ${activeTab === tab.id ? 'active' : ''} ${tab.id === 'preview' && !isConnected ? 'disabled' : ''} ${tab.id === 'calibration' ? 'cal-tab' : ''}`}
                        onClick={() => { if (tab.id !== 'preview' || isConnected) setActiveTab(tab.id); }}
                    >{tab.label}</button>
                ))}
            </div>

            <div className="basler-body" style={activeTab === 'test' ? { padding: '4px 4px 0 4px', gap: 0 } : undefined}>

                {/* ══ TAB: CONEXIÓN ══════════════════════════════════════════════════════ */}
                {activeTab === 'connection' && (
                    <div className="basler-section-grid">

                        {/* Dispositivos detectados */}
                        <div className="basler-panel">
                            <div className="basler-panel-header">
                                <span>{t('devGigE')}</span>
                                <button className={`basler-btn scan ${status === 'scanning' ? 'loading' : ''}`} onClick={handleScan} disabled={isBusy || isConnected}>
                                    {status === 'scanning' ? <><span className="spin">↻</span>{t('scanningBtn')}</> : t('scanBtn')}</button>
                            </div>

                            {status === 'scanning' && (
                                <div className="basler-progress">
                                    <div className="basler-progress-bar" style={{ width: `${scanProgress}%` }} />
                                    <span>{scanProgress}%</span>
                                </div>
                            )}

                            {devices.length === 0 ? (
                                <div className="basler-empty-state">
                                    <div className="basler-empty-icon">
                                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                            <circle cx="24" cy="24" r="20" stroke="#30363d" strokeWidth="2" />
                                            <circle cx="24" cy="24" r="9" stroke="#30363d" strokeWidth="1.5" strokeDasharray="4 3" />
                                            <circle cx="24" cy="24" r="3" fill="#30363d" />
                                        </svg>
                                    </div>
                                    <p>{t('noCamDesc')}</p>
                                    <span>{t('noCamSub')}</span>
                                </div>
                            ) : (
                                <div className="basler-device-list">
                                    {devices.map(dev => (
                                        <div key={dev.index} className={`basler-device-card ${selected?.index === dev.index ? 'selected' : ''}`}
                                            onClick={() => { setSelected(dev); set('serialNumber', dev.serialNumber); set('ipAddress', dev.ipAddress); }}>
                                            <div className="device-card-left">
                                                <div className="device-type-badge GigE">GigE</div>
                                                <div>
                                                    <div className="device-model">{dev.modelName}</div>
                                                    <div className="device-serial">SN: {dev.serialNumber} · FW: {dev.firmwareVersion}</div>
                                                    <div className="device-ip">IP: {dev.ipAddress} · {dev.subnetMask}</div>
                                                    <div className="device-mac">MAC: {dev.macAddress}</div>
                                                </div>
                                            </div>
                                            <div className={`device-status-dot ${dev.status}`} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modo de conexión + botón */}
                        <div className="basler-panel">
                            <div className="basler-panel-header"><span>{t('connMode')}</span></div>

                            <div className="basler-mode-selector">
                                {(['auto', 'serial', 'ip'] as ConnectionMode[]).map(m => (
                                    <button key={m} className={`mode-btn ${config.connectionMode === m ? 'active' : ''}`} onClick={() => set('connectionMode', m)}>
                                        {m === 'auto' ? t('btnAuto') : m === 'serial' ? t('btnSerial') : t('btnIp')}
                                    </button>
                                ))}
                            </div>

                            {config.connectionMode === 'serial' && (
                                <div className="basler-form-group">
                                    <label>{t('serialNum')}</label>
                                    <input className="basler-input" placeholder="Ej: 40002788" value={config.serialNumber}
                                        onChange={e => set('serialNumber', e.target.value)} />
                                    <span className="basler-hint">DeviceInfo.SetSerialNumber()</span>
                                </div>
                            )}
                            {config.connectionMode === 'ip' && (
                                <div className="basler-form-group">
                                    <label>{t('ipAddr')}</label>
                                    <input className="basler-input" placeholder="Ej: 192.168.1.101" value={config.ipAddress}
                                        onChange={e => set('ipAddress', e.target.value)} />
                                    <span className="basler-hint">DeviceInfo.SetIpAddress() → SetPersistentIpAddress()</span>
                                </div>
                            )}
                            {config.connectionMode === 'auto' && (
                                <div className="basler-info-box">
                                    <strong>TlFactory::CreateFirstDevice()</strong>
                                    <p>{t('connInfoAuto')}</p>
                                </div>
                            )}

                            <div className="basler-form-group">
                                <label>{t('timeoutMs')}</label>
                                <input className="basler-input" type="number" min={1000} max={30000} step={500}
                                    value={config.timeout} onChange={e => set('timeout', Number(e.target.value))} />
                            </div>

                            {errorMsg && <div className="basler-error-msg">⚠️ {errorMsg}</div>}

                            {selected && (
                                <div className="basler-selected-summary">
                                    <span>{t('selectedDev')}</span>
                                    <strong>{selected.modelName}</strong>
                                    <div className="device-type-badge GigE">GigE</div>
                                </div>
                            )}

                            <div className="basler-connect-actions">
                                {!isConnected ? (
                                    <button className="basler-btn connect" onClick={() => handleConnect()} disabled={isBusy}>
                                        {status === 'connecting' ? <><span className="spin">↻</span>{t('openingBtn')}</> : t('btnConnect')}
                                    </button>
                                ) : (
                                    <button className="basler-btn disconnect" onClick={handleDisconnect}>{t('btnDisconnect')}</button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ TAB: IMAGEN ════════════════════════════════════════════════════════ */}
                {activeTab === 'image' && (
                    <div className="basler-section-grid basler-config-grid">
                        <div className="basler-panel">
                            <div className="basler-panel-header"><span>{t('pixFormat')}</span></div>
                            <div className="basler-config-form">
                                <div className="basler-form-group">
                                    <label>Pixel Format</label>
                                    <select className="basler-input" value={config.pixelFormat} onChange={e => set('pixelFormat', e.target.value as PixelFormat)}>
                                        <option value="Mono8">Mono8 — 8 bits/pixel</option>
                                        <option value="Mono10">Mono10 — 10 bits/pixel</option>
                                        <option value="Mono10p">Mono10p — 10 bits packed</option>
                                    </select>
                                    <span className="basler-hint">{t('pixHint')}</span>
                                </div>
                                <div className="config-row">
                                    <div className="basler-form-group">
                                        <label>{t('widthPx')}</label>
                                        <input className="basler-input" type="number" min={16} max={1920} step={16}
                                            value={config.width} onChange={e => set('width', Number(e.target.value))} />
                                    </div>
                                    <div className="basler-form-group">
                                        <label>{t('heightPx')}</label>
                                        <input className="basler-input" type="number" min={16} max={1200} step={2}
                                            value={config.height} onChange={e => set('height', Number(e.target.value))} />
                                    </div>
                                </div>
                                <div className="config-row">
                                    <div className="basler-form-group">
                                        <label>{t('offsetX')}</label>
                                        <input className="basler-input" type="number" min={0} max={1904} step={16}
                                            value={config.offsetX} onChange={e => set('offsetX', Number(e.target.value))} />
                                    </div>
                                    <div className="basler-form-group">
                                        <label>{t('offsetY')}</label>
                                        <input className="basler-input" type="number" min={0} max={1184} step={2}
                                            value={config.offsetY} onChange={e => set('offsetY', Number(e.target.value))} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="basler-panel">
                            <div className="basler-panel-header"><span>{t('expGain')}</span></div>
                            <div className="basler-config-form">
                                <div className="basler-form-group">
                                    <label>ExposureAuto</label>
                                    <select className="basler-input" value={config.exposureAuto} onChange={e => set('exposureAuto', e.target.value as ExposureAuto)}>
                                        <option value="Off">Off — tiempo fijo</option>
                                        <option value="Once">Once — ajuste único</option>
                                        <option value="Continuous">Continuous — ajuste continuo</option>
                                    </select>
                                </div>
                                {config.exposureAuto === 'Off' && (
                                    <div className="basler-form-group">
                                        <label>{t('expTime')}: <strong>{config.exposureTimeAbs.toLocaleString()} µs</strong></label>
                                        <input type="range" className="basler-slider" min={38} max={1000000} step={100}
                                            value={config.exposureTimeAbs} onChange={e => set('exposureTimeAbs', Number(e.target.value))} />
                                        <div className="slider-labels"><span>38 µs</span><span>1 000 000 µs</span></div>
                                    </div>
                                )}
                                <div className="basler-form-group">
                                    <label>GainAuto</label>
                                    <select className="basler-input" value={config.gainAuto} onChange={e => set('gainAuto', e.target.value as GainAuto)}>
                                        <option value="Off">Off</option>
                                        <option value="Once">Once</option>
                                        <option value="Continuous">Continuous</option>
                                    </select>
                                </div>
                                {config.gainAuto === 'Off' && (
                                    <div className="basler-form-group">
                                        <label>{t('gainRaw')}: <strong>{config.gainRaw}</strong></label>
                                        <input type="range" className="basler-slider" min={0} max={500} step={1}
                                            value={config.gainRaw} onChange={e => set('gainRaw', Number(e.target.value))} />
                                        <div className="slider-labels"><span>0</span><span>500 (raw)</span></div>
                                        <span className="basler-hint">{t('gainHint')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ TAB: ADQUISICIÓN ══════════════════════════════════════════════════ */}
                {activeTab === 'acquisition' && (
                    <div className="basler-panel" style={{ maxWidth: 600 }}>
                        <div className="basler-panel-header"><span>{t('tabAcq')}</span></div>
                        <div className="basler-config-form">
                            <div className="basler-form-group">
                                <label>AcquisitionMode</label>
                                <select className="basler-input" value={config.acquisitionMode} onChange={e => set('acquisitionMode', e.target.value as AcquisitionMode)}>
                                    <option value="Continuous">{t('acqCont')}</option>
                                    <option value="SingleFrame">{t('acqSingle')}</option>
                                </select>
                            </div>
                            <div className="basler-form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <input type="checkbox" checked={config.acquisitionFrameRateEnable}
                                        onChange={e => set('acquisitionFrameRateEnable', e.target.checked)} />
                                    AcquisitionFrameRateEnable
                                </label>
                                <span className="basler-hint">{t('frameRateHint')}</span>
                            </div>
                            {config.acquisitionFrameRateEnable && (
                                <div className="basler-form-group">
                                    <label>AcquisitionFrameRateAbs (fps): <strong>{config.acquisitionFrameRateAbs.toFixed(1)} fps</strong></label>
                                    <input type="range" className="basler-slider" min={1} max={48} step={0.5}
                                        value={config.acquisitionFrameRateAbs} onChange={e => set('acquisitionFrameRateAbs', Number(e.target.value))} />
                                    <div className="slider-labels"><span>1 fps</span><span>48 fps (máx acA1920-48gm)</span></div>
                                </div>
                            )}
                            <div className="basler-form-group">
                                <label>{t('maxBuf')}</label>
                                <input className="basler-input" type="number" min={1} max={64}
                                    value={config.maxNumBuffer} onChange={e => set('maxNumBuffer', Number(e.target.value))} />
                                <span className="basler-hint">{t('maxBufHint')}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ TAB: TRIGGER ══════════════════════════════════════════════════════ */}
                {activeTab === 'trigger' && (
                    <div className="basler-panel" style={{ maxWidth: 600 }}>
                        <div className="basler-panel-header"><span>{t('tabTrig')}</span></div>
                        <div className="basler-config-form">
                            <div className="basler-form-group">
                                <label>TriggerMode</label>
                                <select className="basler-input" value={config.triggerMode} onChange={e => set('triggerMode', e.target.value as TriggerMode)}>
                                    <option value="Off">{t('trigOff')}</option>
                                    <option value="On">{t('trigOn')}</option>
                                </select>
                            </div>
                            {config.triggerMode === 'On' && (
                                <>
                                    <div className="basler-form-group">
                                        <label>TriggerSelector</label>
                                        <select className="basler-input" value={config.triggerSelector} onChange={e => set('triggerSelector', e.target.value as TriggerSelector)}>
                                            <option value="FrameStart">FrameStart</option>
                                            <option value="AcquisitionStart">AcquisitionStart</option>
                                        </select>
                                    </div>
                                    <div className="basler-form-group">
                                        <label>TriggerSource</label>
                                        <select className="basler-input" value={config.triggerSource} onChange={e => set('triggerSource', e.target.value as TriggerSource)}>
                                            <option value="Software">{t('trigSoft')}</option>
                                            <option value="Line1">{t('trigLine1')}</option>
                                            <option value="Line3">{t('trigLine3')}</option>
                                            <option value="Action1">{t('trigAction1')}</option>
                                        </select>
                                    </div>
                                    <div className="basler-info-box">
                                        <strong>{t('actRising')}</strong>
                                        <p>{t('actHint')}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* ══ TAB: GigE ═════════════════════════════════════════════════════════ */}
                {activeTab === 'gige' && (
                    <div className="basler-section-grid basler-config-grid">
                        <div className="basler-panel">
                            <div className="basler-panel-header"><span>{t('streamGige')}</span></div>
                            <div className="basler-config-form">
                                <div className="basler-form-group">
                                    <label>TransmissionType</label>
                                    <select className="basler-input" value={config.transmissionType} onChange={e => set('transmissionType', e.target.value as TransmissionType)}>
                                        <option value="Unicast">{t('uniRec')}</option>
                                        <option value="Multicast">{t('multiRec')}</option>
                                        <option value="LimitedBroadcast">{t('limBcast')}</option>
                                        <option value="SubnetDirectedBroadcast">{t('subBcast')}</option>
                                    </select>
                                </div>
                                <div className="basler-form-group">
                                    <label>Driver GigE</label>
                                    <select className="basler-input" value={config.gevDriver} onChange={e => set('gevDriver', e.target.value as GevDriver)}>
                                        <option value="WindowsFilterDriver">{t('winFilter')}</option>
                                        <option value="SocketDriver">{t('sockDriver')}</option>
                                    </select>
                                    <span className="basler-hint">{t('filterHint')}</span>
                                </div>
                                <div className="basler-form-group">
                                    <label>Packet Size (bytes): <strong>{config.packetSizeBytes}</strong></label>
                                    <input type="range" className="basler-slider" min={576} max={9000} step={4}
                                        value={config.packetSizeBytes} onChange={e => set('packetSizeBytes', Number(e.target.value))} />
                                    <div className="slider-labels"><span>576</span><span>9000 (Jumbo)</span></div>
                                    <span className="basler-hint">{t('packHint')}</span>
                                </div>
                                <div className="basler-form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <input type="checkbox" checked={config.enableResend} onChange={e => set('enableResend', e.target.checked)} />
                                        {t('resendPkt')}
                                    </label>
                                    <span className="basler-hint">{t('resendHint')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="basler-panel">
                            <div className="basler-panel-header"><span>{t('pylonCode')}</span></div>
                            <div className="basler-code-preview" style={{ flex: 1 }}>
                                <div className="code-preview-header">⌨ Python / pypylon — acA1920-48gm</div>
                                <pre className="code-preview-content">{`from pypylon import pylon

# ─ Enumerar dispositivos ────────────────────────────
tlFactory = pylon.TlFactory.GetInstance()
devices = tlFactory.EnumerateDevices()
if not devices:
    raise RuntimeError("No Basler cameras found")

# ─ Crear InstantCamera ──────────────────────────────
${config.connectionMode === 'serial' && config.serialNumber
                                        ? `di = pylon.DeviceInfo()
di.SetSerialNumber("${config.serialNumber}")
camera = pylon.InstantCamera(tlFactory.CreateFirstDevice(di))`
                                        : config.connectionMode === 'ip' && config.ipAddress
                                            ? `di = pylon.DeviceInfo()
di.SetIpAddress("${config.ipAddress}")
camera = pylon.InstantCamera(tlFactory.CreateFirstDevice(di))`
                                            : `camera = pylon.InstantCamera(
    tlFactory.CreateFirstDevice())`}

camera.Open()

# ─ Imagen ───────────────────────────────────────────
camera.PixelFormat.Value       = "${config.pixelFormat}"
camera.Width.Value             = ${config.width}
camera.Height.Value            = ${config.height}
camera.OffsetX.Value           = ${config.offsetX}
camera.OffsetY.Value           = ${config.offsetY}

# ─ Exposición / Ganancia ────────────────────────────
camera.ExposureAuto.Value      = "${config.exposureAuto}"${config.exposureAuto === 'Off' ? `
camera.ExposureTimeAbs.Value   = ${config.exposureTimeAbs}  # µs` : ''}
camera.GainAuto.Value          = "${config.gainAuto}"${config.gainAuto === 'Off' ? `
camera.GainRaw.Value           = ${config.gainRaw}` : ''}

# ─ Adquisición ──────────────────────────────────────
camera.AcquisitionMode.Value   = "${config.acquisitionMode}"
camera.AcquisitionFrameRateEnable.Value = ${config.acquisitionFrameRateEnable}${config.acquisitionFrameRateEnable ? `
camera.AcquisitionFrameRateAbs.Value = ${config.acquisitionFrameRateAbs}` : ''}

# ─ Trigger ──────────────────────────────────────────
camera.TriggerMode.Value       = "${config.triggerMode}"${config.triggerMode === 'On' ? `
camera.TriggerSelector.Value   = "${config.triggerSelector}"
camera.TriggerSource.Value     = "${config.triggerSource}"` : ''}

# ─ Grab ─────────────────────────────────────────────
camera.StartGrabbing(
    pylon.GrabStrategy_LatestImageOnly)

converter = pylon.ImageFormatConverter()
converter.OutputPixelFormat = \\
    pylon.PixelType_BGR8packed

while camera.IsGrabbing():
    gr = camera.RetrieveResult(
        5000, pylon.TimeoutHandling_ThrowException)
    if gr.GrabSucceeded():
        img = converter.Convert(gr)
        arr = img.GetArray()  # numpy array
    gr.Release()
`}</pre>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ TAB: TRANSPORT LAYER ═══════════════════════════════════════════════ */}
                {activeTab === 'transport' && (
                    <div className="basler-section-grid basler-config-grid">
                        <div className="basler-panel">
                            <div className="basler-panel-header"><span>BaslerCameraTLParams — GigE Transport</span></div>
                            <div className="basler-config-form">
                                <div className="basler-form-group">
                                    <label>HeartbeatTimeout (ms): <strong>{tlConfig.heartbeatTimeout} ms</strong></label>
                                    <input type="range" className="basler-slider" min={100} max={10000} step={100}
                                        value={tlConfig.heartbeatTimeout} onChange={e => setTL('heartbeatTimeout', Number(e.target.value))} />
                                    <div className="slider-labels"><span>100 ms</span><span>10 000 ms</span></div>
                                    <span className="basler-hint">{t('hbHint')}</span>
                                </div>
                                <div className="config-row">
                                    <div className="basler-form-group">
                                        <label>ReadTimeout (ms)</label>
                                        <input className="basler-input" type="number" min={50} max={5000} step={50}
                                            value={tlConfig.readTimeout} onChange={e => setTL('readTimeout', Number(e.target.value))} />
                                    </div>
                                    <div className="basler-form-group">
                                        <label>WriteTimeout (ms)</label>
                                        <input className="basler-input" type="number" min={50} max={5000} step={50}
                                            value={tlConfig.writeTimeout} onChange={e => setTL('writeTimeout', Number(e.target.value))} />
                                    </div>
                                </div>
                                <div className="config-row">
                                    <div className="basler-form-group">
                                        <label>MaxRetryCountRead</label>
                                        <input className="basler-input" type="number" min={0} max={10}
                                            value={tlConfig.maxRetryCountRead} onChange={e => setTL('maxRetryCountRead', Number(e.target.value))} />
                                    </div>
                                    <div className="basler-form-group">
                                        <label>MaxRetryCountWrite</label>
                                        <input className="basler-input" type="number" min={0} max={10}
                                            value={tlConfig.maxRetryCountWrite} onChange={e => setTL('maxRetryCountWrite', Number(e.target.value))} />
                                    </div>
                                </div>
                                <div className="basler-form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <input type="checkbox" checked={tlConfig.connectionGuardEnable}
                                            onChange={e => setTL('connectionGuardEnable', e.target.checked)} />
                                        {t('connGuard')}
                                    </label>
                                    <span className="basler-hint">{t('guardHint')}</span>
                                </div>
                                <div className="basler-form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <input type="checkbox" checked={tlConfig.migrationModeEnable}
                                            onChange={e => setTL('migrationModeEnable', e.target.checked)} />
                                        {t('migMode')}
                                    </label>
                                    <span className="basler-hint">{t('migHint')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="basler-panel">
                            <div className="basler-panel-header"><span>{t('persIpTitle')}</span></div>
                            <div className="basler-config-form">
                                <div className="basler-info-box">
                                    <strong>BaslerCamera::ChangeIpConfiguration(EnablePersistentIp, EnableDhcp)</strong>
                                    <p>{t('persIpDesc')}</p>
                                </div>
                                <div className="basler-form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <input type="checkbox" checked={tlConfig.enablePersistentIp}
                                            onChange={e => setTL('enablePersistentIp', e.target.checked)} />
                                        {t('persIpEnable')}
                                    </label>
                                </div>
                                <div className="basler-form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <input type="checkbox" checked={tlConfig.enableDhcp}
                                            onChange={e => setTL('enableDhcp', e.target.checked)} />
                                        {t('dhcpEnable')}
                                    </label>
                                </div>
                                {tlConfig.enablePersistentIp && (
                                    <>
                                        <div className="basler-form-group">
                                            <label>{t('persIpStatic')}</label>
                                            <input className="basler-input" placeholder="Ej: 192.168.1.101"
                                                value={tlConfig.persistentIp} onChange={e => setTL('persistentIp', e.target.value)} />
                                        </div>
                                        <div className="basler-form-group">
                                            <label>Subnet Mask</label>
                                            <input className="basler-input" placeholder="255.255.255.0"
                                                value={tlConfig.persistentSubnet} onChange={e => setTL('persistentSubnet', e.target.value)} />
                                        </div>
                                        <div className="basler-form-group">
                                            <label>Default Gateway</label>
                                            <input className="basler-input" placeholder="192.168.1.1"
                                                value={tlConfig.persistentGateway} onChange={e => setTL('persistentGateway', e.target.value)} />
                                        </div>
                                    </>
                                )}
                                <div className="basler-code-preview" style={{ marginTop: 12 }}>
                                    <div className="code-preview-header">⌨ C++ / pypylon — Transport Layer</div>
                                    <pre className="code-preview-content">{`# Transport Layer (TL) parameters
cam = BaslerCamera()  # C++ custom class wrapping InstantCamera

# TL node map accessible via GetTLNodeMap()
tl = camera.GetTLNodeMap()
tl["HeartbeatTimeout"].Value     = ${tlConfig.heartbeatTimeout}
tl["ReadTimeout"].Value          = ${tlConfig.readTimeout}
tl["WriteTimeout"].Value         = ${tlConfig.writeTimeout}
tl["MaxRetryCountRead"].Value    = ${tlConfig.maxRetryCountRead}
tl["MaxRetryCountWrite"].Value   = ${tlConfig.maxRetryCountWrite}
tl["ConnectionGuardEnable"].Value = ${tlConfig.connectionGuardEnable}
${tlConfig.enablePersistentIp ? `
# C++ GigE IP configuration
# cam.ChangeIpConfiguration(true, ${tlConfig.enableDhcp})
# cam.SetPersistentIpAddress(
#   "${tlConfig.persistentIp || '192.168.0.201'}",
#   "${tlConfig.persistentSubnet}",
#   "${tlConfig.persistentGateway}")
` : ''}`}</pre>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ TAB: PREVIEW ══════════════════════════════════════════════════════ */}
                {activeTab === 'preview' && (
                    <div className="basler-preview-section">
                        <div className="basler-preview-header">
                            <div className="preview-info">
                                <span className="preview-live-dot" />
                                <strong>{backendOk ? 'REAL ✔' : 'SIMULADO'}</strong>
                                <span>{selected?.modelName} · {config.pixelFormat} · {config.width}×{config.height}</span>
                                {backendOk && (
                                    <span style={{ color: '#00ff64', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                        {serverFps > 0 ? `${serverFps} fps · frame #${serverFrames}` : t('connStream')}
                                    </span>
                                )}
                                {calActive && (
                                    <span style={{ marginLeft: 8, background: '#a78bfa20', border: '1px solid #a78bfa50', padding: '2px 8px', borderRadius: 4, color: '#c4b5fd', fontSize: '0.75rem' }}>
                                        ✨ Calibración Activa
                                    </span>
                                )}
                            </div>

                            {/* ── Selector de tipo de captura (Mástil/Bastidor) ── */}
                            <div className="target-selector" style={{ margin: '0 auto', minWidth: '240px', marginBottom: 0 }}>
                                <button
                                    className={`target-btn ${saveDir.includes('MASTILES') ? 'active' : ''}`}
                                    onClick={() => {
                                        setSaveDir('C:\\Users\\franj\\OneDrive\\Escritorio\\COSAS  FRAN\\PROYECTOS\\PINTURA\\ROBOTFLOW\\FOTOS\\MASTILES');
                                        setVideoDir('C:\\Users\\franj\\OneDrive\\Escritorio\\COSAS  FRAN\\PROYECTOS\\PINTURA\\ROBOTFLOW\\VIDEOS\\MASTILES');
                                    }}
                                >
                                    {t('mast')}
                                </button>
                                <button
                                    className={`target-btn ${saveDir.includes('BASTIDOR') ? 'active' : ''}`}
                                    onClick={() => {
                                        setSaveDir('C:\\Users\\franj\\OneDrive\\Escritorio\\COSAS  FRAN\\PROYECTOS\\PINTURA\\ROBOTFLOW\\FOTOS\\BASTIDOR');
                                        setVideoDir('C:\\Users\\franj\\OneDrive\\Escritorio\\COSAS  FRAN\\PROYECTOS\\PINTURA\\ROBOTFLOW\\VIDEOS\\BASTIDORES');
                                    }}
                                >
                                    {t('frame')}
                                </button>
                            </div>

                            <button className="basler-btn disconnect small" onClick={handleDisconnect}>⏹ StopGrabbing</button>
                        </div>

                        {/* LAYOUT: stream + panel captura */}
                        <div className="preview-main-layout">

                            {/* ── Video stream ─────────────────────────────────── */}
                            <div className="preview-stream-col">

                                /* Barra de zoom */
                                <div className="zoom-bar">
                                    <button className="zoom-btn" onClick={zoomOut} title={t('zoomOut')}>−</button>
                                    <input
                                        type="range" min={1} max={8} step={0.05}
                                        value={zoomLevel}
                                        className="zoom-slider"
                                        onChange={e => {
                                            const nv = parseFloat(e.target.value);
                                            setZoomLevel(nv);
                                            if (nv <= 1) setPanOffset({ x: 0, y: 0 });
                                        }}
                                    />
                                    <button className="zoom-btn" onClick={zoomIn} title={t('zoomIn')}>+</button>
                                    <span className="zoom-label">{Math.round(zoomLevel * 100)}%</span>
                                    {zoomLevel > 1 && (
                                        <button className="zoom-btn zoom-reset" onClick={zoomReset} title={t('zoomReset')}>⊙</button>
                                    )}
                                    <button
                                        className="zoom-btn panel-toggle-btn"
                                        onClick={() => setPanelOpen(o => !o)}
                                        title={panelOpen ? t('hidePanel') : t('showPanel')}
                                        style={{ marginLeft: 'auto' }}
                                    >
                                        {panelOpen ? '⟩' : '⟨'}
                                    </button>
                                </div>

                                {/* Contenedor del stream con zoom/pan */}
                                <div
                                    ref={streamWrapRef}
                                    className="stream-zoom-wrap"
                                    onWheel={handleWheel}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                    style={{ cursor: zoomLevel > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
                                >
                                    {backendOk ? (
                                        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <img
                                                key={streamKey}
                                                src={`http://127.0.0.1:8765/api/stream?t=${streamKey}`}
                                                alt="Basler MJPEG Stream" onClick={handleStreamClick} onMouseMove={handleStreamMove} onMouseLeave={handleStreamLeave}
                                                className="stream-zoom-img"
                                                draggable={false}
                                                style={{
                                                    transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                                                    transformOrigin: 'center center',
                                                    cursor: measureActive ? 'crosshair' : 'grab',
                                                    pointerEvents: measureActive ? 'auto' : 'none'
                                                }}
                                                onError={() => log('error', 'Error cargando stream MJPEG')}
                                            />
                                            {measureActive && (
                                                <svg viewBox={`0 0 ${config.width || 1920} ${config.height || 1080}`} preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)` }}>
                                                    {measurePoints.map((p, i) => (
                                                        <circle key={`m-${i}`} cx={p.x} cy={p.y} r={(config.width || 1920) / 500} fill="#0d1117" stroke="#00ff64" strokeWidth={(config.width || 1920) / 700} />
                                                    ))}
                                                    {measurePoints.length === 2 && (
                                                        <line x1={measurePoints[0].x} y1={measurePoints[0].y} x2={measurePoints[1].x} y2={measurePoints[1].y} stroke="#00ff64" strokeWidth={(config.width || 1920) / 600} strokeDasharray="10,8" />
                                                    )}
                                                    {measurePoints.length === 1 && measureHover && (
                                                        <line x1={measurePoints[0].x} y1={measurePoints[0].y} x2={measureHover.x} y2={measureHover.y} stroke="#00ff64" strokeWidth={(config.width || 1920) / 600} strokeDasharray="10,8" opacity={0.7} />
                                                    )}
                                                </svg>
                                            )}
                                        </div>
                                    ) : (
                                        <canvas
                                            ref={canvasRef} width={640} height={400}
                                            className="stream-zoom-img"
                                            style={{
                                                transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                                                transformOrigin: 'center center',
                                            }}
                                        />
                                    )}

                                    {/* Indicador de zoom flotante */}
                                    {zoomLevel > 1 && (
                                        <div className="zoom-overlay-badge">
                                            🔍 {Math.round(zoomLevel * 100)}%
                                        </div>
                                    )}
                                </div>

                                {/* Chips de métricas debajo del stream */}
                                <div className="preview-metrics">
                                    <div className="metric-chip">{backendOk ? '✔ camera_server.py' : '⚠ Simulado'}</div>
                                    <div className="metric-chip">{config.pixelFormat}</div>
                                    <div className="metric-chip">Exp: {config.exposureTimeAbs.toLocaleString()} µs</div>
                                    <div className="metric-chip">Gain: {config.gainRaw} raw</div>
                                    <div className="metric-chip">{backendOk ? `${serverFps} fps` : `${config.acquisitionFrameRateAbs.toFixed(1)} fps`}</div>
                                    <div className="metric-chip">IP: {selected?.ipAddress ?? '192.168.0.201'}</div>
                                </div>
                            </div>

                            {/* ── Panel de captura + grabación (colapsable) ────────── */}
                            {panelOpen && (<div className="capture-panel">


                                <div className="capture-panel-title">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00ff64" strokeWidth="1.8">
                                        <circle cx="12" cy="12" r="4" />
                                        <path d="M20.94 13A9 9 0 1 1 11 3.06" />
                                        <path d="M2 8h2M4 4l2 2M8 2v2" />
                                    </svg>
                                    {t('capImage')}
                                </div>

                                <div className="capture-field">
                                    <label>📁 {t('dirPhotos')}</label>
                                    <input id="save-dir-input" className="basler-input capture-input"
                                        placeholder="Ej: C:\Fotos_Basler" value={saveDir}
                                        onChange={e => setSaveDir(e.target.value)} spellCheck={false} />
                                    <span className="basler-hint">{t('createIfNone')}</span>
                                </div>

                                <div className="capture-field">
                                    <label>🏷 {t('fileNameOpt')}</label>
                                    <input id="filename-input" className="basler-input capture-input"
                                        placeholder={t('autoFile')}
                                        value={customFilename} onChange={e => setCustomFilename(e.target.value)}
                                        spellCheck={false} />
                                </div>

                                <button id="capture-btn"
                                    className={`basler-btn capture-btn ${capturing ? 'loading' : ''}`}
                                    onClick={handleSnapshot}
                                    disabled={capturing || !isConnected || !backendOk}>
                                    {capturing ? <><span className="spin">↻</span> {t('saving')}</> : `📸 ${t('takePhoto')}`}
                                </button>

                                {captureMsg && <div className={`capture-result ${captureMsg.ok ? 'ok' : 'err'}`}>{captureMsg.text}</div>}

                                {/* Galería fotos */}
                                {gallery && gallery.length > 0 && (
                                    <div className="capture-gallery">
                                        <div className="capture-gallery-title">📂 {t('photos')} ({gallery.length})</div>
                                        {gallery.map((g, i) => (
                                            <div key={i} className="capture-gallery-item">
                                                <div className="gallery-item-info">
                                                    <span className="gallery-filename">{g.filename}</span>
                                                    <span className="gallery-meta">{g.size_kb} KB · {g.time}</span>
                                                </div>
                                                <div className="gallery-item-path" title={g.path}>{g.path}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ═══ DIVIDER ═══ */}
                                <div className="capture-divider" />

                                {/* ═══ SECCIÓN VÍDEO ═══ */}
                                <div className="capture-panel-title" style={{ color: isRecording ? '#ff4444' : '#e6edf3' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        stroke={isRecording ? '#ff4444' : '#ff6b6b'} strokeWidth="1.8">
                                        <polygon points="23 7 16 12 23 17 23 7" />
                                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                    </svg>
                                    {isRecording
                                        ? <span className="rec-blink">● REC {Math.floor(recElapsed / 60).toString().padStart(2, '0')}:{(recElapsed % 60).toString().padStart(2, '0')}  ·  {recFrames}f</span>
                                        : t('recVideo')
                                    }
                                </div>

                                <div className="capture-field">
                                    <label>📁 {t('dirVideos')}</label>
                                    <input id="video-dir-input" className="basler-input capture-input"
                                        placeholder="Ej: C:\Videos_Basler" value={videoDir}
                                        onChange={e => setVideoDir(e.target.value)}
                                        disabled={isRecording} spellCheck={false} />
                                    <span className="basler-hint">{t('createIfNone')}</span>
                                </div>

                                <div className="capture-field">
                                    <label>🏷 {t('nameVideo')}</label>
                                    <input id="video-filename-input" className="basler-input capture-input"
                                        placeholder={t('autoFile')}
                                        value={videoFilename} onChange={e => setVideoFilename(e.target.value)}
                                        disabled={isRecording} spellCheck={false} />
                                </div>

                                <div className="rec-options-row">
                                    <div className="capture-field" style={{ flex: 1 }}>
                                        <label>FPS</label>
                                        <select className="basler-input capture-input"
                                            value={videoFps} onChange={e => setVideoFps(Number(e.target.value))}
                                            disabled={isRecording}>
                                            {[5, 10, 15, 20, 25, 30].map(f => <option key={f} value={f}>{f} fps</option>)}
                                        </select>
                                    </div>
                                    <div className="capture-field" style={{ flex: 1 }}>
                                        <label>Codec</label>
                                        <select className="basler-input capture-input"
                                            value={videoCodec} onChange={e => setVideoCodec(e.target.value as 'MJPG' | 'mp4v')}
                                            disabled={isRecording}>
                                            <option value="MJPG">MJPG (.avi)</option>
                                            <option value="mp4v">MP4V (.mp4)</option>
                                        </select>
                                    </div>
                                </div>

                                {!isRecording ? (
                                    <button id="rec-start-btn"
                                        className="basler-btn rec-btn"
                                        onClick={handleRecordStart}
                                        disabled={!isConnected || !backendOk}>
                                        ● {t('startRec')}
                                    </button>
                                ) : (
                                    <button id="rec-stop-btn"
                                        className="basler-btn rec-stop-btn"
                                        onClick={handleRecordStop}>
                                        ⏹ {t('stopRec')}
                                    </button>
                                )}

                                {recMsg && <div className={`capture-result ${recMsg.ok ? 'ok' : 'err'}`}>{recMsg.text}</div>}

                                {/* Galería vídeos */}
                                {videoGallery && videoGallery.length > 0 && (
                                    <div className="capture-gallery">
                                        <div className="capture-gallery-title">🎬 {t('videos')} ({videoGallery.length})</div>
                                        {videoGallery.map((v, i) => (
                                            <div key={i} className="capture-gallery-item">
                                                <div className="gallery-item-info">
                                                    <span className="gallery-filename">{v.filename}</span>
                                                    <span className="gallery-meta">{v.size_mb} MB · {v.duration_s}s</span>
                                                </div>
                                                <div className="gallery-item-path" title={v.path}>{v.path}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Aviso si no hay backend */}
                                {!backendOk && (
                                    <div className="capture-result err">⚠ {t('needServer')}</div>
                                )}

                                {/* ═══ DIVIDER ═══ */}
                                <div className="capture-divider" />

                                {/* ═══ SECCIÓN SAM 3 — ELIMINAR PERSONAS EN TIEMPO REAL ═══ */}
                                <div className="capture-panel-title" style={{ color: '#c4b5fd' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8">
                                        <circle cx="12" cy="8" r="4" />
                                        <path d="M5 20v-2a7 7 0 0 1 14 0v2" />
                                        <line x1="4" y1="4" x2="20" y2="20" stroke="#ff6b6b" strokeWidth="2.5" />
                                    </svg>
                                    🧠 Eliminar Personas — SAM3 Roboflow
                                </div>

                                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: 8, fontStyle: 'italic', padding: '4px 0' }}>
                                    Segmentación SAM3 via Roboflow (find-people) — ~1-3 FPS, detección real de personas
                                </div>

                                <div className="capture-field">
                                    <label>🎯 Confianza SAM3: <strong>{Math.round(sam3LiveConfidence * 100)}%</strong></label>
                                    <input
                                        type="range" className="basler-slider"
                                        min={0.05} max={1.0} step={0.05}
                                        value={sam3LiveConfidence}
                                        onChange={e => setSam3LiveConfidence(parseFloat(e.target.value))}
                                        disabled={sam3LiveActive}
                                    />
                                    <div className="slider-labels"><span>Baja (más detecciones)</span><span>Alta (más preciso)</span></div>
                                </div>

                                <div className="capture-field">
                                    <label>🎨 Color de relleno</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <input
                                            type="color"
                                            value={sam3FillColor}
                                            onChange={e => setSam3FillColor(e.target.value)}
                                            disabled={sam3LiveActive}
                                            style={{
                                                width: 36, height: 28, border: '1px solid #30363d',
                                                borderRadius: 4, cursor: sam3LiveActive ? 'not-allowed' : 'pointer',
                                                background: 'transparent',
                                            }}
                                        />
                                        <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>
                                            {sam3FillColor.toUpperCase()} — Las personas se rellenan con este color
                                        </span>
                                    </div>
                                </div>

                                <button
                                    className={`basler-btn capture-btn ${sam3LiveLoading ? 'loading' : ''}`}
                                    onClick={handleSam3LiveToggle}
                                    disabled={sam3LiveLoading || !isConnected || !backendOk}
                                    style={{
                                        background: sam3LiveActive
                                            ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                                            : sam3LiveLoading
                                                ? '#a78bfa30'
                                                : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                                        borderColor: sam3LiveActive ? '#ef444460' : '#a78bfa60',
                                        color: '#fff',
                                    }}
                                >
                                    {sam3LiveLoading
                                        ? <><span className="spin">↻</span> Procesando...</>
                                        : sam3LiveActive
                                            ? '⏹ DETENER Eliminación en Vivo'
                                            : '▶ ACTIVAR Eliminación en Vivo'
                                    }
                                </button>

                                {/* Indicador de estado en vivo */}
                                {sam3LiveActive && (
                                    <div style={{
                                        marginTop: 8,
                                        padding: '10px 12px',
                                        background: 'rgba(124, 58, 237, 0.15)',
                                        border: '1px solid #a78bfa40',
                                        borderRadius: 8,
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                            <span style={{
                                                display: 'inline-block', width: 10, height: 10,
                                                borderRadius: '50%', background: '#22c55e',
                                                animation: 'pulse 1.5s ease-in-out infinite',
                                                boxShadow: '0 0 8px #22c55e80',
                                            }} />
                                            <span style={{ color: '#c4b5fd', fontWeight: 700, fontSize: '0.85rem' }}>
                                                🧠 SAM3 ROBOFLOW ACTIVO
                                            </span>
                                        </div>

                                        {sam3LiveStatus && (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: '0.75rem', color: '#9ca3af' }}>
                                                <div>👤 Siluetas detectadas: <strong style={{ color: sam3LiveStatus.persons_found > 0 ? '#f97316' : '#22c55e' }}>
                                                    {sam3LiveStatus.persons_found}
                                                </strong></div>
                                                <div>⚡ FPS: <strong style={{ color: '#60a5fa' }}>
                                                    {sam3LiveStatus.fps}
                                                </strong></div>
                                                <div>🖼 Frames: <strong style={{ color: '#a78bfa' }}>
                                                    {sam3LiveStatus.frames_processed}
                                                </strong></div>
                                                {sam3LiveStatus.error && (
                                                    <div style={{ gridColumn: '1 / -1', color: '#f87171' }}>
                                                        ⚠ {sam3LiveStatus.error}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: 6, fontStyle: 'italic' }}>
                                            Contornos reales de siluetas — relleno + borde dibujado
                                        </div>
                                    </div>
                                )}

                            </div>)}{/* /capture-panel */}
                        </div>{/* /preview-main-layout */}

                    </div>
                )}

                {/* â•”â•â• TAB: CALIBRACIÃ“N â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•— */}
                {/* ── TAB: CALIBRACIÓN ── */}
                    <div style={{ display: activeTab === 'calibration' ? 'flex' : 'none', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0 }}>

                        <div className="preview-main-layout">

                            {/* â”€â”€ Columna izquierda: stream en vivo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                            <div className="preview-stream-col">

                                {/* Estado de conexiÃ³n */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                    <div className="preview-live-dot"
                                        style={{ background: isConnected && backendOk ? '#00ff64' : '#ff4444' }} />
                                    <span style={{ fontSize: '0.82rem', color: '#8b949e' }}>
                                        {backendOk ? 'âœ” camera_server.py' : 'âš  Sin servidor'}
                                        {' Â· '}
                                        {isConnected ? (selected?.modelName ?? 'CÃ¡mara conectada') : 'Desconectada'}
                                    </span>
                                    <span style={{ marginLeft: 'auto', fontFamily: 'monospace', fontSize: '0.78rem', color: '#00ff64' }}>
                                        {backendOk ? `${serverFps} fps` : `${config.acquisitionFrameRateAbs.toFixed(1)} fps`}
                                    </span>
                                </div>

                                {calActive && (
                                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, background: '#00ff6415', border: '1px solid #00ff6450', padding: '6px 12px', borderRadius: 6, fontSize: '0.78rem', color: '#00ff64' }}>
                                        <span>✨ Filtro Calibración Activo (RMS {calActiveRms?.toFixed(4)})</span>
                                        <button className="basler-tab-mini" style={{ marginLeft: 'auto', borderColor: '#ff444450', color: '#ff4444' }} onClick={handleCalRemove}>🗑 Quitar</button>
                                    </div>
                                )}



                                {/* Stream MJPEG – idéntico al del Preview tab */}
                                <div className="stream-zoom-wrap" style={{ cursor: 'default', minHeight: 340, position: 'relative' }}>
                                    {backendOk && isConnected ? (
                                        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <img
                                                key={streamKey}
                                                src={`http://127.0.0.1:8765/api/stream?t=${streamKey}`}
                                                alt="Calibration MJPEG Stream" onClick={handleStreamClick} onMouseMove={handleStreamMove} onMouseLeave={handleStreamLeave}
                                                className="stream-zoom-img"
                                                draggable={false}
                                                style={{ transform: 'none', objectFit: 'contain', cursor: measureActive ? 'crosshair' : 'default', pointerEvents: measureActive ? 'auto' : 'none' }}
                                                onError={() => log('error', 'Error cargando stream (calibración)')}
                                            />
                                            {measureActive && (
                                                <svg viewBox={`0 0 ${config.width || 1920} ${config.height || 1080}`} preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                                                    {measurePoints.map((p, i) => (
                                                        <circle key={`m2-${i}`} cx={p.x} cy={p.y} r={(config.width || 1920) / 500} fill="#0d1117" stroke="#00ff64" strokeWidth={(config.width || 1920) / 700} />
                                                    ))}
                                                    {measurePoints.length === 2 && (
                                                        <line x1={measurePoints[0].x} y1={measurePoints[0].y} x2={measurePoints[1].x} y2={measurePoints[1].y} stroke="#00ff64" strokeWidth={(config.width || 1920) / 600} strokeDasharray="10,8" />
                                                    )}
                                                    {measurePoints.length === 1 && measureHover && (
                                                        <line x1={measurePoints[0].x} y1={measurePoints[0].y} x2={measureHover.x} y2={measureHover.y} stroke="#00ff64" strokeWidth={(config.width || 1920) / 600} strokeDasharray="10,8" opacity={0.7} />
                                                    )}
                                                </svg>
                                            )}
                                        </div>
                                    ) : (
                                        scaleCalImageSrc ? (
                                            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                <canvas
                                                    ref={scaleCalCanvasRef}
                                                    onClick={handleScaleCalCanvasClick}
                                                    onWheel={handleCalCanvasWheel}
                                                    onMouseDown={handleCalCanvasMouseDown}
                                                    onMouseMove={handleCalCanvasMouseMove}
                                                    onMouseUp={handleCalCanvasMouseUp}
                                                    onMouseLeave={handleCalCanvasMouseUp}
                                                    onContextMenu={e => e.preventDefault()}
                                                    style={{
                                                        display: 'block', width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'auto',
                                                        cursor: measureActive ? 'crosshair' : calPanMode ? (calDragging.current ? 'grabbing' : 'grab') : calZoomMode ? 'zoom-in' : 'default',
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div style={{
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                width: '100%', minHeight: 400,
                                                background: '#0d1117', border: '2px dashed #30363d', borderRadius: 10,
                                                color: '#8b949e', gap: 12, transition: 'border-color 0.2s, background 0.2s',
                                            }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#a78bfa'; (e.currentTarget as HTMLElement).style.background = '#0d111799'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#30363d'; (e.currentTarget as HTMLElement).style.background = '#0d1117'; }}
                                                onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLElement).style.borderColor = '#58a6ff'; }}
                                                onDragLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#30363d'; }}
                                                onDrop={e => {
                                                    e.preventDefault();
                                                    (e.currentTarget as HTMLElement).style.borderColor = '#30363d';
                                                    const file = e.dataTransfer.files?.[0];
                                                    if (file && file.type.startsWith('image/')) {
                                                        const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
                                                        handleScaleCalImageUpload(fakeEvent);
                                                    }
                                                }}
                                            >
                                                <span style={{ fontSize: '3rem' }}>📷</span>
                                                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#c4b5fd' }}>Subir Imagen de Referencia</span>
                                                <span style={{ fontSize: '0.78rem', color: '#484f58', maxWidth: 280, textAlign: 'center' }}>
                                                    Sube una imagen con una medida conocida para calibrar la escala mm/px
                                                </span>
                                                <label style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                                    padding: '10px 28px', marginTop: 8,
                                                    fontSize: '0.95rem', fontWeight: 700,
                                                    background: 'linear-gradient(135deg, #1f6feb, #1a56db)',
                                                    border: '2px solid #58a6ff60',
                                                    borderRadius: 8, color: '#fff',
                                                    cursor: 'pointer', letterSpacing: '0.3px',
                                                    transition: 'all 0.2s',
                                                    boxShadow: '0 2px 10px #1f6feb40',
                                                }}
                                                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 18px #1f6feb60'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 10px #1f6feb40'; }}
                                                >
                                                    📤 Subir Imagen
                                                    <input type="file" accept="image/*" onChange={handleScaleCalImageUpload} style={{ display: 'none' }} />
                                                </label>
                                            </div>
                                        )
                                    )}


                                    {/* Zoom and Pan toggle buttons */}
                                    {(scaleCalImageSrc || (backendOk && isConnected)) && (
                                        <div style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 5, display: 'flex', gap: 4 }}>
                                            <button
                                                style={{
                                                    padding: '5px 12px', fontSize: '0.72rem', fontWeight: 600,
                                                    border: `1px solid ${calZoomMode ? '#1f6feb' : '#30363d'}`,
                                                    borderRadius: 5, cursor: 'pointer',
                                                    background: calZoomMode ? '#1f6feb25' : 'rgba(0,0,0,0.75)',
                                                    color: calZoomMode ? '#1f6feb' : '#8b949e',
                                                    backdropFilter: 'blur(4px)',
                                                }}
                                                onClick={() => { setCalZoomMode(z => !z); setCalPanMode(false); }}
                                            >🔍 Zoom</button>
                                            <button
                                                style={{
                                                    padding: '5px 12px', fontSize: '0.72rem', fontWeight: 600,
                                                    border: `1px solid ${calPanMode ? '#ff6b35' : '#30363d'}`,
                                                    borderRadius: 5, cursor: 'pointer',
                                                    background: calPanMode ? '#ff6b3525' : 'rgba(0,0,0,0.75)',
                                                    color: calPanMode ? '#ff6b35' : '#8b949e',
                                                    backdropFilter: 'blur(4px)',
                                                }}
                                                onClick={() => { setCalPanMode(p => !p); setCalZoomMode(false); }}
                                            >✋ Mover</button>
                                            {calZoom !== 1 && (
                                                <>
                                                    <span style={{ padding: '5px 4px', fontSize: '0.7rem', fontFamily: 'monospace', color: '#1f6feb' }}>{(calZoom * 100).toFixed(0)}%</span>
                                                    <button style={{ background: 'none', border: '1px solid #30363d', borderRadius: 5, color: '#ff6b35', cursor: 'pointer', fontSize: '0.65rem', padding: '4px 8px' }}
                                                        onClick={() => { setCalZoom(1); setCalPan({ x: 0, y: 0 }); }}>⟲ Reset</button>
                                                </>
                                            )}
                                        </div>
                                    )}




                                    {/* Overlay: parÃ¡metros tablero */}
                                    <div style={{
                                        position: 'absolute', bottom: 44, left: 10,
                                        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)',
                                        border: '1px solid #a78bfa50', borderRadius: 6,
                                        padding: '4px 10px', fontSize: '0.72rem', fontFamily: 'monospace',
                                        color: '#c4b5fd', pointerEvents: 'none',
                                    }}>
                                        {String.fromCodePoint(0x1F4D0)} {calCols}x{calRows} {'\u00B7'} {calSquare} mm
                                    </div>

                                    {/* Overlay: contador imÃ¡genes */}
                                    {calImages.length > 0 && (
                                        <div style={{
                                            position: 'absolute', top: 10, right: 10,
                                            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
                                            border: '1px solid #00ff6445', borderRadius: 6,
                                            padding: '4px 10px', fontSize: '0.72rem', fontFamily: 'monospace',
                                            color: '#00ff64', pointerEvents: 'none',
                                        }}>
                                            {String.fromCodePoint(0x1F4F8)} {calImages.length} {'\u00B7'} {'\u2714'} {calImages.filter(i => i.corners).length} {t('calValid')}
                                        </div>
                                    )}
                                </div>


                                {/* Chips de mÃ©tricas */}
                                <div className="preview-metrics">
                                    <div className="metric-chip">{config.pixelFormat}</div>
                                    <div className="metric-chip">Exp: {config.exposureTimeAbs.toLocaleString()} {'\u00B5'}s</div>
                                    <div className="metric-chip">Gain: {config.gainRaw} raw</div>
                                    <div className="metric-chip">IP: {selected?.ipAddress ?? '192.168.0.201'}</div>
                                </div>

                                {/* Resultados debajo del stream */}
                                {calResult ? (
                                    <div className="basler-panel" style={{ marginTop: 4 }}>
                                        <div className="basler-panel-header">
                                            <span>{String.fromCodePoint(0x1F3AF)} {t('calResults')}</span>
                                        </div>
                                        <div className="basler-config-form">

                                            {/* RMS badge */}
                                            <div style={{
                                                background: calResult.rms < 0.5 ? 'rgba(0,255,100,0.08)' : calResult.rms < 1.0 ? 'rgba(255,165,0,0.08)' : 'rgba(255,68,68,0.08)',
                                                border: `1px solid ${calResult.rms < 0.5 ? '#00ff64' : calResult.rms < 1.0 ? '#ffa500' : '#ff4444'}`,
                                                borderRadius: 8, padding: '10px 14px',
                                                display: 'flex', alignItems: 'center', gap: 12,
                                            }}>
                                                <span style={{ fontSize: '1.8rem' }}>
                                                    {calResult.rms < 0.5 ? '\u2705' : calResult.rms < 1.0 ? '\u26A0\uFE0F' : '\u274C'}
                                                </span>
                                                <div>
                                                    <div style={{
                                                        fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 'bold',
                                                        color: calResult.rms < 0.5 ? '#00ff64' : calResult.rms < 1.0 ? '#ffa500' : '#ff4444',
                                                    }}>
                                                        RMS = {calResult.rms.toFixed(4)} px
                                                    </div>
                                                    <div style={{ fontSize: '0.73rem', color: '#8b949e' }}>
                                                        {calResult.rms < 0.5 ? t('calRmsGood') : calResult.rms < 1.0 ? t('calRmsMed') : t('calRmsBad')}
                                                        {' \u00B7 '}{calResult.image_count} {t('calImagesUsed')}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                                {/* Matriz K */}
                                                <div>
                                                    <div className="basler-panel-header" style={{ marginBottom: 6, fontSize: '0.76rem' }}>
                                                        <span>{String.fromCodePoint(0x1F52D)} {t('calIntrinsic')}</span>
                                                    </div>
                                                    <div className="cal-matrix">
                                                        <div className="cal-matrix-grid">
                                                            <div className="cal-cell">fx={calResult.fx.toFixed(1)}</div>
                                                            <div className="cal-cell">0</div>
                                                            <div className="cal-cell">cx={calResult.cx.toFixed(1)}</div>
                                                            <div className="cal-cell">0</div>
                                                            <div className="cal-cell">fy={calResult.fy.toFixed(1)}</div>
                                                            <div className="cal-cell">cy={calResult.cy.toFixed(1)}</div>
                                                            <div className="cal-cell">0</div>
                                                            <div className="cal-cell">0</div>
                                                            <div className="cal-cell">1</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* DistorsiÃ³n */}
                                                <div>
                                                    <div className="basler-panel-header" style={{ marginBottom: 6, fontSize: '0.76rem' }}>
                                                        <span>{String.fromCodePoint(0x1F300)} {t('calDistortion')}</span>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                                                        {([['k1', calResult.k1], ['k2', calResult.k2], ['k3', calResult.k3], ['p1', calResult.p1], ['p2', calResult.p2]] as [string, number][]).map(([name, val]) => (
                                                            <div key={name} className="cal-dist-chip">
                                                                <span className="cal-dist-name">{name}</span>
                                                                <span className="cal-dist-val">{val.toFixed(5)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CÃ³digo Python */}
                                            <div className="basler-code-preview">
                                                <div className="code-preview-header">{String.fromCodePoint(0x2328)} Python / OpenCV &mdash; Undistort</div>
                                                <pre className="code-preview-content">{
                                                    `import cv2, numpy as np

camera_matrix = np.array([
    [${calResult.fx.toFixed(2)}, 0, ${calResult.cx.toFixed(2)}],
    [0, ${calResult.fy.toFixed(2)}, ${calResult.cy.toFixed(2)}],
    [0, 0, 1]
])
dist_coeffs = np.array([[${calResult.k1.toFixed(6)}, ${calResult.k2.toFixed(6)}, ${calResult.p1.toFixed(6)}, ${calResult.p2.toFixed(6)}, ${calResult.k3.toFixed(6)}]])

h, w = frame.shape[:2]
new_mtx, roi = cv2.getOptimalNewCameraMatrix(camera_matrix, dist_coeffs, (w,h), 1, (w,h))
undistorted   = cv2.undistort(frame, camera_matrix, dist_coeffs, None, new_mtx)`
                                                }</pre>
                                            </div>

                                            {/* ─── Visor comparativo: Patrón vs Corregida ─── */}
                                            {calResult.corrected_files && calResult.corrected_files.length > 0 && (
                                                <div style={{ marginTop: 16 }}>
                                                    {/* Cabecera del visor */}
                                                    <div className="basler-panel-header" style={{ marginBottom: 8, fontSize: '0.76rem' }}>
                                                        <span>🖼 Comparación: Patrón vs Corregida</span>
                                                        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                                                            <button
                                                                className={`basler-tab-mini ${calPreviewMode === 'pattern' ? 'active' : ''}`}
                                                                style={calPreviewMode === 'pattern' ? { background: '#a78bfa20', color: '#a78bfa', borderColor: '#a78bfa' } : {}}
                                                                onClick={() => setCalPreviewMode('pattern')}>
                                                                🔲 Patrón
                                                            </button>
                                                            <button
                                                                className={`basler-tab-mini ${calPreviewMode === 'corrected' ? 'active' : ''}`}
                                                                style={calPreviewMode === 'corrected' ? { background: '#00ff6420', color: '#00ff64', borderColor: '#00ff64' } : {}}
                                                                onClick={() => setCalPreviewMode('corrected')}>
                                                                ✅ Corregida
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Visor de imágenes */}
                                                    <div style={{ position: 'relative', background: '#0d1117', borderRadius: 8, overflow: 'hidden', border: '1px solid #30363d' }}>
                                                        {(() => {
                                                            const files = calPreviewMode === 'pattern' ? calResult.pattern_files! : calResult.corrected_files!;
                                                            const dir = calPreviewMode === 'pattern' ? calResult.pattern_dir! : calResult.corrected_dir!;
                                                            const idx = Math.min(calPreviewIdx, files.length - 1);
                                                            const fname = files[idx] ?? '';
                                                            const imgPath = dir + '\\' + fname;
                                                            const url = `${BACKEND}/api/calibration/preview?path=${encodeURIComponent(imgPath)}&t=${Date.now()}`;

                                                            return (
                                                                <>
                                                                    <img
                                                                        src={url}
                                                                        alt={`${calPreviewMode} ${fname}`}
                                                                        style={{ width: '100%', display: 'block', maxHeight: 320, objectFit: 'contain' }}
                                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                                    />
                                                                    {/* Overlay inferior de modo y contador */}
                                                                    <div style={{
                                                                        position: 'absolute', bottom: 8, left: 8,
                                                                        background: calPreviewMode === 'corrected' ? 'rgba(0,255,100,0.15)' : 'rgba(167,139,250,0.15)',
                                                                        border: `1px solid ${calPreviewMode === 'corrected' ? '#00ff64' : '#a78bfa'}`,
                                                                        borderRadius: 5, padding: '3px 8px',
                                                                        fontSize: '0.7rem', fontFamily: 'monospace',
                                                                        color: calPreviewMode === 'corrected' ? '#00ff64' : '#a78bfa',
                                                                        pointerEvents: 'none',
                                                                    }}>
                                                                        {calPreviewMode === 'corrected' ? '✅ Corregida' : '🔲 Patrón'} — {fname}
                                                                    </div>
                                                                    <div style={{
                                                                        position: 'absolute', bottom: 8, right: 8,
                                                                        background: 'rgba(0,0,0,0.8)', borderRadius: 5, padding: '3px 8px',
                                                                        fontSize: '0.7rem', fontFamily: 'monospace', color: '#8b949e',
                                                                        pointerEvents: 'none',
                                                                    }}>
                                                                        {idx + 1} / {files.length}
                                                                    </div>
                                                                </>
                                                            );
                                                        })()}
                                                    </div>

                                                    {/* Controles de navegación y paginación */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                                                        <button className="basler-btn disconnect small" style={{ flex: '0 0 auto', padding: '4px 12px' }}
                                                            onClick={() => setCalPreviewIdx(i => Math.max(0, i - 1))}
                                                            disabled={calPreviewIdx === 0}>
                                                            ◀
                                                        </button>
                                                        <div style={{ flex: 1, display: 'flex', gap: 4, overflowX: 'auto', padding: '2px 0' }}>
                                                            {(calResult.corrected_files ?? []).map((_, i) => (
                                                                <button key={i}
                                                                    className="basler-tab-mini"
                                                                    style={{
                                                                        flexShrink: 0, minWidth: 28, padding: '2px 6px',
                                                                        background: i === calPreviewIdx ? '#a78bfa20' : '',
                                                                        borderColor: i === calPreviewIdx ? '#a78bfa' : '',
                                                                        color: i === calPreviewIdx ? '#a78bfa' : '',
                                                                    }}
                                                                    onClick={() => setCalPreviewIdx(i)}>
                                                                    {i + 1}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <button className="basler-btn disconnect small" style={{ flex: '0 0 auto', padding: '4px 12px' }}
                                                            onClick={() => setCalPreviewIdx(i => Math.min((calResult.corrected_files?.length ?? 1) - 1, i + 1))}
                                                            disabled={calPreviewIdx >= (calResult.corrected_files?.length ?? 1) - 1}>
                                                            ▶
                                                        </button>
                                                    </div>

                                                    {/* Directorios de almacenamiento */}
                                                    <div style={{ marginTop: 8, fontSize: '0.68rem', color: '#484f58', fontFamily: 'monospace', lineHeight: 1.8 }}>
                                                        <div>📁 pattern/: <span style={{ color: '#8b949e' }}>{calResult.pattern_dir}</span></div>
                                                        <div>📁 corrected/: <span style={{ color: '#8b949e' }}>{calResult.corrected_dir}</span></div>
                                                    </div>

                                                    <div style={{ marginTop: 16 }}>
                                                        <button
                                                            className="basler-btn connect"
                                                            style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
                                                            onClick={handleCalApply}>
                                                            💾 Guardar y Aplicar Calibración al Stream
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                ) : (
                                    <div style={{
                                        marginTop: 6, padding: '14px 18px',
                                        background: '#161b22', border: '1px solid #30363d',
                                        borderRadius: 8, textAlign: 'center', color: '#8b949e', fontSize: '0.82rem',
                                    }}>
                                        <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{String.fromCodePoint(0x1F3AF)}</div>
                                        <strong style={{ color: '#cdd9e5' }}>{t('calNoResult')}</strong>
                                        <div style={{ marginTop: 4, fontSize: '0.75rem' }}>{t('calNoResultSub')}</div>
                                    </div>
                                )}
                            </div>

                            {/* â”€â”€ Panel derecho: config + captura + lista â”€â”€â”€â”€â”€â”€â”€â”€ */}
                            <div className="capture-panel">

                                {/* ── MEDICIÓN PARA CALIBRAR ── */}
                                <div
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none', marginBottom: 6 }}
                                    onClick={() => setCalMeasureCollapsed(v => !v)}
                                >
                                    <div className="capture-panel-title" style={{ margin: 0 }}>📏 Medición / Calibración Pixel</div>
                                    <span style={{ fontSize: '1rem', color: '#8b949e', transition: 'transform 0.2s', transform: calMeasureCollapsed ? 'rotate(0deg)' : 'rotate(90deg)' }}>▶</span>
                                </div>

                                {!calMeasureCollapsed && (<>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: measureActive ? '#1f6feb15' : '#0d1117', border: `1px solid ${measureActive ? '#1f6feb50' : '#30363d'}`, padding: '6px 12px', borderRadius: 6, marginBottom: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                            <button className={`basler-tab-mini ${measureActive ? 'active' : ''}`} style={measureActive ? { borderColor: '#1f6feb', color: '#1f6feb' } : {}} onClick={() => { setMeasureActive(!measureActive); setMeasurePoints([]); setMeasureHover(null); }}>
                                                📏 {measureActive ? 'Medición Activa' : 'Medir'}
                                            </button>
                                            {measureActive && (
                                                <div style={{ display: 'flex', gap: 0, border: '1px solid #30363d', borderRadius: 4, overflow: 'hidden' }}>
                                                    <button style={{ padding: '3px 10px', fontSize: '0.7rem', fontWeight: 600, border: 'none', cursor: 'pointer', background: measureMode === 'punto' ? '#1f6feb' : '#161b22', color: measureMode === 'punto' ? '#fff' : '#8b949e' }}
                                                        onClick={() => { setMeasureMode('punto'); setMeasurePoints([]); }}>● Punto</button>
                                                    <button style={{ padding: '3px 10px', fontSize: '0.7rem', fontWeight: 600, border: 'none', borderLeft: '1px solid #30363d', cursor: 'pointer', background: measureMode === 'segmentos' ? '#1f6feb' : '#161b22', color: measureMode === 'segmentos' ? '#fff' : '#8b949e' }}
                                                        onClick={() => { setMeasureMode('segmentos'); setMeasurePoints([]); }}>⊿ Segmentos</button>
                                                </div>
                                            )}
                                            {measureActive && (
                                                <button style={{ padding: '3px 10px', fontSize: '0.7rem', fontWeight: 600, border: `1px solid ${showLabels ? '#00ff6450' : '#30363d'}`, borderRadius: 4, cursor: 'pointer', background: showLabels ? '#00ff6418' : '#161b22', color: showLabels ? '#00ff64' : '#8b949e' }}
                                                    onClick={() => setShowLabels(v => !v)}>
                                                    {showLabels ? '👁 Etiquetas' : '👁‍🗨 Etiquetas'}
                                                </button>
                                            )}
                                            {(() => {
                                                if (measureMode === 'punto' && measurePoints.length === 2) {
                                                    const dPx = Math.hypot(measurePoints[1].x - measurePoints[0].x, measurePoints[1].y - measurePoints[0].y);
                                                    const mmVal = scaleCalMmPerPx > 0 ? dPx * scaleCalMmPerPx : 0;
                                                    return (<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                                                        <span style={{ fontSize: '0.82rem', color: '#1f6feb', fontWeight: 700 }}>⇿ {dPx.toFixed(1)} px</span>
                                                        {mmVal > 0 && <span style={{ fontSize: '0.82rem', color: '#00ff64', fontWeight: 700 }}>{mmVal.toFixed(2)} mm</span>}
                                                    </div>);
                                                }
                                                if (measureMode === 'segmentos' && measurePoints.length >= 4) {
                                                    const midAx = (measurePoints[0].x + measurePoints[1].x) / 2, midAy = (measurePoints[0].y + measurePoints[1].y) / 2;
                                                    const midBx = (measurePoints[2].x + measurePoints[3].x) / 2, midBy = (measurePoints[2].y + measurePoints[3].y) / 2;
                                                    const dPx = Math.hypot(midBx - midAx, midBy - midAy);
                                                    const mmVal = scaleCalMmPerPx > 0 ? dPx * scaleCalMmPerPx : 0;
                                                    return (<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                                                        <span style={{ fontSize: '0.82rem', color: '#00ff64', fontWeight: 700 }}>↔ {dPx.toFixed(1)} px</span>
                                                        {mmVal > 0 && <span style={{ fontSize: '0.82rem', color: '#00ff64', fontWeight: 700 }}>{mmVal.toFixed(2)} mm</span>}
                                                    </div>);
                                                }
                                                if (measureActive && measureMode === 'segmentos' && measurePoints.length < 4 && measurePoints.length > 0) {
                                                    return <span style={{ fontSize: '0.7rem', color: '#8b949e', marginLeft: 'auto' }}>{measurePoints.length <= 2 ? `Seg A: ${measurePoints.length}/2` : `Seg B: ${measurePoints.length - 2}/2`}</span>;
                                                }
                                                return null;
                                            })()}
                                            {measureActive && measurePoints.length > 0 && (
                                                <button className="basler-tab-mini" style={{ fontSize: '0.65rem', borderColor: '#ff444450', color: '#ff4444', padding: '2px 6px' }}
                                                    onClick={() => setMeasurePoints([])}>↺ Reset</button>
                                            )}
                                        </div>
                                        {measureActive && ((measureMode === 'punto' && measurePoints.length >= 2) || (measureMode === 'segmentos' && measurePoints.length >= 4)) && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4, background: '#0d111780', borderRadius: 6, padding: '8px 10px', border: '1px solid #1f6feb30' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{ fontSize: '0.78rem', color: '#ccc', whiteSpace: 'nowrap' }}>Distancia real:</span>
                                                    <input type="number" step="0.1" min="0.1" className="basler-input" style={{ width: 90, padding: '4px 6px', fontSize: '0.85rem' }}
                                                        value={scaleCalRealMm} onChange={e => setScaleCalRealMm(e.target.value)} placeholder="mm" />
                                                    <span style={{ fontSize: '0.78rem', color: '#8b949e' }}>mm</span>
                                                </div>
                                                <button className="basler-btn connect" style={{ padding: '8px', fontSize: '0.82rem' }}
                                                    onClick={saveScaleCalibration} disabled={!scaleCalRealMm || parseFloat(scaleCalRealMm) <= 0}>
                                                    💾 Guardar Calibración
                                                </button>
                                            </div>
                                        )}
                                        {scaleCalMmPerPx > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', background: '#00ff6410', border: '1px solid #00ff6430', borderRadius: 4, padding: '4px 8px', marginTop: 2 }}>
                                                <span style={{ color: '#00ff64', fontWeight: 700 }}>✓ {scaleCalMmPerPx.toFixed(4)} mm/px</span>
                                                <button className="basler-tab-mini" style={{ marginLeft: 'auto', fontSize: '0.65rem', borderColor: '#ff444450', color: '#ff4444' }} onClick={clearScaleCalibration}>Borrar</button>
                                            </div>
                                        )}
                                    </div>

                                </>)}

                                <div className="capture-divider" />

                                {/* ── ANALIZAR IMAGEN (Roboflow) ── */}
                                <div
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
                                    onClick={() => setCalAnalyzeCollapsed(v => !v)}
                                >
                                    <div className="capture-panel-title" style={{ margin: 0 }}>🔬 Analizar Imagen (Roboflow)</div>
                                    <span style={{ fontSize: '1rem', color: '#8b949e', transition: 'transform 0.2s', transform: calAnalyzeCollapsed ? 'rotate(0deg)' : 'rotate(90deg)' }}>▶</span>
                                </div>

                                {!calAnalyzeCollapsed && (<>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: '#BD00FF08', border: '1px solid #BD00FF30', padding: '8px 12px', borderRadius: 6, marginTop: 6 }}>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            <button
                                                className={`basler-btn ${calAnalyzing ? 'loading' : ''}`}
                                                style={{ padding: '6px 12px', fontSize: '0.78rem', background: '#BD00FF', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', flex: 1 }}
                                                onClick={analyzeCalImage}
                                                disabled={!scaleCalImageSrc || calAnalyzing}
                                            >
                                                {calAnalyzing ? <><span className="spin">↻</span> Analizando...</> : '🔬 ANALIZAR IMAGEN'}
                                            </button>
                                            <button
                                                style={{
                                                    padding: '6px 10px', fontSize: '0.7rem', fontWeight: 600,
                                                    border: `1px solid ${calShowDetectionLabels ? '#BD00FF50' : '#30363d'}`,
                                                    borderRadius: 4, cursor: 'pointer',
                                                    background: calShowDetectionLabels ? '#BD00FF18' : '#161b22',
                                                    color: calShowDetectionLabels ? '#BD00FF' : '#8b949e',
                                                }}
                                                onClick={() => setCalShowDetectionLabels(v => !v)}
                                            >
                                                {calShowDetectionLabels ? '👁 Rótulos' : '👁‍🗨 Rótulos'}
                                            </button>
                                        </div>
                                        {calDetections.length > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem', color: '#BD00FF', marginTop: 2 }}>
                                                <span>🔬 {calDetections.length} detecciones</span>
                                                <button className="basler-tab-mini" style={{ fontSize: '0.6rem', borderColor: '#ff444450', color: '#ff4444', marginLeft: 'auto' }}
                                                    onClick={() => { setCalDetections([]); setCalHiddenDetections(new Set()); setCalSelectedDetIdx(null); }}>Limpiar</button>
                                            </div>
                                        )}

                                        {/* ── LISTA DE ETIQUETAS DETECTADAS ── */}
                                        {calDetections.length > 0 && (
                                            <div style={{
                                                maxHeight: '220px', overflowY: 'auto', marginTop: 6,
                                                border: '1px solid #BD00FF30', borderRadius: 6,
                                                background: '#0d111780',
                                            }}>
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '5px 8px', borderBottom: '1px solid #BD00FF20',
                                                    fontSize: '0.68rem', fontWeight: 700, color: '#BD00FF',
                                                }}>
                                                    <span>🏷 Etiquetas detectadas</span>
                                                </div>
                                                {(() => {
                                                    // Filter detections by visibility from ConfigScreen
                                                    const _tolSaved = localStorage.getItem('trackTolerances');
                                                    const _hiddenClasses = new Set<string>();
                                                    if (_tolSaved) {
                                                        try {
                                                            const _tolArr: any[] = JSON.parse(_tolSaved);
                                                            _tolArr.forEach(t => { if (t.visible === false) _hiddenClasses.add(t.className); });
                                                        } catch (_) { /* ignore */ }
                                                    }
                                                    const visibleDetections = calDetections
                                                        .map((det, origIdx) => ({ det, origIdx }))
                                                        .filter(({ det }) => !(det.class && _hiddenClasses.has(det.class)));
                                                    return visibleDetections.map(({ det, origIdx }, idx) => {
                                                    const isHidden = calHiddenDetections.has(origIdx);
                                                    const isSelected = calSelectedDetIdx === origIdx;
                                                    const getClassColor = (cn: string) => {
                                                        const cols = ['#BD00FF', '#00FFFF', '#FF00FF', '#70FF00', '#FFBD00', '#FF0000', '#0070FF', '#FF00BD', '#00FF70', '#BDFF00'];
                                                        let h = 0; if (cn) for (let i = 0; i < cn.length; i++) h = cn.charCodeAt(i) + ((h << 5) - h);
                                                        return cols[Math.abs(h) % cols.length];
                                                    };
                                                    const detColor = det.class ? getClassColor(det.class) : '#BD00FF';
                                                    const conf = det.confidence ?? 1.0;
                                                    return (
                                                        <div
                                                            key={idx}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: 6,
                                                                padding: '4px 8px',
                                                                borderBottom: idx < calDetections.length - 1 ? '1px solid #21262d' : 'none',
                                                                background: isSelected ? '#BD00FF18' : 'transparent',
                                                                cursor: 'pointer',
                                                                opacity: isHidden ? 0.45 : 1,
                                                                transition: 'background 0.15s, opacity 0.15s',
                                                            }}
                                                            onClick={() => {
                                                                // Select/deselect on click
                                                                setCalSelectedDetIdx(prev => prev === idx ? null : idx);
                                                            }}
                                                        >

                                                            {/* Color indicator */}
                                                            <div style={{
                                                                width: 10, height: 10, borderRadius: '50%',
                                                                background: detColor, flexShrink: 0,
                                                                border: isSelected ? '2px solid #fff' : '1px solid #444',
                                                                boxShadow: isSelected ? `0 0 6px ${detColor}` : 'none',
                                                            }} />
                                                            {/* Label name */}
                                                            <span style={{
                                                                fontSize: '0.72rem', fontWeight: isSelected ? 700 : 500,
                                                                color: isSelected ? '#fff' : (isHidden ? '#484f58' : '#e6edf3'),
                                                                flex: 1,
                                                                textDecoration: isHidden ? 'line-through' : 'none',
                                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                            }}>
                                                                {det.class || 'Obj'}
                                                            </span>
                                                            {/* Confidence */}
                                                            <span style={{
                                                                fontSize: '0.62rem', color: '#8b949e', flexShrink: 0,
                                                            }}>
                                                                {(conf * 100).toFixed(0)}%
                                                            </span>
                                                            {/* Selection indicator */}
                                                            {isSelected && (
                                                                <span style={{ fontSize: '0.7rem', color: '#FFFF00', flexShrink: 0 }}>◆</span>
                                                            )}
                                                        </div>
                                                    );
                                                }); })()}
                                            </div>
                                        )}

                                        {!scaleCalImageSrc && (
                                            <div style={{ fontSize: '0.72rem', color: '#8b949e' }}>⚠ Sube una imagen primero para analizarla</div>
                                        )}

                                        <div className="capture-divider" style={{ margin: '6px 0' }} />

                                        {/* DEFINIR TRACK */}
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                                            <button
                                                style={{
                                                    padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700,
                                                    border: `2px solid ${trackMode ? '#FFFF00' : '#30363d'}`,
                                                    borderRadius: 4, cursor: 'pointer',
                                                    background: trackMode ? '#FFFF0018' : '#161b22',
                                                    color: trackMode ? '#FFFF00' : '#8b949e',
                                                }}
                                                onClick={() => { setTrackMode(m => !m); if (!trackMode) { setTrackPieceA(null); setTrackPieceB(null); } }}
                                                disabled={calDetections.length === 0}
                                            >
                                                🎯 {trackMode ? 'SELECCIONANDO...' : 'DEFINIR TRACK'}
                                            </button>
                                            {trackMode && (
                                                <span style={{ fontSize: '0.68rem', color: '#FFFF00' }}>
                                                    {!trackPieceA ? 'Pulsa pieza A' : !trackPieceB ? 'Pulsa pieza B' : '✔ Track definido'}
                                                </span>
                                            )}
                                        </div>

                                        {/* Centro / Arista toggle */}
                                        {trackMode && (
                                            <div style={{ display: 'flex', gap: 0, border: '1px solid #30363d', borderRadius: 4, overflow: 'hidden', marginTop: 4 }}>
                                                <button style={{
                                                    padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                                                    background: trackPointMode === 'centro' ? '#1f6feb' : '#161b22',
                                                    color: trackPointMode === 'centro' ? '#fff' : '#8b949e',
                                                }} onClick={() => setTrackPointMode('centro')}>◎ Centro</button>
                                                <button style={{
                                                    padding: '4px 12px', fontSize: '0.7rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                                                    background: trackPointMode === 'arista' ? '#1f6feb' : '#161b22',
                                                    color: trackPointMode === 'arista' ? '#fff' : '#8b949e',
                                                }} onClick={() => setTrackPointMode('arista')}>| Arista</button>
                                            </div>
                                        )}

                                        {/* Track status */}
                                        {trackPieceA && (
                                            <div style={{ fontSize: '0.72rem', color: '#ccc', background: '#0d111780', borderRadius: 4, padding: '4px 8px', marginTop: 2 }}>
                                                <div style={{ color: '#00FFFF' }}>● A: {trackPieceA.det.class || 'Obj'} ({(trackPieceA.det.confidence * 100).toFixed(0)}%) — {trackPieceA.mode}{trackPieceA.edge ? ` (${trackPieceA.edge})` : ''}</div>
                                                {trackPieceB && (
                                                    <div style={{ color: '#FF00FF' }}>● B: {trackPieceB.det.class || 'Obj'} ({(trackPieceB.det.confidence * 100).toFixed(0)}%) — {trackPieceB.mode}{trackPieceB.edge ? ` (${trackPieceB.edge})` : ''}</div>
                                                )}
                                                {trackPieceA && trackPieceB && (() => {
                                                    const dxP = Math.abs(trackPieceB.point.x - trackPieceA.point.x);
                                                    const dyP = Math.abs(trackPieceB.point.y - trackPieceA.point.y);
                                                    const dp = Math.hypot(dxP, dyP);
                                                    const dxM = scaleCalMmPerPx > 0 ? dxP * scaleCalMmPerPx : 0;
                                                    const dyM = scaleCalMmPerPx > 0 ? dyP * scaleCalMmPerPx : 0;
                                                    const dm = scaleCalMmPerPx > 0 ? dp * scaleCalMmPerPx : 0;
                                                    return <>
                                                        <div style={{ color: '#FF6600', marginTop: 2 }}>X: {dxP.toFixed(1)} px{dxM > 0 ? ` = ${dxM.toFixed(2)} mm` : ''}</div>
                                                        <div style={{ color: '#00FF66' }}>Y: {dyP.toFixed(1)} px{dyM > 0 ? ` = ${dyM.toFixed(2)} mm` : ''}</div>
                                                        <div style={{ color: '#FFFF00', fontWeight: 700 }}>↔ {dp.toFixed(1)} px{dm > 0 ? ` = ${dm.toFixed(2)} mm` : ''}</div>
                                                    </>;
                                                })()}
                                            </div>
                                        )}

                                        {/* Añadir Medida + Guardar Track + Mover Cotas */}
                                        {trackPieceA && trackPieceB && (
                                            <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                                                <button
                                                    className="basler-btn connect"
                                                    style={{ padding: '8px', fontSize: '0.78rem', flex: 1 }}
                                                    onClick={() => {
                                                        addMeasurement();
                                                        setTrackPieceA(null);
                                                        setTrackPieceB(null);
                                                    }}
                                                >
                                                    ➕ Añadir Medida
                                                </button>
                                                <button
                                                    className="basler-btn connect"
                                                    style={{ padding: '8px', fontSize: '0.78rem', flex: 1, background: '#238636', borderColor: '#2ea043' }}
                                                    onClick={saveTrackSpecification}
                                                >
                                                    💾 Guardar Track
                                                </button>
                                                <button
                                                    style={{
                                                        padding: '6px 10px', fontSize: '0.7rem', fontWeight: 600, borderRadius: 4, cursor: 'pointer',
                                                        border: `2px solid ${moveDimLabels ? '#FF6600' : '#30363d'}`,
                                                        background: moveDimLabels ? '#FF660018' : '#161b22',
                                                        color: moveDimLabels ? '#FF6600' : '#8b949e',
                                                    }}
                                                    onClick={() => setMoveDimLabels(v => !v)}
                                                >
                                                    📌 {moveDimLabels ? 'MOVIENDO COTAS' : 'Mover Cotas'}
                                                </button>
                                                {moveDimLabels && (
                                                    <button
                                                        style={{
                                                            padding: '4px 8px', fontSize: '0.62rem', fontWeight: 600, borderRadius: 4, cursor: 'pointer',
                                                            border: '1px solid #30363d', background: '#161b22', color: '#8b949e',
                                                        }}
                                                        onClick={() => {
                                                            dimLabelOffsets.current = { x: { dx: 0, dy: 0 }, y: { dx: 0, dy: 0 }, total: { dx: 0, dy: 0 } };
                                                            redrawScaleCalCanvas();
                                                        }}
                                                    >
                                                        ↺ Reset
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        {/* Lista de medidas guardadas */}
                                        {trackSpecs.length > 0 && (
                                            <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#FFFF00', textTransform: 'uppercase', letterSpacing: 0.5 }}>📏 Medidas ({trackSpecs.length})</span>
                                                    <button className="basler-tab-mini" style={{ fontSize: '0.58rem', borderColor: '#ff444430', color: '#ff4444' }}
                                                        onClick={() => { if (confirm('¿Borrar TODAS las medidas?')) { setTrackSpecs([]); localStorage.removeItem('trackSpecs'); localStorage.removeItem('trackSpec'); } }}>🗑 Borrar Todo</button>
                                                </div>
                                                {trackSpecs.map((ts: any, idx: number) => (
                                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.68rem', background: '#FFFF0008', border: '1px solid #FFFF0020', borderRadius: 4, padding: '3px 8px' }}>
                                                        <span style={{ color: '#484f58', fontWeight: 700, minWidth: 16 }}>#{idx + 1}</span>
                                                        <span style={{ color: '#00FFFF' }}>{ts.classA}</span>
                                                        <span style={{ color: '#8b949e' }}>↔</span>
                                                        <span style={{ color: '#FF00FF' }}>{ts.classB}</span>
                                                        <span style={{ color: '#FFFF00', fontWeight: 600, marginLeft: 'auto' }}>{ts.distanceMm?.toFixed(2) ?? '?'} mm</span>
                                                        <button style={{ padding: '1px 5px', fontSize: '0.58rem', background: 'transparent', border: '1px solid #ff444430', borderRadius: 3, color: '#ff4444', cursor: 'pointer' }}
                                                            onClick={() => {
                                                                setTrackSpecs(prev => {
                                                                    const next = prev.filter((_: any, i: number) => i !== idx);
                                                                    localStorage.setItem('trackSpecs', JSON.stringify(next));
                                                                    return next;
                                                                });
                                                            }}>✕</button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>)}

                                <div className="capture-divider" />

                                {/* ── TABLERO DE AJEDREZ ── */}
                                <div
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
                                    onClick={() => setCalBoardCollapsed(v => !v)}
                                >
                                    <div className="capture-panel-title" style={{ margin: 0 }}>{String.fromCodePoint(0x1F4D0)} {t('calTitle')}</div>
                                    <span style={{ fontSize: '1rem', color: '#8b949e', transition: 'transform 0.2s', transform: calBoardCollapsed ? 'rotate(0deg)' : 'rotate(90deg)' }}>▶</span>
                                </div>

                                {!calBoardCollapsed && (<>
                                    <div style={{ fontSize: '0.72rem', color: '#8b949e', lineHeight: 1.5 }}>
                                        {t('calDesc')}
                                    </div>

                                    {/* Checkerboard config */}
                                    <div className="capture-field">
                                        <label>{String.fromCodePoint(0x1F532)} {t('calBoard')}</label>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                        <div className="capture-field">
                                            <label>{t('calCols')}: <strong style={{ color: '#a78bfa' }}>{calCols}</strong></label>
                                            <input className="basler-input capture-input" type="number" min={3} max={20}
                                                value={calCols} onChange={e => setCalCols(Number(e.target.value))} />
                                            <span className="basler-hint">{t('calColsHint')}</span>
                                        </div>
                                        <div className="capture-field">
                                            <label>{t('calRows')}: <strong style={{ color: '#a78bfa' }}>{calRows}</strong></label>
                                            <input className="basler-input capture-input" type="number" min={3} max={20}
                                                value={calRows} onChange={e => setCalRows(Number(e.target.value))} />
                                            <span className="basler-hint">{t('calRowsHint')}</span>
                                        </div>
                                    </div>

                                    <div className="capture-field">
                                        <label>{t('calSquare')}: <strong style={{ color: '#a78bfa' }}>{calSquare} mm</strong></label>
                                        <input type="range" className="basler-slider" min={5} max={100} step={0.5}
                                            value={calSquare} onChange={e => setCalSquare(Number(e.target.value))} />
                                        <div className="slider-labels"><span>5 mm</span><span>100 mm</span></div>
                                    </div>

                                    <div className="capture-divider" />

                                    {/* Directorio */}
                                    <div className="capture-field">
                                        <label>{String.fromCodePoint(0x1F4C1)} {t('calDir')}</label>
                                        <input className="basler-input capture-input" spellCheck={false}
                                            value={calSaveDir} onChange={e => setCalSaveDir(e.target.value)} />
                                        <span className="basler-hint">{t('calDirHint')}</span>
                                    </div>

                                    {/* Botones de acciÃ³n */}
                                    <button
                                        className={`basler-btn capture-btn ${calCapturing ? 'loading' : ''}`}
                                        onClick={handleCalCapture}
                                        disabled={calCapturing || !isConnected || !backendOk}>
                                        {calCapturing
                                            ? <><span className="spin">{'\u21BB'}</span> {t('calCapturing')}</>
                                            : `${String.fromCodePoint(0x1F4F8)} ${t('calCapture')}`}
                                    </button>

                                    <button
                                        className={`basler-btn connect ${calComputing ? 'loading' : ''}`}
                                        onClick={handleCalCompute}
                                        disabled={calComputing || calImages.filter(i => i.corners).length < 4}>
                                        {calComputing
                                            ? <><span className="spin">{'\u21BB'}</span> {t('calComputing')}</>
                                            : `${String.fromCodePoint(0x1F3AF)} ${t('calCompute')}`}
                                    </button>

                                    {!backendOk && (
                                        <div className="capture-result err">{'\u26A0'} {t('needServer')}</div>
                                    )}
                                    {!isConnected && backendOk && (
                                        <div className="capture-result err">{'\u26A0'} {t('calNeedCam')}</div>
                                    )}
                                    {calMsg && (
                                        <div className={`capture-result ${calMsg.ok ? 'ok' : 'err'}`}>{calMsg.text}</div>
                                    )}


                                    <div className="capture-divider" />

                                    {/* Lista de imÃ¡genes */}
                                    <div className="capture-gallery-title" style={{ display: 'flex', alignItems: 'center' }}>
                                        <span>
                                            {String.fromCodePoint(0x1F4C2)} {t('calImages')} ({calImages.length})
                                            {' \u00B7 '}{'\u2714'} {calImages.filter(i => i.corners).length} {t('calValid')}
                                        </span>
                                        {calImages.length > 0 && (
                                            <button className="basler-tab-mini" style={{ marginLeft: 'auto' }} onClick={handleCalClear}>
                                                {String.fromCodePoint(0x1F5D1)}
                                            </button>
                                        )}
                                    </div>

                                    {calImages.length === 0 ? (
                                        <div style={{ fontSize: '0.75rem', color: '#484f58', fontFamily: 'monospace' }}>
                                            &mdash; {t('calNoResult')} &mdash;
                                        </div>
                                    ) : (
                                        <div className="cal-images-list">
                                            {calImages.map((img, i) => (
                                                <div key={i} className={`cal-image-item ${img.corners ? 'ok' : 'warn'}`}>
                                                    <span style={{ fontSize: '0.82rem' }}>
                                                        {img.corners ? '\u2714' : '\u26A0'} {img.filename}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', color: '#8b949e', flexShrink: 0 }}>{img.time}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                </>)}

                            </div>{/* /capture-panel */}
                        </div>{/* /preview-main-layout */}

                        {/* ── BOTÓN FINALIZAR PROCESO ── */}
                        {scaleCalImageSrc && (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px 0' }}>
                                <button
                                    onClick={() => {
                                        setScaleCalImageSrc(null);
                                        setScaleCalPoints([]);
                                        setCalDetections([]);
                                        setCalHiddenDetections(new Set());
                                        setCalSelectedDetIdx(null);
                                        setMeasurePoints([]);
                                        setCalZoom(1);
                                        setCalPan({ x: 0, y: 0 });
                                    }}
                                    style={{
                                        padding: '10px 32px',
                                        fontSize: '0.95rem',
                                        fontWeight: 700,
                                        background: 'linear-gradient(135deg, #da3633, #b62324)',
                                        border: '2px solid #f8514960',
                                        borderRadius: 8,
                                        color: '#fff',
                                        cursor: 'pointer',
                                        letterSpacing: '0.5px',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 2px 8px #f8514930',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 4px 16px #f8514950'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px #f8514930'; }}
                                >
                                    🏁 Finalizar Proceso
                                </button>
                            </div>
                        )}

                    </div>

                {/* ══ TAB: TEST ══════════════════════════════════════════════ */}
                    <div style={{ display: activeTab === 'test' ? 'block' : 'none', width: '100%', height: '100%', minHeight: 'calc(100vh - 140px)', overflow: 'auto', flex: 1 }}>
                        <ImageMeasurement />
                    </div>


                {/* ── Upload Button (bottom-right, calibration) ── */}
                {activeTab === 'calibration' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 12px 2px 0' }}>
                        <label style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '8px 22px',
                            fontSize: '0.85rem', fontWeight: 700,
                            background: 'linear-gradient(135deg, #1f6feb, #1a56db)',
                            border: '2px solid #58a6ff50',
                            borderRadius: 8, color: '#fff',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 10px #1f6feb40',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 16px #1f6feb60'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 10px #1f6feb40'; }}
                        >
                            📤 Subir Imagen
                            <input type="file" accept="image/*" onChange={handleScaleCalImageUpload} style={{ display: 'none' }} />
                        </label>
                    </div>
                )}

                {/* ── LOG PANEL ──────────────────────────────────── */}
                {activeTab !== 'test' && (
                    <div className="basler-log-panel">
                        <div className="basler-log-header">
                            <span>📋 {t('pylonLog')}</span>
                            <button className="basler-tab-mini" onClick={() => setLogs([])}>{t('clearBtn')}</button>
                        </div>
                        <div className="basler-log-body">
                            {logs.length === 0 && <span className="log-empty">{t('noLog')}</span>}
                            {logs.map((l, i) => (
                                <div key={i} className="log-line">
                                    <span className="log-time">{l.time}</span>
                                    <span className="log-msg" style={{ color: logColor(l.level) }}>{l.msg}</span>
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
