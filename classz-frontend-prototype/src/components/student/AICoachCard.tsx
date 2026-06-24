import { Link } from "@tanstack/react-router";
import { Bot, Brain, CalendarDays, ClipboardList, MessageSquareText, RotateCcw } from "lucide-react";
import { GradientButton } from "@/components/premium/GradientButton";
import { useApp } from "@/lib/app-context";

interface AICoachCardProps {
  summary: string;
  plan: string[];
}

export function AICoachCard({ summary, plan }: AICoachCardProps) {
  const { t } = useApp();

  return (
    <div className="relative min-w-0 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.26)] backdrop-blur-xl md:p-6">
      <div className="absolute -start-8 top-8 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute end-0 top-0 h-36 w-36 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="relative min-w-0 overflow-hidden">
        <div className="mb-5 flex min-w-0 flex-wrap items-center justify-between gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[22px] bg-[linear-gradient(135deg,#60a5fa,#8b5cf6,#c026d3)] text-white shadow-[0_14px_35px_rgba(99,102,241,0.35)]">
            <Bot className="h-7 w-7" />
          </span>
          <div className="min-w-0 flex-1 overflow-hidden">
            <h3 className="text-[11.76px] font-semibold uppercase tracking-[0.22em] text-cyan-200">{t("student.aiCoach")}</h3>
            <p className="mt-1 break-words text-[11.76px] text-slate-400">{t("student.personalStudyCoach")}</p>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-[22px] border border-white/8 bg-white/[0.03] p-5">
          <p className="break-words text-[9.8px] leading-5 text-slate-200">{summary}</p>
          <div className="mt-4 space-y-2.5">
            {plan.map((item) => (
              <div key={item} className="flex min-w-0 items-start gap-2.5 text-[9.8px] text-slate-300">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                <span className="min-w-0 break-words">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <GradientButton variant="outline" size="sm" className="w-full justify-center text-[9.8px] sm:w-auto sm:max-w-full" asChild>
            <Link to="/assistant/study-plan" className="min-w-0 max-w-full flex-1 justify-center break-words px-3 text-center sm:flex-none">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" /> {t("student.buildStudyPlan")}
            </Link>
          </GradientButton>
          <GradientButton variant="outline" size="sm" className="w-full justify-center text-[9.8px] sm:w-auto sm:max-w-full" asChild>
            <Link to="/assistant" className="min-w-0 max-w-full flex-1 justify-center break-words px-3 text-center sm:flex-none">
              <ClipboardList className="h-3.5 w-3.5 shrink-0" /> {t("student.generateQuiz")}
            </Link>
          </GradientButton>
          <GradientButton variant="outline" size="sm" className="w-full justify-center text-[9.8px] sm:w-auto sm:max-w-full" asChild>
            <Link to="/assistant/analyze" className="min-w-0 max-w-full flex-1 justify-center break-words px-3 text-center sm:flex-none">
              <Brain className="h-3.5 w-3.5 shrink-0" /> {t("student.explainWeakPoints")}
            </Link>
          </GradientButton>
          <GradientButton variant="outline" size="sm" className="w-full justify-center text-[9.8px] sm:w-auto sm:max-w-full" asChild>
            <Link to="/assistant" className="min-w-0 max-w-full flex-1 justify-center break-words px-3 text-center sm:flex-none">
              <RotateCcw className="h-3.5 w-3.5 shrink-0" /> {t("student.reviewDueLessons")}
            </Link>
          </GradientButton>
          <GradientButton variant="outline" size="sm" className="w-full justify-center text-[9.8px] sm:w-auto sm:max-w-full" asChild>
            <Link to="/assistant" className="min-w-0 max-w-full flex-1 justify-center break-words px-3 text-center sm:flex-none">
              <MessageSquareText className="h-3.5 w-3.5 shrink-0" /> {t("student.askAnything")}
            </Link>
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
