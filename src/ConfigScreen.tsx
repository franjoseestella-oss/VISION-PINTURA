import { useState, useEffect, useCallback, useRef } from 'react';
import ObjViewer from './ObjViewer';
import { extractRAL, ralToHex } from './ralColors';

// ─── Types ──────────────────────────────────────────────────────
interface ModelSpecs {
    numSec?: string;
    color?: string;
    referencia?: string;
    modeloMaquina?: string;
    programaRobot?: string;
    cotaX1?: string;
    cotaX2?: string;
}

interface VideoMapping {
    id: string;
    label: string;
    robotProgram?: string;
    objElementName?: string;
    videoFile: string;
    videoBlobUrl?: string;
    objFile?: string;
    objBlobUrl?: string;
    mtlFile?: string;
    mtlBlobUrl?: string;
    modelSpecs?: ModelSpecs;
}

interface TrackTolerance {
    className: string;
    enabled: boolean;
    visible: boolean;
    measuredValue: number;
    tolerancePlus: number;
    toleranceMinus: number;
}

interface ConfigScreenProps {
    mappings: VideoMapping[];
    setMappings: React.Dispatch<React.SetStateAction<VideoMapping[]>>;
    onMappingVideoUpload?: (mappingId: string, file: File) => void;
    onMappingObjUpload?: (mappingId: string, file: File) => void;
    onMappingMtlUpload?: (mappingId: string, file: File) => void;
}

// ─── Sub-tab type ───────────────────────────────────────────────
type ConfigTab = 'videoMapping' | 'tolerancias' | 'barcode';

const ConfigScreen: React.FC<ConfigScreenProps> = ({ mappings, setMappings, onMappingVideoUpload, onMappingObjUpload, onMappingMtlUpload }) => {
    const [configTab, setConfigTab] = useState<ConfigTab>('tolerancias');
    const [viewingObj, setViewingObj] = useState<{ url: string; fileName: string; mtlUrl?: string; mappingId: string } | null>(null);

    // ═══ BARCODE READER STATE ═══
    const [barcodeListening, setBarcodeListening] = useState(false);
    const [barcodeHistory, setBarcodeHistory] = useState<{ code: string; timestamp: string }[]>(() => {
        const saved = localStorage.getItem('barcodeHistory');
        return saved ? JSON.parse(saved) : [];
    });
    const [barcodePrefix, setBarcodePrefix] = useState(() => localStorage.getItem('barcodePrefix') || '');
    const [barcodeSuffix, setBarcodeSuffix] = useState(() => localStorage.getItem('barcodeSuffix') || '');
    const [barcodeSound, setBarcodeSound] = useState(() => localStorage.getItem('barcodeSound') !== 'false');
    const barcodeBuffer = useRef('');
    const barcodeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Barcode keyboard listener
    useEffect(() => {
        if (!barcodeListening) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input
            const tag = (e.target as HTMLElement).tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

            if (barcodeTimeout.current) clearTimeout(barcodeTimeout.current);

            if (e.key === 'Enter') {
                const code = barcodeBuffer.current.trim();
                if (code.length > 1) {
                    // Apply prefix/suffix filter
                    const pre = barcodePrefix;
                    const suf = barcodeSuffix;
                    if (pre && !code.startsWith(pre)) { barcodeBuffer.current = ''; return; }
                    if (suf && !code.endsWith(suf)) { barcodeBuffer.current = ''; return; }

                    const entry = {
                        code,
                        timestamp: new Date().toLocaleString('es-ES'),
                    };
                    setBarcodeHistory(prev => {
                        const updated = [entry, ...prev].slice(0, 200);
                        localStorage.setItem('barcodeHistory', JSON.stringify(updated));
                        return updated;
                    });

                    // Check if barcode contains a RAL code
                    const ralCode = extractRAL(code);
                    if (ralCode) {
                        localStorage.setItem('lastScannedRAL', `RAL ${ralCode}`);
                        // If 3D viewer is open, update the color in modelSpecs
                        if (viewingObj) {
                            setMappings(prev => prev.map(m =>
                                m.id === viewingObj.mappingId
                                    ? { ...m, modelSpecs: { ...m.modelSpecs, color: `RAL ${ralCode}` } }
                                    : m
                            ));
                        }
                    }

                    if (barcodeSound) {
                        try { new Audio('data:audio/wav;base64,UklGRl9vT19teleVBhdmVmbXQgAAAAEAABACDdAAAA').play().catch(() => {}); } catch {}
                    }
                }
                barcodeBuffer.current = '';
            } else if (e.key.length === 1) {
                barcodeBuffer.current += e.key;
                barcodeTimeout.current = setTimeout(() => { barcodeBuffer.current = ''; }, 100);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [barcodeListening, barcodePrefix, barcodeSuffix, barcodeSound]);

    // ═══ TOLERANCIAS TRACKING STATE ═══
    const [tolerances, setTolerances] = useState<TrackTolerance[]>(() => {
        const saved = localStorage.getItem('trackTolerances');
        return saved ? JSON.parse(saved) : [];
    });
    const [, setRoboflowClasses] = useState<string[]>([]);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [classesError, setClassesError] = useState<string | null>(null);

    // ═══ GLOBAL LABEL VISIBILITY ═══
    const [showLabelsGlobal, setShowLabelsGlobal] = useState<boolean>(() => {
        const saved = localStorage.getItem('showDetectionLabels');
        return saved !== null ? saved === 'true' : true;
    });
    useEffect(() => {
        localStorage.setItem('showDetectionLabels', String(showLabelsGlobal));
    }, [showLabelsGlobal]);

    // Persist tolerances
    useEffect(() => {
        localStorage.setItem('trackTolerances', JSON.stringify(tolerances));
    }, [tolerances]);


    // Fetch Roboflow classes from backend
    const fetchRoboflowClasses = useCallback(async () => {
        setLoadingClasses(true);
        setClassesError(null);
        try {
            // Use the Roboflow API to get classes — we'll send a request to our backend
            const res = await fetch('http://127.0.0.1:8765/api/roboflow-classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data.ok && data.classes) {
                setRoboflowClasses(data.classes);
                // Auto-add any new classes not yet in tolerances
                setTolerances(prev => {
                    const existingClasses = new Set(prev.map(t => t.className));
                    const newEntries = data.classes
                        .filter((c: string) => !existingClasses.has(c))
                        .map((c: string) => ({
                            className: c,
                            enabled: true,
                            visible: true,
                            measuredValue: 0,
                            tolerancePlus: 0.5,
                            toleranceMinus: 0.5,
                        }));
                    return [...prev, ...newEntries];
                });
            } else {
                throw new Error(data.error || 'No classes returned');
            }
        } catch (err: any) {
            setClassesError(err.message);
            // Fallback: extract classes from existing detections in localStorage
            const saved = localStorage.getItem('trackSpec');
            if (saved) {
                const spec = JSON.parse(saved);
                const classes = new Set<string>();
                if (spec.classA) classes.add(spec.classA);
                if (spec.classB) classes.add(spec.classB);
                setRoboflowClasses(Array.from(classes));
            }
        } finally {
            setLoadingClasses(false);
        }
    }, []);

    useEffect(() => {
        fetchRoboflowClasses();
    }, [fetchRoboflowClasses]);


    const updateTolerance = (idx: number, field: keyof TrackTolerance, value: any) => {
        setTolerances(prev => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], [field]: value };
            return updated;
        });
    };

    // ─── Styles ─────────────────────────────────────────────────
    const tabStyle = (active: boolean): React.CSSProperties => ({
        padding: '10px 24px',
        fontSize: '0.85rem',
        fontWeight: 600,
        border: 'none',
        borderBottom: active ? '3px solid #1f6feb' : '3px solid transparent',
        background: 'transparent',
        color: active ? '#fff' : '#8b949e',
        cursor: 'pointer',
        transition: 'all 0.2s',
    });

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#0d1117', color: '#e6edf3', overflow: 'auto' }}>
            {/* Sub-tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #30363d', background: '#161b22', paddingLeft: 16 }}>
                <button style={tabStyle(configTab === 'videoMapping')} onClick={() => setConfigTab('videoMapping')}>
                    🏷️ Configurar Etiquetas
                </button>
                <button style={tabStyle(configTab === 'tolerancias')} onClick={() => setConfigTab('tolerancias')}>
                    📐 Tolerancias Tracking
                </button>
                <button style={tabStyle(configTab === 'barcode')} onClick={() => setConfigTab('barcode')}>
                    📊 Lector Código de Barras
                </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
                {configTab === 'videoMapping' ? (
                    /* ═══ VIDEO MAPPING ═══ */
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8, color: '#fff' }}>🏷️ Configurar Etiquetas</h2>
                        <p style={{ fontSize: '0.82rem', color: '#8b949e', marginBottom: 16 }}>
                            Configura cada etiqueta activa con su programa robot, vídeo y modelo 3D. Importa las etiquetas desde Tolerancias Tracking automáticamente.
                        </p>

                        {/* Action bar */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                            <button
                                onClick={() => {
                                    // Import enabled labels from tolerances into mappings
                                    const enabledLabels = tolerances.filter(t => t.enabled).map(t => t.className);
                                    if (enabledLabels.length === 0) {
                                        alert('No hay etiquetas activas en Tolerancias. Ve a la pestaña "Tolerancias Tracking" e importa/activa etiquetas primero.');
                                        return;
                                    }
                                    setMappings(prev => {
                                        const existingLabels = new Set(prev.map(m => m.label.trim().toLowerCase()));
                                        const newMappings = enabledLabels
                                            .filter(label => !existingLabels.has(label.trim().toLowerCase()))
                                            .map(label => ({ id: `${Date.now()}-${label}`, label, videoFile: '' }));
                                        if (newMappings.length === 0) {
                                            alert('Todas las etiquetas activas ya están importadas.');
                                            return prev;
                                        }
                                        return [...prev, ...newMappings];
                                    });
                                }}
                                style={{
                                    padding: '10px 20px', background: 'linear-gradient(135deg, #238636, #2ea043)', color: '#fff',
                                    border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                                    boxShadow: '0 2px 8px rgba(35,134,54,0.4)', transition: 'all 0.2s',
                                }}
                            >
                                📥 Importar Etiquetas Activas
                            </button>
                            <button
                                onClick={() => setMappings([...mappings, { id: Date.now().toString(), label: '', videoFile: '' }])}
                                style={{
                                    padding: '10px 20px', background: '#1f6feb', color: '#fff', border: 'none',
                                    borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
                                    boxShadow: '0 2px 8px rgba(31,111,235,0.3)',
                                }}
                            >
                                + Añadir Manual
                            </button>
                            {mappings.length > 0 && (
                                <span style={{ fontSize: '0.75rem', color: '#8b949e', marginLeft: 'auto' }}>
                                    {mappings.filter(m => m.videoFile).length}/{mappings.length} con vídeo | {mappings.filter(m => m.objFile).length}/{mappings.length} con .obj
                                </span>
                            )}
                        </div>

                        {/* Info about active labels */}
                        {tolerances.filter(t => t.enabled).length > 0 && (
                            <div style={{
                                background: '#0d1117', border: '1px solid #23863640', borderRadius: 8,
                                padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
                            }}>
                                <span style={{ fontSize: '0.75rem', color: '#3fb950', fontWeight: 600 }}>
                                    Etiquetas activas en Tolerancias:
                                </span>
                                {tolerances.filter(t => t.enabled).map(t => {
                                    const alreadyMapped = mappings.some(m => m.label.trim().toLowerCase() === t.className.trim().toLowerCase());
                                    return (
                                        <span key={t.className} style={{
                                            fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: 12,
                                            background: alreadyMapped ? '#23863620' : '#f8514910',
                                            border: `1px solid ${alreadyMapped ? '#238636' : '#f8514940'}`,
                                            color: alreadyMapped ? '#3fb950' : '#f85149',
                                        }}>
                                            {alreadyMapped ? '✓' : '○'} {t.className}
                                        </span>
                                    );
                                })}
                            </div>
                        )}

                        {/* Mapping cards */}
                        {mappings.length === 0 ? (
                            <div style={{
                                background: '#161b22', border: '2px dashed #30363d', borderRadius: 12,
                                padding: '40px 20px', textAlign: 'center', color: '#484f58',
                            }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎬</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#8b949e', marginBottom: 6 }}>
                                    No hay mappings configurados
                                </div>
                                <div style={{ fontSize: '0.78rem', color: '#484f58' }}>
                                    Pulsa "Importar Etiquetas Activas" para traer las etiquetas habilitadas en Tolerancias
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
                                {mappings.map(map => {
                                    const hasVideo = !!map.videoFile;
                                    const hasObj = !!map.objFile;
                                    const isActiveLabel = tolerances.some(t => t.enabled && t.className.trim().toLowerCase() === map.label.trim().toLowerCase());
                                    return (
                                        <div key={map.id} style={{
                                            background: '#161b22',
                                            border: `1px solid ${(hasVideo || hasObj) ? '#23863650' : '#30363d'}`,
                                            borderRadius: 10, padding: 18,
                                            display: 'flex', flexDirection: 'column', gap: 12,
                                            transition: 'all 0.2s',
                                            boxShadow: (hasVideo || hasObj) ? '0 0 12px rgba(35,134,54,0.15)' : 'none',
                                        }}>
                                            {/* Header with label and status */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{
                                                        width: 10, height: 10, borderRadius: '50%',
                                                        background: isActiveLabel ? '#238636' : '#f0883e',
                                                        boxShadow: isActiveLabel ? '0 0 6px #238636' : 'none',
                                                    }} />
                                                    <span style={{ fontSize: '0.72rem', color: isActiveLabel ? '#3fb950' : '#f0883e', fontWeight: 600 }}>
                                                        {isActiveLabel ? 'Etiqueta Activa' : 'Manual'}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <span style={{
                                                        fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                                                        background: hasVideo ? '#23863618' : '#f8514910',
                                                        color: hasVideo ? '#3fb950' : '#f85149',
                                                        border: `1px solid ${hasVideo ? '#23863640' : '#f8514930'}`,
                                                    }}>
                                                        {hasVideo ? '🎥 Vídeo' : '⚠ Sin vídeo'}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                                                        background: hasObj ? '#1f6feb18' : '#f8514910',
                                                        color: hasObj ? '#58a6ff' : '#f85149',
                                                        border: `1px solid ${hasObj ? '#1f6feb40' : '#f8514930'}`,
                                                    }}>
                                                        {hasObj ? '🧊 .obj' : '⚠ Sin .obj'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Label field */}
                                            <div>
                                                <label style={{ fontSize: '0.72rem', color: '#8b949e', display: 'block', marginBottom: 4, fontWeight: 600 }}>
                                                    Etiqueta / Clase Detectada
                                                </label>
                                                <input
                                                    type="text" value={map.label}
                                                    onChange={(e) => setMappings(mappings.map(m => m.id === map.id ? { ...m, label: e.target.value } : m))}
                                                    placeholder="Ej: Montacargas"
                                                    style={{
                                                        width: '100%', padding: '8px 12px', background: '#0d1117',
                                                        border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3',
                                                        fontSize: '0.85rem', fontWeight: 600, boxSizing: 'border-box',
                                                    }}
                                                />
                                            </div>

                                            {/* Robot Program field */}
                                            <div>
                                                <label style={{ fontSize: '0.72rem', color: '#8b949e', display: 'block', marginBottom: 4, fontWeight: 600 }}>
                                                    🤖 Programa Robot
                                                </label>
                                                <input
                                                    type="text" value={map.robotProgram || ''}
                                                    onChange={(e) => setMappings(mappings.map(m => m.id === map.id ? { ...m, robotProgram: e.target.value } : m))}
                                                    placeholder="Ej: PRG_001"
                                                    style={{
                                                        width: '100%', padding: '8px 12px', background: '#0d1117',
                                                        border: `1px solid ${map.robotProgram ? '#f0883e40' : '#30363d'}`, borderRadius: 6,
                                                        color: map.robotProgram ? '#f0883e' : '#e6edf3',
                                                        fontSize: '0.85rem', fontWeight: 600, boxSizing: 'border-box',
                                                    }}
                                                />
                                            </div>

                                            {/* Object Element Name field */}
                                            <div>
                                                <label style={{ fontSize: '0.72rem', color: '#8b949e', display: 'block', marginBottom: 4, fontWeight: 600 }}>
                                                    🎯 Nombre Objeto (en .obj)
                                                </label>
                                                <input
                                                    type="text" value={map.objElementName || ''}
                                                    onChange={(e) => setMappings(mappings.map(m => m.id === map.id ? { ...m, objElementName: e.target.value } : m))}
                                                    placeholder="Ej: Puerta_Izq"
                                                    style={{
                                                        width: '100%', padding: '8px 12px', background: '#0d1117',
                                                        border: `1px solid ${map.objElementName ? '#d29922' : '#30363d'}`, borderRadius: 6,
                                                        color: map.objElementName ? '#d29922' : '#e6edf3',
                                                        fontSize: '0.85rem', fontWeight: 600, boxSizing: 'border-box',
                                                    }}
                                                />
                                            </div>

                                            {/* Video file field with file picker */}
                                            <div>
                                                <label style={{ fontSize: '0.72rem', color: '#8b949e', display: 'block', marginBottom: 4, fontWeight: 600 }}>
                                                    Archivo de Vídeo
                                                </label>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <input
                                                        type="text" value={map.videoFile}
                                                        onChange={(e) => setMappings(mappings.map(m => m.id === map.id ? { ...m, videoFile: e.target.value } : m))}
                                                        placeholder="Selecciona un vídeo..."
                                                        readOnly
                                                        style={{
                                                            flex: 1, padding: '8px 12px', background: '#0d1117',
                                                            border: `1px solid ${map.videoBlobUrl ? '#238636' : hasVideo ? '#23863640' : '#30363d'}`, borderRadius: 6,
                                                            color: map.videoBlobUrl ? '#3fb950' : hasVideo ? '#3fb950' : '#e6edf3', fontSize: '0.82rem', boxSizing: 'border-box',
                                                            cursor: 'default',
                                                        }}
                                                    />
                                                    <label style={{
                                                        padding: '8px 14px', background: 'linear-gradient(135deg, #1f6feb, #388bfd)', color: '#fff', borderRadius: 6,
                                                        cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem', display: 'flex',
                                                        alignItems: 'center', gap: 4, whiteSpace: 'nowrap', flexShrink: 0,
                                                    }}>
                                                        📁 Subir
                                                        <input
                                                            type="file" accept="video/*,.avi,.mov,.wmv,.mkv,.flv"
                                                            style={{ display: 'none' }}
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file && onMappingVideoUpload) {
                                                                    onMappingVideoUpload(map.id, file);
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                                {/* Video loaded indicator */}
                                                {map.videoBlobUrl && (
                                                    <div style={{
                                                        marginTop: 6, padding: '6px 10px', background: '#23863620', border: '1px solid #23863650',
                                                        borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8,
                                                    }}>
                                                        <span style={{ color: '#3fb950', fontSize: '0.72rem', fontWeight: 700 }}>✓ Vídeo cargado</span>
                                                        <video
                                                            src={map.videoBlobUrl}
                                                            style={{ height: 40, borderRadius: 4, border: '1px solid #30363d' }}
                                                            muted
                                                            onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                                                            onMouseLeave={(e) => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* OBJ 3D Model file field */}
                                            <div>
                                                <label style={{ fontSize: '0.72rem', color: '#8b949e', display: 'block', marginBottom: 4, fontWeight: 600 }}>
                                                    🧊 Modelo 3D (.obj)
                                                </label>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <input
                                                        type="text" value={map.objFile || ''}
                                                        placeholder="Selecciona un archivo .obj..."
                                                        readOnly
                                                        style={{
                                                            flex: 1, padding: '8px 12px', background: '#0d1117',
                                                            border: `1px solid ${map.objBlobUrl ? '#1f6feb' : hasObj ? '#1f6feb40' : '#30363d'}`, borderRadius: 6,
                                                            color: map.objBlobUrl ? '#58a6ff' : hasObj ? '#58a6ff' : '#e6edf3', fontSize: '0.82rem', boxSizing: 'border-box',
                                                            cursor: 'default',
                                                        }}
                                                    />
                                                    <label style={{
                                                        padding: '8px 14px', background: 'linear-gradient(135deg, #8957e5, #a371f7)', color: '#fff', borderRadius: 6,
                                                        cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem', display: 'flex',
                                                        alignItems: 'center', gap: 4, whiteSpace: 'nowrap', flexShrink: 0,
                                                    }}>
                                                        📁 Subir .obj
                                                        <input
                                                            type="file" accept=".obj,.OBJ"
                                                            style={{ display: 'none' }}
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file && onMappingObjUpload) {
                                                                    onMappingObjUpload(map.id, file);
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                                {/* OBJ loaded indicator */}
                                                {map.objBlobUrl && (
                                                    <div style={{
                                                        marginTop: 6, padding: '6px 10px', background: '#1f6feb15', border: '1px solid #1f6feb40',
                                                        borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                                                    }}>
                                                        <span style={{ color: '#58a6ff', fontSize: '0.72rem', fontWeight: 700 }}>✓ Modelo .obj cargado</span>
                                                        <span style={{ fontSize: '0.68rem', color: '#8b949e' }}>{map.objFile}</span>
                                                        {map.mtlBlobUrl && (
                                                            <span style={{ fontSize: '0.68rem', color: '#3fb950', fontWeight: 600 }}>✓ .mtl</span>
                                                        )}
                                                        <button
                                                            onClick={() => setViewingObj({ url: map.objBlobUrl!, fileName: map.objFile || '.obj', mtlUrl: map.mtlBlobUrl, mappingId: map.id })}
                                                            style={{
                                                                marginLeft: 'auto',
                                                                padding: '4px 14px',
                                                                background: 'linear-gradient(135deg, #8957e5, #a371f7)',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: 6,
                                                                cursor: 'pointer',
                                                                fontWeight: 700,
                                                                fontSize: '0.72rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 4,
                                                                transition: 'all 0.2s',
                                                                boxShadow: '0 2px 8px rgba(137,87,229,0.3)',
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                        >
                                                            👁 VER
                                                        </button>
                                                    </div>
                                                )}

                                                {/* MTL Material file field */}
                                                <div style={{ marginTop: 6 }}>
                                                    <label style={{ fontSize: '0.72rem', color: '#8b949e', display: 'block', marginBottom: 4, fontWeight: 600 }}>
                                                        🎨 Material (.mtl) — opcional
                                                    </label>
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        <input
                                                            type="text" value={map.mtlFile || ''}
                                                            placeholder="Selecciona un archivo .mtl..."
                                                            readOnly
                                                            style={{
                                                                flex: 1, padding: '8px 12px', background: '#0d1117',
                                                                border: `1px solid ${map.mtlBlobUrl ? '#238636' : '#30363d'}`, borderRadius: 6,
                                                                color: map.mtlBlobUrl ? '#3fb950' : '#e6edf3', fontSize: '0.82rem', boxSizing: 'border-box',
                                                                cursor: 'default',
                                                            }}
                                                        />
                                                        <label style={{
                                                            padding: '8px 14px', background: 'linear-gradient(135deg, #238636, #2ea043)', color: '#fff', borderRadius: 6,
                                                            cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem', display: 'flex',
                                                            alignItems: 'center', gap: 4, whiteSpace: 'nowrap', flexShrink: 0,
                                                        }}>
                                                            📁 Subir .mtl
                                                            <input
                                                                type="file" accept=".mtl,.MTL"
                                                                style={{ display: 'none' }}
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file && onMappingMtlUpload) {
                                                                        onMappingMtlUpload(map.id, file);
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Delete button */}
                                            <button
                                                onClick={() => setMappings(mappings.filter(m => m.id !== map.id))}
                                                style={{
                                                    alignSelf: 'flex-end', fontSize: '0.72rem', color: '#f85149',
                                                    background: 'transparent', border: '1px solid #f8514925', borderRadius: 6,
                                                    padding: '5px 12px', cursor: 'pointer', transition: 'all 0.2s',
                                                }}
                                            >
                                                🗑 Eliminar
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : configTab === 'tolerancias' ? (
                    /* ═══ TOLERANCIAS TRACKING ═══ */
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>📐 Tolerancias Tracking</h2>
                            <button
                                onClick={fetchRoboflowClasses}
                                disabled={loadingClasses}
                                style={{
                                    padding: '6px 14px', fontSize: '0.75rem', fontWeight: 600, borderRadius: 4, cursor: 'pointer',
                                    background: loadingClasses ? '#30363d' : '#238636', color: '#fff', border: 'none',
                                }}
                            >
                                {loadingClasses ? '⏳ Cargando...' : '🔄 Importar Etiquetas Roboflow'}
                            </button>
                            {/* Global label visibility toggle */}
                            <button
                                onClick={() => setShowLabelsGlobal(v => !v)}
                                style={{
                                    padding: '6px 14px', fontSize: '0.75rem', fontWeight: 600, borderRadius: 4, cursor: 'pointer',
                                    border: `2px solid ${showLabelsGlobal ? '#BD00FF' : '#30363d'}`,
                                    background: showLabelsGlobal ? '#BD00FF18' : '#161b22',
                                    color: showLabelsGlobal ? '#BD00FF' : '#8b949e',
                                    marginLeft: 'auto',
                                }}
                            >
                                {showLabelsGlobal ? '👁 Etiquetas Visibles' : '👁‍🗨 Etiquetas Ocultas'}
                            </button>
                            {classesError && (
                                <span style={{ fontSize: '0.7rem', color: '#f8514950' }}>⚠ {classesError}</span>
                            )}
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#8b949e', marginBottom: 12 }}>
                            Define las tolerancias para cada etiqueta del proyecto Roboflow. El valor medido se importa automáticamente al guardar un track.
                            <br />
                            <span style={{ color: '#BD00FF', fontWeight: 600 }}>
                                {showLabelsGlobal ? '👁 Las etiquetas son visibles en todas las pantallas' : '👁‍🗨 Las etiquetas están ocultas en todas las pantallas'}
                            </span>
                        </p>


                        {/* Table */}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #30363d' }}>
                                        <th style={{ padding: '10px 8px', textAlign: 'center', color: '#8b949e', fontWeight: 600, width: 60 }}>✓</th>
                                        <th style={{ padding: '10px 6px', textAlign: 'center', color: '#BD00FF', fontWeight: 600, width: 50 }}>👁</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'left', color: '#8b949e', fontWeight: 600 }}>Etiqueta Roboflow</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'center', color: '#8b949e', fontWeight: 600, width: 130 }}>Valor Medido (mm)</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'center', color: '#8b949e', fontWeight: 600, width: 130 }}>Tol. + (mm)</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'center', color: '#8b949e', fontWeight: 600, width: 130 }}>Tol. - (mm)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tolerances.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ padding: 20, textAlign: 'center', color: '#8b949e' }}>
                                                No hay etiquetas. Pulsa "Importar Etiquetas Roboflow" para cargar las clases del modelo.
                                            </td>
                                        </tr>
                                    ) : tolerances.map((tol, idx) => {
                                        return (
                                            <tr key={tol.className}
                                                style={{
                                                    borderBottom: '1px solid #21262d',
                                                    background: 'transparent',
                                                    transition: 'background 0.2s',
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#161b22'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <td style={{ padding: '8px', textAlign: 'center' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={tol.enabled}
                                                        onChange={(e) => updateTolerance(idx, 'enabled', e.target.checked)}
                                                        style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#1f6feb' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                                                    <button
                                                        onClick={() => {
                                                            const newVal = !tol.visible;
                                                            console.log(`[VISIBILITY] ${tol.className}: ${tol.visible} → ${newVal}`);
                                                            updateTolerance(idx, 'visible', newVal);
                                                        }}
                                                        title={tol.visible ? 'Ocultar etiqueta en pantalla' : 'Mostrar etiqueta en pantalla'}
                                                        style={{
                                                            background: tol.visible ? '#23863610' : '#f8514910',
                                                            border: `2px solid ${tol.visible ? '#238636' : '#f85149'}`,
                                                            borderRadius: 6,
                                                            cursor: 'pointer',
                                                            fontSize: '1rem',
                                                            padding: '4px 8px',
                                                            minWidth: 38,
                                                            transition: 'all 0.2s',
                                                            color: tol.visible ? '#238636' : '#f85149',
                                                        }}
                                                    >
                                                        {tol.visible ? '👁' : '🚫'}
                                                    </button>
                                                </td>
                                                <td style={{ padding: '8px 12px', fontWeight: 600, color: tol.enabled ? '#e6edf3' : '#484f58' }}>
                                                    <span style={{
                                                        display: 'inline-block', width: 10, height: 10, borderRadius: '50%', marginRight: 8,
                                                        background: tol.enabled ? '#238636' : '#484f58',
                                                    }} />
                                                    {tol.className}
                                                </td>
                                                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                                    <input
                                                        type="number" step="0.01" value={tol.measuredValue}
                                                        readOnly
                                                        style={{
                                                            width: '100%', padding: '6px 8px', background: '#161b22', border: '1px solid #30363d',
                                                            borderRadius: 4, color: '#8b949e', fontSize: '0.82rem', textAlign: 'center', cursor: 'default',
                                                        }}
                                                    />
                                                </td>
                                                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                                    <input
                                                        type="number" step="0.01" value={tol.tolerancePlus}
                                                        onChange={(e) => updateTolerance(idx, 'tolerancePlus', parseFloat(e.target.value) || 0)}
                                                        style={{
                                                            width: '100%', padding: '6px 8px', background: '#0d1117', border: '1px solid #1f6feb40',
                                                            borderRadius: 4, color: '#58a6ff', fontSize: '0.82rem', textAlign: 'center',
                                                        }}
                                                    />
                                                </td>
                                                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                                    <input
                                                        type="number" step="0.01" value={tol.toleranceMinus}
                                                        onChange={(e) => updateTolerance(idx, 'toleranceMinus', parseFloat(e.target.value) || 0)}
                                                        style={{
                                                            width: '100%', padding: '6px 8px', background: '#0d1117', border: '1px solid #f8514930',
                                                            borderRadius: 4, color: '#f85149', fontSize: '0.82rem', textAlign: 'center',
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <button
                                onClick={() => {
                                    const name = prompt('Nombre de la nueva etiqueta:');
                                    if (name && name.trim()) {
                                        setTolerances(prev => [...prev, {
                                            className: name.trim(),
                                            enabled: true,
                                            visible: true,
                                            measuredValue: 0,
                                            tolerancePlus: 0.5,
                                            toleranceMinus: 0.5,
                                        }]);
                                    }
                                }}
                                style={{ padding: '8px 16px', fontSize: '0.78rem', fontWeight: 600, background: '#21262d', color: '#e6edf3', border: '1px solid #30363d', borderRadius: 4, cursor: 'pointer' }}
                            >+ Añadir Etiqueta Manual</button>
                            {tolerances.length > 0 && (
                                <button
                                    onClick={() => { if (confirm('¿Borrar todas las tolerancias?')) { setTolerances([]); } }}
                                    style={{ padding: '8px 16px', fontSize: '0.78rem', fontWeight: 600, background: 'transparent', color: '#f85149', border: '1px solid #f8514930', borderRadius: 4, cursor: 'pointer' }}
                                >🗑 Limpiar Todo</button>
                            )}
                        </div>
                    </div>
                ) : configTab === 'barcode' ? (
                    /* ═══ BARCODE READER ═══ */
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8, color: '#fff' }}>📊 Lector Código de Barras</h2>
                        <p style={{ fontSize: '0.82rem', color: '#8b949e', marginBottom: 6 }}>
                            DATALOGIC modelo GD4520 — Conexión USB HID
                        </p>
                        <p style={{ fontSize: '0.72rem', color: '#484f58', marginBottom: 20 }}>
                            El lector envía los datos como pulsaciones de teclado. Activa la escucha para capturar los códigos escaneados.
                        </p>

                        {/* Control principal */}
                        <div style={{
                            display: 'flex', gap: 16, marginBottom: 24, alignItems: 'stretch',
                        }}>
                            {/* Botón escucha */}
                            <button
                                onClick={() => {
                                    const next = !barcodeListening;
                                    setBarcodeListening(next);
                                }}
                                style={{
                                    flex: 1, padding: '20px 24px',
                                    background: barcodeListening
                                        ? 'linear-gradient(135deg, #238636, #2ea043)'
                                        : 'linear-gradient(135deg, #21262d, #30363d)',
                                    color: '#fff', border: barcodeListening ? '2px solid #3fb950' : '2px solid #30363d',
                                    borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                                    transition: 'all 0.3s',
                                    boxShadow: barcodeListening ? '0 0 30px rgba(35,134,54,0.4)' : 'none',
                                    animation: barcodeListening ? 'pulse 2s infinite' : 'none',
                                }}>
                                <span style={{ fontSize: '2.5rem' }}>{barcodeListening ? '📡' : '📊'}</span>
                                {barcodeListening ? '🟢 ESCUCHANDO...' : '⚪ INICIAR ESCUCHA'}
                                <span style={{ fontSize: '0.72rem', fontWeight: 400, color: barcodeListening ? '#a5d6a7' : '#8b949e' }}>
                                    {barcodeListening ? 'Escanea un código de barras ahora' : 'Pulsa para activar la captura'}
                                </span>
                            </button>

                            {/* Estado */}
                            <div style={{
                                flex: 1, padding: '20px 24px', background: '#161b22', border: '1px solid #30363d',
                                borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                            }}>
                                <div style={{ fontSize: '0.78rem', color: '#8b949e', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Estadísticas</div>
                                <div style={{ display: 'flex', gap: 20 }}>
                                    <div>
                                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#58a6ff' }}>{barcodeHistory.length}</div>
                                        <div style={{ fontSize: '0.72rem', color: '#8b949e' }}>Escaneos totales</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3fb950' }}>{barcodeHistory.length > 0 ? barcodeHistory[0].code.length : 0}</div>
                                        <div style={{ fontSize: '0.72rem', color: '#8b949e' }}>Último (chars)</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Configuración */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24,
                        }}>
                            <div style={{ padding: '14px 16px', background: '#161b22', border: '1px solid #30363d', borderRadius: 10 }}>
                                <label style={{ fontSize: '0.72rem', color: '#8b949e', fontWeight: 600, display: 'block', marginBottom: 6 }}>PREFIJO (filtro)</label>
                                <input
                                    type="text" value={barcodePrefix} placeholder="ej: PRE-"
                                    onChange={(e) => { setBarcodePrefix(e.target.value); localStorage.setItem('barcodePrefix', e.target.value); }}
                                    style={{
                                        width: '100%', padding: '8px 12px', background: '#0d1117', border: '1px solid #30363d',
                                        borderRadius: 6, color: '#e6edf3', fontSize: '0.88rem', boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                            <div style={{ padding: '14px 16px', background: '#161b22', border: '1px solid #30363d', borderRadius: 10 }}>
                                <label style={{ fontSize: '0.72rem', color: '#8b949e', fontWeight: 600, display: 'block', marginBottom: 6 }}>SUFIJO (filtro)</label>
                                <input
                                    type="text" value={barcodeSuffix} placeholder="ej: -END"
                                    onChange={(e) => { setBarcodeSuffix(e.target.value); localStorage.setItem('barcodeSuffix', e.target.value); }}
                                    style={{
                                        width: '100%', padding: '8px 12px', background: '#0d1117', border: '1px solid #30363d',
                                        borderRadius: 6, color: '#e6edf3', fontSize: '0.88rem', boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                            <div style={{
                                padding: '14px 16px', background: '#161b22', border: '1px solid #30363d', borderRadius: 10,
                                display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                            }} onClick={() => { setBarcodeSound(!barcodeSound); localStorage.setItem('barcodeSound', String(!barcodeSound)); }}>
                                <div style={{
                                    width: 44, height: 24, borderRadius: 12, position: 'relative', transition: 'all 0.3s',
                                    background: barcodeSound ? '#238636' : '#30363d',
                                }}>
                                    <div style={{
                                        width: 20, height: 20, borderRadius: '50%', background: '#fff',
                                        position: 'absolute', top: 2, transition: 'all 0.3s',
                                        left: barcodeSound ? 22 : 2,
                                    }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.72rem', color: '#8b949e', fontWeight: 600 }}>SONIDO</div>
                                    <div style={{ fontSize: '0.82rem', color: '#e6edf3' }}>{barcodeSound ? '🔊 Activado' : '🔇 Silenciado'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Último escaneo destacado */}
                        {barcodeHistory.length > 0 && (
                            <div style={{
                                padding: '20px 24px', marginBottom: 20,
                                background: 'linear-gradient(135deg, #0d1117, #161b22)',
                                border: '2px solid #1f6feb',
                                borderRadius: 12,
                                boxShadow: '0 0 20px rgba(31,111,235,0.15)',
                            }}>
                                <div style={{ fontSize: '0.72rem', color: '#58a6ff', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Último código escaneado</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                    {barcodeHistory[0].code}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#8b949e', marginTop: 6 }}>
                                    {barcodeHistory[0].timestamp}
                                </div>
                            </div>
                        )}

                        {/* Historial */}
                        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e6edf3' }}>📜 Historial de Escaneos</h3>
                            {barcodeHistory.length > 0 && (
                                <button
                                    onClick={() => { if (confirm('¿Borrar todo el historial?')) { setBarcodeHistory([]); localStorage.removeItem('barcodeHistory'); } }}
                                    style={{ padding: '6px 14px', fontSize: '0.72rem', fontWeight: 600, background: 'transparent', color: '#f85149', border: '1px solid #f8514930', borderRadius: 6, cursor: 'pointer' }}
                                >🗑 Limpiar</button>
                            )}
                        </div>

                        {barcodeHistory.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#484f58', fontSize: '0.88rem' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 12 }}>📊</div>
                                No hay escaneos registrados. Activa la escucha y escanea un código.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <div style={{
                                    display: 'grid', gridTemplateColumns: '50px 1fr 180px 60px', gap: 8,
                                    padding: '8px 12px', background: '#161b22', borderRadius: '8px 8px 0 0',
                                    fontSize: '0.68rem', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase',
                                }}>
                                    <span>#</span><span>Código</span><span>Fecha/Hora</span><span></span>
                                </div>
                                {barcodeHistory.map((entry, i) => (
                                    <div key={i} style={{
                                        display: 'grid', gridTemplateColumns: '50px 1fr 180px 60px', gap: 8,
                                        padding: '10px 12px', background: i % 2 === 0 ? '#0d1117' : '#161b22',
                                        borderBottom: '1px solid #21262d', alignItems: 'center',
                                        borderRadius: i === barcodeHistory.length - 1 ? '0 0 8px 8px' : 0,
                                    }}>
                                        <span style={{ fontSize: '0.72rem', color: '#484f58', fontWeight: 600 }}>{barcodeHistory.length - i}</span>
                                        <span style={{ fontSize: '0.88rem', color: '#e6edf3', fontFamily: 'monospace', fontWeight: 600, wordBreak: 'break-all' }}>{entry.code}</span>
                                        <span style={{ fontSize: '0.72rem', color: '#8b949e' }}>{entry.timestamp}</span>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(entry.code)}
                                            style={{ padding: '4px 8px', background: '#21262d', border: '1px solid #30363d', borderRadius: 4, color: '#8b949e', cursor: 'pointer', fontSize: '0.68rem' }}
                                        >📋</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            {/* 3D OBJ Viewer Modal */}
            {viewingObj && (
                <ObjViewer
                    objUrl={viewingObj.url}
                    mtlUrl={viewingObj.mtlUrl}
                    fileName={viewingObj.fileName}
                    objElementName={mappings.find(m => m.id === viewingObj.mappingId)?.objElementName}
                    ralColor={(() => {
                        const specs = mappings.find(m => m.id === viewingObj.mappingId)?.modelSpecs;
                        if (specs?.color) {
                            const ral = extractRAL(specs.color);
                            if (ral) return ralToHex(ral) || undefined;
                        }
                        return undefined;
                    })()}
                    modelSpecs={mappings.find(m => m.id === viewingObj.mappingId)?.modelSpecs || {}}
                    onSpecsUpdate={(specs) => {
                        setMappings(prev => prev.map(m =>
                            m.id === viewingObj.mappingId ? { ...m, modelSpecs: specs } : m
                        ));
                    }}
                    onClose={() => setViewingObj(null)}
                />
            )}
        </div>
    );
};

export default ConfigScreen;
