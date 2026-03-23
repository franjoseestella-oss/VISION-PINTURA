/**
 * SAM 3 (Segment Anything Model 3) — Person Removal Service
 * Uses Roboflow's serverless SAM3 Concept Segmentation + OpenCV Inpainting
 *
 * Flow:
 *   1. SAM 3 detects persons (or any text-prompted concept) via segmentation
 *   2. Creates a binary mask from the segmentation polygons
 *   3. OpenCV inpaints (fills) the masked areas with surrounding background
 *   4. Returns the cleaned image without persons
 */

const BACKEND_URL = "http://localhost:8765";

export interface Sam3RemoveResult {
    ok: boolean;
    cleaned_image?: string;     // base64 cleaned image (persons removed)
    mask_image?: string;        // base64 mask showing removed areas
    persons_found: number;
    persons_removed: number;
    image_width: number;
    image_height: number;
    summary: string;
    error?: string;
}

export interface Sam3DetectResult {
    ok: boolean;
    detections: Array<{
        class: string;
        confidence: number;
        x: number;
        y: number;
        width: number;
        height: number;
        points?: Array<{ x: number; y: number }>;
        detection_id?: string;
    }>;
    output_image?: string;
    cleaned_image?: string;
    image_width: number;
    image_height: number;
    summary: string;
    error?: string;
}

/**
 * Remove persons (or any concept) from an uploaded image
 * @param base64Image - The image as base64 data URL or raw base64
 * @param concepts - Array of text concepts to remove (e.g. ["person", "car"])
 * @param confidenceThreshold - Minimum confidence (0.0-1.0)
 * @param method - Inpainting method: "telea" (fast) or "ns" (Navier-Stokes, smoother)
 */
export const removeConcepts = async (
    base64Image: string,
    concepts: string[] = ["person"],
    confidenceThreshold: number = 0.3,
    method: "telea" | "ns" = "telea"
): Promise<Sam3RemoveResult> => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/sam3/remove`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                image: base64Image,
                concepts,
                confidence: confidenceThreshold,
                method,
            }),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error("[SAM3 Remove] Error:", error);
        return {
            ok: false,
            persons_found: 0,
            persons_removed: 0,
            image_width: 0,
            image_height: 0,
            summary: `SAM 3 Remove Error: ${error.message}`,
            error: error.message,
        };
    }
};

/**
 * Remove persons from live camera frame
 */
export const removeConceptsLive = async (
    concepts: string[] = ["person"],
    confidenceThreshold: number = 0.3,
    method: "telea" | "ns" = "telea"
): Promise<Sam3RemoveResult> => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/sam3/remove-live`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                concepts,
                confidence: confidenceThreshold,
                method,
            }),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error("[SAM3 Remove Live] Error:", error);
        return {
            ok: false,
            persons_found: 0,
            persons_removed: 0,
            image_width: 0,
            image_height: 0,
            summary: `SAM 3 Remove Live Error: ${error.message}`,
            error: error.message,
        };
    }
};

/**
 * Detect concepts (without removal) — also supports optional inpainting via `remove` flag
 */
export const detectConcepts = async (
    base64Image: string,
    concepts: string[] = ["person"],
    confidenceThreshold: number = 0.3,
    remove: boolean = false
): Promise<Sam3DetectResult> => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/sam3/detect`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                image: base64Image,
                concepts,
                confidence: confidenceThreshold,
                remove,
            }),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error("[SAM3 Detect] Error:", error);
        return {
            ok: false,
            detections: [],
            image_width: 0,
            image_height: 0,
            summary: `SAM 3 Detect Error: ${error.message}`,
            error: error.message,
        };
    }
};
