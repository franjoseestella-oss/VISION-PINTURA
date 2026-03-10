import sys
import json
import base64
import numpy as np
import cv2
from inference_sdk import InferenceHTTPClient

try:
    img = np.zeros((400, 400, 3), dtype=np.uint8)
    cv2.imwrite("t.jpg", img)

    client = InferenceHTTPClient(
        api_url="https://serverless.roboflow.com",
        api_key="K6YHioHqtuwbsNmR2n7O"
    )

    result = client.run_workflow(
        workspace_name="welding-hqci3",
        workflow_id="detect-count-and-visualize-2",
        images={"image": "t.jpg"},
        use_cache=True
    )
    
    output = []
    
    if isinstance(result, list):
        res = result[0]
        if "output_image" in res:
            res["output_image"] = type(res["output_image"]).__name__
        output.append("Keys: " + str(res.keys()))
        output.append("Type of predictions: " + str(type(res.get("predictions"))))
        output.append("Content predictions: " + str(res.get("predictions")))
except Exception as e:
    output = ["Error: " + str(e)]

with open("out.txt", "w") as f:
    f.write("\n".join(output))
