import { LEGENDARY_TITLES } from "@/constants/legendaryTitles";

export interface ChallengeTitle {
  en: string;
  ar: string;
}

export interface HonorQuote {
  en: string;
  ar: string;
}

export interface CertificateData {
  id: string;
  certificateId: string;
  studentCode: string;
  subjectName: string;
  courseName: string;
  emoji: string;
  color: string;
  studentName: string;
  teacherName: string;
  teacherTitle: string;
  grade: string;
  gradeAr: string;
  averageScore: number;
  improvementPercent: number;
  completionPercent: number;
  rank: number | null;
  challengeTitle: ChallengeTitle;
  honorQuote: HonorQuote;
  issueDate: string;
  hallOfHonorPublished: boolean;
  featuredUntil: string | null;
}

const topQuotes: Record<number, HonorQuote> = {
  1: { en: "Champions don't wait for success, they create it.", ar: "الأبطال لا ينتظرون النجاح، بل يصنعونه." },
  2: { en: "Rise again, stronger every time.", ar: "انهض من جديد، أقوى في كل مرة." },
  3: { en: "Persistence builds legends.", ar: "المثابرة تصنع الأساطير." },
};

const defaultQuote: HonorQuote = {
  en: "Every step forward writes a new story.",
  ar: "كل خطوة للأمام تكتب قصة جديدة.",
};

const nicknames: Record<string, ChallengeTitle> = {
  math: { en: "Math Champion", ar: "بطل الرياضيات" },
  physics: { en: "Physics Ace", ar: "نجم الفيزياء" },
  chemistry: { en: "Chemistry Wizard", ar: "ساحر الكيمياء" },
  biology: { en: "Bio Explorer", ar: "مستكشف الأحياء" },
  english: { en: "Word Master", ar: "ماهر الكلمات" },
  arabic: { en: "Rising Star", ar: "النجم الصاعد" },
};

function getTitle(rank: number | null, subjectKey: string): ChallengeTitle {
  if (rank && LEGENDARY_TITLES[rank]) {
    const lt = LEGENDARY_TITLES[rank];
    return { en: lt.title, ar: lt.titleAr };
  }
  return nicknames[subjectKey] ?? { en: "Knowledge Seeker", ar: "باحث المعرفة" };
}

function getQuote(rank: number | null): HonorQuote {
  if (rank && rank <= 3) return topQuotes[rank];
  return defaultQuote;
}

export const certificates: CertificateData[] = [
  {
    id: "cert-eng",
    certificateId: "CLSZ-2026-ENG-0419",
    subjectName: "English",
    courseName: "English Grade 12",
    emoji: "📚",
    color: "from-pink-500 to-rose-500",
    studentCode: "CLS-26-000001",
    studentName: "Aya Mansour",
    teacherName: "Ms. Hana Adel",
    teacherTitle: "CLASSZ English Mentor",
    grade: "Excellent",
    gradeAr: "ممتاز",
    averageScore: 94,
    improvementPercent: 32,
    completionPercent: 100,
    rank: 1,
    challengeTitle: getTitle(1, "english"),
    honorQuote: getQuote(1),
    issueDate: "2026-06-10",
    hallOfHonorPublished: true,
    featuredUntil: "2026-06-27",
  },
  {
    id: "cert-math",
    certificateId: "CLSZ-2026-MTH-0420",
    studentCode: "CLS-26-000001",
    subjectName: "Mathematics",
    courseName: "Advanced Mathematics",
    emoji: "📐",
    color: "from-violet-500 to-blue-500",
    studentName: "Aya Mansour",
    teacherName: "Dr. Layla Hassan",
    teacherTitle: "CLASSZ Mathematics Mentor",
    grade: "Very Good",
    gradeAr: "جيد جداً",
    averageScore: 85,
    improvementPercent: 24,
    completionPercent: 85,
    rank: 5,
    challengeTitle: getTitle(5, "math"),
    honorQuote: getQuote(5),
    issueDate: "2026-06-15",
    hallOfHonorPublished: false,
    featuredUntil: null,
  },
  {
    id: "cert-chem",
    certificateId: "CLSZ-2026-CHM-0421",
    studentCode: "CLS-26-000001",
    subjectName: "Chemistry",
    courseName: "Chemistry Grade 12",
    emoji: "🧪",
    color: "from-emerald-500 to-teal-500",
    studentName: "Aya Mansour",
    teacherName: "Dr. Ahmed Gharib",
    teacherTitle: "CLASSZ Chemistry Mentor",
    grade: "Good",
    gradeAr: "جيد",
    averageScore: 78,
    improvementPercent: 18,
    completionPercent: 64,
    rank: 9,
    challengeTitle: getTitle(9, "chemistry"),
    honorQuote: getQuote(9),
    issueDate: "2026-06-18",
    hallOfHonorPublished: false,
    featuredUntil: null,
  },
  {
    id: "cert-phys",
    certificateId: "CLSZ-2026-PHY-0422",
    studentCode: "CLS-26-000001",
    subjectName: "Physics",
    courseName: "Physics Grade 12",
    emoji: "⚛️",
    color: "from-blue-500 to-cyan-500",
    studentName: "Aya Mansour",
    teacherName: "Mr. Omar Khalil",
    teacherTitle: "CLASSZ Physics Mentor",
    grade: "Good",
    gradeAr: "جيد",
    averageScore: 76,
    improvementPercent: 15,
    completionPercent: 42,
    rank: 3,
    challengeTitle: getTitle(3, "physics"),
    honorQuote: getQuote(3),
    issueDate: "2026-06-17",
    hallOfHonorPublished: false,
    featuredUntil: null,
  },
  {
    id: "cert-bio",
    certificateId: "CLSZ-2026-BIO-0423",
    studentCode: "CLS-26-000001",
    subjectName: "Biology",
    courseName: "Biology Grade 12",
    emoji: "🧬",
    color: "from-green-500 to-emerald-500",
    studentName: "Aya Mansour",
    teacherName: "Dr. Yusuf Amin",
    teacherTitle: "CLASSZ Biology Mentor",
    grade: "Pass",
    gradeAr: "مقبول",
    averageScore: 65,
    improvementPercent: 10,
    completionPercent: 20,
    rank: null,
    challengeTitle: getTitle(null, "biology"),
    honorQuote: getQuote(null),
    issueDate: "2026-06-12",
    hallOfHonorPublished: false,
    featuredUntil: null,
  },
  {
    id: "cert-ar",
    certificateId: "CLSZ-2026-ARB-0424",
    studentCode: "CLS-26-000001",
    subjectName: "Arabic",
    courseName: "Arabic Grade 12",
    emoji: "🕌",
    color: "from-amber-500 to-orange-500",
    studentName: "Aya Mansour",
    teacherName: "Ustaz Fadi Aziz",
    teacherTitle: "CLASSZ Arabic Mentor",
    grade: "Very Good",
    gradeAr: "جيد جداً",
    averageScore: 88,
    improvementPercent: 22,
    completionPercent: 55,
    rank: 2,
    challengeTitle: getTitle(2, "arabic"),
    honorQuote: getQuote(2),
    issueDate: "2026-06-14",
    hallOfHonorPublished: false,
    featuredUntil: null,
  },
];

export interface HallOfHonorEntry {
  studentCode: string;
  studentName: string;
  challengeTitle: ChallengeTitle;
  subjectName: string;
  courseName: string;
  rank: number;
  teacherName: string;
  emoji: string;
  featuredUntil: string;
  certificateId: string;
}

export const hallOfHonorFeatured: HallOfHonorEntry[] = [
  {
    studentCode: "CLS-26-000001",
    studentName: "Aya Mansour",
    challengeTitle: { en: LEGENDARY_TITLES[1].title, ar: LEGENDARY_TITLES[1].titleAr },
    subjectName: "English",
    courseName: "English Grade 12",
    rank: 1,
    teacherName: "Ms. Hana Adel",
    emoji: "📚",
    featuredUntil: "2026-06-27",
    certificateId: "CLSZ-2026-ENG-0419",
  },
  {
    studentCode: "CLS-26-000002",
    studentName: "Omar Tarek",
    challengeTitle: { en: LEGENDARY_TITLES[2].title, ar: LEGENDARY_TITLES[2].titleAr },
    subjectName: "Mathematics",
    courseName: "Advanced Mathematics",
    rank: 2,
    teacherName: "Dr. Layla Hassan",
    emoji: "📐",
    featuredUntil: "2026-06-25",
    certificateId: "CLSZ-2026-MTH-0318",
  },
  {
    studentCode: "CLS-26-000003",
    studentName: "Lina Fares",
    challengeTitle: { en: LEGENDARY_TITLES[3].title, ar: LEGENDARY_TITLES[3].titleAr },
    subjectName: "Chemistry",
    courseName: "Chemistry Grade 12",
    rank: 3,
    teacherName: "Dr. Ahmed Gharib",
    emoji: "🧪",
    featuredUntil: "2026-06-24",
    certificateId: "CLSZ-2026-CHM-0312",
  },
];
