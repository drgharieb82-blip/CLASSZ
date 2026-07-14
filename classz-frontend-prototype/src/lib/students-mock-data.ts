export interface MockStudent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  grade: string;
  courses: string[];
  progress: number;
  avgScore: number;
  riskLevel: "high" | "medium" | "low" | "none";
  riskReasons: string[];
  lastLogin: string;
  status: "active" | "inactive" | "new";
  assistantTeacher: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  parentRelation: string;
  walletBalance: number;
  totalPaid: number;
  pendingPayment: number;
  joinedDate: string;
  watchTime: string;
  hwCompletion: number;
  quizAvg: number;
}

export interface ParentRecord {
  id: string;
  name: string;
  studentId: string;
  studentName: string;
  relation: string;
  whatsapp: string;
  email: string;
  lastContact: string;
  alertStatus: "none" | "sent" | "urgent";
}

export interface WrongQuestionRecord {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  chapter: string;
  concept: string;
  atomicConcept: string;
  questionType: string;
  difficulty: "easy" | "medium" | "hard";
  retryCount: number;
  lastWrongDate: string;
}

export interface StudentPayment {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  purchase: string;
  walletBalance: number;
  paid: number;
  pending: number;
  coupon: string;
  refundStatus: "none" | "requested" | "approved" | "rejected";
  date: string;
}

export interface StudentCertificate {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  certificateTitle: string;
  issuedDate: string;
  status: "issued" | "revoked" | "pending";
}

export interface MemoryInsight {
  studentId: string;
  studentName: string;
  strengths: string[];
  weakConcepts: { concept: string; score: number }[];
  forgettingCurve: { concept: string; retention: number; daysSince: number }[];
  attentionPattern: string;
  recommendations: string[];
}

export const mockStudents: MockStudent[] = [
  { id: "STU-001", name: "Aya Mansour", email: "aya@student.com", grade: "Grade 12", courses: ["Advanced Mathematics", "Calculus Masterclass"], progress: 87, avgScore: 94, riskLevel: "none", riskReasons: [], lastLogin: "2h ago", status: "active", assistantTeacher: "Mr. Tarek Nabil", parentName: "Hoda Mansour", parentPhone: "+20 100 111 2222", parentEmail: "hoda@parent.com", parentRelation: "Mother", walletBalance: 120, totalPaid: 350, pendingPayment: 0, joinedDate: "2026-01-15", watchTime: "42h", hwCompletion: 95, quizAvg: 92 },
  { id: "STU-002", name: "Omar Tarek", email: "omar@student.com", grade: "Grade 12", courses: ["Advanced Mathematics"], progress: 72, avgScore: 85, riskLevel: "low", riskReasons: ["Falling grades"], lastLogin: "5h ago", status: "active", assistantTeacher: "Mr. Tarek Nabil", parentName: "Tarek Hassan", parentPhone: "+20 101 222 3333", parentEmail: "tarek.h@parent.com", parentRelation: "Father", walletBalance: 45, totalPaid: 200, pendingPayment: 20, joinedDate: "2026-02-01", watchTime: "28h", hwCompletion: 80, quizAvg: 78 },
  { id: "STU-003", name: "Lina Fares", email: "lina@student.com", grade: "Grade 12", courses: ["Calculus Masterclass"], progress: 91, avgScore: 96, riskLevel: "none", riskReasons: [], lastLogin: "1d ago", status: "active", assistantTeacher: "Dina Youssef", parentName: "Samia Fares", parentPhone: "+20 102 333 4444", parentEmail: "samia@parent.com", parentRelation: "Mother", walletBalance: 200, totalPaid: 400, pendingPayment: 0, joinedDate: "2026-01-10", watchTime: "48h", hwCompletion: 98, quizAvg: 95 },
  { id: "STU-004", name: "Karim Adel", email: "karim@student.com", grade: "Grade 12", courses: ["Advanced Mathematics"], progress: 45, avgScore: 68, riskLevel: "high", riskReasons: ["Falling grades", "Missing homework", "Low completion"], lastLogin: "3d ago", status: "active", assistantTeacher: "Mr. Tarek Nabil", parentName: "Adel Karim", parentPhone: "+20 103 444 5555", parentEmail: "adel.k@parent.com", parentRelation: "Father", walletBalance: 10, totalPaid: 150, pendingPayment: 50, joinedDate: "2026-03-01", watchTime: "12h", hwCompletion: 40, quizAvg: 55 },
  { id: "STU-005", name: "Nour Sami", email: "nour@student.com", grade: "Grade 11", courses: ["Statistics & Probability"], progress: 63, avgScore: 74, riskLevel: "medium", riskReasons: ["Low completion", "Failed quizzes"], lastLogin: "1w ago", status: "inactive", assistantTeacher: "Ahmed Kamal", parentName: "Sami Nour", parentPhone: "+20 104 555 6666", parentEmail: "sami@parent.com", parentRelation: "Father", walletBalance: 0, totalPaid: 100, pendingPayment: 45, joinedDate: "2026-04-10", watchTime: "18h", hwCompletion: 55, quizAvg: 60 },
  { id: "STU-006", name: "Hadi Wael", email: "hadi@student.com", grade: "Grade 12", courses: ["Calculus Masterclass", "Advanced Mathematics"], progress: 78, avgScore: 82, riskLevel: "none", riskReasons: [], lastLogin: "4h ago", status: "active", assistantTeacher: "Dina Youssef", parentName: "Wael Hadi", parentPhone: "+20 105 666 7777", parentEmail: "wael@parent.com", parentRelation: "Father", walletBalance: 80, totalPaid: 300, pendingPayment: 0, joinedDate: "2026-01-20", watchTime: "35h", hwCompletion: 85, quizAvg: 80 },
  { id: "STU-007", name: "Sara Mahmoud", email: "sara@student.com", grade: "Grade 12", courses: ["Advanced Mathematics"], progress: 12, avgScore: 0, riskLevel: "high", riskReasons: ["No login", "Missing homework", "Low completion"], lastLogin: "2w ago", status: "inactive", assistantTeacher: "Mr. Tarek Nabil", parentName: "Mahmoud Ali", parentPhone: "+20 106 777 8888", parentEmail: "mahmoud@parent.com", parentRelation: "Father", walletBalance: 200, totalPaid: 50, pendingPayment: 0, joinedDate: "2026-06-01", watchTime: "1h", hwCompletion: 0, quizAvg: 0 },
  { id: "STU-008", name: "Tamer Gamal", email: "tamer@student.com", grade: "Grade 11", courses: ["Statistics & Probability", "Advanced Mathematics"], progress: 85, avgScore: 88, riskLevel: "none", riskReasons: [], lastLogin: "1h ago", status: "active", assistantTeacher: "Ahmed Kamal", parentName: "Gamal Tamer", parentPhone: "+20 107 888 9999", parentEmail: "gamal@parent.com", parentRelation: "Father", walletBalance: 150, totalPaid: 280, pendingPayment: 0, joinedDate: "2026-02-15", watchTime: "38h", hwCompletion: 90, quizAvg: 86 },
  { id: "STU-009", name: "Rana Khaled", email: "rana@student.com", grade: "Grade 12", courses: ["Calculus Masterclass"], progress: 67, avgScore: 75, riskLevel: "low", riskReasons: ["Falling grades"], lastLogin: "6h ago", status: "active", assistantTeacher: "Dina Youssef", parentName: "Khaled Rana", parentPhone: "+20 108 999 0000", parentEmail: "khaled.r@parent.com", parentRelation: "Father", walletBalance: 30, totalPaid: 180, pendingPayment: 20, joinedDate: "2026-03-10", watchTime: "22h", hwCompletion: 70, quizAvg: 72 },
  { id: "STU-010", name: "Ali Shaker", email: "ali@student.com", grade: "Grade 12", courses: ["Advanced Mathematics", "Calculus Masterclass"], progress: 41, avgScore: 58, riskLevel: "high", riskReasons: ["Falling grades", "Failed quizzes", "Missing homework"], lastLogin: "4d ago", status: "active", assistantTeacher: "Mr. Tarek Nabil", parentName: "Shaker Ali", parentPhone: "+20 109 000 1111", parentEmail: "shaker@parent.com", parentRelation: "Father", walletBalance: 5, totalPaid: 120, pendingPayment: 80, joinedDate: "2026-04-01", watchTime: "10h", hwCompletion: 35, quizAvg: 48 },
  { id: "STU-011", name: "Mariam Lotfy", email: "mariam@student.com", grade: "Grade 11", courses: ["Statistics & Probability"], progress: 89, avgScore: 91, riskLevel: "none", riskReasons: [], lastLogin: "30m ago", status: "active", assistantTeacher: "Ahmed Kamal", parentName: "Lotfy Mariam", parentPhone: "+20 110 111 2222", parentEmail: "lotfy@parent.com", parentRelation: "Father", walletBalance: 250, totalPaid: 350, pendingPayment: 0, joinedDate: "2026-01-05", watchTime: "45h", hwCompletion: 92, quizAvg: 90 },
  { id: "STU-012", name: "Youssef Ahmed", email: "youssef@student.com", grade: "Grade 12", courses: ["Advanced Mathematics"], progress: 55, avgScore: 71, riskLevel: "medium", riskReasons: ["Low completion"], lastLogin: "8h ago", status: "active", assistantTeacher: "Mr. Tarek Nabil", parentName: "Ahmed Youssef Sr.", parentPhone: "+20 111 222 3333", parentEmail: "ahmed.sr@parent.com", parentRelation: "Father", walletBalance: 60, totalPaid: 200, pendingPayment: 0, joinedDate: "2026-02-20", watchTime: "20h", hwCompletion: 60, quizAvg: 65 },
];

export const parentRecords: ParentRecord[] = mockStudents.map((s) => ({
  id: `PAR-${s.id}`,
  name: s.parentName,
  studentId: s.id,
  studentName: s.name,
  relation: s.parentRelation,
  whatsapp: s.parentPhone,
  email: s.parentEmail,
  lastContact: ["2026-06-22", "2026-06-20", "2026-06-18", "2026-06-15", "2026-06-10", "2026-06-23", "Never", "2026-06-21", "2026-06-19", "2026-06-14", "2026-06-23", "2026-06-17"][mockStudents.indexOf(s)] || "—",
  alertStatus: (s.riskLevel === "high" ? "urgent" : s.riskLevel === "medium" ? "sent" : "none") as ParentRecord["alertStatus"],
}));

export const wrongQuestions: WrongQuestionRecord[] = [
  { id: "WQ-001", studentId: "STU-004", studentName: "Karim Adel", course: "Advanced Mathematics", chapter: "Chapter 3", concept: "Limits", atomicConcept: "One-sided Limits", questionType: "MCQ", difficulty: "medium", retryCount: 4, lastWrongDate: "2026-06-22" },
  { id: "WQ-002", studentId: "STU-004", studentName: "Karim Adel", course: "Advanced Mathematics", chapter: "Chapter 5", concept: "Derivatives", atomicConcept: "Chain Rule", questionType: "Essay", difficulty: "hard", retryCount: 3, lastWrongDate: "2026-06-21" },
  { id: "WQ-003", studentId: "STU-010", studentName: "Ali Shaker", course: "Advanced Mathematics", chapter: "Chapter 4", concept: "Continuity", atomicConcept: "Removable Discontinuity", questionType: "MCQ", difficulty: "hard", retryCount: 5, lastWrongDate: "2026-06-23" },
  { id: "WQ-004", studentId: "STU-005", studentName: "Nour Sami", course: "Statistics & Probability", chapter: "Chapter 2", concept: "Probability", atomicConcept: "Conditional Probability", questionType: "MCQ", difficulty: "medium", retryCount: 3, lastWrongDate: "2026-06-20" },
  { id: "WQ-005", studentId: "STU-002", studentName: "Omar Tarek", course: "Advanced Mathematics", chapter: "Chapter 6", concept: "Integration", atomicConcept: "U-Substitution", questionType: "Structured", difficulty: "hard", retryCount: 2, lastWrongDate: "2026-06-22" },
  { id: "WQ-006", studentId: "STU-010", studentName: "Ali Shaker", course: "Calculus Masterclass", chapter: "Chapter 3", concept: "Derivatives", atomicConcept: "Product Rule", questionType: "MCQ", difficulty: "easy", retryCount: 6, lastWrongDate: "2026-06-23" },
  { id: "WQ-007", studentId: "STU-009", studentName: "Rana Khaled", course: "Calculus Masterclass", chapter: "Chapter 5", concept: "Applications", atomicConcept: "Related Rates", questionType: "Essay", difficulty: "hard", retryCount: 2, lastWrongDate: "2026-06-19" },
  { id: "WQ-008", studentId: "STU-012", studentName: "Youssef Ahmed", course: "Advanced Mathematics", chapter: "Chapter 7", concept: "Sequences", atomicConcept: "Geometric Series", questionType: "MCQ", difficulty: "medium", retryCount: 3, lastWrongDate: "2026-06-21" },
];

export const studentPayments: StudentPayment[] = [
  { id: "PAY-001", studentId: "STU-001", studentName: "Aya Mansour", course: "Advanced Mathematics", purchase: "Full Course", walletBalance: 120, paid: 200, pending: 0, coupon: "", refundStatus: "none", date: "2026-06-01" },
  { id: "PAY-002", studentId: "STU-001", studentName: "Aya Mansour", course: "Calculus Masterclass", purchase: "Full Course", walletBalance: 120, paid: 150, pending: 0, coupon: "MATH100", refundStatus: "none", date: "2026-06-05" },
  { id: "PAY-003", studentId: "STU-004", studentName: "Karim Adel", course: "Advanced Mathematics", purchase: "Session Pack", walletBalance: 10, paid: 150, pending: 50, coupon: "", refundStatus: "none", date: "2026-06-10" },
  { id: "PAY-004", studentId: "STU-007", studentName: "Sara Mahmoud", course: "Advanced Mathematics", purchase: "Single Session", walletBalance: 200, paid: 50, pending: 0, coupon: "TOP10", refundStatus: "requested", date: "2026-06-15" },
  { id: "PAY-005", studentId: "STU-010", studentName: "Ali Shaker", course: "Advanced Mathematics", purchase: "Full Course", walletBalance: 5, paid: 80, pending: 80, coupon: "", refundStatus: "none", date: "2026-05-20" },
  { id: "PAY-006", studentId: "STU-003", studentName: "Lina Fares", course: "Calculus Masterclass", purchase: "Full Course", walletBalance: 200, paid: 400, pending: 0, coupon: "", refundStatus: "none", date: "2026-01-15" },
  { id: "PAY-007", studentId: "STU-008", studentName: "Tamer Gamal", course: "Statistics & Probability", purchase: "Full Course", walletBalance: 150, paid: 180, pending: 0, coupon: "RAMADAN2026", refundStatus: "none", date: "2026-03-01" },
  { id: "PAY-008", studentId: "STU-005", studentName: "Nour Sami", course: "Statistics & Probability", purchase: "Session Pack", walletBalance: 0, paid: 100, pending: 45, coupon: "", refundStatus: "none", date: "2026-04-15" },
];

export const studentCertificates: StudentCertificate[] = [
  { id: "CERT-001", studentId: "STU-001", studentName: "Aya Mansour", course: "Advanced Mathematics", certificateTitle: "Mathematics Excellence", issuedDate: "2026-06-15", status: "issued" },
  { id: "CERT-002", studentId: "STU-003", studentName: "Lina Fares", course: "Calculus Masterclass", certificateTitle: "Calculus Mastery", issuedDate: "2026-06-18", status: "issued" },
  { id: "CERT-003", studentId: "STU-008", studentName: "Tamer Gamal", course: "Statistics & Probability", certificateTitle: "Statistics Foundation", issuedDate: "2026-06-20", status: "issued" },
  { id: "CERT-004", studentId: "STU-011", studentName: "Mariam Lotfy", course: "Statistics & Probability", certificateTitle: "Statistics Honours", issuedDate: "2026-06-22", status: "pending" },
  { id: "CERT-005", studentId: "STU-006", studentName: "Hadi Wael", course: "Advanced Mathematics", certificateTitle: "Mathematics Completion", issuedDate: "2026-06-10", status: "issued" },
];

export const memoryInsights: MemoryInsight[] = [
  { studentId: "STU-004", studentName: "Karim Adel", strengths: ["Basic Algebra", "Number Theory"], weakConcepts: [{ concept: "One-sided Limits", score: 32 }, { concept: "Chain Rule", score: 41 }, { concept: "Continuity", score: 45 }], forgettingCurve: [{ concept: "Limits", retention: 35, daysSince: 14 }, { concept: "Derivatives", retention: 50, daysSince: 7 }], attentionPattern: "Drops off after 15 minutes. Best in morning sessions.", recommendations: ["Shorter practice sessions", "Visual aids for limits", "Daily 5-min review"] },
  { studentId: "STU-010", studentName: "Ali Shaker", strengths: ["Graphing", "Simple Equations"], weakConcepts: [{ concept: "Product Rule", score: 28 }, { concept: "Removable Discontinuity", score: 35 }, { concept: "Integration by Parts", score: 40 }], forgettingCurve: [{ concept: "Derivatives", retention: 25, daysSince: 21 }, { concept: "Continuity", retention: 40, daysSince: 10 }], attentionPattern: "Inconsistent login pattern. Engages best with video content.", recommendations: ["Assign video-first sessions", "Break topics into micro-lessons", "Weekly check-in calls"] },
  { studentId: "STU-005", studentName: "Nour Sami", strengths: ["Data Collection", "Basic Probability"], weakConcepts: [{ concept: "Conditional Probability", score: 42 }, { concept: "Normal Distribution", score: 48 }], forgettingCurve: [{ concept: "Probability", retention: 55, daysSince: 5 }], attentionPattern: "Active on weekends only. Prefers PDF materials.", recommendations: ["Weekend-scheduled content release", "Extra PDF supplements", "Parent notification for weekday gaps"] },
];
