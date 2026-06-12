import { Layers } from "lucide-react";

import type { LessonBlock } from "../courses/api";
import { AttachmentBlockCard } from "./AttachmentBlockCard";
import { ImageBlockCard } from "./ImageBlockCard";
import { PdfBlockCard } from "./PdfBlockCard";
import { TextBlockCard } from "./TextBlockCard";

export function BlockRenderer({ block }: { block: LessonBlock }) {
  if (block.block_type === "TEXT") {
    return <TextBlockCard block={block} />;
  }

  if (block.block_type === "PDF") {
    return <PdfBlockCard block={block} />;
  }

  if (block.block_type === "IMAGE") {
    return <ImageBlockCard block={block} />;
  }

  if (block.block_type === "ATTACHMENT") {
    return <AttachmentBlockCard block={block} />;
  }

  return (
    <article className="rounded-[20px] border border-white/10 bg-white/[0.06] p-6 text-[#CBD5E1]">
      <Layers className="mb-3 h-5 w-5 text-[#F59E0B]" aria-hidden="true" />
      This block type is reserved for a future phase.
    </article>
  );
}
