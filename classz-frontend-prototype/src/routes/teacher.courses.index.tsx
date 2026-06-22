import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { BookOpen, DollarSign, FolderTree, HelpCircle, Pencil, PlayCircle, Plus, Star, Trash2, Upload, Users, UserCog } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { FilterBar, type FilterOption } from "@/components/filters/FilterBar";
import { Pagination } from "@/components/filters/Pagination";
import { useTeacherCourseStore, type TeacherCourse } from "@/lib/teacher/teacher-course-store";
import { listChapters } from "@/lib/teacher/teacher-chapter-store";
import { listSessions } from "@/lib/teacher/teacher-session-store";
import { teacherTeam } from "@/lib/teacherMock";

export const Route = createFileRoute("/teacher/courses/")({
  component: TeacherCoursesPage,
});

const PAGE_SIZE = 10;

const filterOptions: FilterOption[] = [
  { key: "status", label: "Status", options: [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
  ]},
  { key: "visibility", label: "Visibility", options: [
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
    { value: "unlisted", label: "Unlisted" },
  ]},
  { key: "subject", label: "Subject", options: [
    { value: "Math", label: "Math" },
    { value: "Physics", label: "Physics" },
    { value: "Chemistry", label: "Chemistry" },
    { value: "Biology", label: "Biology" },
    { value: "English", label: "English" },
    { value: "Arabic", label: "Arabic" },
    { value: "CS", label: "Computer Science" },
    { value: "History", label: "History" },
  ]},
  { key: "grade", label: "Grade", options: [
    { value: "Grade 10", label: "Grade 10" },
    { value: "Grade 11", label: "Grade 11" },
    { value: "Grade 12", label: "Grade 12" },
  ]},
];

const statusColors: Record<string, string> = {
  draft: "border-amber-300 text-amber-600",
  published: "border-emerald-300 text-emerald-600",
  archived: "border-slate-300 text-slate-500",
};

function TeacherCoursesPage() {
  const courses = useTeacherCourseStore((s) => s.courses);
  const publishCourse = useTeacherCourseStore((s) => s.publishCourse);
  const unpublishCourse = useTeacherCourseStore((s) => s.unpublishCourse);
  const deleteCourse = useTeacherCourseStore((s) => s.deleteCourse);
  const archiveCourse = useTeacherCourseStore((s) => s.archiveCourse);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...courses];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.title.toLowerCase().includes(q) || c.publicCode.includes(q));
    }
    if (filters.status) result = result.filter((c) => c.status === filters.status);
    if (filters.visibility) result = result.filter((c) => c.visibility === filters.visibility);
    if (filters.subject) result = result.filter((c) => c.subject === filters.subject);
    if (filters.grade) result = result.filter((c) => c.grade === filters.grade);
    return result;
  }, [courses, search, filters]);

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  return (
    <DashPage role="teacher" title="My Courses" subtitle="Create, manage, and publish your courses" icon={ROLES.teacher.icon}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="rounded-full">{courses.length} courses</Badge>
          <Badge variant="outline" className="rounded-full text-emerald-600 border-emerald-300">
            {courses.filter((c) => c.status === "published").length} published
          </Badge>
        </div>
        <Button asChild className="rounded-xl gradient-brand border-0 text-white" size="sm">
          <Link to="/teacher/courses/create">
            <Plus className="me-1.5 h-4 w-4" /> Create Course
          </Link>
        </Button>
      </div>

      <FilterBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        filters={filterOptions}
        activeFilters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={() => { setFilters({}); setPage(1); }}
        totalResults={total}
        placeholder="Search by title or course code..."
      />

      {total === 0 && courses.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">No courses yet</h2>
          <p className="text-sm text-muted-foreground">Create your first course to start teaching on CLASSZ.</p>
          <Button asChild className="rounded-xl gradient-brand border-0 text-white">
            <Link to="/teacher/courses/create"><Plus className="me-1.5 h-4 w-4" /> Create Course</Link>
          </Button>
        </Card>
      ) : total === 0 ? (
        <Card className="border bg-card p-8 text-center">
          <p className="text-muted-foreground">No courses match your filters.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {paginated.map((course) => (
            <CourseRow
              key={course.id}
              course={course}
              onPublish={() => publishCourse(course.id)}
              onUnpublish={() => unpublishCourse(course.id)}
              onArchive={() => archiveCourse(course.id)}
              onDelete={() => deleteCourse(course.id)}
            />
          ))}
        </div>
      )}

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </DashPage>
  );
}

function CourseRow({ course, onPublish, onUnpublish, onArchive, onDelete }: {
  course: TeacherCourse;
  onPublish: () => void;
  onUnpublish: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const chapters = listChapters(course.id);
  const sessions = listSessions(course.id);
  const assistantName = course.assignedAssistant ? teacherTeam.find((t) => t.id === course.assignedAssistant)?.name : null;
  const cmName = course.assignedContentManager ? teacherTeam.find((t) => t.id === course.assignedContentManager)?.name : null;

  return (
    <Card className="border bg-card p-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-3xl", course.coverColor)}>
          {course.coverEmoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-lg font-bold truncate">{course.title}</p>
            <Badge variant="outline" className={cn("rounded-full text-xs", statusColors[course.status])}>{course.status}</Badge>
            {course.visibility !== "public" && <Badge variant="outline" className="rounded-full text-xs">{course.visibility}</Badge>}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{course.publicCode} · {course.subject} · {course.grade} · {course.language || "Arabic"}</p>
          {course.shortDescription && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{course.shortDescription}</p>}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button asChild variant="outline" size="sm" className="rounded-lg text-xs h-8">
            <Link to="/teacher/courses/$courseId/edit" params={{ courseId: course.id }}><Pencil className="me-1 h-3 w-3" /> Edit</Link>
          </Button>
          {course.status === "draft" && <Button variant="outline" size="sm" className="rounded-lg text-xs h-8" onClick={onPublish}>Publish</Button>}
          {course.status === "published" && <Button variant="outline" size="sm" className="rounded-lg text-xs h-8" onClick={onUnpublish}>Unpublish</Button>}
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
          <Users className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          <div><p className="text-sm font-bold">{course.enrollmentCount}</p><p className="text-xs text-muted-foreground">Students</p></div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
          <DollarSign className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <div><p className="text-sm font-bold">${course.revenue}</p><p className="text-xs text-muted-foreground">Revenue</p></div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
          <FolderTree className="h-3.5 w-3.5 text-violet-500 shrink-0" />
          <div><p className="text-sm font-bold">{chapters.length}</p><p className="text-xs text-muted-foreground">Chapters</p></div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
          <PlayCircle className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
          <div><p className="text-sm font-bold">{sessions.length}</p><p className="text-xs text-muted-foreground">Sessions</p></div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
          <Star className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <div><p className="text-sm font-bold">{course.rating || "—"}</p><p className="text-xs text-muted-foreground">Rating</p></div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
          <DollarSign className="h-3.5 w-3.5 text-primary shrink-0" />
          <div><p className="text-sm font-bold">${course.price}</p><p className="text-xs text-muted-foreground">Price</p></div>
        </div>
      </div>

      {/* Team + Quick Links */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {assistantName && <span className="flex items-center gap-1"><UserCog className="h-3 w-3" /> Assistant: <strong className="text-foreground">{assistantName}</strong></span>}
        {cmName && <span className="flex items-center gap-1"><UserCog className="h-3 w-3" /> Content: <strong className="text-foreground">{cmName}</strong></span>}
        {course.tags && course.tags.length > 0 && <span>{course.tags.join(", ")}</span>}
        <Link to="/teacher/courses/$courseId/chapters" params={{ courseId: course.id }} className="text-primary hover:underline">Chapters →</Link>
        <Link to="/teacher/courses/$courseId/sessions" params={{ courseId: course.id }} className="text-primary hover:underline">Sessions →</Link>
      </div>
    </Card>
  );
}
