import { type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, FolderOpen, Layout } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import type { EnrolledCourse } from "@/lib/mock";

interface CourseWorkspaceLayoutProps {
  courseId: string;
  course: EnrolledCourse;
  children: ReactNode;
}

const TABS = [
  { id: "overview", label: "Overview", labelAr: "نظرة عامة", icon: Layout, path: "" },
  { id: "session", label: "Current Session", labelAr: "الجلسة الحالية", icon: BookOpen, path: "/session" },
  { id: "resources", label: "Resources", labelAr: "الموارد", icon: FolderOpen, path: "/resources" },
] as const;

export function CourseWorkspaceLayout({ courseId, course, children }: CourseWorkspaceLayoutProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <DashboardLayout role="student">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        {/* Course header */}
        <div className="flex items-center gap-3">
          <Link
            to="/student/courses"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-lg", course.color)}>
            {course.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold text-white">{course.name}</h1>
            <p className="text-sm text-slate-400">{course.teacher}</p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
              <div
                className={cn("h-full rounded-full bg-gradient-to-r", course.color)}
                style={{ width: `${course.progress}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-300">{course.progress}%</span>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 rounded-2xl border border-white/8 bg-white/[0.03] p-1">
          {TABS.map((tab) => {
            const to = `/student/courses/${courseId}${tab.path}`;
            const isActive = tab.path === ""
              ? pathname === `/student/courses/${courseId}`
              : pathname.startsWith(to);

            return (
              <Link
                key={tab.id}
                to={to}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-violet-500/20 text-white shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200",
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Tab content */}
        {children}
      </motion.div>
    </DashboardLayout>
  );
}
