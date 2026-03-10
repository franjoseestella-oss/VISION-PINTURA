import json
from inference_sdk import InferenceHTTPClient
import numpy as np
import cv2

# Crear imagen en blanco
img = np.zeros((480, 640, 3), dtype=np.uint8)
cv2.imwrite('test_img.jpg', img)

client = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key="K6YHioHqtuwbsNmR2n7O"
)

# Ejecutar el workflow
res = client.run_workflow(
    workspace_name='welding-hqci3',
    workflow_id='detect-count-and-visualize-2',
    images={'image': 'test_img.jpg'},
    use_cache=True
)

# Investigar la estructura de la respuesta
def study_structure(obj, prefix=""):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k == 'output_image' or k == 'visualization':
                print(f"{prefix}{k}: <Base64 string of length {len(str(v))}>")
            elif isinstance(v, (dict, list)):
                print(f"{prefix}{k}:")
                study_structure(v, prefix + "  ")
            else:
                print(f"{prefix}{k}: {v}")
    elif isinstance(obj, list):
        print(f"{prefix}List of {len(obj)} items. First item:")
        if len(obj) > 0:
            study_structure(obj[0], prefix + "  ")

print("--- ROBFLOW RESPONSE STRUCTURE ---")
study_structure(res)
