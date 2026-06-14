import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileSpreadsheet, UploadCloud } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { commitQuestionImport, listQuestionImportHistory, previewQuestionImport, uploadQuestionImport, type ImportJob } from "./api";

function JobSummary({ job }: { job: ImportJob }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-[#F8FAFC]">{job.filename}</p>
          <p className="mt-1 text-sm text-[#94A3B8]">{job.status} · {job.source_type}</p>
        </div>
        <span className="rounded-2xl border border-white/10 px-3 py-1 text-xs font-semibold text-[#CBD5E1]">
          {job.summary?.valid_rows ?? 0}/{job.summary?.total_rows ?? job.raw_rows.length} valid
        </span>
      </div>
      {job.errors.length > 0 && (
        <div className="mt-3 space-y-2">
          {job.errors.slice(0, 4).map((error) => (
            <p key={error.id} className="rounded-xl bg-[#EF4444]/10 px-3 py-2 text-sm text-[#FCA5A5]">
              Row {error.row_number}: {error.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function BulkImportPage() {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<ImportJob | null>(null);

  const historyQuery = useQuery({ queryKey: ["question-import-history"], queryFn: listQuestionImportHistory });

  const uploadMutation = useMutation({
    mutationFn: uploadQuestionImport,
    onSuccess: async (response) => {
      const preview = await previewQuestionImport(response.job_id);
      setSelectedJob(preview.job);
      queryClient.invalidateQueries({ queryKey: ["question-import-history"] });
    },
  });

  const commitMutation = useMutation({
    mutationFn: (jobId: string) => commitQuestionImport(jobId),
    onSuccess: (response) => {
      setSelectedJob(response.job);
      queryClient.invalidateQueries({ queryKey: ["question-import-history"] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });

  return (
    <div className="space-y-6">
      <Link to="/question-bank" className="text-sm font-semibold text-[#A855F7] transition hover:text-[#C084FC]">
        Back to question bank
      </Link>

      <section className="rounded-[20px] border border-white/10 bg-[#111827]/88 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
        <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#38BDF8]">
          <FileSpreadsheet className="h-4 w-4" />
          Bulk import
        </p>
        <h1 className="mt-3 font-[Poppins] text-3xl font-semibold text-[#F8FAFC]">CSV, Excel, and JSON question pipeline</h1>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5">
          <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[#0F172A] p-8 text-center">
            <UploadCloud className="h-10 w-10 text-[#38BDF8]" />
            <span className="mt-4 font-semibold text-[#F8FAFC]">Upload CSV, XLSX, or JSON</span>
            <span className="mt-2 max-w-lg text-sm leading-6 text-[#94A3B8]">
              Columns can include question, choices, correct_answer, explanation, difficulty, chapter, lesson, concept, tags, bloom_level, thinking_skill, and keywords.
            </span>
            <input
              type="file"
              accept=".csv,.json,.xlsx,.xls"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) uploadMutation.mutate(file);
              }}
            />
          </label>

          {uploadMutation.isPending && <p className="mt-4 text-sm text-[#CBD5E1]">Uploading and validating...</p>}
          {uploadMutation.isError && <p className="mt-4 rounded-2xl bg-[#EF4444]/10 p-3 text-sm text-[#FCA5A5]">Import upload failed.</p>}

          {selectedJob && (
            <div className="mt-5 space-y-4">
              <JobSummary job={selectedJob} />
              <button
                type="button"
                disabled={(selectedJob.summary?.invalid_rows ?? 0) > 0 || commitMutation.isPending || selectedJob.status === "committed"}
                onClick={() => commitMutation.mutate(selectedJob.id)}
                className="rounded-2xl bg-[#10B981] px-4 py-3 font-semibold text-[#052E25] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {selectedJob.status === "committed" ? "Committed" : commitMutation.isPending ? "Committing..." : "Commit valid questions"}
              </button>
            </div>
          )}
        </div>

        <aside className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5">
          <h2 className="font-[Poppins] text-lg font-semibold text-[#F8FAFC]">Recent imports</h2>
          <div className="mt-4 space-y-3">
            {(historyQuery.data ?? []).map((job) => (
              <button key={job.id} type="button" onClick={() => setSelectedJob(job)} className="block w-full text-left">
                <JobSummary job={job} />
              </button>
            ))}
            {historyQuery.data?.length === 0 && <p className="text-sm text-[#94A3B8]">No imports yet.</p>}
          </div>
        </aside>
      </section>
    </div>
  );
}
