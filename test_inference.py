import os
import cv2
import numpy as np

def test():
    frame = np.zeros((400, 400, 3), dtype=np.uint8)
    cv2.rectangle(frame, (100, 100), (300, 300), (255, 255, 255), -1)
    ret, buf = cv2.imencode('.jpg', frame)
    jpg_path = "test_image.jpg"
    with open(jpg_path, "wb") as f:
        f.write(buf)

    print("Sending to Roboflow...")
    try:
        from inference_sdk import InferenceHTTPClient
        client = InferenceHTTPClient(
            api_url="https://serverless.roboflow.com",
            api_key="K6YHioHqtuwbsNmR2n7O"
        )
        result = client.run_workflow(
            workspace_name="welding-hqci3",
            workflow_id="detect-count-and-visualize-2",
            images={"image": jpg_path},
            use_cache=True
        )
        print("Success!")
        print(result.keys() if isinstance(result, dict) else type(result))
        if isinstance(result, list) and len(result) > 0:
            print(result[0].keys())
    except Exception as e:
        print("Error:", e)

test()
