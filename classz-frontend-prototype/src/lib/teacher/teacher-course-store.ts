import { create } from "zustand";
import {
  createCourse as createCourseApi,
  listMyCourses,
  type CourseRead,
} from "@/lib/api/courses";

export interface CountryPrice {
  countryCode: string;
  currency: string;
  price: number;
}

export type CourseStatus = "draft" | "published" | "archived";
export type CourseVisibility = "public" | "private" | "unlisted";

export interface Testimonial {
  name: string;
  avatar: string;
  rating: number;
  comment: string;
}

export type CourseCategory = "academic" | "training" | "professional" | "general";
export type PricingModel = "one_time" | "monthly" | "per_session" | "session_bundle";

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  telegram?: string;
  whatsapp?: string;
  youtube?: string;
  website?: string;
}

export interface TeacherCourse {
  id: string;
  publicCode: string;
  // Basic
  title: string;
  slug: string;
  category: CourseCategory;
  subject: string;
  customSubject: string;
  grade: string;
  customGrade: string;
  description: string;
  shortDescription: string;
  language: string;
  // Cover
  coverEmoji: string;
  coverColor: string;
  coverImageUrl: string;
  promoVideoUrl: string;
  // Teacher
  teacherId: string;
  teacherName: string;
  teacherPublicCode: string;
  teacherBio: string;
  teacherHeadline: string;
  // Marketing
  whyJoinThisCourse: string[];
  outcomes: string[];
  whoIsThisFor: string[];
  requirements: string[];
  courseHighlights: string[];
  includedFeatures: string[];
  socialLinks: SocialLinks;
  // Pricing
  pricingModel: PricingModel;
  price: number;
  monthlyPrice: number;
  perSessionPrice: number;
  bundleSize: number;
  bundlePrice: number;
  currency: string;
  countryPrices: CountryPrice[];
  discountPrice: number;
  discountEndsAt: string;
  allowWalletPayment: boolean;
  // Social proof
  testimonials: Testimonial[];
  enrollmentCount: number;
  revenue: number;
  rating: number;
  reviewsCount: number;
  completionRate: number;
  // Content stats
  lessonsCount: number;
  hoursCount: number;
  chaptersCount: number;
  sessionsCount: number;
  questionsCount: number;
  quizzesCount: number;
  // Certificate & support
  certificateIncluded: boolean;
  accessDuration: string;
  refundPolicy: string;
  // Team
  assignedAssistant: string;
  assignedContentManager: string;
  // SEO
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  // Status
  status: CourseStatus;
  visibility: CourseVisibility;
  isFeatured: boolean;
  featuredUntil: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateCourseData = Pick<TeacherCourse, "title" | "subject" | "grade"> &
  Partial<Omit<TeacherCourse, "id" | "publicCode" | "slug" | "createdAt" | "updatedAt">>;

interface TeacherCourseState {
  courses: TeacherCourse[];
  isLoading: boolean;
  createCourse: (data: CreateCourseData) => Promise<TeacherCourse | null>;
  loadCourses: (teacherId: string) => Promise<void>;
  updateCourse: (courseId: string, data: Partial<TeacherCourse>) => void;
  deleteCourse: (courseId: string) => void;
  publishCourse: (courseId: string) => void;
  unpublishCourse: (courseId: string) => void;
  archiveCourse: (courseId: string) => void;
  featureCourse: (courseId: string) => void;
}

function slugify(title: string): string {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "course";
  const suffix = Date.now().toString(36).slice(-4);
  return `${base}-${suffix}`;
}

function toCourse(r: CourseRead): TeacherCourse {
  return {
    id: r.id,
    publicCode: r.public_code,
    title: r.title,
    slug: r.slug,
    category: "academic",
    subject: r.subject,
    customSubject: "",
    grade: r.grade,
    customGrade: "",
    description: r.description ?? "",
    shortDescription: "",
    language: "",
    coverEmoji: "📘",
    coverColor: "from-violet-500 to-blue-500",
    coverImageUrl: r.thumbnail_url ?? "",
    promoVideoUrl: "",
    teacherId: r.teacher_id,
    teacherName: "",
    teacherPublicCode: "",
    teacherBio: "",
    teacherHeadline: "",
    whyJoinThisCourse: [],
    outcomes: [],
    whoIsThisFor: [],
    requirements: [],
    courseHighlights: [],
    includedFeatures: [],
    socialLinks: {},
    pricingModel: "one_time",
    price: 0,
    monthlyPrice: 0,
    perSessionPrice: 0,
    bundleSize: 0,
    bundlePrice: 0,
    currency: "USD",
    countryPrices: [],
    discountPrice: 0,
    discountEndsAt: "",
    allowWalletPayment: true,
    testimonials: [],
    enrollmentCount: 0,
    revenue: 0,
    rating: 0,
    reviewsCount: 0,
    completionRate: 0,
    lessonsCount: 0,
    hoursCount: 0,
    chaptersCount: 0,
    sessionsCount: 0,
    questionsCount: 0,
    quizzesCount: 0,
    certificateIncluded: true,
    accessDuration: "Lifetime",
    refundPolicy: "30-day money-back guarantee",
    assignedAssistant: "",
    assignedContentManager: "",
    metaTitle: "",
    metaDescription: "",
    tags: [],
    status: r.is_published ? "published" : "draft",
    visibility: "public",
    isFeatured: false,
    featuredUntil: "",
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export const useTeacherCourseStore = create<TeacherCourseState>()((set, get) => ({
  courses: [],
  isLoading: false,

  createCourse: async (data) => {
    if (!data.teacherId) return null;
    const payload = {
      title: data.title,
      slug: slugify(data.title),
      subject: data.subject,
      grade: data.grade || "All Levels",
      teacher_id: data.teacherId,
      description: data.description || null,
      thumbnail_url: data.coverImageUrl || null,
      is_published: data.status === "published",
    };
    try {
      const courseRead = await createCourseApi(payload);
      const course = toCourse(courseRead);
      set((state) => ({ courses: [course, ...state.courses] }));
      return course;
    } catch {
      return null;
    }
  },

  loadCourses: async (teacherId) => {
    set({ isLoading: true });
    try {
      const apiCourses = await listMyCourses(teacherId);
      set({ courses: apiCourses.map(toCourse), isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updateCourse: (courseId, data) => {
    set((state) => ({
      courses: state.courses.map((c) =>
        c.id === courseId ? { ...c, ...data, updatedAt: new Date().toISOString() } : c,
      ),
    }));
  },

  deleteCourse: (courseId) => {
    set((state) => ({ courses: state.courses.filter((c) => c.id !== courseId) }));
  },

  publishCourse: (courseId) => {
    get().updateCourse(courseId, { status: "published" });
  },

  unpublishCourse: (courseId) => {
    get().updateCourse(courseId, { status: "draft" });
  },

  archiveCourse: (courseId) => {
    get().updateCourse(courseId, { status: "archived" });
  },

  featureCourse: (courseId) => {
    get().updateCourse(courseId, { visibility: "public" });
  },
}));

export function listCourses(): TeacherCourse[] {
  return useTeacherCourseStore.getState().courses;
}

export function getCourseById(courseId: string): TeacherCourse | undefined {
  return useTeacherCourseStore.getState().courses.find((c) => c.id === courseId);
}

export function getPublishedPublicCourses(): TeacherCourse[] {
  return useTeacherCourseStore.getState().courses.filter(
    (c) => c.status === "published" && c.visibility === "public",
  );
}
