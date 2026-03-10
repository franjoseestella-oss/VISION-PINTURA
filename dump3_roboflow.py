import json
from inference_sdk import InferenceHTTPClient
import numpy as np
import cv2

img = np.zeros((400, 400, 3), dtype=np.uint8)
cv2.imwrite('t.jpg', img)

client = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key="K6YHioHqtuwbsNmR2n7O"
)

res = client.run_workflow(
    workspace_name='welding-hqci3',
    workflow_id='detect-count-and-visualize-2',
    images={'image': 't.jpg'},
    use_cache=True
)

try:
    j = json.dumps({"ok": True, "result": res})
    print('JSON ok')
except Exception as e:
    print('JSON ERROR:', e)
