// SuperAdmin, Support Center, and System mock data

export interface AcademyRecord {
  id: string; name: string; teacher: string; students: number; courses: number;
  revenue: number; status: "active" | "suspended" | "pending"; joinedAt: string;
}

export interface SupportTicket {
  id: string; user: string; userRole: "student" | "parent" | "teacher";
  category: "technical" | "payment" | "academic"; priority: "low" | "medium" | "high" | "urgent";
  assignedTo: string; status: "open" | "in-progress" | "closed"; subject: string;
  createdAt: string; lastReply: string;
}

export interface Conversation {
  id: string; user: string; role: "student" | "parent" | "teacher";
  lastMessage: string; unread: number; updatedAt: string;
}

export interface ReportRecord {
  id: string; reporter: string; type: "bug" | "abuse" | "payment" | "content";
  description: string; status: "open" | "investigating" | "resolved";
  priority: "low" | "medium" | "high"; createdAt: string;
}

export interface FaqItem {
  id: string; question: string; answer: string; category: string; views: number;
}

export interface AdminUser {
  id: string; name: string; email: string; role: string;
  lastLogin: string; status: "active" | "inactive"; twoFactor: boolean;
}

export interface SystemAuditLog {
  id: string; action: string; admin: string; target: string;
  details: string; date: string; ip: string;
}

export interface Registration {
  id: string; name: string; role: "student" | "teacher" | "parent";
  academy: string; date: string; status: "active" | "pending";
}

export interface ActivityItem {
  id: string; action: string; user: string; detail: string; time: string;
}

// ── Platform Stats ──
export const platformStats = {
  totalTeachers: 342, totalStudents: 18_420, totalRevenue: 2_840_000,
  activeCourses: 856, newRegistrations: 247, pendingWithdrawals: 89_200,
  monthlyGrowth: 14.2, activeAcademies: 128,
};

// ── Academies ──
export const academies: AcademyRecord[] = [
  { id: "ACA-001", name: "Math Masters Academy", teacher: "Dr. Ahmed Kamal", students: 1240, courses: 12, revenue: 124_000, status: "active", joinedAt: "2025-01-15" },
  { id: "ACA-002", name: "Science Hub", teacher: "Prof. Sara Nabil", students: 980, courses: 8, revenue: 98_500, status: "active", joinedAt: "2025-02-20" },
  { id: "ACA-003", name: "Physics Pro", teacher: "Mr. Tarek Mostafa", students: 860, courses: 6, revenue: 87_200, status: "active", joinedAt: "2025-03-10" },
  { id: "ACA-004", name: "Chemistry World", teacher: "Ms. Dina Farouk", students: 720, courses: 5, revenue: 76_800, status: "active", joinedAt: "2025-04-05" },
  { id: "ACA-005", name: "Bio Academy", teacher: "Dr. Omar Hassan", students: 640, courses: 7, revenue: 68_400, status: "active", joinedAt: "2025-05-12" },
  { id: "ACA-006", name: "Arabic Academy", teacher: "Mr. Youssef Ali", students: 520, courses: 4, revenue: 54_200, status: "pending", joinedAt: "2025-06-01" },
  { id: "ACA-007", name: "English Masters", teacher: "Ms. Reem Khaled", students: 480, courses: 5, revenue: 42_800, status: "active", joinedAt: "2025-06-15" },
  { id: "ACA-008", name: "History Hub", teacher: "Dr. Hossam Magdy", students: 340, courses: 3, revenue: 38_600, status: "suspended", joinedAt: "2025-07-01" },
  { id: "ACA-009", name: "Geography Pro", teacher: "Dr. Laila Mahmoud", students: 280, courses: 3, revenue: 28_400, status: "active", joinedAt: "2025-08-10" },
  { id: "ACA-010", name: "IT Masters", teacher: "Mr. Hassan Saeed", students: 420, courses: 6, revenue: 45_200, status: "active", joinedAt: "2025-09-05" },
];

// ── Recent Registrations ──
export const recentRegistrations: Registration[] = [
  { id: "REG-001", name: "Aya Mansour", role: "student", academy: "Math Masters", date: "2026-06-24", status: "active" },
  { id: "REG-002", name: "Omar Tarek", role: "student", academy: "Science Hub", date: "2026-06-24", status: "active" },
  { id: "REG-003", name: "Dr. Laila Mahmoud", role: "teacher", academy: "Geography Pro", date: "2026-06-23", status: "pending" },
  { id: "REG-004", name: "Karim Adel", role: "student", academy: "Physics Pro", date: "2026-06-23", status: "active" },
  { id: "REG-005", name: "Fatma Hassan", role: "parent", academy: "Math Masters", date: "2026-06-22", status: "active" },
  { id: "REG-006", name: "Tamer Gamal", role: "student", academy: "Chemistry World", date: "2026-06-22", status: "active" },
];

// ── Activity Timeline ──
export const activityTimeline: ActivityItem[] = [
  { id: "ACT-1", action: "New Academy", user: "Dr. Laila Mahmoud", detail: "Geography Pro academy created", time: "2 hours ago" },
  { id: "ACT-2", action: "Withdrawal Approved", user: "Admin Ali", detail: "Approved $5,400 for Prof. Sara Nabil", time: "3 hours ago" },
  { id: "ACT-3", action: "Account Suspended", user: "Admin Sara", detail: "Suspended History Hub for policy violation", time: "5 hours ago" },
  { id: "ACT-4", action: "Ticket Resolved", user: "Support Team", detail: "Payment issue #TKT-042 resolved", time: "6 hours ago" },
  { id: "ACT-5", action: "Course Published", user: "Dr. Ahmed Kamal", detail: "Advanced Calculus course published", time: "8 hours ago" },
  { id: "ACT-6", action: "Report Filed", user: "Lina Fares", detail: "Abuse report on comment section", time: "12 hours ago" },
];

// ── Support Tickets ──
export const supportTickets: SupportTicket[] = [
  { id: "TKT-001", user: "Aya Mansour", userRole: "student", category: "payment", priority: "high", assignedTo: "Support Ali", status: "open", subject: "Payment failed but amount deducted", createdAt: "2026-06-24", lastReply: "2026-06-24" },
  { id: "TKT-002", user: "Dr. Ahmed Kamal", userRole: "teacher", category: "technical", priority: "urgent", assignedTo: "Support Sara", status: "in-progress", subject: "Video upload stuck at 80%", createdAt: "2026-06-23", lastReply: "2026-06-24" },
  { id: "TKT-003", user: "Fatma Hassan", userRole: "parent", category: "academic", priority: "medium", assignedTo: "Support Ali", status: "open", subject: "Child grade not showing correctly", createdAt: "2026-06-23", lastReply: "2026-06-23" },
  { id: "TKT-004", user: "Omar Tarek", userRole: "student", category: "technical", priority: "low", assignedTo: "Support Sara", status: "closed", subject: "App crashes on quiz submit", createdAt: "2026-06-22", lastReply: "2026-06-23" },
  { id: "TKT-005", user: "Mr. Tarek Mostafa", userRole: "teacher", category: "payment", priority: "high", assignedTo: "Support Ali", status: "in-progress", subject: "Withdrawal not processed after 5 days", createdAt: "2026-06-21", lastReply: "2026-06-22" },
  { id: "TKT-006", user: "Karim Adel", userRole: "student", category: "academic", priority: "medium", assignedTo: "Unassigned", status: "open", subject: "Cannot access purchased course", createdAt: "2026-06-21", lastReply: "2026-06-21" },
  { id: "TKT-007", user: "Ms. Dina Farouk", userRole: "teacher", category: "technical", priority: "low", assignedTo: "Support Sara", status: "closed", subject: "Question editor formatting broken", createdAt: "2026-06-20", lastReply: "2026-06-21" },
  { id: "TKT-008", user: "Sara Mahmoud", userRole: "student", category: "payment", priority: "medium", assignedTo: "Support Ali", status: "open", subject: "Refund not received after 7 days", createdAt: "2026-06-20", lastReply: "2026-06-20" },
];

// ── Conversations ──
export const conversations: Conversation[] = [
  { id: "CONV-001", user: "Aya Mansour", role: "student", lastMessage: "When will my refund be processed?", unread: 2, updatedAt: "2026-06-24 14:30" },
  { id: "CONV-002", user: "Dr. Ahmed Kamal", role: "teacher", lastMessage: "The upload issue is still happening", unread: 1, updatedAt: "2026-06-24 13:15" },
  { id: "CONV-003", user: "Fatma Hassan", role: "parent", lastMessage: "Thank you for resolving the issue", unread: 0, updatedAt: "2026-06-23 16:45" },
  { id: "CONV-004", user: "Omar Tarek", role: "student", lastMessage: "The crash is fixed now, thanks!", unread: 0, updatedAt: "2026-06-23 11:20" },
  { id: "CONV-005", user: "Mr. Tarek Mostafa", role: "teacher", lastMessage: "Still waiting for withdrawal", unread: 3, updatedAt: "2026-06-24 09:00" },
  { id: "CONV-006", user: "Karim Adel", role: "student", lastMessage: "I still can't access the course", unread: 1, updatedAt: "2026-06-22 17:30" },
];

// ── Reports ──
export const reports: ReportRecord[] = [
  { id: "RPT-001", reporter: "Lina Fares", type: "abuse", description: "Inappropriate comments in discussion forum", status: "open", priority: "high", createdAt: "2026-06-24" },
  { id: "RPT-002", reporter: "Aya Mansour", type: "payment", description: "Double charged for course enrollment", status: "investigating", priority: "high", createdAt: "2026-06-23" },
  { id: "RPT-003", reporter: "Omar Tarek", type: "bug", description: "Quiz timer continues after submission", status: "open", priority: "medium", createdAt: "2026-06-23" },
  { id: "RPT-004", reporter: "Ms. Dina Farouk", type: "content", description: "Incorrect answer marked as correct in quiz", status: "resolved", priority: "medium", createdAt: "2026-06-22" },
  { id: "RPT-005", reporter: "Tamer Gamal", type: "bug", description: "Video player freezes on mobile", status: "investigating", priority: "low", createdAt: "2026-06-21" },
  { id: "RPT-006", reporter: "Sara Mahmoud", type: "payment", description: "Subscription auto-renewed without consent", status: "open", priority: "high", createdAt: "2026-06-20" },
];

// ── FAQ ──
export const faqItems: FaqItem[] = [
  { id: "FAQ-001", question: "How do I reset my password?", answer: "Go to Settings > Security > Change Password. You can also use the 'Forgot Password' link on the login page.", category: "Account", views: 1420 },
  { id: "FAQ-002", question: "How do I request a refund?", answer: "Navigate to your purchase history, click on the order, and select 'Request Refund'. Refunds are processed within 5-7 business days.", category: "Payment", views: 980 },
  { id: "FAQ-003", question: "Can I access courses offline?", answer: "Yes, premium subscribers can download course materials for offline viewing through the mobile app.", category: "Courses", views: 856 },
  { id: "FAQ-004", question: "How do teacher withdrawals work?", answer: "Teachers can withdraw their earned balance once it reaches the minimum threshold. Withdrawals are processed within 3-5 business days.", category: "Payment", views: 742 },
  { id: "FAQ-005", question: "How do I contact my teacher?", answer: "You can message your teacher directly from the course page using the built-in messaging system.", category: "Communication", views: 634 },
  { id: "FAQ-006", question: "What is the Student Memory system?", answer: "The Student Memory system tracks your learning progress and uses spaced repetition to help you retain knowledge better.", category: "Learning", views: 528 },
  { id: "FAQ-007", question: "How do parent accounts work?", answer: "Parents can monitor their children's progress, view grades, communicate with teachers, and manage payments from their dashboard.", category: "Account", views: 412 },
  { id: "FAQ-008", question: "How do I report inappropriate content?", answer: "Click the flag icon on any content or use the Report button in the course page. Our team reviews all reports within 24 hours.", category: "Safety", views: 380 },
];

// ── Admin Users ──
export const adminUsers: AdminUser[] = [
  { id: "ADM-001", name: "Ali Mohamed", email: "ali@classz.com", role: "Super Admin", lastLogin: "2026-06-24 14:30", status: "active", twoFactor: true },
  { id: "ADM-002", name: "Sara Ahmed", email: "sara@classz.com", role: "Support Lead", lastLogin: "2026-06-24 12:15", status: "active", twoFactor: true },
  { id: "ADM-003", name: "Mohamed Fathy", email: "mfathy@classz.com", role: "Finance Admin", lastLogin: "2026-06-23 16:40", status: "active", twoFactor: true },
  { id: "ADM-004", name: "Nour Ibrahim", email: "nour@classz.com", role: "Content Admin", lastLogin: "2026-06-22 09:00", status: "active", twoFactor: false },
  { id: "ADM-005", name: "Hassan Saeed", email: "hassan@classz.com", role: "Developer", lastLogin: "2026-06-24 10:20", status: "active", twoFactor: true },
  { id: "ADM-006", name: "Reem Khaled", email: "reem@classz.com", role: "Support Agent", lastLogin: "2026-06-20 11:30", status: "inactive", twoFactor: false },
];

// ── System Audit Logs ──
export const systemAuditLogs: SystemAuditLog[] = [
  { id: "SAL-001", action: "User Suspended", admin: "Admin Sara", target: "Dr. Hossam Magdy", details: "Suspended History Hub academy for policy violation", date: "2026-06-24 15:22", ip: "192.168.1.10" },
  { id: "SAL-002", action: "Role Changed", admin: "Admin Ali", target: "Nour Ibrahim", details: "Changed role from Support to Content Admin", date: "2026-06-24 11:30", ip: "192.168.1.11" },
  { id: "SAL-003", action: "Settings Updated", admin: "Admin Ali", target: "Platform Settings", details: "Updated payment gateway configuration", date: "2026-06-23 16:40", ip: "192.168.1.11" },
  { id: "SAL-004", action: "User Created", admin: "Admin Ali", target: "Hassan Saeed", details: "Created new developer admin account", date: "2026-06-23 10:15", ip: "192.168.1.11" },
  { id: "SAL-005", action: "Feature Toggle", admin: "Admin Sara", target: "AI Assistant", details: "Enabled AI Assistant feature for all users", date: "2026-06-22 14:00", ip: "192.168.1.10" },
  { id: "SAL-006", action: "Security Alert", admin: "System", target: "Multiple Users", details: "Detected unusual login patterns from 3 IPs", date: "2026-06-22 03:30", ip: "system" },
  { id: "SAL-007", action: "Backup Created", admin: "System", target: "Database", details: "Automated daily backup completed successfully", date: "2026-06-21 02:00", ip: "system" },
  { id: "SAL-008", action: "Password Reset", admin: "Admin Ali", target: "Ms. Reem Khaled", details: "Manual password reset for support agent", date: "2026-06-20 09:45", ip: "192.168.1.11" },
];

// ── Revenue Trend for dashboard ──
export const dashboardRevenueTrend = [
  { month: "Jan", revenue: 380_000 }, { month: "Feb", revenue: 410_000 },
  { month: "Mar", revenue: 445_000 }, { month: "Apr", revenue: 468_000 },
  { month: "May", revenue: 502_000 }, { month: "Jun", revenue: 635_000 },
];
