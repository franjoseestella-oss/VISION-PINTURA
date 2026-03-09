const LOCAL_URL = "http://localhost:5000";

export const initLocalInference = async (_modelUrl: string) => {
    // throw new Error("Local inference is not fully implemented in this prototype.");
    console.log("Mock setup for local model initialized.");
};

export const loadLocalModel = async (model: File | string) => {
    try {
        let response;

        if (typeof model === 'string') {
            response = await fetch(`${LOCAL_URL}/load-model`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: model })
            });
        } else {
            const formData = new FormData();
            formData.append('model_file', model);

            response = await fetch(`${LOCAL_URL}/load-model`, {
                method: 'POST',
                // No Content-Type header, browser adds it with boundary
                body: formData
            });
        }

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load model");
        return data;
    } catch (e: any) {
        throw new Error(`Load Model Error: ${e.message}`);
    }
};

export const runLocalInference = async (base64Data: string, confidence: number = 0.10) => {
    try {
        // Remove header if present
        if (base64Data.includes("base64,")) {
            base64Data = base64Data.split("base64,")[1];
        }

        const response = await fetch(`${LOCAL_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Data, confidence })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Inference Failed");

        // Map to Roboflow-like format for App compatibility
        // Server returns normalized x,y,w,h
        // We need to convert to percentages

        // Actually, Roboflow service expects:
        // class, confidence, x, y, width, height (normalized or pixels)
        // Since my server returns normalized (0-1), these are perfect

        // However, mapRoboflowResponse expects specific keys
        // x, y, width, height. But for normalized, x <= 2 means normalized.
        // My server explicitly returns normalized 0-1 values for x, y, w, h.

        // Re-use mapRoboflowResponse logic? No, let's map it manually here to maximize compatibility
        // Normalized means x=0.5 is 50%.

        const output = data.predictions.map((p: any) => {
            // Normalize to %
            const leftPct = (p.x - p.width / 2) * 100;
            const topPct = (p.y - p.height / 2) * 100;
            const widthPct = p.width * 100;
            const heightPct = p.height * 100;

            return {
                label: p.class,
                confidence: p.confidence,
                bbox: [topPct, leftPct, widthPct, heightPct], // Top, Left, Width, Height
                detection_id: "local"
            };
        });

        return {
            detections: output,
            summary: `Local Inference (YOLO): Found ${output.length} objects.`
        };

    } catch (e: any) {
        throw new Error(`Local Inference Error: ${e.message}`);
    }
};
