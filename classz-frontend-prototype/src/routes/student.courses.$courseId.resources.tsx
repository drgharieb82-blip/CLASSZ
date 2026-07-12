import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Image as ImageIcon, Loader2, Music, Paperclip, Shield, StickyNote, Video } from "lucide-react";
import type { CourseDetailsRead } from "@/lib/api/courses";
import { listMaterials, requestMaterialAccess, type MaterialRead, type MaterialType } from "@/lib/api/materials";
import {
  getStudentCourseAccessError,
  loadStudentCourseAccess,
} from "@/lib/student-course-access";

export const Route = createFileRoute("/student/courses/$courseId/resources")({
  component: CourseResourcesPage,
});

const typeIcon: Record<MaterialType, typeof Video> = {
  video: Video,
  image: ImageIcon,
  pdf: FileText,
  notes: StickyNote,
  attachment: Paperclip,
  document: FileText,
  audio: Music,
};

function CourseResourcesPage() {
  const { courseId } = Route.useParams();
  const [course, setCourse] = useState<CourseDetailsRead | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState("");
  const [materials, setMaterials] = useState<MaterialRead[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [materialsError, setMaterialsError] = useState("");
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [openingMaterialId, setOpeningMaterialId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadStudentCourseAccess(courseId)
      .then(({ allowed: isAllowed, course: courseData }) => {
        if (!active) return;
        setAllowed(isAllowed);
        setCourse(courseData);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(getStudentCourseAccessError(err, "Failed to load course resources."));
      });
    return () => {
      active = false;
    };
  }, [courseId]);

  useEffect(() => {
    if (!allowed) return;
    let active = true;
    setMaterialsLoading(true);
    setMaterialsError("");
    listMaterials(courseId)
      .then((items) => {
        if (active) setMaterials(items);
      })
      .catch((err) => {
        if (active) setMaterialsError(getStudentCourseAccessError(err, "Failed to load resources."));
      })
      .finally(() => {
        if (active) setMaterialsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [allowed, courseId]);

  const openMaterial = async (materialId: string) => {
    setOpeningMaterialId(materialId);
    try {
      const access = await requestMaterialAccess(materialId, "download");
      window.open(access.access_url, "_blank", "noopener,noreferrer");
    } finally {
      setOpeningMaterialId(null);
    }
  };

  if (!allowed || !course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#080C1A] text-white">
        <Shield className="h-16 w-16 text-slate-600" />
        <h1 className="text-2xl font-bold">{error || "Course Access Required"}</h1>
        <Link to="/student/courses" className="mt-2 text-sm text-slate-400 hover:text-white">Back to My Courses</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080C1A] p-6 text-white">
      <div className="mx-auto max-w-4xl space-y-4">
        <h1 className="text-3xl font-bold">{course.title} Resources</h1>

        {materialsLoading && (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Loading resources…</p>
          </div>
        )}

        {!materialsLoading && materialsError && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <FileText className="h-12 w-12 text-slate-600" />
            <p className="text-sm text-slate-400">Resources unavailable: {materialsError}</p>
          </div>
        )}

        {!materialsLoading && !materialsError && materials.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <FileText className="h-12 w-12 text-slate-600" />
            <p className="text-sm text-slate-400">No resources have been published for this course yet.</p>
          </div>
        )}

        {!materialsLoading && !materialsError && materials.length > 0 && (
          <div className="space-y-3">
            {materials.map((material) => {
              const Icon = typeIcon[material.type];
              const isNotes = material.type === "notes";

              return (
                <div
                  key={material.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04]">
                      <Icon className="h-5 w-5 text-violet-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white">{material.title}</p>
                      {material.description && (
                        <p className="mt-0.5 text-sm text-slate-400">{material.description}</p>
                      )}
                    </div>
                    {isNotes ? (
                      <button
                        onClick={() => setExpandedNoteId((id) => (id === material.id ? null : material.id))}
                        className="shrink-0 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
                      >
                        {expandedNoteId === material.id ? "Hide" : "View"}
                      </button>
                    ) : (
                      <button
                        onClick={() => void openMaterial(material.id)}
                        disabled={openingMaterialId === material.id}
                        className="shrink-0 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-200 transition-colors hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {openingMaterialId === material.id ? "Opening..." : "Open"}
                      </button>
                    )}
                  </div>
                  {isNotes && expandedNoteId === material.id && material.notes_content && (
                    <p className="mt-3 whitespace-pre-wrap rounded-xl border border-white/5 bg-black/20 p-3 text-sm text-slate-300">
                      {material.notes_content}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
