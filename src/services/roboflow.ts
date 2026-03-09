// const API_URL = "https://serverless.roboflow.com";
const API_KEY = import.meta.env.VITE_ROBOFLOW_API_KEY || "";
const WORKSPACE_NAME = "welding-hqci3";
const WORKFLOW_ID = "frontalmg";
const LOCAL_URL = "http://localhost:5000";

export interface RoboflowDetection {
    class: string;
    confidence: number;
    x: number;
    y: number;
    width: number;
    height: number;
    [key: string]: any;
}

export interface RoboflowWorkflowResponse {
    outputs: Array<{
        [key: string]: any;
    }>;
    [key: string]: any;
}

export const runRoboflowWorkflow = async (base64Data: string, _mimeType: string, imageDims?: { width: number, height: number }) => {
    // 1. Try Workflow Endpoint via Local Proxy (Bypasses CORS/Auth issues with private keys)
    try {
        const proxyUrl = `${LOCAL_URL}/roboflow-proxy`;
        const cleanBase64 = base64Data.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

        const payload = {
            api_key: API_KEY,
            workspace: WORKSPACE_NAME,
            workflow_id: WORKFLOW_ID,
            image: cleanBase64
        };

        console.log("Calling Workflow via Proxy:", proxyUrl);
        const response = await fetch(proxyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const result = await response.json();
            const predictionResult = mapRoboflowResponse(result, imageDims);

            if (predictionResult.detections.length > 0) {
                console.log(`Proxy Success: ${predictionResult.detections.length} predictions`);
                return predictionResult;
            } else {
                console.warn("Proxy returned 0 predictions.");
                // We could retry? But Proxy already tried fallback.
                return predictionResult;
            }
        } else {
            const errBody = await response.json().catch(() => ({}));
            console.error("Proxy Endpoint Failed:", response.status, errBody);
            throw new Error(`Roboflow Proxy Error: ${errBody.error || response.statusText}`);
        }
    } catch (error: any) {
        console.error("Error calling Roboflow Proxy:", error);
        throw error;
    }
};

// Helper: Recursively find ALL arrays of predictions in an arbitrary JSON structure
const findPredictions = (obj: any): any[] => {
    if (!obj || typeof obj !== 'object') return [];

    // Debug: Log structure traversal (limit noise)
    // console.log("Inspecting:", Array.isArray(obj) ? `Array(${obj.length})` : `Object(${Object.keys(obj).join(',')})`);

    // 1. Standard Roboflow Object Detection format (root array)
    if (Array.isArray(obj) && obj.length > 0) {
        const first = obj[0];
        // Check keys of first item to see if it's a prediction
        const keys = Object.keys(first || {});
        // console.log("Checking array item 0 keys:", keys);

        const hasCoords = (first.x !== undefined || first.bbox !== undefined);
        const hasClass = (first.class !== undefined || first.label !== undefined || first.detection_id !== undefined);

        if (hasCoords || hasClass) {
            console.log("Found predictions array! Keys:", keys);
            return obj;
        }
    }

    // 2. Standard 'predictions' key
    if (obj.predictions && Array.isArray(obj.predictions)) {
        console.log("Found predictions via 'predictions' key");
        return obj.predictions;
    }

    // 3. Search for 'outputs' or other nesting
    // Recursive fallback
    let allPredictions: any[] = [];

    // Safety check for recursion depth/loops could go here, but JSON is tree.
    Object.keys(obj).forEach(key => {
        const value = obj[key];
        // Avoid recursing into simple values or empty objects
        if (typeof value === 'object' && value !== null) {
            // Optimization: Don't recurse into 'image' metadata if it's just dims
            if (key === 'image' && value.width && !value.predictions) return;

            const nested = findPredictions(value);
            if (nested.length > 0) {
                allPredictions = allPredictions.concat(nested);
            }
        }
    });

    return allPredictions;
};

const mapRoboflowResponse = (data: RoboflowWorkflowResponse, manualDims?: { width: number, height: number }) => {
    let detections: any[] = [];

    // 1. Find the predictions array using robust search
    const predictions = findPredictions(data);
    console.log("Raw API Response:", data);
    console.log("Found predictions array (length):", predictions.length);
    if (predictions.length > 0) {
        console.log("First prediction item:", JSON.stringify(predictions[0], null, 2));
    }

    // 2. Determine Image Dimensions
    // Use manual dims if provided (most reliable for pixel coords), otherwise look in response
    let width = manualDims?.width || 0;
    let height = manualDims?.height || 0;

    // Try to find image dims in response if manual not provided or as fallback
    if ((width === 0 || height === 0) && data.inputs?.image?.width) {
        width = data.inputs.image.width;
        height = data.inputs.image.height;
    }

    // Default to 640 if still unknown (dangerous for pixel coords!)
    if (width === 0 || height === 0) {
        console.warn("Image dimensions unknown! Defaulting to 640x640. Pixel coordinates might be wrong.");
        width = 640;
        height = 640;
    } else {
        console.log(`Mapping with Image Dimensions: ${width}x${height}`);
    }

    detections = predictions.map((pred: any, idx: number) => {
        // Roboflow returns x, y (center), width, height
        // Ensure values are numbers
        let x = Number(pred.x || 0);
        let y = Number(pred.y || 0);
        let w = Number(pred.width || 0);
        let h = Number(pred.height || 0);
        const cls = pred.class || "object";

        // Heuristic: If coordinates are small (< 2.0), assume Normalized (0-1)
        const isNormalized = (x <= 2 && y <= 2 && w <= 2 && h <= 2);

        let topPct, leftPct, widthPct, heightPct;

        if (isNormalized) {
            leftPct = (x - w / 2) * 100;
            topPct = (y - h / 2) * 100;
            widthPct = w * 100;
            heightPct = h * 100;
        } else {
            // Pixel coordinates -> convert to % based on image dimensions
            leftPct = ((x - w / 2) / width) * 100;
            topPct = ((y - h / 2) / height) * 100;
            widthPct = (w / width) * 100;
            heightPct = (h / height) * 100;
        }

        if (idx === 0) {
            console.log(`[Pred-0 Debug] Raw: x=${x}, y=${y}, w=${w}, h=${h}. Mode: ${isNormalized ? 'Norm' : 'Pixel'}. Dims: ${width}x${height}`);
            console.log(`[Pred-0 Debug] Calc: L=${leftPct.toFixed(1)}%, T=${topPct.toFixed(1)}%, W=${widthPct.toFixed(1)}%, H=${heightPct.toFixed(1)}%`);
        }

        return {
            label: cls,
            confidence: pred.confidence || 0.0,
            bbox: [topPct, leftPct, widthPct, heightPct]
        };
    });

    return {
        detections,
        summary: `Analyzed with Roboflow. Found ${detections.length} objects.`
    };
};
