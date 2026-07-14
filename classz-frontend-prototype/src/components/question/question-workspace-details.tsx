import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AnswerData, TeacherQuestion } from "@/lib/teacher/teacher-question-store";

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border bg-card">
      <div className="border-b px-4 py-3">
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <div className="space-y-4 p-4">{children}</div>
    </Card>
  );
}

function Field({ label, value, mono }: { label: string; value?: string | number | null; mono?: boolean }) {
  const display = value === undefined || value === null || value === "" ? null : String(value);
  return (
    <div className="flex items-baseline gap-2 text-xs">
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <span className={cn("font-medium", mono && "font-mono", !display && "text-muted-foreground italic")}>
        {display || "-"}
      </span>
    </div>
  );
}

export function QuestionAndChoicesTab({ question }: { question: TeacherQuestion }) {
  return (
    <div className="space-y-4">
      <InfoBlock title="Question">
        {question.title ? <p className="text-sm font-semibold">{question.title}</p> : null}
        <p className="whitespace-pre-wrap text-sm">{question.text}</p>
        {question.instructions ? <p className="text-sm italic text-muted-foreground">{question.instructions}</p> : null}
      </InfoBlock>

      <InfoBlock title="Answer & Choices">
        <AnswerPreview question={question} answerData={question.answerData} />
      </InfoBlock>
    </div>
  );
}

export function AttachmentsTab({ question }: { question: TeacherQuestion }) {
  const attachmentGroups = [
    { label: "Question images", items: question.questionImages || [] },
    { label: "Choice images", items: question.choiceImages || [] },
    { label: "Solution images", items: question.solutionImages || [] },
    { label: "Attachments", items: question.attachments || [] },
  ].filter((group) => group.items.length > 0);

  return (
    <InfoBlock title="Attachments">
      {attachmentGroups.length === 0 ? (
        <p className="text-sm text-muted-foreground">No attachments added for this question.</p>
      ) : (
        <div className="space-y-4">
          {attachmentGroups.map((group) => (
            <div key={group.label} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.label}</p>
              <div className="space-y-2">
                {group.items.map((item, index) => (
                  <div key={`${group.label}-${index}`} className="rounded-xl border px-3 py-2 text-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </InfoBlock>
  );
}

export function ExplanationTab({ question }: { question: TeacherQuestion }) {
  return (
    <div className="space-y-4">
      <InfoBlock title="Hint">
        <p className="text-sm text-muted-foreground">{question.hint || "No hint added yet."}</p>
      </InfoBlock>
      <InfoBlock title="Explanation">
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{question.explanation || "No explanation added yet."}</p>
      </InfoBlock>
      <InfoBlock title="Solution">
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{question.solution || "No solution added yet."}</p>
      </InfoBlock>
      <InfoBlock title="Common mistakes">
        <p className="text-sm text-muted-foreground">
          {question.commonMistakes && question.commonMistakes.length > 0 ? question.commonMistakes.join("; ") : "No common mistakes added yet."}
        </p>
      </InfoBlock>
    </div>
  );
}

export function ClassificationTab({
  question,
  courseName,
  chapterMap,
  lessonMap,
  conceptMap,
  atomicMap,
}: {
  question: TeacherQuestion;
  courseName?: string;
  chapterMap: Map<string, string>;
  lessonMap: Map<string, string>;
  conceptMap: Map<string, string>;
  atomicMap: Map<string, string>;
}) {
  const chapterNames = (question.chapterIds || []).map((id) => chapterMap.get(id)).filter(Boolean) as string[];
  if (!chapterNames.length && question.chapterId && chapterMap.has(question.chapterId)) chapterNames.push(chapterMap.get(question.chapterId)!);
  const lessonNames = (question.lessonIds || []).map((id) => lessonMap.get(id)).filter(Boolean) as string[];
  const conceptNames = (question.conceptIds || []).map((id) => conceptMap.get(id)).filter(Boolean) as string[];
  const atomicNames = (question.atomicConceptIds || []).map((id) => atomicMap.get(id)).filter(Boolean) as string[];

  return (
    <div className="space-y-4">
      <InfoBlock title="Classification">
        <div className="space-y-2">
          <Field label="Course" value={courseName || "-"} />
          <Field label="Chapter(s)" value={chapterNames.join(", ")} />
          <Field label="Lesson(s)" value={lessonNames.join(", ")} />
          <Field label="Concept(s)" value={conceptNames.length > 0 ? conceptNames.join(", ") : question.concept} />
          <Field label="Atomic(s)" value={atomicNames.length > 0 ? atomicNames.join(", ") : question.atomicConcept} />
        </div>
      </InfoBlock>

      <InfoBlock title="Metadata">
        <div className="space-y-2">
          <Field label="Code" value={question.publicCode} mono />
          <Field label="Type" value={question.type.replace(/_/g, " ")} />
          <Field label="Difficulty" value={question.difficulty} />
          <Field label="Status" value={question.status} />
          <Field label="Source" value={question.sourceLabel || question.source} />
          <Field label="Points" value={question.points} />
          <Field label="Created" value={new Date(question.createdAt).toLocaleString()} />
          <Field label="Updated" value={new Date(question.updatedAt).toLocaleString()} />
        </div>
      </InfoBlock>
    </div>
  );
}

function AnswerPreview({ question, answerData }: { question: TeacherQuestion; answerData?: AnswerData }) {
  if ((question.type === "mcq" || question.type === "multi_select") && question.choices && question.choices.length > 0) {
    return (
      <div className="space-y-1">
        {question.choices.map((choice, index) => (
          <div
            key={choice.id}
            className={cn("flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs", choice.isCorrect && "border-emerald-300 bg-emerald-500/5")}
          >
            {choice.isCorrect ? <Check className="h-3 w-3 shrink-0 text-emerald-600" /> : null}
            <span>{String.fromCharCode(65 + index)}. {choice.text}</span>
          </div>
        ))}
      </div>
    );
  }

  if (question.type === "true_false" && answerData?.kind === "true_false") {
    return (
      <div className="flex gap-2">
        {[true, false].map((value) => (
          <span
            key={String(value)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium",
              answerData.correctBoolean === value && "border-emerald-300 bg-emerald-500/5 text-emerald-600",
            )}
          >
            {value ? "True" : "False"}
          </span>
        ))}
      </div>
    );
  }

  if (question.type === "short_answer" && answerData?.kind === "short_answer") {
    return <div className="text-xs"><span className="text-muted-foreground">Accepted:</span> {answerData.acceptedAnswers.join(", ") || "-"}</div>;
  }

  if (question.type === "essay") {
    const modelAnswer = answerData?.kind === "essay" ? answerData.modelAnswer : question.modelAnswer;
    return modelAnswer
      ? <p className="line-clamp-4 rounded-lg border bg-muted/30 px-3 py-2 text-xs">{modelAnswer}</p>
      : <p className="text-xs italic text-muted-foreground">Manual grading required</p>;
  }

  if (question.type === "calculation") {
    const correctAnswer = answerData?.kind === "calculation" ? answerData.correctAnswer : question.correctAnswer;
    const unit = answerData?.kind === "calculation" ? answerData.unit : question.unit;
    return (
      <div className="space-y-1 text-xs">
        <div>
          <span className="text-muted-foreground">Answer:</span> <span className="font-mono font-semibold">{correctAnswer || "-"}</span>
          {unit ? ` ${unit}` : ""}
        </div>
      </div>
    );
  }

  if (question.type === "classification" && answerData?.kind === "classification") {
    return (
      <div className="space-y-1">
        {answerData.categories.map((category) => {
          const items = answerData.items.filter((item) => answerData.correctCategoryByItem[item.id] === category.id);
          return (
            <div key={category.id} className="text-xs">
              <span className="font-medium">{category.text}:</span> {items.map((item) => item.text).join(", ") || "-"}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Badge variant="outline" className="rounded-full capitalize">
        {question.type.replace(/_/g, " ")}
      </Badge>
      <p className="text-xs text-muted-foreground">Detailed answer preview for this question type is not implemented yet.</p>
    </div>
  );
}
