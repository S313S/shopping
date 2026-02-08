import { AnalysisResult, ProductDetails } from "../types";

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";
const OPENROUTER_BASE_URL = (import.meta.env.VITE_OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/+$/, "");
const OPENROUTER_TEXT_MODEL = import.meta.env.VITE_OPENROUTER_TEXT_MODEL || "openai/gpt-4o-mini";
const OPENROUTER_IMAGE_MODEL = import.meta.env.VITE_OPENROUTER_IMAGE_MODEL || "bytedance-seed/seedream-4.5";

const toDataUri = (base64: string, mimeType?: string): string => {
  const safeMime = mimeType || "image/png";
  return `data:${safeMime};base64,${base64}`;
};

const unwrapImageLike = (imageLike: any): string | null => {
  if (!imageLike) return null;
  if (typeof imageLike === "string") return imageLike;

  const directUrl = imageLike.url || imageLike.image_url?.url || imageLike.image_url;
  if (typeof directUrl === "string" && directUrl.length > 0) return directUrl;

  const base64 = imageLike.b64_json || imageLike.imageBytes || imageLike.image?.imageBytes;
  if (typeof base64 === "string" && base64.length > 0) {
    return toDataUri(base64, imageLike.mimeType || imageLike.image?.mimeType);
  }

  return null;
};

const extractTextContent = (content: unknown): string => {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";

  return content
    .map((part: any) => {
      if (typeof part === "string") return part;
      if (typeof part?.text === "string") return part.text;
      return "";
    })
    .filter(Boolean)
    .join("\n");
};

const extractGeneratedImageUrl = (response: any): string | null => {
  const directData = response?.data?.[0];
  const fromDirectData = unwrapImageLike(directData);
  if (fromDirectData) return fromDirectData;

  const choices = response?.choices;
  if (Array.isArray(choices)) {
    for (const choice of choices) {
      const message = choice?.message || {};

      if (Array.isArray(message.images)) {
        for (const imageLike of message.images) {
          const extracted = unwrapImageLike(imageLike);
          if (extracted) return extracted;
        }
      }

      const content = message.content;
      if (Array.isArray(content)) {
        for (const part of content) {
          if (part?.type === "image_url" || part?.type === "output_image" || part?.type === "image") {
            const extracted = unwrapImageLike(part);
            if (extracted) return extracted;
          }
        }
      }

      const asText = extractTextContent(content);
      const dataUriMatch = asText.match(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/);
      if (dataUriMatch?.[0]) return dataUriMatch[0];

      const markdownImageMatch = asText.match(/!\[[^\]]*]\((https?:\/\/[^)\s]+)\)/);
      if (markdownImageMatch?.[1]) return markdownImageMatch[1];
      const plainImageUrlMatch = asText.match(/https?:\/\/[^\s)]+(?:png|jpg|jpeg|webp|gif)(?:\?[^\s)]*)?/i);
      if (plainImageUrlMatch?.[0]) return plainImageUrlMatch[0];
    }
  }

  const fallbackImages = response?.images;
  if (Array.isArray(fallbackImages)) {
    for (const imageLike of fallbackImages) {
      const extracted = unwrapImageLike(imageLike);
      if (extracted) return extracted;
    }
  }

  return null;
};

const extractErrorMessage = (payload: any): string => {
  return (
    payload?.error?.message ||
    payload?.message ||
    payload?.detail ||
    payload?.errors?.[0]?.message ||
    "Unknown OpenRouter error"
  );
};

const parseJsonObjectFromText = (text: string): any => {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] || trimmed;
  return JSON.parse(candidate);
};

const callOpenRouter = async (payload: any): Promise<any> => {
  if (!OPENROUTER_API_KEY) {
    throw new Error("Missing OpenRouter API key. Please set VITE_OPENROUTER_API_KEY in .env.local");
  }

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": window.location.origin,
      "X-Title": "shopping-v2"
    },
    body: JSON.stringify(payload)
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`OpenRouter request failed (${response.status}): ${extractErrorMessage(json)}`);
  }

  return json;
};

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
 * Uses OpenRouter text/vision model for reasoning and JSON output.
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
    const response = await callOpenRouter({
      model: OPENROUTER_TEXT_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt + "\nReturn ONLY valid JSON. No markdown, no extra text." },
            { type: "image_url", image_url: { url: toDataUri(mediaPart.inlineData.data, mediaPart.inlineData.mimeType) } }
          ]
        }
      ]
    });

    const content = extractTextContent(response?.choices?.[0]?.message?.content);
    if (!content) {
      throw new Error("No analysis content returned from OpenRouter.");
    }

    return parseJsonObjectFromText(content) as AnalysisResult;

  } catch (error) {
    console.error("Error analyzing asset:", error);
    throw error;
  }
};

/**
 * Generates a new image based on the suggested prompt.
 * Uses OpenRouter image model for generation.
 */
export const generateMarketingImage = async (prompt: string): Promise<string> => {
  try {
    const response = await callOpenRouter({
      model: OPENROUTER_IMAGE_MODEL,
      modalities: ["image"],
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const imageUrl = extractGeneratedImageUrl(response);
    if (!imageUrl) {
      throw new Error("Image generation returned no usable image data. Please verify your selected OpenRouter image model supports image output on chat/completions.");
    }
    return imageUrl;

  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};
