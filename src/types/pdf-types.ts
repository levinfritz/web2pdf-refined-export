export type PaperSizeType = "A4" | "A5" | "Letter" | "Legal";
export type OrientationType = "portrait" | "landscape";
export type MarginsType = "none" | "small" | "normal" | "large";
export type ThemeType = "auto" | "light" | "dark";
export type StylePresetType = "default" | "clean" | "readable" | "compact" | "academic";

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
}

export interface ConversionResponse {
  success: boolean;
  pdfUrl: string;
  previewUrl: string;
  error?: string;
}
