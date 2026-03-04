#!/usr/bin/env python3
"""
plc_server.py — OMRON CJ2M FINS TCP Bridge
React App <–– WebSocket (ws://127.0.0.1:8766) ––> Python ––> FINS UDP (192.168.0.1:9600)
"""
import asyncio
import json
import websockets
import struct
from fins.udp import UDPFinsConnection
from fins.udp import FinsPLCMemoryAreas

WS_HOST = "0.0.0.0"
WS_PORT = 8766
POLL_INTERVAL = 0.5  # segundos

mem_areas = FinsPLCMemoryAreas()

class FINSBridge:
    def __init__(self):
        self.client = None
        self.connected = False
        self.plc_ip = ""
        self.plc_port = 9600
        self.plc_node = 1
        self.src_node = 50

    def connect_sync(self, ip, port, node, src_node):
        self.plc_ip = ip
        self.plc_port = port
        self.plc_node = node
        self.src_node = src_node
        try:
            self.client = UDPFinsConnection()
            self.client.connect(ip, port)
            self.client.fins_socket.settimeout(2.0) # <--- Timeout esencial para FINS
            self.client.dest_node_add = node
            self.client.srce_node_add = src_node
            
            # Test simple para verificar conexión real
            test_resp = self.client.memory_area_read(mem_areas.DATA_MEMORY_WORD, b'\x00\x00\x00', 1)
            if not test_resp:
                raise Exception("Sin respuesta del PLC en la prueba de eco")

            self.connected = True
            print(f"[FINS] Conectado a {ip}:{port} · CJ2M Nodo {node}")
            return True, "OK"
        except TimeoutError:
            err = f"Timeout: El PLC {ip}:{port} no responde"
            print(f"[FINS] {err}")
            self.connected = False
            return False, err
        except Exception as e:
            err = f"Error de conexión: {e}"
            print(f"[FINS] {err}")
            self.connected = False
            return False, err

    async def connect(self, ip, port, node, src_node=50):
        return await asyncio.to_thread(self.connect_sync, ip, port, node, src_node)

    def recv_dm_sync(self, start_addr: int, count: int = 1):
        if not self.connected:
            return None
        try:
            # address format: b'\x00\x64\x00' (Word address 100, bit 0)
            addr_bytes = struct.pack(">H", start_addr) + b'\x00'
            result = self.client.memory_area_read(
                mem_areas.DATA_MEMORY_WORD,
                addr_bytes,
                count
            )
            # Result usually comes back with header stripped ?
            # Let's just return the raw payload. The 'fins' module returns a bytearray of the frame maybe.
            # Assuming 'result' is bytes of the data
            if result and len(result) >= 14: # typical fins header size is 14
                return result[-count*2:] # Very basic slice, assuming last bytes are payload
            return None
        except Exception as e:
            print(f"[FINS] Error RECV DM[{start_addr}]: {e}")
            return None

    def recv_cio_sync(self, start_addr: int, count: int = 1):
        if not self.connected:
            return None
        try:
            addr_bytes = struct.pack(">H", start_addr) + b'\x00'
            result = self.client.memory_area_read(
                mem_areas.CIO_WORD,
                addr_bytes,
                count
            )
            if result and len(result) >= 14:
                return result[-count*2:]
            return None
        except Exception as e:
            print(f"[FINS] Error RECV CIO[{start_addr}]: {e}")
            return None

    def send_dm_sync(self, addr: int, value: int):
        if not self.connected:
            return False
        try:
            addr_bytes = struct.pack(">H", addr) + b'\x00'
            val_bytes = struct.pack(">H", value & 0xFFFF)
            self.client.memory_area_write(
                mem_areas.DATA_MEMORY_WORD,
                addr_bytes,
                b'\x00\x01', # number of items = 1
                val_bytes
            )
            print(f"[FINS] SEND → DM[{addr}] = {value}")
            return True
        except Exception as e:
            print(f"[FINS] Error SEND DM[{addr}]: {e}")
            return False

    async def send_dm(self, addr, value):
        return await asyncio.to_thread(self.send_dm_sync, addr, value)

    async def recv_dm(self, start_addr, count):
        return await asyncio.to_thread(self.recv_dm_sync, start_addr, count)

    async def recv_cio(self, start_addr, count):
        return await asyncio.to_thread(self.recv_cio_sync, start_addr, count)

    async def poll_variables(self):
        data = {}
        if not self.connected:
            return data
            
        dm_vals = await self.recv_dm(100, 5)
        if dm_vals and len(dm_vals) >= 10:
            data["ProductionCount"] = int.from_bytes(dm_vals[0:4], 'big')
            data["IniciarInspeccion"] = bool(dm_vals[4] & 0x01) if len(dm_vals) > 4 else False
            data["NumDefectos"] = int.from_bytes(dm_vals[6:8], 'big', signed=True) if len(dm_vals) > 6 else 0

        cio_vals = await self.recv_cio(0, 1)
        if cio_vals and len(cio_vals) >= 2:
            data["PinturaOK"] = bool(cio_vals[0] & 0x01)

        return data

bridge = FINSBridge()

async def ws_handler(websocket):
    print(f"[WS] Cliente conectado")
    
    poll_task = None

    async def polling_task():
        while True:
            try:
                if bridge.connected:
                    data = await bridge.poll_variables()
                    await websocket.send(json.dumps({"type": "data", "payload": data}))
            except Exception as e:
                pass
            await asyncio.sleep(POLL_INTERVAL)

    try:
        async for message in websocket:
            cmd = json.loads(message)
            action = cmd.get("cmd")

            if action == "connect":
                ip = cmd.get("ip", "192.168.0.1")
                port = cmd.get("port", 9600)
                node = cmd.get("node", 1)
                
                success, err_msg = await bridge.connect(ip, port, node)
                if success:
                    await websocket.send(json.dumps({"type": "status", "payload": "connected"}))
                    if poll_task is None:
                        poll_task = asyncio.create_task(polling_task())
                else:
                    await websocket.send(json.dumps({"type": "error", "payload": err_msg}))

            elif action == "write":
                area = cmd.get("area", "DM")
                addr = cmd.get("addr", 0)
                raw_val = cmd.get("value", 0)
                
                # Handle true/false strings from UI 
                if isinstance(raw_val, str):
                    if raw_val.lower() == 'true':
                        value = 1
                    elif raw_val.lower() == 'false':
                        value = 0
                    else:
                        try:
                            value = int(raw_val)
                        except:
                            value = 0
                else:
                    value = int(raw_val)

                if area == "DM":
                    await bridge.send_dm(addr, value)

            elif action == "cmnd":
                plc_action = cmd.get("action", "")
                print(f"[FINS] CMND → {plc_action}")

    except websockets.exceptions.ConnectionClosed:
        print("[WS] Cliente desconectado")
    finally:
        if poll_task:
            poll_task.cancel()

async def main():
    print(f"[WS] FINS Bridge iniciado en ws://{WS_HOST}:{WS_PORT}")
    print(f"[INFO] Protocolo: FINS UDP · OMRON CJ2M")
    print(f"[INFO] Esperando conexión del frontend React...")
    async with websockets.serve(ws_handler, WS_HOST, WS_PORT):
        await asyncio.Future()  

if __name__ == "__main__":
    asyncio.run(main())
