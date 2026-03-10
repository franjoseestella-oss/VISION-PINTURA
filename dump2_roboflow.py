import sys
import base64
from inference_sdk import InferenceHTTPClient
import numpy as np
import cv2

img = np.zeros((400, 400, 3), dtype=np.uint8)
cv2.imwrite('t.jpg', img)

client = InferenceHTTPClient('https://serverless.roboflow.com', 'K6YHioHqtuwbsNmR2n7O')
res = client.run_workflow(workspace_name='welding-hqci3', workflow_id='detect-count-and-visualize-2', images={'image': 't.jpg'}, use_cache=True)

if isinstance(res, list) and len(res) > 0:
    r = res[0]
    if 'output_image' in r:
        if isinstance(r['output_image'], dict):
            print(r['output_image'].keys())
            if 'value' in r['output_image']:
                print('output_image base64 value length:', len(r['output_image']['value']))
        elif isinstance(r['output_image'], str):
            print('output_image is string. length:', len(r['output_image']))
            print('starts with:', r['output_image'][:50])
