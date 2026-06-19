import { Link } from "@tanstack/react-router";
import { Bot, Brain, CalendarDays, Sparkles, ClipboardList, RotateCcw } from "lucide-react";
import { GradientButton } from "@/components/premium/GradientButton";

export function AICoachCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card/70 p-6">
      <div className="absolute -end-16 -top-16 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -end-8 bottom-0 h-32 w-32 rounded-full bg-brand-2/5 blur-2xl" />
      <div className="relative">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl gradient-brand text-white shadow-lg glow">
            <Bot className="h-6 w-6" />
          </span>
          <div>
            <h3 className="text-base font-bold tracking-tight">AI Coach</h3>
            <p className="text-xs text-muted-foreground">Your personal study assistant</p>
          </div>
        </div>

        <div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            "Focus on <span className="font-semibold text-foreground">Chemical Equilibrium</span> and{" "}
            <span className="font-semibold text-foreground">Newton's Third Law</span> today.
            You've been weak on these for several days. I recommend 30 minutes of targeted practice
            followed by a quick quiz to check retention."
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          <GradientButton variant="outline" size="sm" asChild>
            <Link to="/assistant/study-plan"><CalendarDays className="h-3.5 w-3.5" /> Study Plan</Link>
          </GradientButton>
          <GradientButton variant="outline" size="sm" asChild>
            <Link to="/assistant"><ClipboardList className="h-3.5 w-3.5" /> Gen. Quiz</Link>
          </GradientButton>
          <GradientButton variant="outline" size="sm" asChild>
            <Link to="/assistant/analyze"><Brain className="h-3.5 w-3.5" /> Weak Points</Link>
          </GradientButton>
          <GradientButton variant="outline" size="sm" asChild>
            <Link to="/assistant"><RotateCcw className="h-3.5 w-3.5" /> Review Due</Link>
          </GradientButton>
          <GradientButton variant="outline" size="sm" asChild className="col-span-2 sm:col-span-1">
            <Link to="/assistant"><Sparkles className="h-3.5 w-3.5" /> Ask Anything</Link>
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
