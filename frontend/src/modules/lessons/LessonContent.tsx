import { Clock, Eye } from "lucide-react";

import type { Lesson } from "../courses/api";
import { BlockRenderer } from "./BlockRenderer";

export function LessonContent({ lesson }: { lesson?: Lesson }) {
  if (!lesson) {
    return (
      <section className="rounded-[20px] border border-dashed border-white/15 bg-white/[0.06] p-8 text-[#CBD5E1] shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
        <h2 className="font-[Poppins] text-2xl font-semibold text-[#F8FAFC]">No lesson selected</h2>
        <p className="mt-2 text-[#94A3B8]">
          Select a lesson from the course structure to preview its foundation blocks.
        </p>
      </section>
    );
  }

  const sortedBlocks = [...(lesson.blocks ?? [])].sort((first, second) => first.position - second.position);

  return (
    <section className="space-y-6">
      <header className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
        <div className="flex flex-wrap items-center gap-3 text-sm text-[#94A3B8]">
          <span className="inline-flex items-center gap-2 rounded-2xl bg-white/[0.06] px-3 py-2">
            <Clock className="h-4 w-4 text-[#3B82F6]" aria-hidden="true" />
            Lesson {lesson.position + 1}
          </span>
          {lesson.is_free_preview && (
            <span className="inline-flex items-center gap-2 rounded-2xl bg-[#10B981]/15 px-3 py-2 text-[#10B981]">
              <Eye className="h-4 w-4" aria-hidden="true" />
              Free preview
            </span>
          )}
        </div>
        <h1 className="mt-4 font-[Poppins] text-3xl font-semibold text-[#F8FAFC] sm:text-4xl">
          {lesson.title}
        </h1>
        {lesson.description && <p className="mt-3 max-w-3xl leading-7 text-[#CBD5E1]">{lesson.description}</p>}
      </header>

      {sortedBlocks.length > 0 ? (
        sortedBlocks.map((block) => <BlockRenderer key={block.id} block={block} />)
      ) : (
        <div className="rounded-[20px] border border-dashed border-white/15 bg-white/[0.06] p-8 text-[#94A3B8]">
          Blocks will appear here as TEXT, PDF, or IMAGE content is added.
        </div>
      )}
    </section>
  );
}
