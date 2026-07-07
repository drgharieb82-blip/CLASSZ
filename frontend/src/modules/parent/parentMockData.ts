export type AlertSeverity = "critical" | "warning" | "info" | "positive";

export type ParentChild = {
  id: string;
  name: string;
  gradeLabel: string;
  avatar: string;
  mainCourse: string;
  overallStatus: string;
  parentSummary: {
    doingWell: string;
    mainProblem: string;
    actionThisWeek: string;
  };
  summary: {
    courseProgress: number;
    averageScore: number;
    attendanceRate: number;
    missingHomework: number;
    upcomingExams: number;
    paymentStatus: string;
  };
  alerts: Array<{
    id: string;
    severity: AlertSeverity;
    type: string;
    message: string;
    time: string;
  }>;
  progress: {
    courses: Array<{
      id: string;
      name: string;
      progress: number;
      watchTime: string;
      lastActivity: string;
    }>;
  };
  recentResults: Array<{
    id: string;
    category: string;
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
    practice: string;
  }>;
  messages: Array<{
    id: string;
    sender: string;
    role: string;
    note: string;
    time: string;
  }>;
  payments: {
    activeCourses: Array<{
      id: string;
      courseName: string;
      expiryDate: string;
      status: string;
    }>;
    pendingAmount: string;
    walletBalance: string;
    purchases: Array<{
      id: string;
      item: string;
      date: string;
      amount: string;
    }>;
  };
  attendance: {
    present: number;
    absent: number;
    late: number;
    rate: number;
  };
  timeline: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    time: string;
  }>;
  teacherNotes: string[];
};

export type ParentProfile = {
  name: string;
  whatsapp: string;
  children: ParentChild[];
};

export type LinkableChild = ParentChild & {
  linkCode: string;
  expiredCode: string;
};

export const parentProfile: ParentProfile = {
  name: "Mariam Hassan",
  whatsapp: "+20 101 234 5678",
  children: [
    {
      id: "ahmed-hassan",
      name: "Ahmed Hassan",
      gradeLabel: "Grade 8",
      avatar: "AH",
      mainCourse: "Mathematics Grade 8",
      overallStatus: "On Track",
      parentSummary: {
        doingWell: "Ahmed is attending consistently and his quiz scores remain strong across Mathematics and English Communication.",
        mainProblem: "He is delaying one algebra homework set and needs faster follow-through before the next exam.",
        actionThisWeek: "Set one focused homework check-in before dinner and ask him to finish Algebra Practice Set 7 first.",
      },
      summary: {
        courseProgress: 78,
        averageScore: 86,
        attendanceRate: 94,
        missingHomework: 1,
        upcomingExams: 2,
        paymentStatus: "Payment due",
      },
      alerts: [
        { id: "a1", severity: "warning", type: "Missing homework", message: "Algebra Practice Set 7 has not been submitted yet.", time: "2 hours ago" },
        { id: "a2", severity: "info", type: "Upcoming exam", message: "Midterm Math Exam starts on Jun 29.", time: "Today" },
        { id: "a3", severity: "positive", type: "Teacher note", message: "Ahmed showed stronger participation in the last science session.", time: "Yesterday" },
        { id: "a4", severity: "critical", type: "Payment due", message: "Monthly installment for Mathematics Grade 8 is due in 4 days.", time: "Today" },
      ],
      progress: {
        courses: [
          { id: "math-8", name: "Mathematics Grade 8", progress: 82, watchTime: "11h 20m", lastActivity: "Today, 6:10 PM" },
          { id: "science-8", name: "Integrated Science", progress: 71, watchTime: "7h 45m", lastActivity: "Yesterday, 8:30 PM" },
          { id: "english-8", name: "English Communication", progress: 80, watchTime: "8h 05m", lastActivity: "Mon, 4:15 PM" },
        ],
      },
      recentResults: [
        { id: "r1", category: "Quiz", title: "Linear Equations Quiz", date: "Jun 22", scoreOrStatus: "18/20", note: "Improved after one retry" },
        { id: "r2", category: "Homework", title: "Algebra Practice Set 7", date: "Jun 25", scoreOrStatus: "Missing", note: "Needs immediate submission" },
        { id: "r3", category: "Exam", title: "Midterm Math Exam", date: "Jun 29", scoreOrStatus: "Upcoming", note: "Revision window is open" },
        { id: "r4", category: "Quiz", title: "Vocabulary Sprint 4", date: "Jun 18", scoreOrStatus: "19/20", note: "Strong retention" },
      ],
      weaknesses: [
        {
          id: "w1",
          chapter: "Chapter 4: Algebra Foundations",
          topic: "Solving multi-step equations",
          action: "Review one guided example with the teacher notes before homework time.",
          practice: "Complete the extra five-question worksheet after tonight's lesson.",
        },
        {
          id: "w2",
          chapter: "Matter and Energy",
          topic: "Distinguishing physical and chemical changes",
          action: "Rewatch the short recap video and talk through two examples aloud.",
          practice: "Use the extra practice flashcards shared by the assistant teacher.",
        },
      ],
      messages: [
        { id: "m1", sender: "Ms. Salma Naguib", role: "Teacher", note: "Ahmed has become more confident in class discussions. Please remind him to finish the algebra worksheet tonight.", time: "Today, 5:40 PM" },
        { id: "m2", sender: "Mr. Omar Adel", role: "Assistant Teacher", note: "I shared an extra science recap with Ahmed after class. It should help with the next checkpoint.", time: "Yesterday, 7:15 PM" },
      ],
      payments: {
        activeCourses: [
          { id: "pc1", courseName: "Mathematics Grade 8", expiryDate: "Jul 15, 2026", status: "Renew soon" },
          { id: "pc2", courseName: "Integrated Science", expiryDate: "Aug 3, 2026", status: "Active" },
        ],
        pendingAmount: "$22",
        walletBalance: "$26",
        purchases: [
          { id: "pp1", item: "June Math Package", date: "Jun 1", amount: "$45" },
          { id: "pp2", item: "Science Lab Workbook", date: "May 18", amount: "$18" },
        ],
      },
      attendance: {
        present: 32,
        absent: 1,
        late: 2,
        rate: 94,
      },
      timeline: [
        { id: "t1", type: "Watched session", title: "Watched Algebra Session 18", description: "Completed 42 minutes of live class replay.", time: "Today, 6:10 PM" },
        { id: "t2", type: "Solved quiz", title: "Solved Linear Equations Quiz", description: "Scored 18/20 after one retry.", time: "Jun 22" },
        { id: "t3", type: "Missed homework", title: "Missed Algebra Practice Set 7", description: "Homework deadline passed without submission.", time: "Jun 21" },
        { id: "t4", type: "Teacher note", title: "Teacher noted improved participation", description: "Science teacher highlighted stronger verbal reasoning.", time: "Jun 20" },
        { id: "t5", type: "Payment completed", title: "Paid June English Communication fee", description: "Invoice INV-2048 marked paid.", time: "Jun 3" },
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
      overallStatus: "Needs Support",
      parentSummary: {
        doingWell: "Lina stays engaged in Arabic Reading and responds well when the lesson uses visual examples.",
        mainProblem: "Her math performance dropped this week and she has skipped logging in for two days.",
        actionThisWeek: "Keep one short homework routine daily and ask her to finish one fraction visual before independent work.",
      },
      summary: {
        courseProgress: 61,
        averageScore: 74,
        attendanceRate: 88,
        missingHomework: 2,
        upcomingExams: 1,
        paymentStatus: "Paid",
      },
      alerts: [
        { id: "la1", severity: "critical", type: "No login", message: "Lina has not logged in for two days.", time: "Today" },
        { id: "la2", severity: "warning", type: "Score dropped", message: "Fractions Checkpoint score dropped compared with last week.", time: "Jun 21" },
        { id: "la3", severity: "warning", type: "Missing homework", message: "Two math homework tasks are still missing.", time: "Today" },
        { id: "la4", severity: "positive", type: "Teacher note", message: "Reading fluency is improving steadily.", time: "Jun 20" },
      ],
      progress: {
        courses: [
          { id: "math-5", name: "Primary Mathematics", progress: 54, watchTime: "6h 10m", lastActivity: "2 days ago" },
          { id: "arabic-5", name: "Arabic Reading", progress: 76, watchTime: "9h 22m", lastActivity: "Today, 4:05 PM" },
        ],
      },
      recentResults: [
        { id: "lr1", category: "Quiz", title: "Fractions Checkpoint", date: "Jun 21", scoreOrStatus: "11/20", note: "Score dropped compared with last week" },
        { id: "lr2", category: "Homework", title: "Fractions Practice Page", date: "Jun 24", scoreOrStatus: "Missing", note: "Still not submitted" },
        { id: "lr3", category: "Homework", title: "Reading Response", date: "Jun 26", scoreOrStatus: "Submitted", note: "Completed on time" },
        { id: "lr4", category: "Exam", title: "Unit 6 Math Exam", date: "Jul 1", scoreOrStatus: "Upcoming", note: "Needs revision support" },
      ],
      weaknesses: [
        {
          id: "lw1",
          chapter: "Chapter 6: Fractions",
          topic: "Comparing fractions with different denominators",
          action: "Practice with one visual model before solving written questions.",
          practice: "Use the picture-based fraction sheet sent by the assistant teacher.",
        },
        {
          id: "lw2",
          chapter: "Word Problems",
          topic: "Finding key numbers in multi-step questions",
          action: "Underline the known numbers and the final question together.",
          practice: "Solve two guided examples with a parent before independent work.",
        },
      ],
      messages: [
        { id: "lm1", sender: "Ms. Dalia Fawzy", role: "Teacher", note: "Lina reads with confidence, but she needs a calm homework routine for fractions this week.", time: "Today, 1:15 PM" },
        { id: "lm2", sender: "Ms. Reem Hany", role: "Assistant Teacher", note: "I prepared a short parent-friendly worksheet for the fraction visuals.", time: "Yesterday, 3:55 PM" },
      ],
      payments: {
        activeCourses: [
          { id: "lc1", courseName: "Primary Mathematics", expiryDate: "Aug 10, 2026", status: "Active" },
          { id: "lc2", courseName: "Arabic Reading", expiryDate: "Aug 10, 2026", status: "Active" },
        ],
        pendingAmount: "$0",
        walletBalance: "$8",
        purchases: [
          { id: "lp1", item: "Summer Reading Bundle", date: "Jun 10", amount: "$14" },
          { id: "lp2", item: "Math Practice Cards", date: "May 26", amount: "$10" },
        ],
      },
      attendance: {
        present: 28,
        absent: 3,
        late: 1,
        rate: 88,
      },
      timeline: [
        { id: "lt1", type: "Watched session", title: "Watched Reading Comprehension Session", description: "Completed 35 minutes of reading practice.", time: "Today, 4:05 PM" },
        { id: "lt2", type: "Solved quiz", title: "Solved Reading Comprehension 5", description: "Scored 17/20.", time: "Jun 19" },
        { id: "lt3", type: "Missed homework", title: "Missed Fractions Practice Page", description: "Homework is overdue and still missing.", time: "Jun 24" },
        { id: "lt4", type: "Teacher note", title: "Teacher requested a homework routine", description: "Suggested 20-minute focused practice at home.", time: "Jun 23" },
        { id: "lt5", type: "Payment completed", title: "Paid July tuition bundle", description: "All current payments are settled.", time: "Jun 12" },
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
      overallStatus: "Watch Closely",
      parentSummary: {
        doingWell: "Omar is keeping up with class attendance and he finishes most of his science tasks on time.",
        mainProblem: "His Chemistry score dropped and one payment renewal is approaching for Physics Foundations.",
        actionThisWeek: "Review the teacher note, book one quiet revision block for Chemistry, and renew Physics before expiry.",
      },
      summary: {
        courseProgress: 69,
        averageScore: 79,
        attendanceRate: 91,
        missingHomework: 1,
        upcomingExams: 1,
        paymentStatus: "Renew soon",
      },
      alerts: [
        { id: "oa1", severity: "warning", type: "Score dropped", message: "Organic Chemistry Quiz score was lower than Omar's previous average.", time: "Yesterday" },
        { id: "oa2", severity: "warning", type: "Payment due", message: "Physics Foundations expires next week.", time: "Today" },
        { id: "oa3", severity: "info", type: "Upcoming exam", message: "Physics Unit Exam is scheduled for Jul 3.", time: "Today" },
      ],
      progress: {
        courses: [
          { id: "physics-10", name: "Physics Foundations", progress: 72, watchTime: "9h 45m", lastActivity: "Today, 7:40 PM" },
          { id: "chem-10", name: "Chemistry Advanced", progress: 63, watchTime: "8h 20m", lastActivity: "Yesterday, 5:30 PM" },
          { id: "bio-10", name: "Biology Lab Skills", progress: 71, watchTime: "5h 50m", lastActivity: "Mon, 8:00 PM" },
        ],
      },
      recentResults: [
        { id: "or1", category: "Quiz", title: "Organic Chemistry Quiz", date: "Jun 23", scoreOrStatus: "13/20", note: "Below usual level" },
        { id: "or2", category: "Homework", title: "Newton's Laws Worksheet", date: "Jun 24", scoreOrStatus: "Submitted", note: "Submitted on time" },
        { id: "or3", category: "Exam", title: "Physics Unit Exam", date: "Jul 3", scoreOrStatus: "Upcoming", note: "Exam prep pack available" },
        { id: "or4", category: "Homework", title: "Mole Calculations Sheet", date: "Jun 25", scoreOrStatus: "Missing", note: "Needs follow-up tonight" },
      ],
      weaknesses: [
        {
          id: "ow1",
          chapter: "Chemical Reactions",
          topic: "Balancing equations under time pressure",
          action: "Break revision into two short sets instead of one long practice block.",
          practice: "Use the six-question chemistry booster sent by the teacher.",
        },
      ],
      messages: [
        { id: "om1", sender: "Mr. Karim Fares", role: "Teacher", note: "Omar understands the Physics concepts, but he rushed the chemistry quiz and missed easy marks.", time: "Today, 6:25 PM" },
        { id: "om2", sender: "Ms. Huda Samir", role: "Assistant Teacher", note: "I uploaded a short chemistry correction sheet for him to review before the next lesson.", time: "Yesterday, 8:15 PM" },
      ],
      payments: {
        activeCourses: [
          { id: "oc1", courseName: "Physics Foundations", expiryDate: "Jul 2, 2026", status: "Renew soon" },
          { id: "oc2", courseName: "Chemistry Advanced", expiryDate: "Aug 1, 2026", status: "Active" },
        ],
        pendingAmount: "$31",
        walletBalance: "$11",
        purchases: [
          { id: "op1", item: "Physics Revision Pack", date: "Jun 14", amount: "$21" },
          { id: "op2", item: "Chemistry Booster Bundle", date: "May 30", amount: "$16" },
        ],
      },
      attendance: {
        present: 30,
        absent: 2,
        late: 1,
        rate: 91,
      },
      timeline: [
        { id: "ot1", type: "Solved quiz", title: "Solved Organic Chemistry Quiz", description: "Scored 13/20.", time: "Jun 23" },
        { id: "ot2", type: "Watched session", title: "Watched Physics Foundations Session", description: "Completed the full replay after class.", time: "Today, 7:40 PM" },
        { id: "ot3", type: "Teacher note", title: "Teacher flagged rushed chemistry work", description: "Revision sheet uploaded for this week.", time: "Today" },
      ],
      teacherNotes: [
        "Omar needs pacing support more than content reteaching right now.",
        "Physics performance is solid and should remain stable with regular revision.",
      ],
    },
  ],
};

export const linkableChildren: LinkableChild[] = [
  {
    id: "youssef-hassan",
    name: "Youssef Hassan",
    gradeLabel: "Grade 3",
    avatar: "YH",
    mainCourse: "Foundations Math",
    linkCode: "CLASSZ-LINK-2040",
    expiredCode: "EXPIRE-2040",
    overallStatus: "Getting Started",
    parentSummary: {
      doingWell: "Youssef is cheerful in class and already responds well to visual examples.",
      mainProblem: "He is still building a routine and his first full installment is coming soon.",
      actionThisWeek: "Keep practice playful and short, then link the account to track his first month closely.",
    },
    summary: {
      courseProgress: 24,
      averageScore: 81,
      attendanceRate: 91,
      missingHomework: 0,
      upcomingExams: 1,
      paymentStatus: "Pending first installment",
    },
    alerts: [
      { id: "ya1", severity: "info", type: "Teacher note", message: "Youssef is settling in well during live sessions.", time: "Today" },
      { id: "ya2", severity: "warning", type: "Payment due", message: "First installment becomes due next week.", time: "Today" },
    ],
    progress: {
      courses: [
        { id: "foundations-math", name: "Foundations Math", progress: 28, watchTime: "2h 40m", lastActivity: "Today, 3:20 PM" },
        { id: "young-readers", name: "Young Readers", progress: 20, watchTime: "1h 55m", lastActivity: "Yesterday, 6:00 PM" },
      ],
    },
    recentResults: [
      { id: "yr1", category: "Quiz", title: "Counting and Patterns", date: "Jun 23", scoreOrStatus: "16/20", note: "Good start" },
      { id: "yr2", category: "Homework", title: "Pattern Coloring Sheet", date: "Jun 26", scoreOrStatus: "Submitted", note: "Completed successfully" },
    ],
    weaknesses: [
      {
        id: "yw1",
        chapter: "Starter Numbers",
        topic: "Skip counting by twos",
        action: "Practice out loud for three minutes after class.",
        practice: "Use the number line card shared in the welcome packet.",
      },
    ],
    messages: [
      { id: "ym1", sender: "Ms. Nada Sami", role: "Teacher", note: "Youssef is cheerful in class and follows the visual examples well.", time: "Today, 2:10 PM" },
    ],
    payments: {
      activeCourses: [{ id: "yc1", courseName: "Foundations Math", expiryDate: "Jul 30, 2026", status: "Trial access" }],
      pendingAmount: "$15",
      walletBalance: "$5",
      purchases: [{ id: "yp1", item: "Enrollment Starter Pack", date: "Jun 18", amount: "$12" }],
    },
    attendance: {
      present: 10,
      absent: 1,
      late: 0,
      rate: 91,
    },
    timeline: [
      { id: "yt1", type: "Watched session", title: "Watched Welcome Session", description: "Completed the new student welcome class.", time: "Jun 23" },
      { id: "yt2", type: "Solved quiz", title: "Solved Counting and Patterns", description: "Scored 16/20.", time: "Jun 23" },
    ],
    teacherNotes: [
      "Youssef benefits from short, playful practice blocks at home.",
      "Please keep the learning routine brief and consistent during the first month.",
    ],
  },
];

export const linkingPolicyNotes = {
  duringRegistration: [
    "If a verified parent account already uses the same WhatsApp number, the student is linked automatically.",
    "If no verified parent account matches, a pending parent profile is created and an activation invite is sent.",
  ],
  selfRegistration: [
    "Parents can register later and link children securely using a temporary Student Link Code.",
    "Parents cannot search by student name and cannot link a child without a valid code.",
  ],
};
