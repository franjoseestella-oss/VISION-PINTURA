/**
 * Service to manage 3D model files for production references
 * Models are stored in /public/models/ with naming convention: {REFERENCIA}.glb
 */

export interface ModelInfo {
    referencia: string;
    modelPath: string | null;
    exists: boolean;
}

/**
 * Check if a 3D model exists for a given reference
 */
export const checkModelExists = async (referencia: string): Promise<boolean> => {
    const modelPath = `/models/${referencia}.glb`;

    try {
        const response = await fetch(modelPath, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
};

/**
 * Get the model path for a reference (assumes it exists)
 */
export const getModelPath = (referencia: string): string => {
    return `/models/${referencia}.glb`;
};

/**
 * Get model info including existence check
 */
export const getModelInfo = async (referencia: string): Promise<ModelInfo> => {
    const exists = await checkModelExists(referencia);

    return {
        referencia,
        modelPath: exists ? getModelPath(referencia) : null,
        exists
    };
};

/**
 * Preload model existence for multiple references (batch check)
 */
export const getModelsInfo = async (referencias: string[]): Promise<Map<string, ModelInfo>> => {
    const results = new Map<string, ModelInfo>();

    // Check all models in parallel
    const checks = referencias.map(async (ref) => {
        const info = await getModelInfo(ref);
        results.set(ref, info);
    });

    await Promise.all(checks);
    return results;
};
