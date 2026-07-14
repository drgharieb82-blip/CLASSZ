import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X, ChevronRight, RotateCcw, Trophy } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { GlowCard } from "@/components/premium/GlowCard";
import { GradientButton } from "@/components/premium/GradientButton";
import { ProgressRing } from "@/components/premium/AnimatedStats";
import { Progress } from "@/components/ui/progress";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { quizQuestions } from "@/lib/mock";

export const Route = createFileRoute("/quiz/start")({
  component: QuizPage,
});

function QuizPage() {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = quizQuestions[idx];
  const progress = ((idx + (revealed ? 1 : 0)) / quizQuestions.length) * 100;

  const choose = (i: number) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    if (i === q.correct) setScore((s) => s + 1);
  };
  const next = () => {
    if (idx + 1 >= quizQuestions.length) { setDone(true); return; }
    setIdx((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  };
  const restart = () => { setIdx(0); setSelected(null); setRevealed(false); setScore(0); setDone(false); };

  return (
    <DashPage role="student" title="Calculus Weekly Quiz" subtitle="5 questions · timed practice" icon={ROLES.student.icon}>
      {done ? (
        <GlowCard glow className="mx-auto max-w-lg">
          <div className="flex flex-col items-center gap-4 p-10 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl gradient-brand text-white shadow-lg"><Trophy className="h-7 w-7" /></span>
            <h2 className="text-2xl font-bold">Quiz complete!</h2>
            <ProgressRing value={Math.round((score / quizQuestions.length) * 100)} label="score" />
            <p className="text-muted-foreground">You got {score} of {quizQuestions.length} correct.</p>
            <GradientButton onClick={restart}><RotateCcw className="h-4 w-4" /> Try again</GradientButton>
          </div>
        </GlowCard>
      ) : (
        <GlowCard className="mx-auto max-w-2xl">
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>Question {idx + 1} of {quizQuestions.length}</span>
              <span>Score: {score}</span>
            </div>
            <Progress value={progress} className="mb-6 h-1.5" />
            <h2 className="text-lg font-semibold">{q.text}</h2>
            <div className="mt-5 space-y-3">
              {q.options.map((opt, i) => {
                const correct = revealed && i === q.correct;
                const wrong = revealed && i === selected && i !== q.correct;
                return (
                  <button
                    key={i}
                    onClick={() => choose(i)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-start text-sm transition-colors",
                      !revealed && "hover:bg-accent",
                      correct && "border-success bg-success/10",
                      wrong && "border-destructive bg-destructive/10",
                    )}
                  >
                    <span>{opt}</span>
                    {correct && <Check className="h-4 w-4 text-success" />}
                    {wrong && <X className="h-4 w-4 text-destructive" />}
                  </button>
                );
              })}
            </div>
            {revealed && (
              <div className="mt-5 rounded-xl border bg-accent/40 p-4 text-sm">
                <p className="font-semibold">Explanation</p>
                <p className="mt-1 text-muted-foreground">{q.explain}</p>
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <GradientButton onClick={next} disabled={!revealed}>
                {idx + 1 >= quizQuestions.length ? "Finish" : "Next"} <ChevronRight className="h-4 w-4" />
              </GradientButton>
            </div>
          </div>
        </GlowCard>
      )}
    </DashPage>
  );
}
