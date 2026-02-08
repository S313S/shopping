import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ProductDetails } from "../types";

// Initialize Gemini Client
// @ts-ignore
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Helper to convert File to Base64
 */
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Analyzes a competitor's asset (image or video) and maps it to the user's product.
 * Uses gemini-3-pro-preview for superior reasoning and JSON formatting.
 */
export const analyzeCompetitorAsset = async (
  file: File,
  productDetails: ProductDetails
): Promise<AnalysisResult> => {
  const mediaPart = await fileToGenerativePart(file);

  const prompt = `
    You are a world-class e-commerce Creative Director specializing in cross-border trade.
    
    I have uploaded a competitor's asset (image or video). 
    My goal is to replicate the SUCCESS of this asset but for MY PRODUCT.
    
    MY PRODUCT DETAILS:
    Name: ${productDetails.name}
    Description: ${productDetails.description}
    Target Audience: ${productDetails.targetAudience}

    Please perform the following:
    1. Deconstruct the competitor's visual strategy (lighting, angle, composition, mood).
    2. Identify the key visual hook (why does it sell?).
    3. Create a specialized image generation prompt that applies this successful style to MY PRODUCT.
    4. Write a short, punchy ad copy (English) for my product based on this visual.

    Return the result strictly as JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          mediaPart,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            visualStyle: { type: Type.STRING, description: "Description of the visual style and tone" },
            sellingPoints: { type: Type.STRING, description: "Key selling points highlighted visually" },
            composition: { type: Type.STRING, description: "Notes on composition, framing, and lighting" },
            lightingAndMood: { type: Type.STRING, description: "Details about lighting setup and emotional mood" },
            suggestedPrompt: { type: Type.STRING, description: "The optimized prompt to generate a new image for MY product" },
            adCopy: { type: Type.STRING, description: "Short advertising copy text" }
          },
          required: ["visualStyle", "sellingPoints", "composition", "lightingAndMood", "suggestedPrompt", "adCopy"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response from Gemini.");
    }

    return JSON.parse(response.text) as AnalysisResult;

  } catch (error) {
    console.error("Error analyzing asset:", error);
    throw error;
  }
};

/**
 * Generates a new image based on the suggested prompt.
 * Uses gemini-2.5-flash-image for image generation.
 */
export const generateMarketingImage = async (prompt: string): Promise<string> => {
  try {
    // We use gemini-2.5-flash-image which supports text-to-image generation
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
         // Using default config for 1:1 aspect ratio, can be adjusted if needed
         // imageConfig: { aspectRatio: "1:1" } 
      }
    });

    // Extract image from response
    // The response can contain multiple parts, we look for inlineData
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("No content generated");

    for (const part of parts) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }

    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};