"""
camera_server.py — Servidor HTTP para cámara Basler acA1920-48gm
================================================================
Arranca un servidor HTTP en http://localhost:8765 que:
  GET  /api/status          → estado actual de la cámara
  GET  /api/devices         → enumerar dispositivos GigE Vision
  POST /api/connect         → conectar con parámetros JSON
  POST /api/disconnect      → detener grabación y cerrar
  GET  /api/stream          → MJPEG stream (imagen real o simulada)
  GET  /api/snapshot        → JPEG único (para debug)

Dependencias:
  pip install pypylon opencv-python
  pip install flask flask-cors

Si pypylon NO está instalado, entra en modo SIMULADO automáticamente.
"""

import json
import time
import threading
import io
import struct
import traceback
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

# ── Intentar importar pypylon ────────────────────────────────────────────────
try:
    from pypylon import pylon
    import numpy as np
    import cv2
    PYLON_AVAILABLE = True
    print("[INFO] pypylon detectado — modo REAL activado")
except ImportError:
    PYLON_AVAILABLE = False
    import numpy as np
    print("[WARN] pypylon NO instalado — modo SIMULADO activado")
    print("[WARN] Instala con:  pip install pypylon opencv-python")

# ── Estado global de la cámara ───────────────────────────────────────────────
camera_state = {
    "status": "disconnected",   # disconnected | connected | error
    "model": "",
    "serial": "",
    "ip": "",
    "firmware": "",
    "error": "",
    "fps": 0.0,
    "frame_count": 0,
}

camera_lock = threading.Lock()
current_camera = None          # pypylon InstantCamera instance
current_frame = None           # numpy array BGR
last_frame_time = time.time()
frame_lock = threading.Lock()


# ════════════════════════════════════════════════════════════════════════════
#  Funciones de cámara (pypylon real)
# ════════════════════════════════════════════════════════════════════════════

def enumerate_devices():
    """Retorna lista de dispositivos Basler disponibles."""
    if not PYLON_AVAILABLE:
        # Sin pypylon no podemos detectar hardware real → lista vacía
        print("[INFO] pypylon no disponible — no se puede enumerar hardware real")
        return []
    try:
        tl_factory = pylon.TlFactory.GetInstance()
        devices_info = tl_factory.EnumerateDevices()
        result = []
        for i, dev in enumerate(devices_info):
            try:
                result.append({
                    "index": i,
                    "modelName": dev.GetModelName(),
                    "serialNumber": dev.GetSerialNumber(),
                    "deviceType": dev.GetDeviceClass(),
                    "ipAddress": dev.GetIpAddress() if hasattr(dev, 'GetIpAddress') else "",
                    "subnetMask": dev.GetSubnetMask() if hasattr(dev, 'GetSubnetMask') else "",
                    "macAddress": dev.GetMacAddress() if hasattr(dev, 'GetMacAddress') else "",
                    "firmwareVersion": dev.GetDeviceVersion() if hasattr(dev, 'GetDeviceVersion') else "",
                    "status": "available",
                    "simulated": False,
                })
            except Exception as e:
                print(f"[WARN] Error leyendo info de dispositivo {i}: {e}")
        return result
    except Exception as e:
        print(f"[ERROR] enumerate_devices: {e}")
        return []



def connect_camera(params: dict) -> dict:
    """Conecta la cámara con los parámetros dados. Retorna {ok, error}."""
    global current_camera, camera_state

    with camera_lock:
        # Desconectar si ya había una cámara
        _disconnect_camera_internal()

        if not PYLON_AVAILABLE:
            # Modo simulado — empieza el hilo de simulación
            camera_state.update({
                "status": "connected",
                "model": "acA1920-48gm (SIMULADO)",
                "serial": "40002788",
                "ip": "192.168.0.201",
                "firmware": "V1.1-0",
                "error": "",
            })
            threading.Thread(target=_simulate_frames, args=(params,), daemon=True).start()
            return {"ok": True, "simulated": True}

        try:
            tl_factory = pylon.TlFactory.GetInstance()
            mode = params.get("connectionMode", "auto")

            if mode == "serial" and params.get("serialNumber"):
                di = pylon.DeviceInfo()
                di.SetSerialNumber(params["serialNumber"])
                device = tl_factory.CreateFirstDevice(di)
            elif mode == "ip" and params.get("ipAddress"):
                di = pylon.DeviceInfo()
                di.SetIpAddress(params["ipAddress"])
                device = tl_factory.CreateFirstDevice(di)
            else:
                device = tl_factory.CreateFirstDevice()

            cam = pylon.InstantCamera(device)
            cam.Open()

            # Aplicar parámetros de imagen
            try:
                cam.PixelFormat.Value = params.get("pixelFormat", "Mono8")
                cam.Width.Value       = int(params.get("width", 1920))
                cam.Height.Value      = int(params.get("height", 1200))
                cam.OffsetX.Value     = int(params.get("offsetX", 0))
                cam.OffsetY.Value     = int(params.get("offsetY", 0))
            except Exception as e:
                print(f"[WARN] Parámetros de imagen: {e}")

            # Exposición
            try:
                cam.ExposureAuto.Value = params.get("exposureAuto", "Off")
                if params.get("exposureAuto", "Off") == "Off":
                    cam.ExposureTimeAbs.Value = float(params.get("exposureTimeAbs", 10000))
            except Exception as e:
                print(f"[WARN] Exposición: {e}")

            # Ganancia
            try:
                cam.GainAuto.Value = params.get("gainAuto", "Off")
                if params.get("gainAuto", "Off") == "Off":
                    cam.GainRaw.Value = int(params.get("gainRaw", 0))
            except Exception as e:
                print(f"[WARN] Ganancia: {e}")

            # Frame rate
            try:
                cam.AcquisitionFrameRateEnable.Value = bool(params.get("acquisitionFrameRateEnable", True))
                if params.get("acquisitionFrameRateEnable", True):
                    cam.AcquisitionFrameRateAbs.Value = float(params.get("acquisitionFrameRateAbs", 10.0))
            except Exception as e:
                print(f"[WARN] FrameRate: {e}")

            # Trigger
            try:
                cam.TriggerMode.Value = params.get("triggerMode", "Off")
            except Exception as e:
                print(f"[WARN] Trigger: {e}")

            # Iniciar grabación
            cam.StartGrabbing(pylon.GrabStrategy_LatestImageOnly)

            dev_info = cam.GetDeviceInfo()
            camera_state.update({
                "status": "connected",
                "model": dev_info.GetModelName(),
                "serial": dev_info.GetSerialNumber(),
                "ip": params.get("ipAddress", ""),
                "firmware": dev_info.GetDeviceVersion() if hasattr(dev_info, 'GetDeviceVersion') else "",
                "error": "",
            })
            current_camera = cam

            # Hilo de captura de frames
            threading.Thread(target=_grab_frames, args=(cam,), daemon=True).start()
            return {"ok": True, "simulated": False}

        except Exception as e:
            err_msg = str(e)
            print(f"[ERROR] connect_camera: {err_msg}")
            camera_state.update({"status": "error", "error": err_msg})
            return {"ok": False, "error": err_msg}


def _disconnect_camera_internal():
    """Interna — desconecta sin lock."""
    global current_camera, current_frame
    if current_camera is not None:
        try:
            if current_camera.IsGrabbing():
                current_camera.StopGrabbing()
            current_camera.Close()
        except Exception as e:
            print(f"[WARN] Al desconectar: {e}")
        current_camera = None
    with frame_lock:
        current_frame = None
    camera_state.update({"status": "disconnected", "model": "", "serial": "",
                          "ip": "", "firmware": "", "error": "", "fps": 0.0})


def disconnect_camera():
    with camera_lock:
        _disconnect_camera_internal()


def _grab_frames(cam):
    """Hilo de captura de frames reales desde pypylon."""
    global current_frame, last_frame_time
    converter = pylon.ImageFormatConverter()
    converter.OutputPixelFormat = pylon.PixelType_BGR8packed
    converter.OutputBitAlignment = pylon.OutputBitAlignment_MsbAligned

    fps_counter = 0
    fps_timer = time.time()

    print("[INFO] Grabbing thread started")
    while cam.IsGrabbing() and camera_state["status"] == "connected":
        try:
            grab_result = cam.RetrieveResult(5000, pylon.TimeoutHandling_ThrowException)
            if grab_result.GrabSucceeded():
                img = converter.Convert(grab_result)
                arr = img.GetArray()   # numpy BGR
                with frame_lock:
                    current_frame = arr.copy()
                    camera_state["frame_count"] += 1
                fps_counter += 1
                now = time.time()
                if now - fps_timer >= 1.0:
                    camera_state["fps"] = round(fps_counter / (now - fps_timer), 1)
                    fps_counter = 0
                    fps_timer = now
            grab_result.Release()
        except Exception as e:
            if camera_state["status"] == "connected":
                print(f"[WARN] grab: {e}")
            break
    print("[INFO] Grabbing thread stopped")


def _simulate_frames(params):
    """Hilo de simulación de frames cuando pypylon no está disponible."""
    global current_frame
    import math
    W = min(int(params.get("width", 640)), 640)
    H = min(int(params.get("height", 400)), 400)
    t = 0
    fps_target = float(params.get("acquisitionFrameRateAbs", 10.0))
    delay = 1.0 / max(fps_target, 1.0)
    exposure = float(params.get("exposureTimeAbs", 10000))
    gain = int(params.get("gainRaw", 0))

    fps_counter = 0
    fps_timer = time.time()

    while camera_state["status"] == "connected":
        frame = np.zeros((H, W, 3), dtype=np.uint8)
        # Patrón radial monocromo
        cy, cx = H // 2, W // 2
        for y in range(0, H, 2):
            for x in range(0, W, 2):
                dist = math.hypot(x - cx, y - cy)
                radial = max(0, 1 - dist / (min(W, H) * 0.44))
                wave = math.sin((x + t) * 0.022) * 20 + math.cos((y + t * 0.7) * 0.022) * 14
                noise = (np.random.random() - 0.5) * 12
                exp_f = min(1.0, exposure / 50000.0)
                v = int(20 + exp_f * 160 * radial + wave + noise + gain * 0.3)
                v = max(0, min(255, v))
                frame[y, x] = [v, v, v]
                if y+1 < H: frame[y+1, x] = [v, v, v]
                if x+1 < W: frame[y, x+1] = [v, v, v]
                if y+1 < H and x+1 < W: frame[y+1, x+1] = [v, v, v]

        # Overlay de texto
        cv2.putText(frame, f"SIMULADO - SN:40002788", (10, 22),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 100), 1)
        cv2.putText(frame, f"IP:192.168.0.201  {W}x{H}", (10, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, (180, 180, 180), 1)
        cv2.putText(frame, f"Exp:{int(exposure)}us Gain:{gain}", (10, 56),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, (180, 180, 180), 1)
        # Crosshair
        cv2.line(frame, (cx, 0), (cx, H), (0, 200, 80), 1)
        cv2.line(frame, (0, cy), (W, cy), (0, 200, 80), 1)

        with frame_lock:
            current_frame = frame
            camera_state["frame_count"] += 1
        t += 0.35
        fps_counter += 1
        now = time.time()
        if now - fps_timer >= 1.0:
            camera_state["fps"] = round(fps_counter / (now - fps_timer), 1)
            fps_counter = 0
            fps_timer = now
        time.sleep(delay)


# ════════════════════════════════════════════════════════════════════════════
#  Generador MJPEG
# ════════════════════════════════════════════════════════════════════════════

def get_jpeg_frame(quality=80):
    """Retorna el frame actual como JPEG bytes."""
    with frame_lock:
        frame = current_frame
    if frame is None:
        # Frame negro con texto
        frame = np.zeros((400, 640, 3), dtype=np.uint8)
        cv2.putText(frame, "Sin señal — conecta la cámara", (80, 200),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (60, 60, 60), 2)
    try:
        import cv2
        ret, buf = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, quality])
        if ret:
            return bytes(buf)
    except Exception:
        pass
    return b''


# ════════════════════════════════════════════════════════════════════════════
#  HTTP Handler
# ════════════════════════════════════════════════════════════════════════════

class CameraHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Solo imprime errores
        if args and str(args[1]) not in ('200', '204'):
            super().log_message(format, *args)

    def send_cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # ── /api/status
        if path == "/api/status":
            self._json_response(camera_state)

        # ── /api/devices
        elif path == "/api/devices":
            devs = enumerate_devices()
            self._json_response({"devices": devs, "pylon": PYLON_AVAILABLE})

        # ── /api/stream — MJPEG
        elif path == "/api/stream":
            self.send_response(200)
            self.send_header("Content-Type", "multipart/x-mixed-replace; boundary=frame")
            self.send_cors()
            self.end_headers()
            try:
                while True:
                    jpg = get_jpeg_frame(quality=75)
                    if jpg:
                        header = (
                            b"--frame\r\n"
                            b"Content-Type: image/jpeg\r\n"
                            b"Content-Length: " + str(len(jpg)).encode() + b"\r\n\r\n"
                        )
                        self.wfile.write(header + jpg + b"\r\n")
                        self.wfile.flush()
                    time.sleep(1.0 / 25)  # max 25fps stream al browser
            except (BrokenPipeError, ConnectionResetError):
                pass  # cliente desconectado

        # ── /api/snapshot
        elif path == "/api/snapshot":
            jpg = get_jpeg_frame(quality=90)
            self.send_response(200)
            self.send_header("Content-Type", "image/jpeg")
            self.send_header("Content-Length", str(len(jpg)))
            self.send_cors()
            self.end_headers()
            self.wfile.write(jpg)

        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length > 0 else b"{}"
        try:
            params = json.loads(body)
        except Exception:
            params = {}

        # ── /api/connect
        if path == "/api/connect":
            result = connect_camera(params)
            self._json_response(result)

        # ── /api/disconnect
        elif path == "/api/disconnect":
            disconnect_camera()
            self._json_response({"ok": True})

        else:
            self.send_response(404)
            self.end_headers()

    def _json_response(self, data: dict):
        body = json.dumps(data).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_cors()
        self.end_headers()
        self.wfile.write(body)


# ════════════════════════════════════════════════════════════════════════════
#  Punto de entrada
# ════════════════════════════════════════════════════════════════════════════

PORT = 8765

if __name__ == "__main__":
    # Forzar UTF-8 en stdout para evitar errores en consola Windows cp1252
    import sys, io
    if sys.platform == 'win32':
        try:
            sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
            sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
        except Exception:
            pass

    print("=" * 55)
    print("  Basler Camera Server -- acA1920-48gm")
    print(f"  http://localhost:{PORT}")
    print(f"  pypylon: {'DISPONIBLE [OK]' if PYLON_AVAILABLE else 'NO instalado (modo simulado)'}")
    print("=" * 55)

    if not PYLON_AVAILABLE:
        try:
            import cv2
        except ImportError:
            print("\n[ERROR] opencv-python no instalado.")
            print("  Instala con:  pip install opencv-python\n")

    server = HTTPServer(("0.0.0.0", PORT), CameraHandler)
    print(f"\n[INFO] Servidor escuchando en puerto {PORT}...")
    
    # Auto-conectar en el arranque
    print("[INFO] Intentando auto-conectar cámara...")
    connect_camera({
        "connectionMode": "auto",
        "ipAddress": "192.168.0.201",
        "pixelFormat": "Mono8",
        "width": 1920,
        "height": 1200,
        "exposureAuto": "Off",
        "exposureTimeAbs": 10000,
        "gainAuto": "Off",
        "gainRaw": 136,
    })

    print("[INFO] Presiona Ctrl+C para detener.\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[INFO] Servidor detenido.")
        disconnect_camera()
        server.server_close()

