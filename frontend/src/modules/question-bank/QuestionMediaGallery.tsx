import { X } from "lucide-react";
import { useState } from "react";

import type { QuestionMedia } from "./api";
import { QuestionMediaCard } from "./QuestionMediaCard";

type QuestionMediaGalleryProps = {
  media: QuestionMedia[];
  onRemove?: (mediaId: string) => void;
  compact?: boolean;
};

export function QuestionMediaGallery({ media, onRemove, compact = false }: QuestionMediaGalleryProps) {
  const [zoomedMedia, setZoomedMedia] = useState<QuestionMedia | null>(null);
  const sortedMedia = [...media].sort((first, second) => first.position - second.position);

  if (sortedMedia.length === 0) {
    return null;
  }

  return (
    <>
      <div className={compact ? "grid gap-3 sm:grid-cols-2" : "grid gap-4 lg:grid-cols-2"}>
        {sortedMedia.map((item) => (
          <QuestionMediaCard key={item.id} media={item} onRemove={onRemove} onZoom={setZoomedMedia} compact={compact} />
        ))}
      </div>

      {zoomedMedia && zoomedMedia.media_type === "IMAGE" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/88 p-4 backdrop-blur">
          <div className="relative max-h-full max-w-5xl overflow-hidden rounded-[20px] border border-white/10 bg-[#111827] shadow-[0_32px_90px_rgba(0,0,0,0.42)]">
            <button
              type="button"
              onClick={() => setZoomedMedia(null)}
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-black/45 text-white backdrop-blur"
              aria-label="Close image preview"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <img src={zoomedMedia.file_url} alt={zoomedMedia.caption ?? "Question image"} className="max-h-[82vh] w-full object-contain" />
            {zoomedMedia.caption && <p className="p-4 text-sm text-[#CBD5E1]">{zoomedMedia.caption}</p>}
          </div>
        </div>
      )}
    </>
  );
}
