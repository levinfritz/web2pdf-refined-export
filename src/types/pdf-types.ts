export type PaperSizeType = "A4" | "A5" | "Letter" | "Legal";
export type OrientationType = "portrait" | "landscape";
export type MarginsType = "none" | "small" | "normal" | "large";
export type ThemeType = "auto" | "light" | "dark";
export type StylePresetType = "default" | "clean" | "readable" | "compact" | "academic";
export type CompressionQualityType = "screen" | "ebook" | "printer" | "prepress";

export interface PdfMetadataType {
  title: string;
  author: string;
  subject: string;
  keywords: string[];
}

export interface PdfSettingsType {
  paperSize: string;
  orientation: string;
  margins: string;
  includeImages: boolean;
  preserveLinks: boolean;
  removeAds: boolean;
  theme: string;
  fontSize: number;
  stylePreset: string;
  includeSubpages: boolean;
  maxSubpages: number;
  customCss?: string;
  compressionLevel: CompressionQualityType;
  metadata?: PdfMetadataType;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface PdfMetadataResponse {
  title: string;
  fileSize: number;
  compressionLevel: string;
  createdAt: string;
}

export interface ConversionResponse {
  success: boolean;
  pdfUrl: string;
  previewUrl: string;
  metadata?: PdfMetadataResponse;
  error?: string;
}
