// Assistant Teacher mock data

export interface AssignedStudent {
  id: string; name: string; pod: string; grade: string; riskLevel: "low" | "medium" | "high";
  lastActive: string; completionRate: number; pendingHW: number;
}

export interface GradingItem {
  id: string; student: string; type: "essay" | "homework" | "quiz" | "file";
  course: string; assessment: string; submittedAt: string;
  priority: "low" | "medium" | "high"; status: "pending" | "graded" | "returned";
}

export interface ATMessage {
  id: string; from: string; role: "student" | "parent" | "teacher";
  preview: string; unread: boolean; time: string;
}

export interface FollowUpItem {
  id: string; student: string; reason: string;
  category: "weak" | "missing-hw" | "absent"; severity: "low" | "medium" | "high";
  lastContact: string;
}

export interface ATTask {
  id: string; title: string; priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "review" | "done";
  dueDate: string; assignedBy: string;
}

export interface ATNote {
  id: string; student: string; content: string; date: string; private: boolean;
}

export interface ScheduleSlot {
  id: string; time: string; title: string; type: "grading" | "session" | "meeting" | "follow-up";
  students: number; duration: string;
}

export const atStats = {
  assignedStudents: 86, pendingGrading: 23, unreadMessages: 7,
  tasksDue: 5, atRiskStudents: 8,
};

export const atPerformance = {
  gradedSubmissions: 342, avgResponseTime: "2.4h",
  studentSatisfaction: 4.6, completedTasks: 89,
  gradedThisWeek: 47, responseRate: 96,
};

export const assignedStudents: AssignedStudent[] = [
  { id: "AS-001", name: "Aya Mansour", pod: "Pod Alpha", grade: "Grade 11", riskLevel: "low", lastActive: "2 hours ago", completionRate: 92, pendingHW: 0 },
  { id: "AS-002", name: "Omar Tarek", pod: "Pod Alpha", grade: "Grade 11", riskLevel: "medium", lastActive: "1 day ago", completionRate: 68, pendingHW: 2 },
  { id: "AS-003", name: "Lina Fares", pod: "Pod Beta", grade: "Grade 10", riskLevel: "low", lastActive: "4 hours ago", completionRate: 88, pendingHW: 0 },
  { id: "AS-004", name: "Karim Adel", pod: "Pod Beta", grade: "Grade 10", riskLevel: "high", lastActive: "3 days ago", completionRate: 42, pendingHW: 4 },
  { id: "AS-005", name: "Tamer Gamal", pod: "Pod Alpha", grade: "Grade 11", riskLevel: "low", lastActive: "6 hours ago", completionRate: 85, pendingHW: 1 },
  { id: "AS-006", name: "Sara Mahmoud", pod: "Pod Gamma", grade: "Grade 12", riskLevel: "medium", lastActive: "2 days ago", completionRate: 61, pendingHW: 3 },
  { id: "AS-007", name: "Hadi Wael", pod: "Pod Gamma", grade: "Grade 12", riskLevel: "low", lastActive: "1 hour ago", completionRate: 95, pendingHW: 0 },
  { id: "AS-008", name: "Mariam Lotfy", pod: "Pod Beta", grade: "Grade 10", riskLevel: "high", lastActive: "5 days ago", completionRate: 35, pendingHW: 5 },
];

export const pods = [
  { name: "Pod Alpha", students: 28, avgCompletion: 82, atRisk: 2 },
  { name: "Pod Beta", students: 32, avgCompletion: 71, atRisk: 4 },
  { name: "Pod Gamma", students: 26, avgCompletion: 78, atRisk: 2 },
];

export const gradingQueue: GradingItem[] = [
  { id: "GQ-001", student: "Aya Mansour", type: "essay", course: "Advanced Mathematics", assessment: "Calculus Essay #3", submittedAt: "2026-06-24 10:30", priority: "high", status: "pending" },
  { id: "GQ-002", student: "Omar Tarek", type: "homework", course: "Advanced Mathematics", assessment: "Problem Set 12", submittedAt: "2026-06-24 09:15", priority: "medium", status: "pending" },
  { id: "GQ-003", student: "Lina Fares", type: "file", course: "Statistics", assessment: "Lab Report 5", submittedAt: "2026-06-23 16:45", priority: "medium", status: "pending" },
  { id: "GQ-004", student: "Karim Adel", type: "quiz", course: "Advanced Mathematics", assessment: "Quiz 8 Manual Review", submittedAt: "2026-06-23 14:20", priority: "low", status: "graded" },
  { id: "GQ-005", student: "Tamer Gamal", type: "essay", course: "Calculus", assessment: "Integration Essay", submittedAt: "2026-06-23 11:00", priority: "high", status: "pending" },
  { id: "GQ-006", student: "Sara Mahmoud", type: "homework", course: "Statistics", assessment: "Problem Set 11", submittedAt: "2026-06-22 15:30", priority: "medium", status: "returned" },
  { id: "GQ-007", student: "Hadi Wael", type: "essay", course: "Advanced Mathematics", assessment: "Proof Writing #2", submittedAt: "2026-06-22 12:00", priority: "low", status: "pending" },
];

export const atMessages: ATMessage[] = [
  { id: "MSG-001", from: "Aya Mansour", role: "student", preview: "Can I submit the essay tomorrow?", unread: true, time: "14:30" },
  { id: "MSG-002", from: "Fatma Hassan", role: "parent", preview: "Is Karim catching up with the class?", unread: true, time: "13:15" },
  { id: "MSG-003", from: "Dr. Ahmed Kamal", role: "teacher", preview: "Please prioritize Pod Beta grading", unread: true, time: "12:00" },
  { id: "MSG-004", from: "Omar Tarek", role: "student", preview: "Thank you for the feedback!", unread: false, time: "11:30" },
  { id: "MSG-005", from: "Lina Fares", role: "student", preview: "I need help with the lab report format", unread: true, time: "10:45" },
  { id: "MSG-006", from: "Mohamed Sami", role: "parent", preview: "When is the next parent meeting?", unread: false, time: "09:00" },
];

export const followUpItems: FollowUpItem[] = [
  { id: "FU-001", student: "Karim Adel", reason: "Completion rate below 50%, missing 4 homework", category: "weak", severity: "high", lastContact: "2026-06-20" },
  { id: "FU-002", student: "Mariam Lotfy", reason: "No login for 5 days, 5 pending assignments", category: "absent", severity: "high", lastContact: "2026-06-19" },
  { id: "FU-003", student: "Sara Mahmoud", reason: "Missing 3 homework assignments", category: "missing-hw", severity: "medium", lastContact: "2026-06-22" },
  { id: "FU-004", student: "Omar Tarek", reason: "Quiz scores declining, needs support", category: "weak", severity: "medium", lastContact: "2026-06-23" },
  { id: "FU-005", student: "Ali Shaker", reason: "Absent 3 consecutive sessions", category: "absent", severity: "medium", lastContact: "2026-06-21" },
];

export const atTasks: ATTask[] = [
  { id: "TSK-001", title: "Grade Pod Alpha essays", priority: "high", status: "in-progress", dueDate: "2026-06-24", assignedBy: "Dr. Ahmed Kamal" },
  { id: "TSK-002", title: "Contact parents of at-risk students", priority: "high", status: "todo", dueDate: "2026-06-25", assignedBy: "Dr. Ahmed Kamal" },
  { id: "TSK-003", title: "Prepare weekly progress report", priority: "medium", status: "todo", dueDate: "2026-06-26", assignedBy: "Dr. Ahmed Kamal" },
  { id: "TSK-004", title: "Review Pod Beta homework submissions", priority: "medium", status: "in-progress", dueDate: "2026-06-24", assignedBy: "Dr. Ahmed Kamal" },
  { id: "TSK-005", title: "Schedule catch-up session for Karim", priority: "high", status: "done", dueDate: "2026-06-23", assignedBy: "Dr. Ahmed Kamal" },
  { id: "TSK-006", title: "Update student notes for Pod Gamma", priority: "low", status: "review", dueDate: "2026-06-27", assignedBy: "Dr. Ahmed Kamal" },
  { id: "TSK-007", title: "Prepare materials for revision session", priority: "medium", status: "todo", dueDate: "2026-06-28", assignedBy: "Dr. Ahmed Kamal" },
];

export const atNotes: ATNote[] = [
  { id: "NT-001", student: "Karim Adel", content: "Struggling with integration concepts. Needs extra practice on u-substitution. Scheduled 1-on-1 for Thursday.", date: "2026-06-23", private: true },
  { id: "NT-002", student: "Mariam Lotfy", content: "Parent contacted — family issues affecting attendance. Will resume next week.", date: "2026-06-22", private: true },
  { id: "NT-003", student: "Aya Mansour", content: "Excellent progress on calculus essays. Consider recommending for advanced track.", date: "2026-06-21", private: false },
  { id: "NT-004", student: "Omar Tarek", content: "Improving steadily. Responds well to visual examples. Use more diagrams.", date: "2026-06-20", private: false },
  { id: "NT-005", student: "Sara Mahmoud", content: "Homework submission inconsistent. Prefers working on weekends. Adjust deadlines.", date: "2026-06-19", private: true },
];

export const schedule: ScheduleSlot[] = [
  { id: "SCH-001", time: "08:00", title: "Grade morning submissions", type: "grading", students: 0, duration: "1.5h" },
  { id: "SCH-002", time: "09:30", title: "Pod Alpha study session", type: "session", students: 28, duration: "1h" },
  { id: "SCH-003", time: "11:00", title: "1-on-1 with Karim Adel", type: "follow-up", students: 1, duration: "30m" },
  { id: "SCH-004", time: "11:30", title: "Pod Beta homework review", type: "grading", students: 0, duration: "1h" },
  { id: "SCH-005", time: "13:00", title: "Team meeting with Dr. Ahmed", type: "meeting", students: 0, duration: "30m" },
  { id: "SCH-006", time: "14:00", title: "Pod Gamma revision session", type: "session", students: 26, duration: "1h" },
  { id: "SCH-007", time: "15:30", title: "Follow-up calls to parents", type: "follow-up", students: 3, duration: "45m" },
  { id: "SCH-008", time: "16:30", title: "Grade remaining essays", type: "grading", students: 0, duration: "1h" },
];
