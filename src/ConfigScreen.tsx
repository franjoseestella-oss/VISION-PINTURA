import { useState, useEffect, useCallback } from 'react';

// ─── Types ──────────────────────────────────────────────────────
interface VideoMapping {
    id: string;
    label: string;
    videoFile: string;
}

interface TrackTolerance {
    className: string;
    enabled: boolean;
    measuredValue: number;
    tolerancePlus: number;
    toleranceMinus: number;
}

interface ConfigScreenProps {
    mappings: VideoMapping[];
    setMappings: React.Dispatch<React.SetStateAction<VideoMapping[]>>;
}

// ─── Sub-tab type ───────────────────────────────────────────────
type ConfigTab = 'videoMapping' | 'tolerancias';

const ConfigScreen: React.FC<ConfigScreenProps> = ({ mappings, setMappings }) => {
    const [configTab, setConfigTab] = useState<ConfigTab>('tolerancias');

    // ═══ TOLERANCIAS TRACKING STATE ═══
    const [tolerances, setTolerances] = useState<TrackTolerance[]>(() => {
        const saved = localStorage.getItem('trackTolerances');
        return saved ? JSON.parse(saved) : [];
    });
    const [, setRoboflowClasses] = useState<string[]>([]);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [classesError, setClassesError] = useState<string | null>(null);

    // Persist tolerances
    useEffect(() => {
        localStorage.setItem('trackTolerances', JSON.stringify(tolerances));
    }, [tolerances]);

    // Read trackSpec from localStorage for measured value
    const [trackSpec, setTrackSpec] = useState<any>(() => {
        const saved = localStorage.getItem('trackSpec');
        return saved ? JSON.parse(saved) : null;
    });
    useEffect(() => {
        const interval = setInterval(() => {
            const saved = localStorage.getItem('trackSpec');
            setTrackSpec(saved ? JSON.parse(saved) : null);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

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

    // Update measured value when trackSpec changes
    useEffect(() => {
        if (!trackSpec) return;
        setTolerances(prev => prev.map(t => {
            if (t.className === trackSpec.classA || t.className === trackSpec.classB) {
                return { ...t, measuredValue: trackSpec.distanceMm || 0 };
            }
            return t;
        }));
    }, [trackSpec]);

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
                    🎬 Video Mapping
                </button>
                <button style={tabStyle(configTab === 'tolerancias')} onClick={() => setConfigTab('tolerancias')}>
                    📐 Tolerancias Tracking
                </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
                {configTab === 'videoMapping' ? (
                    /* ═══ VIDEO MAPPING ═══ */
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8, color: '#fff' }}>🎬 Video Mapping Configuration</h2>
                        <p style={{ fontSize: '0.82rem', color: '#8b949e', marginBottom: 16 }}>Asocia detecciones de clase a archivos de vídeo</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                            {mappings.map(map => (
                                <div key={map.id} style={{
                                    background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: 16,
                                    display: 'flex', flexDirection: 'column', gap: 10,
                                }}>
                                    <div>
                                        <label style={{ fontSize: '0.72rem', color: '#8b949e', display: 'block', marginBottom: 4 }}>Clase detectada</label>
                                        <input
                                            type="text" value={map.label}
                                            onChange={(e) => setMappings(mappings.map(m => m.id === map.id ? { ...m, label: e.target.value } : m))}
                                            placeholder="Ej: Montacargas"
                                            style={{ width: '100%', padding: '8px 10px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 4, color: '#e6edf3', fontSize: '0.82rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.72rem', color: '#8b949e', display: 'block', marginBottom: 4 }}>Archivo de vídeo</label>
                                        <input
                                            type="text" value={map.videoFile}
                                            onChange={(e) => setMappings(mappings.map(m => m.id === map.id ? { ...m, videoFile: e.target.value } : m))}
                                            placeholder="Ej: Bastidores.mp4"
                                            style={{ width: '100%', padding: '8px 10px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 4, color: '#e6edf3', fontSize: '0.82rem' }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => setMappings(mappings.filter(m => m.id !== map.id))}
                                        style={{ alignSelf: 'flex-end', fontSize: '0.7rem', color: '#ff4444', background: 'transparent', border: '1px solid #ff444430', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}
                                    >🗑 Eliminar</button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setMappings([...mappings, { id: Date.now().toString(), label: '', videoFile: '' }])}
                            style={{ marginTop: 12, padding: '10px 20px', background: '#1f6feb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
                        >+ Añadir Mapping</button>
                    </div>
                ) : (
                    /* ═══ TOLERANCIAS TRACKING ═══ */
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
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
                            {classesError && (
                                <span style={{ fontSize: '0.7rem', color: '#f8514950' }}>⚠ {classesError}</span>
                            )}
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#8b949e', marginBottom: 12 }}>
                            Define las tolerancias para cada etiqueta del proyecto Roboflow. El valor medido se importa automáticamente al guardar un track.
                        </p>

                        {/* Track spec info */}
                        {trackSpec && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', marginBottom: 12,
                                background: '#FFFF0010', border: '1px solid #FFFF0025', borderRadius: 6, fontSize: '0.78rem',
                            }}>
                                <span style={{ color: '#FFFF00' }}>🎯 Track activo:</span>
                                <span style={{ color: '#00FFFF' }}>{trackSpec.classA}</span>
                                <span style={{ color: '#8b949e' }}>↔</span>
                                <span style={{ color: '#FF00FF' }}>{trackSpec.classB}</span>
                                <span style={{ color: '#FFFF00', fontWeight: 700 }}>{trackSpec.distanceMm?.toFixed(2)} mm</span>
                            </div>
                        )}

                        {/* Table */}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #30363d' }}>
                                        <th style={{ padding: '10px 8px', textAlign: 'center', color: '#8b949e', fontWeight: 600, width: 60 }}>✓</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'left', color: '#8b949e', fontWeight: 600 }}>Etiqueta Roboflow</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'center', color: '#8b949e', fontWeight: 600, width: 130 }}>Valor Medido (mm)</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'center', color: '#8b949e', fontWeight: 600, width: 130 }}>Tol. + (mm)</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'center', color: '#8b949e', fontWeight: 600, width: 130 }}>Tol. - (mm)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tolerances.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#8b949e' }}>
                                                No hay etiquetas. Pulsa "Importar Etiquetas Roboflow" para cargar las clases del modelo.
                                            </td>
                                        </tr>
                                    ) : tolerances.map((tol, idx) => {
                                        const isTrackClass = trackSpec && (trackSpec.classA === tol.className || trackSpec.classB === tol.className);
                                        return (
                                            <tr key={tol.className}
                                                style={{
                                                    borderBottom: '1px solid #21262d',
                                                    background: isTrackClass ? '#FFFF0008' : 'transparent',
                                                    transition: 'background 0.2s',
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#161b22'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = isTrackClass ? '#FFFF0008' : 'transparent'}
                                            >
                                                <td style={{ padding: '8px', textAlign: 'center' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={tol.enabled}
                                                        onChange={(e) => updateTolerance(idx, 'enabled', e.target.checked)}
                                                        style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#1f6feb' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '8px 12px', fontWeight: 600, color: tol.enabled ? '#e6edf3' : '#484f58' }}>
                                                    <span style={{
                                                        display: 'inline-block', width: 10, height: 10, borderRadius: '50%', marginRight: 8,
                                                        background: isTrackClass ? '#FFFF00' : (tol.enabled ? '#238636' : '#484f58'),
                                                    }} />
                                                    {tol.className}
                                                    {isTrackClass && <span style={{ fontSize: '0.65rem', color: '#FFFF00', marginLeft: 6 }}>★ TRACK</span>}
                                                </td>
                                                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                                    <input
                                                        type="number" step="0.01" value={tol.measuredValue}
                                                        onChange={(e) => updateTolerance(idx, 'measuredValue', parseFloat(e.target.value) || 0)}
                                                        style={{
                                                            width: '100%', padding: '6px 8px', background: '#0d1117', border: '1px solid #30363d',
                                                            borderRadius: 4, color: '#e6edf3', fontSize: '0.82rem', textAlign: 'center',
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
                )}
            </div>
        </div>
    );
};

export default ConfigScreen;
