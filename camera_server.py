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
  GET  /api/calibration/capture       → captura frame y detecta esquinas del tablero
  GET  /api/calibration/preview       → sirve una imagen original o corregida como JPEG
  POST /api/calibration/compute       → calibra, guarda corrected/ y pattern/ subcarpetas
  GET  /api/calibration/status        → estado de calibración cargada
  POST /api/calibration/apply         → guarda la calibración para aplicarla siempre
  POST /api/calibration/clear         → elimina la calibración guardada

Dependencias:
  pip install pypylon opencv-python
  pip install flask flask-cors

Si pypylon NO está instalado, entra en modo SIMULADO automáticamente.
"""

import os
import glob
import json
import time
import threading
import io
import struct
import traceback
import base64
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

# ── Intentar importar pypylon ────────────────────────────────────────────────
try:
    from pypylon import pylon
    import numpy as np
    import cv2
    PYLON_AVAILABLE = True
    print("[INFO] pypylon detectado — modo REAL activado")
except ImportError:
    import cv2
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
#  Estado de calibración permanente
# ════════════════════════════════════════════════════════════════════════════
CALIBRATION_FILE = "camera_calibration.json"
calibration_data = {
    "active": False,
    "matrix": None,
    "dist": None,
    "new_mtx": None,
    "roi": None,
    "map1": None,
    "map2": None,
    "rms": 0.0
}

def load_calibration():
    global calibration_data
    if os.path.exists(CALIBRATION_FILE):
        try:
            import json
            import numpy as np
            with open(CALIBRATION_FILE, "r") as f:
                data = json.load(f)
            if "matrix" in data and "dist" in data:
                calibration_data["matrix"] = np.array(data["matrix"])
                calibration_data["dist"] = np.array(data["dist"])
                calibration_data["rms"] = data.get("rms", 0.0)
                calibration_data["active"] = True
                calibration_data["map1"] = None
                calibration_data["map2"] = None
                print(f"[INFO] Calibración cargada automáticamente: RMS={calibration_data['rms']}")
        except Exception as e:
            print(f"[ERROR] No se pudo cargar {CALIBRATION_FILE}: {e}")

def apply_calibration(frame):
    global calibration_data
    if not calibration_data["active"]:
        return frame
    
    import cv2
    import numpy as np
    h, w = frame.shape[:2]
    # Iniciar mapas lazily
    if calibration_data["map1"] is None or calibration_data["map1"].shape[:2] != (h, w):
        cam_mtx = calibration_data["matrix"]
        dist = calibration_data["dist"]
        new_mtx, roi = cv2.getOptimalNewCameraMatrix(cam_mtx, dist, (w, h), 1, (w, h))
        map1, map2 = cv2.initUndistortRectifyMap(cam_mtx, dist, None, new_mtx, (w, h), cv2.CV_16SC2)
        calibration_data["new_mtx"] = new_mtx
        calibration_data["roi"] = roi
        calibration_data["map1"] = map1
        calibration_data["map2"] = map2

    mapped = cv2.remap(frame, calibration_data["map1"], calibration_data["map2"], cv2.INTER_LINEAR)
    return mapped

load_calibration()


# ════════════════════════════════════════════════════════════════════════════
#  Estado de eliminación de personas en vivo (live stream)
#  MODO ROBOFLOW SAM3: Segmentación real de personas via API find-people
# ════════════════════════════════════════════════════════════════════════════

person_removal_state = {
    "active": False,
    "fill_color": [255, 255, 255],  # Blanco BGR
    "confidence": 0.3,              # Umbral de confianza SAM3
    "persons_found": 0,
    "fps": 0.0,
    "error": "",
    "frames_processed": 0,
    "mode": "roboflow",             # "roboflow" = SAM3 via Roboflow find-people
    "draw_contour": True,           # Dibujar borde del contorno además de rellenar
    "contour_thickness": 2,         # Grosor del borde del contorno
    "inpaint": False,               # Si True, usa inpainting en vez de fill_color
    "inpaint_radius": 5,            # Radio de inpainting
}
person_removal_lock = threading.Lock()
processed_frame = None          # Frame con personas eliminadas
processed_frame_lock = threading.Lock()
_person_removal_thread = None

# ── HOG Person Detector (singleton, loaded once) ─────────────────────────────
_hog_detector = None

def _get_hog_detector():
    """Returns a shared HOG person detector instance (created once)."""
    global _hog_detector
    if _hog_detector is None:
        _hog_detector = cv2.HOGDescriptor()
        _hog_detector.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
        print("[HOG] Person detector initialized")
    return _hog_detector


def _fast_person_detection(image_data, confidence=0.3):
    """Ultra-fast local person detection using OpenCV HOG descriptor.
    
    Runs entirely locally — no API calls, ~30-80ms per frame.
    
    Args:
        image_data: numpy array (BGR) or file path string
        confidence: minimum confidence threshold (HOG weight)
    
    Returns:
        List of detection dicts with class, confidence, x, y, width, height
    """
    import time
    t0 = time.time()
    
    if isinstance(image_data, str):
        img = cv2.imread(image_data)
    else:
        img = image_data
    
    if img is None:
        return []
    
    h, w = img.shape[:2]
    
    # Convert grayscale to BGR if needed
    if len(img.shape) == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    
    # Aggressive downscale for speed (320px wide)
    MAX_W = 320
    scale = 1.0
    if w > MAX_W:
        scale = MAX_W / w
        new_w = int(w * scale)
        new_h = int(h * scale)
        img_small = cv2.resize(img, (new_w, new_h))
    else:
        img_small = img
    
    hog = _get_hog_detector()
    
    # Detect people
    rects, weights = hog.detectMultiScale(
        img_small,
        winStride=(8, 8),
        padding=(4, 4),
        scale=1.05,
        useMeanshiftGrouping=False
    )
    
    if len(rects) == 0:
        elapsed = (time.time() - t0) * 1000
        print(f"[HOG] 0 persons detected ({elapsed:.0f}ms)")
        return []
    
    # Non-maximum suppression to remove overlapping boxes
    boxes = []
    scores = []
    for (x, y, bw, bh), weight in zip(rects, weights):
        conf = float(weight)
        if conf < confidence:
            continue
        boxes.append([int(x), int(y), int(x + bw), int(y + bh)])
        scores.append(conf)
    
    if len(boxes) == 0:
        elapsed = (time.time() - t0) * 1000
        print(f"[HOG] 0 persons above threshold ({elapsed:.0f}ms)")
        return []
    
    # Apply NMS
    indices = cv2.dnn.NMSBoxes(
        [(b[0], b[1], b[2] - b[0], b[3] - b[1]) for b in boxes],
        scores,
        score_threshold=confidence,
        nms_threshold=0.4
    )
    
    detections = []
    if len(indices) > 0:
        # Handle both old and new OpenCV NMSBoxes return format
        idx_list = indices.flatten() if hasattr(indices, 'flatten') else indices
        for i in idx_list:
            x1, y1, x2, y2 = boxes[i]
            conf = scores[i]
            # Scale back to original resolution
            ox1 = x1 / scale
            oy1 = y1 / scale
            ox2 = x2 / scale
            oy2 = y2 / scale
            obw = ox2 - ox1
            obh = oy2 - oy1
            cx = ox1 + obw / 2
            cy = oy1 + obh / 2
            detections.append({
                "class": "person",
                "confidence": min(conf, 1.0),
                "x": cx,
                "y": cy,
                "width": obw,
                "height": obh,
                "detection_id": f"hog_{i}"
            })
    
    elapsed = (time.time() - t0) * 1000
    print(f"[HOG] {len(detections)} persons detected ({elapsed:.0f}ms)")
    return detections


# ── OpenCV Person Tracker (fast frame-to-frame tracking) ─────────────────────
_tracker_state = {
    'initialized': False,
    'trackers': [],        # list of cv2.Tracker objects
    'boxes': [],           # list of (x,y,w,h) in original coords
    'classes': [],         # class names for each tracked object
    'confidences': [],     # confidence for each tracked object
    'last_detect_time': 0,
    'redetect_interval': 15,  # re-detect with SAM3 every N seconds
}


def _init_trackers(img_cv, detections):
    """Initialize OpenCV trackers from SAM3 detections."""
    global _tracker_state
    _tracker_state['trackers'] = []
    _tracker_state['boxes'] = []
    _tracker_state['classes'] = []
    _tracker_state['confidences'] = []
    
    h, w = img_cv.shape[:2]
    
    for det in detections:
        cx = float(det.get('x', 0))
        cy = float(det.get('y', 0))
        bw = float(det.get('width', 0))
        bh = float(det.get('height', 0))
        
        # Convert center coords to top-left
        x1 = int(cx - bw / 2)
        y1 = int(cy - bh / 2)
        bw_i = int(bw)
        bh_i = int(bh)
        
        # Clamp to image bounds
        x1 = max(0, min(x1, w - 1))
        y1 = max(0, min(y1, h - 1))
        bw_i = min(bw_i, w - x1)
        bh_i = min(bh_i, h - y1)
        
        if bw_i < 10 or bh_i < 10:
            continue
        
        bbox = (x1, y1, bw_i, bh_i)
        
        # Use CSRT tracker (accurate) or KCF (faster)
        try:
            tracker = cv2.TrackerCSRT_create()
        except AttributeError:
            try:
                tracker = cv2.legacy.TrackerCSRT_create()
            except:
                try:
                    tracker = cv2.TrackerKCF_create()
                except:
                    tracker = cv2.legacy.TrackerKCF_create()
        
        tracker.init(img_cv, bbox)
        _tracker_state['trackers'].append(tracker)
        _tracker_state['boxes'].append(bbox)
        _tracker_state['classes'].append(det.get('class', 'person'))
        _tracker_state['confidences'].append(float(det.get('confidence', 0.9)))
    
    _tracker_state['initialized'] = True
    _tracker_state['last_detect_time'] = time.time()
    print(f"[TRACKER] Initialized {len(_tracker_state['trackers'])} trackers")


def _track_frame(img_cv):
    """Update trackers with new frame. Very fast (~5-20ms).
    
    Returns list of detection dicts with updated positions.
    """
    import time as _time
    t0 = _time.time()
    
    if not _tracker_state['initialized'] or len(_tracker_state['trackers']) == 0:
        return []
    
    detections = []
    alive_trackers = []
    alive_boxes = []
    alive_classes = []
    alive_confs = []
    
    for i, tracker in enumerate(_tracker_state['trackers']):
        success, bbox = tracker.update(img_cv)
        if success:
            x, y, w, h = [int(v) for v in bbox]
            cx = x + w / 2
            cy = y + h / 2
            detections.append({
                'class': _tracker_state['classes'][i],
                'confidence': _tracker_state['confidences'][i],
                'x': cx,
                'y': cy,
                'width': w,
                'height': h,
                'detection_id': f'track_{i}',
            })
            alive_trackers.append(tracker)
            alive_boxes.append(bbox)
            alive_classes.append(_tracker_state['classes'][i])
            alive_confs.append(_tracker_state['confidences'][i])
    
    # Remove lost trackers
    _tracker_state['trackers'] = alive_trackers
    _tracker_state['boxes'] = alive_boxes
    _tracker_state['classes'] = alive_classes
    _tracker_state['confidences'] = alive_confs
    
    elapsed = (_time.time() - t0) * 1000
    print(f"[TRACKER] {len(detections)} tracked ({elapsed:.0f}ms)")
    return detections


def _reset_trackers():
    """Reset all trackers."""
    global _tracker_state
    _tracker_state['initialized'] = False
    _tracker_state['trackers'] = []
    _tracker_state['boxes'] = []
    _tracker_state['classes'] = []
    _tracker_state['confidences'] = []
    print("[TRACKER] Reset")

def _run_sam3_detection(image_path, class_names=None):
    """Conecta con el proyecto Roboflow sam-3-2 via API REST directa.
    (No usa inference_sdk porque no es compatible con Python 3.13)
    """
    if class_names is None:
        class_names = ["person", "forklift"]
    
    import requests
    import base64
    
    # Leer imagen y convertir a base64
    with open(image_path, "rb") as f:
        img_bytes = f.read()
    img_b64 = base64.b64encode(img_bytes).decode("utf-8")
    
    api_key = "K6YHioHqtuwbsNmR2n7O"
    url = "https://detect.roboflow.com/infer/workflows/welding-hqci3/sam-3-2"
    
    payload = {
        "api_key": api_key,
        "inputs": {
            "image": {"type": "base64", "value": img_b64},
            "className": class_names
        }
    }
    
    print(f"[SAM3] POST {url} | className={class_names} | img_size={len(img_bytes)} bytes")
    
    try:
        resp = requests.post(url, json=payload, timeout=30)
        resp.raise_for_status()
        result = resp.json()
        
        # Log completo
        import json
        rstr = json.dumps(result, indent=2, default=str)
        print(f"[SAM3] Respuesta ({len(rstr)} chars):")
        for i in range(0, min(len(rstr), 5000), 500):
            print(rstr[i:i+500])
        if len(rstr) > 5000:
            print("... (truncado)")
        
        return result
        
    except Exception as e:
        print(f"[SAM3 ERROR] {e}")
        import traceback
        traceback.print_exc()
        return []


def _parse_sam3_result(raw_result, confidence=0.0):
    """Extrae predicciones del resultado de la API REST de Roboflow.
    Estructura: {"outputs": [{"model_predictions": {"predictions": [...]}}]}
    """
    detections = []
    
    # La API REST devuelve {"outputs": [...]}
    if isinstance(raw_result, dict) and 'outputs' in raw_result:
        items = raw_result['outputs']
        print(f"[SAM3 PARSE] Encontrado 'outputs' con {len(items)} items")
    elif isinstance(raw_result, list):
        items = raw_result
    else:
        items = [raw_result]
    
    for item in items:
        if not isinstance(item, dict):
            continue
        
        print(f"[SAM3 PARSE] Keys: {list(item.keys())}")
        
        for key, val in item.items():
            if isinstance(val, dict) and 'predictions' in val:
                preds = val['predictions']
                print(f"[SAM3 PARSE] '{key}' → {len(preds)} predictions")
                for pred in preds:
                    if isinstance(pred, dict):
                        detections.append(pred)
                        print(f"[SAM3 PARSE]   {pred.get('class','?')} conf={pred.get('confidence','?')}")
            elif isinstance(val, list):
                for pred in val:
                    if isinstance(pred, dict) and ('x' in pred or 'width' in pred):
                        detections.append(pred)
    
    print(f"[SAM3 PARSE] TOTAL: {len(detections)} detecciones")
    return detections


def _person_removal_loop():
    """Hilo de eliminación de personas usando Roboflow workflow 'find-workers-and-forklifts'.
    
    Estrategia:
    - Envía cada frame al workflow de Roboflow via API REST
    - Detecta personas y las elimina con color sólido o inpainting
    
    Velocidad: ~1-3 FPS (depende de latencia API)
    """
    global processed_frame
    import tempfile

    fps_counter = 0
    fps_timer = time.time()
    consecutive_errors = 0
    MAX_CONSECUTIVE_ERRORS = 10

    print("[PERSON REMOVAL] Hilo iniciado — Roboflow SAM3 (modelo fundacional)")
    print("[PERSON REMOVAL] Velocidad: ~1-3 FPS (depende de latencia API)")

    while True:
        with person_removal_lock:
            if not person_removal_state["active"]:
                break
            fill_color = person_removal_state.get("fill_color", [255, 255, 255])
            confidence = person_removal_state.get("confidence", 0.3)
            draw_contour = person_removal_state.get("draw_contour", True)
            contour_thickness = person_removal_state.get("contour_thickness", 2)
            use_inpaint = person_removal_state.get("inpaint", False)
            inpaint_radius = person_removal_state.get("inpaint_radius", 5)

        # Obtener frame actual
        with frame_lock:
            frame = current_frame.copy() if current_frame is not None else None

        if frame is None:
            time.sleep(0.1)
            continue

        try:
            # Convertir mono a BGR si es necesario
            if len(frame.shape) == 2 or (len(frame.shape) == 3 and frame.shape[2] == 1):
                frame = cv2.cvtColor(frame, cv2.COLOR_GRAY2BGR)

            img_h, img_w = frame.shape[:2]

            # ── Guardar frame temporal para enviar a Roboflow ──
            temp_path = os.path.join(tempfile.gettempdir(), "_person_removal_frame.jpg")
            cv2.imwrite(temp_path, frame, [cv2.IMWRITE_JPEG_QUALITY, 80])

            # ── Llamar a SAM3 para detectar personas ──
            raw = _run_sam3_detection(temp_path, class_names=['person', 'forklift'])
            detections = _parse_sam3_result(raw, confidence=confidence)

            # Limpiar archivo temporal
            try:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
            except:
                pass

            num_persons = len(detections)

            with person_removal_lock:
                person_removal_state["persons_found"] = num_persons
                person_removal_state["error"] = ""

            # ── Rellenar las siluetas con el color elegido o inpainting ──
            if num_persons > 0:
                if use_inpaint:
                    # Modo inpainting: reconstruir el fondo
                    mask = np.zeros((img_h, img_w), dtype=np.uint8)
                    for det in detections:
                        if "points" in det and isinstance(det["points"], list) and len(det["points"]) >= 3:
                            poly_pts = [[int(pt.get("x", 0)), int(pt.get("y", 0))] for pt in det["points"]]
                            cv2.fillPoly(mask, [np.array(poly_pts, np.int32)], 255)
                        else:
                            # Fallback: bounding box
                            cx = float(det.get("x", 0))
                            cy = float(det.get("y", 0))
                            w = float(det.get("width", 0))
                            h = float(det.get("height", 0))
                            x1 = max(0, int(cx - w / 2))
                            y1 = max(0, int(cy - h / 2))
                            x2 = min(img_w, int(cx + w / 2))
                            y2 = min(img_h, int(cy + h / 2))
                            cv2.rectangle(mask, (x1, y1), (x2, y2), 255, -1)

                    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (inpaint_radius * 2 + 1, inpaint_radius * 2 + 1))
                    mask = cv2.dilate(mask, kernel, iterations=2)
                    frame = cv2.inpaint(frame, mask, inpaintRadius=inpaint_radius, flags=cv2.INPAINT_TELEA)
                else:
                    # Modo fill_color: rellenar siluetas con color sólido
                    for det in detections:
                        if "points" in det and isinstance(det["points"], list) and len(det["points"]) >= 3:
                            poly_pts = [[int(pt.get("x", 0)), int(pt.get("y", 0))] for pt in det["points"]]
                            poly_arr = np.array(poly_pts, np.int32)
                            cv2.fillPoly(frame, [poly_arr], fill_color)
                            if draw_contour:
                                border_b = max(0, fill_color[0] - 80)
                                border_g = max(0, fill_color[1] - 80)
                                border_r = max(0, fill_color[2] - 80)
                                cv2.polylines(frame, [poly_arr], True, [border_b, border_g, border_r], contour_thickness)
                        else:
                            # Fallback: bounding box con color sólido
                            cx = float(det.get("x", 0))
                            cy = float(det.get("y", 0))
                            w = float(det.get("width", 0))
                            h = float(det.get("height", 0))
                            x1 = max(0, int(cx - w / 2))
                            y1 = max(0, int(cy - h / 2))
                            x2 = min(img_w, int(cx + w / 2))
                            y2 = min(img_h, int(cy + h / 2))
                            cv2.rectangle(frame, (x1, y1), (x2, y2), fill_color, -1)
                            if draw_contour:
                                border_b = max(0, fill_color[0] - 80)
                                border_g = max(0, fill_color[1] - 80)
                                border_r = max(0, fill_color[2] - 80)
                                cv2.rectangle(frame, (x1, y1), (x2, y2), [border_b, border_g, border_r], contour_thickness)

            with processed_frame_lock:
                processed_frame = frame

            # Actualizar FPS y contador
            fps_counter += 1
            with person_removal_lock:
                person_removal_state["frames_processed"] += 1
            now = time.time()
            if now - fps_timer >= 1.0:
                with person_removal_lock:
                    person_removal_state["fps"] = round(fps_counter / (now - fps_timer), 1)
                fps_counter = 0
                fps_timer = now

            consecutive_errors = 0  # Reset error counter on success

        except Exception as e:
            consecutive_errors += 1
            err_msg = str(e)
            with person_removal_lock:
                person_removal_state["error"] = f"Error ({consecutive_errors}/{MAX_CONSECUTIVE_ERRORS}): {err_msg}"

            if consecutive_errors >= MAX_CONSECUTIVE_ERRORS:
                print(f"[PERSON REMOVAL] Demasiados errores consecutivos ({consecutive_errors}), deteniendo...")
                with person_removal_lock:
                    person_removal_state["active"] = False
                    person_removal_state["error"] = f"Detenido por errores: {err_msg}"
                break

            # Esperar más tras error para no saturar la API
            time.sleep(1.0)

        # Pausa entre llamadas API para no saturar Roboflow
        time.sleep(0.3)

    # Al salir del bucle, limpiar
    with processed_frame_lock:
        processed_frame = None
    with person_removal_lock:
        person_removal_state["fps"] = 0.0
        person_removal_state["persons_found"] = 0
        person_removal_state["frames_processed"] = 0
        person_removal_state["error"] = ""
    print("[PERSON REMOVAL] Hilo de eliminación en vivo DETENIDO")


def start_person_removal(fill_color=None, confidence=0.3, use_inpaint=False):
    """Activa la eliminación de personas en tiempo real (Roboflow SAM3 find-people)."""
    global _person_removal_thread
    if fill_color is None:
        fill_color = [255, 255, 255]  # Blanco por defecto
    with person_removal_lock:
        if person_removal_state["active"]:
            return {"ok": True, "already_active": True}
        person_removal_state["active"] = True
        person_removal_state["fill_color"] = fill_color
        person_removal_state["confidence"] = confidence
        person_removal_state["inpaint"] = use_inpaint
        person_removal_state["error"] = ""
        person_removal_state["frames_processed"] = 0
        person_removal_state["persons_found"] = 0
        person_removal_state["fps"] = 0.0
    _person_removal_thread = threading.Thread(target=_person_removal_loop, daemon=True)
    _person_removal_thread.start()
    return {"ok": True, "already_active": False}


def stop_person_removal():
    """Desactiva la eliminación de personas."""
    global _person_removal_thread, processed_frame
    with person_removal_lock:
        if not person_removal_state["active"]:
            return {"ok": True, "was_active": False}
        person_removal_state["active"] = False
    if _person_removal_thread:
        _person_removal_thread.join(timeout=10)
        _person_removal_thread = None
    with processed_frame_lock:
        processed_frame = None
    return {"ok": True, "was_active": True}


# ════════════════════════════════════════════════════════════════════════════
#  Estado y funciones de grabación de vídeo
# ════════════════════════════════════════════════════════════════════════════

recorder_state = {
    "recording": False,
    "path": "",
    "filename": "",
    "start_time": 0.0,
    "frames_written": 0,
    "fps": 10.0,
    "error": "",
}
recorder_lock = threading.Lock()
_video_writer = None          # cv2.VideoWriter instance
_recorder_thread = None


def start_recording(params: dict) -> dict:
    """Inicia la grabación de vídeo en un hilo dedicado."""
    global _video_writer, _recorder_thread

    import os
    save_dir  = params.get("dir", "C:\\Videos_Basler")
    filename  = params.get("filename", "")
    fps_rec   = float(params.get("fps", 10.0))
    codec     = params.get("codec", "MJPG")   # MJPG → .avi  |  mp4v → .mp4

    # Extensión según codec
    ext = ".mp4" if codec.lower() in ("mp4v", "h264", "avc1") else ".avi"

    if not filename:
        ts = time.strftime("%Y%m%d_%H%M%S")
        sn = camera_state.get("serial", "cam") or "cam"
        filename = f"basler_{sn}_{ts}{ext}"
    elif not (filename.lower().endswith(".avi") or filename.lower().endswith(".mp4")):
        filename += ext

    # Crear directorio
    try:
        os.makedirs(save_dir, exist_ok=True)
    except Exception as e:
        return {"ok": False, "error": f"No se pudo crear directorio: {e}"}

    save_path = os.path.join(save_dir, filename)

    # Tamaño del frame actual
    with frame_lock:
        frame_sample = current_frame
    if frame_sample is None:
        # Frame negro de referencia
        frame_sample = np.zeros((1200, 1920, 3), dtype=np.uint8)

    h, w = frame_sample.shape[:2]

    fourcc = cv2.VideoWriter_fourcc(*codec)
    writer = cv2.VideoWriter(save_path, fourcc, fps_rec, (w, h))
    if not writer.isOpened():
        # Fallback: intentar con MJPG
        fourcc = cv2.VideoWriter_fourcc(*'MJPG')
        filename_avi = os.path.splitext(filename)[0] + ".avi"
        save_path    = os.path.join(save_dir, filename_avi)
        filename     = filename_avi
        writer = cv2.VideoWriter(save_path, fourcc, fps_rec, (w, h))
        if not writer.isOpened():
            return {"ok": False, "error": "No se pudo abrir VideoWriter (OpenCV)"}

    with recorder_lock:
        recorder_state.update({
            "recording": True,
            "path": save_path,
            "filename": filename,
            "start_time": time.time(),
            "frames_written": 0,
            "fps": fps_rec,
            "error": "",
        })
    _video_writer = writer

    # Hilo de escritura de frames
    def _write_loop():
        global _video_writer
        delay = 1.0 / fps_rec
        print(f"[INFO] Grabación iniciada → {save_path}  @{fps_rec}fps")
        while True:
            with recorder_lock:
                if not recorder_state["recording"]:
                    break
            with frame_lock:
                frame = current_frame
            if frame is not None:
                # Resize si el frame no coincide con el tamaño del writer
                if frame.shape[0] != h or frame.shape[1] != w:
                    frame = cv2.resize(frame, (w, h))
                if _video_writer and _video_writer.isOpened():
                    _video_writer.write(frame)
                    with recorder_lock:
                        recorder_state["frames_written"] += 1
            time.sleep(delay)
        if _video_writer:
            _video_writer.release()
            _video_writer = None
        print(f"[INFO] Grabación detenida → {save_path}")

    _recorder_thread = threading.Thread(target=_write_loop, daemon=True)
    _recorder_thread.start()
    return {"ok": True, "path": save_path, "filename": filename, "fps": fps_rec}


def stop_recording() -> dict:
    """Detiene la grabación y cierra el VideoWriter."""
    with recorder_lock:
        if not recorder_state["recording"]:
            return {"ok": False, "error": "No hay grabación activa"}
        recorder_state["recording"] = False
        path    = recorder_state["path"]
        fname   = recorder_state["filename"]
        nframes = recorder_state["frames_written"]
        elapsed = time.time() - recorder_state["start_time"]
    # Esperar a que el hilo cierre el writer
    if _recorder_thread:
        _recorder_thread.join(timeout=3)
    import os
    size_mb = round(os.path.getsize(path) / (1024 * 1024), 2) if os.path.exists(path) else 0
    return {
        "ok": True,
        "path": path,
        "filename": fname,
        "frames_written": nframes,
        "duration_s": round(elapsed, 1),
        "size_mb": size_mb,
    }


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
                arr_corrected = apply_calibration(arr.copy())
                with frame_lock:
                    current_frame = arr_corrected
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

        frame_corrected = apply_calibration(frame)
        with frame_lock:
            current_frame = frame_corrected
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
    """Retorna el frame actual como JPEG bytes.
    Si la eliminación de personas está activa, usa el frame procesado."""
    # Si eliminación de personas está activa, usar el frame procesado
    use_processed = False
    with person_removal_lock:
        use_processed = person_removal_state["active"]

    if use_processed:
        with processed_frame_lock:
            frame = processed_frame
        if frame is None:
            # Aún no hay frame procesado, usar el original
            with frame_lock:
                frame = current_frame
    else:
        with frame_lock:
            frame = current_frame

    if frame is None:
        # Frame negro con texto
        frame = np.zeros((400, 640, 3), dtype=np.uint8)
        cv2.putText(frame, "Sin señal — conecta la cámara", (80, 200),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (60, 60, 60), 2)
    try:
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

        # ── /api/calibration/status
        elif path == "/api/calibration/status":
            self._json_response({
                "ok": True, 
                "active": calibration_data["active"],
                "rms": calibration_data["rms"] if calibration_data["active"] else None
            })

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
            except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
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

        # ── /api/snapshot_save — Guarda foto en disco
        elif path == "/api/snapshot_save":
            import os
            query = parse_qs(parsed.query)
            save_dir = query.get("dir", [""])[0]
            custom_name = query.get("filename", [""])[0]

            if not save_dir:
                self._json_response({"ok": False, "error": "Falta el parámetro 'dir'"})
                return

            # Crear directorio si no existe
            try:
                os.makedirs(save_dir, exist_ok=True)
            except Exception as e:
                self._json_response({"ok": False, "error": f"No se pudo crear el directorio: {e}"})
                return

            # Nombre automático con timestamp
            if not custom_name:
                ts = time.strftime("%Y%m%d_%H%M%S")
                sn = camera_state.get("serial", "cam") or "cam"
                custom_name = f"basler_{sn}_{ts}.jpg"
            elif not custom_name.lower().endswith(".jpg"):
                custom_name += ".jpg"

            save_path = os.path.join(save_dir, custom_name)

            jpg = get_jpeg_frame(quality=95)
            if not jpg:
                self._json_response({"ok": False, "error": "Sin frame disponible. ¿Está la cámara conectada?"})
                return

            try:
                with open(save_path, "wb") as f:
                    f.write(jpg)
                print(f"[INFO] Foto guardada: {save_path}")
                self._json_response({
                    "ok": True,
                    "path": save_path,
                    "filename": custom_name,
                    "size_kb": round(len(jpg) / 1024, 1),
                })
            except Exception as e:
                self._json_response({"ok": False, "error": f"Error al guardar: {e}"})

        # ── /api/record/status
        elif path == "/api/record/status":
            with recorder_lock:
                state_copy = dict(recorder_state)
            if state_copy["recording"]:
                state_copy["elapsed_s"] = round(time.time() - state_copy["start_time"], 1)
            else:
                state_copy["elapsed_s"] = 0
            self._json_response(state_copy)

        # ── /api/scan_plc
        elif path == "/api/scan_plc":
            query = parse_qs(parsed.query)
            ip = query.get("ip", [""])[0]
            port = int(query.get("port", ["9600"])[0])
            if ip:
                import socket
                import os
                import platform
                
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(0.5)
                tcp_open = (sock.connect_ex((ip, port)) == 0)
                sock.close()
                
                param = '-n' if platform.system().lower() == 'windows' else '-c'
                cmd = f"ping {param} 1 -w 500 {ip} > nul 2>&1" if platform.system().lower() == 'windows' else f"ping {param} 1 -W 1 {ip} > /dev/null 2>&1"
                alive = (os.system(cmd) == 0)
                
                self.send_response(200)
                self.send_cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"ok": True, "ip": ip, "alive": alive, "tcp_open": tcp_open}).encode())
            else:
                self.send_response(400)
                self.send_cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(b'{"ok": False, "error": "No IP"}')

        # ── /api/calibration/capture — captura frame y detecta esquinas
        elif path == "/api/calibration/capture":
            import os, glob
            query = parse_qs(parsed.query)
            save_dir = query.get("dir", [""])[0]
            cols     = int(query.get("cols", ["9"])[0])
            rows     = int(query.get("rows", ["6"])[0])

            if not save_dir:
                self._json_response({"ok": False, "error": "Falta el parámetro 'dir'"})
                return

            try:
                os.makedirs(save_dir, exist_ok=True)
            except Exception as e:
                self._json_response({"ok": False, "error": f"No se pudo crear el directorio: {e}"})
                return

            with frame_lock:
                frame = current_frame

            if frame is None:
                self._json_response({"ok": False, "error": "Sin frame disponible. ¿Está la cámara conectada?"})
                return

            # Nombre de archivo secuencial
            existing = glob.glob(os.path.join(save_dir, "cal_*.jpg"))
            idx = len(existing) + 1
            filename = f"cal_{idx:04d}.jpg"
            save_path = os.path.join(save_dir, filename)

            # Guardar imagen
            try:
                ret, buf = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 95])
                if ret:
                    with open(save_path, 'wb') as f:
                        f.write(bytes(buf))
                else:
                    raise RuntimeError("imencode falló")
            except Exception as e:
                self._json_response({"ok": False, "error": f"Error al guardar imagen: {e}"})
                return

            # Detectar esquinas del tablero
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame
            corners_found, _ = cv2.findChessboardCorners(
                gray, (cols, rows),
                cv2.CALIB_CB_ADAPTIVE_THRESH + cv2.CALIB_CB_NORMALIZE_IMAGE
            )

            print(f"[INFO] Cal capture: {filename}  corners={bool(corners_found)}")
            self._json_response({
                "ok": True,
                "filename": filename,
                "path": save_path,
                "corners_found": bool(corners_found),
            })

        # ── /api/calibration/preview — sirve imagen original o corregida como PNG
        elif path == "/api/calibration/preview":
            import os
            query    = parse_qs(parsed.query)
            img_path = query.get("path", [""])[0]
            mode     = query.get("mode", ["original"])[0]  # 'original' | 'corrected' | 'pattern'

            if not img_path or not os.path.isfile(img_path):
                self.send_response(404)
                self.end_headers()
                return

            img = cv2.imread(img_path)
            if img is None:
                self.send_response(404)
                self.end_headers()
                return

            # Redimensionar para el preview (máx 800px de ancho)
            h, w = img.shape[:2]
            if w > 800:
                scale = 800 / w
                img = cv2.resize(img, (800, int(h * scale)))

            ret, buf = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 88])
            if not ret:
                self.send_response(500)
                self.end_headers()
                return

            data = bytes(buf)
            self.send_response(200)
            self.send_header("Content-Type", "image/jpeg")
            self.send_header("Content-Length", str(len(data)))
            self.send_cors()
            self.end_headers()
            self.wfile.write(data)

        # ── /api/sam3/live-status — estado de eliminación de personas en vivo
        elif path == "/api/sam3/live-status":
            with person_removal_lock:
                state_copy = dict(person_removal_state)
            self._json_response(state_copy)

        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        import base64
        try:
            import numpy as np
            import cv2
        except ImportError:
            pass
            
        parsed = urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length > 0 else b"{}"
        try:
            params = json.loads(body)
        except Exception:
            params = {}



        # ── /api/calibration/apply
        if path == "/api/calibration/apply":
            try:
                # Requires 'matrix' (3x3 array), 'dist' (1x5 array), and 'rms'
                with open(CALIBRATION_FILE, "w") as f:
                    json.dump(params, f, indent=4)
                load_calibration()
                self._json_response({"ok": True})
            except Exception as e:
                self._json_response({"ok": False, "error": str(e)})

        # ── /api/calibration/clear
        elif path == "/api/calibration/clear":
            global calibration_data
            if os.path.exists(CALIBRATION_FILE):
                try:
                    os.remove(CALIBRATION_FILE)
                except Exception:
                    pass
            calibration_data["active"] = False
            self._json_response({"ok": True})

        # ── /api/connect
        elif path == "/api/connect":
            result = connect_camera(params)
            self._json_response(result)

        # ── /api/calibration/auto_ratio
        elif path == "/api/calibration/auto_ratio":
            with frame_lock:
                frame = current_frame.copy() if current_frame is not None else None
            if frame is None:
                self._json_response({"ok": False, "error": "No hay frame en este momento."})
                return
            
            try:
                aruco_mm = float(params.get("aruco_mm", 50.0))
                # Intentamos detectar con el diccionario DICT_4X4_50 que es muy común para calibración
                aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
                aruco_params = cv2.aruco.DetectorParameters()
                detector = cv2.aruco.ArucoDetector(aruco_dict, aruco_params)
                
                # Convertir a escala de grises para mejor detección
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                corners, ids, rejected = detector.detectMarkers(gray)
                
                if ids is not None and len(ids) > 0:
                    # Tomar el primer marcador detectado
                    c = corners[0][0] # 4 esquinas del marcador -> shape (4, 2)
                    
                    # Distancias entre vértices (lados)
                    side_1 = np.linalg.norm(c[0] - c[1])
                    side_2 = np.linalg.norm(c[1] - c[2])
                    side_3 = np.linalg.norm(c[2] - c[3])
                    side_4 = np.linalg.norm(c[3] - c[0])
                    
                    avg_side_px = float((side_1 + side_2 + side_3 + side_4) / 4.0)
                    ratio = aruco_mm / avg_side_px
                    
                    self._json_response({
                        "ok": True, 
                        "ratio": ratio, 
                        "avg_px": avg_side_px, 
                        "aruco_id": int(ids[0][0])
                    })
                else:
                    self._json_response({"ok": False, "error": "No se ha detectado ningún marcador ArUco (DICT_4X4_50) en la imagen."})
            except Exception as e:
                self._json_response({"ok": False, "error": str(e)})

        # ── /api/record/start
        elif path == "/api/record/start":
            with recorder_lock:
                already = recorder_state["recording"]
            if already:
                self._json_response({"ok": False, "error": "Ya hay una grabación activa"})
                return
            result = start_recording(params)
            self._json_response(result)

        # ── /api/record/stop
        elif path == "/api/record/stop":
            result = stop_recording()
            self._json_response(result)

        # ── /api/calibration/compute — calibra cámara con las imágenes
        elif path == "/api/calibration/compute":
            save_dir  = params.get("dir", "")
            cols      = int(params.get("cols", 9))
            rows      = int(params.get("rows", 6))
            square_mm = float(params.get("square_mm", 25.0))

            if not save_dir:
                self._json_response({"ok": False, "error": "Falta el parámetro 'dir'"})
                return

            images = sorted(glob.glob(os.path.join(save_dir, "cal_*.jpg")))
            if len(images) < 4:
                self._json_response({"ok": False, "error": f"Se necesitan al menos 4 imágenes, solo hay {len(images)}"})
                return

            # Puntos 3D del tablero (en mm)
            objp = np.zeros((rows * cols, 3), np.float32)
            objp[:, :2] = np.mgrid[0:cols, 0:rows].T.reshape(-1, 2) * square_mm

            obj_points = []  # puntos 3D reales
            img_points = []  # puntos 2D en imagen
            img_shape  = None

            for img_path in images:
                img  = cv2.imread(img_path)
                if img is None:
                    continue
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                img_shape = gray.shape[::-1]

                found, corners = cv2.findChessboardCorners(
                    gray, (cols, rows),
                    cv2.CALIB_CB_ADAPTIVE_THRESH + cv2.CALIB_CB_NORMALIZE_IMAGE
                )

                if found:
                    # Refinar esquinas
                    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)
                    corners2 = cv2.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)
                    obj_points.append(objp)
                    img_points.append(corners2)

            if len(obj_points) < 4:
                self._json_response({
                    "ok": False,
                    "error": f"Solo {len(obj_points)} imágenes con esquinas detectadas. Se necesitan al menos 4."
                })
                return

            try:
                rms, camera_matrix, dist_coeffs, rvecs, tvecs = cv2.calibrateCamera(
                    obj_points, img_points, img_shape, None, None
                )

                fx = float(camera_matrix[0, 0])
                fy = float(camera_matrix[1, 1])
                cx = float(camera_matrix[0, 2])
                cy = float(camera_matrix[1, 2])
                k1, k2, p1, p2, k3 = [float(x) for x in dist_coeffs.ravel()[:5]]

                print(f"[INFO] Calibración OK: RMS={rms:.4f} imgs={len(obj_points)}")

                # ── Guardar imágenes corregidas y con patrón dibujado ──────────
                corrected_dir = os.path.join(save_dir, "corrected")
                pattern_dir   = os.path.join(save_dir, "pattern")
                os.makedirs(corrected_dir, exist_ok=True)
                os.makedirs(pattern_dir,   exist_ok=True)

                saved_corrected = []
                saved_pattern   = []

                for img_path in images:
                    img_bgr = cv2.imread(img_path)
                    if img_bgr is None:
                        continue
                    h, w = img_bgr.shape[:2]
                    fname = os.path.basename(img_path)

                    # --- Imagen corregida (undistort) ---
                    new_mtx, roi = cv2.getOptimalNewCameraMatrix(
                        camera_matrix, dist_coeffs, (w, h), 1, (w, h)
                    )
                    undist = cv2.undistort(img_bgr, camera_matrix, dist_coeffs, None, new_mtx)
                    # Recortar al ROI válido
                    rx, ry, rw, rh = roi
                    if rw > 0 and rh > 0:
                        undist = undist[ry:ry+rh, rx:rx+rw]
                    corr_path = os.path.join(corrected_dir, fname)
                    cv2.imwrite(corr_path, undist)
                    saved_corrected.append(fname)

                    # --- Imagen original con patrón dibujado ---
                    gray_p  = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
                    found_p, corners_p = cv2.findChessboardCorners(
                        gray_p, (cols, rows),
                        cv2.CALIB_CB_ADAPTIVE_THRESH + cv2.CALIB_CB_NORMALIZE_IMAGE
                    )
                    pat_img = img_bgr.copy()
                    if found_p:
                        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)
                        corners2p = cv2.cornerSubPix(gray_p, corners_p, (11, 11), (-1, -1), criteria)
                        cv2.drawChessboardCorners(pat_img, (cols, rows), corners2p, found_p)
                    # Añadir texto RMS en la imagen
                    cv2.putText(pat_img, f"RMS={rms:.4f}", (12, 36),
                                cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 64), 2, cv2.LINE_AA)
                    pat_path = os.path.join(pattern_dir, fname)
                    cv2.imwrite(pat_path, pat_img)
                    saved_pattern.append(fname)

                print(f"[INFO] Guardadas {len(saved_corrected)} imágenes corregidas en: {corrected_dir}")
                print(f"[INFO] Guardadas {len(saved_pattern)} imágenes con patrón en:  {pattern_dir}")

                self._json_response({
                    "ok": True,
                    "result": {
                        "rms": round(rms, 6),
                        "fx": fx, "fy": fy,
                        "cx": cx, "cy": cy,
                        "k1": k1, "k2": k2,
                        "p1": p1, "p2": p2,
                        "k3": k3,
                        "image_count": len(obj_points),
                        "corrected_dir": corrected_dir,
                        "pattern_dir":   pattern_dir,
                        "corrected_files": saved_corrected,
                        "pattern_files":   saved_pattern,
                    }
                })
            except Exception as e:
                self._json_response({"ok": False, "error": f"cv2.calibrateCamera falló: {e}"})

        # ── /api/segment
        elif path == "/api/segment":
            with frame_lock:
                frame = current_frame.copy() if current_frame is not None else None
            
            if frame is None:
                self._json_response({"ok": False, "error": "No hay frame actual para segmentar."})
                return

            try:
                method = params.get("method", "point")
                pts = params.get("points", [])
                
                h, w = frame.shape[:2]
                
                if method == "point":
                    # Single point click -> FloodFill
                    x = int(pts[0].get("x", 0)) if len(pts) > 0 else 0
                    y = int(pts[0].get("y", 0)) if len(pts) > 0 else 0
                    tolerance = int(params.get("tolerance", 30))
                    
                    if not (0 <= x < w and 0 <= y < h):
                        self._json_response({"ok": False, "error": "Coordenadas fuera de imagen."})
                        return

                    import numpy as np
                    mask = np.zeros((h + 2, w + 2), np.uint8)
                    flags = 4 | (255 << 8) | cv2.FLOODFILL_MASK_ONLY | cv2.FLOODFILL_FIXED_RANGE
                    diff = (tolerance, tolerance, tolerance)

                    cv2.floodFill(frame, mask, (x, y), (255, 255, 255), diff, diff, flags)
                    mask_res = mask[1:-1, 1:-1]
                    
                else: # Shape-based segmentation -> GrabCut 
                    if len(pts) < 2 and method != "polygon":
                        self._json_response({"ok": False, "error": "Puntos insuficientes."})
                        return
                    if method == "polygon" and len(pts) < 3:
                        self._json_response({"ok": False, "error": "Escasos puntos para polígono."})
                        return
                        
                    import numpy as np
                    mask = np.zeros((h, w), np.uint8)
                    mask[:] = cv2.GC_BGD # Fondo general
                    
                    rect_bounds = None
                    
                    if method == "rect":
                        x1, y1 = int(pts[0]['x']), int(pts[0]['y'])
                        x2, y2 = int(pts[1]['x']), int(pts[1]['y'])
                        cv2.rectangle(mask, (min(x1,x2), min(y1,y2)), (max(x1,x2), max(y1,y2)), cv2.GC_PR_FGD, -1)
                        rect_bounds = (min(x1,x2), min(y1,y2), abs(x2-x1), abs(y2-y1))
                    elif method == "circle":
                        cx, cy = int(pts[0]['x']), int(pts[0]['y'])
                        ox, oy = int(pts[1]['x']), int(pts[1]['y'])
                        r = int(np.hypot(ox - cx, oy - cy))
                        cv2.circle(mask, (cx, cy), r, cv2.GC_PR_FGD, -1)
                        rect_bounds = (max(0, cx-r), max(0, cy-r), r*2, r*2)
                    elif method == "polygon":
                        poly_pts = np.array([[int(p['x']), int(p['y'])] for p in pts], np.int32)
                        cv2.fillPoly(mask, [poly_pts], cv2.GC_PR_FGD)
                        rect_bounds = cv2.boundingRect(poly_pts)
                         
                    # Evitar errores si rects se salen:
                    rx, ry, rw, rh = rect_bounds
                    if rw <= 0 or rh <= 0:
                        self._json_response({"ok": False, "error": "Dimensiones del área son inválidas."})
                        return
                        
                    bgdModel = np.zeros((1, 65), np.float64)
                    fgdModel = np.zeros((1, 65), np.float64)
                    
                    try:
                        cv2.grabCut(frame, mask, rect_bounds, bgdModel, fgdModel, 5, cv2.GC_INIT_WITH_MASK)
                    except Exception as e:
                        self._json_response({"ok": False, "error": f"GrabCut error: {str(e)}"})
                        return
                        
                    mask_res = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8') * 255

                # Encontrar contornos de cualquiera de los dos metodos
                contours, _ = cv2.findContours(mask_res, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                
                if not contours:
                    self._json_response({"ok": False, "error": "No se distinguen objetos diferenciados del fondo."})
                    return
                
                # Toma el contorno más voluminoso generado
                best_c = max(contours, key=cv2.contourArea)
                
                # Suavizar / Aproximar contorno para reducir el número de vértices (JSON más rápido)
                epsilon = 0.002 * cv2.arcLength(best_c, True)
                approx = cv2.approxPolyDP(best_c, epsilon, True)
                
                area = float(cv2.contourArea(approx))
                
                # Calcular el punto medio (Centroide) de la pieza
                M = cv2.moments(approx)
                cx = int(M['m10']/M['m00']) if M['m00'] != 0 else x if method == "point" else int(pts[0]['x'])
                cy = int(M['m01']/M['m00']) if M['m00'] != 0 else y if method == "point" else int(pts[0]['y'])
                
                contour_pts = [{"x": int(pt[0][0]), "y": int(pt[0][1])} for pt in approx]

                self._json_response({
                    "ok": True,
                    "area_px": area,
                    "cx": cx,
                    "cy": cy,
                    "contour": contour_pts
                })

            except Exception as e:
                self._json_response({"ok": False, "error": f"Fallo en segmentación: {str(e)}"})

        # ── /api/measure/roboflow
        elif path == "/api/measure/roboflow":
            from inference_sdk import InferenceHTTPClient
            import traceback

            try:
                b64_str = params.get("image", "")
                if "," in b64_str:
                    b64_str = b64_str.split(",")[1]

                img_data = base64.b64decode(b64_str)
                nparr = np.frombuffer(img_data, np.uint8)
                img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                img_h, img_w = img_cv.shape[:2]

                temp_path = "temp_roboflow.jpg"
                cv2.imwrite(temp_path, img_cv)

                client = InferenceHTTPClient(
                    api_url="https://serverless.roboflow.com",
                    api_key="K6YHioHqtuwbsNmR2n7O"
                )

                result_raw = client.run_workflow(
                    workspace_name="welding-hqci3",
                    workflow_id="detect-count-and-visualize-2",
                    images={"image": temp_path},
                    use_cache=True
                )

                if os.path.exists(temp_path):
                    os.remove(temp_path)

                # Serializar todo de forma segura
                def to_json(obj):
                    if obj is None: return None
                    if isinstance(obj, (str, int, float, bool)): return obj
                    if isinstance(obj, dict): return {k: to_json(v) for k, v in obj.items()}
                    if isinstance(obj, list): return [to_json(v) for v in obj]
                    if hasattr(obj, 'tolist'): return obj.tolist()  # numpy
                    if hasattr(obj, '__dict__'): return to_json(obj.__dict__)
                    try:
                        import json; json.dumps(obj); return obj
                    except: return str(obj)

                result = to_json(result_raw)

                # result es lista: [{count_objects, output_image, predictions:{image, predictions:[...]}}]
                r0 = result[0] if (isinstance(result, list) and len(result) > 0) else {}

                # Extraer output_image
                output_image = r0.get("output_image")  # string base64 JPEG

                # Extraer predicciones
                preds_raw = r0.get("predictions", {})
                if isinstance(preds_raw, dict):
                    predictions = preds_raw.get("predictions", [])
                elif isinstance(preds_raw, list):
                    predictions = preds_raw
                else:
                    predictions = []

                print(f"[Roboflow] {len(predictions)} predicciones | output_image: {'SI' if output_image else 'NO'}")

                self._json_response({
                    "ok": True,
                    "output_image": output_image,
                    "predictions": predictions,
                    "image_width": img_w,
                    "image_height": img_h
                })

            except Exception as e:
                print(traceback.format_exc())
                self._json_response({"ok": False, "error": str(e)})

        # ── /api/measure/canny
        elif path == "/api/measure/canny":
            try:
                # Recibe un resultado de segmentación y calcula bordes de Canny.
                # Como el Canny puede ser pesado e igual requiere la imagen, envíamos la base64 de vuelta.
                b64_str = params.get("image", "")
                if "," in b64_str:
                    b64_str = b64_str.split(",")[1]
                
                img_data = base64.b64decode(b64_str)
                nparr = np.frombuffer(img_data, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
                
                edges = cv2.Canny(img, 50, 150)
                
                # Devolver los puntos de borde es costoso para un JSON.
                # Mejor devolver la imagen base64 de Canny:
                ret, buf = cv2.imencode('.png', edges)
                edges_b64 = "data:image/png;base64," + base64.b64encode(buf).decode('utf-8')
                
                self._json_response({"ok": True, "edges_image": edges_b64})
            except Exception as e:
                self._json_response({"ok": False, "error": str(e)})

        # ── /api/video/convert — convert non-browser formats (AVI, MOV, MKV…) to MP4
        elif path == "/api/video/convert":
            import tempfile, traceback
            try:
                b64_str = params.get("video", "")
                if "," in b64_str:
                    b64_str = b64_str.split(",", 1)[1]

                video_data = base64.b64decode(b64_str)
                if len(video_data) < 100:
                    raise ValueError("Archivo de vídeo demasiado pequeño o vacío")

                # Write incoming video to a temp file
                with tempfile.NamedTemporaryFile(suffix=".input", delete=False) as tmp_in:
                    tmp_in.write(video_data)
                    input_path = tmp_in.name

                output_path = input_path + ".mp4"

                cap = cv2.VideoCapture(input_path)
                if not cap.isOpened():
                    os.remove(input_path)
                    raise RuntimeError("OpenCV no pudo abrir el vídeo. Formato no soportado.")

                fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
                w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

                # Try H.264 first, fall back to mp4v
                fourcc = cv2.VideoWriter_fourcc(*'avc1')
                writer = cv2.VideoWriter(output_path, fourcc, fps, (w, h))
                if not writer.isOpened():
                    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                    writer = cv2.VideoWriter(output_path, fourcc, fps, (w, h))

                if not writer.isOpened():
                    cap.release()
                    os.remove(input_path)
                    raise RuntimeError("No se pudo crear el writer MP4 (instala ffmpeg para soporte completo).")

                written = 0
                while True:
                    ret, frame = cap.read()
                    if not ret:
                        break
                    writer.write(frame)
                    written += 1

                cap.release()
                writer.release()

                if written == 0:
                    os.remove(input_path)
                    if os.path.exists(output_path):
                        os.remove(output_path)
                    raise RuntimeError("El vídeo no contiene frames legibles.")

                # Read converted MP4 and return as base64
                with open(output_path, "rb") as f:
                    mp4_bytes = f.read()

                mp4_b64 = base64.b64encode(mp4_bytes).decode("ascii")

                # Cleanup temp files
                os.remove(input_path)
                os.remove(output_path)

                print(f"[Video Convert] {total_frames} frames → {written} written, {len(mp4_bytes)//1024}KB MP4")
                self._json_response({
                    "ok": True,
                    "mp4_base64": mp4_b64,
                    "frames": written,
                    "fps": fps,
                    "width": w,
                    "height": h,
                })

            except Exception as e:
                print(f"[Video Convert ERROR] {e}")
                print(traceback.format_exc())
                self._json_response({"ok": False, "error": str(e)})

        # ── /api/disconnect
        elif path == "/api/disconnect":
            disconnect_camera()
            self._json_response({"ok": True})

        # ── /api/roboflow-classes — Get class names from Roboflow project
        elif path == "/api/roboflow-classes":
            try:
                api_key = "K6YHioHqtuwbsNmR2n7O"
                workspace = "welding-hqci3"
                project_slug = "cargar_piezas"
                model_id = f"{project_slug}/2"  # versión del modelo
                classes = []

                # ── Método 1: inference_sdk — obtener clases del modelo via infer ──
                # Usa serverless.roboflow.com que SÍ funciona en esta red
                try:
                    from inference_sdk import InferenceHTTPClient
                    client = InferenceHTTPClient(
                        api_url="https://detect.roboflow.com",
                        api_key=api_key
                    )
                    
                    # Intentar obtener info del modelo (puede tener class_names)
                    try:
                        model_info = client.get_model_description(model_id)
                        print(f"[ROBOFLOW] Model info: {type(model_info).__name__}")
                        if hasattr(model_info, 'class_names') and model_info.class_names:
                            classes = sorted(model_info.class_names)
                        elif isinstance(model_info, dict) and 'class_names' in model_info:
                            classes = sorted(model_info['class_names'])
                        print(f"[ROBOFLOW] Classes via model_info: {classes}")
                    except Exception as mi_err:
                        print(f"[ROBOFLOW] model_info error: {mi_err}")

                    # Si no obtuvimos clases, intentar con una imagen dummy via workflow
                    if not classes:
                        import numpy as np
                        # Crear imagen negra pequeña (50x50) para una inferencia rápida
                        dummy_img = np.zeros((50, 50, 3), dtype=np.uint8)
                        temp_dummy = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_dummy_classes.jpg")
                        cv2.imwrite(temp_dummy, dummy_img)
                        
                        try:
                            result = client.run_workflow(
                                workspace_name=workspace,
                                workflow_id="detect-count-and-visualize-2",
                                images={"image": temp_dummy},
                                use_cache=True
                            )
                            
                            # Serializar
                            def to_json_safe(obj):
                                if obj is None: return None
                                if isinstance(obj, (str, int, float, bool)): return obj
                                if isinstance(obj, dict): return {k: to_json_safe(v) for k, v in obj.items()}
                                if isinstance(obj, list): return [to_json_safe(v) for v in obj]
                                if hasattr(obj, 'tolist'): return obj.tolist()
                                if hasattr(obj, '__dict__'): return to_json_safe(obj.__dict__)
                                try:
                                    json.dumps(obj); return obj
                                except: return str(obj)
                            
                            result = to_json_safe(result)
                            r0 = result[0] if isinstance(result, list) and len(result) > 0 else {}
                            
                            # Extraer class_names de las predicciones (el workflow puede incluir metadata)
                            preds_raw = r0.get("predictions", {})
                            if isinstance(preds_raw, dict):
                                # La estructura predictions puede tener "image" con metadata
                                img_meta = preds_raw.get("image", {})
                                if isinstance(img_meta, dict):
                                    print(f"[ROBOFLOW] predictions.image keys: {list(img_meta.keys())}")
                                pred_list = preds_raw.get("predictions", [])
                            elif isinstance(preds_raw, list):
                                pred_list = preds_raw
                            else:
                                pred_list = []
                            
                            # Buscar todas las claves que puedan contener class names
                            for k, v in r0.items():
                                print(f"[ROBOFLOW] Workflow key: {k} = {type(v).__name__} ({len(v) if isinstance(v, (list, dict, str)) else v})")
                            
                        except Exception as wf_err:
                            print(f"[ROBOFLOW] Workflow error: {wf_err}")
                        finally:
                            try:
                                if os.path.exists(temp_dummy):
                                    os.remove(temp_dummy)
                            except:
                                pass
                    
                    # Si todavía no hay clases, intentar infer directo al modelo
                    if not classes:
                        try:
                            import numpy as np
                            dummy_img = np.zeros((50, 50, 3), dtype=np.uint8)
                            temp_dummy2 = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_dummy_infer.jpg")
                            cv2.imwrite(temp_dummy2, dummy_img)
                            
                            infer_result = client.infer(temp_dummy2, model_id=model_id)
                            print(f"[ROBOFLOW] Infer result type: {type(infer_result).__name__}")
                            
                            # El resultado de infer suele tener predicted_classes o class en las predictions
                            if isinstance(infer_result, dict):
                                for k in ['predicted_classes', 'class_names', 'classes']:
                                    if k in infer_result:
                                        val = infer_result[k]
                                        if isinstance(val, list):
                                            classes = sorted(val)
                                        elif isinstance(val, dict):
                                            classes = sorted(val.keys())
                                        if classes:
                                            break
                                # También revisar si existe un campo top-level con info del modelo
                                print(f"[ROBOFLOW] Infer keys: {list(infer_result.keys()) if isinstance(infer_result, dict) else 'N/A'}")
                            
                            try:
                                if os.path.exists(temp_dummy2):
                                    os.remove(temp_dummy2)
                            except:
                                pass
                        except Exception as infer_err:
                            print(f"[ROBOFLOW] Infer error: {infer_err}")
                    
                    if classes:
                        print(f"[ROBOFLOW] Classes via inference_sdk ({len(classes)}): {classes}")
                        self._json_response({"ok": True, "classes": classes, "project": project_slug, "source": "inference_sdk"})
                        return
                        
                except Exception as sdk_err:
                    print(f"[ROBOFLOW] inference_sdk error: {sdk_err}")
                    import traceback
                    traceback.print_exc()

                # ── Método 2: REST API (api.roboflow.com — puede no funcionar en todas las redes) ──
                try:
                    import urllib.request
                    req_url = f"https://api.roboflow.com/{workspace}/{project_slug}?api_key={api_key}"
                    print(f"[ROBOFLOW] Trying REST API: {req_url}")
                    req = urllib.request.Request(req_url)
                    with urllib.request.urlopen(req, timeout=10) as resp:
                        data = json.loads(resp.read().decode())
                        if "classes" in data:
                            if isinstance(data["classes"], dict):
                                classes = sorted(data["classes"].keys())
                            elif isinstance(data["classes"], list):
                                classes = sorted(data["classes"])
                        if classes:
                            print(f"[ROBOFLOW] Classes via REST ({len(classes)}): {classes}")
                            self._json_response({"ok": True, "classes": classes, "project": project_slug, "source": "rest_api"})
                            return
                except Exception as rest_err:
                    print(f"[ROBOFLOW] REST API error: {rest_err}")

                # ── Fallback: TODAS las 27 clases del proyecto CARGAR_PIEZAS ──
                known_classes = [
                    "1",
                    "1 CUERPO MG_M2",
                    "1 CUERPO XL",
                    "BARRA CARGA",
                    "BASTIDOR COLGADO",
                    "CANDENAS BASTIDOR",
                    "CARRO MG_M2",
                    "CARRO XL",
                    "CESTON MASTILES",
                    "GANCHO BASTIDOR",
                    "GANCHO CURVO BASTIDOR",
                    "GANCHO MASTIL",
                    "M2_LARGO_STD",
                    "MASTIL COLGADO",
                    "MASTIL INR 2W MG_M2",
                    "MASTIL INR 3F MG_M2",
                    "MASTIL INR MG_M2",
                    "MASTIL MDL 3F MG_M2",
                    "MASTIL MDL MG_M2",
                    "MASTIL OTR 2W MG_M2",
                    "MASTIL OTR 3F MG_M2",
                    "MASTIL OTR MG_M2",
                    "NO HAY PIEZA CARGADA",
                    "PALLET",
                    "SOPORTE CADENAS MASTIL",
                    "VIGA MASTIL",
                    "XL COMPACT",
                ]
                print(f"[ROBOFLOW] Using fallback classes ({len(known_classes)} clases)")
                print(f"[ROBOFLOW] ⚠ Si faltan clases, añádelas manualmente o verifica la conexión a Roboflow")
                self._json_response({"ok": True, "classes": known_classes, "source": "fallback", "project": project_slug})

            except Exception as e:
                print(f"[ROBOFLOW CLASSES ERROR] {e}")
                self._json_response({"ok": False, "error": str(e)})

        # ── /api/save-calibration-image
        elif path == "/api/save-calibration-image":
            print(f"[CAL SAVE] Endpoint hit, body length: {len(body)}")
            try:
                import base64
                from datetime import datetime
                cal_body = json.loads(body)
                img_data = cal_body.get("image", "")  # base64 data URL
                save_dir = cal_body.get("directory", "")
                mm_per_px = cal_body.get("mmPerPx", 0)
                print(f"[CAL SAVE] img_data length: {len(img_data)}, save_dir: {save_dir}, mmPerPx: {mm_per_px}")

                if not img_data or not save_dir:
                    self._json_response({"ok": False, "error": "Missing image or directory"})
                    return

                # Strip data URL prefix
                if "," in img_data:
                    img_data = img_data.split(",", 1)[1]

                img_bytes = base64.b64decode(img_data)
                os.makedirs(save_dir, exist_ok=True)

                ts = datetime.now().strftime("%Y%m%d_%H%M%S")
                custom_fn = cal_body.get("filename", "")
                if custom_fn:
                    filename = custom_fn
                else:
                    filename = f"calibracion_{ts}_{mm_per_px:.4f}mmppx.png"
                filepath = os.path.join(save_dir, filename)

                with open(filepath, "wb") as f:
                    f.write(img_bytes)

                print(f"[CAL] Imagen guardada: {filepath}")
                self._json_response({"ok": True, "path": filepath, "filename": filename})

            except Exception as e:
                print(f"[CAL ERROR] {e}")
                self._json_response({"ok": False, "error": str(e)})

        # ── /api/sam3/detect — SAM 3 Concept Segmentation on uploaded image
        elif path == "/api/sam3/detect":
            import traceback
            try:
                b64_str = params.get("image", "")
                concepts = params.get("concepts", ["person", "forklift"])
                conf_threshold = float(params.get("confidence", 0.3))
                do_remove = params.get("remove", False)
                inpaint_radius = int(params.get("inpaint_radius", 5))

                if not b64_str:
                    self._json_response({"ok": False, "error": "No image provided"})
                    return

                # Decodificar imagen
                raw_b64 = b64_str.split(",")[1] if "," in b64_str else b64_str
                img_data = base64.b64decode(raw_b64)
                nparr = np.frombuffer(img_data, np.uint8)
                img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                img_h, img_w = img_cv.shape[:2]

                # Guardar temp file (Roboflow SDK necesita path de archivo)
                import tempfile
                temp_path = os.path.join(tempfile.gettempdir(), "sam3_frame.jpg")
                cv2.imwrite(temp_path, img_cv, [cv2.IMWRITE_JPEG_QUALITY, 80])

                # Conectar con Roboflow — TRANSPARENTE
                concepts_list = concepts if isinstance(concepts, list) else [concepts]
                raw_result = _run_sam3_detection(temp_path, class_names=concepts_list)

                try:
                    os.remove(temp_path)
                except:
                    pass

                # Extraer predicciones (confianza la gestiona Roboflow)
                detections = _parse_sam3_result(raw_result)

                output_image = None

                # ── INPAINTING: Remove detected objects from image ──
                cleaned_image_b64 = None
                if do_remove and len(detections) > 0:
                    mask = np.zeros((img_h, img_w), dtype=np.uint8)
                    for det in detections:
                        # Use segmentation polygon if available
                        if "points" in det and isinstance(det["points"], list) and len(det["points"]) >= 3:
                            poly_pts = []
                            for pt in det["points"]:
                                px = int(pt.get("x", 0))
                                py = int(pt.get("y", 0))
                                poly_pts.append([px, py])
                            poly_arr = np.array(poly_pts, np.int32)
                            cv2.fillPoly(mask, [poly_arr], 255)
                        else:
                            # Fallback: use bounding box
                            cx = det.get("x", 0)
                            cy = det.get("y", 0)
                            w = det.get("width", 0)
                            h = det.get("height", 0)
                            x1 = int(cx - w / 2)
                            y1 = int(cy - h / 2)
                            x2 = int(cx + w / 2)
                            y2 = int(cy + h / 2)
                            # Clamp to image bounds
                            x1 = max(0, x1)
                            y1 = max(0, y1)
                            x2 = min(img_w, x2)
                            y2 = min(img_h, y2)
                            cv2.rectangle(mask, (x1, y1), (x2, y2), 255, -1)

                    # Dilate mask slightly for better inpainting edges
                    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (inpaint_radius * 2 + 1, inpaint_radius * 2 + 1))
                    mask = cv2.dilate(mask, kernel, iterations=1)

                    # Inpaint using Telea algorithm (fast & good quality)
                    cleaned = cv2.inpaint(img_cv, mask, inpaintRadius=inpaint_radius, flags=cv2.INPAINT_TELEA)

                    # Encode cleaned image as base64 JPEG
                    ret, buf = cv2.imencode('.jpg', cleaned, [cv2.IMWRITE_JPEG_QUALITY, 92])
                    if ret:
                        cleaned_image_b64 = "data:image/jpeg;base64," + base64.b64encode(buf).decode("utf-8")

                    print(f"[SAM3] Inpainting complete: {len(detections)} objects removed")

                print(f"[SAM3] {len(detections)} detections (concepts: {concepts}) | removed: {do_remove}")

                response_data = {
                    "ok": True,
                    "detections": detections,
                    "output_image": output_image,
                    "predictions": detections,
                    "image_width": img_w,
                    "image_height": img_h,
                    "summary": f"SAM 3: Found {len(detections)} objects for concepts: {concepts}"
                }
                if cleaned_image_b64:
                    response_data["cleaned_image"] = cleaned_image_b64
                    response_data["persons_removed"] = len(detections)

                self._json_response(response_data)

            except Exception as e:
                print(f"[SAM3 ERROR] {e}")
                print(traceback.format_exc())
                self._json_response({"ok": False, "error": str(e)})

        # ── /api/sam3/remove — SAM 3 detect + remove persons (shortcut)
        elif path == "/api/sam3/remove":
            import traceback
            try:
                b64_str = params.get("image", "")
                concepts = params.get("concepts", ["person"])
                conf_threshold = float(params.get("confidence", 0.3))
                inpaint_radius = int(params.get("inpaint_radius", 5))
                inpaint_method = params.get("method", "telea")  # "telea" or "ns" (Navier-Stokes)

                if not b64_str:
                    self._json_response({"ok": False, "error": "No image provided"})
                    return

                if "," in b64_str:
                    b64_str = b64_str.split(",")[1]

                img_data = base64.b64decode(b64_str)
                nparr = np.frombuffer(img_data, np.uint8)
                img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                img_h, img_w = img_cv.shape[:2]

                temp_path = "temp_sam3_remove.jpg"
                cv2.imwrite(temp_path, img_cv)

                print(f"[SAM3 REMOVE] Running SAM3 detection, method={inpaint_method}")

                concepts_list = concepts if isinstance(concepts, list) else [concepts]
                raw = _run_sam3_detection(temp_path, class_names=concepts_list)
                detections = _parse_sam3_result(raw, confidence=conf_threshold)

                if os.path.exists(temp_path):
                    os.remove(temp_path)

                if len(detections) == 0:
                    # No persons found → return original image
                    ret, buf = cv2.imencode('.jpg', img_cv, [cv2.IMWRITE_JPEG_QUALITY, 92])
                    orig_b64 = "data:image/jpeg;base64," + base64.b64encode(buf).decode("utf-8") if ret else None
                    self._json_response({
                        "ok": True,
                        "cleaned_image": orig_b64,
                        "persons_found": 0,
                        "persons_removed": 0,
                        "image_width": img_w,
                        "image_height": img_h,
                        "summary": "No persons detected — original image returned."
                    })
                    return

                # Build inpainting mask from SAM 3 segmentation
                mask = np.zeros((img_h, img_w), dtype=np.uint8)
                for det in detections:
                    # Prefer segmentation polygon for precise masks
                    if "points" in det and isinstance(det["points"], list) and len(det["points"]) >= 3:
                        poly_pts = []
                        for pt in det["points"]:
                            px = int(pt.get("x", 0))
                            py = int(pt.get("y", 0))
                            poly_pts.append([px, py])
                        poly_arr = np.array(poly_pts, np.int32)
                        cv2.fillPoly(mask, [poly_arr], 255)
                    else:
                        # Fallback: bounding box
                        cx = float(det.get("x", 0))
                        cy = float(det.get("y", 0))
                        w = float(det.get("width", 0))
                        h = float(det.get("height", 0))
                        x1 = max(0, int(cx - w / 2))
                        y1 = max(0, int(cy - h / 2))
                        x2 = min(img_w, int(cx + w / 2))
                        y2 = min(img_h, int(cy + h / 2))
                        cv2.rectangle(mask, (x1, y1), (x2, y2), 255, -1)

                # Dilate mask for smooth edges
                kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (inpaint_radius * 2 + 1, inpaint_radius * 2 + 1))
                mask = cv2.dilate(mask, kernel, iterations=2)

                # Apply inpainting
                flag = cv2.INPAINT_TELEA if inpaint_method == "telea" else cv2.INPAINT_NS
                cleaned = cv2.inpaint(img_cv, mask, inpaintRadius=inpaint_radius, flags=flag)

                # Encode result
                ret, buf = cv2.imencode('.jpg', cleaned, [cv2.IMWRITE_JPEG_QUALITY, 92])
                cleaned_b64 = "data:image/jpeg;base64," + base64.b64encode(buf).decode("utf-8") if ret else None

                # Also encode mask for visualization
                ret2, buf2 = cv2.imencode('.png', mask)
                mask_b64 = "data:image/png;base64," + base64.b64encode(buf2).decode("utf-8") if ret2 else None

                print(f"[SAM3 REMOVE] {len(detections)} persons removed via {inpaint_method} inpainting")

                self._json_response({
                    "ok": True,
                    "cleaned_image": cleaned_b64,
                    "mask_image": mask_b64,
                    "persons_found": len(detections),
                    "persons_removed": len(detections),
                    "image_width": img_w,
                    "image_height": img_h,
                    "summary": f"SAM 3: Removed {len(detections)} person(s) from image"
                })

            except Exception as e:
                print(f"[SAM3 REMOVE ERROR] {e}")
                print(traceback.format_exc())
                self._json_response({"ok": False, "error": str(e)})

        # ── /api/sam3/remove-live — SAM 3 detect + remove persons from live camera
        elif path == "/api/sam3/remove-live":
            import traceback
            try:
                concepts = params.get("concepts", ["person"])
                conf_threshold = float(params.get("confidence", 0.3))
                inpaint_radius = int(params.get("inpaint_radius", 5))
                inpaint_method = params.get("method", "telea")

                with frame_lock:
                    frame = current_frame.copy() if current_frame is not None else None

                if frame is None:
                    self._json_response({"ok": False, "error": "No hay frame de cámara disponible"})
                    return

                # Convert grayscale (Mono8) to BGR — SAM 3 & inpainting need 3 channels
                if len(frame.shape) == 2 or (len(frame.shape) == 3 and frame.shape[2] == 1):
                    frame = cv2.cvtColor(frame, cv2.COLOR_GRAY2BGR)
                    print("[SAM3 REMOVE LIVE] Converted mono frame to BGR")

                img_h, img_w = frame.shape[:2]

                # Save frame temporarily for Roboflow workflow
                import tempfile
                temp_path = os.path.join(tempfile.gettempdir(), "_sam3_live_frame.jpg")
                cv2.imwrite(temp_path, frame, [cv2.IMWRITE_JPEG_QUALITY, 80])

                print(f"[SAM3 REMOVE LIVE] Frame: {img_w}x{img_h}")

                # ── Use SAM3 foundation model for person detection ──
                concepts_list = concepts if isinstance(concepts, list) else [concepts]
                raw = _run_sam3_detection(temp_path, class_names=concepts_list)
                detections = _parse_sam3_result(raw, confidence=conf_threshold)

                # Cleanup temp file
                try:
                    if os.path.exists(temp_path):
                        os.remove(temp_path)
                except:
                    pass

                print(f"[SAM3 REMOVE LIVE] SAM3: {len(detections)} person(s) detected")

                if len(detections) == 0:
                    ret, buf = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 92])
                    orig_b64 = "data:image/jpeg;base64," + base64.b64encode(buf).decode("utf-8") if ret else None
                    self._json_response({
                        "ok": True, "cleaned_image": orig_b64,
                        "persons_found": 0, "persons_removed": 0,
                        "image_width": img_w, "image_height": img_h,
                        "summary": "No persons detected in live frame."
                    })
                    return

                # Build inpainting mask from bounding boxes
                mask = np.zeros((img_h, img_w), dtype=np.uint8)
                for det in detections:
                    if "points" in det and isinstance(det["points"], list) and len(det["points"]) >= 3:
                        poly_pts = [[int(pt.get("x", 0)), int(pt.get("y", 0))] for pt in det["points"]]
                        cv2.fillPoly(mask, [np.array(poly_pts, np.int32)], 255)
                    else:
                        cx, cy = float(det.get("x", 0)), float(det.get("y", 0))
                        w, h = float(det.get("width", 0)), float(det.get("height", 0))
                        x1, y1 = max(0, int(cx - w/2)), max(0, int(cy - h/2))
                        x2, y2 = min(img_w, int(cx + w/2)), min(img_h, int(cy + h/2))
                        cv2.rectangle(mask, (x1, y1), (x2, y2), 255, -1)

                kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (inpaint_radius*2+1, inpaint_radius*2+1))
                mask = cv2.dilate(mask, kernel, iterations=2)

                flag = cv2.INPAINT_TELEA if inpaint_method == "telea" else cv2.INPAINT_NS
                cleaned = cv2.inpaint(frame, mask, inpaintRadius=inpaint_radius, flags=flag)

                ret, buf = cv2.imencode('.jpg', cleaned, [cv2.IMWRITE_JPEG_QUALITY, 92])
                cleaned_b64 = "data:image/jpeg;base64," + base64.b64encode(buf).decode("utf-8") if ret else None

                print(f"[SAM3 REMOVE LIVE] ✔ {len(detections)} persons removed via {inpaint_method}")

                self._json_response({
                    "ok": True, "cleaned_image": cleaned_b64,
                    "persons_found": len(detections), "persons_removed": len(detections),
                    "image_width": img_w, "image_height": img_h,
                    "summary": f"SAM 3 Live: Removed {len(detections)} person(s)"
                })

            except Exception as e:
                print(f"[SAM3 LIVE ERROR] {e}")
                print(traceback.format_exc())
                self._json_response({"ok": False, "error": str(e)})

        # ── /api/sam3/live-toggle — activar/desactivar eliminación en vivo
        elif path == "/api/sam3/live-toggle":
            action = params.get("action", "toggle")  # start | stop | toggle
            with person_removal_lock:
                is_active = person_removal_state["active"]

            if action == "start" or (action == "toggle" and not is_active):
                fill_color = params.get("fill_color", [255, 255, 255])
                confidence = float(params.get("confidence", 0.3))
                use_inpaint = bool(params.get("inpaint", False))
                result = start_person_removal(fill_color=fill_color, confidence=confidence, use_inpaint=use_inpaint)
                result["active"] = True
                self._json_response(result)
            elif action == "stop" or (action == "toggle" and is_active):
                result = stop_person_removal()
                result["active"] = False
                self._json_response(result)
            else:
                self._json_response({"ok": False, "error": f"Acción no válida: {action}"})

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

    server = ThreadingHTTPServer(("0.0.0.0", PORT), CameraHandler)
    print(f"\n[INFO] Servidor escuchando en puerto {PORT}...")
    print("[INFO] Presiona Ctrl+C para detener.")
    print("[INFO] Conecta la cámara desde la interfaz web.\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[INFO] Servidor detenido.")
        disconnect_camera()
        server.server_close()

