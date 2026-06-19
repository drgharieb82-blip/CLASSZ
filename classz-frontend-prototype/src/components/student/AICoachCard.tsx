import { Link } from "@tanstack/react-router";
import { Bot, Brain, CalendarDays, Sparkles, ClipboardList, RotateCcw } from "lucide-react";
import { GradientButton } from "@/components/premium/GradientButton";

export function AICoachCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card/70 p-6">
      <div className="absolute -end-12 -top-12 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
      <div className="relative">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-white shadow glow">
            <Bot className="h-5 w-5" />
          </span>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">AI Coach</h3>
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
            <Link to="/assistant"><ClipboardList className="h-3.5 w-3.5" /> Generate Quiz</Link>
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
