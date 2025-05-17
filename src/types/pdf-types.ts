
export type PaperSizeType = "A4" | "A5" | "Letter" | "Legal";
export type OrientationType = "portrait" | "landscape";
export type MarginsType = "none" | "small" | "normal" | "large";
export type ThemeType = "auto" | "light" | "dark";
export type StylePresetType = "default" | "clean" | "readable" | "compact" | "academic";

export interface PdfSettingsType {
  paperSize: PaperSizeType;
  orientation: OrientationType;
  margins: MarginsType;
  includeImages: boolean;
  preserveLinks: boolean;
  removeAds: boolean;
  theme: ThemeType;
  fontSize: number;
  stylePreset: StylePresetType;
}

export interface ConversionResponse {
  status: "success" | "error";
  message?: string;
  url?: string;
  previewUrl?: string;
}
