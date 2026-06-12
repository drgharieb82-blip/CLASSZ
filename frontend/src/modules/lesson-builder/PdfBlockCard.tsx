import { ExternalLink, FileText } from "lucide-react";

import type { LessonBlock } from "../courses/api";
import { getStringValue } from "./blockData";

export function PdfBlockCard({ block }: { block: LessonBlock }) {
  const fileUrl = getStringValue(block.data_json, "file_url");
  const title = getStringValue(block.data_json, "title") || "Untitled PDF";

  return (
    <article className="rounded-[20px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.20)] backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#9333EA] to-[#A855F7] shadow-[0_16px_40px_rgba(124,58,237,0.28)]">
            <FileText className="h-7 w-7 text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">PDF</p>
            <h3 className="truncate font-[Poppins] text-xl font-semibold text-[#F8FAFC]">{title}</h3>
          </div>
        </div>
        {fileUrl ? (
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-[#F8FAFC] transition hover:bg-white/[0.12]"
          >
            Open PDF
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        ) : (
          <span className="text-sm text-[#94A3B8]">File URL pending</span>
        )}
      </div>
    </article>
  );
}
