import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { SubmissionFileDraft } from "./api";

type FileUploaderProps = {
  files: SubmissionFileDraft[];
  onFilesChange: (files: SubmissionFileDraft[]) => void;
};

export function FileUploader({ files, onFilesChange }: FileUploaderProps) {
  const { t } = useTranslation();
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);

  function addFile() {
    if (!fileUrl.trim() || !fileName.trim()) {
      return;
    }

    onFilesChange([...files, { file_url: fileUrl.trim(), file_name: fileName.trim(), file_size: fileSize }]);
    setFileUrl("");
    setFileName("");
    setFileSize(0);
  }

  return (
    <section className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
      <h2 className="font-[Poppins] text-xl font-semibold text-[#F8FAFC]">{t("assignments.files")}</h2>
      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_120px_auto]">
        <input
          value={fileUrl}
          onChange={(event) => setFileUrl(event.target.value)}
          placeholder={t("assignments.fileUrl")}
          className="rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-sm text-[#F8FAFC] outline-none focus:ring-2 focus:ring-[#A855F7]"
        />
        <input
          value={fileName}
          onChange={(event) => setFileName(event.target.value)}
          placeholder={t("assignments.fileName")}
          className="rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-sm text-[#F8FAFC] outline-none focus:ring-2 focus:ring-[#A855F7]"
        />
        <input
          type="number"
          min={0}
          value={fileSize}
          onChange={(event) => setFileSize(Number(event.target.value))}
          placeholder={t("assignments.size")}
          className="rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-sm text-[#F8FAFC] outline-none focus:ring-2 focus:ring-[#A855F7]"
        />
        <button
          type="button"
          onClick={addFile}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#9333EA] to-[#A855F7] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(124,58,237,0.28)]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t("common.add")}
        </button>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div key={`${file.file_url}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#111827]/72 px-4 py-3 text-sm text-[#CBD5E1]">
              <span className="min-w-0 truncate">{file.file_name}</span>
              <button
                type="button"
                onClick={() => onFilesChange(files.filter((_, fileIndex) => fileIndex !== index))}
                className="text-[#FCA5A5]"
                aria-label={t("assignments.removeFile")}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
