import { Clock, GraduationCap, Play, Radio } from "lucide-react";

import { formatDuration, type Video } from "./api";

type VideoPlayerCardProps = {
  video: Video;
  teacherName: string;
};

export function VideoPlayerCard({ video, teacherName }: VideoPlayerCardProps) {
  return (
    <article className="overflow-hidden rounded-[20px] border border-white/10 bg-[#111827] shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
      <div className="relative aspect-video bg-[#0F172A]">
        {video.thumbnail_url ? (
          <img src={video.thumbnail_url} alt={video.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#312E81]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/92 via-[#0F172A]/18 to-transparent" />
        <button
          type="button"
          className="absolute left-1/2 top-1/2 inline-flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/[0.12] text-white shadow-[0_24px_70px_rgba(0,0,0,0.30)] backdrop-blur transition hover:scale-105 hover:bg-white/[0.18] focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
          aria-label="Preview video placeholder"
        >
          <Play className="ml-1 h-9 w-9 fill-current" aria-hidden="true" />
        </button>
        <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#F8FAFC] backdrop-blur">
                <Radio className="h-4 w-4 text-[#A855F7]" aria-hidden="true" />
                {video.provider}
              </span>
              <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-[#CBD5E1] backdrop-blur">
                <Clock className="h-4 w-4 text-[#3B82F6]" aria-hidden="true" />
                {formatDuration(video.duration_seconds)}
              </span>
            </div>
            <h1 className="mt-4 font-[Poppins] text-3xl font-semibold leading-tight text-[#F8FAFC] lg:text-4xl">
              {video.title}
            </h1>
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#CBD5E1]">
              <GraduationCap className="h-4 w-4 text-[#A855F7]" aria-hidden="true" />
              {teacherName}
            </p>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[#CBD5E1]">Streaming integration coming in Phase 2B.2</p>
        </div>
      </div>
    </article>
  );
}
