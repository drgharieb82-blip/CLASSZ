export const teacherProfile = {
  publicCode: "TCH-26-0001",
  name: "Dr. Layla Hassan",
  subject: "Mathematics",
  totalStudents: 1240,
  totalCourses: 4,
  activeSessions: 12,
  rating: 4.9,
};

export const teacherRevenue = {
  todayRevenue: 1450,
  monthlyRevenue: 38600,
  totalRevenue: 284000,
  walletBalance: 12800,
  platformFee: 0.15,
  pendingWithdraw: 5000,
  recentSales: [
    { id: "PAY-26-000201", studentCode: "CLS-26-000023", studentName: "Ahmed Youssef", item: "Session: Derivatives", amount: 20, date: "2026-06-21" },
    { id: "PAY-26-000200", studentCode: "CLS-26-000145", studentName: "Sara Mahmoud", item: "Course: Advanced Mathematics", amount: 49, date: "2026-06-21" },
    { id: "PAY-26-000199", studentCode: "CLS-26-000087", studentName: "Nour Hassan", item: "Session: Integration", amount: 20, date: "2026-06-20" },
    { id: "PAY-26-000198", studentCode: "CLS-26-000012", studentName: "Omar Fathy", item: "Wallet Recharge Gift", amount: 25, date: "2026-06-20" },
    { id: "PAY-26-000197", studentCode: "CLS-26-000056", studentName: "Lina Karim", item: "Exam: Calculus Final", amount: 15, date: "2026-06-19" },
  ],
  monthlyBreakdown: [
    { month: "Jan", revenue: 28000, students: 180 },
    { month: "Feb", revenue: 31500, students: 210 },
    { month: "Mar", revenue: 35200, students: 240 },
    { month: "Apr", revenue: 33800, students: 225 },
    { month: "May", revenue: 37100, students: 260 },
    { month: "Jun", revenue: 38600, students: 285 },
  ],
};

export const teacherCourses = [
  { id: "CRS-26-0001", title: "Advanced Mathematics", students: 1240, sessions: 12, revenue: 58000, status: "published" as const, progress: 85 },
  { id: "CRS-26-0009", title: "Calculus Masterclass", students: 680, sessions: 8, revenue: 32000, status: "published" as const, progress: 60 },
  { id: "CRS-26-0015", title: "Statistics & Probability", students: 420, sessions: 6, revenue: 18000, status: "draft" as const, progress: 40 },
  { id: "CRS-26-0022", title: "Linear Algebra", students: 0, sessions: 0, revenue: 0, status: "draft" as const, progress: 10 },
];

export const teacherStudents = [
  { studentCode: "CLS-26-000001", name: "Aya Mansour", course: "Advanced Mathematics", progress: 87, score: 94, lastActive: "2h ago", status: "active" as const },
  { studentCode: "CLS-26-000002", name: "Omar Tarek", course: "Advanced Mathematics", progress: 72, score: 85, lastActive: "5h ago", status: "active" as const },
  { studentCode: "CLS-26-000003", name: "Lina Fares", course: "Calculus Masterclass", progress: 91, score: 96, lastActive: "1d ago", status: "active" as const },
  { studentCode: "CLS-26-000004", name: "Karim Adel", course: "Advanced Mathematics", progress: 45, score: 68, lastActive: "3d ago", status: "at-risk" as const },
  { studentCode: "CLS-26-000005", name: "Nour Sami", course: "Statistics & Probability", progress: 63, score: 74, lastActive: "1w ago", status: "inactive" as const },
  { studentCode: "CLS-26-000006", name: "Hadi Wael", course: "Calculus Masterclass", progress: 78, score: 82, lastActive: "4h ago", status: "active" as const },
  { studentCode: "CLS-26-000023", name: "Ahmed Youssef", course: "Advanced Mathematics", progress: 55, score: 71, lastActive: "6h ago", status: "active" as const },
  { studentCode: "CLS-26-000145", name: "Sara Mahmoud", course: "Advanced Mathematics", progress: 12, score: 0, lastActive: "1h ago", status: "new" as const },
];

export const teacherTeam = [
  { id: "AST-26-0001", name: "Mr. Tarek Nabil", role: "Assistant Teacher", tasks: 24, status: "online" as const, joined: "2026-02-15" },
  { id: "CNT-26-0001", name: "Sara Adel", role: "Content Manager", tasks: 18, status: "online" as const, joined: "2026-03-01" },
  { id: "FIN-26-0001", name: "Mohamed Hassan", role: "Finance Manager", tasks: 8, status: "offline" as const, joined: "2026-04-10" },
  { id: "AST-26-0002", name: "Dina Youssef", role: "Question Reviewer", tasks: 31, status: "online" as const, joined: "2026-01-20" },
  { id: "AST-26-0003", name: "Hana Samir", role: "Moderator", tasks: 12, status: "offline" as const, joined: "2026-05-05" },
];

export const teacherChannels = [
  { id: "ch-general", name: "General", unread: 3, members: 5 },
  { id: "ch-announcements", name: "Announcements", unread: 0, members: 5 },
  { id: "ch-questions", name: "Question Bank", unread: 7, members: 3 },
  { id: "ch-essays", name: "Essay Grading", unread: 2, members: 2 },
  { id: "ch-content", name: "Content Team", unread: 0, members: 2 },
  { id: "ch-finance", name: "Finance", unread: 1, members: 2 },
];

export const essayQueue = [
  { id: "ESY-001", student: "Aya Mansour", studentCode: "CLS-26-000001", title: "Proof: Intermediate Value Theorem", submitted: "2h ago", status: "pending" as const },
  { id: "ESY-002", student: "Omar Tarek", studentCode: "CLS-26-000002", title: "Application of L'Hôpital's Rule", submitted: "5h ago", status: "pending" as const },
  { id: "ESY-003", student: "Lina Fares", studentCode: "CLS-26-000003", title: "Integration by Parts Practice", submitted: "1d ago", status: "graded" as const },
];

export const teacherRewards = {
  coupons: [
    { code: "MATH100", discount: "100%", type: "free" as const, course: "Advanced Mathematics", uses: 5, maxUses: 10, expires: "2026-07-01" },
    { code: "TOP10", discount: "50%", type: "percent" as const, course: "All Courses", uses: 8, maxUses: 20, expires: "2026-06-30" },
    { code: "RAMADAN2026", discount: "$10", type: "fixed" as const, course: "All Courses", uses: 45, maxUses: 100, expires: "2026-04-01" },
  ],
  scholarships: [
    { studentCode: "CLS-26-000001", name: "Aya Mansour", type: "Gold", course: "Advanced Mathematics", since: "2026-03-01" },
    { studentCode: "CLS-26-000003", name: "Lina Fares", type: "Silver", course: "Calculus Masterclass", since: "2026-04-15" },
  ],
  walletGifts: [
    { studentCode: "CLS-26-000001", name: "Aya Mansour", amount: 25, reason: "Top performer — June", date: "2026-06-15" },
    { studentCode: "CLS-26-000006", name: "Hadi Wael", amount: 15, reason: "Competition winner", date: "2026-06-10" },
  ],
};
