import { courses } from "./mock";
import { getPublishedPublicCourses } from "./teacher/teacher-course-store";
import { getPublishedChapters } from "./teacher/teacher-chapter-store";
import { getPublishedSessions } from "./teacher/teacher-session-store";

export interface CourseDetails {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  teacherBio: string;
  level: string;
  lessons: number;
  hours: number;
  rating: number;
  students: number;
  price: number;
  color: string;
  emoji: string;
  tag: string;
  description: string;
  outcomes: string[];
  chapters: { title: string; lessonsCount: number; duration: string; preview?: boolean }[];
  reviews: { name: string; avatar: string; rating: number; comment: string; date: string }[];
  paymentOptions: string[];
}

const detailsMap: Record<string, Partial<CourseDetails>> = {
  c1: {
    description: "Master advanced calculus, algebra, and geometry concepts required for Grade 12 examinations. This course covers limits, derivatives, integrals, sequences, and probability with extensive worked examples and practice problems.",
    teacherBio: "PhD in Applied Mathematics, 15 years of teaching experience. Known for breaking down complex topics into digestible steps.",
    outcomes: [
      "Solve complex differential equations confidently",
      "Master integration techniques including substitution and by parts",
      "Understand sequences, series, and convergence tests",
      "Apply mathematical concepts to real-world problems",
      "Score 90%+ on Grade 12 math examinations",
    ],
    chapters: [
      { title: "Differential Calculus", lessonsCount: 8, duration: "5h 20m", preview: true },
      { title: "Integral Calculus", lessonsCount: 7, duration: "4h 45m" },
      { title: "Sequences & Series", lessonsCount: 6, duration: "4h 10m" },
      { title: "Probability & Statistics", lessonsCount: 9, duration: "6h 30m" },
      { title: "Linear Algebra Essentials", lessonsCount: 8, duration: "5h 15m" },
      { title: "Exam Preparation & Practice", lessonsCount: 10, duration: "6h 00m" },
    ],
    reviews: [
      { name: "Aya Mansour", avatar: "AM", rating: 5, comment: "Dr. Layla explains everything so clearly. I improved my math grade from 78% to 96%!", date: "2 weeks ago" },
      { name: "Omar Tarek", avatar: "OT", rating: 5, comment: "The best math course I've taken. Practice problems are excellent.", date: "1 month ago" },
      { name: "Lina Fares", avatar: "LF", rating: 4, comment: "Comprehensive content. Would love more video explanations for integration.", date: "1 month ago" },
    ],
    paymentOptions: ["Wallet Balance", "Credit/Debit Card", "Fawry", "Vodafone Cash"],
  },
  c2: {
    description: "Explore the fundamental laws governing motion, forces, energy, and wave phenomena. This physics course provides intuitive explanations, real-world experiments, and exam-focused problem solving.",
    teacherBio: "MSc in Theoretical Physics, 10 years teaching experience. Passionate about making physics intuitive through visual demonstrations.",
    outcomes: [
      "Understand Newton's laws and their applications",
      "Analyze motion in one and two dimensions",
      "Master energy conservation and work-energy theorem",
      "Explain wave properties including interference and diffraction",
      "Solve exam-style physics problems with confidence",
    ],
    chapters: [
      { title: "Kinematics & Motion", lessonsCount: 6, duration: "4h 30m", preview: true },
      { title: "Newton's Laws & Forces", lessonsCount: 7, duration: "5h 00m" },
      { title: "Work, Energy & Power", lessonsCount: 6, duration: "4h 15m" },
      { title: "Momentum & Collisions", lessonsCount: 5, duration: "3h 45m" },
      { title: "Waves & Oscillations", lessonsCount: 7, duration: "5h 20m" },
      { title: "Sound & Light Waves", lessonsCount: 5, duration: "5h 10m" },
    ],
    reviews: [
      { name: "Karim Adel", avatar: "KA", rating: 5, comment: "Mr. Omar makes physics fun! The experiments really help visualize concepts.", date: "3 weeks ago" },
      { name: "Nour Sami", avatar: "NS", rating: 4, comment: "Great course. The problem-solving sessions are very helpful for exams.", date: "1 month ago" },
    ],
    paymentOptions: ["Wallet Balance", "Credit/Debit Card", "Fawry", "Vodafone Cash"],
  },
};

const defaultDetails: Omit<CourseDetails, keyof typeof courses[0]> = {
  description: "A comprehensive course designed for secondary students, covering all essential topics with expert instruction, practice exercises, and exam preparation materials.",
  teacherBio: "Experienced educator with years of teaching excellence and a passion for student success.",
  outcomes: [
    "Master all core concepts in the subject",
    "Build strong problem-solving skills",
    "Prepare effectively for examinations",
    "Apply knowledge to real-world scenarios",
    "Develop critical thinking abilities",
  ],
  chapters: [
    { title: "Fundamentals & Introduction", lessonsCount: 6, duration: "4h 00m", preview: true },
    { title: "Core Concepts", lessonsCount: 8, duration: "5h 30m" },
    { title: "Advanced Topics", lessonsCount: 7, duration: "4h 45m" },
    { title: "Practice & Applications", lessonsCount: 6, duration: "4h 00m" },
    { title: "Exam Preparation", lessonsCount: 5, duration: "3h 30m" },
  ],
  reviews: [
    { name: "Student", avatar: "ST", rating: 5, comment: "Excellent course with clear explanations and great practice materials.", date: "2 weeks ago" },
    { name: "Learner", avatar: "LR", rating: 4, comment: "Very well structured. Helped me improve significantly.", date: "1 month ago" },
  ],
  paymentOptions: ["Wallet Balance", "Credit/Debit Card", "Fawry", "Vodafone Cash"],
};

export function getCourseDetails(courseId: string): CourseDetails | null {
  const base = courses.find((c) => c.id === courseId);
  if (base) {
    const extra = detailsMap[courseId] ?? {};
    return {
      ...base,
      description: extra.description ?? defaultDetails.description,
      teacherBio: extra.teacherBio ?? defaultDetails.teacherBio,
      outcomes: extra.outcomes ?? defaultDetails.outcomes,
      chapters: extra.chapters ?? defaultDetails.chapters,
      reviews: extra.reviews ?? defaultDetails.reviews,
      paymentOptions: extra.paymentOptions ?? defaultDetails.paymentOptions,
    } as CourseDetails;
  }

  const teacherCourses = getPublishedPublicCourses();
  const tc = teacherCourses.find((c) => c.id === courseId);
  if (!tc) return null;

  const pubChapters = getPublishedChapters(courseId);
  const pubSessions = getPublishedSessions(courseId);
  const chaptersList = pubChapters.length > 0
    ? pubChapters.map((ch) => {
        const chSessions = pubSessions.filter((s) => s.chapterId === ch.id);
        return {
          title: ch.title,
          lessonsCount: chSessions.length,
          duration: `${chSessions.length * 15}m`,
          preview: chSessions.some((s) => s.isFreePreview),
        };
      })
    : defaultDetails.chapters;

  return {
    id: tc.id,
    publicCode: tc.publicCode,
    title: tc.title,
    subject: tc.subject,
    teacher: tc.teacherName,
    teacherCode: tc.teacherPublicCode,
    level: tc.grade,
    lessons: pubSessions.length || tc.lessonsCount || 0,
    hours: tc.hoursCount || Math.ceil(pubSessions.length * 0.4),
    rating: tc.rating || 0,
    students: tc.enrollmentCount || 0,
    price: tc.price,
    color: tc.coverColor,
    emoji: tc.coverEmoji,
    tag: "",
    description: tc.description || defaultDetails.description,
    teacherBio: defaultDetails.teacherBio,
    outcomes: defaultDetails.outcomes,
    chapters: chaptersList,
    reviews: [],
    paymentOptions: defaultDetails.paymentOptions,
  } as CourseDetails;
}
