import { FileText } from "lucide-react";

import type { LessonBlock } from "../courses/api";
import { getStringValue } from "./blockData";

export function TextBlockCard({ block }: { block: LessonBlock }) {
  const content = getStringValue(block.data_json, "content") || "Text content will appear here.";

  return (
    <article className="rounded-[20px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.20)] backdrop-blur">
      <div className="mb-4 flex items-center gap-3 text-sm font-semibold text-[#CBD5E1]">
        <FileText className="h-5 w-5 text-[#A855F7]" aria-hidden="true" />
        Text
      </div>
      <div className="rounded-2xl border border-white/10 bg-[#111827]/72 p-5 text-[#CBD5E1]">
        <p className="whitespace-pre-line leading-8">{content}</p>
      </div>
    </article>
  );
}
