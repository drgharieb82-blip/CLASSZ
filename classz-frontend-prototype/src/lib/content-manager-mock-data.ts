// Content Manager mock data

export interface QuestionReview {
  id: string; question: string; subject: string; topic: string;
  submittedBy: string; type: "mcq" | "essay" | "true-false" | "fill-blank";
  difficulty: "easy" | "medium" | "hard"; status: "pending" | "approved" | "rejected";
  submittedAt: string; reviewedBy: string;
}

export interface ImportJob {
  id: string; fileName: string; type: "questions" | "lessons" | "media";
  records: number; status: "completed" | "processing" | "failed" | "queued";
  uploadedBy: string; uploadedAt: string; errors: number;
}

export interface MediaItem {
  id: string; name: string; type: "pdf" | "image" | "video";
  size: string; course: string; uploadedBy: string;
  uploadedAt: string; downloads: number;
}

export interface TagConcept {
  id: string; name: string; type: "tag" | "concept" | "atomic-concept";
  subject: string; usageCount: number; status: "active" | "deprecated";
}

export interface PublishRequest {
  id: string; title: string; type: "lesson" | "quiz" | "course" | "question-bank";
  submittedBy: string; academy: string; status: "pending" | "approved" | "rejected" | "published";
  submittedAt: string; reviewedBy: string;
}

export const cmStats = {
  pendingQuestions: 34, importJobs: 8, mediaFiles: 2_840,
  publishingRequests: 12, rejectedContent: 6,
};

export const questionReviews: QuestionReview[] = [
  { id: "QR-001", question: "What is the derivative of sin(x)?", subject: "Mathematics", topic: "Calculus", submittedBy: "Dr. Ahmed Kamal", type: "mcq", difficulty: "medium", status: "pending", submittedAt: "2026-06-24", reviewedBy: "-" },
  { id: "QR-002", question: "Explain Newton's Third Law with examples", subject: "Physics", topic: "Mechanics", submittedBy: "Mr. Tarek Mostafa", type: "essay", difficulty: "hard", status: "pending", submittedAt: "2026-06-24", reviewedBy: "-" },
  { id: "QR-003", question: "Water boils at 100°C at sea level", subject: "Chemistry", topic: "States of Matter", submittedBy: "Ms. Dina Farouk", type: "true-false", difficulty: "easy", status: "approved", submittedAt: "2026-06-23", reviewedBy: "Nour Ibrahim" },
  { id: "QR-004", question: "The mitochondria is the ___ of the cell", subject: "Biology", topic: "Cell Biology", submittedBy: "Dr. Omar Hassan", type: "fill-blank", difficulty: "easy", status: "approved", submittedAt: "2026-06-23", reviewedBy: "Nour Ibrahim" },
  { id: "QR-005", question: "Solve: ∫(x² + 2x)dx", subject: "Mathematics", topic: "Integration", submittedBy: "Dr. Ahmed Kamal", type: "mcq", difficulty: "medium", status: "pending", submittedAt: "2026-06-22", reviewedBy: "-" },
  { id: "QR-006", question: "Define electromagnetic induction", subject: "Physics", topic: "Electromagnetism", submittedBy: "Mr. Tarek Mostafa", type: "essay", difficulty: "hard", status: "rejected", submittedAt: "2026-06-22", reviewedBy: "Nour Ibrahim" },
  { id: "QR-007", question: "Balance: Fe + O₂ → Fe₂O₃", subject: "Chemistry", topic: "Reactions", submittedBy: "Ms. Dina Farouk", type: "mcq", difficulty: "medium", status: "pending", submittedAt: "2026-06-21", reviewedBy: "-" },
  { id: "QR-008", question: "DNA replication occurs during which phase?", subject: "Biology", topic: "Genetics", submittedBy: "Dr. Omar Hassan", type: "mcq", difficulty: "medium", status: "pending", submittedAt: "2026-06-21", reviewedBy: "-" },
];

export const importJobs: ImportJob[] = [
  { id: "IMP-001", fileName: "math_questions_batch_12.xlsx", type: "questions", records: 150, status: "completed", uploadedBy: "Dr. Ahmed Kamal", uploadedAt: "2026-06-24 10:30", errors: 0 },
  { id: "IMP-002", fileName: "physics_videos_june.zip", type: "media", records: 24, status: "processing", uploadedBy: "Mr. Tarek Mostafa", uploadedAt: "2026-06-24 09:00", errors: 0 },
  { id: "IMP-003", fileName: "chemistry_lessons_q3.json", type: "lessons", records: 45, status: "completed", uploadedBy: "Ms. Dina Farouk", uploadedAt: "2026-06-23 14:20", errors: 2 },
  { id: "IMP-004", fileName: "biology_questions_v2.xlsx", type: "questions", records: 200, status: "failed", uploadedBy: "Dr. Omar Hassan", uploadedAt: "2026-06-23 11:00", errors: 15 },
  { id: "IMP-005", fileName: "math_diagrams.zip", type: "media", records: 80, status: "completed", uploadedBy: "Dr. Ahmed Kamal", uploadedAt: "2026-06-22 16:00", errors: 0 },
  { id: "IMP-006", fileName: "english_reading_materials.pdf", type: "media", records: 1, status: "queued", uploadedBy: "Ms. Reem Khaled", uploadedAt: "2026-06-24 11:30", errors: 0 },
];

export const mediaItems: MediaItem[] = [
  { id: "MED-001", name: "Calculus Lecture Notes.pdf", type: "pdf", size: "4.2 MB", course: "Advanced Mathematics", uploadedBy: "Dr. Ahmed Kamal", uploadedAt: "2026-06-24", downloads: 342 },
  { id: "MED-002", name: "Newton Laws Diagram.png", type: "image", size: "1.8 MB", course: "Physics Pro", uploadedBy: "Mr. Tarek Mostafa", uploadedAt: "2026-06-23", downloads: 256 },
  { id: "MED-003", name: "Organic Chemistry Intro.mp4", type: "video", size: "245 MB", course: "Chemistry World", uploadedBy: "Ms. Dina Farouk", uploadedAt: "2026-06-22", downloads: 189 },
  { id: "MED-004", name: "Cell Division Animation.mp4", type: "video", size: "180 MB", course: "Bio Academy", uploadedBy: "Dr. Omar Hassan", uploadedAt: "2026-06-21", downloads: 412 },
  { id: "MED-005", name: "Statistics Formulas.pdf", type: "pdf", size: "2.1 MB", course: "Advanced Mathematics", uploadedBy: "Dr. Ahmed Kamal", uploadedAt: "2026-06-20", downloads: 528 },
  { id: "MED-006", name: "Lab Setup Photo.jpg", type: "image", size: "3.4 MB", course: "Chemistry World", uploadedBy: "Ms. Dina Farouk", uploadedAt: "2026-06-19", downloads: 98 },
  { id: "MED-007", name: "Electromagnetic Waves.mp4", type: "video", size: "320 MB", course: "Physics Pro", uploadedBy: "Mr. Tarek Mostafa", uploadedAt: "2026-06-18", downloads: 234 },
  { id: "MED-008", name: "Grammar Guide.pdf", type: "pdf", size: "1.5 MB", course: "English Masters", uploadedBy: "Ms. Reem Khaled", uploadedAt: "2026-06-17", downloads: 167 },
];

export const tagsConcepts: TagConcept[] = [
  { id: "TC-001", name: "Calculus", type: "concept", subject: "Mathematics", usageCount: 245, status: "active" },
  { id: "TC-002", name: "Integration", type: "atomic-concept", subject: "Mathematics", usageCount: 128, status: "active" },
  { id: "TC-003", name: "Differentiation", type: "atomic-concept", subject: "Mathematics", usageCount: 156, status: "active" },
  { id: "TC-004", name: "Newton's Laws", type: "concept", subject: "Physics", usageCount: 89, status: "active" },
  { id: "TC-005", name: "Organic Chemistry", type: "concept", subject: "Chemistry", usageCount: 67, status: "active" },
  { id: "TC-006", name: "Cell Biology", type: "concept", subject: "Biology", usageCount: 112, status: "active" },
  { id: "TC-007", name: "exam-prep", type: "tag", subject: "General", usageCount: 342, status: "active" },
  { id: "TC-008", name: "revision", type: "tag", subject: "General", usageCount: 289, status: "active" },
  { id: "TC-009", name: "advanced", type: "tag", subject: "General", usageCount: 198, status: "active" },
  { id: "TC-010", name: "Thermodynamics", type: "concept", subject: "Physics", usageCount: 45, status: "deprecated" },
];

export const publishRequests: PublishRequest[] = [
  { id: "PUB-001", title: "Advanced Calculus - Chapter 8", type: "lesson", submittedBy: "Dr. Ahmed Kamal", academy: "Math Masters", status: "pending", submittedAt: "2026-06-24", reviewedBy: "-" },
  { id: "PUB-002", title: "Physics Mid-Year Quiz Bank", type: "question-bank", submittedBy: "Mr. Tarek Mostafa", academy: "Physics Pro", status: "pending", submittedAt: "2026-06-24", reviewedBy: "-" },
  { id: "PUB-003", title: "Chemistry Lab Safety Course", type: "course", submittedBy: "Ms. Dina Farouk", academy: "Chemistry World", status: "approved", submittedAt: "2026-06-23", reviewedBy: "Nour Ibrahim" },
  { id: "PUB-004", title: "Biology Final Exam", type: "quiz", submittedBy: "Dr. Omar Hassan", academy: "Bio Academy", status: "published", submittedAt: "2026-06-22", reviewedBy: "Nour Ibrahim" },
  { id: "PUB-005", title: "Statistics Revision Pack", type: "lesson", submittedBy: "Dr. Ahmed Kamal", academy: "Math Masters", status: "rejected", submittedAt: "2026-06-21", reviewedBy: "Nour Ibrahim" },
  { id: "PUB-006", title: "English Grammar Quiz Set", type: "question-bank", submittedBy: "Ms. Reem Khaled", academy: "English Masters", status: "pending", submittedAt: "2026-06-20", reviewedBy: "-" },
];
