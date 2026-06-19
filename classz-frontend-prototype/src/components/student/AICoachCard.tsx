import { Link } from "@tanstack/react-router";
import { Bot, Brain, CalendarDays, ClipboardList, MessageSquareText, RotateCcw } from "lucide-react";
import { GradientButton } from "@/components/premium/GradientButton";

interface AICoachCardProps {
  summary: string;
  plan: string[];
}

export function AICoachCard({ summary, plan }: AICoachCardProps) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,42,0.96),rgba(10,14,28,0.92))] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.26)] backdrop-blur-xl">
      <div className="absolute -left-8 top-8 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="relative">
        <div className="mb-5 flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[22px] bg-[linear-gradient(135deg,#60a5fa,#8b5cf6,#c026d3)] text-white shadow-[0_14px_35px_rgba(99,102,241,0.35)]">
            <Bot className="h-7 w-7" />
          </span>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">AI Coach</h3>
            <p className="mt-1 text-sm text-slate-400">Your personal study coach</p>
          </div>
        </div>

        <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-5 py-4">
          <p className="text-sm leading-7 text-slate-200">{summary}</p>
          <div className="mt-4 space-y-2">
            {plan.map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
          <GradientButton variant="outline" size="sm" asChild>
            <Link to="/assistant/study-plan"><CalendarDays className="h-3.5 w-3.5" /> Build Study Plan</Link>
          </GradientButton>
          <GradientButton variant="outline" size="sm" asChild>
            <Link to="/assistant"><ClipboardList className="h-3.5 w-3.5" /> Generate Quiz</Link>
          </GradientButton>
          <GradientButton variant="outline" size="sm" asChild>
            <Link to="/assistant/analyze"><Brain className="h-3.5 w-3.5" /> Explain Weak Points</Link>
          </GradientButton>
          <GradientButton variant="outline" size="sm" asChild>
            <Link to="/assistant"><RotateCcw className="h-3.5 w-3.5" /> Review Due Lessons</Link>
          </GradientButton>
          <GradientButton variant="outline" size="sm" asChild>
            <Link to="/assistant"><MessageSquareText className="h-3.5 w-3.5" /> Ask Anything</Link>
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
