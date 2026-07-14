import type { QuestionType } from "@/lib/teacher/teacher-question-store";

export const TYPE_LABELS: Record<string, string> = {
  mcq: "MCQ", multi_select: "Multi Select", true_false: "True / False", short_answer: "Short Answer",
  essay: "Essay", calculation: "Calculation", fill_blank: "Fill Blank", matching: "Matching",
  ordering: "Ordering", table_completion: "Table Completion", matrix: "Matrix", classification: "Classification",
  passage: "Passage", case_study: "Case Study", group_question: "Group Question", drag_drop: "Drag & Drop",
  hotspot: "Hotspot", image_labeling: "Image Labeling", graph_plot: "Graph Plot", equation_builder: "Equation Builder",
  chemical_structure: "Chemical Structure", file_upload: "File Upload", oral_answer: "Oral Answer",
  video_answer: "Video Answer", coding: "Coding", flashcard: "Flashcard", adaptive: "Adaptive",
};

export const TYPE_COLORS: Record<string, string> = {
  mcq: "bg-blue-500/10 text-blue-600 border-blue-300",
  multi_select: "bg-blue-500/10 text-blue-600 border-blue-300",
  true_false: "bg-cyan-500/10 text-cyan-600 border-cyan-300",
  short_answer: "bg-amber-500/10 text-amber-600 border-amber-300",
  essay: "bg-violet-500/10 text-violet-600 border-violet-300",
  calculation: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
  fill_blank: "bg-indigo-500/10 text-indigo-600 border-indigo-300",
  matching: "bg-pink-500/10 text-pink-600 border-pink-300",
  ordering: "bg-orange-500/10 text-orange-600 border-orange-300",
  table_completion: "bg-teal-500/10 text-teal-600 border-teal-300",
  matrix: "bg-slate-500/10 text-slate-600 border-slate-300",
  classification: "bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-300",
  passage: "bg-sky-500/10 text-sky-600 border-sky-300",
  case_study: "bg-sky-500/10 text-sky-600 border-sky-300",
  group_question: "bg-purple-500/10 text-purple-600 border-purple-300",
  drag_drop: "bg-lime-500/10 text-lime-600 border-lime-300",
  hotspot: "bg-rose-500/10 text-rose-600 border-rose-300",
  image_labeling: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
  graph_plot: "bg-cyan-500/10 text-cyan-600 border-cyan-300",
  equation_builder: "bg-indigo-500/10 text-indigo-600 border-indigo-300",
  chemical_structure: "bg-pink-500/10 text-pink-600 border-pink-300",
  file_upload: "bg-amber-500/10 text-amber-600 border-amber-300",
  oral_answer: "bg-violet-500/10 text-violet-600 border-violet-300",
  video_answer: "bg-blue-500/10 text-blue-600 border-blue-300",
  coding: "bg-slate-500/10 text-slate-300 border-slate-500",
  flashcard: "bg-yellow-500/10 text-yellow-600 border-yellow-300",
  adaptive: "bg-purple-500/10 text-purple-600 border-purple-300",
};

export const DIFF_COLORS: Record<string, string> = {
  easy: "text-emerald-600", medium: "text-amber-600", hard: "text-rose-600", advanced: "text-violet-600",
};

export const CATEGORY_MAP: Record<string, QuestionType[]> = {
  Basic: ["mcq", "multi_select", "true_false", "short_answer", "essay", "calculation"],
  Structured: ["fill_blank", "matching", "ordering", "table_completion", "matrix", "classification"],
  Reading: ["passage", "case_study", "group_question"],
  Interactive: ["drag_drop", "hotspot", "image_labeling", "graph_plot", "equation_builder", "chemical_structure"],
  Submission: ["file_upload", "oral_answer", "video_answer"],
  Technical: ["coding"],
  Learning: ["flashcard", "adaptive"],
};

export const TYPE_TO_CATEGORY: Record<string, string> = {};
for (const [cat, types] of Object.entries(CATEGORY_MAP)) {
  for (const t of types) TYPE_TO_CATEGORY[t] = cat;
}

export const ALL_TYPE_OPTIONS = Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label }));
