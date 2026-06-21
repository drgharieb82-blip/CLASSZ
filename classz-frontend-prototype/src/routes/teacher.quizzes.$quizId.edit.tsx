import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Shield } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { getQuizById } from "@/lib/teacher/teacher-quiz-store";
import { useTeacherQuestionStore } from "@/lib/teacher/teacher-question-store";

export const Route = createFileRoute("/teacher/quizzes/$quizId/edit")({
  component: EditQuizPage,
});

function EditQuizPage() {
  const { quizId } = Route.useParams();
  const quiz = getQuizById(quizId);
  const questions = useTeacherQuestionStore((s) => s.questions);

  if (!quiz) {
    return (
      <DashPage role="teacher" title="Quiz Not Found" subtitle="" icon={ROLES.teacher.icon}>
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
          <Shield className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Quiz not found</h2>
          <Button asChild variant="outline" className="rounded-xl"><Link to="/teacher/quizzes">Back to Quizzes</Link></Button>
        </Card>
      </DashPage>
    );
  }

  const quizQuestions = quiz.questionIds.map((id) => questions.find((q) => q.id === id)).filter(Boolean);

  return (
    <DashPage role="teacher" title={`Edit: ${quiz.title}`} subtitle={quiz.publicCode} icon={ROLES.teacher.icon}>
      <Link to="/teacher/quizzes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Quizzes
      </Link>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{quiz.questionIds.length}</p>
          <p className="text-xs text-muted-foreground">Questions</p>
        </Card>
        <Card className="border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{quiz.durationMinutes} min</p>
          <p className="text-xs text-muted-foreground">Duration</p>
        </Card>
        <Card className="border bg-card p-4 text-center">
          <p className="text-2xl font-bold">+{quiz.xpReward} XP</p>
          <p className="text-xs text-muted-foreground">Reward</p>
        </Card>
      </div>

      <Card className="border bg-card p-5">
        <h3 className="font-semibold mb-3">Questions in this Quiz</h3>
        <div className="space-y-2">
          {quizQuestions.map((q, i) => (
            q && (
              <div key={q.id} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                <Badge variant="outline" className="rounded text-xs">{q.type.toUpperCase()}</Badge>
                <p className="text-xs flex-1 truncate">{q.text}</p>
                <Badge variant="outline" className="rounded-full text-xs capitalize">{q.difficulty}</Badge>
              </div>
            )
          ))}
          {quizQuestions.length === 0 && <p className="text-sm text-muted-foreground">No questions added yet.</p>}
        </div>
      </Card>

      <Card className="border bg-card p-5 space-y-2">
        <h3 className="font-semibold text-sm">Settings</h3>
        <div className="grid gap-2 text-xs sm:grid-cols-2">
          <p>Passing score: <strong>{quiz.passingScorePercent}%</strong></p>
          <p>Attempt limit: <strong>{quiz.attemptLimit}</strong></p>
          <p>Shuffle questions: <strong>{quiz.shuffleQuestions ? "Yes" : "No"}</strong></p>
          <p>Shuffle choices: <strong>{quiz.shuffleChoices ? "Yes" : "No"}</strong></p>
          <p>Show answers: <strong>{quiz.showAnswersAfterSubmit ? "Yes" : "No"}</strong></p>
          <p>Show explanations: <strong>{quiz.showExplanationAfterSubmit ? "Yes" : "No"}</strong></p>
          <p>Status: <strong>{quiz.status}</strong></p>
          <p>Visibility: <strong>{quiz.visibility}</strong></p>
        </div>
      </Card>
    </DashPage>
  );
}
