import { Image as ImageIcon } from "lucide-react";

import type { LessonBlock } from "../courses/api";
import { getStringValue } from "./blockData";

export function ImageBlockCard({ block }: { block: LessonBlock }) {
  const imageUrl = getStringValue(block.data_json, "image_url");
  const caption = getStringValue(block.data_json, "caption");

  return (
    <article className="overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.06] shadow-[0_16px_40px_rgba(0,0,0,0.20)] backdrop-blur">
      {imageUrl ? (
        <img src={imageUrl} alt={caption || "Lesson image"} className="aspect-video w-full object-cover" />
      ) : (
        <div className="flex aspect-video items-center justify-center bg-[#111827]/88 text-[#94A3B8]">
          <ImageIcon className="mr-2 h-5 w-5 text-[#A855F7]" aria-hidden="true" />
          Image source pending
        </div>
      )}
      {caption && <p className="px-6 py-4 text-sm leading-6 text-[#CBD5E1]">{caption}</p>}
    </article>
  );
}
