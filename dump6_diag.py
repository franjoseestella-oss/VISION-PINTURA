"""
Diagnóstico: inspecciona exactamente qué devuelve el output_image con la imagen real del usuario.
"""
import json, base64, os, sys
import numpy as np
import cv2
from inference_sdk import InferenceHTTPClient

# Busca una imagen real en el directorio actual
test_imgs = [f for f in os.listdir('.') if f.lower().endswith(('.jpg', '.jpeg', '.png')) and 'temp' not in f.lower()]
if test_imgs:
    img_path = test_imgs[0]
    print(f"Usando imagen real: {img_path}")
else:
    # Crea una imagen gris oscuro (más parecida a las de la cámara)
    img = np.ones((480, 640, 3), dtype=np.uint8) * 40
    img_path = 'test_cam.jpg'
    cv2.imwrite(img_path, img)
    print(f"Creada imagen de test: {img_path}")

client = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key="K6YHioHqtuwbsNmR2n7O"
)

res = client.run_workflow(
    workspace_name='welding-hqci3',
    workflow_id='detect-count-and-visualize-2',
    images={'image': img_path},
    use_cache=False
)

def make_serializable(obj):
    if isinstance(obj, dict):
        return {k: make_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [make_serializable(v) for v in obj]
    elif hasattr(obj, "tolist"):
        return obj.tolist()
    elif hasattr(obj, "__dict__"):
        return make_serializable(obj.__dict__)
    else:
        return obj

result = make_serializable(res)
r0 = result[0] if isinstance(result, list) else result

print("\n=== CLAVES EN result[0] ===")
print(list(r0.keys()))

print("\n=== output_image ===")
oi = r0.get('output_image', None)
if oi is None:
    print("NO EXISTE output_image")
elif isinstance(oi, str):
    print(f"STRING - primeros 60 chars: {oi[:60]}")
    print(f"Longitud total: {len(oi)}")
    print(f"Empieza con 'data:': {oi.startswith('data:')}")
    print(f"Empieza con '/9j': {oi.startswith('/9j')} (indica JPEG base64 puro)")
    # Intentar decodificar y guardar
    try:
        raw = base64.b64decode(oi)
        with open('roboflow_output.jpg', 'wb') as f:
            f.write(raw)
        print("-> Decodificado y guardado como roboflow_output.jpg")
    except Exception as e:
        print(f"Error decodificando: {e}")
elif isinstance(oi, dict):
    print(f"DICT con claves: {list(oi.keys())}")
    for k, v in oi.items():
        if isinstance(v, str) and len(v) > 20:
            print(f"  {k}: <string len={len(v)}, inicio={v[:30]}>")
        else:
            print(f"  {k}: {v}")
else:
    print(f"TIPO DESCONOCIDO: {type(oi)}")

print("\n=== PREDICCIONES ===")
preds_container = r0.get('predictions', {})
if isinstance(preds_container, dict):
    preds = preds_container.get('predictions', [])
    print(f"Total predicciones: {len(preds)}")
    for i, p in enumerate(preds[:5]):
        print(f"  [{i}] class={p.get('class')}, conf={p.get('confidence', 0):.2f}, x={p.get('x')}, y={p.get('y')}, w={p.get('width')}, h={p.get('height')}")
        if 'points' in p:
            print(f"       -> Segmentación: {len(p['points'])} puntos")
elif isinstance(preds_container, list):
    print(f"predictions es lista de {len(preds_container)}")
