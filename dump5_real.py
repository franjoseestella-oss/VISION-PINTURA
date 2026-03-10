"""
Script de diagnóstico: Muestra la estructura EXACTA que Roboflow devuelve con una imagen real.
"""
import json, sys, base64, os
import numpy as np
import cv2
from inference_sdk import InferenceHTTPClient

# Crea una imagen de test con algo visible (no negra)
img = np.ones((480, 640, 3), dtype=np.uint8) * 128
# Dibuja un rectángulo
cv2.rectangle(img, (100, 100), (300, 300), (0, 255, 0), -1)
cv2.imwrite('test_real.jpg', img)

client = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key="K6YHioHqtuwbsNmR2n7O"
)

res = client.run_workflow(
    workspace_name='welding-hqci3',
    workflow_id='detect-count-and-visualize-2',
    images={'image': 'test_real.jpg'},
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

def print_structure(obj, prefix="", max_depth=5, depth=0):
    if depth > max_depth: 
        print(f"{prefix}...")
        return
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in ('output_image', 'visualization') and isinstance(v, str):
                print(f"{prefix}{k}: <Base64 len={len(v)}>")
            elif isinstance(v, (dict, list)):
                print(f"{prefix}{k}:")
                print_structure(v, prefix + "  ", max_depth, depth + 1)
            else:
                print(f"{prefix}{k}: {repr(v)}")
    elif isinstance(obj, list):
        print(f"{prefix}[list of {len(obj)}]")
        if len(obj) > 0:
            print_structure(obj[0], prefix + "  ", max_depth, depth + 1)
    else:
        print(f"{prefix}{repr(obj)}")

print("=== ESTRUCTURA COMPLETA ===")
print_structure(result)

# Intentar extraer predicciones manualmente
print("\n=== PREDICCIONES POSIBLES ===")
if isinstance(result, list) and len(result) > 0:
    r = result[0]
    if 'predictions' in r:
        preds_container = r['predictions']
        if isinstance(preds_container, dict) and 'predictions' in preds_container:
            preds = preds_container['predictions']
            print(f"Encontradas {len(preds)} predicciones en result[0].predictions.predictions")
            for i, p in enumerate(preds[:3]):
                print(f"  Pred[{i}]: class={p.get('class')}, conf={p.get('confidence')}, x={p.get('x')}, y={p.get('y')}, w={p.get('width')}, h={p.get('height')}")
                if 'points' in p:
                    print(f"    -> Tiene {len(p['points'])} points de segmentación")
        elif isinstance(preds_container, list):
            print(f"Encontradas {len(preds_container)} predicciones en result[0].predictions (array directo)")
            for i, p in enumerate(preds_container[:3]):
                print(f"  Pred[{i}]: class={p.get('class')}, conf={p.get('confidence')}")

os.remove('test_real.jpg')
