export interface CourseAnalytic {
  id: string; title: string; enrollment: number; revenue: number; completion: number;
  avgScore: number; watchTime: string; dropOff: string; bestSession: string; weakSession: string;
}

export interface ConceptAnalytic {
  concept: string; atomicConcepts: number; coverage: number; mastery: number;
  difficulty: number; retention: number; weakAtomics: string[];
}

export interface AiRecommendation {
  id: string; type: "chapter" | "student" | "session" | "concept" | "homework" | "exam";
  title: string; description: string; priority: "high" | "medium" | "low"; actionLabel: string;
}

export interface PredictionRecord {
  id: string; type: "fail" | "churn" | "revenue" | "score" | "completion";
  title: string; value: string; confidence: number; details: string;
}

export interface GeneratorTool {
  id: string; name: string; description: string; icon: string; category: "content" | "assessment" | "document";
}

export const overviewStats = {
  totalStudents: 1240, revenue: 68400, completionRate: 72, atRisk: 3,
  avgScore: 79, activeStudents: 980, growthRate: 18,
  growthTrend: [820, 890, 950, 1020, 1100, 1240],
  revenueTrend: [42000, 48000, 52000, 55000, 61000, 68400],
  performanceTrend: [71, 73, 75, 74, 77, 79],
  riskTrend: [8, 6, 5, 4, 3, 3],
};

export const courseAnalytics: CourseAnalytic[] = [
  { id: "CRS-1", title: "Advanced Mathematics", enrollment: 1240, revenue: 38600, completion: 78, avgScore: 82, watchTime: "4,200h", dropOff: "Chapter 5 — Integration", bestSession: "Session 2: Derivatives", weakSession: "Session 7: Series" },
  { id: "CRS-2", title: "Calculus Masterclass", enrollment: 680, revenue: 22000, completion: 71, avgScore: 78, watchTime: "2,100h", dropOff: "Chapter 3 — Chain Rule", bestSession: "Session 1: Limits Review", weakSession: "Session 5: Implicit Diff." },
  { id: "CRS-3", title: "Statistics & Probability", enrollment: 420, revenue: 14200, completion: 65, avgScore: 75, watchTime: "1,400h", dropOff: "Chapter 4 — Distributions", bestSession: "Session 2: Basic Probability", weakSession: "Session 6: Hypothesis Testing" },
  { id: "CRS-4", title: "Linear Algebra", enrollment: 85, revenue: 2800, completion: 45, avgScore: 70, watchTime: "280h", dropOff: "Chapter 2 — Matrix Operations", bestSession: "Session 1: Vectors", weakSession: "Session 3: Eigenvalues" },
];

export const studentSegments = [
  { segment: "High Performers", count: 142, pct: 11, color: "bg-emerald-500/10 text-emerald-600" },
  { segment: "On Track", count: 580, pct: 47, color: "bg-blue-500/10 text-blue-600" },
  { segment: "Needs Attention", count: 285, pct: 23, color: "bg-amber-500/10 text-amber-600" },
  { segment: "At-Risk", count: 98, pct: 8, color: "bg-rose-500/10 text-rose-600" },
  { segment: "Inactive", count: 85, pct: 7, color: "bg-slate-500/10 text-slate-600" },
  { segment: "Paid but Inactive", count: 50, pct: 4, color: "bg-violet-500/10 text-violet-600" },
];

export const conceptAnalytics: ConceptAnalytic[] = [
  { concept: "Limits", atomicConcepts: 8, coverage: 95, mastery: 78, difficulty: 45, retention: 72, weakAtomics: ["One-sided Limits", "Squeeze Theorem"] },
  { concept: "Derivatives", atomicConcepts: 12, coverage: 90, mastery: 72, difficulty: 62, retention: 68, weakAtomics: ["Chain Rule", "Implicit Differentiation"] },
  { concept: "Integration", atomicConcepts: 10, coverage: 75, mastery: 58, difficulty: 78, retention: 55, weakAtomics: ["Integration by Parts", "Partial Fractions", "U-Substitution"] },
  { concept: "Continuity", atomicConcepts: 5, coverage: 92, mastery: 80, difficulty: 40, retention: 75, weakAtomics: ["Removable Discontinuity"] },
  { concept: "Probability", atomicConcepts: 9, coverage: 85, mastery: 65, difficulty: 55, retention: 60, weakAtomics: ["Conditional Probability", "Bayes Theorem"] },
  { concept: "Sequences & Series", atomicConcepts: 7, coverage: 60, mastery: 48, difficulty: 72, retention: 45, weakAtomics: ["Convergence Tests", "Power Series", "Taylor Series"] },
];

export const aiRecommendations: AiRecommendation[] = [
  { id: "AI-001", type: "chapter", title: "Integration Chapter Needs Revision", description: "Chapter 5 has a 42% drop-off rate. Consider shorter videos and more practice problems.", priority: "high", actionLabel: "Review Chapter" },
  { id: "AI-002", type: "student", title: "3 Students Need Urgent Intervention", description: "Karim Adel, Ali Shaker, and Sara Mahmoud show declining engagement. Recommend parent contact.", priority: "high", actionLabel: "View Students" },
  { id: "AI-003", type: "session", title: "Session 7 (Series) Needs Remake", description: "Avg watch time 8 min (expected 25 min). Students skip this session. Consider splitting into 2 shorter sessions.", priority: "medium", actionLabel: "Edit Session" },
  { id: "AI-004", type: "concept", title: "Chain Rule Needs More Questions", description: "Only 12 questions available, but 68% of students get them wrong. Add 20+ new questions.", priority: "medium", actionLabel: "Generate Questions" },
  { id: "AI-005", type: "homework", title: "Assign Targeted Homework", description: "15 students consistently fail Probability questions. A targeted homework assignment would help.", priority: "low", actionLabel: "Create Homework" },
  { id: "AI-006", type: "exam", title: "Mock Exam Recommended", description: "Final exam is in 2 weeks. Students haven't had a practice exam covering all topics.", priority: "high", actionLabel: "Generate Exam" },
];

export const predictions: PredictionRecord[] = [
  { id: "PRD-001", type: "fail", title: "Students Likely to Fail", value: "8 students", confidence: 87, details: "Based on quiz scores, homework completion, and engagement patterns" },
  { id: "PRD-002", type: "churn", title: "Students Likely to Churn", value: "12 students", confidence: 74, details: "Based on login frequency decline and payment patterns" },
  { id: "PRD-003", type: "revenue", title: "Revenue Forecast (July)", value: "EGP 75,000", confidence: 82, details: "Based on enrollment trends and seasonal patterns" },
  { id: "PRD-004", type: "score", title: "Exam Score Prediction", value: "76% avg", confidence: 79, details: "Based on quiz performance and study time analysis" },
  { id: "PRD-005", type: "completion", title: "Course Completion Prediction", value: "68%", confidence: 85, details: "Based on current progress rates and historical data" },
];

export const generatorTools: GeneratorTool[] = [
  { id: "GEN-Q", name: "Question Generator", description: "Generate MCQ, essay, and structured questions from topics", icon: "❓", category: "assessment" },
  { id: "GEN-QZ", name: "Quiz Generator", description: "Create complete quizzes with difficulty balancing", icon: "📋", category: "assessment" },
  { id: "GEN-HW", name: "Homework Generator", description: "Generate homework assignments from weak concepts", icon: "✏️", category: "assessment" },
  { id: "GEN-EX", name: "Exam Generator", description: "Build comprehensive exams with topic coverage", icon: "📑", category: "assessment" },
  { id: "GEN-N", name: "Notes Generator", description: "Generate study notes and summaries from sessions", icon: "📝", category: "content" },
  { id: "GEN-S", name: "Session Generator", description: "Create full session plans with blocks", icon: "🎬", category: "content" },
  { id: "GEN-PPT", name: "PPT Generator", description: "Generate presentation slides from content", icon: "📊", category: "document" },
  { id: "GEN-PDF", name: "PDF Generator", description: "Create printable PDF documents and sheets", icon: "📄", category: "document" },
  { id: "GEN-R", name: "Revision Generator", description: "Create targeted revision plans for weak topics", icon: "🔄", category: "content" },
  { id: "GEN-WQ", name: "Wrong Questions Sheet", description: "Generate personalized wrong-questions practice sheets", icon: "❌", category: "document" },
  { id: "GEN-C", name: "Certificate Generator", description: "Create and customize course completion certificates", icon: "🏆", category: "document" },
];

export const memoryInsightsOverview = [
  { concept: "Limits", avgRetention: 72, studentsBelow50: 45, revisionNeeded: true },
  { concept: "Derivatives", avgRetention: 68, studentsBelow50: 62, revisionNeeded: true },
  { concept: "Integration", avgRetention: 55, studentsBelow50: 120, revisionNeeded: true },
  { concept: "Continuity", avgRetention: 75, studentsBelow50: 28, revisionNeeded: false },
  { concept: "Probability", avgRetention: 60, studentsBelow50: 85, revisionNeeded: true },
  { concept: "Series", avgRetention: 45, studentsBelow50: 150, revisionNeeded: true },
];
