"""
face_service.py — Servicio de Reconocimiento Facial y Detección de Vida (Liveness)
====================================================================================
Módulo independiente que gestiona:
  - Registro biométrico (liveness via parpadeos + captura facial)
  - Reconocimiento facial contra base de datos local
  - API de estado para el frontend React

Dependencias adicionales:
  pip install face_recognition mediapipe

Base de datos local (relativa al proyecto):
  DataBase/
    Users/   → {username}.json  (info del usuario)
    Faces/   → {username}.png   (imagen facial recortada)
"""

import os
import json
import math
import time
import threading
import base64
import traceback
from pathlib import Path

import cv2
import numpy as np

# ── Intentar importar dependencias opcionales ──────────────────────────────────
try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    print("[FACE] mediapipe no instalado — pip install mediapipe")

try:
    import face_recognition as fr
    FACE_RECOGNITION_AVAILABLE = True
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False
    print("[FACE] face_recognition no instalado — pip install face_recognition")

# ── Rutas de la base de datos ─────────────────────────────────────────────────
_BASE_DIR = Path(__file__).parent
DB_USERS  = _BASE_DIR / "DataBase" / "Users"
DB_FACES  = _BASE_DIR / "DataBase" / "Faces"

for _d in (DB_USERS, DB_FACES):
    _d.mkdir(parents=True, exist_ok=True)

# ══════════════════════════════════════════════════════════════════════════════
#  Estado global de la sesión de registro
# ══════════════════════════════════════════════════════════════════════════════
_reg_lock = threading.Lock()
_reg_state = {
    "active":    False,       # sesión activa
    "step":      0,           # 0 = detectando parpadeos, 1 = captura OK
    "blinks":    0,           # parpadeos detectados
    "username":  "",          # usuario que se está registrando
    "fullname":  "",
    "last_frame_b64": None,   # último frame procesado (para streaming)
    "status_msg": "Listo",
    "error":     "",
    "done":      False,       # registro completado
}

_auth_lock = threading.Lock()
_auth_state = {
    "active":    False,
    "step":      0,
    "blinks":    0,
    "last_frame_b64": None,
    "status_msg": "Listo",
    "matched_user": None,
    "error":     "",
    "done":      False,
}

# Cámara compartida con camera_server (se inyecta desde fuera)
_get_frame_fn = None   # callable() → numpy BGR frame | None

def set_frame_provider(fn):
    """Inyecta la función que devuelve el frame actual de la cámara."""
    global _get_frame_fn
    _get_frame_fn = fn

def _current_frame():
    if _get_frame_fn:
        return _get_frame_fn()
    return None

# ══════════════════════════════════════════════════════════════════════════════
#  Mediapipe helpers (singleton, cargados una vez)
# ══════════════════════════════════════════════════════════════════════════════
_mp_face_mesh     = None
_mp_face_detect   = None
_mp_draw          = None

def _get_mp_objects():
    global _mp_face_mesh, _mp_face_detect, _mp_draw
    if not MEDIAPIPE_AVAILABLE:
        return None, None, None
    if _mp_face_mesh is None:
        mp_lib = mp.solutions
        _mp_draw = mp_lib.drawing_utils
        _mp_face_mesh   = mp_lib.face_mesh.FaceMesh(max_num_faces=1, refine_landmarks=False)
        _mp_face_detect = mp_lib.face_detection.FaceDetection(min_detection_confidence=0.5, model_selection=1)
    return _mp_face_mesh, _mp_face_detect, _mp_draw

# ══════════════════════════════════════════════════════════════════════════════
#  Parámetros de liveness
# ══════════════════════════════════════════════════════════════════════════════
BLINKS_REQUIRED  = 3     # parpadeos necesarios para validar liveness
EYE_CLOSED_TH    = 10    # distancia (px) para considerar ojo cerrado
EYE_OPEN_TH      = 14    # distancia (px) para considerar ojo abierto
OFFSET_X_PCT     = 20    # % expansión horizontal del bbox facial
OFFSET_Y_PCT     = 30    # % expansión vertical del bbox facial
CONF_THRESHOLD   = 0.5   # confianza mínima FaceDetection

# ══════════════════════════════════════════════════════════════════════════════
#  Funciones auxiliares
# ══════════════════════════════════════════════════════════════════════════════

def _encode_face_images(image_list):
    """Calcula encodings de face_recognition para una lista de imágenes BGR."""
    encodings = []
    for img in image_list:
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encs = fr.face_encodings(rgb)
        if encs:
            encodings.append(encs[0])
    return encodings


def _frame_to_b64(frame) -> str | None:
    """Convierte un frame BGR a data URL base64 JPEG."""
    if frame is None:
        return None
    display = cv2.resize(frame, (960, 540)) if frame.shape[1] > 960 else frame
    ret, buf = cv2.imencode('.jpg', display, [cv2.IMWRITE_JPEG_QUALITY, 80])
    if ret:
        return "data:image/jpeg;base64," + base64.b64encode(buf).decode('utf-8')
    return None

def draw_face_mesh_on_frame(frame):
    """
    Dibuja el mallazo de Face Mesh sobre un frame estático de forma segura,
    sin inicializar un ciclo independiente. 
    """
    fm, _, draw = _get_mp_objects()
    if not fm or frame is None:
        return frame
        
    # Copia del frame para evitar modificar la referencia global inmediatamente
    display = frame.copy()
    
    # Aseguramos que es BGR
    if len(display.shape) == 2 or (len(display.shape) == 3 and display.shape[2] == 1):
        display = cv2.cvtColor(display, cv2.COLOR_GRAY2BGR)

    rgb = cv2.cvtColor(display, cv2.COLOR_BGR2RGB)
    res = fm.process(rgb)

    if res.multi_face_landmarks:
        for rostro in res.multi_face_landmarks:
            draw.draw_landmarks(
                image=display,
                landmark_list=rostro,
                connections=mp.solutions.face_mesh.FACEMESH_TESSELATION,
                landmark_drawing_spec=None,
                connection_drawing_spec=draw.DrawingSpec(color=(255, 255, 0), thickness=1, circle_radius=1)
            )
            
    return display

# ══════════════════════════════════════════════════════════════════════════════

def _expand_bbox(bbox, img_w, img_h):
    """Expande el bounding box relativo de Mediapipe con márgenes configurados."""
    xi = int(bbox.xmin * img_w)
    yi = int(bbox.ymin * img_h)
    an = int(bbox.width  * img_w)
    al = int(bbox.height * img_h)

    # Expansión
    off_x = int((OFFSET_X_PCT / 100) * an)
    off_y = int((OFFSET_Y_PCT / 100) * al)
    xi = max(0, xi - off_x // 2)
    yi = max(0, yi - off_y)
    an = min(img_w - xi, an + off_x)
    al = min(img_h - yi, al + off_y)
    xf, yf = xi + an, yi + al
    return xi, yi, xf, yf


def _draw_status_overlay(frame, msg, blinks, step, color=(255, 200, 0)):
    """Dibuja texto de estado en el frame."""
    h, w = frame.shape[:2]
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, h - 60), (w, h), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.5, frame, 0.5, 0, frame)

    cv2.putText(frame, msg,
                (10, h - 35), cv2.FONT_HERSHEY_SIMPLEX, 0.55, color, 1, cv2.LINE_AA)
    cv2.putText(frame, f"Parpadeos: {blinks}/{BLINKS_REQUIRED}  |  Paso: {step + 1}/2",
                (10, h - 12), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (180, 180, 180), 1, cv2.LINE_AA)


# ══════════════════════════════════════════════════════════════════════════════
#  REGISTRO BIOMÉTRICO
# ══════════════════════════════════════════════════════════════════════════════

_reg_thread  = None
_reg_parpadeo = False


def start_registration(username: str, fullname: str) -> dict:
    """Inicia la sesión de registro biométrico."""
    global _reg_thread, _reg_parpadeo

    if not MEDIAPIPE_AVAILABLE:
        return {"ok": False, "error": "mediapipe no instalado (pip install mediapipe)"}

    # Validaciones
    username = username.strip().lower()
    if not username:
        return {"ok": False, "error": "Nombre de usuario vacío"}

    user_file = DB_USERS / f"{username}.json"
    if user_file.exists():
        return {"ok": False, "error": f"Usuario '{username}' ya registrado. Eliminalo primero."}

    with _reg_lock:
        if _reg_state["active"]:
            return {"ok": False, "error": "Ya hay una sesión de registro activa"}
        _reg_state.update({
            "active": True, "step": 0, "blinks": 0,
            "username": username, "fullname": fullname,
            "last_frame_b64": None, "status_msg": "Mira a la cámara y parpadea",
            "error": "", "done": False,
        })

    _reg_parpadeo = False
    _reg_thread = threading.Thread(target=_registration_loop, daemon=True)
    _reg_thread.start()
    return {"ok": True}


def stop_registration() -> dict:
    """Cancela la sesión de registro en curso."""
    with _reg_lock:
        _reg_state["active"] = False
        _reg_state["done"]   = True
        _reg_state["status_msg"] = "Cancelado"
    return {"ok": True}


def get_registration_status() -> dict:
    with _reg_lock:
        return dict(_reg_state)


def _registration_loop():
    """Hilo principal del proceso de registro biométrico."""
    global _reg_parpadeo

    try:
        face_mesh, face_detect, mp_draw = _get_mp_objects()
        if face_mesh is None:
            with _reg_lock:
                _reg_state["error"]  = "Mediapipe no disponible"
                _reg_state["active"] = False
            return

        print("[FACE REG] Hilo de registro iniciado")
        step       = 0
        blinks     = 0
        parpadeo   = False
        frame_save = None

        while True:
            with _reg_lock:
                if not _reg_state["active"]:
                    break

            frame = _current_frame()
            if frame is None:
                time.sleep(0.05)
                continue

            # Convertir si es mono
            if len(frame.shape) == 2 or (len(frame.shape) == 3 and frame.shape[2] == 1):
                frame = cv2.cvtColor(frame, cv2.COLOR_GRAY2BGR)

            frame_save = frame.copy()
            display    = frame.copy()
            rgb        = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            h, w = frame.shape[:2]
            res  = face_mesh.process(rgb)

            if res.multi_face_landmarks:
                for rostro in res.multi_face_landmarks:
                    # Dibujar el "mallazo" (Face Mesh) en el rostro
                    mp_draw.draw_landmarks(
                        image=display,
                        landmark_list=rostro,
                        connections=mp.solutions.face_mesh.FACEMESH_TESSELATION,
                        landmark_drawing_spec=None,
                        connection_drawing_spec=mp_draw.DrawingSpec(color=(255, 255, 0), thickness=1, circle_radius=1)
                    )

                    landmarks = []
                    for lm in rostro.landmark:
                        landmarks.append((int(lm.x * w), int(lm.y * h)))

                    if len(landmarks) < 468:
                        continue

                    # Puntos oculares clave
                    x1, y1 = landmarks[145]
                    x2, y2 = landmarks[159]
                    longitud_ojo_d = math.hypot(x2 - x1, y2 - y1)

                    x3, y3 = landmarks[374]
                    x4, y4 = landmarks[386]
                    longitud_ojo_i = math.hypot(x4 - x3, y4 - y3)

                    # Parietales y cejas para verificar orientación frontal
                    x5, _ = landmarks[139]   # parietal derecho
                    x6, _ = landmarks[368]   # parietal izquierdo
                    x7, _ = landmarks[70]    # ceja derecha
                    x8, _ = landmarks[300]   # ceja izquierda

                    # Detección de cara para bbox
                    face_results = face_detect.process(rgb)
                    xi, yi, xf, yf = 0, 0, w, h  # fallback

                    if face_results.detections:
                        for det in face_results.detections:
                            score = det.score[0] if det.score else 0
                            if score > CONF_THRESHOLD:
                                xi, yi, xf, yf = _expand_bbox(
                                    det.location_data.relative_bounding_box, w, h)

                    # Orientación frontal: cejas dentro de parietales
                    frontal = (x7 > x5) and (x8 < x6)

                    if step == 0:
                        # ── Paso 0: contar parpadeos para liveness ──
                        cv2.rectangle(display, (xi, yi), (xf, yf), (255, 0, 255), 2)

                        if frontal:
                            ojos_cerrados = (longitud_ojo_d <= EYE_CLOSED_TH and
                                             longitud_ojo_i <= EYE_CLOSED_TH)
                            ojos_abiertos = (longitud_ojo_d > EYE_OPEN_TH and
                                             longitud_ojo_i > EYE_OPEN_TH)

                            if ojos_cerrados and not parpadeo:
                                blinks  += 1
                                parpadeo = True
                            elif ojos_abiertos and parpadeo:
                                parpadeo = False

                            if blinks >= BLINKS_REQUIRED and ojos_abiertos:
                                # ¡Liveness OK! → capturar rostro
                                face_crop = frame_save[yi:yf, xi:xf]
                                if face_crop.size > 0:
                                    face_path = DB_FACES / f"{_reg_state['username']}.png"
                                    cv2.imwrite(str(face_path), face_crop)
                                    step = 1

                        _draw_status_overlay(display,
                            "Mira a la cámara y parpadea naturalmente" if frontal
                            else "Centra tu cara en el encuadre",
                            blinks, step, (0, 220, 255))

                    elif step == 1:
                        # ── Paso 1: registro guardado ──
                        cv2.rectangle(display, (xi, yi), (xf, yf), (0, 255, 80), 2)
                        _draw_status_overlay(display, "✓ Registro completado", blinks, step, (0, 255, 80))

                        # Guardar info del usuario
                        user_data = {
                            "username": _reg_state["username"],
                            "fullname": _reg_state["fullname"],
                            "registered_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
                            "face_image":  str(DB_FACES / f"{_reg_state['username']}.png"),
                        }
                        user_file = DB_USERS / f"{_reg_state['username']}.json"
                        user_file.write_text(json.dumps(user_data, indent=2, ensure_ascii=False))
                        print(f"[FACE REG] Usuario '{_reg_state['username']}' registrado OK")

                        with _reg_lock:
                            _reg_state["step"]       = step
                            _reg_state["blinks"]     = blinks
                            _reg_state["last_frame_b64"] = _frame_to_b64(display)
                            _reg_state["status_msg"] = "✓ Registro completado"
                            _reg_state["done"]       = True
                            _reg_state["active"]     = False
                        return

            else:
                _draw_status_overlay(display, "No se detecta cara", blinks, step, (100, 100, 255))

            with _reg_lock:
                _reg_state["step"]       = step
                _reg_state["blinks"]     = blinks
                _reg_state["last_frame_b64"] = _frame_to_b64(display)
                _reg_state["status_msg"] = (
                    f"Parpadeos: {blinks}/{BLINKS_REQUIRED}"
                    if step == 0 else "Guardando..."
                )

            time.sleep(0.04)  # ~25 fps
    except Exception as e:
        print(f"[FACE REG] Error en hilo de registro: {e}")
        traceback.print_exc()
        with _reg_lock:
            _reg_state["error"] = f"Error interno: {e}"
            _reg_state["status_msg"] = "Error"
    finally:
        with _reg_lock:
            _reg_state["active"] = False
    print("[FACE REG] Hilo de registro terminado")


# ══════════════════════════════════════════════════════════════════════════════
#  GESTIÓN DE USUARIOS
# ══════════════════════════════════════════════════════════════════════════════

def list_users() -> list:
    """Devuelve lista de usuarios registrados."""
    users = []
    for f in DB_USERS.glob("*.json"):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            face_img = DB_FACES / f"{data['username']}.png"
            data["has_face"] = face_img.exists()
            users.append(data)
        except Exception:
            pass
    return sorted(users, key=lambda u: u.get("registered_at", ""))


def delete_user(username: str) -> dict:
    """Elimina un usuario de la base de datos."""
    username = username.strip().lower()
    user_file = DB_USERS / f"{username}.json"
    face_file = DB_FACES / f"{username}.png"
    removed  = []

    if user_file.exists():
        user_file.unlink()
        removed.append("perfil")
    if face_file.exists():
        face_file.unlink()
        removed.append("imagen facial")

    if removed:
        return {"ok": True, "removed": removed}
    return {"ok": False, "error": f"Usuario '{username}' no encontrado"}


def get_user_face_b64(username: str) -> str | None:
    """Devuelve la imagen facial del usuario como data URL base64."""
    face_file = DB_FACES / f"{username}.png"
    if not face_file.exists():
        return None
    data  = face_file.read_bytes()
    return "data:image/png;base64," + base64.b64encode(data).decode()


# ══════════════════════════════════════════════════════════════════════════════
#  RECONOCIMIENTO FACIAL (autenticación)
# ══════════════════════════════════════════════════════════════════════════════

def verify_face_from_frame() -> dict:
    """
    Captura el frame actual y lo compara contra la BD de rostros.
    Devuelve el usuario reconocido o error.
    Requiere face_recognition instalado.
    """
    if not FACE_RECOGNITION_AVAILABLE:
        return {"ok": False, "error": "face_recognition no instalado (pip install face_recognition)"}

    frame = _current_frame()
    if frame is None:
        return {"ok": False, "error": "Sin frame de cámara disponible"}

    if len(frame.shape) == 2:
        frame = cv2.cvtColor(frame, cv2.COLOR_GRAY2BGR)

    users = list_users()
    if not users:
        return {"ok": False, "error": "No hay usuarios registrados"}

    images    = []
    names     = []
    for u in users:
        face_path = DB_FACES / f"{u['username']}.png"
        if face_path.exists():
            img = cv2.imread(str(face_path))
            if img is not None:
                images.append(img)
                names.append(u["username"])

    if not images:
        return {"ok": False, "error": "No hay imágenes faciales en la BD"}

    # Cargar encodings de BD
    db_encodings = _encode_face_images(images)

    # Reducir frame para velocidad
    small = cv2.resize(frame, (0, 0), None, 0.25, 0.25)
    rgb   = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)

    locations = fr.face_locations(rgb)
    encodings = fr.face_encodings(rgb, locations)

    for enc, loc in zip(encodings, locations):
        matches   = fr.compare_faces(db_encodings, enc, tolerance=0.5)
        distances = fr.face_distance(db_encodings, enc)
        best_idx  = int(np.argmin(distances))

        if matches[best_idx]:
            username = names[best_idx]
            user_info = next((u for u in users if u["username"] == username), {})
            return {
                "ok":       True,
                "username": username,
                "fullname": user_info.get("fullname", username),
                "distance": float(distances[best_idx]),
            }

    return {"ok": False, "error": "Rostro no reconocido"}
