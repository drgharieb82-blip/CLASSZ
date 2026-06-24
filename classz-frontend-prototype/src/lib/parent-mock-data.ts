export interface ParentChild {
  id: string;
  name: string;
  grade: string;
  avatar?: string;
  overallStatus: "excellent" | "stable" | "needs_attention" | "critical";
  insight: string;
  courses: { name: string; progress: number; lastActivity: string; expiry: string; paid: boolean; pendingAmount: number }[];
  avgScore: number;
  attendance: { present: number; absent: number; late: number; total: number };
  missingHW: number;
  upcomingExams: { name: string; date: string; course: string }[];
  watchTime: string;
  weeklyTrend: number[];
  quizzes: { name: string; course: string; score: number; maxScore: number; date: string }[];
  homework: { name: string; course: string; status: "submitted" | "missing" | "graded"; score?: number; date: string }[];
  exams: { name: string; course: string; score: number; maxScore: number; date: string }[];
  alerts: { id: string; message: string; severity: "critical" | "warning" | "info" | "positive"; date: string }[];
  weaknesses: { topic: string; chapter: string; action: string }[];
  walletBalance: number;
  totalPaid: number;
  pendingPayment: number;
  messages: { from: string; role: string; message: string; date: string }[];
  timeline: { action: string; detail: string; date: string; type: "watch" | "quiz" | "homework" | "note" | "payment" }[];
}

export const parentProfile = {
  name: "Hoda Mansour",
  email: "hoda@parent.com",
  phone: "+20 100 111 2222",
};

export const children: ParentChild[] = [
  {
    id: "child-1", name: "Aya Mansour", grade: "Grade 12",
    overallStatus: "excellent",
    insight: "Aya is performing excellently across all courses. She completed 95% of her homework and scored above 90% on recent quizzes. Keep encouraging her — she's on track for top marks!",
    courses: [
      { name: "Advanced Mathematics", progress: 87, lastActivity: "2 hours ago", expiry: "2026-12-31", paid: true, pendingAmount: 0 },
      { name: "Calculus Masterclass", progress: 82, lastActivity: "1 day ago", expiry: "2026-12-31", paid: true, pendingAmount: 0 },
    ],
    avgScore: 94, attendance: { present: 22, absent: 1, late: 2, total: 25 }, missingHW: 0,
    upcomingExams: [{ name: "Midterm Exam", date: "2026-07-05", course: "Advanced Mathematics" }],
    watchTime: "42h",
    weeklyTrend: [85, 88, 90, 87, 92, 94, 91],
    quizzes: [
      { name: "Quiz 5: Limits", course: "Advanced Mathematics", score: 18, maxScore: 20, date: "2026-06-22" },
      { name: "Quiz 4: Derivatives", course: "Advanced Mathematics", score: 19, maxScore: 20, date: "2026-06-18" },
      { name: "Quiz 3: Chain Rule", course: "Calculus Masterclass", score: 17, maxScore: 20, date: "2026-06-15" },
    ],
    homework: [
      { name: "HW 3: Integration", course: "Advanced Mathematics", status: "graded", score: 28, date: "2026-06-21" },
      { name: "HW 2: Derivatives", course: "Advanced Mathematics", status: "graded", score: 30, date: "2026-06-14" },
      { name: "HW 1: Limits", course: "Calculus Masterclass", status: "graded", score: 29, date: "2026-06-10" },
    ],
    exams: [{ name: "Practice Exam", course: "Advanced Mathematics", score: 88, maxScore: 100, date: "2026-06-15" }],
    alerts: [
      { id: "a1", message: "Aya scored 94% on her latest quiz — great job!", severity: "positive", date: "2026-06-22" },
      { id: "a2", message: "Upcoming exam: Midterm on July 5th", severity: "info", date: "2026-06-23" },
    ],
    weaknesses: [
      { topic: "Integration by Parts", chapter: "Chapter 6", action: "Practice 5 more problems this week" },
    ],
    walletBalance: 120, totalPaid: 350, pendingPayment: 0,
    messages: [
      { from: "Dr. Layla Hassan", role: "Teacher", message: "Aya is doing excellent work. She could try the advanced problem set for extra challenge.", date: "2026-06-22" },
      { from: "Mr. Tarek Nabil", role: "Assistant", message: "Aya completed all practice problems ahead of schedule.", date: "2026-06-20" },
    ],
    timeline: [
      { action: "Watched session", detail: "Session 6: Integration", date: "2026-06-23 14:30", type: "watch" },
      { action: "Solved quiz", detail: "Quiz 5: Limits — 18/20", date: "2026-06-22 10:00", type: "quiz" },
      { action: "Submitted homework", detail: "HW 3: Integration — 28/30", date: "2026-06-21 22:15", type: "homework" },
      { action: "Teacher note", detail: "Excellent performance on derivatives", date: "2026-06-20 15:00", type: "note" },
      { action: "Payment completed", detail: "Calculus Masterclass — $150", date: "2026-06-05 09:00", type: "payment" },
    ],
  },
  {
    id: "child-2", name: "Karim Mansour", grade: "Grade 10",
    overallStatus: "needs_attention",
    insight: "Karim has been less active this week. He missed 2 homework assignments and his last quiz score dropped. He may need extra support with the Equilibrium chapter — consider checking in with him about his study schedule.",
    courses: [
      { name: "Physics: Mechanics & Waves", progress: 52, lastActivity: "3 days ago", expiry: "2026-12-31", paid: true, pendingAmount: 0 },
      { name: "Arabic Grammar Mastery", progress: 68, lastActivity: "1 day ago", expiry: "2026-12-31", paid: false, pendingAmount: 45 },
    ],
    avgScore: 64, attendance: { present: 18, absent: 4, late: 3, total: 25 }, missingHW: 2,
    upcomingExams: [
      { name: "Chapter 4 Quiz", date: "2026-06-28", course: "Physics: Mechanics & Waves" },
      { name: "Grammar Test", date: "2026-07-02", course: "Arabic Grammar Mastery" },
    ],
    watchTime: "15h",
    weeklyTrend: [72, 68, 65, 60, 58, 62, 59],
    quizzes: [
      { name: "Quiz 3: Forces", course: "Physics: Mechanics & Waves", score: 11, maxScore: 20, date: "2026-06-20" },
      { name: "Quiz 2: Motion", course: "Physics: Mechanics & Waves", score: 14, maxScore: 20, date: "2026-06-14" },
      { name: "Quiz 1: Grammar Rules", course: "Arabic Grammar Mastery", score: 15, maxScore: 20, date: "2026-06-12" },
    ],
    homework: [
      { name: "HW 3: Equilibrium", course: "Physics: Mechanics & Waves", status: "missing", date: "2026-06-22" },
      { name: "HW 4: Sentence Structure", course: "Arabic Grammar Mastery", status: "missing", date: "2026-06-21" },
      { name: "HW 2: Newton's Laws", course: "Physics: Mechanics & Waves", status: "graded", score: 18, date: "2026-06-15" },
    ],
    exams: [{ name: "Midterm: Mechanics", course: "Physics: Mechanics & Waves", score: 58, maxScore: 100, date: "2026-06-10" }],
    alerts: [
      { id: "b1", message: "Karim hasn't logged in for 3 days", severity: "critical", date: "2026-06-23" },
      { id: "b2", message: "2 homework assignments are missing", severity: "warning", date: "2026-06-22" },
      { id: "b3", message: "Quiz score dropped from 70% to 55%", severity: "warning", date: "2026-06-20" },
      { id: "b4", message: "Payment pending for Arabic Grammar course ($45)", severity: "info", date: "2026-06-18" },
      { id: "b5", message: "Upcoming quiz: Chapter 4 on June 28", severity: "info", date: "2026-06-23" },
    ],
    weaknesses: [
      { topic: "Equilibrium & Forces", chapter: "Chapter 3", action: "Review video lesson and attempt 10 practice problems" },
      { topic: "Free Body Diagrams", chapter: "Chapter 3", action: "Watch the explanation video again" },
      { topic: "Sentence Parsing", chapter: "Chapter 4", action: "Complete the extra exercises worksheet" },
    ],
    walletBalance: 15, totalPaid: 180, pendingPayment: 45,
    messages: [
      { from: "Dr. Layla Hassan", role: "Teacher", message: "Karim needs to catch up on missing homework. Please encourage him to complete Chapter 3 exercises.", date: "2026-06-22" },
      { from: "Mr. Tarek Nabil", role: "Assistant", message: "I tried contacting Karim about homework but got no response. Please check in.", date: "2026-06-21" },
      { from: "System", role: "Alert", message: "Automatic alert: No login detected for 3+ days.", date: "2026-06-23" },
    ],
    timeline: [
      { action: "Missed homework", detail: "HW 3: Equilibrium — Overdue", date: "2026-06-22 23:59", type: "homework" },
      { action: "Solved quiz", detail: "Quiz 3: Forces — 11/20", date: "2026-06-20 11:30", type: "quiz" },
      { action: "Watched session", detail: "Session 3: Newton's Laws (partial — 40%)", date: "2026-06-19 16:00", type: "watch" },
      { action: "Teacher note", detail: "Needs extra support with equilibrium concepts", date: "2026-06-18 14:00", type: "note" },
      { action: "Payment completed", detail: "Physics: Mechanics — $180", date: "2026-06-01 10:00", type: "payment" },
    ],
  },
];
