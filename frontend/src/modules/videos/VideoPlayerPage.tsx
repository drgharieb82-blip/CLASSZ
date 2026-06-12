import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Database, Film } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { getVideo } from "./api";
import { VideoPlaceholderCard } from "./VideoPlaceholderCard";

export function VideoPlayerPage() {
  const { videoId } = useParams();

  const { data: video, isError, isLoading } = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => getVideo(videoId ?? ""),
    enabled: Boolean(videoId),
  });

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-[20px] bg-white/[0.06]" />;
  }

  if (isError || !video) {
    return (
      <section className="rounded-[20px] border border-[#EF4444]/30 bg-[#EF4444]/10 p-8 text-[#FCA5A5]">
        <AlertCircle className="mb-3 h-6 w-6" aria-hidden="true" />
        Video could not be loaded.
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/courses" className="text-sm font-semibold text-[#A855F7]">
        Back to courses
      </Link>

      <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#A855F7]">
              <Film className="h-4 w-4" aria-hidden="true" />
              Video foundation
            </p>
            <h1 className="mt-3 font-[Poppins] text-4xl font-semibold text-[#F8FAFC]">{video.title}</h1>
            <p className="mt-3 max-w-2xl leading-7 text-[#CBD5E1]">
              Streaming integration coming in Phase 2B.2
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#3B82F6]/15 px-4 py-2 text-sm font-semibold text-[#93C5FD]">
            <Database className="h-4 w-4" aria-hidden="true" />
            Metadata only
          </span>
        </div>
      </section>

      <VideoPlaceholderCard video={video} />
    </div>
  );
}
