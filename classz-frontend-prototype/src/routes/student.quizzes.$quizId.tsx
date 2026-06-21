import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Clock, HelpCircle, Sparkles, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getQuizById } from "@/lib/teacher/teacher-quiz-store";
import { useTeacherQuestionStore } from "@/lib/teacher/teacher-question-store";
import { awardQuizXP, calculateQuizXP } from "@/lib/xp";
import { VictoryScene } from "@/components/illustrations/Characters";

export const Route = createFileRoute("/student/quizzes/$quizId")({
  component: StudentQuizPage,
});

type Phase = "intro" | "active" | "result";

function StudentQuizPage() {
  const { quizId } = Route.useParams();
  const quiz = getQuizById(quizId);
  const allQuestions = useTeacherQuestionStore((s) => s.questions);

  const [phase, setPhase] = useState<Phase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  if (!quiz) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6">
        <HelpCircle className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Quiz Not Found</h1>
        <Button asChild variant="outline" className="rounded-xl"><Link to="/student/courses">Back to Courses</Link></Button>
      </div>
    );
  }

  const questions = quiz.questionIds.map((id) => allQuestions.find((q) => q.id === id)).filter(Boolean);
  const currentQ = questions[currentIndex];

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = () => {
    let correct = 0;
    for (const q of questions) {
      if (!q) continue;
      if (q.type === "mcq" && q.choices) {
        const correctChoice = q.choices.find((c) => c.isCorrect);
        if (correctChoice && answers[q.id] === correctChoice.id) correct++;
      } else if (q.type === "calculation" && q.correctAnswer) {
        if (answers[q.id]?.trim() === q.correctAnswer.trim()) correct++;
      }
    }
    const scorePercent = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    setScore(scorePercent);

    const xpResult = awardQuizXP("current", quizId, scorePercent, 1);
    setXpEarned(xpResult?.xpAmount ?? calculateQuizXP(scorePercent, 1).total);
    setPhase("result");
  };

  // INTRO
  if (phase === "intro") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6">
        <Card className="max-w-md w-full border bg-card p-8 text-center space-y-4">
          <HelpCircle className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          {quiz.description && <p className="text-sm text-muted-foreground">{quiz.description}</p>}
          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><HelpCircle className="h-4 w-4" /> {questions.length} questions</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {quiz.durationMinutes} min</span>
            <span className="flex items-center gap-1"><Sparkles className="h-4 w-4" /> +{quiz.xpReward} XP</span>
          </div>
          <p className="text-xs text-muted-foreground">Pass: {quiz.passingScorePercent}% · Attempts: {quiz.attemptLimit}</p>
          <Button onClick={() => setPhase("active")} className="w-full rounded-xl gradient-brand border-0 text-white" size="lg">
            Start Quiz
          </Button>
          <Button asChild variant="ghost" className="w-full rounded-xl">
            <Link to="/student/courses">Back to Courses</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // RESULT
  if (phase === "result") {
    const passed = score >= quiz.passingScorePercent;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6">
        <Card className="max-w-md w-full border bg-card p-8 text-center space-y-4">
          {score >= 80 && <VictoryScene size="md" className="mx-auto" />}
          <div className={cn("mx-auto grid h-20 w-20 place-items-center rounded-full", passed ? "bg-emerald-500/15" : "bg-rose-500/15")}>
            {passed ? <CheckCircle2 className="h-10 w-10 text-emerald-500" /> : <XCircle className="h-10 w-10 text-rose-500" />}
          </div>
          <h1 className="text-2xl font-bold">{passed ? "Passed!" : "Not Passed"}</h1>
          <p className="text-4xl font-bold">{score}%</p>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 px-4 py-1.5 text-sm font-semibold text-violet-600">
            <Sparkles className="h-4 w-4" /> +{xpEarned} XP
          </div>
          <p className="text-xs text-muted-foreground">Passing score: {quiz.passingScorePercent}%</p>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1 rounded-xl">
              <Link to="/student/courses">My Courses</Link>
            </Button>
            <Button onClick={() => { setPhase("intro"); setAnswers({}); setCurrentIndex(0); }} className="flex-1 rounded-xl gradient-brand border-0 text-white">
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ACTIVE
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Progress */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Question {currentIndex + 1} of {questions.length}</span>
          <Badge variant="outline" className="rounded-full">{quiz.durationMinutes} min</Badge>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>

        {/* Question */}
        {currentQ && (
          <Card className="border bg-card p-6 space-y-4">
            <p className="font-medium">{currentQ.text}</p>

            {currentQ.type === "mcq" && currentQ.choices && (
              <div className="space-y-2">
                {currentQ.choices.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleAnswer(currentQ.id, c.id)}
                    className={cn("flex w-full items-center gap-3 rounded-xl border p-3 text-start text-sm transition-colors", answers[currentQ.id] === c.id ? "border-primary bg-primary/5" : "hover:bg-accent")}
                  >
                    <div className={cn("h-5 w-5 shrink-0 rounded-full border-2", answers[currentQ.id] === c.id ? "border-primary bg-primary" : "border-muted-foreground/30")}>
                      {answers[currentQ.id] === c.id && <div className="m-auto mt-[3px] h-2.5 w-2.5 rounded-full bg-white" />}
                    </div>
                    {c.text}
                  </button>
                ))}
              </div>
            )}

            {currentQ.type === "calculation" && (
              <input
                type="text"
                value={answers[currentQ.id] || ""}
                onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                placeholder="Enter your answer..."
                className="w-full rounded-xl border bg-card px-4 py-2 text-sm"
              />
            )}

            {currentQ.type === "essay" && (
              <textarea
                value={answers[currentQ.id] || ""}
                onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                rows={4}
                placeholder="Write your answer..."
                className="w-full rounded-xl border bg-card px-4 py-2 text-sm resize-none"
              />
            )}
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" className="rounded-xl" disabled={currentIndex === 0} onClick={() => setCurrentIndex(currentIndex - 1)}>Previous</Button>
          {currentIndex < questions.length - 1 ? (
            <Button className="rounded-xl gradient-brand border-0 text-white" onClick={() => setCurrentIndex(currentIndex + 1)}>Next</Button>
          ) : (
            <Button className="rounded-xl gradient-brand border-0 text-white" onClick={handleSubmit}>Submit Quiz</Button>
          )}
        </div>
      </div>
    </div>
  );
}
