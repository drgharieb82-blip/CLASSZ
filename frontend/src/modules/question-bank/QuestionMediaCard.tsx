import { ExternalLink, FileText, Image as ImageIcon, Maximize2, Trash2, Volume2, Video } from "lucide-react";

import type { QuestionMedia } from "./api";

type QuestionMediaCardProps = {
  media: QuestionMedia;
  onRemove?: (mediaId: string) => void;
  onZoom?: (media: QuestionMedia) => void;
  compact?: boolean;
};

export function QuestionMediaCard({ media, onRemove, onZoom, compact = false }: QuestionMediaCardProps) {
  const isImage = media.media_type === "IMAGE";
  const Icon = media.media_type === "PDF" ? FileText : media.media_type === "AUDIO" ? Volume2 : media.media_type === "VIDEO" ? Video : ImageIcon;

  return (
    <article className="overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.06] shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
      {isImage ? (
        <button type="button" onClick={() => onZoom?.(media)} className="group relative block w-full text-left">
          <img src={media.file_url} alt={media.caption ?? "Question image"} className={compact ? "h-32 w-full object-cover" : "aspect-video w-full object-cover"} />
          {onZoom && (
            <span className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-black/45 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            </span>
          )}
        </button>
      ) : (
        <a href={media.file_url} target="_blank" rel="noreferrer" className="flex min-h-32 items-center justify-center bg-[#111827]/88 text-[#CBD5E1]">
          <Icon className="mr-2 h-7 w-7 text-[#A855F7]" aria-hidden="true" />
          {media.media_type} attachment
          <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
        </a>
      )}
      <div className="flex items-start justify-between gap-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">{media.media_type}</p>
          {media.caption && <p className="mt-1 text-sm leading-6 text-[#CBD5E1]">{media.caption}</p>}
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(media.id)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-[#CBD5E1] transition hover:bg-[#EF4444]/15 hover:text-[#FCA5A5]"
            aria-label="Remove media"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </article>
  );
}
