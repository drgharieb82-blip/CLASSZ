export interface GradingItem {
  id: string;
  studentName: string;
  studentId: string;
  course: string;
  assessment: string;
  type: "essay" | "homework" | "file_upload" | "manual_review";
  submittedAt: string;
  assignedTo: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "graded" | "returned";
  score?: number;
  maxScore: number;
}

export interface SubmissionRecord {
  id: string;
  studentName: string;
  studentId: string;
  course: string;
  assessment: string;
  type: "quiz" | "exam" | "homework" | "essay" | "practice";
  submittedAt: string;
  score: number;
  maxScore: number;
  status: "graded" | "pending" | "returned";
  attempts: number;
  grader: string;
}

export interface GradebookEntry {
  studentId: string;
  studentName: string;
  quizzes: number[];
  homework: number[];
  exams: number[];
  practice: number;
  average: number;
  rank: number;
  completion: number;
}

export interface IntegrityFlag {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  assessment: string;
  flagType: "multi_device" | "tab_switch" | "time_anomaly" | "ip_change" | "copy_paste";
  severity: "high" | "medium" | "low";
  details: string;
  timestamp: string;
  status: "pending" | "reviewed" | "cleared" | "escalated";
}

export const gradingQueue: GradingItem[] = [
  { id: "GRD-001", studentName: "Aya Mansour", studentId: "STU-001", course: "Advanced Mathematics", assessment: "Essay: Proof of IVT", type: "essay", submittedAt: "2026-06-23 14:30", assignedTo: "Mr. Tarek Nabil", priority: "high", status: "pending", maxScore: 20 },
  { id: "GRD-002", studentName: "Omar Tarek", studentId: "STU-002", course: "Advanced Mathematics", assessment: "Essay: L'Hôpital's Rule", type: "essay", submittedAt: "2026-06-23 10:15", assignedTo: "Mr. Tarek Nabil", priority: "high", status: "pending", maxScore: 20 },
  { id: "GRD-003", studentName: "Karim Adel", studentId: "STU-004", course: "Advanced Mathematics", assessment: "Homework 3: Derivatives", type: "homework", submittedAt: "2026-06-22 22:00", assignedTo: "Mr. Tarek Nabil", priority: "medium", status: "pending", maxScore: 30 },
  { id: "GRD-004", studentName: "Tamer Gamal", studentId: "STU-008", course: "Statistics & Probability", assessment: "Homework 2: Probability", type: "homework", submittedAt: "2026-06-23 08:45", assignedTo: "Ahmed Kamal", priority: "medium", status: "in_progress", score: 22, maxScore: 30 },
  { id: "GRD-005", studentName: "Hadi Wael", studentId: "STU-006", course: "Advanced Mathematics", assessment: "Lab Report: Graphing", type: "file_upload", submittedAt: "2026-06-22 16:30", assignedTo: "Dina Youssef", priority: "low", status: "pending", maxScore: 15 },
  { id: "GRD-006", studentName: "Lina Fares", studentId: "STU-003", course: "Calculus Masterclass", assessment: "Essay: Integration Proof", type: "essay", submittedAt: "2026-06-23 11:00", assignedTo: "Dina Youssef", priority: "high", status: "pending", maxScore: 25 },
  { id: "GRD-007", studentName: "Nour Sami", studentId: "STU-005", course: "Statistics & Probability", assessment: "Homework 3: Distributions", type: "homework", submittedAt: "2026-06-22 20:15", assignedTo: "Ahmed Kamal", priority: "medium", status: "pending", maxScore: 30 },
  { id: "GRD-008", studentName: "Ali Shaker", studentId: "STU-010", course: "Advanced Mathematics", assessment: "Resubmission: HW2", type: "manual_review", submittedAt: "2026-06-23 09:00", assignedTo: "Mr. Tarek Nabil", priority: "high", status: "pending", maxScore: 30 },
  { id: "GRD-009", studentName: "Rana Khaled", studentId: "STU-009", course: "Calculus Masterclass", assessment: "Project: Related Rates", type: "file_upload", submittedAt: "2026-06-21 15:45", assignedTo: "Dina Youssef", priority: "low", status: "graded", score: 12, maxScore: 15 },
  { id: "GRD-010", studentName: "Mariam Lotfy", studentId: "STU-011", course: "Statistics & Probability", assessment: "Essay: Normal Distribution", type: "essay", submittedAt: "2026-06-23 13:20", assignedTo: "Ahmed Kamal", priority: "medium", status: "pending", maxScore: 20 },
];

export const submissionRecords: SubmissionRecord[] = [
  { id: "SUB-001", studentName: "Aya Mansour", studentId: "STU-001", course: "Advanced Mathematics", assessment: "Quiz 5: Limits", type: "quiz", submittedAt: "2026-06-22", score: 18, maxScore: 20, status: "graded", attempts: 1, grader: "Auto" },
  { id: "SUB-002", studentName: "Aya Mansour", studentId: "STU-001", course: "Advanced Mathematics", assessment: "Exam: Midterm", type: "exam", submittedAt: "2026-06-15", score: 88, maxScore: 100, status: "graded", attempts: 1, grader: "Dr. Layla Hassan" },
  { id: "SUB-003", studentName: "Omar Tarek", studentId: "STU-002", course: "Advanced Mathematics", assessment: "Quiz 5: Limits", type: "quiz", submittedAt: "2026-06-22", score: 15, maxScore: 20, status: "graded", attempts: 2, grader: "Auto" },
  { id: "SUB-004", studentName: "Karim Adel", studentId: "STU-004", course: "Advanced Mathematics", assessment: "Quiz 4: Continuity", type: "quiz", submittedAt: "2026-06-20", score: 8, maxScore: 20, status: "graded", attempts: 3, grader: "Auto" },
  { id: "SUB-005", studentName: "Lina Fares", studentId: "STU-003", course: "Calculus Masterclass", assessment: "Exam: Final", type: "exam", submittedAt: "2026-06-18", score: 95, maxScore: 100, status: "graded", attempts: 1, grader: "Dr. Layla Hassan" },
  { id: "SUB-006", studentName: "Tamer Gamal", studentId: "STU-008", course: "Statistics & Probability", assessment: "Homework 1: Data", type: "homework", submittedAt: "2026-06-19", score: 27, maxScore: 30, status: "graded", attempts: 1, grader: "Ahmed Kamal" },
  { id: "SUB-007", studentName: "Ali Shaker", studentId: "STU-010", course: "Advanced Mathematics", assessment: "Quiz 3: Derivatives", type: "quiz", submittedAt: "2026-06-18", score: 6, maxScore: 20, status: "graded", attempts: 3, grader: "Auto" },
  { id: "SUB-008", studentName: "Mariam Lotfy", studentId: "STU-011", course: "Statistics & Probability", assessment: "Quiz 4: Probability", type: "quiz", submittedAt: "2026-06-21", score: 19, maxScore: 20, status: "graded", attempts: 1, grader: "Auto" },
  { id: "SUB-009", studentName: "Hadi Wael", studentId: "STU-006", course: "Advanced Mathematics", assessment: "Practice: Ch.4", type: "practice", submittedAt: "2026-06-22", score: 14, maxScore: 15, status: "graded", attempts: 1, grader: "Auto" },
  { id: "SUB-010", studentName: "Nour Sami", studentId: "STU-005", course: "Statistics & Probability", assessment: "Quiz 2: Probability", type: "quiz", submittedAt: "2026-06-17", score: 10, maxScore: 20, status: "graded", attempts: 2, grader: "Auto" },
  { id: "SUB-011", studentName: "Youssef Ahmed", studentId: "STU-012", course: "Advanced Mathematics", assessment: "Homework 2: Limits", type: "homework", submittedAt: "2026-06-20", score: 20, maxScore: 30, status: "graded", attempts: 1, grader: "Mr. Tarek Nabil" },
  { id: "SUB-012", studentName: "Rana Khaled", studentId: "STU-009", course: "Calculus Masterclass", assessment: "Quiz 3: Chain Rule", type: "quiz", submittedAt: "2026-06-19", score: 13, maxScore: 20, status: "graded", attempts: 2, grader: "Auto" },
];

export const gradebookData: GradebookEntry[] = [
  { studentId: "STU-001", studentName: "Aya Mansour", quizzes: [18, 19, 17, 20, 18], homework: [28, 30, 29], exams: [88], practice: 95, average: 94, rank: 1, completion: 98 },
  { studentId: "STU-003", studentName: "Lina Fares", quizzes: [19, 20, 18, 19], homework: [30, 29], exams: [95], practice: 92, average: 96, rank: 2, completion: 95 },
  { studentId: "STU-011", studentName: "Mariam Lotfy", quizzes: [17, 19, 18, 19], homework: [28, 27], exams: [90], practice: 88, average: 91, rank: 3, completion: 92 },
  { studentId: "STU-008", studentName: "Tamer Gamal", quizzes: [16, 18, 17, 18], homework: [27, 26], exams: [85], practice: 84, average: 88, rank: 4, completion: 90 },
  { studentId: "STU-002", studentName: "Omar Tarek", quizzes: [15, 16, 14, 17, 15], homework: [24, 25, 23], exams: [80], practice: 78, average: 85, rank: 5, completion: 80 },
  { studentId: "STU-006", studentName: "Hadi Wael", quizzes: [14, 16, 15, 17], homework: [25, 24], exams: [78], practice: 80, average: 82, rank: 6, completion: 85 },
  { studentId: "STU-009", studentName: "Rana Khaled", quizzes: [13, 14, 12, 15], homework: [22, 21], exams: [72], practice: 70, average: 75, rank: 7, completion: 70 },
  { studentId: "STU-012", studentName: "Youssef Ahmed", quizzes: [12, 14, 13, 15], homework: [20, 22], exams: [68], practice: 65, average: 71, rank: 8, completion: 60 },
  { studentId: "STU-005", studentName: "Nour Sami", quizzes: [10, 12, 11, 10], homework: [18, 20], exams: [65], practice: 58, average: 74, rank: 9, completion: 55 },
  { studentId: "STU-004", studentName: "Karim Adel", quizzes: [8, 10, 9, 11], homework: [15, 12], exams: [55], practice: 45, average: 68, rank: 10, completion: 40 },
  { studentId: "STU-010", studentName: "Ali Shaker", quizzes: [6, 8, 7, 9], homework: [12, 10], exams: [48], practice: 40, average: 58, rank: 11, completion: 35 },
  { studentId: "STU-007", studentName: "Sara Mahmoud", quizzes: [], homework: [], exams: [], practice: 0, average: 0, rank: 12, completion: 0 },
];

export const integrityFlags: IntegrityFlag[] = [
  { id: "FLG-001", studentId: "STU-010", studentName: "Ali Shaker", course: "Advanced Mathematics", assessment: "Quiz 3: Derivatives", flagType: "tab_switch", severity: "high", details: "Switched tabs 8 times during 20-min quiz. Average switch duration: 45 seconds.", timestamp: "2026-06-18 10:15", status: "pending" },
  { id: "FLG-002", studentId: "STU-004", studentName: "Karim Adel", course: "Advanced Mathematics", assessment: "Quiz 4: Continuity", flagType: "time_anomaly", severity: "medium", details: "Completed 20 questions in 4 minutes. Average expected time: 15 minutes.", timestamp: "2026-06-20 09:30", status: "pending" },
  { id: "FLG-003", studentId: "STU-010", studentName: "Ali Shaker", course: "Calculus Masterclass", assessment: "Homework 2", flagType: "multi_device", severity: "medium", details: "Submission started on mobile, completed on desktop with different IP addresses.", timestamp: "2026-06-19 22:00", status: "reviewed" },
  { id: "FLG-004", studentId: "STU-005", studentName: "Nour Sami", course: "Statistics & Probability", assessment: "Quiz 2: Probability", flagType: "copy_paste", severity: "high", details: "Large text paste detected in 3 answer fields. Content matches external source.", timestamp: "2026-06-17 14:20", status: "escalated" },
  { id: "FLG-005", studentId: "STU-004", studentName: "Karim Adel", course: "Advanced Mathematics", assessment: "Exam: Midterm", flagType: "ip_change", severity: "low", details: "IP address changed mid-exam. Could be network switch.", timestamp: "2026-06-15 11:45", status: "cleared" },
  { id: "FLG-006", studentId: "STU-007", studentName: "Sara Mahmoud", course: "Advanced Mathematics", assessment: "Quiz 1: Basics", flagType: "tab_switch", severity: "medium", details: "3 tab switches detected. Short duration switches.", timestamp: "2026-06-08 15:00", status: "pending" },
];
