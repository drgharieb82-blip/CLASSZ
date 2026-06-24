import { useRef } from "react";
import { ArrowLeft, ArrowRight, CircleDot, FlaskConical, NotebookText, PlayCircle, Rocket, Sparkles, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientButton } from "@/components/premium/GradientButton";
import { useApp } from "@/lib/app-context";

interface MissionItem {
  icon?: string;
  course: string;
  action: string;
  meta?: string;
  type: "lesson" | "practice" | "revision";
}

interface ContinueLearningData {
  courseEmoji: string;
  courseName: string;
  lessonTitle: string;
  progress: number;
}

interface TodayMissionCardProps {
  mustDo: MissionItem[];
  recommended: MissionItem[];
  optional: MissionItem[];
  continueLearning: ContinueLearningData;
}

const sectionConfig = {
  mustDo: {
    title: "Must Do Today",
    accent: "text-rose-300",
    dot: "bg-rose-400",
    suffix: "",
  },
  recommended: {
    title: "Recommended",
    accent: "text-amber-300",
    dot: "bg-amber-400",
    suffix: "",
  },
  optional: {
    title: "Optional",
    accent: "text-sky-300",
    dot: "bg-sky-400",
    suffix: "(if you have time)",
  },
} as const;

const typeIcons = {
  flask: FlaskConical,
  target: Target,
  ring: CircleDot,
  play: PlayCircle,
  spark: Sparkles,
  note: NotebookText,
  bulb: Sparkles,
  flashcards: CircleDot,
} as const;

const itemColors = {
  lesson: "text-violet-300",
  practice: "text-amber-300",
  revision: "text-sky-300",
} as const;

function MissionSection({
  label,
  items,
}: {
  label: keyof typeof sectionConfig;
  items: MissionItem[];
}) {
  const { t } = useApp();
  const config = sectionConfig[label];

  return (
    <div className="min-w-0 rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={cn("h-2.5 w-2.5 rounded-full", config.dot)} />
        <p className={cn("text-xs font-semibold uppercase tracking-[0.22em]", config.accent)}>
          {t(config.title)}
        </p>
        {config.suffix ? <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{t(config.suffix)}</span> : null}
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = typeIcons[(item.icon as keyof typeof typeIcons) ?? "ring"] ?? CircleDot;
          return (
            <div key={`${item.course}-${item.action}`} className="flex min-w-0 items-center gap-3">
              <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/[0.04]", itemColors[item.type])}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{item.action}</p>
              </div>
              {item.meta ? (
                <span className="shrink-0 rounded-xl border border-white/8 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-400">
                  {item.meta}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TodayMissionCard({ mustDo, recommended, optional, continueLearning }: TodayMissionCardProps) {
  const { t } = useApp();
  const sectionsRef = useRef<HTMLDivElement>(null);

  const scrollSections = (direction: "left" | "right") => {
    const node = sectionsRef.current;
    if (!node) return;

    node.scrollBy({
      left: direction === "right" ? 320 : -320,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-violet-500/15 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_32%),linear-gradient(180deg,rgba(14,19,39,0.98),rgba(10,14,29,0.94))] p-6 shadow-[0_28px_80px_rgba(4,6,20,0.45)] backdrop-blur-2xl">
      <div className="absolute inset-y-0 end-0 w-72 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.18),transparent_65%)]" />
      <div className="relative">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-violet-300">
              <Rocket className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.24em]">{t("Today's Mission")}</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">{t("What will you achieve today?")}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollSections("left")}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-200 transition-colors hover:bg-white/[0.08]"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => scrollSections("right")}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-200 transition-colors hover:bg-white/[0.08]"
            >
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div ref={sectionsRef} className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="min-w-[320px] flex-1 xl:min-w-0">
              <MissionSection label="mustDo" items={mustDo} />
            </div>
            <div className="min-w-[320px] flex-1 xl:min-w-0">
              <MissionSection label="recommended" items={recommended} />
            </div>
            <div className="min-w-[320px] flex-1 xl:min-w-0">
              <MissionSection label="optional" items={optional} />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <GradientButton className="h-20 w-full justify-center rounded-[22px] text-lg">
              <Rocket className="h-5 w-5" /> {t("Start Today")}
            </GradientButton>
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <p className="text-sm text-slate-400">{t("Discipline today")}</p>
              <p className="mt-1 text-lg font-medium text-white">{t("Success tomorrow")}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex min-w-0 items-center gap-3 rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3">
          <span className="text-lg">{continueLearning.courseEmoji}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{continueLearning.lessonTitle}</p>
            <p className="truncate text-xs text-slate-400">{continueLearning.courseName}</p>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,#7c3aed,#8b5cf6,#22d3ee)]" style={{ width: `${continueLearning.progress}%` }} />
            </div>
            <span className="text-xs font-semibold text-slate-300">{continueLearning.progress}%</span>
          </div>
          <button className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-violet-300 transition-colors hover:text-white">
            {t("Resume")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}
