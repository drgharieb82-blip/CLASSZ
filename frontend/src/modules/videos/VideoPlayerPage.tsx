import { useQuery } from "@tanstack/react-query";
import { AlertCircle, MessageCircle, NotebookPen, Paperclip, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import type { LessonBlock } from "../courses/api";
import { BlockRenderer } from "../lesson-builder";
import { BottomNavigation } from "./BottomNavigation";
import { CourseSidebar } from "./CourseSidebar";
import { getVideo } from "./api";
import { type ChapterItem } from "./ChapterAccordion";
import { TabNavigation, type PlayerTab } from "./TabNavigation";
import { VideoPlayerCard } from "./VideoPlayerCard";

const courseTitle = "Modern Learning Systems";
const teacherName = "Dr. Sarah Morgan";
const progressPercent = 42;

const chapters: ChapterItem[] = [
  {
    id: "chapter-1",
    title: "Foundations",
    lessons: [
      { id: "lesson-1", title: "Learning platform overview", status: "completed" },
      { id: "lesson-2", title: "Current video lesson", status: "current" },
      { id: "lesson-3", title: "Designing better study flows", status: "locked" },
    ],
  },
  {
    id: "chapter-2",
    title: "Applied Practice",
    lessons: [
      { id: "lesson-4", title: "Course workspace patterns", status: "locked" },
      { id: "lesson-5", title: "Student reflection loop", status: "locked" },
    ],
  },
];

export function VideoPlayerPage() {
  const { videoId } = useParams();
  const [activeTab, setActiveTab] = useState<PlayerTab>("overview");

  const { data: video, isError, isLoading } = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => getVideo(videoId ?? ""),
    enabled: Boolean(videoId),
  });

  const overviewBlocks = useMemo<LessonBlock[]>(
    () => {
      if (!video) {
        return [];
      }

      return [
        {
          id: `${video.id}-overview-text`,
          lesson_id: video.lesson_block_id,
          block_type: "TEXT",
          position: 0,
          data_json: {
            content:
              "This overview area uses the existing content block renderer. Text, document, image, and attachment cards stay aligned with the lesson page foundation while the player UI remains metadata-only.",
          },
          created_at: video.created_at,
        },
        {
          id: `${video.id}-overview-pdf`,
          lesson_id: video.lesson_block_id,
          block_type: "PDF",
          position: 1,
          data_json: {
            file_url: "",
            title: "Lesson reference notes",
          },
          created_at: video.created_at,
        },
        {
          id: `${video.id}-overview-image`,
          lesson_id: video.lesson_block_id,
          block_type: "IMAGE",
          position: 2,
          data_json: {
            image_url: video.thumbnail_url ?? "",
            caption: video.thumbnail_url ? "Lesson thumbnail preview" : "Visual summary placeholder",
          },
          created_at: video.created_at,
        },
        {
          id: `${video.id}-overview-attachment`,
          lesson_id: video.lesson_block_id,
          block_type: "ATTACHMENT",
          position: 3,
          data_json: {
            file_url: "",
            filename: "Practice worksheet",
          },
          created_at: video.created_at,
        },
      ];
    },
    [video]
  );

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
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link to="/courses" className="text-sm font-semibold text-[#A855F7] transition hover:text-[#C084FC]">
          Back to courses
        </Link>
        <span className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
          Streaming integration coming in Phase 2B.2
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <CourseSidebar courseTitle={courseTitle} progressPercent={progressPercent} chapters={chapters} />

        <main className="min-w-0 space-y-6">
          <VideoPlayerCard video={video} teacherName={teacherName} />

          <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="p-5 sm:p-6">
              {activeTab === "overview" && (
                <div className="space-y-5">
                  {overviewBlocks.map((block) => (
                    <BlockRenderer key={block.id} block={block} />
                  ))}
                </div>
              )}

              {activeTab === "notes" && (
                <EmptyTab
                  icon={NotebookPen}
                  title="Notes"
                  description="Personal lesson notes will sit here when the notes workflow arrives."
                />
              )}

              {activeTab === "attachments" && (
                <EmptyTab
                  icon={Paperclip}
                  title="Attachments"
                  description="Downloadable lesson files will collect here without changing the video API."
                />
              )}

              {activeTab === "discussion" && (
                <EmptyTab
                  icon={MessageCircle}
                  title="Discussion"
                  description="Class conversation will appear here in a later collaboration phase."
                />
              )}
            </div>
          </section>

          <BottomNavigation />
        </main>
      </div>
    </div>
  );
}

function EmptyTab({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[20px] border border-dashed border-white/15 bg-white/[0.06] p-8 text-center">
      <Icon className="mx-auto h-8 w-8 text-[#A855F7]" aria-hidden="true" />
      <h2 className="mt-4 font-[Poppins] text-xl font-semibold text-[#F8FAFC]">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl leading-7 text-[#94A3B8]">{description}</p>
    </div>
  );
}
