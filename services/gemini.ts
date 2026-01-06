
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, AssetCategory } from "../types";

// Removed global AI instance to ensure fresh instance per request with latest API key

export const getAISearchAnalysis = async (query: string): Promise<AIResponse> => {
  // Always create a new GoogleGenAI instance right before making an API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following video editing asset search query and suggest metadata tags and the most likely category: "${query}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommended_tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          explanation: { type: Type.STRING },
          suggested_category: { 
            type: Type.STRING,
            description: 'One of: DEEPFAKES, TIKTOK, MUSIC, SFX, VEO3, SOCIAL_PROOF'
          }
        },
        required: ["recommended_tags", "explanation"]
      }
    }
  });

  // Use response.text property directly
  return JSON.parse(response.text || '{}');
};

export const generateAIAssetVideo = async (prompt: string): Promise<string | null> => {
  // Always create a new GoogleGenAI instance right before making an API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Cinematic professional video asset for BH•EVER library: ${prompt}`,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (downloadLink) {
    // Return download link with API key as required by Veo guidelines
    return `${downloadLink}&key=${process.env.API_KEY}`;
  }
  return null;
};
