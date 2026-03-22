import type { ProcessParams } from "@/types/image-tools";

export type JobStatus = "queued" | "processing" | "completed" | "failed";

export type JobRecord = {
  id: string;
  status: JobStatus;
  uploadId: string;
  params: ProcessParams;
  createdAt: number;
  error?: string;
  result?: {
    outputFilename: string;
    outputBytes: number;
    inputBytes: number;
    mime: string;
    passthrough?: boolean;
    message?: string;
  };
};
