"""
Test rápido: llama al endpoint del backend y verifica que output_image llega correctamente.
"""
import requests, base64, os

# Leer t.jpg que está en el proyecto
with open('t.jpg', 'rb') as f:
    img_bytes = f.read()

b64 = base64.b64encode(img_bytes).decode()
data_url = f"data:image/jpeg;base64,{b64}"

print("Llamando al backend...")
resp = requests.post('http://localhost:8765/api/measure/roboflow', 
                     json={"image": data_url},
                     timeout=30)

data = resp.json()
print(f"ok: {data.get('ok')}")
print(f"error: {data.get('error', 'None')}")

if data.get('ok'):
    result = data.get('result', [])
    r0 = result[0] if isinstance(result, list) else result
    print(f"Claves en result[0]: {list(r0.keys())}")
    
    oi = r0.get('output_image')
    if oi:
        print(f"output_image tipo: {type(oi).__name__}, primeros 30 chars: {str(oi)[:30]}")
        print(f"output_image empieza con 'data:': {str(oi).startswith('data:')}")
    else:
        print("NO HAY output_image")
    
    preds_raw = r0.get('predictions', {})
    if isinstance(preds_raw, dict):
        preds = preds_raw.get('predictions', [])
        print(f"Predicciones: {len(preds)}")
