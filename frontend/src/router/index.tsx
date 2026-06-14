import { createBrowserRouter, Navigate } from "react-router-dom";

import { AdminLayout } from "../layouts/AdminLayout";
import { AssistantLayout } from "../layouts/AssistantLayout";
import { ParentLayout } from "../layouts/ParentLayout";
import { StudentLayout } from "../layouts/StudentLayout";
import { TeacherLayout } from "../layouts/TeacherLayout";
import { AssignmentDetailsPage, AssignmentSubmissionPage, AssignmentsPage } from "../modules/assignments";
import { LoginPage, LoginRedirect, ProtectedRoute } from "../modules/auth";
import { CourseDetailsPage } from "../modules/courses/CourseDetailsPage";
import { CourseListPage } from "../modules/courses/CourseListPage";
import {
  AdminDashboardPage,
  AssistantTeacherDashboardPage,
  DashboardPage,
  ModulePlaceholderPage,
  ParentDashboardPage,
  StudentDashboardPage,
} from "../modules/dashboard";
import { GradeDetailsPage, ManualGradingPage } from "../modules/grading";
import { LessonBuilderPage } from "../modules/lesson-builder";
import { LessonPage } from "../modules/lessons/LessonPage";
import { QuestionBankPage, QuestionDetailsPage } from "../modules/question-bank";
import { QuizPlayerPage } from "../modules/quiz-player";
import { QuizBuilderPage } from "../modules/quizzes";
import { QuizResultsPage } from "../modules/results";
import { TeacherDashboardPage } from "../modules/teacher-dashboard";
import { VideoPlayerPage } from "../modules/videos";

const adminChildren = [
  { index: true, element: <DashboardPage /> },
  { path: "assignments", element: <AssignmentsPage /> },
  { path: "assignments/:assignmentId", element: <AssignmentDetailsPage /> },
  { path: "assignments/:assignmentId/submit", element: <AssignmentSubmissionPage /> },
  { path: "grading", element: <ManualGradingPage /> },
  { path: "grading/:gradeId", element: <GradeDetailsPage /> },
  { path: "courses", element: <CourseListPage /> },
  { path: "courses/:courseId", element: <CourseDetailsPage /> },
  { path: "courses/:courseId/lessons/:lessonId", element: <LessonPage /> },
  { path: "courses/:courseId/lessons/:lessonId/builder", element: <LessonBuilderPage /> },
  { path: "lesson-builder", element: <LessonBuilderPage /> },
  { path: "videos/:videoId", element: <VideoPlayerPage /> },
  { path: "question-bank", element: <QuestionBankPage /> },
  { path: "question-bank/:questionId", element: <QuestionDetailsPage /> },
  { path: "quizzes/builder", element: <QuizBuilderPage /> },
  { path: "quizzes/:quizId/player", element: <QuizPlayerPage /> },
  { path: "quiz-attempts/:attemptId/results", element: <QuizResultsPage /> },
  { path: "people", element: <ModulePlaceholderPage name="People" /> },
  { path: "learning", element: <ModulePlaceholderPage name="Learning" /> },
];

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <LoginRedirect>
        <LoginPage />
      </LoginRedirect>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: adminChildren,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <AdminDashboardPage /> }],
  },
  {
    path: "/teacher",
    element: (
      <ProtectedRoute>
        <TeacherLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <TeacherDashboardPage /> }],
  },
  {
    path: "/assistant",
    element: (
      <ProtectedRoute>
        <AssistantLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <AssistantTeacherDashboardPage /> }],
  },
  {
    path: "/student",
    element: (
      <ProtectedRoute>
        <StudentLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <StudentDashboardPage /> }],
  },
  {
    path: "/parent",
    element: (
      <ProtectedRoute>
        <ParentLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <ParentDashboardPage /> }],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);
