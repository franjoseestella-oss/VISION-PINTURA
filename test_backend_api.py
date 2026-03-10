import requests
import base64
import numpy as np
import cv2
import json

def test_api():
    url = "http://localhost:8765/api/measure/roboflow"
    img = np.zeros((400, 400, 3), dtype=np.uint8)
    _, buffer = cv2.imencode('.jpg', img)
    b64 = base64.b64encode(buffer).decode('utf-8')
    
    payload = {"image": b64}
    try:
        r = requests.post(url, json=payload, timeout=30)
        print("Status Code:", r.status_code)
        print("JSON Response:", r.json())
    except Exception as e:
        print("API NOT ACCESSIBLE (Server probably not running):", e)

test_api()
