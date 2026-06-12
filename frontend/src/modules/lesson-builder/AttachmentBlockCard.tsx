import { Download, Paperclip } from "lucide-react";

import type { LessonBlock } from "../courses/api";
import { getStringValue } from "./blockData";

export function AttachmentBlockCard({ block }: { block: LessonBlock }) {
  const fileUrl = getStringValue(block.data_json, "file_url");
  const filename = getStringValue(block.data_json, "filename") || "Untitled attachment";

  return (
    <article className="rounded-[20px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.20)] backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3B82F6]/16">
            <Paperclip className="h-6 w-6 text-[#3B82F6]" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Attachment</p>
            <h3 className="truncate font-[Poppins] text-lg font-semibold text-[#F8FAFC]">{filename}</h3>
          </div>
        </div>
        {fileUrl ? (
          <a
            href={fileUrl}
            download
            className="inline-flex w-fit items-center gap-2 rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#9333EA] to-[#A855F7] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(124,58,237,0.28)] transition hover:brightness-110"
          >
            Download
            <Download className="h-4 w-4" aria-hidden="true" />
          </a>
        ) : (
          <span className="text-sm text-[#94A3B8]">File URL pending</span>
        )}
      </div>
    </article>
  );
}
