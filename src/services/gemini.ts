
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export const analyzeImageWithLabels = async (base64Data: string, mimeType: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        {
          text: `Act as a Roboflow inference engine for industrial QC. 
        Analyze the image and return a JSON list of detections. 
        For each detection, provide: 
        1. label (e.g., 'dent', 'scratch', 'missing_bolt', 'alignment_ok')
        2. confidence (0.0 to 1.0)
        3. bbox [top, left, width, height] as percentages of the image size.
        
        Also provide a general summary text.` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          detections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                bbox: {
                  type: Type.ARRAY,
                  items: { type: Type.NUMBER },
                  description: "[top, left, width, height] in percentage (0-100)"
                }
              },
              required: ["label", "confidence", "bbox"]
            }
          },
          summary: { type: Type.STRING }
        },
        required: ["detections", "summary"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const getChatResponse = async (history: { role: string; text: string }[], message: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const chat = ai.chats.create({
    model: "gemini-3-pro-preview",
    config: {
      systemInstruction: "You are the MLESA QC AI Assistant. You help operators understand quality standards and analyze Roboflow model outputs for the EDiA 50 assembly line.",
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};
