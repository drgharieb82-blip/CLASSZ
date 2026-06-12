import { FileText, Image as ImageIcon, Paperclip, Plus, ScrollText } from "lucide-react";
import { useMemo, useState } from "react";

import type { LessonBlock } from "../courses/api";
import { BlockRenderer } from "./BlockRenderer";
import { createDefaultBlockData, type SupportedBlockType } from "./blockData";

const blockOptions: Array<{
  type: SupportedBlockType;
  label: string;
  icon: typeof FileText;
}> = [
  { type: "TEXT", label: "Text", icon: ScrollText },
  { type: "PDF", label: "PDF", icon: FileText },
  { type: "IMAGE", label: "Image", icon: ImageIcon },
  { type: "ATTACHMENT", label: "Attachment", icon: Paperclip },
];

export function LessonBuilderPage() {
  const [blocks, setBlocks] = useState<LessonBlock[]>([]);

  const sortedBlocks = useMemo(
    () => [...blocks].sort((first, second) => first.position - second.position),
    [blocks]
  );

  function addBlock(blockType: SupportedBlockType) {
    setBlocks((currentBlocks) => [
      ...currentBlocks,
      {
        id: crypto.randomUUID(),
        lesson_id: "draft-lesson",
        block_type: blockType,
        position: currentBlocks.length,
        data_json: createDefaultBlockData(blockType),
        created_at: new Date().toISOString(),
      },
    ]);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#A855F7]">
              Lesson Builder
            </p>
            <h1 className="mt-3 font-[Poppins] text-4xl font-semibold text-[#F8FAFC]">
              Content blocks foundation
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-[#CBD5E1]">
              Compose the first Phase 2A lesson block stack with text, documents, images, and downloads.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {blockOptions.map((option) => (
              <button
                key={option.type}
                type="button"
                onClick={() => addBlock(option.type)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-[#F8FAFC] transition hover:bg-white/[0.12] focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
              >
                <option.icon className="h-4 w-4 text-[#A855F7]" aria-hidden="true" />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[20px] border border-dashed border-white/15 bg-white/[0.06] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
        <button
          type="button"
          onClick={() => addBlock("TEXT")}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#9333EA] to-[#A855F7] px-5 py-4 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(124,58,237,0.28)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
          Add Block
        </button>
      </section>

      <section className="space-y-5">
        {sortedBlocks.length > 0 ? (
          sortedBlocks.map((block) => <BlockRenderer key={block.id} block={block} />)
        ) : (
          <div className="rounded-[20px] border border-dashed border-white/15 bg-white/[0.06] p-8 text-center text-[#94A3B8]">
            Add a block to begin the lesson draft.
          </div>
        )}
      </section>
    </div>
  );
}
