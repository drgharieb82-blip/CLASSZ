import { Clock, PlayCircle, Video as VideoIcon } from "lucide-react";

import { formatDuration, type Video } from "./api";

export function VideoPlaceholderCard({ video }: { video: Video }) {
  return (
    <article className="overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.06] shadow-[0_16px_40px_rgba(0,0,0,0.20)] backdrop-blur">
      <div className="relative aspect-video bg-[#111827]">
        {video.thumbnail_url ? (
          <img src={video.thumbnail_url} alt={video.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#111827] via-[#1E1B4B] to-[#312E81]">
            <VideoIcon className="h-14 w-14 text-[#A855F7]" aria-hidden="true" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/86 via-transparent to-transparent" />
        <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#F8FAFC] backdrop-blur">
          <PlayCircle className="h-4 w-4 text-[#A855F7]" aria-hidden="true" />
          {video.provider}
        </div>
        <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 className="font-[Poppins] text-2xl font-semibold text-[#F8FAFC]">{video.title}</h2>
            <p className="mt-2 text-sm text-[#CBD5E1]">Streaming integration coming in Phase 2B.2</p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-2xl bg-white/[0.10] px-3 py-2 text-sm font-semibold text-[#F8FAFC]">
            <Clock className="h-4 w-4 text-[#3B82F6]" aria-hidden="true" />
            {formatDuration(video.duration_seconds)}
          </span>
        </div>
      </div>
    </article>
  );
}
