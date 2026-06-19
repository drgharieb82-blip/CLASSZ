import { Link } from "@tanstack/react-router";
import { Bot, Brain, CalendarDays, Sparkles } from "lucide-react";
import { GradientButton } from "@/components/premium/GradientButton";

export function AICoachCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card/70 p-5">
      <div className="absolute -end-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
      <div className="relative">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl gradient-brand text-white shadow">
            <Bot className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">AI Coach</h3>
        </div>

        <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <p className="text-sm text-muted-foreground">
            "Based on your recent performance, I recommend focusing on <span className="font-semibold text-foreground">Chemical Equilibrium</span> and <span className="font-semibold text-foreground">Newton's Third Law</span> today. You've been weak on these for a few days."
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <GradientButton variant="outline" size="sm" asChild>
            <Link to="/assistant/analyze"><Brain className="h-3.5 w-3.5" /> My weak spots</Link>
          </GradientButton>
          <GradientButton variant="outline" size="sm" asChild>
            <Link to="/assistant/study-plan"><CalendarDays className="h-3.5 w-3.5" /> Study plan</Link>
          </GradientButton>
          <GradientButton variant="outline" size="sm" asChild className="col-span-2 sm:col-span-1">
            <Link to="/assistant"><Sparkles className="h-3.5 w-3.5" /> Ask anything</Link>
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
