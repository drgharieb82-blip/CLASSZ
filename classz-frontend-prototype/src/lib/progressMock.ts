export interface CourseProgress {
  id: string;
  name: string;
  emoji: string;
  color: string;
  teacher: string;
  status: "active" | "completed" | "locked";
  lessonsCompleted: number;
  totalLessons: number;
  sessionsCompleted: number;
  totalSessions: number;
  quizzesCompleted: number;
  totalQuizzes: number;
  homeworkCompleted: number;
  totalHomework: number;
  averageScore: number;
  timeSpentMinutes: number;
}

export interface SubjectProgress {
  subject: string;
  emoji: string;
  color: string;
  courses: CourseProgress[];
  overallScore: number;
  totalTimeMinutes: number;
}

export interface ConceptStrength {
  name: string;
  subject: string;
  score: number;
}

export interface ActivityItem {
  id: string;
  type: "lesson" | "quiz" | "homework" | "badge" | "streak";
  title: string;
  course: string;
  emoji: string;
  time: string;
  score?: number;
}

export interface Recommendation {
  id: string;
  type: "practice" | "review" | "lesson";
  title: string;
  reason: string;
  course: string;
  emoji: string;
}

export interface StudentProgressData {
  overallProgress: number;
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  totalLessonsCompleted: number;
  totalLessons: number;
  totalSessionsCompleted: number;
  totalSessions: number;
  totalQuizzesCompleted: number;
  totalQuizzes: number;
  totalHomeworkCompleted: number;
  totalHomework: number;
  overallAverageScore: number;
  studyStreak: number;
  longestStreak: number;
  totalTimeMinutes: number;
  weeklyTimeMinutes: number[];
  subjects: SubjectProgress[];
  weakConcepts: ConceptStrength[];
  strongConcepts: ConceptStrength[];
  recentActivity: ActivityItem[];
  recommendations: Recommendation[];
}

export const studentProgressData: StudentProgressData = {
  overallProgress: 54,
  totalCoursesEnrolled: 4,
  totalCoursesCompleted: 1,
  totalLessonsCompleted: 67,
  totalLessons: 130,
  totalSessionsCompleted: 8,
  totalSessions: 16,
  totalQuizzesCompleted: 14,
  totalQuizzes: 24,
  totalHomeworkCompleted: 6,
  totalHomework: 12,
  overallAverageScore: 82,
  studyStreak: 23,
  longestStreak: 31,
  totalTimeMinutes: 2840,
  weeklyTimeMinutes: [45, 62, 38, 75, 55, 90, 42],

  subjects: [
    {
      subject: "Chemistry",
      emoji: "🧪",
      color: "from-emerald-500 to-teal-500",
      overallScore: 78,
      totalTimeMinutes: 920,
      courses: [
        {
          id: "cp-1",
          name: "Chemistry Grade 12",
          emoji: "🧪",
          color: "from-emerald-500 to-teal-500",
          teacher: "Dr. Ahmed Gharib",
          status: "active",
          lessonsCompleted: 22,
          totalLessons: 34,
          sessionsCompleted: 3,
          totalSessions: 5,
          quizzesCompleted: 5,
          totalQuizzes: 8,
          homeworkCompleted: 2,
          totalHomework: 4,
          averageScore: 78,
          timeSpentMinutes: 920,
        },
      ],
    },
    {
      subject: "Physics",
      emoji: "⚛️",
      color: "from-blue-500 to-cyan-500",
      overallScore: 76,
      totalTimeMinutes: 680,
      courses: [
        {
          id: "cp-2",
          name: "Physics Grade 12",
          emoji: "⚛️",
          color: "from-blue-500 to-cyan-500",
          teacher: "Mr. Omar Khalil",
          status: "active",
          lessonsCompleted: 15,
          totalLessons: 36,
          sessionsCompleted: 2,
          totalSessions: 5,
          quizzesCompleted: 3,
          totalQuizzes: 6,
          homeworkCompleted: 1,
          totalHomework: 3,
          averageScore: 76,
          timeSpentMinutes: 680,
        },
      ],
    },
    {
      subject: "Mathematics",
      emoji: "📐",
      color: "from-violet-500 to-blue-500",
      overallScore: 85,
      totalTimeMinutes: 760,
      courses: [
        {
          id: "cp-3",
          name: "Advanced Mathematics",
          emoji: "📐",
          color: "from-violet-500 to-blue-500",
          teacher: "Dr. Layla Hassan",
          status: "active",
          lessonsCompleted: 5,
          totalLessons: 14,
          sessionsCompleted: 1,
          totalSessions: 3,
          quizzesCompleted: 2,
          totalQuizzes: 4,
          homeworkCompleted: 1,
          totalHomework: 2,
          averageScore: 85,
          timeSpentMinutes: 760,
        },
      ],
    },
    {
      subject: "English",
      emoji: "📚",
      color: "from-pink-500 to-rose-500",
      overallScore: 94,
      totalTimeMinutes: 480,
      courses: [
        {
          id: "cp-4",
          name: "English Grade 12",
          emoji: "📚",
          color: "from-pink-500 to-rose-500",
          teacher: "Ms. Hana Adel",
          status: "completed",
          lessonsCompleted: 30,
          totalLessons: 30,
          sessionsCompleted: 4,
          totalSessions: 4,
          quizzesCompleted: 6,
          totalQuizzes: 6,
          homeworkCompleted: 3,
          totalHomework: 3,
          averageScore: 94,
          timeSpentMinutes: 480,
        },
      ],
    },
  ],

  weakConcepts: [
    { name: "Chemical Equilibrium", subject: "Chemistry", score: 52 },
    { name: "Ksp Calculations", subject: "Chemistry", score: 55 },
    { name: "Projectile Motion", subject: "Physics", score: 58 },
    { name: "Doppler Effect", subject: "Physics", score: 60 },
    { name: "Chain Rule", subject: "Mathematics", score: 62 },
  ],

  strongConcepts: [
    { name: "Reading Comprehension", subject: "English", score: 98 },
    { name: "Stoichiometry", subject: "Chemistry", score: 95 },
    { name: "Power Rule", subject: "Mathematics", score: 94 },
    { name: "Newton's Laws", subject: "Physics", score: 92 },
    { name: "Essay Structure", subject: "English", score: 90 },
  ],

  recentActivity: [
    { id: "a1", type: "lesson", title: "Completed: Power Rule & Constant Rule", course: "Advanced Mathematics", emoji: "📐", time: "2h ago" },
    { id: "a2", type: "quiz", title: "Quick Quiz: Derivative Rules", course: "Advanced Mathematics", emoji: "📐", time: "3h ago", score: 80 },
    { id: "a3", type: "homework", title: "Submitted: Limits & Continuity HW", course: "Advanced Mathematics", emoji: "📐", time: "Yesterday", score: 88 },
    { id: "a4", type: "lesson", title: "Completed: Wave Motion", course: "Physics Grade 12", emoji: "⚛️", time: "Yesterday" },
    { id: "a5", type: "badge", title: "Earned: Week Warrior badge", course: "—", emoji: "⭐", time: "2 days ago" },
    { id: "a6", type: "streak", title: "23-day study streak!", course: "—", emoji: "🔥", time: "Today" },
    { id: "a7", type: "quiz", title: "Periodic Exam 1 — Chapters 1 & 2", course: "Chemistry Grade 12", emoji: "🧪", time: "3 days ago", score: 84 },
    { id: "a8", type: "lesson", title: "Completed: Alcohols in Organic Chemistry", course: "Chemistry Grade 12", emoji: "🧪", time: "4 days ago" },
  ],

  recommendations: [
    { id: "r1", type: "practice", title: "Practice Chemical Equilibrium", reason: "52% accuracy — weakest concept", course: "Chemistry Grade 12", emoji: "🧪" },
    { id: "r2", type: "practice", title: "Practice Ksp Calculations", reason: "55% accuracy — needs improvement", course: "Chemistry Grade 12", emoji: "🧪" },
    { id: "r3", type: "review", title: "Review Projectile Motion", reason: "58% accuracy — revisit fundamentals", course: "Physics Grade 12", emoji: "⚛️" },
    { id: "r4", type: "lesson", title: "Continue: The Product Rule", reason: "Next unlocked lesson in Session 2", course: "Advanced Mathematics", emoji: "📐" },
  ],
};
