"""
Test directo: llama al worklow de Roboflow y muestra la estructura del resultado.
Usa exactamente el mismo código que el usuario mostró.
"""
from inference_sdk import InferenceHTTPClient
import json

client = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key="K6YHioHqtuwbsNmR2n7O"
)

# Usa t.jpg (la imagen que hay en el proyecto)
result = client.run_workflow(
    workspace_name="welding-hqci3",
    workflow_id="detect-count-and-visualize-2",
    images={"image": "t.jpg"},
    use_cache=True
)

print(f"Tipo de resultado: {type(result)}")
print(f"Número de elementos: {len(result) if isinstance(result, list) else 'N/A'}")

if isinstance(result, list) and len(result) > 0:
    r0 = result[0]
    print(f"\nClaves en result[0]: {list(r0.keys()) if isinstance(r0, dict) else type(r0)}")
    
    # output_image
    oi = r0.get("output_image") if isinstance(r0, dict) else getattr(r0, "output_image", None)
    print(f"\noutput_image tipo: {type(oi).__name__}")
    if oi is not None:
        s = str(oi)
        print(f"  primeros 40 chars: {s[:40]}")
        print(f"  longitud: {len(s)}")

    # predictions
    preds_raw = r0.get("predictions") if isinstance(r0, dict) else getattr(r0, "predictions", None)
    print(f"\npredictions tipo: {type(preds_raw).__name__}")
    if isinstance(preds_raw, dict):
        preds = preds_raw.get("predictions", [])
        print(f"  predictions.predictions: {len(preds)} items")
        for i, p in enumerate(preds[:3]):
            cls = p.get("class") if isinstance(p, dict) else getattr(p, "class_name", "?")
            conf = p.get("confidence", 0) if isinstance(p, dict) else 0
            has_points = "points" in p if isinstance(p, dict) else hasattr(p, "points")
            print(f"  [{i}] class={cls}, conf={conf:.2f}, has_points={has_points}")
