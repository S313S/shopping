export enum AssetType {
  IMAGE = 'image',
  VIDEO = 'video'
}

export interface AnalysisResult {
  visualStyle: string;
  sellingPoints: string;
  composition: string;
  lightingAndMood: string;
  suggestedPrompt: string;
  adCopy: string;
}

export interface GeneratedAsset {
  id: string;
  imageUrl: string;
  promptUsed: string;
  createdAt: number;
}

export interface ProductDetails {
  name: string;
  description: string;
  targetAudience: string;
}