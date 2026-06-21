import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CountryPrice {
  countryCode: string;
  currency: string;
  price: number;
}

export type CourseStatus = "draft" | "published" | "archived";
export type CourseVisibility = "public" | "private" | "unlisted";

export interface TeacherCourse {
  id: string;
  publicCode: string;
  title: string;
  slug: string;
  subject: string;
  grade: string;
  description: string;
  teacherId: string;
  teacherName: string;
  teacherPublicCode: string;
  coverEmoji: string;
  coverColor: string;
  price: number;
  currency: string;
  countryPrices: CountryPrice[];
  status: CourseStatus;
  visibility: CourseVisibility;
  enrollmentCount: number;
  revenue: number;
  rating: number;
  lessonsCount: number;
  hoursCount: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateCourseData = Pick<TeacherCourse,
  "title" | "subject" | "grade" | "description" | "coverEmoji" | "coverColor" |
  "price" | "currency" | "countryPrices" | "visibility"
> & { status?: CourseStatus };

interface TeacherCourseState {
  courses: TeacherCourse[];
  createCourse: (data: CreateCourseData) => TeacherCourse;
  updateCourse: (courseId: string, data: Partial<TeacherCourse>) => void;
  deleteCourse: (courseId: string) => void;
  publishCourse: (courseId: string) => void;
  unpublishCourse: (courseId: string) => void;
  archiveCourse: (courseId: string) => void;
  featureCourse: (courseId: string) => void;
}

let codeCounter = 20;

function generateCourseId(): string {
  return `tc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function generatePublicCode(): string {
  codeCounter++;
  return `CRS-26-${codeCounter.toString().padStart(4, "0")}`;
}

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const useTeacherCourseStore = create<TeacherCourseState>()(
  persist(
    (set, get) => ({
      courses: [],

      createCourse: (data) => {
        const now = new Date().toISOString();
        const course: TeacherCourse = {
          id: generateCourseId(),
          publicCode: generatePublicCode(),
          title: data.title,
          slug: slugify(data.title),
          subject: data.subject,
          grade: data.grade,
          description: data.description,
          teacherId: "TCH-26-0001",
          teacherName: "Dr. Layla Hassan",
          teacherPublicCode: "TCH-26-0001",
          coverEmoji: data.coverEmoji || "📘",
          coverColor: data.coverColor || "from-violet-500 to-blue-500",
          price: data.price,
          currency: data.currency || "USD",
          countryPrices: data.countryPrices || [],
          status: data.status || "draft",
          visibility: data.visibility || "public",
          enrollmentCount: 0,
          revenue: 0,
          rating: 0,
          lessonsCount: 0,
          hoursCount: 0,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ courses: [course, ...state.courses] }));
        return course;
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
    }),
    { name: "classz-teacher-courses" },
  ),
);

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
