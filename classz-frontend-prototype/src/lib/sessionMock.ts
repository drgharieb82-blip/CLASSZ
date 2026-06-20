export type SessionItemType = "video" | "quiz" | "homework" | "attachment" | "notes" | "discussion";

export interface SessionItem {
  id: string;
  type: SessionItemType;
  title: string;
  duration?: string;
  status: "completed" | "active" | "available" | "locked";
  // Video-specific
  videoDescription?: string;
  // Quiz-specific
  questionCount?: number;
  quizDuration?: string;
  passingScore?: number;
  // Homework-specific
  dueDate?: string;
  attemptsAllowed?: number;
  // Attachment-specific
  fileName?: string;
  fileSize?: string;
  fileType?: string;
}

export type SessionAccessType = "free" | "purchase";

export interface SessionAccess {
  type: SessionAccessType;
  durationDays: number;
  purchasedAt: string | null;
  price?: number;
}

export interface Session {
  id: string;
  title: string;
  items: SessionItem[];
  access: SessionAccess;
}

export interface SessionCourse {
  name: string;
  emoji: string;
  color: string;
  progress: number;
  teacher: { name: string; subject: string; initials: string };
  sessions: Session[];
}

export const sessionCourseData: SessionCourse = {
  name: "Advanced Mathematics",
  emoji: "📐",
  color: "from-violet-500 to-blue-500",
  progress: 42,
  teacher: { name: "Dr. Layla Hassan", subject: "Mathematics", initials: "LH" },
  sessions: [
    {
      id: "s1",
      title: "Session 1: Foundations",
      access: { type: "free", durationDays: 7, purchasedAt: "2026-06-13T10:00:00Z" },
      items: [
        {
          id: "s1-1",
          type: "quiz",
          title: "Pre-session Quiz",
          status: "completed",
          questionCount: 5,
          quizDuration: "5 min",
          passingScore: 60,
        },
        {
          id: "s1-2",
          type: "video",
          title: "Limits Introduction",
          duration: "12:40",
          status: "completed",
          videoDescription: "An introduction to the concept of limits, approaching values, and limit notation.",
        },
        {
          id: "s1-3",
          type: "quiz",
          title: "Attention Quiz: Limits",
          status: "completed",
          questionCount: 3,
          quizDuration: "3 min",
          passingScore: 70,
        },
        {
          id: "s1-4",
          type: "video",
          title: "Continuity of Functions",
          duration: "18:05",
          status: "completed",
          videoDescription: "Understanding continuous functions, types of discontinuity, and the Intermediate Value Theorem.",
        },
        {
          id: "s1-5",
          type: "homework",
          title: "Homework: Limits & Continuity",
          status: "completed",
          questionCount: 10,
          quizDuration: "30 min",
          dueDate: "Jun 15, 2026",
          attemptsAllowed: 2,
          passingScore: 70,
        },
      ],
    },
    {
      id: "s2",
      title: "Session 2: Differential Calculus",
      access: { type: "purchase", durationDays: 5, purchasedAt: "2026-06-18T14:30:00Z", price: 15 },
      items: [
        {
          id: "s2-1",
          type: "video",
          title: "Derivatives from First Principles",
          duration: "22:30",
          status: "completed",
          videoDescription: "Derive the concept of the derivative using the limit definition: f'(x) = lim(h→0) [f(x+h) - f(x)] / h.",
        },
        {
          id: "s2-2",
          type: "video",
          title: "Power Rule & Constant Rule",
          duration: "14:20",
          status: "completed",
          videoDescription: "Learn the power rule d/dx(xⁿ) = nxⁿ⁻¹ and how constants behave under differentiation.",
        },
        {
          id: "s2-3",
          type: "quiz",
          title: "Quick Quiz: Derivative Rules",
          status: "active",
          questionCount: 5,
          quizDuration: "5 min",
          passingScore: 70,
        },
        {
          id: "s2-4",
          type: "video",
          title: "The Product Rule",
          duration: "18:30",
          status: "available",
          videoDescription: "Learn how to differentiate the product of two functions: (fg)' = f'g + fg'.",
        },
        {
          id: "s2-5",
          type: "homework",
          title: "Homework: Differentiation",
          status: "locked",
          questionCount: 15,
          quizDuration: "45 min",
          dueDate: "Jun 22, 2026",
          attemptsAllowed: 3,
          passingScore: 70,
        },
      ],
    },
    {
      id: "s3",
      title: "Session 3: Applications",
      access: { type: "purchase", durationDays: 5, purchasedAt: null, price: 20 },
      items: [
        {
          id: "s3-1",
          type: "video",
          title: "Tangent Lines & Normals",
          duration: "19:10",
          status: "locked",
          videoDescription: "Apply derivatives to find equations of tangent and normal lines to curves.",
        },
        {
          id: "s3-2",
          type: "attachment",
          title: "Formula Reference Sheet",
          status: "locked",
          fileName: "Calculus_Formulas.pdf",
          fileSize: "1.8 MB",
          fileType: "PDF",
        },
        {
          id: "s3-3",
          type: "quiz",
          title: "Quiz: Applications of Derivatives",
          status: "locked",
          questionCount: 8,
          quizDuration: "10 min",
          passingScore: 75,
        },
        {
          id: "s3-4",
          type: "homework",
          title: "Homework: Applications",
          status: "locked",
          questionCount: 12,
          quizDuration: "40 min",
          dueDate: "Jun 29, 2026",
          attemptsAllowed: 2,
          passingScore: 70,
        },
      ],
    },
  ],
};

export const sessionCourseDataMap: Record<string, SessionCourse> = {
  ec1: {
    name: "Chemistry Grade 12",
    emoji: "🧪",
    color: "from-emerald-500 to-teal-500",
    progress: 64,
    teacher: { name: "Dr. Ahmed Gharib", subject: "Chemistry", initials: "AG" },
    sessions: [
      {
        id: "ch-s1",
        title: "Session 1: Organic Foundations",
        access: { type: "free", durationDays: 7, purchasedAt: "2026-06-10T10:00:00Z" },
        items: [
          { id: "ch-s1-1", type: "video", title: "Introduction to Organic Chemistry", duration: "15:20", status: "completed", videoDescription: "Bonding, hybridization, and functional groups." },
          { id: "ch-s1-2", type: "quiz", title: "Organic Basics Quiz", status: "completed", questionCount: 5, quizDuration: "5 min", passingScore: 60 },
          { id: "ch-s1-3", type: "video", title: "Alkanes & Nomenclature", duration: "20:10", status: "completed", videoDescription: "IUPAC naming and properties of alkanes." },
          { id: "ch-s1-4", type: "homework", title: "Homework: Organic Foundations", status: "completed", questionCount: 10, quizDuration: "30 min", dueDate: "Jun 14, 2026", attemptsAllowed: 2, passingScore: 70 },
        ],
      },
      {
        id: "ch-s2",
        title: "Session 2: Alcohols & Ethers",
        access: { type: "purchase", durationDays: 5, purchasedAt: "2026-06-15T14:00:00Z", price: 15 },
        items: [
          { id: "ch-s2-1", type: "video", title: "Alcohols in Organic Chemistry", duration: "18:30", status: "completed", videoDescription: "Classification, preparation, and reactions of alcohols." },
          { id: "ch-s2-2", type: "quiz", title: "Alcohols Quick Quiz", status: "active", questionCount: 5, quizDuration: "5 min", passingScore: 70 },
          { id: "ch-s2-3", type: "video", title: "Ethers & Epoxides", duration: "16:45", status: "available", videoDescription: "Structure, naming, and reactions of ethers." },
          { id: "ch-s2-4", type: "homework", title: "Homework: Alcohols & Ethers", status: "locked", questionCount: 12, quizDuration: "35 min", dueDate: "Jun 22, 2026", attemptsAllowed: 2, passingScore: 70 },
        ],
      },
      {
        id: "ch-s3",
        title: "Session 3: Aromatic Compounds",
        access: { type: "purchase", durationDays: 5, purchasedAt: null, price: 20 },
        items: [
          { id: "ch-s3-1", type: "video", title: "Aromatic Compounds", duration: "22:00", status: "locked", videoDescription: "Benzene structure, aromaticity, and electrophilic substitution." },
          { id: "ch-s3-2", type: "attachment", title: "Organic Chemistry Formulas", status: "locked", fileName: "OrgChem_Formulas.pdf", fileSize: "2.1 MB", fileType: "PDF" },
          { id: "ch-s3-3", type: "quiz", title: "Aromatic Compounds Quiz", status: "locked", questionCount: 8, quizDuration: "10 min", passingScore: 75 },
        ],
      },
    ],
  },
  ec2: {
    name: "Physics Grade 12",
    emoji: "⚛️",
    color: "from-blue-500 to-cyan-500",
    progress: 42,
    teacher: { name: "Mr. Omar Khalil", subject: "Physics", initials: "OK" },
    sessions: [
      {
        id: "ph-s1",
        title: "Session 1: Wave Motion",
        access: { type: "free", durationDays: 7, purchasedAt: "2026-06-12T09:00:00Z" },
        items: [
          { id: "ph-s1-1", type: "video", title: "Transverse & Longitudinal Waves", duration: "14:50", status: "completed", videoDescription: "Types of waves, wavelength, frequency, and amplitude." },
          { id: "ph-s1-2", type: "video", title: "Wave Speed & Energy", duration: "16:20", status: "completed", videoDescription: "v = fλ and energy transfer in waves." },
          { id: "ph-s1-3", type: "quiz", title: "Wave Motion Quiz", status: "active", questionCount: 6, quizDuration: "6 min", passingScore: 70 },
          { id: "ph-s1-4", type: "homework", title: "Homework: Waves", status: "available", questionCount: 10, quizDuration: "25 min", dueDate: "Jun 20, 2026", attemptsAllowed: 2, passingScore: 70 },
        ],
      },
      {
        id: "ph-s2",
        title: "Session 2: Sound Waves",
        access: { type: "purchase", durationDays: 5, purchasedAt: null, price: 18 },
        items: [
          { id: "ph-s2-1", type: "video", title: "Sound Wave Properties", duration: "19:30", status: "locked", videoDescription: "Speed of sound, reflection, refraction, and diffraction." },
          { id: "ph-s2-2", type: "quiz", title: "Sound Waves Quiz", status: "locked", questionCount: 5, quizDuration: "5 min", passingScore: 70 },
        ],
      },
    ],
  },
};

// Default fallback — maps ec1 to existing data, others from map
export function getSessionCourseById(id: string): SessionCourse | undefined {
  return sessionCourseDataMap[id];
}

export function getSessionProgress(course: SessionCourse): {
  completedItems: number;
  totalItems: number;
  percent: number;
} {
  const allItems = course.sessions.flatMap((s) => s.items);
  const completed = allItems.filter((i) => i.status === "completed").length;
  return {
    completedItems: completed,
    totalItems: allItems.length,
    percent: allItems.length > 0 ? Math.round((completed / allItems.length) * 100) : 0,
  };
}
