export interface Course {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  level: string;
  lessons: number;
  hours: number;
  rating: number;
  students: number;
  progress: number;
  price: number;
  color: string;
  emoji: string;
  tag: string;
}

export const courses: Course[] = [
  { id: "c1", title: "Advanced Mathematics", subject: "Math", teacher: "Dr. Layla Hassan", level: "Grade 12", lessons: 48, hours: 32, rating: 4.9, students: 1240, progress: 68, price: 49, color: "from-violet-500 to-blue-500", emoji: "📐", tag: "Bestseller" },
  { id: "c2", title: "Physics: Mechanics & Waves", subject: "Physics", teacher: "Mr. Omar Khalil", level: "Grade 11", lessons: 36, hours: 28, rating: 4.8, students: 980, progress: 42, price: 45, color: "from-blue-500 to-cyan-500", emoji: "⚛️", tag: "Popular" },
  { id: "c3", title: "Organic Chemistry", subject: "Chemistry", teacher: "Dr. Sara Nour", level: "Grade 12", lessons: 40, hours: 30, rating: 4.7, students: 760, progress: 15, price: 47, color: "from-emerald-500 to-teal-500", emoji: "🧪", tag: "New" },
  { id: "c4", title: "English Literature", subject: "English", teacher: "Ms. Hana Adel", level: "Grade 10", lessons: 30, hours: 22, rating: 4.6, students: 1530, progress: 90, price: 39, color: "from-pink-500 to-rose-500", emoji: "📚", tag: "Trending" },
  { id: "c5", title: "Biology Essentials", subject: "Biology", teacher: "Dr. Yusuf Amin", level: "Grade 11", lessons: 34, hours: 26, rating: 4.8, students: 670, progress: 0, price: 43, color: "from-green-500 to-emerald-500", emoji: "🧬", tag: "New" },
  { id: "c6", title: "Computer Science 101", subject: "CS", teacher: "Mr. Karim Saad", level: "Grade 12", lessons: 52, hours: 40, rating: 4.9, students: 2100, progress: 33, price: 55, color: "from-slate-500 to-blue-500", emoji: "💻", tag: "Bestseller" },
  { id: "c7", title: "Arabic Grammar Mastery", subject: "Arabic", teacher: "Ustaz Fadi Aziz", level: "Grade 10", lessons: 28, hours: 20, rating: 4.7, students: 890, progress: 55, price: 35, color: "from-amber-500 to-orange-500", emoji: "🕌", tag: "Popular" },
  { id: "c8", title: "World History", subject: "History", teacher: "Ms. Dina Salem", level: "Grade 11", lessons: 32, hours: 24, rating: 4.5, students: 540, progress: 0, price: 38, color: "from-orange-500 to-red-500", emoji: "🏛️", tag: "" },
];

export const lessons = [
  { id: "l1", title: "Introduction to Limits", duration: "12:40", done: true },
  { id: "l2", title: "Continuity of Functions", duration: "18:05", done: true },
  { id: "l3", title: "Derivatives from First Principles", duration: "22:30", done: true, active: true },
  { id: "l4", title: "Rules of Differentiation", duration: "16:12", done: false },
  { id: "l5", title: "Chain Rule Deep Dive", duration: "20:48", done: false },
  { id: "l6", title: "Applications of Derivatives", duration: "24:10", done: false },
  { id: "l7", title: "Introduction to Integration", duration: "19:55", done: false },
  { id: "l8", title: "Definite Integrals", duration: "21:30", done: false },
];

export const chapters = [
  { id: "ch1", title: "Differential Calculus", lessons: 8, status: "Published", progress: 75 },
  { id: "ch2", title: "Integral Calculus", lessons: 7, status: "Published", progress: 40 },
  { id: "ch3", title: "Sequences & Series", lessons: 6, status: "Draft", progress: 0 },
  { id: "ch4", title: "Probability & Statistics", lessons: 9, status: "Review", progress: 20 },
];

export interface Question {
  id: string;
  text: string;
  chapter: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  type: string;
  fav: boolean;
}

export const questions: Question[] = [
  { id: "q1", text: "What is the derivative of f(x) = 3x² + 2x − 5?", chapter: "Differential Calculus", difficulty: "Easy", tags: ["derivatives", "polynomials"], type: "MCQ", fav: true },
  { id: "q2", text: "Evaluate the limit of (sin x)/x as x approaches 0.", chapter: "Limits", difficulty: "Medium", tags: ["limits", "trigonometry"], type: "MCQ", fav: false },
  { id: "q3", text: "Find the integral of 2x dx.", chapter: "Integral Calculus", difficulty: "Easy", tags: ["integration"], type: "MCQ", fav: false },
  { id: "q4", text: "Prove that the function f(x) = |x| is not differentiable at x = 0.", chapter: "Differential Calculus", difficulty: "Hard", tags: ["proofs", "continuity"], type: "Essay", fav: true },
  { id: "q5", text: "A particle moves with velocity v(t) = 3t². Find displacement from t=0 to t=2.", chapter: "Applications", difficulty: "Medium", tags: ["physics", "integration"], type: "MCQ", fav: false },
  { id: "q6", text: "Determine the radius of convergence of the given power series.", chapter: "Sequences & Series", difficulty: "Hard", tags: ["series", "convergence"], type: "MCQ", fav: false },
];

export const quizQuestions = [
  { id: "qz1", text: "What is the derivative of f(x) = x³?", options: ["3x²", "x²", "3x", "2x³"], correct: 0, explain: "Using the power rule, d/dx(xⁿ) = n·xⁿ⁻¹, so the derivative of x³ is 3x²." },
  { id: "qz2", text: "The limit of (1 + 1/n)ⁿ as n → ∞ equals:", options: ["1", "0", "e", "∞"], correct: 2, explain: "This is the classic definition of Euler's number e ≈ 2.718." },
  { id: "qz3", text: "∫ 1/x dx equals:", options: ["x²/2", "ln|x| + C", "1/x² + C", "−1/x² + C"], correct: 1, explain: "The antiderivative of 1/x is the natural logarithm ln|x| plus a constant." },
  { id: "qz4", text: "The slope of a horizontal tangent line is:", options: ["Undefined", "1", "0", "Infinity"], correct: 2, explain: "A horizontal line has a slope of 0, meaning the derivative is zero at that point." },
  { id: "qz5", text: "Which rule helps differentiate composite functions?", options: ["Product rule", "Chain rule", "Quotient rule", "Power rule"], correct: 1, explain: "The chain rule is used to differentiate composite functions f(g(x))." },
];

export const leaderboard = [
  { rank: 1, name: "Aya Mansour", xp: 12480, streak: 64, avatar: "AM", change: "up" },
  { rank: 2, name: "Omar Tarek", xp: 11920, streak: 51, avatar: "OT", change: "up" },
  { rank: 3, name: "Lina Fares", xp: 11340, streak: 47, avatar: "LF", change: "down" },
  { rank: 4, name: "You", xp: 10870, streak: 23, avatar: "ME", change: "up", me: true },
  { rank: 5, name: "Karim Adel", xp: 9980, streak: 30, avatar: "KA", change: "same" },
  { rank: 6, name: "Nour Sami", xp: 9420, streak: 18, avatar: "NS", change: "down" },
  { rank: 7, name: "Hadi Wael", xp: 8870, streak: 12, avatar: "HW", change: "up" },
];

export const notifications = [
  { id: "n1", title: "New lesson published", body: "Chain Rule Deep Dive is now available in Advanced Mathematics.", time: "5m ago", type: "info", unread: true },
  { id: "n2", title: "Quiz graded", body: "You scored 8/10 on the Calculus weekly quiz.", time: "1h ago", type: "success", unread: true },
  { id: "n3", title: "Streak reminder", body: "Keep your 23-day streak alive! Complete a lesson today.", time: "3h ago", type: "warning", unread: true },
  { id: "n4", title: "New badge unlocked", body: "You earned the 'Problem Solver' badge.", time: "1d ago", type: "success", unread: false },
  { id: "n5", title: "Assignment due soon", body: "Physics homework is due in 2 days.", time: "2d ago", type: "info", unread: false },
];

export const certificates = [
  { id: "cert1", title: "English Literature", date: "Mar 2025", score: 94, color: "from-pink-500 to-rose-500" },
  { id: "cert2", title: "Arabic Grammar Mastery", date: "Jan 2025", score: 88, color: "from-amber-500 to-orange-500" },
  { id: "cert3", title: "Intro to Programming", date: "Dec 2024", score: 91, color: "from-slate-500 to-blue-500" },
];

export const weeklyProgress = [
  { day: "Mon", minutes: 45, xp: 120 },
  { day: "Tue", minutes: 60, xp: 180 },
  { day: "Wed", minutes: 30, xp: 90 },
  { day: "Thu", minutes: 75, xp: 220 },
  { day: "Fri", minutes: 50, xp: 150 },
  { day: "Sat", minutes: 90, xp: 280 },
  { day: "Sun", minutes: 40, xp: 110 },
];

export const subjectScores = [
  { subject: "Math", score: 88 },
  { subject: "Physics", score: 76 },
  { subject: "Chemistry", score: 82 },
  { subject: "Biology", score: 70 },
  { subject: "English", score: 94 },
  { subject: "Arabic", score: 85 },
];

export const revenueData = [
  { month: "Jan", revenue: 24000, subs: 320 },
  { month: "Feb", revenue: 28500, subs: 380 },
  { month: "Mar", revenue: 31200, subs: 410 },
  { month: "Apr", revenue: 29800, subs: 395 },
  { month: "May", revenue: 35600, subs: 460 },
  { month: "Jun", revenue: 42100, subs: 540 },
];

export const usersByRole = [
  { name: "Students", value: 8420, color: "var(--color-chart-1)" },
  { name: "Teachers", value: 640, color: "var(--color-chart-2)" },
  { name: "Parents", value: 3210, color: "var(--color-chart-3)" },
  { name: "Admins", value: 48, color: "var(--color-chart-4)" },
  { name: "Others", value: 120, color: "var(--color-chart-5)" },
];

export const students = [
  { id: "s1", name: "Aya Mansour", grade: "Grade 12", courses: 5, progress: 87, lastActive: "2h ago", status: "Active" },
  { id: "s2", name: "Omar Tarek", grade: "Grade 11", courses: 4, progress: 72, lastActive: "5h ago", status: "Active" },
  { id: "s3", name: "Lina Fares", grade: "Grade 12", courses: 6, progress: 91, lastActive: "1d ago", status: "Active" },
  { id: "s4", name: "Karim Adel", grade: "Grade 10", courses: 3, progress: 45, lastActive: "3d ago", status: "Idle" },
  { id: "s5", name: "Nour Sami", grade: "Grade 11", courses: 5, progress: 63, lastActive: "1w ago", status: "Idle" },
  { id: "s6", name: "Hadi Wael", grade: "Grade 12", courses: 4, progress: 78, lastActive: "4h ago", status: "Active" },
];

export const assignments = [
  { id: "a1", title: "Calculus Problem Set 4", course: "Advanced Mathematics", due: "Jun 18", submissions: 32, total: 40, status: "Open" },
  { id: "a2", title: "Newton's Laws Lab Report", course: "Physics", due: "Jun 20", submissions: 18, total: 28, status: "Open" },
  { id: "a3", title: "Essay: The Great Gatsby", course: "English Literature", due: "Jun 15", submissions: 45, total: 45, status: "Closed" },
  { id: "a4", title: "Organic Reactions Quiz", course: "Chemistry", due: "Jun 22", submissions: 5, total: 30, status: "Open" },
];

export const aiPrompts = [
  { icon: "🧠", title: "Explain a concept", desc: "Break down derivatives step by step", to: "/assistant/explain" },
  { icon: "✨", title: "Solve a question", desc: "Get a worked solution with steps", to: "/assistant/solve" },
  { icon: "📊", title: "Analyze my mistakes", desc: "Find patterns in wrong answers", to: "/assistant/analyze" },
  { icon: "🗓️", title: "Build a study plan", desc: "Personalized weekly schedule", to: "/assistant/study-plan" },
];

export const chatMessages = [
  { role: "assistant", text: "Hi! I'm your CLASSZ study assistant 👋 Ask me to explain a concept, solve a problem, or build a study plan." },
  { role: "user", text: "Can you explain the chain rule simply?" },
  { role: "assistant", text: "Of course! The chain rule helps you differentiate composite functions — a function inside another function.\n\nIf y = f(g(x)), then dy/dx = f'(g(x)) · g'(x).\n\nThink of it like peeling layers: differentiate the outer layer, keep the inner intact, then multiply by the derivative of the inner. For example, d/dx(sin(x²)) = cos(x²) · 2x. Want me to walk through another example?" },
];

export const errorLogs = [
  { id: "e1", level: "ERROR", msg: "Uncaught TypeError: cannot read 'map' of undefined", service: "web", time: "12:04:21", count: 3 },
  { id: "e2", level: "WARN", msg: "Slow query detected (1.8s) on courses table", service: "api", time: "11:58:02", count: 12 },
  { id: "e3", level: "ERROR", msg: "Payment webhook signature mismatch", service: "billing", time: "11:42:50", count: 1 },
  { id: "e4", level: "INFO", msg: "Cache warmed for leaderboard endpoint", service: "api", time: "11:30:00", count: 1 },
  { id: "e5", level: "WARN", msg: "Rate limit reached for IP 10.2.4.x", service: "gateway", time: "11:12:33", count: 8 },
];

export const deployments = [
  { id: "d1", version: "v2.8.1", env: "Production", status: "Success", by: "ci-bot", time: "2h ago" },
  { id: "d2", version: "v2.8.0", env: "Production", status: "Success", by: "Karim S.", time: "1d ago" },
  { id: "d3", version: "v2.8.0-rc2", env: "Staging", status: "Success", by: "ci-bot", time: "1d ago" },
  { id: "d4", version: "v2.7.9", env: "Production", status: "Rolled back", by: "Sara N.", time: "3d ago" },
  { id: "d5", version: "v2.7.8", env: "Production", status: "Success", by: "ci-bot", time: "5d ago" },
];

export const featureFlags = [
  { id: "f1", name: "ai-assistant-v2", desc: "New ChatGPT-style assistant UI", on: true, rollout: 100 },
  { id: "f2", name: "gamified-streaks", desc: "Daily streak rewards system", on: true, rollout: 100 },
  { id: "f3", name: "parent-dashboard", desc: "Parent monitoring portal", on: true, rollout: 80 },
  { id: "f4", name: "live-classes", desc: "Real-time video classrooms", on: false, rollout: 0 },
  { id: "f5", name: "arabic-rtl", desc: "Full Arabic RTL support", on: true, rollout: 100 },
];

export const auditLogs = [
  { id: "au1", actor: "admin@classz.io", action: "Updated role permissions", target: "Teacher role", time: "12:30", ip: "10.0.0.4" },
  { id: "au2", actor: "finance@classz.io", action: "Issued refund", target: "Invoice #4821", time: "11:50", ip: "10.0.0.9" },
  { id: "au3", actor: "super@classz.io", action: "Disabled feature flag", target: "live-classes", time: "10:15", ip: "10.0.0.1" },
  { id: "au4", actor: "content@classz.io", action: "Published curriculum", target: "Grade 12 Math", time: "09:42", ip: "10.0.0.7" },
];

export const invoices = [
  { id: "INV-4821", customer: "Aya Mansour", amount: 49, status: "Paid", date: "Jun 12" },
  { id: "INV-4820", customer: "Omar Tarek", amount: 45, status: "Paid", date: "Jun 11" },
  { id: "INV-4819", customer: "Lina Fares", amount: 55, status: "Pending", date: "Jun 10" },
  { id: "INV-4818", customer: "Karim Adel", amount: 39, status: "Failed", date: "Jun 09" },
  { id: "INV-4817", customer: "Nour Sami", amount: 47, status: "Paid", date: "Jun 08" },
];

export const coupons = [
  { code: "WELCOME20", desc: "20% off first month", used: 412, limit: 1000, status: "Active" },
  { code: "SUMMER50", desc: "50% off annual plan", used: 89, limit: 200, status: "Active" },
  { code: "STUDENT10", desc: "10% student discount", used: 1340, limit: 5000, status: "Active" },
  { code: "BACK2SCHOOL", desc: "30% off bundles", used: 200, limit: 200, status: "Expired" },
];

export const studentDashboard = {
  continueLearning: {
    courseEmoji: "📐",
    courseName: "Advanced Mathematics",
    courseColor: "from-violet-500 to-blue-500",
    chapterName: "Differential Calculus",
    lessonTitle: "The Product Rule",
    lessonNumber: 6,
    totalLessons: 48,
    progress: 65,
  },
  todayMission: {
    mustDo: [
      { emoji: "🧪", course: "Organic Chemistry", action: "Finish Alcohols & Phenols lesson", type: "lesson" as const },
      { emoji: "⚛️", course: "Physics", action: "Solve 10 weak questions on Mechanics", type: "practice" as const },
    ],
    recommended: [
      { emoji: "📐", course: "Advanced Mathematics", action: "Review derivatives — due for revision", type: "revision" as const },
    ],
    optional: [
      { emoji: "📚", course: "English Literature", action: "Read Chapter 8 summary notes", type: "lesson" as const },
    ],
  },
  weakPoints: [
    { concept: "Chemical Equilibrium", course: "Organic Chemistry", priority: 3, lastPracticed: "5 days ago" },
    { concept: "Aromatic Substitution", course: "Organic Chemistry", priority: 3, lastPracticed: "1 week ago" },
    { concept: "Newton's Third Law", course: "Physics", priority: 2, lastPracticed: "3 days ago" },
    { concept: "Integration by Parts", course: "Advanced Mathematics", priority: 2, lastPracticed: "4 days ago" },
    { concept: "Electromagnetic Induction", course: "Physics", priority: 1, lastPracticed: "2 days ago" },
    { concept: "Trigonometric Identities", course: "Advanced Mathematics", priority: 1, lastPracticed: "6 days ago" },
  ],
  revisionDue: [
    { lesson: "Introduction to Limits", course: "Advanced Mathematics", emoji: "📐", lastStudied: "5 days ago", urgency: "overdue" as const },
    { lesson: "Continuity of Functions", course: "Advanced Mathematics", emoji: "📐", lastStudied: "7 days ago", urgency: "overdue" as const },
    { lesson: "L'Hôpital's Rule", course: "Advanced Mathematics", emoji: "📐", lastStudied: "4 days ago", urgency: "due" as const },
    { lesson: "Newton's Laws of Motion", course: "Physics", emoji: "⚛️", lastStudied: "6 days ago", urgency: "due" as const },
  ],
  attention: [
    { type: "quiz" as const, title: "Calculus Mid-term Quiz", course: "Advanced Mathematics", emoji: "📐", dueDate: "Jun 22", daysLeft: 3, tier: "upcoming" as const },
    { type: "assignment" as const, title: "Newton's Laws Lab Report", course: "Physics", emoji: "⚛️", dueDate: "Jun 24", daysLeft: 5, tier: "upcoming" as const },
    { type: "announcement" as const, title: "New chapter unlocked: Organic Reactions", course: "Organic Chemistry", emoji: "🧪", dueDate: "", daysLeft: 0, tier: "upcoming" as const },
    { type: "quiz" as const, title: "Organic Chemistry Weekly Quiz", course: "Organic Chemistry", emoji: "🧪", dueDate: "Jun 28", daysLeft: 9, tier: "upcoming" as const },
    { type: "lesson" as const, title: "Chain Rule Deep Dive now available", course: "Advanced Mathematics", emoji: "📐", dueDate: "", daysLeft: 0, tier: "upcoming" as const },
  ],
  achievements: {
    streak: 23,
    xp: 10870,
    weeklyRank: 4,
    totalBadges: 12,
    bestSubject: "English",
    recentBadges: [
      { name: "Problem Solver", emoji: "🏅" },
      { name: "Week Warrior", emoji: "⚔️" },
      { name: "Quiz Master", emoji: "🎯" },
    ],
  },
  favoriteCourse: {
    name: "Advanced Mathematics",
    emoji: "📐",
    color: "from-violet-500 to-blue-500",
    teacher: "Dr. Layla Hassan",
    hoursThisWeek: 4.2,
  },
  courseProgress: [
    { id: "c1", name: "Advanced Mathematics", emoji: "📐", color: "from-violet-500 to-blue-500", teacher: "Dr. Layla Hassan", completedLessons: 33, totalLessons: 48, progress: 68, lastLesson: "The Product Rule" },
    { id: "c2", name: "Physics: Mechanics & Waves", emoji: "⚛️", color: "from-blue-500 to-cyan-500", teacher: "Mr. Omar Khalil", completedLessons: 15, totalLessons: 36, progress: 42, lastLesson: "Wave Motion" },
    { id: "c3", name: "Organic Chemistry", emoji: "🧪", color: "from-emerald-500 to-teal-500", teacher: "Dr. Sara Nour", completedLessons: 6, totalLessons: 40, progress: 15, lastLesson: "Alkenes" },
    { id: "c4", name: "English Literature", emoji: "📚", color: "from-pink-500 to-rose-500", teacher: "Ms. Hana Adel", completedLessons: 27, totalLessons: 30, progress: 90, lastLesson: "The Great Gatsby" },
    { id: "c5", name: "Computer Science 101", emoji: "💻", color: "from-slate-500 to-blue-500", teacher: "Mr. Karim Saad", completedLessons: 17, totalLessons: 52, progress: 33, lastLesson: "Loops & Iteration" },
    { id: "c6", name: "Arabic Grammar Mastery", emoji: "🕌", color: "from-amber-500 to-orange-500", teacher: "Ustaz Fadi Aziz", completedLessons: 15, totalLessons: 28, progress: 55, lastLesson: "الإعراب والبناء" },
  ],
  wallOfHonor: [
    {
      courseId: "c3", courseName: "Organic Chemistry", teacher: "Dr. Ahmed Gharib",
      myRank: 14, myXp: 2840,
      top10: [
        { rank: 1, name: "Mohamed Ali", xp: 4820 }, { rank: 2, name: "Salma Hassan", xp: 4510 },
        { rank: 3, name: "Youssef Adel", xp: 4280 }, { rank: 4, name: "Mariam Nabil", xp: 3990 },
        { rank: 5, name: "Ahmed Khalil", xp: 3870 }, { rank: 6, name: "Lina Samir", xp: 3640 },
        { rank: 7, name: "Hana Tarek", xp: 3520 }, { rank: 8, name: "Karim Nasser", xp: 3380 },
        { rank: 9, name: "Dina Youssef", xp: 3250 }, { rank: 10, name: "Nada Mahmoud", xp: 3120 },
      ],
      aroundMe: [
        { rank: 12, name: "Sara Hassan", xp: 2940 }, { rank: 13, name: "Omar Adel", xp: 2880 },
        { rank: 15, name: "Mohamed Khaled", xp: 2790 }, { rank: 16, name: "Nour Ahmed", xp: 2710 },
      ],
    },
    {
      courseId: "c2", courseName: "Physics: Mechanics & Waves", teacher: "Mr. Omar Khalil",
      myRank: 8, myXp: 3410,
      top10: [
        { rank: 1, name: "Lina Fares", xp: 5120 }, { rank: 2, name: "Omar Tarek", xp: 4890 },
        { rank: 3, name: "Aya Mansour", xp: 4650 }, { rank: 4, name: "Karim Adel", xp: 4210 },
        { rank: 5, name: "Nour Sami", xp: 3980 }, { rank: 6, name: "Hadi Wael", xp: 3770 },
        { rank: 7, name: "Sara Nabil", xp: 3550 }, { rank: 8, name: "You", xp: 3410 },
        { rank: 9, name: "Ahmed Fathy", xp: 3280 }, { rank: 10, name: "Dina Salem", xp: 3100 },
      ],
      aroundMe: [
        { rank: 6, name: "Hadi Wael", xp: 3770 }, { rank: 7, name: "Sara Nabil", xp: 3550 },
        { rank: 9, name: "Ahmed Fathy", xp: 3280 }, { rank: 10, name: "Dina Salem", xp: 3100 },
      ],
    },
    {
      courseId: "c1", courseName: "Advanced Mathematics", teacher: "Dr. Layla Hassan",
      myRank: 5, myXp: 3980,
      top10: [
        { rank: 1, name: "Aya Mansour", xp: 5340 }, { rank: 2, name: "Omar Tarek", xp: 5010 },
        { rank: 3, name: "Lina Fares", xp: 4720 }, { rank: 4, name: "Karim Adel", xp: 4150 },
        { rank: 5, name: "You", xp: 3980 }, { rank: 6, name: "Hana Tarek", xp: 3810 },
        { rank: 7, name: "Nour Sami", xp: 3640 }, { rank: 8, name: "Hadi Wael", xp: 3490 },
        { rank: 9, name: "Sara Hassan", xp: 3310 }, { rank: 10, name: "Mohamed Ali", xp: 3180 },
      ],
      aroundMe: [
        { rank: 3, name: "Lina Fares", xp: 4720 }, { rank: 4, name: "Karim Adel", xp: 4150 },
        { rank: 6, name: "Hana Tarek", xp: 3810 }, { rank: 7, name: "Nour Sami", xp: 3640 },
      ],
    },
  ],
  announcements: [
    { from: "Dr. Layla Hassan", course: "Advanced Mathematics", message: "New lesson published: Chain Rule Deep Dive", time: "2h ago", unread: true },
    { from: "Dr. Sara Nour", course: "Organic Chemistry", message: "Chapter 4 is now unlocked. Start with Aromatic Compounds.", time: "5h ago", unread: true },
    { from: "Mr. Omar Khalil", course: "Physics", message: "Lab report deadline extended to Jun 24.", time: "1d ago", unread: false },
  ],
  parentMessages: [
    { from: "Mom", message: "Great quiz results! Keep going 💪", time: "Today", unread: true },
    { from: "Dad", message: "How is the physics project coming along?", time: "Yesterday", unread: false },
  ],
};

export const lessonPlayerData = {
  course: {
    name: "Advanced Mathematics",
    emoji: "📐",
    color: "from-violet-500 to-blue-500",
    progress: 68,
    teacher: { name: "Dr. Layla Hassan", subject: "Mathematics", initials: "LH" },
  },
  chapters: [
    {
      id: "ch1",
      title: "Chapter 1: Limits & Continuity",
      lessons: [
        { id: "l1", title: "Introduction to Limits", duration: "12:40", status: "completed" as const },
        { id: "l2", title: "Continuity of Functions", duration: "18:05", status: "completed" as const },
        { id: "l3", title: "L'Hôpital's Rule", duration: "15:30", status: "completed" as const },
      ],
    },
    {
      id: "ch2",
      title: "Chapter 2: Differential Calculus",
      lessons: [
        { id: "l4", title: "Derivatives from First Principles", duration: "22:30", status: "completed" as const },
        { id: "l5", title: "Power Rule & Constant Rule", duration: "14:20", status: "completed" as const },
        { id: "l6", title: "The Product Rule", duration: "18:30", status: "active" as const },
        { id: "l7", title: "The Quotient Rule", duration: "16:12", status: "available" as const },
        { id: "l8", title: "Chain Rule Deep Dive", duration: "20:48", status: "available" as const },
      ],
    },
    {
      id: "ch3",
      title: "Chapter 3: Applications",
      lessons: [
        { id: "l9", title: "Tangent Lines & Normals", duration: "19:10", status: "locked" as const },
        { id: "l10", title: "Optimization Problems", duration: "24:10", status: "locked" as const },
        { id: "l11", title: "Related Rates", duration: "21:30", status: "locked" as const },
      ],
    },
    {
      id: "ch4",
      title: "Chapter 4: Integration",
      lessons: [
        { id: "l12", title: "Introduction to Integration", duration: "19:55", status: "locked" as const },
        { id: "l13", title: "Definite Integrals", duration: "21:30", status: "locked" as const },
        { id: "l14", title: "Area Under Curves", duration: "23:15", status: "locked" as const },
      ],
    },
  ],
  currentLesson: {
    id: "l6",
    title: "The Product Rule",
    description: "Learn how to differentiate the product of two functions using the product rule.",
    number: 6,
    totalLessons: 14,
    chapterName: "Chapter 2: Differential Calculus",
    progress: 65,
    contentType: "Video + Notes",
    duration: "18:30",
    objectives: [
      "Understand when and why the product rule is needed",
      "Derive the product rule from first principles",
      "Apply the product rule to polynomial and trigonometric products",
      "Combine the product rule with other differentiation rules",
    ],
    keyConcepts: ["Product Rule", "Leibniz Notation", "Composite Functions", "Chain Rule"],
    watchedTime: "12:06",
    remainingTime: "6:24",
    contentBlocks: [
      { type: "text" as const, content: "The product rule is a fundamental technique in calculus for finding the derivative of a product of two functions. If you have two functions u(x) and v(x), their product's derivative is not simply the product of their individual derivatives." },
      { type: "equation" as const, label: "The Product Rule", content: "d/dx [u(x) · v(x)] = u'(x) · v(x) + u(x) · v'(x)" },
      { type: "text" as const, content: "In words: the derivative of the first times the second, plus the first times the derivative of the second. This is sometimes remembered as \"first d-second plus second d-first\"." },
      { type: "note" as const, content: "A common mistake is to think that the derivative of a product equals the product of the derivatives. This is NOT true: d/dx[f·g] ≠ f'·g'." },
      { type: "equation" as const, label: "Example", content: "If y = x² · sin(x), then y' = 2x · sin(x) + x² · cos(x)" },
      { type: "text" as const, content: "Let's verify: u = x², so u' = 2x. And v = sin(x), so v' = cos(x). Applying the product rule: u'v + uv' = 2x·sin(x) + x²·cos(x)." },
      { type: "warning" as const, content: "When applying the product rule in chain, always identify your u and v clearly before differentiating. Mixing them up is the most common source of errors on exams." },
      { type: "equation" as const, label: "General Leibniz form", content: "(fg)' = f'g + fg'" },
    ],
  },
};

export const testimonials = [
  { name: "Aya M.", role: "Grade 12 Student", text: "CLASSZ made calculus actually fun. The AI assistant explains everything until it clicks.", avatar: "AM" },
  { name: "Mr. Omar", role: "Physics Teacher", text: "Managing my courses and question bank has never been easier. The analytics are gold.", avatar: "OK" },
  { name: "Hana A.", role: "Parent", text: "I can finally see exactly how my daughter is doing — homework, attendance, and grades in one place.", avatar: "HA" },
];

export const pricingPlans = [
  { name: "Starter", price: 0, period: "forever", desc: "For curious learners", features: ["3 courses access", "Basic question bank", "Community support", "Progress tracking"], cta: "Start free", popular: false },
  { name: "Pro", price: 19, period: "month", desc: "For serious students", features: ["Unlimited courses", "Full question bank", "AI study assistant", "Certificates", "Leaderboards & streaks"], cta: "Go Pro", popular: true },
  { name: "Family", price: 39, period: "month", desc: "For parents & students", features: ["Everything in Pro", "Up to 4 students", "Parent dashboard", "Attendance & reports", "Priority support"], cta: "Choose Family", popular: false },
];

export const payments = [
  { id: "PAY-9921", customer: "Aya Mansour", method: "Visa •••• 4242", plan: "Pro Monthly", amount: 19, status: "Paid", date: "Jun 14" },
  { id: "PAY-9920", customer: "Omar Tarek", method: "Mastercard •••• 8810", plan: "Pro Monthly", amount: 19, status: "Paid", date: "Jun 14" },
  { id: "PAY-9919", customer: "Lina Fares", method: "Apple Pay", plan: "Family Monthly", amount: 39, status: "Paid", date: "Jun 13" },
  { id: "PAY-9918", customer: "Karim Adel", method: "Visa •••• 1190", plan: "Pro Annual", amount: 182, status: "Pending", date: "Jun 13" },
  { id: "PAY-9917", customer: "Nour Sami", method: "Mada •••• 5521", plan: "Pro Monthly", amount: 19, status: "Failed", date: "Jun 12" },
  { id: "PAY-9916", customer: "Hadi Wael", method: "PayPal", plan: "Family Monthly", amount: 39, status: "Paid", date: "Jun 12" },
];

export const subscriptions = [
  { id: "sub1", customer: "Aya Mansour", plan: "Pro", cycle: "Monthly", mrr: 19, renews: "Jul 14", status: "Active" },
  { id: "sub2", customer: "Lina Fares", plan: "Family", cycle: "Monthly", mrr: 39, renews: "Jul 13", status: "Active" },
  { id: "sub3", customer: "Karim Adel", plan: "Pro", cycle: "Annual", mrr: 15, renews: "Jun 13 '26", status: "Active" },
  { id: "sub4", customer: "Nour Sami", plan: "Pro", cycle: "Monthly", mrr: 19, renews: "Jun 12", status: "Pending" },
  { id: "sub5", customer: "Sami Doaa", plan: "Starter", cycle: "Free", mrr: 0, renews: "—", status: "Active" },
  { id: "sub6", customer: "Rana Adel", plan: "Pro", cycle: "Monthly", mrr: 19, renews: "Jun 09", status: "Expired" },
];

export const parentMessages = [
  { id: "m1", from: "Dr. Layla Hassan", role: "Math Teacher", preview: "Aya did wonderfully on the calculus quiz this week!", time: "10:24", unread: true, avatar: "LH" },
  { id: "m2", from: "Mr. Omar Khalil", role: "Physics Teacher", preview: "Reminder: lab report is due this Friday.", time: "Yesterday", unread: true, avatar: "OK" },
  { id: "m3", from: "School Admin", role: "Administration", preview: "Parent-teacher meeting scheduled for Jun 22.", time: "Mon", unread: false, avatar: "SA" },
  { id: "m4", from: "Ms. Hana Adel", role: "English Teacher", preview: "Great improvement in essay structure lately.", time: "Sun", unread: false, avatar: "HA" },
];

export const systemServices = [
  { id: "svc1", name: "Authentication", status: "Operational", uptime: "99.99%", latency: "42ms" },
  { id: "svc2", name: "Course Delivery", status: "Operational", uptime: "99.97%", latency: "88ms" },
  { id: "svc3", name: "AI Assistant", status: "Degraded", uptime: "99.21%", latency: "612ms" },
  { id: "svc4", name: "Payments", status: "Operational", uptime: "100%", latency: "120ms" },
  { id: "svc5", name: "Media CDN", status: "Operational", uptime: "99.98%", latency: "30ms" },
  { id: "svc6", name: "Notifications", status: "Maintenance", uptime: "98.40%", latency: "—" },
];
