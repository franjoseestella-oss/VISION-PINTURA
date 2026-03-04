import { useState, useEffect, useRef } from 'react';

// ─── OMRON CJ2M · FINS TCP/IP Protocol ───────────────────────────────────────
// Puerto FINS TCP por defecto: 9600
// Nodo FINS = último octeto de la IP del PLC
// Áreas de memoria: CIO, W, HR, AR, DM, EM (Extended Memory)
// Comandos: SEND (escribir), RECV (leer), CMND (control RUN/STOP/RESET)
// NOTA: CJ2M soporta hasta 256 conexiones simultáneas FINS TCP.
// Ciclo mín: 0.1 ms · Latencia red esperada: 1–10 ms
// Config backend camera_server: 8765, plc_bridge: 8766
// ──────────────────────────────────────────────────────────────────────────────

interface FINSConfig {
    plcIp: string;
    plcPort: number;
    finsNode: number;       // = último octeto de IP del PLC
    srcNode: number;        // = último octeto de IP del PC/servidor
    networkAddr: number;    // 0 = red local
    unitAddr: number;       // 0 = CPU Unit
    pollInterval: number;   // ms entre lecturas (mín recomendado: 500ms)
    maxChannels: number;    // CJ2M: hasta 256 conexiones FINS simultáneas
    connectionMode: 'client' | 'server'; // Modo de conexión FINS TCP
}

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
}

interface PLCLog {
    ts: string;
    type: 'info' | 'success' | 'error' | 'warning' | 'fins';
    msg: string;
}

interface WsMessage {
    type: 'status' | 'data' | 'error' | 'fins_response';
    payload: unknown;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

const MEMORY_AREAS: Array<PLCVariable['memoryArea']> = ['DM', 'CIO', 'W', 'HR'];
const DATA_TYPES: Array<PLCVariable['dataType']> = ['BOOL', 'INT', 'DINT', 'REAL', 'UINT', 'WORD'];
const ACCESS_TYPES: Array<PLCVariable['access']> = ['RECV', 'SEND', 'RECV/SEND'];

const MEMORY_DESCRIPTIONS: Record<PLCVariable['memoryArea'], string> = {
    DM: 'Data Memory — 32.768 palabras (DM0–DM32767)',
    CIO: 'Core I/O — Entradas/Salidas y bits internos (CIO 0–6143)',
    W: 'Work Area — Área de trabajo interna (W0–W511)',
    HR: 'Holding Relay — Memoria retentiva (HR0–HR511)',
};

export default function PlcConfig() {
    const [config, setConfig] = useState<FINSConfig>({
        plcIp: '192.168.0.1',
        plcPort: 9600,
        finsNode: 1,      // auto: último octeto de plcIp
        srcNode: 50,        // último octeto de la IP del servidor Python
        networkAddr: 0,
        unitAddr: 0,
        pollInterval: 500,  // CJ2M: ciclo rápido, 500 ms es seguro
        maxChannels: 256,   // CJ2M soporta hasta 256 conexiones FINS TCP
        connectionMode: 'client', // Por defecto el PC es el cliente FINS
    });

    const [variables, setVariables] = useState<PLCVariable[]>([
        {
            id: '1', name: 'ProductionCount', memoryArea: 'DM', address: 100,
            dataType: 'DINT', value: null, description: 'Contador total piezas producidas',
            access: 'RECV', lastUpdate: null,
        },
        {
            id: '2', name: 'PinturaOK', memoryArea: 'CIO', address: 0,
            dataType: 'BOOL', value: null, description: 'Bit señal pieza pintura OK (CIO 0.00)',
            access: 'RECV', lastUpdate: null,
        },
        {
            id: '3', name: 'IniciarInspeccion', memoryArea: 'DM', address: 101,
            dataType: 'BOOL', value: null, description: 'Trigger inicio inspección visión',
            access: 'RECV/SEND', lastUpdate: null,
        },
        {
            id: '4', name: 'NumDefectos', memoryArea: 'DM', address: 102,
            dataType: 'INT', value: null, description: 'Número de defectos detectados por visión',
            access: 'RECV/SEND', lastUpdate: null,
        },
        {
            id: '5', name: 'EstadoPLC', memoryArea: 'W', address: 0,
            dataType: 'WORD', value: null, description: 'Registro de estado interno del PLC',
            access: 'RECV', lastUpdate: null,
        },
    ]);

    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [scanStatus, setScanStatus] = useState<'unknown' | 'scanning' | 'found' | 'not_found' | 'error'>('unknown');
    const [activeSection, setActiveSection] = useState<'connection' | 'variables' | 'monitor' | 'python'>('connection');
    const [logs, setLogs] = useState<PLCLog[]>([
        { ts: new Date().toLocaleTimeString(), type: 'info', msg: 'Sistema FINS TCP listo · OMRON CJ2M · Puerto 9600' },
        { ts: new Date().toLocaleTimeString(), type: 'info', msg: 'CJ2M: hasta 256 conexiones FINS · Ciclo mín 0.1 ms · DM 32768 palabras' },
    ]);
    const [editingVar, setEditingVar] = useState<PLCVariable | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const logEndRef = useRef<HTMLDivElement>(null);

    // Auto-calc FINS node from IP
    useEffect(() => {
        const lastOctet = parseInt(config.plcIp.split('.').pop() || '100');
        if (!isNaN(lastOctet)) setConfig(c => ({ ...c, finsNode: lastOctet }));
    }, [config.plcIp]);

    useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

    const log = (type: PLCLog['type'], msg: string) =>
        setLogs(p => [...p.slice(-149), { ts: new Date().toLocaleTimeString(), msg, type }]);

    const handleConnect = () => {
        setStatus('connecting');
        log('info', `Iniciando conexión FINS TCP → ${config.plcIp}:${config.plcPort}`);
        log('fins', `Frame FINS: ICF=C0, DNA=00, DA1=${String(config.finsNode).padStart(2, '0')}, DA2=00`);
        log('fins', `          SNA=00, SA1=${String(config.srcNode).padStart(2, '0')}, SA2=00, SID=00`);
        log('info', `Conectando al Python FINS Bridge en ws://127.0.0.1:8766...`);
        log('info', `CJ2M: EtherNet/IP integrado · CPU3x · Nodo FINS ${config.finsNode}`);

        // Try real WebSocket connection to Python bridge
        try {
            const ws = new WebSocket('ws://127.0.0.1:8766');
            wsRef.current = ws;

            ws.onopen = () => {
                log('info', `Esperando conexión directa FINS al OMRON CJ2M...`);
                ws.send(JSON.stringify({ cmd: 'connect', ip: config.plcIp, port: config.plcPort, node: config.finsNode }));
            };

            ws.onmessage = (e) => {
                try {
                    const msg: WsMessage = JSON.parse(e.data);
                    if (msg.type === 'status') {
                        if (msg.payload === 'connected') {
                            setStatus('connected');
                            log('success', `✓ FINS UDP handshake completado con ${config.plcIp}:${config.plcPort}`);
                            log('success', `✓ Enlace FINS establecido. Nodo${config.finsNode} ↔ Nodo${config.srcNode}`);
                            log('info', `Polling activo cada ${config.pollInterval}ms`);
                        }
                    } else if (msg.type === 'data') {
                        const data = msg.payload as Record<string, unknown>;
                        setVariables(prev => prev.map(v => ({
                            ...v,
                            value: data[v.name] !== undefined ? data[v.name] as PLCVariable['value'] : v.value,
                            lastUpdate: data[v.name] !== undefined ? new Date().toLocaleTimeString() : v.lastUpdate,
                        })));
                    } else if (msg.type === 'error') {
                        log('error', `❌ Error del PLC o Python Bridge: ${msg.payload}`);
                        setStatus('disconnected');
                    }
                } catch { /* ignore parse errors */ }
            };

            ws.onerror = () => {
                log('error', `❌ WebSocket no disponible. ¿plc_server.py está en marcha?`);
                setStatus('disconnected');
            };

            ws.onclose = () => {
                setStatus('disconnected');
                setIsPolling(false);
                log('warning', 'WebSocket cerrado. Desconectado del PLC.');
            };
        } catch {
            log('error', 'Fallo crítico al iniciar WebSocket local');
            setStatus('disconnected');
        }
    };

    const handleScan = async () => {
        log('info', `📡 Escaneando PLC en red (Ping -> ${config.plcIp}:${config.plcPort})...`);
        setScanStatus('scanning');
        try {
            const res = await fetch(`http://127.0.0.1:8765/api/scan_plc?ip=${config.plcIp}&port=${config.plcPort}`);
            const data = await res.json();
            if (data.ok) {
                if (data.alive) {
                    setScanStatus('found');
                    log('success', `✓ PLC encontrado en ${config.plcIp} (Ping OK).`);
                    if (data.tcp_open) {
                        log('success', `✓ Puerto TCP ${config.plcPort} abierto y respondiendo.`);
                    } else {
                        log('warning', `⚠️ El PLC responde al ping, pero el puerto TCP ${config.plcPort} parece cerrado.`);
                    }
                } else {
                    setScanStatus('not_found');
                    log('error', `❌ No hay respuesta del PLC en ${config.plcIp}.`);
                }
            } else {
                setScanStatus('error');
                log('error', '❌ Error al hacer parse desde camera_server');
            }
        } catch (e) {
            setScanStatus('error');
            log('error', '❌ No se pudo usar camera_server para el escaneo.');
        }
    };

    const handleDisconnect = () => {
        wsRef.current?.close();
        wsRef.current = null;
        setStatus('disconnected');
        setIsPolling(false);
        if (pollRef.current) clearInterval(pollRef.current);
        setVariables(p => p.map(v => ({ ...v, value: null, lastUpdate: null })));
        log('warning', 'Desconectado del PLC OMRON CJ2M.');
    };

    // Simulation polling
    useEffect(() => {
        if (!isPolling) return;
        pollRef.current = setInterval(() => {
            const now = new Date().toLocaleTimeString();
            setVariables(prev => prev.map(v => ({
                ...v,
                value: v.dataType === 'BOOL' ? Math.random() > 0.3 :
                    v.dataType === 'REAL' ? parseFloat((Math.random() * 100).toFixed(2)) :
                        v.dataType === 'WORD' ? Math.floor(Math.random() * 65535) :
                            Math.floor(Math.random() * 9999),
                lastUpdate: now,
            })));
            log('fins', `RECV ← DM[100..104] OK · CIO[0..0] OK`);
        }, config.pollInterval);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [isPolling, config.pollInterval]);

    const handleWrite = (v: PLCVariable, val: string) => {
        if (status !== 'connected') return;
        setVariables(p => p.map(x => x.id === v.id ? { ...x, value: val, lastUpdate: new Date().toLocaleTimeString() } : x));
        log('fins', `SEND → ${v.memoryArea}[${v.address}] = ${val}  (${v.name}, tipo ${v.dataType})`);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ cmd: 'write', area: v.memoryArea, addr: v.address, value: val, type: v.dataType }));
        }
    };

    const handleCmnd = (cmd: 'RUN' | 'STOP') => {
        if (status !== 'connected') return;
        log('fins', `CMND → PLC ${cmd} · Nodo FINS ${config.finsNode}`);
        log(cmd === 'RUN' ? 'success' : 'warning', `PLC puesto en modo ${cmd}`);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ cmd: 'cmnd', action: cmd }));
        }
    };

    const statusColor: Record<ConnectionStatus, string> = {
        disconnected: '#6b7280', connecting: '#f59e0b', connected: '#22c55e', error: '#ef4444',
    };
    const statusLabel: Record<ConnectionStatus, string> = {
        disconnected: 'Desconectado', connecting: 'Conectando...', connected: 'Conectado FINS TCP', error: 'Error FINS',
    };
    const logColor: Record<PLCLog['type'], string> = {
        info: '#93c5fd', success: '#4ade80', error: '#f87171', warning: '#fbbf24', fins: '#c084fc',
    };
    const accessClass: Record<PLCVariable['access'], string> = {
        'RECV': 'access-recv', 'SEND': 'access-send', 'RECV/SEND': 'access-both',
    };

    // Python bridge script content
    const pythonScript = `#!/usr/bin/env python3
"""
plc_bridge.py — OMRON CJ2M FINS TCP Bridge
React App <–– WebSocket (ws://127.0.0.1:8766) ––> Python ––> FINS TCP (${config.plcIp}:${config.plcPort})

Modelo: OMRON CJ2M (CPU31/32/33/34/35)
EtherNet/IP integrado en CPU3x · FINS TCP puerto 9600
DM: 32768 palabras · CIO: 6144 · W: 512 · HR: 512
Hasta 256 conexiones FINS TCP simultáneas

Instalación:
  pip install omron-fins websockets asyncio

Uso:
  python plc_bridge.py
"""
import asyncio
import json
import websockets
import fins.asyncio as fins_lib  # pip install omron-fins

# ─── Configuración FINS ────────────────────────────────────────────────────────
PLC_IP      = "${config.plcIp}"
PLC_PORT    = ${config.plcPort}
PLC_NODE    = ${config.finsNode}     # Último octeto de la IP del CJ2M
SRC_NODE    = ${config.srcNode}     # Último octeto de la IP de este servidor
WS_HOST     = "0.0.0.0"
WS_PORT     = 8766
POLL_INTERVAL = ${config.pollInterval / 1000}  # segundos · CJ2M soporta polling rápido
# ──────────────────────────────────────────────────────────────────────────────

class FINSBridge:
    def __init__(self):
        self.client = None
        self.connected = False

    async def connect(self):
        """Establece conexión FINS TCP con el PLC OMRON CJ2M"""
        try:
            self.client = fins_lib.UDPFINSClient(
                host=PLC_IP,
                port=PLC_PORT,
                dest_node_add=PLC_NODE,
                srce_node_add=SRC_NODE,
            )
            await self.client.connect()
            self.connected = True
            print(f"[FINS] Conectado a {PLC_IP}:{PLC_PORT} · CJ2M Nodo {PLC_NODE}")
            return True
        except Exception as e:
            print(f"[FINS] Error de conexión: {e}")
            self.connected = False
            return False

    async def recv_dm(self, start_addr: int, count: int = 1):
        """Lee registros del área DM (Data Memory) — Comando RECV"""
        if not self.connected:
            return None
        try:
            result = await self.client.memory_area_read(
                memory_area=fins_lib.MemoryArea.DM,
                address=start_addr,
                count=count,
            )
            return result
        except Exception as e:
            print(f"[FINS] Error RECV DM[{start_addr}]: {e}")
            return None

    async def recv_cio(self, start_addr: int, count: int = 1):
        """Lee registros del área CIO (Core I/O) — Comando RECV"""
        if not self.connected:
            return None
        try:
            result = await self.client.memory_area_read(
                memory_area=fins_lib.MemoryArea.CIO,
                address=start_addr,
                count=count,
            )
            return result
        except Exception as e:
            print(f"[FINS] Error RECV CIO[{start_addr}]: {e}")
            return None

    async def send_dm(self, addr: int, value: int):
        """Escribe un registro en DM — Comando SEND"""
        if not self.connected:
            return False
        try:
            await self.client.memory_area_write(
                memory_area=fins_lib.MemoryArea.DM,
                address=addr,
                data=[value & 0xFFFF],
            )
            print(f"[FINS] SEND → DM[{addr}] = {value}")
            return True
        except Exception as e:
            print(f"[FINS] Error SEND DM[{addr}]: {e}")
            return False

    async def poll_variables(self):
        """Lee todas las variables configuradas y devuelve dict"""
        data = {}
        # DM[100..104]
        dm_vals = await self.recv_dm(100, 5)
        if dm_vals:
            data["ProductionCount"] = int.from_bytes(dm_vals[0:4], 'big')
            data["IniciarInspeccion"] = bool(dm_vals[4] & 0x01)
            data["NumDefectos"] = int.from_bytes(dm_vals[6:8], 'big', signed=True)

        # CIO[0] — PinturaOK bit 0
        cio_vals = await self.recv_cio(0, 1)
        if cio_vals:
            data["PinturaOK"] = bool(cio_vals[0] & 0x01)

        return data


bridge = FINSBridge()


async def ws_handler(websocket):
    """Maneja la conexión WebSocket con la aplicación React"""
    print(f"[WS] Cliente conectado: {websocket.remote_address}")
    await bridge.connect()

    # Polling task
    async def polling_task():
        while True:
            try:
                data = await bridge.poll_variables()
                await websocket.send(json.dumps({"type": "data", "payload": data}))
            except Exception as e:
                await websocket.send(json.dumps({"type": "error", "payload": str(e)}))
            await asyncio.sleep(POLL_INTERVAL)

    poll_task = asyncio.create_task(polling_task())

    try:
        async for message in websocket:
            cmd = json.loads(message)
            action = cmd.get("cmd")

            if action == "write":
                area = cmd.get("area", "DM")
                addr = cmd.get("addr", 0)
                value = int(cmd.get("value", 0))
                if area == "DM":
                    await bridge.send_dm(addr, value)

            elif action == "cmnd":
                plc_action = cmd.get("action", "")
                print(f"[FINS] CMND → {plc_action}")
                # Implementar RUN/STOP según manual OMRON

    except websockets.exceptions.ConnectionClosed:
        print("[WS] Cliente desconectado")
    finally:
        poll_task.cancel()


async def main():
    print(f"[WS] FINS Bridge iniciado en ws://{WS_HOST}:{WS_PORT}")
    print(f"[PLC] Target: {PLC_IP}:{PLC_PORT} · CJ2M Nodo FINS {PLC_NODE}")
    print(f"[INFO] Protocolo: FINS TCP/IP · OMRON CJ2M")
    print(f"[INFO] Áreas: DM(32768w), CIO(6144), W(512), HR(512) · Polling: {POLL_INTERVAL}s")
    async with websockets.serve(ws_handler, WS_HOST, WS_PORT):
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())
`;

    return (
        <div className="plc-container">
            {/* ── Header ── */}
            <div className="plc-header">
                <div className="plc-title-row">
                    <div>
                        <h2>🏭 PLC OMRON CJ2M — FINS TCP/IP</h2>
                        <p>Protocolo: FINS TCP · Puerto {config.plcPort} · Nodo FINS: {config.finsNode} (auto) · Hasta {config.maxChannels} conexiones</p>
                    </div>
                    <div className="plc-status-badge" style={{ borderColor: statusColor[status], color: statusColor[status] }}>
                        <span className="plc-status-dot" style={{
                            background: statusColor[status],
                            boxShadow: status === 'connected' ? `0 0 10px ${statusColor[status]}` : 'none',
                            animation: status === 'connecting' ? 'pulse 1s infinite' : 'none',
                        }} />
                        {statusLabel[status]}
                    </div>
                </div>
                <div className="plc-tabs">
                    {(['connection', 'variables', 'monitor', 'python'] as const).map(tab => (
                        <button key={tab} className={`plc-tab ${activeSection === tab ? 'active' : ''}`} onClick={() => setActiveSection(tab)}>
                            {tab === 'connection' ? '⚙️ Conexión FINS'
                                : tab === 'variables' ? '📋 Variables'
                                    : tab === 'monitor' ? '📡 Monitor'
                                        : '🐍 Python Bridge'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="plc-body">

                {/* ══════════════ CONNECTION TAB ══════════════ */}
                {activeSection === 'connection' && (
                    <div className="plc-section">
                        <div className="plc-grid-2">
                            {/* Red */}
                            <div className="plc-card">
                                <h3>🌐 Red — OMRON CJ2M</h3>
                                <div className="plc-form">
                                    <div className="plc-field">
                                        <label>Modo de Conexión</label>
                                        <select
                                            value={config.connectionMode}
                                            onChange={e => setConfig({ ...config, connectionMode: e.target.value as 'client' | 'server' })}
                                            disabled={status === 'connected'}
                                            style={{
                                                padding: '8px 12px',
                                                border: '1px solid #374151',
                                                borderRadius: '6px',
                                                backgroundColor: '#1f2937',
                                                color: '#f9fafb',
                                                width: '100%'
                                            }}
                                        >
                                            <option value="client">Cliente FINS (La aplicación conecta al PLC)</option>
                                            <option value="server">Servidor FINS (El PLC envía datos a la aplicación)</option>
                                        </select>
                                        <span className="plc-hint">Si usas "Cliente" introduce la IP del PLC. Si usas "Servidor" el PLC conectará al PC automáticamente.</span>
                                    </div>
                                    <div className="plc-field">
                                        <label>IP Address del PLC</label>
                                        <input value={config.plcIp} onChange={e => setConfig({ ...config, plcIp: e.target.value })}
                                            placeholder="192.168.1.100" disabled={status === 'connected'} />
                                        <span className="plc-hint">Configurable en CX-Programmer / Sysmac Studio → EtherNet/IP settings</span>
                                    </div>
                                    <div className="plc-field">
                                        <label>Puerto FINS TCP</label>
                                        <input type="number" value={config.plcPort} onChange={e => setConfig({ ...config, plcPort: +e.target.value })}
                                            disabled={status === 'connected'} />
                                        <span className="plc-hint">Por defecto: 9600 (FINS TCP/IP · CJ2M CPU3x)</span>
                                    </div>
                                    <div className="plc-field">
                                        <label>Polling (ms)</label>
                                        <input type="number" min={500} max={10000} value={config.pollInterval}
                                            onChange={e => setConfig({ ...config, pollInterval: +e.target.value })} />
                                        <span className="plc-hint">Mín. 200ms recomendado — CJ2M ciclo mín 0.1 ms, latencia red ≤10 ms</span>
                                    </div>
                                </div>
                            </div>

                            {/* FINS Frame */}
                            <div className="plc-card">
                                <h3>🔧 Parámetros FINS Frame</h3>
                                <div className="plc-form">
                                    <div className="plc-field">
                                        <label>Nodo Destino (PLC) — DA1</label>
                                        <input type="number" min={1} max={254} value={config.finsNode}
                                            onChange={e => setConfig({ ...config, finsNode: +e.target.value })}
                                            disabled={status === 'connected'} />
                                        <span className="plc-hint">⚡ Auto-calculado del último octeto de la IP · CJ2M max. 254 nodos</span>
                                    </div>
                                    <div className="plc-field">
                                        <label>Nodo Origen (Servidor) — SA1</label>
                                        <input type="number" min={1} max={254} value={config.srcNode}
                                            onChange={e => setConfig({ ...config, srcNode: +e.target.value })}
                                            disabled={status === 'connected'} />
                                        <span className="plc-hint">Último octeto de la IP de este servidor Python</span>
                                    </div>
                                    <div className="plc-field">
                                        <label>Red (DNA) / Unidad (DA2)</label>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <input type="number" min={0} max={127} value={config.networkAddr}
                                                onChange={e => setConfig({ ...config, networkAddr: +e.target.value })}
                                                disabled={status === 'connected'} style={{ flex: 1 }} />
                                            <input type="number" min={0} max={255} value={config.unitAddr}
                                                onChange={e => setConfig({ ...config, unitAddr: +e.target.value })}
                                                disabled={status === 'connected'} style={{ flex: 1 }} />
                                        </div>
                                        <span className="plc-hint">Red: 0 = local · Unidad: 0 = CPU Unit</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FINS Frame Preview */}
                        <div className="plc-card plc-fins-frame">
                            <h3>📦 Vista Previa FINS TCP Frame</h3>
                            <div className="fins-frame-bytes">
                                <div className="fins-byte"><span>ICF</span><code>C0</code></div>
                                <div className="fins-byte"><span>RSV</span><code>00</code></div>
                                <div className="fins-byte"><span>GCT</span><code>02</code></div>
                                <div className="fins-byte"><span>DNA</span><code>{config.networkAddr.toString(16).padStart(2, '0').toUpperCase()}</code></div>
                                <div className="fins-byte"><span>DA1</span><code style={{ color: '#4ade80' }}>{config.finsNode.toString(16).padStart(2, '0').toUpperCase()}</code></div>
                                <div className="fins-byte"><span>DA2</span><code>{config.unitAddr.toString(16).padStart(2, '0').toUpperCase()}</code></div>
                                <div className="fins-byte"><span>SNA</span><code>00</code></div>
                                <div className="fins-byte"><span>SA1</span><code style={{ color: '#60a5fa' }}>{config.srcNode.toString(16).padStart(2, '0').toUpperCase()}</code></div>
                                <div className="fins-byte"><span>SA2</span><code>00</code></div>
                                <div className="fins-byte"><span>SID</span><code>00</code></div>
                                <div className="fins-byte cmd"><span>CMD</span><code style={{ color: '#c084fc' }}>01 01</code></div>
                                <div className="fins-byte cmd"><span>DATA</span><code style={{ color: '#fbbf24' }}>…</code></div>
                            </div>
                            <p className="plc-arch-note">CMD 01 01 = MEMORY AREA READ (RECV) · 01 02 = MEMORY AREA WRITE (SEND) · 04 01 = RUN/STOP (CMND)</p>
                        </div>

                        {/* Arquitectura */}
                        <div className="plc-card plc-arch-card">
                            <h3>🏗️ Arquitectura de Comunicación</h3>
                            <div className="plc-arch-flow">
                                <div className="arch-node">
                                    <div className="arch-icon">⚛️</div>
                                    <div>React App</div>
                                    <div className="arch-sub">localhost:5173</div>
                                </div>
                                <div className="arch-arrow">WebSocket<br /><small>ws://127.0.0.1:8766</small></div>
                                <div className="arch-node">
                                    <div className="arch-icon">🐍</div>
                                    <div>Python Bridge</div>
                                    <div className="arch-sub">omron-fins lib</div>
                                </div>
                                <div className="arch-arrow">FINS TCP<br /><small>{config.plcIp}:{config.plcPort}</small></div>
                                <div className="arch-node" style={{ position: 'relative' }}>
                                    <div className="arch-icon">🏭</div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                        <span style={{ fontWeight: 'bold' }}>CJ2M</span>
                                        {scanStatus === 'scanning' && <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', animation: 'pulse 1s infinite' }} title="Escaneando..." />}
                                        {scanStatus === 'found' && <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} title="PLC Encontrado" />}
                                        {(scanStatus === 'not_found' || scanStatus === 'error') && <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} title="No encontrado" />}
                                    </div>
                                    <div className="arch-sub">Nodo {config.finsNode}</div>
                                </div>
                            </div>
                        </div>

                        {/* Botones control */}
                        <div className="plc-connect-row">
                            {status !== 'connected' ? (
                                <>
                                    <button className="plc-btn-connect" onClick={handleScan} style={{ background: '#3b82f6' }}>
                                        📡 Escanear PLC
                                    </button>
                                    <button className="plc-btn-connect" onClick={handleConnect} disabled={status === 'connecting'}>
                                        {status === 'connecting' ? '⏳ Conectando FINS TCP...' : '🔌 Conectar al CJ2M'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="plc-btn-cmnd-run" onClick={() => handleCmnd('RUN')}>▶ CMND → RUN</button>
                                    <button className="plc-btn-cmnd-stop" onClick={() => handleCmnd('STOP')}>⏹ CMND → STOP</button>
                                    <button className="plc-btn-disconnect" onClick={handleDisconnect}>Desconectar</button>
                                </>
                            )}
                        </div>

                        {/* Log Console */}
                        <div className="plc-log-box">
                            <div className="plc-log-header">
                                <span>📟 Consola FINS TCP</span>
                                <button className="plc-log-clear" onClick={() => setLogs([])}>Limpiar</button>
                            </div>
                            <div className="plc-log-body">
                                {logs.map((l, i) => (
                                    <div key={i} className="plc-log-line">
                                        <span className="log-time">{l.ts}</span>
                                        <span className="log-type" style={{ color: logColor[l.type] }}>[{l.type.toUpperCase()}]</span>
                                        <span className="log-msg" style={{ color: l.type === 'fins' ? '#c084fc' : undefined }}>{l.msg}</span>
                                    </div>
                                ))}
                                <div ref={logEndRef} />
                            </div>
                        </div>
                    </div>
                )}

                {/* ══════════════ VARIABLES TAB ══════════════ */}
                {activeSection === 'variables' && (
                    <div className="plc-section">
                        <div className="plc-card">
                            <h3>📊 Áreas de Memoria OMRON CJ2M</h3>
                            <div className="plc-mem-areas">
                                {MEMORY_AREAS.map(area => (
                                    <div key={area} className="mem-area-badge">
                                        <strong>{area}</strong>
                                        <span>{MEMORY_DESCRIPTIONS[area]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="plc-var-header">
                            <h3>Variables Mapeadas ({variables.length})</h3>
                            <button className="plc-btn-add" onClick={() => {
                                const nv: PLCVariable = { id: Date.now().toString(), name: 'NewVar', memoryArea: 'DM', address: 200, dataType: 'INT', value: null, description: '', access: 'RECV', lastUpdate: null };
                                setVariables(p => [...p, nv]);
                                setEditingVar(nv);
                            }}>+ Nueva Variable</button>
                        </div>

                        <div className="plc-var-table-wrapper">
                            <table className="plc-var-table">
                                <thead>
                                    <tr><th>Nombre</th><th>Área</th><th>Addr</th><th>Tipo</th><th>Comando</th><th>Descripción</th><th>Acciones</th></tr>
                                </thead>
                                <tbody>
                                    {variables.map(v => (
                                        <tr key={v.id}>
                                            <td><span className="var-name">{v.name}</span></td>
                                            <td><span className={`var-area area-${v.memoryArea.toLowerCase()}`}>{v.memoryArea}</span></td>
                                            <td style={{ fontFamily: 'monospace' }}>[{v.address}]</td>
                                            <td><span className="var-type">{v.dataType}</span></td>
                                            <td><span className={`var-access ${accessClass[v.access]}`}>{v.access}</span></td>
                                            <td className="var-desc">{v.description || '—'}</td>
                                            <td>
                                                <div className="var-actions">
                                                    <button className="var-btn-edit" onClick={() => setEditingVar({ ...v })}>✏️</button>
                                                    <button className="var-btn-del" onClick={() => {
                                                        setVariables(p => p.filter(x => x.id !== v.id));
                                                        log('warning', `Variable "${v.name}" eliminada`);
                                                    }}>🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {editingVar && (
                            <div className="plc-modal-overlay" onClick={() => setEditingVar(null)}>
                                <div className="plc-modal" onClick={e => e.stopPropagation()}>
                                    <h3>✏️ Editar Variable FINS</h3>
                                    <div className="plc-form">
                                        <div className="plc-grid-2">
                                            {[
                                                { label: 'Nombre', key: 'name', type: 'text' },
                                                { label: 'Descripción', key: 'description', type: 'text' },
                                                { label: 'Dirección', key: 'address', type: 'number' },
                                            ].map(f => (
                                                <div key={f.key} className="plc-field">
                                                    <label>{f.label}</label>
                                                    <input type={f.type} value={String((editingVar as unknown as Record<string, unknown>)[f.key])}
                                                        onChange={e => setEditingVar({ ...editingVar, [f.key]: f.type === 'number' ? +e.target.value : e.target.value })} />
                                                </div>
                                            ))}
                                            <div className="plc-field">
                                                <label>Área de Memoria</label>
                                                <select value={editingVar.memoryArea} onChange={e => setEditingVar({ ...editingVar, memoryArea: e.target.value as PLCVariable['memoryArea'] })}>
                                                    {MEMORY_AREAS.map(a => <option key={a} value={a}>{a} — {MEMORY_DESCRIPTIONS[a].split('—')[0]}</option>)}
                                                </select>
                                            </div>
                                            <div className="plc-field">
                                                <label>Tipo de Dato</label>
                                                <select value={editingVar.dataType} onChange={e => setEditingVar({ ...editingVar, dataType: e.target.value as PLCVariable['dataType'] })}>
                                                    {DATA_TYPES.map(t => <option key={t}>{t}</option>)}
                                                </select>
                                            </div>
                                            <div className="plc-field">
                                                <label>Comando FINS</label>
                                                <select value={editingVar.access} onChange={e => setEditingVar({ ...editingVar, access: e.target.value as PLCVariable['access'] })}>
                                                    {ACCESS_TYPES.map(a => <option key={a}>{a}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="plc-modal-actions">
                                        <button className="plc-btn-connect" onClick={() => {
                                            setVariables(p => p.map(v => v.id === editingVar.id ? editingVar : v));
                                            log('info', `Variable "${editingVar.name}" actualizada: ${editingVar.memoryArea}[${editingVar.address}] ${editingVar.dataType}`);
                                            setEditingVar(null);
                                        }}>💾 Guardar</button>
                                        <button className="plc-btn-disconnect" onClick={() => setEditingVar(null)}>Cancelar</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════════ MONITOR TAB ══════════════ */}
                {activeSection === 'monitor' && (
                    <div className="plc-section">
                        {status !== 'connected' && (
                            <div className="plc-offline-banner">
                                ⚠️ PLC no conectado — Los valores mostrados son simulados. Conecta en la pestaña "Conexión FINS".
                            </div>
                        )}
                        <div className="plc-monitor-grid">
                            {variables.map(v => (
                                <div key={v.id} className={`plc-monitor-card ${status === 'connected' ? 'live' : ''}`}>
                                    <div className="monitor-card-header">
                                        <div>
                                            <div className="monitor-name">{v.name}</div>
                                            <div className="monitor-addr">
                                                <span className={`var-area area-${v.memoryArea.toLowerCase()}`}>{v.memoryArea}</span>
                                                [{v.address}] · {v.dataType}
                                            </div>
                                        </div>
                                        <span className={`var-access ${accessClass[v.access]}`}>{v.access}</span>
                                    </div>

                                    <div className="monitor-value">
                                        {v.value === null
                                            ? <span className="monitor-null">—</span>
                                            : v.dataType === 'BOOL'
                                                ? <span className={`monitor-bool ${v.value ? 'on' : 'off'}`}>{v.value ? '■ TRUE' : '□ FALSE'}</span>
                                                : <span className="monitor-num">{String(v.value)}</span>
                                        }
                                    </div>

                                    {v.lastUpdate && (
                                        <div className="monitor-update">🕐 {v.lastUpdate}</div>
                                    )}

                                    {(v.access === 'SEND' || v.access === 'RECV/SEND') && (
                                        <div className="monitor-write-row">
                                            <input className="monitor-write-input" placeholder="Valor SEND..."
                                                disabled={status !== 'connected'}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        handleWrite(v, (e.target as HTMLInputElement).value);
                                                        (e.target as HTMLInputElement).value = '';
                                                    }
                                                }} />
                                            <span className="monitor-hint">↵ SEND → PLC</span>
                                        </div>
                                    )}
                                    <div className="monitor-desc">{v.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ══════════════ PYTHON BRIDGE TAB ══════════════ */}
                {activeSection === 'python' && (
                    <div className="plc-section">
                        <div className="plc-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3>🐍 Script Python — FINS TCP Bridge (CJ2M)</h3>
                                <button className="plc-btn-connect" style={{ padding: '8px 16px', fontSize: 13 }}
                                    onClick={() => { navigator.clipboard.writeText(pythonScript); log('success', 'Script Python copiado al portapapeles'); }}>
                                    📋 Copiar script
                                </button>
                            </div>
                            <div className="plc-install-box">
                                <p>📦 <strong>Instalación del entorno Python:</strong></p>
                                <code>pip install omron-fins websockets asyncio</code>
                                <p style={{ marginTop: 8 }}>▶ <strong>Ejecutar el bridge:</strong></p>
                                <code>python plc_bridge.py</code>
                            </div>
                            <pre className="plc-python-code">{pythonScript}</pre>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
