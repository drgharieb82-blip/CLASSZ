import { FileText, Image as ImageIcon, Layers } from "lucide-react";

import type { LessonBlock } from "../courses/api";

function getTextValue(data: Record<string, unknown>): string {
  const value = data.content ?? data.text ?? data.html;
  return typeof value === "string" ? value : "Text content will appear here.";
}

function getStringValue(data: Record<string, unknown>, keys: string[]): string | undefined {
  const value = keys.map((key) => data[key]).find((candidate) => typeof candidate === "string");
  return typeof value === "string" ? value : undefined;
}

export function BlockRenderer({ block }: { block: LessonBlock }) {
  if (block.block_type === "TEXT") {
    return (
      <article className="rounded-[20px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.20)] backdrop-blur dark:text-[#F8FAFC]">
        <div className="mb-4 flex items-center gap-3 text-sm font-semibold text-[#CBD5E1]">
          <FileText className="h-5 w-5 text-[#A855F7]" aria-hidden="true" />
          Text Block
        </div>
        <div className="prose prose-invert max-w-none text-[#F8FAFC]">
          <p className="whitespace-pre-line leading-8 text-[#CBD5E1]">{getTextValue(block.data_json)}</p>
        </div>
      </article>
    );
  }

  if (block.block_type === "PDF") {
    return (
      <article className="rounded-[20px] border border-dashed border-[#3B82F6]/50 bg-[#111827]/80 p-6 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-[#3B82F6]" aria-hidden="true" />
          <div>
            <h3 className="font-[Poppins] text-xl font-semibold text-[#F8FAFC]">
              PDF Viewer Coming in Phase 2
            </h3>
            <p className="mt-1 text-sm text-[#94A3B8]">
              This block is reserved for document viewing once the content system expands.
            </p>
          </div>
        </div>
      </article>
    );
  }

  if (block.block_type === "IMAGE") {
    const imageUrl = getStringValue(block.data_json, ["url", "src", "image_url"]);
    const alt = getStringValue(block.data_json, ["alt", "caption"]) ?? "Lesson image";

    return (
      <article className="overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.06] shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
        {imageUrl ? (
          <img src={imageUrl} alt={alt} className="aspect-video w-full object-cover" />
        ) : (
          <div className="flex aspect-video items-center justify-center bg-[#111827] text-[#94A3B8]">
            <ImageIcon className="mr-2 h-5 w-5 text-[#A855F7]" aria-hidden="true" />
            Image source pending
          </div>
        )}
        {alt && <p className="px-6 py-4 text-sm text-[#CBD5E1]">{alt}</p>}
      </article>
    );
  }

  return (
    <article className="rounded-[20px] border border-white/10 bg-white/[0.06] p-6 text-[#CBD5E1]">
      <Layers className="mb-3 h-5 w-5 text-[#F59E0B]" aria-hidden="true" />
      This block type is reserved for a future phase.
    </article>
  );
}
