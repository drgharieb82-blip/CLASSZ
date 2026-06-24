export interface TeamMember {
  id: string;
  name: string;
  email: string;
  mobile: string;
  username: string;
  avatar?: string;
  roles: string[];
  assignedCourses: string[];
  status: "active" | "inactive" | "suspended";
  online: boolean;
  lastActive: string;
  joinedDate: string;
  tasksCompleted: number;
  revenueShare?: { type: string; value: number };
}

export interface JobPost {
  id: string;
  title: string;
  type: "full-time" | "part-time" | "contract" | "freelance";
  salaryType: "fixed" | "percentage" | "per-task";
  salaryAmount: string;
  requirements: string[];
  responsibilities: string[];
  experience: string;
  status: "published" | "draft" | "closed";
  applicants: number;
  postedDate: string;
}

export interface Application {
  id: string;
  applicantName: string;
  email: string;
  whatsapp: string;
  telegram: string;
  position: string;
  experience: string;
  status: "new" | "shortlisted" | "interview" | "accepted" | "rejected";
  submittedDate: string;
  evaluationScore: number;
  cvUrl: string;
  introVideoUrl: string;
  notes: string;
}

export interface StudentPod {
  id: string;
  name: string;
  assistantId: string;
  assistantName: string;
  studentCount: number;
  riskCount: number;
  completionAvg: number;
  unsubmittedHW: number;
  students: { id: string; name: string; progress: number; risk: boolean }[];
}

export interface RevenueEntry {
  id: string;
  memberId: string;
  memberName: string;
  role: string;
  compensationType: "fixed" | "percentage" | "per-task" | "per-graded";
  amount: number;
  totalEarned: number;
  paid: number;
  pending: number;
}

export interface TeamTask {
  id: string;
  title: string;
  assignedTo: string;
  assignedToName: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  relatedCourse: string;
  status: "todo" | "in-progress" | "review" | "done";
}

export interface ActivityLog {
  id: string;
  memberId: string;
  memberName: string;
  action: string;
  actionType: "member" | "content" | "assessment" | "student" | "payment" | "system";
  course?: string;
  timestamp: string;
  details: string;
}

export interface Invitation {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  role: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  sentDate: string;
  expiryDate: string;
  deliveryMethod: "email" | "whatsapp" | "both";
}

export const teamMembers: TeamMember[] = [
  {
    id: "TM-001", name: "Mr. Tarek Nabil", email: "tarek@academy.com", mobile: "+20 100 123 4567",
    username: "tarek.nabil", roles: ["Assistant Teacher"], assignedCourses: ["Advanced Mathematics", "Calculus Masterclass"],
    status: "active", online: true, lastActive: "Just now", joinedDate: "2026-02-15", tasksCompleted: 47,
    revenueShare: { type: "percentage", value: 15 },
  },
  {
    id: "TM-002", name: "Sara Adel", email: "sara@academy.com", mobile: "+20 101 234 5678",
    username: "sara.adel", roles: ["Content Manager"], assignedCourses: ["Advanced Mathematics", "Statistics & Probability"],
    status: "active", online: true, lastActive: "5 min ago", joinedDate: "2026-03-01", tasksCompleted: 38,
    revenueShare: { type: "fixed", value: 3500 },
  },
  {
    id: "TM-003", name: "Mohamed Hassan", email: "mhassan@academy.com", mobile: "+20 102 345 6789",
    username: "m.hassan", roles: ["Finance"], assignedCourses: [],
    status: "active", online: false, lastActive: "2 hours ago", joinedDate: "2026-04-10", tasksCompleted: 22,
    revenueShare: { type: "fixed", value: 4000 },
  },
  {
    id: "TM-004", name: "Dina Youssef", email: "dina@academy.com", mobile: "+20 103 456 7890",
    username: "dina.youssef", roles: ["Assistant Teacher", "Content Manager"], assignedCourses: ["Calculus Masterclass"],
    status: "active", online: true, lastActive: "10 min ago", joinedDate: "2026-01-20", tasksCompleted: 63,
    revenueShare: { type: "percentage", value: 12 },
  },
  {
    id: "TM-005", name: "Hana Samir", email: "hana@academy.com", mobile: "+20 104 567 8901",
    username: "hana.samir", roles: ["Moderator"], assignedCourses: ["Advanced Mathematics", "Calculus Masterclass", "Statistics & Probability"],
    status: "active", online: false, lastActive: "1 day ago", joinedDate: "2026-05-05", tasksCompleted: 29,
    revenueShare: { type: "per-task", value: 50 },
  },
  {
    id: "TM-006", name: "Ahmed Kamal", email: "ahmed.k@academy.com", mobile: "+20 105 678 9012",
    username: "ahmed.kamal", roles: ["Assistant Teacher"], assignedCourses: ["Statistics & Probability"],
    status: "active", online: true, lastActive: "Just now", joinedDate: "2026-05-20", tasksCompleted: 15,
    revenueShare: { type: "per-graded", value: 5 },
  },
  {
    id: "TM-007", name: "Laila Farouk", email: "laila@academy.com", mobile: "+20 106 789 0123",
    username: "laila.farouk", roles: ["Developer"], assignedCourses: [],
    status: "inactive", online: false, lastActive: "1 week ago", joinedDate: "2026-03-15", tasksCompleted: 41,
    revenueShare: { type: "fixed", value: 5000 },
  },
  {
    id: "TM-008", name: "Youssef Mahmoud", email: "youssef@academy.com", mobile: "+20 107 890 1234",
    username: "youssef.m", roles: ["Admin", "Content Manager"], assignedCourses: ["Advanced Mathematics", "Calculus Masterclass", "Statistics & Probability", "Linear Algebra"],
    status: "active", online: true, lastActive: "30 min ago", joinedDate: "2026-01-05", tasksCompleted: 84,
    revenueShare: { type: "fixed", value: 6000 },
  },
];

export const jobPosts: JobPost[] = [
  {
    id: "JP-001", title: "Assistant Teacher — Mathematics", type: "part-time",
    salaryType: "percentage", salaryAmount: "15% per course",
    requirements: ["BSc in Mathematics or related field", "Min 2 years teaching experience", "Familiar with Egyptian curriculum"],
    responsibilities: ["Grade student essays and homework", "Support students via chat", "Review question bank"],
    experience: "2+ years in education", status: "published", applicants: 12, postedDate: "2026-06-10",
  },
  {
    id: "JP-002", title: "Content Manager", type: "full-time",
    salaryType: "fixed", salaryAmount: "EGP 8,000/month",
    requirements: ["Experience in content management", "Strong attention to detail", "Proficiency in Arabic and English"],
    responsibilities: ["Manage lesson uploads", "Review and publish content", "Maintain content calendar"],
    experience: "3+ years", status: "published", applicants: 8, postedDate: "2026-06-15",
  },
  {
    id: "JP-003", title: "Moderator", type: "part-time",
    salaryType: "per-task", salaryAmount: "EGP 50/task",
    requirements: ["Excellent communication skills", "Available evenings and weekends"],
    responsibilities: ["Monitor student chat", "Handle reports", "Maintain community guidelines"],
    experience: "1+ years", status: "published", applicants: 23, postedDate: "2026-06-18",
  },
  {
    id: "JP-004", title: "Video Editor", type: "freelance",
    salaryType: "per-task", salaryAmount: "EGP 300/video",
    requirements: ["Proficiency in Premiere Pro or DaVinci Resolve", "Experience with educational content"],
    responsibilities: ["Edit recorded sessions", "Add intros/outros", "Color correct and enhance audio"],
    experience: "2+ years", status: "draft", applicants: 0, postedDate: "2026-06-20",
  },
  {
    id: "JP-005", title: "Designer", type: "contract",
    salaryType: "fixed", salaryAmount: "EGP 5,000/month",
    requirements: ["Strong portfolio in educational design", "Proficiency in Figma"],
    responsibilities: ["Create course thumbnails", "Design social media posts", "Create infographics"],
    experience: "2+ years", status: "closed", applicants: 15, postedDate: "2026-05-01",
  },
  {
    id: "JP-006", title: "Support Agent", type: "full-time",
    salaryType: "fixed", salaryAmount: "EGP 6,000/month",
    requirements: ["Patience and empathy", "Familiarity with ed-tech platforms"],
    responsibilities: ["Answer student queries", "Resolve technical issues", "Escalate complex problems"],
    experience: "1+ years in customer support", status: "published", applicants: 31, postedDate: "2026-06-22",
  },
];

export const applications: Application[] = [
  {
    id: "APP-001", applicantName: "Nour El-Din Ali", email: "nour@gmail.com", whatsapp: "+20 100 111 2222",
    telegram: "@nourali", position: "Assistant Teacher — Mathematics", experience: "3 years teaching Grade 12 Math",
    status: "new", submittedDate: "2026-06-22", evaluationScore: 0, cvUrl: "#", introVideoUrl: "#",
    notes: "",
  },
  {
    id: "APP-002", applicantName: "Fatima Khaled", email: "fatima.k@gmail.com", whatsapp: "+20 101 222 3333",
    telegram: "@fatimak", position: "Content Manager", experience: "4 years in digital content management",
    status: "shortlisted", submittedDate: "2026-06-20", evaluationScore: 82, cvUrl: "#", introVideoUrl: "#",
    notes: "Strong portfolio. Good English writing skills.",
  },
  {
    id: "APP-003", applicantName: "Amr Sayed", email: "amr.s@gmail.com", whatsapp: "+20 102 333 4444",
    telegram: "@amrsayed", position: "Moderator", experience: "2 years community management",
    status: "interview", submittedDate: "2026-06-19", evaluationScore: 75, cvUrl: "#", introVideoUrl: "#",
    notes: "Interview scheduled for June 25. Good references.",
  },
  {
    id: "APP-004", applicantName: "Rania Ibrahim", email: "rania@gmail.com", whatsapp: "+20 103 444 5555",
    telegram: "@raniaibrahim", position: "Assistant Teacher — Mathematics", experience: "5 years high school teaching",
    status: "accepted", submittedDate: "2026-06-15", evaluationScore: 91, cvUrl: "#", introVideoUrl: "#",
    notes: "Excellent credentials. MSc in Applied Mathematics. Account created.",
  },
  {
    id: "APP-005", applicantName: "Karim Mostafa", email: "karim.m@gmail.com", whatsapp: "+20 104 555 6666",
    telegram: "@karimm", position: "Video Editor", experience: "1 year freelance editing",
    status: "rejected", submittedDate: "2026-06-18", evaluationScore: 45, cvUrl: "#", introVideoUrl: "#",
    notes: "Insufficient experience with educational content.",
  },
  {
    id: "APP-006", applicantName: "Yasmin Tawfik", email: "yasmin.t@gmail.com", whatsapp: "+20 105 666 7777",
    telegram: "@yasmint", position: "Support Agent", experience: "3 years customer support at telecom",
    status: "new", submittedDate: "2026-06-23", evaluationScore: 0, cvUrl: "#", introVideoUrl: "#",
    notes: "",
  },
  {
    id: "APP-007", applicantName: "Hassan Reda", email: "hassan.r@gmail.com", whatsapp: "+20 106 777 8888",
    telegram: "@hassanr", position: "Content Manager", experience: "2 years in publishing",
    status: "shortlisted", submittedDate: "2026-06-21", evaluationScore: 78, cvUrl: "#", introVideoUrl: "#",
    notes: "Good organizational skills. Needs English improvement.",
  },
  {
    id: "APP-008", applicantName: "Mona Saber", email: "mona.s@gmail.com", whatsapp: "+20 107 888 9999",
    telegram: "@monas", position: "Assistant Teacher — Mathematics", experience: "6 years teaching university math",
    status: "interview", submittedDate: "2026-06-17", evaluationScore: 88, cvUrl: "#", introVideoUrl: "#",
    notes: "PhD candidate. Very strong candidate. Interview June 26.",
  },
];

export const studentPods: StudentPod[] = [
  {
    id: "POD-A", name: "Group A", assistantId: "TM-001", assistantName: "Mr. Tarek Nabil",
    studentCount: 32, riskCount: 3, completionAvg: 78, unsubmittedHW: 5,
    students: [
      { id: "S-001", name: "Aya Mansour", progress: 87, risk: false },
      { id: "S-002", name: "Omar Tarek", progress: 72, risk: false },
      { id: "S-003", name: "Karim Adel", progress: 45, risk: true },
      { id: "S-004", name: "Nada Farid", progress: 91, risk: false },
      { id: "S-005", name: "Yara Hosny", progress: 38, risk: true },
      { id: "S-006", name: "Ziad Hossam", progress: 82, risk: false },
    ],
  },
  {
    id: "POD-B", name: "Group B", assistantId: "TM-004", assistantName: "Dina Youssef",
    studentCount: 28, riskCount: 2, completionAvg: 82, unsubmittedHW: 3,
    students: [
      { id: "S-007", name: "Lina Fares", progress: 91, risk: false },
      { id: "S-008", name: "Hadi Wael", progress: 78, risk: false },
      { id: "S-009", name: "Sara Mahmoud", progress: 12, risk: true },
      { id: "S-010", name: "Tamer Gamal", progress: 85, risk: false },
      { id: "S-011", name: "Rana Khaled", progress: 67, risk: false },
      { id: "S-012", name: "Ali Shaker", progress: 41, risk: true },
    ],
  },
  {
    id: "POD-C", name: "Group C", assistantId: "TM-006", assistantName: "Ahmed Kamal",
    studentCount: 25, riskCount: 4, completionAvg: 71, unsubmittedHW: 8,
    students: [
      { id: "S-013", name: "Nour Sami", progress: 63, risk: false },
      { id: "S-014", name: "Ahmed Youssef", progress: 55, risk: true },
      { id: "S-015", name: "Mariam Lotfy", progress: 89, risk: false },
      { id: "S-016", name: "Khaled Saeed", progress: 34, risk: true },
      { id: "S-017", name: "Dalia Nasser", progress: 76, risk: false },
      { id: "S-018", name: "Bassem Fouad", progress: 28, risk: true },
    ],
  },
];

export const revenueEntries: RevenueEntry[] = [
  { id: "REV-001", memberId: "TM-001", memberName: "Mr. Tarek Nabil", role: "Assistant Teacher", compensationType: "percentage", amount: 15, totalEarned: 12450, paid: 9800, pending: 2650 },
  { id: "REV-002", memberId: "TM-002", memberName: "Sara Adel", role: "Content Manager", compensationType: "fixed", amount: 3500, totalEarned: 14000, paid: 14000, pending: 0 },
  { id: "REV-003", memberId: "TM-003", memberName: "Mohamed Hassan", role: "Finance", compensationType: "fixed", amount: 4000, totalEarned: 12000, paid: 8000, pending: 4000 },
  { id: "REV-004", memberId: "TM-004", memberName: "Dina Youssef", role: "Assistant Teacher", compensationType: "percentage", amount: 12, totalEarned: 9960, paid: 7200, pending: 2760 },
  { id: "REV-005", memberId: "TM-005", memberName: "Hana Samir", role: "Moderator", compensationType: "per-task", amount: 50, totalEarned: 3650, paid: 3000, pending: 650 },
  { id: "REV-006", memberId: "TM-006", memberName: "Ahmed Kamal", role: "Assistant Teacher", compensationType: "per-graded", amount: 5, totalEarned: 1875, paid: 1500, pending: 375 },
  { id: "REV-007", memberId: "TM-007", memberName: "Laila Farouk", role: "Developer", compensationType: "fixed", amount: 5000, totalEarned: 20000, paid: 20000, pending: 0 },
  { id: "REV-008", memberId: "TM-008", memberName: "Youssef Mahmoud", role: "Admin", compensationType: "fixed", amount: 6000, totalEarned: 36000, paid: 30000, pending: 6000 },
];

export const teamTasks: TeamTask[] = [
  { id: "TSK-001", title: "Upload Session 7 PDF", assignedTo: "TM-002", assignedToName: "Sara Adel", dueDate: "2026-06-25", priority: "high", relatedCourse: "Advanced Mathematics", status: "todo" },
  { id: "TSK-002", title: "Grade Homework 3", assignedTo: "TM-001", assignedToName: "Mr. Tarek Nabil", dueDate: "2026-06-24", priority: "high", relatedCourse: "Advanced Mathematics", status: "in-progress" },
  { id: "TSK-003", title: "Review Question Bank — Chapter 4", assignedTo: "TM-004", assignedToName: "Dina Youssef", dueDate: "2026-06-26", priority: "medium", relatedCourse: "Calculus Masterclass", status: "review" },
  { id: "TSK-004", title: "Contact weak students", assignedTo: "TM-001", assignedToName: "Mr. Tarek Nabil", dueDate: "2026-06-25", priority: "high", relatedCourse: "Advanced Mathematics", status: "todo" },
  { id: "TSK-005", title: "Prepare quiz for Chapter 2", assignedTo: "TM-004", assignedToName: "Dina Youssef", dueDate: "2026-06-27", priority: "medium", relatedCourse: "Statistics & Probability", status: "todo" },
  { id: "TSK-006", title: "Edit Session 5 video", assignedTo: "TM-002", assignedToName: "Sara Adel", dueDate: "2026-06-28", priority: "low", relatedCourse: "Advanced Mathematics", status: "in-progress" },
  { id: "TSK-007", title: "Moderate chat room #questions", assignedTo: "TM-005", assignedToName: "Hana Samir", dueDate: "2026-06-24", priority: "medium", relatedCourse: "All Courses", status: "done" },
  { id: "TSK-008", title: "Update revenue report — June", assignedTo: "TM-003", assignedToName: "Mohamed Hassan", dueDate: "2026-06-30", priority: "low", relatedCourse: "All Courses", status: "todo" },
  { id: "TSK-009", title: "Grade Exam 2 essays", assignedTo: "TM-006", assignedToName: "Ahmed Kamal", dueDate: "2026-06-25", priority: "high", relatedCourse: "Statistics & Probability", status: "in-progress" },
  { id: "TSK-010", title: "Create Session 8 slides", assignedTo: "TM-002", assignedToName: "Sara Adel", dueDate: "2026-06-29", priority: "medium", relatedCourse: "Calculus Masterclass", status: "todo" },
  { id: "TSK-011", title: "Review parent feedback", assignedTo: "TM-005", assignedToName: "Hana Samir", dueDate: "2026-06-26", priority: "low", relatedCourse: "Advanced Mathematics", status: "review" },
  { id: "TSK-012", title: "Set up homework auto-grading", assignedTo: "TM-007", assignedToName: "Laila Farouk", dueDate: "2026-07-01", priority: "medium", relatedCourse: "All Courses", status: "done" },
];

export const activityLogs: ActivityLog[] = [
  { id: "LOG-001", memberId: "TM-008", memberName: "Youssef Mahmoud", action: "Member Created", actionType: "member", timestamp: "2026-06-23 14:30", details: "Created team account for Ahmed Kamal (TM-006)" },
  { id: "LOG-002", memberId: "TM-002", memberName: "Sara Adel", action: "Session Uploaded", actionType: "content", course: "Advanced Mathematics", timestamp: "2026-06-23 13:15", details: "Uploaded Session 6 PDF and video materials" },
  { id: "LOG-003", memberId: "TM-004", memberName: "Dina Youssef", action: "Quiz Published", actionType: "assessment", course: "Calculus Masterclass", timestamp: "2026-06-23 11:00", details: "Published Chapter 3 quiz with 25 questions" },
  { id: "LOG-004", memberId: "TM-001", memberName: "Mr. Tarek Nabil", action: "Homework Graded", actionType: "assessment", course: "Advanced Mathematics", timestamp: "2026-06-23 10:45", details: "Graded 18 homework submissions for Homework 2" },
  { id: "LOG-005", memberId: "TM-001", memberName: "Mr. Tarek Nabil", action: "Student Contacted", actionType: "student", course: "Advanced Mathematics", timestamp: "2026-06-23 09:30", details: "Contacted 3 at-risk students via WhatsApp" },
  { id: "LOG-006", memberId: "TM-005", memberName: "Hana Samir", action: "Parent Notified", actionType: "student", course: "Advanced Mathematics", timestamp: "2026-06-22 16:00", details: "Sent progress reports to parents of 5 students" },
  { id: "LOG-007", memberId: "TM-003", memberName: "Mohamed Hassan", action: "Payment Approved", actionType: "payment", timestamp: "2026-06-22 14:20", details: "Approved withdrawal request of EGP 5,000 for Mr. Tarek Nabil" },
  { id: "LOG-008", memberId: "TM-008", memberName: "Youssef Mahmoud", action: "Application Accepted", actionType: "member", timestamp: "2026-06-22 12:00", details: "Accepted application from Rania Ibrahim for Assistant Teacher" },
  { id: "LOG-009", memberId: "TM-002", memberName: "Sara Adel", action: "Session Uploaded", actionType: "content", course: "Statistics & Probability", timestamp: "2026-06-22 10:30", details: "Uploaded Session 4 materials" },
  { id: "LOG-010", memberId: "TM-004", memberName: "Dina Youssef", action: "Questions Added", actionType: "assessment", course: "Calculus Masterclass", timestamp: "2026-06-21 15:45", details: "Added 30 questions to the question bank for Chapter 4" },
  { id: "LOG-011", memberId: "TM-006", memberName: "Ahmed Kamal", action: "Homework Graded", actionType: "assessment", course: "Statistics & Probability", timestamp: "2026-06-21 14:00", details: "Graded 12 essay submissions" },
  { id: "LOG-012", memberId: "TM-005", memberName: "Hana Samir", action: "Chat Moderated", actionType: "system", timestamp: "2026-06-21 11:30", details: "Resolved 4 reports in #questions channel" },
  { id: "LOG-013", memberId: "TM-003", memberName: "Mohamed Hassan", action: "Revenue Report Generated", actionType: "payment", timestamp: "2026-06-20 16:00", details: "Generated weekly revenue report for June W3" },
  { id: "LOG-014", memberId: "TM-001", memberName: "Mr. Tarek Nabil", action: "Student Pod Updated", actionType: "student", course: "Advanced Mathematics", timestamp: "2026-06-20 10:00", details: "Reassigned 4 students to Group A" },
];

export const invitations: Invitation[] = [
  { id: "INV-001", name: "Rania Ibrahim", email: "rania@gmail.com", whatsapp: "+20 103 444 5555", role: "Assistant Teacher", status: "accepted", sentDate: "2026-06-16", expiryDate: "2026-06-23", deliveryMethod: "both" },
  { id: "INV-002", name: "Adham Salah", email: "adham.s@gmail.com", whatsapp: "+20 108 111 2222", role: "Content Manager", status: "pending", sentDate: "2026-06-22", expiryDate: "2026-06-29", deliveryMethod: "email" },
  { id: "INV-003", name: "Salma Othman", email: "salma.o@gmail.com", whatsapp: "+20 109 222 3333", role: "Moderator", status: "pending", sentDate: "2026-06-23", expiryDate: "2026-06-30", deliveryMethod: "whatsapp" },
  { id: "INV-004", name: "Khaled Nader", email: "khaled.n@gmail.com", whatsapp: "+20 110 333 4444", role: "Video Editor", status: "expired", sentDate: "2026-06-01", expiryDate: "2026-06-08", deliveryMethod: "email" },
  { id: "INV-005", name: "Marwa Ali", email: "marwa@gmail.com", whatsapp: "+20 111 444 5555", role: "Support Agent", status: "revoked", sentDate: "2026-06-10", expiryDate: "2026-06-17", deliveryMethod: "both" },
  { id: "INV-006", name: "Omar Fathy", email: "omar.f@academy.com", whatsapp: "+20 112 555 6666", role: "Assistant Teacher", status: "pending", sentDate: "2026-06-23", expiryDate: "2026-06-30", deliveryMethod: "both" },
];

export const permissionMatrix: Record<string, Record<string, boolean>> = {
  "Upload Materials":   { Teacher: true, "Assistant Teacher": false, "Content Manager": true, Moderator: false, Finance: false, Developer: true, Admin: true },
  "Manage Sessions":    { Teacher: true, "Assistant Teacher": false, "Content Manager": true, Moderator: false, Finance: false, Developer: false, Admin: true },
  "Create Questions":   { Teacher: true, "Assistant Teacher": true, "Content Manager": true, Moderator: false, Finance: false, Developer: false, Admin: true },
  "Create Quizzes":     { Teacher: true, "Assistant Teacher": true, "Content Manager": false, Moderator: false, Finance: false, Developer: false, Admin: true },
  "Create Homework":    { Teacher: true, "Assistant Teacher": true, "Content Manager": false, Moderator: false, Finance: false, Developer: false, Admin: true },
  "Create Exams":       { Teacher: true, "Assistant Teacher": false, "Content Manager": false, Moderator: false, Finance: false, Developer: false, Admin: true },
  "Grade Essays":       { Teacher: true, "Assistant Teacher": true, "Content Manager": false, Moderator: false, Finance: false, Developer: false, Admin: true },
  "Reply to Students":  { Teacher: true, "Assistant Teacher": true, "Content Manager": false, Moderator: true, Finance: false, Developer: false, Admin: true },
  "Contact Parents":    { Teacher: true, "Assistant Teacher": true, "Content Manager": false, Moderator: false, Finance: false, Developer: false, Admin: true },
  "View Analytics":     { Teacher: true, "Assistant Teacher": false, "Content Manager": true, Moderator: false, Finance: true, Developer: true, Admin: true },
  "Manage Payments":    { Teacher: true, "Assistant Teacher": false, "Content Manager": false, Moderator: false, Finance: true, Developer: false, Admin: true },
  "Manage Team":        { Teacher: true, "Assistant Teacher": false, "Content Manager": false, Moderator: false, Finance: false, Developer: false, Admin: true },
  "Manage Settings":    { Teacher: true, "Assistant Teacher": false, "Content Manager": false, Moderator: false, Finance: false, Developer: true, Admin: true },
};

export const builtInRoles = [
  "Teacher", "Assistant Teacher", "Content Manager", "Moderator", "Finance", "Developer", "Admin",
] as const;
