import { Plus } from "lucide-react";
import { useState } from "react";

import type { MediaType } from "./api";

type QuestionImageUploaderProps = {
  onAddMedia: (payload: { file_url: string; media_type: MediaType; caption?: string | null; position?: number }) => void;
  nextPosition: number;
};

export function QuestionImageUploader({ onAddMedia, nextPosition }: QuestionImageUploaderProps) {
  const [fileUrl, setFileUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("IMAGE");

  function submitMedia() {
    if (!fileUrl.trim()) {
      return;
    }

    onAddMedia({
      file_url: fileUrl.trim(),
      media_type: mediaType,
      caption: caption.trim() || null,
      position: nextPosition,
    });
    setFileUrl("");
    setCaption("");
    setMediaType("IMAGE");
  }

  return (
    <section className="rounded-[20px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
      <h2 className="font-[Poppins] text-lg font-semibold text-[#F8FAFC]">Add media</h2>
      <div className="mt-4 space-y-3">
        <input
          value={fileUrl}
          onChange={(event) => setFileUrl(event.target.value)}
          placeholder="Media URL"
          className="w-full rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-sm text-[#F8FAFC] outline-none focus:ring-2 focus:ring-[#A855F7]"
        />
        <input
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder="Caption"
          className="w-full rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-sm text-[#F8FAFC] outline-none focus:ring-2 focus:ring-[#A855F7]"
        />
        <select
          value={mediaType}
          onChange={(event) => setMediaType(event.target.value as MediaType)}
          className="w-full rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-sm font-semibold text-[#CBD5E1] outline-none focus:ring-2 focus:ring-[#A855F7]"
        >
          <option value="IMAGE">Image</option>
          <option value="PDF">PDF</option>
          <option value="AUDIO">Audio metadata</option>
          <option value="VIDEO">Video metadata</option>
        </select>
        <button
          type="button"
          onClick={submitMedia}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#9333EA] to-[#A855F7] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(124,58,237,0.28)] transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add media
        </button>
      </div>
    </section>
  );
}
