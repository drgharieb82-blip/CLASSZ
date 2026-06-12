import type { BlockType } from "../courses/api";

export type TextBlockData = {
  content: string;
};

export type PdfBlockData = {
  file_url: string;
  title: string;
};

export type ImageBlockData = {
  image_url: string;
  caption: string;
};

export type AttachmentBlockData = {
  file_url: string;
  filename: string;
};

export type SupportedBlockType = Exclude<BlockType, "VIDEO">;

export function getStringValue(data: Record<string, unknown>, key: string): string {
  const value = data[key];
  return typeof value === "string" ? value : "";
}

export function createDefaultBlockData(blockType: SupportedBlockType): Record<string, string> {
  if (blockType === "TEXT") {
    return { content: "" };
  }

  if (blockType === "PDF") {
    return { file_url: "", title: "" };
  }

  if (blockType === "IMAGE") {
    return { image_url: "", caption: "" };
  }

  return { file_url: "", filename: "" };
}
