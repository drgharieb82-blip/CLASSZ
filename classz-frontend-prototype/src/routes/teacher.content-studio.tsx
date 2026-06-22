import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, FolderTree, HelpCircle, ClipboardList, FileText, Pencil, PlayCircle, ScrollText } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useTeacherCourseStore } from "@/lib/teacher/teacher-course-store";

export const Route = createFileRoute("/teacher/content-studio")({
  component: ContentStudioPage,
});

const TABS = [
  { key: "tree", label: "Content Tree", icon: FolderTree },
  { key: "sessions", label: "Sessions", icon: PlayCircle },
  { key: "materials", label: "Materials", icon: FileText },
  { key: "questions", label: "Questions", icon: HelpCircle },
  { key: "quizzes", label: "Quizzes", icon: ClipboardList },
  { key: "homework", label: "Homework", icon: Pencil },
  { key: "exams", label: "Exams", icon: ScrollText },
  { key: "assignments", label: "Assignments", icon: BookOpen },
];

function ContentStudioPage() {
  const courses = useTeacherCourseStore((s) => s.courses);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [activeTab, setActiveTab] = useState("materials");

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <DashPage role="teacher" title="Content Studio" subtitle="Build, organize, reuse, and publish your complete course content" icon={ROLES.teacher.icon}>
      {/* Course Selector */}
      <Card className="border bg-card p-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Current Course:</span>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="h-9 flex-1 max-w-sm rounded-xl border bg-card px-3 text-sm font-medium"
          >
            <option value="">Select a course...</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title} ({c.publicCode})</option>
            ))}
          </select>
          {selectedCourse && (
            <Badge variant="outline" className="rounded-full text-xs">{selectedCourse.status}</Badge>
          )}
          <Button asChild variant="outline" size="sm" className="rounded-xl ms-auto">
            <Link to="/teacher/courses/create">+ New Course</Link>
          </Button>
        </div>
      </Card>

      {!selectedCourseId ? (
        <Card className="flex flex-col items-center gap-4 border bg-card p-16 text-center">
          <FolderTree className="h-14 w-14 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Choose a course to start building content</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Select a course to manage its content tree, sessions, materials, questions, quizzes, exams and assignments.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl" onClick={() => { if (courses.length > 0) setSelectedCourseId(courses[0].id); }}>
              Select Course
            </Button>
            <Button asChild className="rounded-xl gradient-brand border-0 text-white">
              <Link to="/teacher/courses/create">Create New Course</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto border-b pb-px">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={cn("flex items-center gap-1.5 whitespace-nowrap rounded-t-lg px-3 py-2 text-sm font-medium transition-colors", activeTab === t.key ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground")}
              >
                <t.icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "tree" && <TabPlaceholder title="Content Tree" desc="Manage course structure: chapters, lessons, concepts, atomic concepts." link="/teacher/courses" linkParams={{ courseId: selectedCourseId }} linkLabel="Manage Chapters" linkTo={`/teacher/courses/${selectedCourseId}/chapters`} />}
          {activeTab === "sessions" && <TabPlaceholder title="Sessions" desc="Create and manage learning sessions for this course." link="/teacher/courses" linkParams={{ courseId: selectedCourseId }} linkLabel="Manage Sessions" linkTo={`/teacher/courses/${selectedCourseId}/sessions`} />}
          {activeTab === "materials" && <TabPlaceholder title="Materials" desc="Upload videos, PDFs, worksheets. Reuse across sessions." link="/teacher/materials" linkLabel="Open Material Library" linkTo="/teacher/materials" />}
          {activeTab === "questions" && <TabPlaceholder title="Question Bank" desc="Create MCQ, essay, and calculation questions for this course." link="/teacher/questions" linkLabel="Open Question Bank" linkTo="/teacher/questions" />}
          {activeTab === "quizzes" && <TabPlaceholder title="Quizzes" desc="Build quizzes from your question bank." link="/teacher/quizzes" linkLabel="Open Quizzes" linkTo="/teacher/quizzes" />}
          {activeTab === "homework" && <TabPlaceholder title="Homework" desc="Create worksheets, essays, and file upload assignments." link="/teacher/homework" linkLabel="Open Homework" linkTo="/teacher/homework" />}
          {activeTab === "exams" && <TabPlaceholder title="Exams" desc="Build formal exams with teacher-controlled XP." link="/teacher/exams" linkLabel="Open Exams" linkTo="/teacher/exams" />}
          {activeTab === "assignments" && <TabPlaceholder title="Assignments" desc="Create projects, research tasks, and presentations." linkLabel="Manage Assignments" linkTo="/teacher/assignments" />}
        </>
      )}
    </DashPage>
  );
}

function TabPlaceholder({ title, desc, linkLabel, linkTo }: { title: string; desc: string; link?: string; linkParams?: any; linkLabel: string; linkTo: string }) {
  return (
    <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{desc}</p>
      <Button asChild variant="outline" className="rounded-xl">
        <Link to={linkTo}>{linkLabel}</Link>
      </Button>
    </Card>
  );
}
