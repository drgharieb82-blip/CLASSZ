export type ParentStatus = "on_track" | "needs_support" | "watch_closely" | "getting_started";
export type PaymentStatus = "paid" | "payment_due" | "renew_soon" | "pending_first_installment";
export type ParentSeverity = "critical" | "warning" | "info" | "positive";
export type ParentResultType = "quiz" | "homework" | "exam";
export type TimelineType = "watched_session" | "solved_quiz" | "missed_homework" | "teacher_note" | "payment_completed";

export interface ParentChild {
  id: string;
  name: string;
  gradeLabel: string;
  avatar: string;
  mainCourse: string;
  overallStatus: ParentStatus;
  summary: {
    averageScore: number;
    courseProgress: number;
    attendanceRate: number;
    missingHomework: number;
    upcomingExams: number;
    paymentStatus: PaymentStatus;
  };
  smartSummary: {
    doingWell: string;
    mainProblem: string;
    actionThisWeek: string;
  };
  alerts: Array<{
    id: string;
    severity: ParentSeverity;
    type: "missing_homework" | "no_login" | "score_dropped" | "upcoming_exam" | "payment_due" | "teacher_note";
    message: string;
    time: string;
  }>;
  attendance: {
    present: number;
    absent: number;
    late: number;
    rate: number;
  };
  progress: Array<{
    id: string;
    courseName: string;
    progress: number;
    sessionsCompleted: string;
    watchTime: string;
    lastActivity: string;
    weeklyTrend: number[];
  }>;
  results: Array<{
    id: string;
    type: ParentResultType;
    title: string;
    date: string;
    scoreOrStatus: string;
    note: string;
  }>;
  weaknesses: Array<{
    id: string;
    chapter: string;
    topic: string;
    action: string;
    extraPractice: string;
  }>;
  messages: Array<{
    id: string;
    sender: string;
    role: "teacher" | "assistant_teacher";
    note: string;
    time: string;
  }>;
  payments: {
    activeCourses: Array<{
      id: string;
      courseName: string;
      expiryDate: string;
      status: "active" | "renew_soon" | "trial_access";
    }>;
    walletBalance: string;
    pendingAmount: string;
    purchases: Array<{
      id: string;
      item: string;
      date: string;
      amount: string;
    }>;
    installments: Array<{
      id: string;
      label: string;
      amount: string;
      dueDate: string;
      status: "paid" | "pending";
    }>;
  };
  timeline: Array<{
    id: string;
    type: TimelineType;
    title: string;
    description: string;
    time: string;
  }>;
  teacherNotes: string[];
}

export interface LinkableChild extends ParentChild {
  linkCode: string;
  expiredCode: string;
}

export const parentPortalParent = {
  name: "Mariam Hassan",
  whatsapp: "+20 101 234 5678",
};

export const parentPortalChildren: ParentChild[] = [
  {
    id: "ahmed-hassan",
    name: "Ahmed Hassan",
    gradeLabel: "Grade 8",
    avatar: "AH",
    mainCourse: "Mathematics Grade 8",
    overallStatus: "on_track",
    summary: { averageScore: 86, courseProgress: 78, attendanceRate: 94, missingHomework: 1, upcomingExams: 2, paymentStatus: "payment_due" },
    smartSummary: {
      doingWell: "Ahmed is attending consistently and his quiz scores remain strong across Mathematics and English Communication.",
      mainProblem: "He is delaying one algebra homework set and needs faster follow-through before the next exam.",
      actionThisWeek: "Set one focused homework check-in before dinner and ask him to finish Algebra Practice Set 7 first.",
    },
    alerts: [
      { id: "aa1", severity: "warning", type: "missing_homework", message: "Algebra Practice Set 7 has not been submitted yet.", time: "2 hours ago" },
      { id: "aa2", severity: "info", type: "upcoming_exam", message: "Midterm Math Exam starts on Jun 29.", time: "Today" },
      { id: "aa3", severity: "positive", type: "teacher_note", message: "Ahmed showed stronger participation in the last science session.", time: "Yesterday" },
      { id: "aa4", severity: "critical", type: "payment_due", message: "Monthly installment for Mathematics Grade 8 is due in 4 days.", time: "Today" },
    ],
    attendance: { present: 32, absent: 1, late: 2, rate: 94 },
    progress: [
      { id: "ap1", courseName: "Mathematics Grade 8", progress: 82, sessionsCompleted: "18/22", watchTime: "11h 20m", lastActivity: "Today, 6:10 PM", weeklyTrend: [68, 72, 76, 79, 80, 82, 84] },
      { id: "ap2", courseName: "Integrated Science", progress: 71, sessionsCompleted: "14/20", watchTime: "7h 45m", lastActivity: "Yesterday, 8:30 PM", weeklyTrend: [55, 58, 61, 65, 68, 70, 71] },
      { id: "ap3", courseName: "English Communication", progress: 80, sessionsCompleted: "16/20", watchTime: "8h 05m", lastActivity: "Mon, 4:15 PM", weeklyTrend: [64, 68, 70, 73, 76, 78, 80] },
    ],
    results: [
      { id: "ar1", type: "quiz", title: "Linear Equations Quiz", date: "Jun 22", scoreOrStatus: "18/20", note: "Improved after one retry" },
      { id: "ar2", type: "homework", title: "Algebra Practice Set 7", date: "Jun 25", scoreOrStatus: "Missing", note: "Needs immediate submission" },
      { id: "ar3", type: "exam", title: "Midterm Math Exam", date: "Jun 29", scoreOrStatus: "Upcoming", note: "Revision window is open" },
      { id: "ar4", type: "quiz", title: "Vocabulary Sprint 4", date: "Jun 18", scoreOrStatus: "19/20", note: "Strong retention" },
    ],
    weaknesses: [
      { id: "aw1", chapter: "Chapter 4: Algebra Foundations", topic: "Solving multi-step equations", action: "Review one guided example with the teacher notes before homework time.", extraPractice: "Complete the extra five-question worksheet after tonight's lesson." },
      { id: "aw2", chapter: "Matter and Energy", topic: "Distinguishing physical and chemical changes", action: "Rewatch the short recap video and talk through two examples aloud.", extraPractice: "Use the extra practice flashcards shared by the assistant teacher." },
    ],
    messages: [
      { id: "am1", sender: "Ms. Salma Naguib", role: "teacher", note: "Ahmed has become more confident in class discussions. Please remind him to finish the algebra worksheet tonight.", time: "Today, 5:40 PM" },
      { id: "am2", sender: "Mr. Omar Adel", role: "assistant_teacher", note: "I shared an extra science recap with Ahmed after class. It should help with the next checkpoint.", time: "Yesterday, 7:15 PM" },
    ],
    payments: {
      activeCourses: [
        { id: "ac1", courseName: "Mathematics Grade 8", expiryDate: "Jul 15, 2026", status: "renew_soon" },
        { id: "ac2", courseName: "Integrated Science", expiryDate: "Aug 3, 2026", status: "active" },
      ],
      walletBalance: "$26",
      pendingAmount: "$22",
      purchases: [
        { id: "apu1", item: "June Math Package", date: "Jun 1", amount: "$45" },
        { id: "apu2", item: "Science Lab Workbook", date: "May 18", amount: "$18" },
      ],
      installments: [
        { id: "ai1", label: "June installment", amount: "$22", dueDate: "Jun 28", status: "pending" },
        { id: "ai2", label: "May installment", amount: "$22", dueDate: "May 28", status: "paid" },
      ],
    },
    timeline: [
      { id: "at1", type: "watched_session", title: "Watched Algebra Session 18", description: "Completed 42 minutes of live class replay.", time: "Today, 6:10 PM" },
      { id: "at2", type: "solved_quiz", title: "Solved Linear Equations Quiz", description: "Scored 18/20 after one retry.", time: "Jun 22" },
      { id: "at3", type: "missed_homework", title: "Missed Algebra Practice Set 7", description: "Homework deadline passed without submission.", time: "Jun 21" },
      { id: "at4", type: "teacher_note", title: "Teacher noted improved participation", description: "Science teacher highlighted stronger verbal reasoning.", time: "Jun 20" },
      { id: "at5", type: "payment_completed", title: "Paid June English Communication fee", description: "Invoice INV-2048 marked paid.", time: "Jun 3" },
    ],
    teacherNotes: [
      "Ahmed has become much more willing to explain his thinking out loud.",
      "Please monitor homework timing this week so algebra practice is finished before the weekend.",
    ],
  },
  {
    id: "lina-hassan",
    name: "Lina Hassan",
    gradeLabel: "Grade 5",
    avatar: "LH",
    mainCourse: "Primary Mathematics",
    overallStatus: "needs_support",
    summary: { averageScore: 74, courseProgress: 61, attendanceRate: 88, missingHomework: 2, upcomingExams: 1, paymentStatus: "paid" },
    smartSummary: {
      doingWell: "Lina stays engaged in Arabic Reading and responds well when the lesson uses visual examples.",
      mainProblem: "Her math performance dropped this week and she has skipped logging in for two days.",
      actionThisWeek: "Keep one short homework routine daily and ask her to finish one fraction visual before independent work.",
    },
    alerts: [
      { id: "la1", severity: "critical", type: "no_login", message: "Lina has not logged in for two days.", time: "Today" },
      { id: "la2", severity: "warning", type: "score_dropped", message: "Fractions Checkpoint score dropped compared with last week.", time: "Jun 21" },
      { id: "la3", severity: "warning", type: "missing_homework", message: "Two math homework tasks are still missing.", time: "Today" },
      { id: "la4", severity: "positive", type: "teacher_note", message: "Reading fluency is improving steadily.", time: "Jun 20" },
    ],
    attendance: { present: 28, absent: 3, late: 1, rate: 88 },
    progress: [
      { id: "lp1", courseName: "Primary Mathematics", progress: 54, sessionsCompleted: "12/22", watchTime: "6h 10m", lastActivity: "2 days ago", weeklyTrend: [58, 57, 60, 55, 53, 54, 54] },
      { id: "lp2", courseName: "Arabic Reading", progress: 76, sessionsCompleted: "15/20", watchTime: "9h 22m", lastActivity: "Today, 4:05 PM", weeklyTrend: [67, 70, 71, 72, 74, 75, 76] },
    ],
    results: [
      { id: "lr1", type: "quiz", title: "Fractions Checkpoint", date: "Jun 21", scoreOrStatus: "11/20", note: "Score dropped compared with last week" },
      { id: "lr2", type: "homework", title: "Fractions Practice Page", date: "Jun 24", scoreOrStatus: "Missing", note: "Still not submitted" },
      { id: "lr3", type: "homework", title: "Reading Response", date: "Jun 26", scoreOrStatus: "Submitted", note: "Completed on time" },
      { id: "lr4", type: "exam", title: "Unit 6 Math Exam", date: "Jul 1", scoreOrStatus: "Upcoming", note: "Needs revision support" },
    ],
    weaknesses: [
      { id: "lw1", chapter: "Chapter 6: Fractions", topic: "Comparing fractions with different denominators", action: "Practice with one visual model before solving written questions.", extraPractice: "Use the picture-based fraction sheet sent by the assistant teacher." },
      { id: "lw2", chapter: "Word Problems", topic: "Finding key numbers in multi-step questions", action: "Underline the known numbers and the final question together.", extraPractice: "Solve two guided examples with a parent before independent work." },
    ],
    messages: [
      { id: "lm1", sender: "Ms. Dalia Fawzy", role: "teacher", note: "Lina reads with confidence, but she needs a calm homework routine for fractions this week.", time: "Today, 1:15 PM" },
      { id: "lm2", sender: "Ms. Reem Hany", role: "assistant_teacher", note: "I prepared a short parent-friendly worksheet for the fraction visuals.", time: "Yesterday, 3:55 PM" },
    ],
    payments: {
      activeCourses: [
        { id: "lc1", courseName: "Primary Mathematics", expiryDate: "Aug 10, 2026", status: "active" },
        { id: "lc2", courseName: "Arabic Reading", expiryDate: "Aug 10, 2026", status: "active" },
      ],
      walletBalance: "$8",
      pendingAmount: "$0",
      purchases: [
        { id: "lpu1", item: "Summer Reading Bundle", date: "Jun 10", amount: "$14" },
        { id: "lpu2", item: "Math Practice Cards", date: "May 26", amount: "$10" },
      ],
      installments: [{ id: "li1", label: "June tuition", amount: "$0", dueDate: "Paid", status: "paid" }],
    },
    timeline: [
      { id: "lt1", type: "watched_session", title: "Watched Reading Comprehension Session", description: "Completed 35 minutes of reading practice.", time: "Today, 4:05 PM" },
      { id: "lt2", type: "solved_quiz", title: "Solved Reading Comprehension 5", description: "Scored 17/20.", time: "Jun 19" },
      { id: "lt3", type: "missed_homework", title: "Missed Fractions Practice Page", description: "Homework is overdue and still missing.", time: "Jun 24" },
      { id: "lt4", type: "teacher_note", title: "Teacher requested a homework routine", description: "Suggested 20-minute focused practice at home.", time: "Jun 23" },
      { id: "lt5", type: "payment_completed", title: "Paid July tuition bundle", description: "All current payments are settled.", time: "Jun 12" },
    ],
    teacherNotes: [
      "Lina responds well when she can see the math problem visually first.",
      "Her reading stamina is excellent and should be praised this week.",
    ],
  },
  {
    id: "omar-hassan",
    name: "Omar Hassan",
    gradeLabel: "Grade 10",
    avatar: "OH",
    mainCourse: "Physics Foundations",
    overallStatus: "watch_closely",
    summary: { averageScore: 79, courseProgress: 69, attendanceRate: 91, missingHomework: 1, upcomingExams: 1, paymentStatus: "renew_soon" },
    smartSummary: {
      doingWell: "Omar is keeping up with class attendance and he finishes most of his science tasks on time.",
      mainProblem: "His Chemistry score dropped and one payment renewal is approaching for Physics Foundations.",
      actionThisWeek: "Review the teacher note, book one quiet revision block for Chemistry, and renew Physics before expiry.",
    },
    alerts: [
      { id: "oa1", severity: "warning", type: "score_dropped", message: "Organic Chemistry Quiz score was lower than Omar's previous average.", time: "Yesterday" },
      { id: "oa2", severity: "warning", type: "payment_due", message: "Physics Foundations expires next week.", time: "Today" },
      { id: "oa3", severity: "info", type: "upcoming_exam", message: "Physics Unit Exam is scheduled for Jul 3.", time: "Today" },
    ],
    attendance: { present: 30, absent: 2, late: 1, rate: 91 },
    progress: [
      { id: "op1", courseName: "Physics Foundations", progress: 72, sessionsCompleted: "16/22", watchTime: "9h 45m", lastActivity: "Today, 7:40 PM", weeklyTrend: [61, 62, 64, 66, 69, 70, 72] },
      { id: "op2", courseName: "Chemistry Advanced", progress: 63, sessionsCompleted: "13/20", watchTime: "8h 20m", lastActivity: "Yesterday, 5:30 PM", weeklyTrend: [64, 66, 65, 63, 61, 62, 63] },
      { id: "op3", courseName: "Biology Lab Skills", progress: 71, sessionsCompleted: "12/17", watchTime: "5h 50m", lastActivity: "Mon, 8:00 PM", weeklyTrend: [55, 57, 60, 64, 67, 69, 71] },
    ],
    results: [
      { id: "or1", type: "quiz", title: "Organic Chemistry Quiz", date: "Jun 23", scoreOrStatus: "13/20", note: "Below usual level" },
      { id: "or2", type: "homework", title: "Newton's Laws Worksheet", date: "Jun 24", scoreOrStatus: "Submitted", note: "Submitted on time" },
      { id: "or3", type: "exam", title: "Physics Unit Exam", date: "Jul 3", scoreOrStatus: "Upcoming", note: "Exam prep pack available" },
      { id: "or4", type: "homework", title: "Mole Calculations Sheet", date: "Jun 25", scoreOrStatus: "Missing", note: "Needs follow-up tonight" },
    ],
    weaknesses: [
      { id: "ow1", chapter: "Chemical Reactions", topic: "Balancing equations under time pressure", action: "Break revision into two short sets instead of one long practice block.", extraPractice: "Use the six-question chemistry booster sent by the teacher." },
    ],
    messages: [
      { id: "om1", sender: "Mr. Karim Fares", role: "teacher", note: "Omar understands the Physics concepts, but he rushed the chemistry quiz and missed easy marks.", time: "Today, 6:25 PM" },
      { id: "om2", sender: "Ms. Huda Samir", role: "assistant_teacher", note: "I uploaded a short chemistry correction sheet for him to review before the next lesson.", time: "Yesterday, 8:15 PM" },
    ],
    payments: {
      activeCourses: [
        { id: "oc1", courseName: "Physics Foundations", expiryDate: "Jul 2, 2026", status: "renew_soon" },
        { id: "oc2", courseName: "Chemistry Advanced", expiryDate: "Aug 1, 2026", status: "active" },
      ],
      walletBalance: "$11",
      pendingAmount: "$31",
      purchases: [
        { id: "opu1", item: "Physics Revision Pack", date: "Jun 14", amount: "$21" },
        { id: "opu2", item: "Chemistry Booster Bundle", date: "May 30", amount: "$16" },
      ],
      installments: [
        { id: "oi1", label: "Physics renewal", amount: "$31", dueDate: "Jul 2", status: "pending" },
        { id: "oi2", label: "Chemistry June fee", amount: "$28", dueDate: "Jun 5", status: "paid" },
      ],
    },
    timeline: [
      { id: "ot1", type: "solved_quiz", title: "Solved Organic Chemistry Quiz", description: "Scored 13/20.", time: "Jun 23" },
      { id: "ot2", type: "watched_session", title: "Watched Physics Foundations Session", description: "Completed the full replay after class.", time: "Today, 7:40 PM" },
      { id: "ot3", type: "teacher_note", title: "Teacher flagged rushed chemistry work", description: "Revision sheet uploaded for this week.", time: "Today" },
      { id: "ot4", type: "payment_completed", title: "Paid Biology Lab Skills renewal", description: "Invoice INV-3017 marked paid.", time: "Jun 8" },
    ],
    teacherNotes: [
      "Omar needs pacing support more than content reteaching right now.",
      "Physics performance is solid and should remain stable with regular revision.",
    ],
  },
];

export const linkableParentChildren: LinkableChild[] = [
  {
    id: "youssef-hassan",
    name: "Youssef Hassan",
    gradeLabel: "Grade 3",
    avatar: "YH",
    mainCourse: "Foundations Math",
    linkCode: "CLASSZ-LINK-2040",
    expiredCode: "EXPIRE-2040",
    overallStatus: "getting_started",
    summary: { averageScore: 81, courseProgress: 24, attendanceRate: 91, missingHomework: 0, upcomingExams: 1, paymentStatus: "pending_first_installment" },
    smartSummary: {
      doingWell: "Youssef is cheerful in class and already responds well to visual examples.",
      mainProblem: "He is still building a routine and his first full installment is coming soon.",
      actionThisWeek: "Keep practice playful and short, then link the account to track his first month closely.",
    },
    alerts: [
      { id: "ya1", severity: "info", type: "teacher_note", message: "Youssef is settling in well during live sessions.", time: "Today" },
      { id: "ya2", severity: "warning", type: "payment_due", message: "First installment becomes due next week.", time: "Today" },
    ],
    attendance: { present: 10, absent: 1, late: 0, rate: 91 },
    progress: [
      { id: "yp1", courseName: "Foundations Math", progress: 28, sessionsCompleted: "4/14", watchTime: "2h 40m", lastActivity: "Today, 3:20 PM", weeklyTrend: [8, 12, 16, 20, 21, 24, 28] },
      { id: "yp2", courseName: "Young Readers", progress: 20, sessionsCompleted: "3/15", watchTime: "1h 55m", lastActivity: "Yesterday, 6:00 PM", weeklyTrend: [5, 7, 11, 13, 15, 18, 20] },
    ],
    results: [
      { id: "yr1", type: "quiz", title: "Counting and Patterns", date: "Jun 23", scoreOrStatus: "16/20", note: "Good start" },
      { id: "yr2", type: "homework", title: "Pattern Coloring Sheet", date: "Jun 26", scoreOrStatus: "Submitted", note: "Completed successfully" },
    ],
    weaknesses: [
      { id: "yw1", chapter: "Starter Numbers", topic: "Skip counting by twos", action: "Practice out loud for three minutes after class.", extraPractice: "Use the number line card shared in the welcome packet." },
    ],
    messages: [
      { id: "ym1", sender: "Ms. Nada Sami", role: "teacher", note: "Youssef is cheerful in class and follows the visual examples well.", time: "Today, 2:10 PM" },
    ],
    payments: {
      activeCourses: [{ id: "yc1", courseName: "Foundations Math", expiryDate: "Jul 30, 2026", status: "trial_access" }],
      walletBalance: "$5",
      pendingAmount: "$15",
      purchases: [{ id: "ypu1", item: "Enrollment Starter Pack", date: "Jun 18", amount: "$12" }],
      installments: [{ id: "yi1", label: "First installment", amount: "$15", dueDate: "Jul 1", status: "pending" }],
    },
    timeline: [
      { id: "yt1", type: "watched_session", title: "Watched Welcome Session", description: "Completed the new student welcome class.", time: "Jun 23" },
      { id: "yt2", type: "solved_quiz", title: "Solved Counting and Patterns", description: "Scored 16/20.", time: "Jun 23" },
    ],
    teacherNotes: [
      "Youssef benefits from short, playful practice blocks at home.",
      "Please keep the learning routine brief and consistent during the first month.",
    ],
  },
];
