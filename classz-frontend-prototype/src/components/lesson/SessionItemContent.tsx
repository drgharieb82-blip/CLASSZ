import {
  Calendar,
  ClipboardList,
  Clock,
  Download,
  FileText,
  Play,
  RefreshCcw,
  Target,
} from "lucide-react";
import { GradientButton } from "@/components/premium/GradientButton";
import type { SessionItem } from "@/lib/sessionMock";

interface Props {
  item: SessionItem;
}

export function QuizCard({ item }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card/40">
      <div className="flex flex-col items-center justify-center gap-5 p-8 text-center sm:p-12">
        <div className="grid h-20 w-20 place-items-center rounded-2xl gradient-brand text-white shadow-lg glow">
          <ClipboardList className="h-9 w-9" />
        </div>
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">{item.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Test your knowledge before moving forward
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          {item.questionCount && (
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              {item.questionCount} Questions
            </div>
          )}
          {item.quizDuration && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              {item.quizDuration}
            </div>
          )}
          {item.passingScore && (
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              {item.passingScore}% to pass
            </div>
          )}
        </div>

        <GradientButton size="lg" disabled={item.status === "locked"}>
          <Play className="h-5 w-5" />
          {item.status === "completed" ? "Retake Quiz" : "Start Quiz"}
        </GradientButton>
      </div>
    </div>
  );
}

export function HomeworkCard({ item }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card/40">
      <div className="flex flex-col items-center justify-center gap-5 p-8 text-center sm:p-12">
        <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg">
          <FileText className="h-9 w-9" />
        </div>
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">{item.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete this homework to unlock the next session
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          {item.questionCount && (
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-rose-400" />
              {item.questionCount} Questions
            </div>
          )}
          {item.quizDuration && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-rose-400" />
              {item.quizDuration}
            </div>
          )}
          {item.dueDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-rose-400" />
              Due: {item.dueDate}
            </div>
          )}
          {item.attemptsAllowed && (
            <div className="flex items-center gap-2">
              <RefreshCcw className="h-4 w-4 text-rose-400" />
              {item.attemptsAllowed} attempts
            </div>
          )}
        </div>

        <GradientButton size="lg" disabled={item.status === "locked"}>
          <Play className="h-5 w-5" />
          {item.status === "completed" ? "Review Homework" : "Start Homework"}
        </GradientButton>
      </div>
    </div>
  );
}

export function AttachmentCard({ item }: Props) {
  const canOpen = item.status !== "locked" && !!item.contentUrl;
  return (
    <div className="overflow-hidden rounded-2xl border bg-card/40">
      <div className="flex flex-col items-center justify-center gap-5 p-8 text-center sm:p-12">
        <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg">
          <FileText className="h-9 w-9" />
        </div>
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">{item.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Download or preview this resource
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          {item.fileName && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-cyan-400" />
              {item.fileName}
            </div>
          )}
          {item.fileSize && (
            <span className="text-muted-foreground">{item.fileSize}</span>
          )}
          {item.fileType && (
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
              {item.fileType}
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <GradientButton
            size="lg"
            disabled={!canOpen}
            onClick={() => {
              if (item.contentUrl) window.open(item.contentUrl, "_blank", "noopener,noreferrer");
            }}
          >
            <Download className="h-5 w-5" /> Download
          </GradientButton>
          <GradientButton
            variant="outline"
            size="lg"
            disabled={!canOpen}
            onClick={() => {
              if (item.contentUrl) window.open(item.contentUrl, "_blank", "noopener,noreferrer");
            }}
          >
            Preview
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
