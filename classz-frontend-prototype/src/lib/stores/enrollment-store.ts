import { create } from "zustand";
import { persist } from "zustand/middleware";
import { enrolledCourses } from "../mock";

const mockEnrolledIds = new Set(enrolledCourses.map((c) => c.id));

interface EnrollmentState {
  enrolledCourseIds: string[];
  enroll: (courseId: string) => void;
  isEnrolled: (courseId: string) => boolean;
}

export const useEnrollmentStore = create<EnrollmentState>()(
  persist(
    (set, get) => ({
      enrolledCourseIds: [],

      enroll: (courseId) => {
        set((state) => ({
          enrolledCourseIds: [...new Set([...state.enrolledCourseIds, courseId])],
        }));
      },

      isEnrolled: (courseId) => {
        return mockEnrolledIds.has(courseId) || get().enrolledCourseIds.includes(courseId);
      },
    }),
    { name: "classz-enrollments" },
  ),
);
