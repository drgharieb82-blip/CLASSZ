import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { FeedbackEditor } from "./FeedbackEditor";
import { GradeScoreCard } from "./GradeScoreCard";
import { GradeStatusBadge } from "./GradeStatusBadge";
import { EssayReviewCard } from "./EssayReviewCard";
import { getManualGrade, gradeManualGrade, returnManualGrade } from "./api";

const demoGraderId = "00000000-0000-0000-0000-000000000002";

export function GradeDetailsPage() {
  const { gradeId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: grade, isError, isLoading } = useQuery({
    queryKey: ["manual-grade", gradeId],
    queryFn: () => getManualGrade(gradeId ?? ""),
    enabled: Boolean(gradeId),
  });

  const gradeMutation = useMutation({
    mutationFn: ({ score, feedback }: { score: number; feedback: string }) =>
      gradeManualGrade(gradeId ?? "", { grader_id: demoGraderId, score, feedback }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["manual-grades", "pending"] });
      await queryClient.invalidateQueries({ queryKey: ["manual-grade", gradeId] });
      navigate("/grading");
    },
  });

  const returnMutation = useMutation({
    mutationFn: (feedback: string) => returnManualGrade(gradeId ?? "", { grader_id: demoGraderId, feedback }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["manual-grades", "pending"] });
      await queryClient.invalidateQueries({ queryKey: ["manual-grade", gradeId] });
      navigate("/grading");
    },
  });

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-[20px] bg-white/[0.06]" />;
  }

  if (isError || !grade) {
    return (
      <section className="rounded-[20px] border border-[#EF4444]/30 bg-[#EF4444]/10 p-8 text-[#FCA5A5]">
        <AlertCircle className="mb-3 h-6 w-6" aria-hidden="true" />
        Manual grading task could not be loaded.
      </section>
    );
  }

  const isSubmitting = gradeMutation.isPending || returnMutation.isPending;

  return (
    <div className="space-y-6">
      <Link to="/grading" className="inline-flex items-center gap-2 text-sm font-semibold text-[#A855F7] transition hover:text-[#C084FC]">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to grading queue
      </Link>

      <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#A855F7]">Teacher review</p>
            <h1 className="mt-3 font-[Poppins] text-3xl font-semibold text-[#F8FAFC]">
              {grade.assignment_submission ? "Assignment grading" : "Essay grading"}
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-[#CBD5E1]">
              Review the student work, assign a score, and leave feedback or return it for revision.
            </p>
          </div>
          <GradeStatusBadge status={grade.status} />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="min-w-0">
          <EssayReviewCard grade={grade} />
        </main>
        <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
          <GradeScoreCard grade={grade} />
          <FeedbackEditor
            maxScore={grade.max_score}
            initialScore={grade.score}
            initialFeedback={grade.feedback}
            isSubmitting={isSubmitting}
            onGrade={(score, feedback) => gradeMutation.mutate({ score, feedback })}
            onReturn={(feedback) => returnMutation.mutate(feedback)}
          />
        </aside>
      </div>
    </div>
  );
}
