import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Archive,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  Layers3,
  Link2,
  Trash2,
  Trophy,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { DashPage } from "@/components/common/DashPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ASSESSMENT_TYPE_LABELS,
  useTeacherAssessmentStore,
} from "@/lib/teacher/teacher-assessment-store";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";
import { useTeacherChapterStore } from "@/lib/teacher/teacher-chapter-store";
import { useTeacherLessonStore } from "@/lib/teacher/teacher-lesson-store";
import { useTeacherQuestionStore } from "@/lib/teacher/teacher-question-store";
import { useTeacherSessionStore } from "@/lib/teacher/teacher-session-store";

export const Route = createFileRoute("/teacher/assessments/$assessmentId")({
  component: TeacherAssessmentPreviewPage,
});

function TeacherAssessmentPreviewPage() {
  const navigate = useNavigate();
  const { assessmentId } = Route.useParams();
  const assessment = useTeacherAssessmentStore((state) =>
    state.assessments.find((entry) => entry.id === assessmentId),
  );
  const publishAssessment = useTeacherAssessmentStore((state) => state.publishAssessment);
  const unpublishAssessment = useTeacherAssessmentStore((state) => state.unpublishAssessment);
  const archiveAssessment = useTeacherAssessmentStore((state) => state.archiveAssessment);
  const deleteAssessment = useTeacherAssessmentStore((state) => state.deleteAssessment);
  const duplicateAssessment = useTeacherAssessmentStore((state) => state.duplicateAssessment);
  const questions = useTeacherQuestionStore((state) => state.questions);
  const courses = useTeacherCourseStore((state) => state.courses);
  const chapters = useTeacherChapterStore((state) => state.chapters);
  const lessons = useTeacherLessonStore((state) => state.lessons);
  const sessions = useTeacherSessionStore((state) => state.sessions);

  if (!assessment) {
    return (
      <DashPage
        role="teacher"
        title="Assessment Not Found"
        subtitle="The requested assessment could not be loaded."
        icon={ClipboardList}
      >
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">Return to Assessment Engine and pick another item.</p>
          <Button asChild>
            <Link to="/teacher/content-studio" onClick={() => sessionStorage.setItem("classz-content-studio-tab", "assessments")}>
              Back to Assessment Engine
            </Link>
          </Button>
        </Card>
      </DashPage>
    );
  }

  const linkedQuestions = assessment.questionIds
    .map((questionId) => questions.find((question) => question.id === questionId))
    .filter((question): question is NonNullable<typeof question> => Boolean(question));
  const linkedCourses = courses.filter((course) => (assessment.courseIds || []).includes(course.id));
  const linkedChapters = chapters.filter((chapter) => (assessment.chapterIds || []).includes(chapter.id));
  const linkedLessons = lessons.filter((lesson) => (assessment.lessonIds || []).includes(lesson.id));
  const linkedSessions = sessions.filter((session) => (assessment.sessionIds || []).includes(session.id));

  const handleDuplicate = () => {
    const duplicated = duplicateAssessment(assessment.id);
    if (duplicated) {
      toast.success("Assessment duplicated as draft.");
    }
  };

  const handlePublishToggle = () => {
    if (assessment.status === "published") {
      unpublishAssessment(assessment.id);
      toast.success("Assessment moved back to draft.");
      return;
    }

    publishAssessment(assessment.id);
    toast.success("Assessment published.");
  };

  const handleArchive = () => {
    archiveAssessment(assessment.id);
    toast.success("Assessment archived.");
  };

  const handleDelete = () => {
    deleteAssessment(assessment.id);
    toast.success("Assessment deleted.");
    sessionStorage.setItem("classz-content-studio-tab", "assessments");
    navigate({ to: "/teacher/content-studio" });
  };

  return (
    <DashPage
      role="teacher"
      title={assessment.title}
      subtitle={assessment.description || "Assessment preview"}
      icon={ClipboardList}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-xl"
          onClick={() => {
            sessionStorage.setItem("classz-content-studio-tab", "assessments");
            navigate({ to: "/teacher/content-studio" });
          }}
        >
          <ArrowLeft className="me-1.5 h-4 w-4" />
          Back to Assessment Engine
        </Button>
        <Badge variant="outline" className="rounded-full">{assessment.publicCode}</Badge>
        <Badge variant="outline" className="rounded-full">{ASSESSMENT_TYPE_LABELS[assessment.assessmentType]}</Badge>
        <Badge variant="outline" className="rounded-full capitalize">{assessment.status}</Badge>
        <Badge variant="outline" className="rounded-full capitalize">{assessment.visibility || "enrolled_only"}</Badge>
        <div className="ms-auto flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link to="/teacher/assessments/$assessmentId/edit" params={{ assessmentId: assessment.id }}>
              <Edit3 className="me-1.5 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={handleDuplicate}>
            <Copy className="me-1.5 h-4 w-4" />
            Duplicate
          </Button>
          <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={handlePublishToggle}>
            {assessment.status === "published" ? <EyeOff className="me-1.5 h-4 w-4" /> : <Upload className="me-1.5 h-4 w-4" />}
            {assessment.status === "published" ? "Unpublish" : "Publish"}
          </Button>
          <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={handleArchive}>
            <Archive className="me-1.5 h-4 w-4" />
            Archive
          </Button>
          <Button type="button" variant="destructive" size="sm" className="rounded-xl" onClick={handleDelete}>
            <Trash2 className="me-1.5 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card className="border bg-card p-5">
            <h2 className="text-sm font-semibold">Identity</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <PreviewField label="Title" value={assessment.title} />
              <PreviewField label="Subtitle" value={assessment.subtitle} />
              <PreviewField label="Description" value={assessment.description} className="md:col-span-2" />
              <PreviewField label="Instructions" value={assessment.instructions} className="md:col-span-2" />
            </div>
          </Card>

          <Card className="border bg-card p-5">
            <h2 className="text-sm font-semibold">Question Usage</h2>
            <div className="mt-4 space-y-3">
              {linkedQuestions.length === 0 ? (
                <Card className="border-dashed p-4 text-sm text-muted-foreground">
                  No questions selected.
                </Card>
              ) : (
                linkedQuestions.map((question) => (
                  <div key={question.id} className="flex flex-wrap items-center gap-3 rounded-2xl border p-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="rounded-full font-mono text-[10px]">{question.publicCode}</Badge>
                        <Badge variant="outline" className="rounded-full text-[10px] capitalize">{question.type.replace(/_/g, " ")}</Badge>
                        <Badge variant="outline" className="rounded-full text-[10px] capitalize">{question.difficulty}</Badge>
                      </div>
                      <p className="mt-2 text-sm font-medium">{question.title || question.text}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Points: {question.points ?? 1} · Time: {question.estimatedTimeSeconds ? `${question.estimatedTimeSeconds}s` : "—"}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="rounded-xl">
                      <Link to="/teacher/questions/$questionId/edit" params={{ questionId: question.id }}>
                        Edit Question
                      </Link>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="border bg-card p-5">
            <h2 className="text-sm font-semibold">Analytics</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <AnalyticsCard icon={Layers3} label="Attempts" value="—" />
              <AnalyticsCard icon={CheckCircle2} label="Average Score" value="—" />
              <AnalyticsCard icon={Clock} label="Average Time" value="—" />
              <AnalyticsCard icon={Trophy} label="Success Rate" value="—" />
              <AnalyticsCard icon={Eye} label="Most Wrong Questions" value="No backend analytics yet" />
              <AnalyticsCard icon={Link2} label="Weak Concepts" value="No backend analytics yet" />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border bg-card p-5">
            <h2 className="text-sm font-semibold">Settings</h2>
            <div className="mt-4 space-y-3 text-sm">
              <MetaRow icon={Clock} label="Duration" value={assessment.settings.durationMinutes ? `${assessment.settings.durationMinutes} min` : "Not set"} />
              <MetaRow icon={Layers3} label="Attempts" value={assessment.settings.attemptLimit ?? "Not set"} />
              <MetaRow icon={CheckCircle2} label="Total Score" value={assessment.settings.totalScore ?? "Not set"} />
              <MetaRow icon={CheckCircle2} label="Passing Score" value={assessment.settings.passingScorePercent ? `${assessment.settings.passingScorePercent}%` : "Not set"} />
              <MetaRow icon={Eye} label="Answer Policy" value={assessment.settings.showAnswersPolicy || "Not set"} />
            </div>
          </Card>

          <Card className="border bg-card p-5">
            <h2 className="text-sm font-semibold">Rewards</h2>
            <div className="mt-4 space-y-3 text-sm">
              <MetaRow icon={Trophy} label="XP" value={assessment.rewards.xpReward ?? "Not set"} />
              <MetaRow icon={Trophy} label="Pass Bonus" value={assessment.rewards.passScoreBonus ?? "Not set"} />
              <MetaRow icon={Trophy} label="Perfect Bonus" value={assessment.rewards.perfectScoreBonus ?? "Not set"} />
              <MetaRow icon={Trophy} label="Retake XP" value={assessment.rewards.maxRetakeXp ?? "Not set"} />
            </div>
          </Card>

          <Card className="border bg-card p-5">
            <h2 className="text-sm font-semibold">Academic Links</h2>
            <div className="mt-4 space-y-2 text-sm">
              <PreviewList label="Courses" values={linkedCourses.map((course) => course.title)} emptyLabel="No academic mapping" />
              <PreviewList label="Chapters" values={linkedChapters.map((chapter) => chapter.title)} emptyLabel="No academic mapping" />
              <PreviewList label="Lessons" values={linkedLessons.map((lesson) => lesson.title)} emptyLabel="No academic mapping" />
              <PreviewList label="Sessions" values={linkedSessions.map((session) => session.title)} emptyLabel="No linked sessions" />
            </div>
          </Card>

          <Card className="border bg-card p-5">
            <h2 className="text-sm font-semibold">Timeline</h2>
            <div className="mt-4 space-y-3 text-sm">
              <MetaRow icon={Calendar} label="Created" value={new Date(assessment.createdAt).toLocaleString()} />
              <MetaRow icon={Calendar} label="Updated" value={new Date(assessment.updatedAt).toLocaleString()} />
            </div>
          </Card>
        </div>
      </div>
    </DashPage>
  );
}

function PreviewField({ label, value, className }: { label: string; value?: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value?.trim() ? value : "—"}</p>
    </div>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="min-w-28 text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function AnalyticsCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <Card className="border bg-muted/20 p-4">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-sm font-medium">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function PreviewList({
  label,
  values,
  emptyLabel,
}: {
  label: string;
  values: string[];
  emptyLabel: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1">{values.length > 0 ? values.join(", ") : emptyLabel}</p>
    </div>
  );
}
