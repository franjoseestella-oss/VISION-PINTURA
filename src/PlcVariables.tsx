import { useState, useEffect, useRef } from 'react';

// ─── Tipos compartidos con PlcConfig ─────────────────────────────────────────
interface PLCVariable {
    id: string;
    name: string;
    memoryArea: 'DM' | 'CIO' | 'W' | 'HR';
    address: number;
    dataType: 'BOOL' | 'INT' | 'DINT' | 'REAL' | 'UINT' | 'WORD';
    value: string | number | boolean | null;
    description: string;
    access: 'RECV' | 'SEND' | 'RECV/SEND';
    lastUpdate: string | null;
    previousValue?: string | number | boolean | null;
    changed?: boolean;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// Variables por defecto (mismas que PlcConfig — OMRON CJ2M)
const DEFAULT_VARIABLES: PLCVariable[] = [
    { id: '1', name: 'ProductionCount', memoryArea: 'DM', address: 100, dataType: 'DINT', value: null, description: 'Contador total piezas producidas', access: 'RECV', lastUpdate: null },
    { id: '2', name: 'PinturaOK', memoryArea: 'CIO', address: 0, dataType: 'BOOL', value: null, description: 'Bit señal pieza pintura OK (CIO 0.00)', access: 'RECV', lastUpdate: null },
    { id: '3', name: 'IniciarInspeccion', memoryArea: 'DM', address: 101, dataType: 'BOOL', value: null, description: 'Trigger inicio inspección visión', access: 'RECV/SEND', lastUpdate: null },
    { id: '4', name: 'NumDefectos', memoryArea: 'DM', address: 102, dataType: 'INT', value: null, description: 'Número de defectos detectados por visión', access: 'RECV/SEND', lastUpdate: null },
    { id: '5', name: 'EstadoPLC', memoryArea: 'W', address: 0, dataType: 'WORD', value: null, description: 'Registro de estado interno del PLC', access: 'RECV', lastUpdate: null },
];

const AREA_COLORS: Record<PLCVariable['memoryArea'], { bg: string; text: string; border: string }> = {
    DM: { bg: 'rgba(99,102,241,0.15)', text: '#a5b4fc', border: 'rgba(99,102,241,0.5)' },
    CIO: { bg: 'rgba(34,197,94,0.15)', text: '#86efac', border: 'rgba(34,197,94,0.5)' },
    W: { bg: 'rgba(251,191,36,0.15)', text: '#fde68a', border: 'rgba(251,191,36,0.5)' },
    HR: { bg: 'rgba(249,115,22,0.15)', text: '#fdba74', border: 'rgba(249,115,22,0.5)' },
};

function formatValue(v: PLCVariable): string {
    if (v.value === null || v.value === undefined) return '—';
    if (v.dataType === 'BOOL') return v.value ? 'TRUE' : 'FALSE';
    if (v.dataType === 'REAL') return Number(v.value).toFixed(3);
    return String(v.value);
}

export default function PlcVariables() {
    const [variables, setVariables] = useState<PLCVariable[]>(DEFAULT_VARIABLES);
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [filter, setFilter] = useState<'ALL' | PLCVariable['memoryArea'] | PLCVariable['access']>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
    const [plcIp, setPlcIp] = useState('192.168.0.1');
    const [pollInterval, setPollInterval] = useState(500);
    const [eventLog, setEventLog] = useState<{ ts: string; msg: string; type: 'change' | 'connect' | 'error' }[]>([]);
    const [totalUpdates, setTotalUpdates] = useState(0);

    const wsRef = useRef<WebSocket | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [eventLog]);

    const addEvent = (type: 'change' | 'connect' | 'error', msg: string) => {
        setEventLog(p => [...p.slice(-49), { ts: new Date().toLocaleTimeString(), type, msg }]);
    };

    const handleConnect = () => {
        setStatus('connecting');
        addEvent('connect', `Conectando a ws://127.0.0.1:8766 → CJ2M ${plcIp}`);

        try {
            const ws = new WebSocket('ws://127.0.0.1:8766');
            wsRef.current = ws;

            ws.onopen = () => {
                // No configuramos status a connected todavía, esperamos al Python
                addEvent('connect', `Conectando al bridge Python... Solicitando link FINS a ${plcIp}`);
                ws.send(JSON.stringify({ cmd: 'connect', ip: plcIp, port: 9600 }));
            };

            ws.onmessage = (e) => {
                try {
                    const msg = JSON.parse(e.data);
                    if (msg.type === 'status') {
                        if (msg.payload === 'connected') {
                            setStatus('connected');
                            addEvent('connect', `✓ ¡Enlace FINS Real Establecido con OMRON CJ2M!`);
                        }
                    } else if (msg.type === 'error') {
                        setStatus('disconnected');
                        addEvent('error', `❌ Error del PLC: ${msg.payload}`);
                    } else if (msg.type === 'data') {
                        const data = msg.payload as Record<string, unknown>;
                        setVariables(prev => prev.map(v => {
                            const newVal = data[v.name] !== undefined ? data[v.name] as PLCVariable['value'] : v.value;
                            const didChange = newVal !== v.value && v.value !== null;
                            if (didChange) {
                                addEvent('change', `${v.name}: ${formatValue(v)} → ${newVal}`);
                                setTotalUpdates(c => c + 1);
                            }
                            return { ...v, previousValue: v.value, value: newVal, changed: didChange, lastUpdate: data[v.name] !== undefined ? new Date().toLocaleTimeString() : v.lastUpdate };
                        }));
                    }
                } catch { /* ignore */ }
            };

            ws.onerror = () => {
                addEvent('error', '⚠️ Bridge Python no encontrado. ¿Está plc_server.py ejecutándose?');
                setStatus('disconnected');
            };

            ws.onclose = () => {
                setStatus('disconnected');
            };
        } catch {
            addEvent('error', 'Fallo crítico al iniciar WebSocket local');
            setStatus('disconnected');
        }
    };

    const handleDisconnect = () => {
        wsRef.current?.close();
        wsRef.current = null;
        setStatus('disconnected');
        if (pollRef.current) clearInterval(pollRef.current);
        setVariables(p => p.map(v => ({ ...v, value: null, lastUpdate: null, changed: false })));
        addEvent('connect', 'Desconectado del PLC OMRON CJ2M');
    };

    // Simulación de polling (DESACTIVADA)
    /*
    useEffect(() => {
        if (!isPolling) return;
        pollRef.current = setInterval(() => {
            const now = new Date().toLocaleTimeString();
            setVariables(prev => prev.map(v => {
                const newVal: PLCVariable['value'] =
                    v.dataType === 'BOOL' ? Math.random() > 0.3 :
                        v.dataType === 'REAL' ? parseFloat((Math.random() * 100).toFixed(3)) :
                            v.dataType === 'WORD' ? Math.floor(Math.random() * 65535) :
                                v.dataType === 'DINT' ? Math.floor(Math.random() * 9999) :
                                    Math.floor(Math.random() * 500);

                const didChange = v.value !== null && newVal !== v.value;
                if (didChange) {
                    setTotalUpdates(c => c + 1);
                }
                return { ...v, previousValue: v.value, value: newVal, changed: didChange, lastUpdate: now };
            }));
        }, pollInterval);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [isPolling, pollInterval]);
    */

    // Clear "changed" flash after 600ms
    useEffect(() => {
        const timeout = setTimeout(() => {
            setVariables(p => p.map(v => ({ ...v, changed: false })));
        }, 600);
        return () => clearTimeout(timeout);
    }, [variables]);

    const statusMeta: Record<ConnectionStatus, { color: string; label: string; dot: string }> = {
        disconnected: { color: '#6b7280', label: 'Desconectado', dot: '#6b7280' },
        connecting: { color: '#f59e0b', label: 'Conectando...', dot: '#f59e0b' },
        connected: { color: '#22c55e', label: 'Conectado FINS TCP', dot: '#22c55e' },
        error: { color: '#ef4444', label: 'Error', dot: '#ef4444' },
    };

    const filtered = variables.filter(v => {
        const matchSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchFilter = filter === 'ALL' || v.memoryArea === filter || v.access === filter;
        return matchSearch && matchFilter;
    });

    const boolVars = variables.filter(v => v.dataType === 'BOOL');

    return (
        <div className="plcv-container">
            {/* ── Header ── */}
            <div className="plcv-header">
                <div className="plcv-header-top">
                    <div>
                        <h2>📡 Monitor de Variables PLC</h2>
                        <p>OMRON CJ2M · FINS TCP · Cruce de señales en tiempo real</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="plcv-total-badge">
                            <span>{totalUpdates}</span>
                            <small>actualizaciones</small>
                        </div>
                        <div className="plcv-status-chip" style={{ borderColor: statusMeta[status].color, color: statusMeta[status].color }}>
                            <span className="plcv-dot" style={{
                                background: statusMeta[status].dot,
                                boxShadow: status === 'connected' ? `0 0 8px ${statusMeta[status].dot}` : 'none',
                                animation: status === 'connecting' ? 'plcv-blink 0.8s infinite' : status === 'connected' ? 'plcv-pulse 2s infinite' : 'none',
                            }} />
                            {statusMeta[status].label}
                        </div>
                    </div>
                </div>

                {/* Controles de conexión */}
                <div className="plcv-controls-row">
                    <input
                        className="plcv-ip-input"
                        value={plcIp}
                        onChange={e => setPlcIp(e.target.value)}
                        placeholder="IP PLC"
                        disabled={status === 'connected'}
                        style={{ width: 160 }}
                    />
                    <label style={{ color: '#9ca3af', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                        Polling
                        <select className="plcv-select" value={pollInterval} onChange={e => setPollInterval(+e.target.value)} disabled={status !== 'connected'}>
                            <option value={500}>500 ms</option>
                            <option value={1000}>1 s</option>
                            <option value={2000}>2 s</option>
                            <option value={5000}>5 s</option>
                        </select>
                    </label>

                    {status !== 'connected' ? (
                        <button className="plcv-btn-connect" onClick={handleConnect} disabled={status === 'connecting'}>
                            {status === 'connecting' ? '⏳ Conectando...' : '🔌 Conectar PLC'}
                        </button>
                    ) : (
                        <button className="plcv-btn-disconnect" onClick={handleDisconnect}>⏹ Desconectar</button>
                    )}

                    {/* Separador */}
                    <div style={{ flex: 1 }} />

                    {/* Búsqueda */}
                    <input
                        className="plcv-search"
                        placeholder="🔍 Buscar variable..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />

                    {/* Filtros */}
                    <div className="plcv-filter-group">
                        {(['ALL', 'DM', 'CIO', 'W', 'HR', 'RECV', 'SEND', 'RECV/SEND'] as const).map(f => (
                            <button key={f} className={`plcv-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
                        ))}
                    </div>

                    {/* Vista */}
                    <div className="plcv-view-toggle">
                        <button className={viewMode === 'cards' ? 'active' : ''} onClick={() => setViewMode('cards')}>⊞</button>
                        <button className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')}>☰</button>
                    </div>
                </div>
            </div>

            {/* ── Cuerpo ── */}
            <div className="plcv-body">
                {status !== 'connected' && (
                    <div className="plcv-offline-banner">
                        ⚠️ PLC no conectado — Pulsa <strong>Conectar PLC</strong> para iniciar el polling FINS TCP. Se activará el modo simulación si el bridge Python no está disponible.
                    </div>
                )}

                {/* Resumen rápido de BOOLs en la parte superior */}
                {status === 'connected' && boolVars.length > 0 && (
                    <div className="plcv-bool-strip">
                        <span className="plcv-strip-label">SEÑALES DIGITALES</span>
                        {boolVars.map(v => (
                            <div key={v.id} className={`plcv-bool-pill ${v.value ? 'on' : 'off'} ${v.changed ? 'flash' : ''}`}>
                                <span className="plcv-bool-dot" />
                                <span className="plcv-bool-name">{v.name}</span>
                                <span className="plcv-bool-val">{v.value ? '1' : '0'}</span>
                            </div>
                        ))}
                    </div>
                )}

                {viewMode === 'cards' ? (
                    <div className="plcv-cards-grid">
                        {filtered.map(v => {
                            const ac = AREA_COLORS[v.memoryArea];
                            const isBool = v.dataType === 'BOOL';
                            return (
                                <div key={v.id} className={`plcv-card ${v.changed ? 'flash' : ''} ${status === 'connected' ? 'live' : ''}`}>
                                    {/* Área badge */}
                                    <div className="plcv-card-top">
                                        <span className="plcv-area-badge" style={{ background: ac.bg, color: ac.text, borderColor: ac.border }}>
                                            {v.memoryArea}[{v.address}]
                                        </span>
                                        <span className={`plcv-access-badge access-${v.access.toLowerCase().replace('/', '')}`}>{v.access}</span>
                                    </div>

                                    {/* Nombre */}
                                    <div className="plcv-card-name">{v.name}</div>
                                    <div className="plcv-card-desc">{v.description}</div>

                                    {/* Valor principal */}
                                    <div className={`plcv-value-display ${isBool ? (v.value ? 'bool-on' : 'bool-off') : 'num'}`}>
                                        {v.value === null ? (
                                            <span className="plcv-null">Sin datos</span>
                                        ) : isBool ? (
                                            <>
                                                <span className={`plcv-bool-led ${v.value ? 'on' : 'off'}`} />
                                                <span>{v.value ? 'TRUE' : 'FALSE'}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="plcv-num-val">{formatValue(v)}</span>
                                                <span className="plcv-type-tag">{v.dataType}</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Valor anterior */}
                                    {v.previousValue !== undefined && v.previousValue !== null && v.previousValue !== v.value && (
                                        <div className="plcv-prev-val">
                                            anterior: <span>{v.dataType === 'BOOL' ? (v.previousValue ? 'TRUE' : 'FALSE') : String(v.previousValue)}</span>
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="plcv-card-footer">
                                        <span className="plcv-update-time">{v.lastUpdate ? `🕐 ${v.lastUpdate}` : 'Sin lectura'}</span>
                                        {status === 'connected' && <span className="plcv-live-tag">LIVE</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* ── Vista tabla ── */
                    <div className="plcv-table-wrapper">
                        <table className="plcv-table">
                            <thead>
                                <tr>
                                    <th>Variable</th>
                                    <th>Área</th>
                                    <th>Addr.</th>
                                    <th>Tipo</th>
                                    <th>Acceso</th>
                                    <th>Valor actual</th>
                                    <th>Estado</th>
                                    <th>Última lectura</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(v => {
                                    const ac = AREA_COLORS[v.memoryArea];
                                    const isBool = v.dataType === 'BOOL';
                                    return (
                                        <tr key={v.id} className={v.changed ? 'row-flash' : ''}>
                                            <td>
                                                <div className="plcv-tbl-name">{v.name}</div>
                                                <div className="plcv-tbl-desc">{v.description}</div>
                                            </td>
                                            <td>
                                                <span className="plcv-area-badge sm" style={{ background: ac.bg, color: ac.text, borderColor: ac.border }}>
                                                    {v.memoryArea}
                                                </span>
                                            </td>
                                            <td><code className="plcv-mono">[{v.address}]</code></td>
                                            <td><span className="plcv-type-tag">{v.dataType}</span></td>
                                            <td><span className={`plcv-access-badge access-${v.access.toLowerCase().replace('/', '')}`}>{v.access}</span></td>
                                            <td>
                                                {v.value === null ? <span className="plcv-null">—</span>
                                                    : isBool
                                                        ? <span className={`plcv-tbl-bool ${v.value ? 'on' : 'off'}`}>{v.value ? '■ TRUE' : '□ FALSE'}</span>
                                                        : <span className="plcv-tbl-num">{formatValue(v)}</span>
                                                }
                                            </td>
                                            <td>
                                                {status === 'connected' && v.value !== null ? (
                                                    <span className="plcv-live-tag">LIVE</span>
                                                ) : (
                                                    <span className="plcv-offline-tag">OFFLINE</span>
                                                )}
                                            </td>
                                            <td><span className="plcv-update-time">{v.lastUpdate || '—'}</span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Panel lateral: log de eventos ── */}
                <div className="plcv-event-log">
                    <div className="plcv-log-header">
                        <span>📋 Log de Cambios</span>
                        <button className="plcv-log-clear" onClick={() => setEventLog([])}>Limpiar</button>
                    </div>
                    <div className="plcv-log-body">
                        {eventLog.length === 0 && <div className="plcv-log-empty">Sin eventos registrados</div>}
                        {eventLog.map((e, i) => (
                            <div key={i} className={`plcv-log-line log-${e.type}`}>
                                <span className="plcv-log-time">{e.ts}</span>
                                <span className="plcv-log-msg">{e.msg}</span>
                            </div>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                </div>
            </div>
        </div>
    );
}
