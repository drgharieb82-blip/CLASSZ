/**
 * CLASSZ Teacher Workspace Mock Data Seeder
 * Populates all stores with rich realistic data on first load.
 * Only runs once — checks localStorage flag.
 */

import { useTeacherCourseStore } from "./teacher-course-store";
import { useTeacherChapterStore } from "./teacher-chapter-store";
import { useTeacherSessionStore } from "./teacher-session-store";
import { useTeacherMaterialStore } from "./teacher-material-store";
import { useTeacherQuestionStore } from "./teacher-question-store";
import { useTeacherQuizStore } from "./teacher-quiz-store";
import { useTeacherExamStore } from "./teacher-exam-store";
import { useTeacherHomeworkStore } from "./teacher-homework-store";
import { useTeacherAssignmentStore } from "./teacher-assignment-store";
import { useTeacherAssessmentStore } from "./teacher-assessment-store";
import { useContentTreeStore } from "./content-tree-store";

const SEED_KEY = "classz-teacher-seeded-v2";

export function seedTeacherData() {
  if (localStorage.getItem(SEED_KEY)) return;
  if (useTeacherCourseStore.getState().courses.length > 0) { localStorage.setItem(SEED_KEY, "1"); return; }

  const cs = useTeacherCourseStore.getState();
  const ch = useTeacherChapterStore.getState();
  const se = useTeacherSessionStore.getState();
  const ma = useTeacherMaterialStore.getState();
  const qu = useTeacherQuestionStore.getState();
  const qz = useTeacherQuizStore.getState();
  const ex = useTeacherExamStore.getState();
  const hw = useTeacherHomeworkStore.getState();
  const as_ = useTeacherAssignmentStore.getState();
  const tr = useContentTreeStore.getState();

  // ── COURSES ──
  const courses = [
    { title: "Advanced Mathematics", subject: "Math", grade: "Grade 12", price: 49, status: "published" as const, coverEmoji: "📐", coverColor: "from-violet-500 to-blue-500", shortDescription: "Master calculus, algebra, and geometry for Grade 12 exams", language: "Arabic", outcomes: ["Solve complex differential equations", "Master integration techniques", "Understand sequences and series", "Score 90%+ on exams"], enrollCount: 1240 },
    { title: "Calculus Masterclass", subject: "Math", grade: "Grade 12", price: 55, status: "published" as const, coverEmoji: "🧮", coverColor: "from-blue-500 to-cyan-500", shortDescription: "Deep dive into limits, derivatives, and integrals", language: "Arabic & English", outcomes: ["Understand limits from first principles", "Apply chain rule and product rule", "Evaluate definite integrals"], enrollCount: 680 },
    { title: "Physics: Mechanics & Waves", subject: "Physics", grade: "Grade 11", price: 45, status: "published" as const, coverEmoji: "⚛️", coverColor: "from-emerald-500 to-teal-500", shortDescription: "Understand forces, energy, motion, and wave phenomena", language: "Arabic", outcomes: ["Apply Newton's laws", "Analyze wave properties", "Solve kinematics problems"], enrollCount: 980 },
    { title: "Organic Chemistry", subject: "Chemistry", grade: "Grade 12", price: 47, status: "published" as const, coverEmoji: "🧪", coverColor: "from-pink-500 to-rose-500", shortDescription: "From hydrocarbons to polymers — complete organic chemistry", language: "Arabic", outcomes: ["Name organic compounds using IUPAC", "Understand reaction mechanisms", "Predict products of reactions"], enrollCount: 760 },
    { title: "IELTS Preparation", subject: "IELTS", grade: "All Levels", price: 69, status: "published" as const, coverEmoji: "🎯", coverColor: "from-amber-500 to-orange-500", shortDescription: "Comprehensive IELTS preparation for band 7+", language: "English", outcomes: ["Score 7+ in all IELTS sections", "Master academic writing tasks", "Improve listening strategies"], enrollCount: 2100, category: "training" as const },
    { title: "Supply Chain Management", subject: "Supply Chain", grade: "Professional", price: 89, status: "published" as const, coverEmoji: "📊", coverColor: "from-slate-500 to-blue-500", shortDescription: "End-to-end supply chain from procurement to delivery", language: "Arabic & English", outcomes: ["Understand logistics optimization", "Master inventory management", "Apply lean principles"], enrollCount: 540, category: "professional" as const },
    { title: "Biology Essentials", subject: "Biology", grade: "Grade 11", price: 43, status: "draft" as const, coverEmoji: "🧬", coverColor: "from-green-500 to-emerald-500", shortDescription: "Cell biology, genetics, and ecology fundamentals", language: "Arabic", outcomes: ["Understand cell structure", "Explain DNA replication", "Describe ecosystems"], enrollCount: 0 },
    { title: "Arabic Grammar Mastery", subject: "Arabic", grade: "Grade 10", price: 35, status: "published" as const, coverEmoji: "🕌", coverColor: "from-orange-500 to-red-500", shortDescription: "Master Arabic grammar rules and sentence structure", language: "Arabic", outcomes: ["Parse Arabic sentences correctly", "Apply conjugation rules", "Write formal Arabic essays"], enrollCount: 890 },
    { title: "Data Science Foundations", subject: "Data Science", grade: "Beginner", price: 79, status: "draft" as const, coverEmoji: "📈", coverColor: "from-cyan-500 to-blue-500", shortDescription: "Python, statistics, and machine learning basics", language: "English", outcomes: ["Use Python for data analysis", "Understand statistical methods", "Build basic ML models"], enrollCount: 0, category: "training" as const },
    { title: "World History", subject: "History", grade: "Grade 11", price: 38, status: "archived" as const, coverEmoji: "🏛️", coverColor: "from-amber-500 to-yellow-500", shortDescription: "Ancient civilizations to modern era", language: "Arabic", outcomes: ["Analyze historical events", "Understand cause and effect", "Compare civilizations"], enrollCount: 320 },
  ];

  const courseIds: string[] = [];
  for (const c of courses) {
    const created = cs.createCourse({ ...c, pricingModel: (c as any).category === "training" ? "one_time" : "one_time" });
    if (c.enrollCount) cs.updateCourse(created.id, { enrollmentCount: c.enrollCount, revenue: c.enrollCount * c.price * 0.85, rating: 4.5 + Math.random() * 0.4, reviewsCount: Math.floor(c.enrollCount * 0.08) });
    if (c.status === "published") cs.publishCourse(created.id);
    if (c.status === "archived") cs.archiveCourse(created.id);
    courseIds.push(created.id);
  }

  // ── CHAPTERS for first 2 courses ──
  const mathChapters = ["Differential Calculus", "Integral Calculus", "Sequences & Series", "Probability & Statistics", "Linear Algebra", "Exam Preparation"];
  const chapterIds: string[] = [];
  for (const title of mathChapters) {
    const c = ch.createChapter({ courseId: courseIds[0], title }); ch.publishChapter(c.id); chapterIds.push(c.id);
  }
  const calcChapters = ["Limits & Continuity", "Differentiation Rules", "Applications of Derivatives", "Integration Techniques"];
  const calcChapterIds: string[] = [];
  for (const title of calcChapters) {
    const c = ch.createChapter({ courseId: courseIds[1], title }); ch.publishChapter(c.id); calcChapterIds.push(c.id);
  }

  // ── SESSIONS ──
  const sessionData = [
    { courseId: courseIds[0], chapterId: chapterIds[0], title: "Introduction to Limits", price: 0, isFreePreview: true, status: "published" as const, accessStatus: "unlocked" as const },
    { courseId: courseIds[0], chapterId: chapterIds[0], title: "Derivatives from First Principles", price: 20, status: "published" as const, accessStatus: "unlocked" as const },
    { courseId: courseIds[0], chapterId: chapterIds[0], title: "Power Rule & Constant Rule", price: 20, status: "published" as const, accessStatus: "locked" as const },
    { courseId: courseIds[0], chapterId: chapterIds[1], title: "Basic Integration", price: 20, status: "published" as const, accessStatus: "locked" as const },
    { courseId: courseIds[0], chapterId: chapterIds[1], title: "Integration by Substitution", price: 20, status: "published" as const, accessStatus: "locked" as const },
    { courseId: courseIds[0], chapterId: chapterIds[2], title: "Arithmetic Sequences", price: 15, status: "draft" as const, accessStatus: "locked" as const },
    { courseId: courseIds[1], chapterId: calcChapterIds[0], title: "Epsilon-Delta Definition", price: 0, isFreePreview: true, status: "published" as const, accessStatus: "unlocked" as const },
    { courseId: courseIds[1], chapterId: calcChapterIds[1], title: "Chain Rule Deep Dive", price: 25, status: "published" as const, accessStatus: "unlocked" as const },
  ];
  const sessionIds: string[] = [];
  for (const s of sessionData) {
    const created = se.createSession({ ...s, description: "", currency: "USD" }); sessionIds.push(created.id);
  }

  // ── MATERIALS ──
  const materialData: { type: MaterialType; title: string; videoUrl?: string; videoDuration?: string; fileSize?: string; fileName?: string }[] = [
    { type: "video", title: "Intro to Limits", videoDuration: "22:30", videoUrl: "https://example.com/limits.mp4" },
    { type: "video", title: "Power Rule Explained", videoDuration: "18:45", videoUrl: "https://example.com/power-rule.mp4" },
    { type: "video", title: "Chain Rule Deep Dive", videoDuration: "32:10", videoUrl: "https://example.com/chain-rule.mp4" },
    { type: "video", title: "Integration by Parts", videoDuration: "28:55", videoUrl: "https://example.com/integration.mp4" },
    { type: "video", title: "Sequences Introduction", videoDuration: "15:20", videoUrl: "https://example.com/sequences.mp4" },
    { type: "pdf", title: "Calculus Formula Sheet", fileSize: "1.8 MB", fileName: "Calculus_Formulas.pdf" },
    { type: "pdf", title: "Derivatives Worksheet", fileSize: "2.4 MB", fileName: "Derivatives_Practice.pdf" },
    { type: "pdf", title: "Integration Practice Pack", fileSize: "3.1 MB", fileName: "Integration_Pack.pdf" },
    { type: "image", title: "Derivative Rules Map", fileSize: "850 KB", fileName: "derivative_map.png" },
    { type: "image", title: "Probability Tree Diagram", fileSize: "620 KB", fileName: "probability_tree.png" },
    { type: "notes", title: "Exam Revision Notes" },
    { type: "notes", title: "Exam Tricks & Shortcuts" },
    { type: "attachment", title: "Homework Pack — Calculus", fileSize: "4.2 MB", fileName: "Homework_Pack.zip" },
  ];
  type MaterialType = "video" | "pdf" | "image" | "attachment" | "notes";
  for (const m of materialData) {
    const created = ma.createMaterial({ type: m.type, title: m.title, videoUrl: m.videoUrl, videoDuration: m.videoDuration, fileUrl: m.videoUrl || "https://example.com/file", fileName: m.fileName, fileSize: m.fileSize, status: "published" });
    ma.updateMaterial(created.id, { reuseCount: Math.floor(Math.random() * 5) + 1, linkedSessionIds: sessionIds.slice(0, Math.floor(Math.random() * 3) + 1) });
  }

  // ── QUESTIONS ──
  const questionData = [
    { type: "mcq" as const, text: "What is the derivative of f(x) = 3x² + 2x − 5?", concept: "Power Rule", difficulty: "easy" as const, choices: [{ id: "a", text: "6x + 2", isCorrect: true }, { id: "b", text: "6x", isCorrect: false }, { id: "c", text: "3x + 2", isCorrect: false }, { id: "d", text: "6x² + 2", isCorrect: false }] },
    { type: "mcq" as const, text: "Evaluate the limit of (sin x)/x as x → 0.", concept: "Limits", difficulty: "medium" as const, choices: [{ id: "a", text: "0", isCorrect: false }, { id: "b", text: "1", isCorrect: true }, { id: "c", text: "∞", isCorrect: false }, { id: "d", text: "Undefined", isCorrect: false }] },
    { type: "mcq" as const, text: "The integral of 1/x dx is:", concept: "Integration", difficulty: "easy" as const, choices: [{ id: "a", text: "x²/2 + C", isCorrect: false }, { id: "b", text: "ln|x| + C", isCorrect: true }, { id: "c", text: "1/x² + C", isCorrect: false }, { id: "d", text: "e^x + C", isCorrect: false }] },
    { type: "mcq" as const, text: "Which rule is used for composite functions?", concept: "Chain Rule", difficulty: "easy" as const, choices: [{ id: "a", text: "Product rule", isCorrect: false }, { id: "b", text: "Chain rule", isCorrect: true }, { id: "c", text: "Quotient rule", isCorrect: false }, { id: "d", text: "Power rule", isCorrect: false }] },
    { type: "mcq" as const, text: "Find the second derivative of f(x) = x⁴ − 3x² + 1", concept: "Higher Derivatives", difficulty: "medium" as const, choices: [{ id: "a", text: "12x² − 6", isCorrect: true }, { id: "b", text: "4x³ − 6x", isCorrect: false }, { id: "c", text: "12x − 6", isCorrect: false }, { id: "d", text: "24x", isCorrect: false }] },
    { type: "essay" as const, text: "Prove that f(x) = |x| is continuous but not differentiable at x = 0.", concept: "Continuity", difficulty: "hard" as const, modelAnswer: "Show left and right limits equal f(0), then show left and right derivatives differ." },
    { type: "calculation" as const, text: "A particle moves with v(t) = 3t². Find displacement from t=0 to t=2.", concept: "Applications", difficulty: "medium" as const, correctAnswer: "8", unit: "m" },
    { type: "mcq" as const, text: "The slope of a tangent at maximum point is:", concept: "Applications", difficulty: "easy" as const, choices: [{ id: "a", text: "Undefined", isCorrect: false }, { id: "b", text: "1", isCorrect: false }, { id: "c", text: "0", isCorrect: true }, { id: "d", text: "∞", isCorrect: false }] },
    { type: "calculation" as const, text: "Evaluate: ∫₀² (2x + 1) dx", concept: "Definite Integrals", difficulty: "easy" as const, correctAnswer: "6", unit: "" },
    { type: "essay" as const, text: "Explain the relationship between continuity and differentiability with examples.", concept: "Continuity", difficulty: "hard" as const, modelAnswer: "All differentiable functions are continuous, but not all continuous functions are differentiable. Example: |x| is continuous at 0 but not differentiable." },
    { type: "mcq" as const, text: "What is the derivative of sin(x)?", concept: "Trigonometric Derivatives", difficulty: "easy" as const, choices: [{ id: "a", text: "cos(x)", isCorrect: true }, { id: "b", text: "-cos(x)", isCorrect: false }, { id: "c", text: "sin(x)", isCorrect: false }, { id: "d", text: "-sin(x)", isCorrect: false }] },
    { type: "mcq" as const, text: "L'Hôpital's rule applies when the limit is in the form:", concept: "L'Hôpital", difficulty: "medium" as const, choices: [{ id: "a", text: "0/0 or ∞/∞", isCorrect: true }, { id: "b", text: "1/0", isCorrect: false }, { id: "c", text: "0 × ∞", isCorrect: false }, { id: "d", text: "Any form", isCorrect: false }] },
  ];
  const questionIds: string[] = [];
  for (const q of questionData) {
    const created = qu.createQuestion({ ...q, courseId: courseIds[0], chapterId: chapterIds[0], sessionId: "", atomicConcept: "", source: "Textbook", tags: [q.concept.toLowerCase()], explanation: `Standard ${q.concept} problem.`, status: "published" });
    questionIds.push(created.id);
  }

  // ── NEW QUESTION TYPES (mock data for every type) ──
  const newTypeQuestions: { type: any; text: string; tags: string[]; difficulty: any; answerData?: any; estimatedTimeSeconds?: number; sourceLabel?: string; hint?: string; solution?: string; points?: number }[] = [
    { type: "multi_select", text: "Which of the following are prime numbers? (Select all that apply)", tags: ["primes"], difficulty: "easy", answerData: { kind: "multi_select", choices: [{ id: "a", text: "2", isCorrect: true }, { id: "b", text: "4", isCorrect: false }, { id: "c", text: "7", isCorrect: true }, { id: "d", text: "9", isCorrect: false }], correctChoiceIds: ["a", "c"] }, estimatedTimeSeconds: 30, points: 2 },
    { type: "true_false", text: "The derivative of a constant is always zero.", tags: ["derivatives"], difficulty: "easy", answerData: { kind: "true_false", correctBoolean: true }, estimatedTimeSeconds: 15 },
    { type: "short_answer", text: "What is the value of π rounded to 2 decimal places?", tags: ["constants"], difficulty: "easy", answerData: { kind: "short_answer", acceptedAnswers: ["3.14"], caseSensitive: false }, estimatedTimeSeconds: 20 },
    { type: "fill_blank", text: "The integral of cos(x) is ___.", tags: ["integration"], difficulty: "medium", answerData: { kind: "fill_blank", promptWithBlanks: "The integral of cos(x) is ___.", blanks: [{ id: "b1", acceptedAnswers: ["sin(x) + C", "sin(x)+C"] }] }, estimatedTimeSeconds: 30 },
    { type: "matching", text: "Match each function with its derivative.", tags: ["derivatives"], difficulty: "medium", answerData: { kind: "matching", leftItems: [{ id: "l1", text: "x²" }, { id: "l2", text: "sin(x)" }, { id: "l3", text: "eˣ" }], rightItems: [{ id: "r1", text: "2x" }, { id: "r2", text: "cos(x)" }, { id: "r3", text: "eˣ" }], correctPairs: [{ leftId: "l1", rightId: "r1" }, { leftId: "l2", rightId: "r2" }, { leftId: "l3", rightId: "r3" }] }, estimatedTimeSeconds: 60, points: 3 },
    { type: "ordering", text: "Order the steps to find the derivative using the chain rule.", tags: ["chain rule"], difficulty: "medium", answerData: { kind: "ordering", items: [{ id: "s1", text: "Identify outer function" }, { id: "s2", text: "Identify inner function" }, { id: "s3", text: "Differentiate outer" }, { id: "s4", text: "Multiply by derivative of inner" }], correctOrder: ["s1", "s2", "s3", "s4"] }, estimatedTimeSeconds: 45 },
    { type: "classification", text: "Classify each expression as polynomial or non-polynomial.", tags: ["polynomials"], difficulty: "easy", answerData: { kind: "classification", items: [{ id: "i1", text: "3x² + 1" }, { id: "i2", text: "1/x" }, { id: "i3", text: "x³ - 2x" }, { id: "i4", text: "√x" }], categories: [{ id: "c1", text: "Polynomial" }, { id: "c2", text: "Non-polynomial" }], correctCategoryByItem: { i1: "c1", i2: "c2", i3: "c1", i4: "c2" } }, estimatedTimeSeconds: 40 },
    { type: "passage", text: "Read the passage about limits and answer the sub-questions.", tags: ["limits", "reading"], difficulty: "hard", answerData: { kind: "passage", passageText: "A limit describes the value a function approaches as the input approaches some value. The formal epsilon-delta definition states that for every ε > 0 there exists δ > 0 such that...", subQuestionIds: [] }, estimatedTimeSeconds: 300, points: 10 },
    { type: "drag_drop", text: "Drag each integration technique to the correct integral type.", tags: ["integration"], difficulty: "medium", answerData: { kind: "drag_drop", draggableItems: [{ id: "d1", text: "Substitution" }, { id: "d2", text: "By Parts" }, { id: "d3", text: "Partial Fractions" }], dropZones: [{ id: "z1", label: "∫ f(g(x))g'(x) dx" }, { id: "z2", label: "∫ u dv" }, { id: "z3", label: "∫ P(x)/Q(x) dx" }], correctMapping: { d1: "z1", d2: "z2", d3: "z3" } }, estimatedTimeSeconds: 60 },
    { type: "equation_builder", text: "Write the quadratic formula.", tags: ["algebra"], difficulty: "medium", answerData: { kind: "equation_builder", expectedEquation: "x = (-b ± √(b²-4ac)) / 2a", acceptedEquivalentForms: ["(-b±√(b²-4ac))/(2a)"], variables: ["a", "b", "c"] }, estimatedTimeSeconds: 60 },
    { type: "file_upload", text: "Upload your handwritten solution for the integration problem.", tags: ["integration", "submission"], difficulty: "hard", answerData: { kind: "file_upload", allowedFileTypes: ["pdf", "jpg", "png"], maxFileSizeMB: 10, rubric: "Clear steps, correct answer, proper notation" }, estimatedTimeSeconds: 600 },
    { type: "coding", text: "Write a Python function that returns the nth Fibonacci number.", tags: ["programming", "algorithms"], difficulty: "medium", answerData: { kind: "coding", language: "python", starterCode: "def fibonacci(n):\n    # Your code here\n    pass", testCases: [{ input: "0", expectedOutput: "0", label: "Base case" }, { input: "1", expectedOutput: "1" }, { input: "10", expectedOutput: "55", label: "Standard" }], timeLimitSeconds: 5 }, estimatedTimeSeconds: 300, sourceLabel: "Programming Exercise" },
    { type: "flashcard", text: "Definition of a limit", tags: ["limits", "revision"], difficulty: "easy", answerData: { kind: "flashcard", front: "What is the formal definition of a limit?", back: "lim(x→a) f(x) = L means for every ε>0 there exists δ>0 such that 0 < |x-a| < δ implies |f(x)-L| < ε", hint: "Think epsilon-delta" }, estimatedTimeSeconds: 20 },
    { type: "table_completion", text: "Complete the derivatives table.", tags: ["derivatives"], difficulty: "easy", answerData: { kind: "table_completion", columns: ["f(x)", "f'(x)"], rows: ["xⁿ", "sin(x)", "eˣ", "ln(x)"], blankCells: [{ row: 0, col: 1 }, { row: 1, col: 1 }, { row: 2, col: 1 }, { row: 3, col: 1 }], acceptedAnswersByCell: [{ row: 0, col: 1, value: "nxⁿ⁻¹" }, { row: 1, col: 1, value: "cos(x)" }, { row: 2, col: 1, value: "eˣ" }, { row: 3, col: 1, value: "1/x" }] }, estimatedTimeSeconds: 90, points: 4 },
    { type: "chemical_structure", text: "Draw the structure of ethanol (C₂H₅OH).", tags: ["chemistry"], difficulty: "medium", answerData: { kind: "chemical_structure", expectedStructure: "CCO", acceptedStructures: ["CCO", "C(C)O"], representation: "smiles" }, estimatedTimeSeconds: 60, sourceLabel: "Chemistry" },
  ];
  for (const q of newTypeQuestions) {
    qu.createQuestion({ ...q, courseId: courseIds[0], source: q.sourceLabel || "Textbook", explanation: "", status: "published" });
  }
  // Unclassified questions (no course, no chapter, no concept)
  qu.createQuestion({ type: "mcq", text: "What is 2 + 2?", difficulty: "easy", source: "Quick Import", tags: ["arithmetic"], explanation: "Basic addition.", choices: [{ id: "a", text: "3", isCorrect: false }, { id: "b", text: "4", isCorrect: true }, { id: "c", text: "5", isCorrect: false }, { id: "d", text: "6", isCorrect: false }], status: "published" });
  qu.createQuestion({ type: "true_false", text: "Water boils at 100°C at standard pressure.", source: "General Knowledge", tags: ["physics"], explanation: "", answerData: { kind: "true_false", correctBoolean: true }, status: "draft" });

  // ── QUIZZES ──
  qz.createQuiz({ title: "Derivatives Quick Quiz", courseId: courseIds[0], quizType: "practice", questionIds: questionIds.slice(0, 4), durationMinutes: 10, xpReward: 30, status: "published" });
  qz.createQuiz({ title: "Calculus Checkpoint", courseId: courseIds[0], quizType: "checkpoint", questionIds: questionIds.slice(0, 6), durationMinutes: 15, xpReward: 50, status: "published" });
  qz.createQuiz({ title: "Revision: Limits & Derivatives", courseId: courseIds[0], quizType: "revision", questionIds: questionIds.slice(1, 5), durationMinutes: 12, xpReward: 40, status: "published" });
  qz.createQuiz({ title: "Integration Practice", courseId: courseIds[0], quizType: "practice", questionIds: [questionIds[2], questionIds[8]], durationMinutes: 8, xpReward: 20, status: "draft" });

  // ── EXAMS ──
  ex.createExam({ title: "Weekly Exam — Derivatives", courseId: courseIds[0], examType: "weekly", questionIds: questionIds.slice(0, 5), durationMinutes: 30, examXpReward: 100, passScoreBonus: 25, perfectScoreBonus: 50, status: "published" });
  ex.createExam({ title: "Monthly Exam — Calculus", courseId: courseIds[0], examType: "monthly", questionIds: questionIds.slice(0, 8), durationMinutes: 60, examXpReward: 250, passScoreBonus: 50, perfectScoreBonus: 100, status: "published" });
  ex.createExam({ title: "Mock Final Exam", courseId: courseIds[0], examType: "mock", questionIds: questionIds, durationMinutes: 90, examXpReward: 500, passScoreBonus: 100, perfectScoreBonus: 200, status: "draft" });

  // ── HOMEWORK ──
  hw.createHomework({ title: "Derivatives Worksheet", courseId: courseIds[0], homeworkType: "worksheet", dueDate: "2026-06-25", maxScore: 50, xpReward: 20, status: "published" });
  hw.createHomework({ title: "Integration Essay", courseId: courseIds[0], homeworkType: "essay", dueDate: "2026-06-28", maxScore: 100, xpReward: 30, status: "published" });
  hw.createHomework({ title: "Problem Set: Sequences", courseId: courseIds[0], homeworkType: "mixed", dueDate: "2026-07-01", maxScore: 75, status: "draft" });

  // ── ASSIGNMENTS ──
  as_.createAssignment({ title: "Research: History of Calculus", courseId: courseIds[0], assignmentType: "research", dueDate: "2026-07-05", xpReward: 50, status: "published" });
  as_.createAssignment({ title: "Presentation: Real-World Applications", courseId: courseIds[0], assignmentType: "presentation", dueDate: "2026-07-10", status: "published" });

  // ── UNIFIED ASSESSMENTS ──
  const asm = useTeacherAssessmentStore.getState();
  asm.createAssessment({ title: "Derivatives Practice Quiz", assessmentType: "practice_quiz", questionIds: questionIds.slice(0, 4), courseIds: [courseIds[0]], status: "published" });
  asm.createAssessment({ title: "Calculus Session Quiz", assessmentType: "session_quiz", questionIds: questionIds.slice(0, 6), courseIds: [courseIds[0]], sessionIds: [sessionIds[0]], settings: { durationMinutes: 15 }, status: "published" });
  asm.createAssessment({ title: "Limits Revision Quiz", assessmentType: "revision_quiz", questionIds: questionIds.slice(1, 5), courseIds: [courseIds[0]], status: "published" });
  asm.createAssessment({ title: "Derivatives Homework", assessmentType: "homework", questionIds: questionIds.slice(0, 3), courseIds: [courseIds[0]], settings: { dueDate: "2026-07-01" }, status: "published" });
  asm.createAssessment({ title: "Weekly Exam — Derivatives", assessmentType: "exam", questionIds: questionIds.slice(0, 5), courseIds: [courseIds[0]], settings: { durationMinutes: 30 }, rewards: { xpReward: 100, passScoreBonus: 25 }, status: "published" });
  asm.createAssessment({ title: "Mock Final Exam", assessmentType: "mock_exam", questionIds: questionIds.slice(0, 8), courseIds: [courseIds[0]], settings: { durationMinutes: 90 }, rewards: { xpReward: 250 }, status: "draft" });
  asm.createAssessment({ title: "Final Calculus Exam", assessmentType: "final_exam", questionIds: questionIds, courseIds: [courseIds[0]], settings: { durationMinutes: 120, totalScore: 200 }, rewards: { xpReward: 500, perfectScoreBonus: 200 }, status: "draft" });
  asm.createAssessment({ title: "Math Placement Test", assessmentType: "placement_test", questionIds: questionIds.slice(0, 6), settings: { durationMinutes: 20 }, status: "published" });
  asm.createAssessment({ title: "Diagnostic — Weak Concepts", assessmentType: "diagnostic_test", questionIds: questionIds.slice(2, 7), courseIds: [courseIds[0]], status: "published" });
  asm.createAssessment({ title: "Research: History of Calculus", assessmentType: "research", courseIds: [courseIds[0]], settings: { dueDate: "2026-07-15", fileUploadAllowed: true }, rewards: { xpReward: 75 }, status: "published" });
  asm.createAssessment({ title: "Calculus Presentation", assessmentType: "presentation", courseIds: [courseIds[0]], settings: { dueDate: "2026-07-20", fileUploadAllowed: true }, rewards: { xpReward: 50 }, status: "published" });
  asm.createAssessment({ title: "Integration Project", assessmentType: "project", courseIds: [courseIds[0]], settings: { dueDate: "2026-08-01", fileUploadAllowed: true, rubric: "Problem selection, methodology, presentation" }, rewards: { xpReward: 150 }, status: "draft" });
  asm.createAssessment({ title: "General Assignment", assessmentType: "assignment", courseIds: [courseIds[0]], settings: { dueDate: "2026-07-05" }, status: "published" });
  asm.createAssessment({ title: "Adaptive Calculus Review", assessmentType: "adaptive_assessment", questionIds: questionIds.slice(0, 5), courseIds: [courseIds[0]], status: "draft" });
  asm.createAssessment({ title: "Custom Assessment", assessmentType: "custom", questionIds: questionIds.slice(3, 7), courseIds: [courseIds[0]], status: "draft" });

  // ── CONTENT TREE for first course ──
  const treeChapters = ["Differential Calculus", "Integral Calculus", "Sequences & Series", "Probability"];
  const treeLessons: Record<string, string[]> = {
    "Differential Calculus": ["Limits", "Derivatives", "Chain Rule", "Applications of Derivatives"],
    "Integral Calculus": ["Antiderivatives", "Definite Integrals", "Integration Techniques", "Applications of Integration"],
    "Sequences & Series": ["Arithmetic Sequences", "Geometric Sequences", "Convergence Tests"],
    "Probability": ["Basic Probability", "Conditional Probability", "Distributions"],
  };
  const treeConcepts: Record<string, string[]> = {
    "Limits": ["Limit Definition", "One-Sided Limits", "Limit Laws"],
    "Derivatives": ["Power Rule", "Product Rule", "Quotient Rule"],
    "Chain Rule": ["Composite Functions", "Implicit Differentiation"],
    "Antiderivatives": ["Basic Integration Rules", "Substitution"],
  };

  for (const chapTitle of treeChapters) {
    const chapNode = tr.createNode({ type: "chapter", title: chapTitle, parentId: "", courseId: courseIds[0], isOfficial: true });
    const lessons = treeLessons[chapTitle] || [];
    for (const lesTitle of lessons) {
      const lesNode = tr.createNode({ type: "lesson", title: lesTitle, parentId: chapNode.id, courseId: courseIds[0], isOfficial: true });
      const concepts = treeConcepts[lesTitle] || [];
      for (const conTitle of concepts) {
        const conNode = tr.createNode({ type: "concept", title: conTitle, parentId: lesNode.id, courseId: courseIds[0], isOfficial: true });
        tr.createNode({ type: "atomic_concept", title: `Calculate ${conTitle}`, parentId: conNode.id, courseId: courseIds[0], isOfficial: true });
        tr.createNode({ type: "atomic_concept", title: `Apply ${conTitle}`, parentId: conNode.id, courseId: courseIds[0], isOfficial: true });
      }
    }
  }

  localStorage.setItem(SEED_KEY, "1");
}
