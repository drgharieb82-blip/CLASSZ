import { createBrowserRouter, Navigate } from "react-router-dom";

import { AdminLayout } from "../layouts/AdminLayout";
import { ParentLayout } from "../layouts/ParentLayout";
import { StudentLayout } from "../layouts/StudentLayout";
import { TeacherLayout } from "../layouts/TeacherLayout";
import { DashboardPage } from "../modules/dashboard/DashboardPage";
import { ModulePlaceholderPage } from "../modules/dashboard/ModulePlaceholderPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "courses", element: <ModulePlaceholderPage name="Courses" /> },
      { path: "people", element: <ModulePlaceholderPage name="People" /> },
      { path: "learning", element: <ModulePlaceholderPage name="Learning" /> },
    ],
  },
  {
    path: "/teacher",
    element: <TeacherLayout />,
    children: [{ index: true, element: <DashboardPage /> }],
  },
  {
    path: "/student",
    element: <StudentLayout />,
    children: [{ index: true, element: <DashboardPage /> }],
  },
  {
    path: "/parent",
    element: <ParentLayout />,
    children: [{ index: true, element: <DashboardPage /> }],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
