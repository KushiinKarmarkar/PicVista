export type OutputFormat = "jpeg" | "png" | "webp" | "avif";

export type ConvertParams = {
  kind: "convert";
  targetFormat: OutputFormat;
  quality: number;
  preserveMetadata?: boolean;
};

export type CompressParams = {
  kind: "compress";
  quality: number;
  mode: "manual" | "auto";
};

export type ResizePreset =
  | "instagram-square"
  | "instagram-story"
  | "linkedin"
  | "whatsapp"
  | "custom";

export type ResizeParams = {
  kind: "resize";
  width?: number;
  height?: number;
  maintainAspect: boolean;
  preset: ResizePreset;
};

export type RemoveBackgroundParams = {
  kind: "removeBackground";
};

export type UpscaleParams = {
  kind: "upscale";
  scale: 2 | 4;
  engine: "lanczos" | "replicate";
};

export type RemoveWatermarkParams = {
  kind: "removeWatermark";
  maskUploadId: string;
};

export type SimpleProcessParams =
  | ConvertParams
  | CompressParams
  | ResizeParams
  | RemoveBackgroundParams
  | UpscaleParams
  | RemoveWatermarkParams;

export type BatchZipParams = {
  kind: "batchZip";
  uploadIds: string[];
  childParams: SimpleProcessParams;
};

export type ProcessParams = SimpleProcessParams | BatchZipParams;
