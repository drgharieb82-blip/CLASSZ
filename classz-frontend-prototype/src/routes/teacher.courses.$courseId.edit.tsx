import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Save, Shield, Upload } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useTeacherCourseStore, getCourseById, type CountryPrice } from "@/lib/teacher/teacher-course-store";
import { COUNTRIES } from "@/lib/i18n/countries";

export const Route = createFileRoute("/teacher/courses/$courseId/edit")({
  component: EditCoursePage,
});

const SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "English", "Arabic", "CS", "History"];
const GRADES = ["Grade 10", "Grade 11", "Grade 12"];
const EMOJIS = ["📐", "⚛️", "🧪", "📚", "🧬", "💻", "🕌", "🏛️", "🎯", "🔬", "📊", "🎨"];
const COLORS = [
  "from-violet-500 to-blue-500", "from-blue-500 to-cyan-500", "from-emerald-500 to-teal-500",
  "from-pink-500 to-rose-500", "from-green-500 to-emerald-500", "from-slate-500 to-blue-500",
  "from-amber-500 to-orange-500", "from-orange-500 to-red-500",
];

function EditCoursePage() {
  const { courseId } = Route.useParams();
  const navigate = useNavigate();
  const course = getCourseById(courseId);
  const updateCourse = useTeacherCourseStore((s) => s.updateCourse);
  const publishCourse = useTeacherCourseStore((s) => s.publishCourse);
  const unpublishCourse = useTeacherCourseStore((s) => s.unpublishCourse);
  const archiveCourse = useTeacherCourseStore((s) => s.archiveCourse);

  const [title, setTitle] = useState(course?.title ?? "");
  const [subject, setSubject] = useState(course?.subject ?? "");
  const [grade, setGrade] = useState(course?.grade ?? "");
  const [description, setDescription] = useState(course?.description ?? "");
  const [emoji, setEmoji] = useState(course?.coverEmoji ?? "📘");
  const [color, setColor] = useState(course?.coverColor ?? COLORS[0]);
  const [price, setPrice] = useState(String(course?.price ?? 0));
  const [visibility, setVisibility] = useState(course?.visibility ?? "public");
  const [countryPrices, setCountryPrices] = useState<CountryPrice[]>(course?.countryPrices ?? []);
  const [saved, setSaved] = useState(false);

  if (!course) {
    return (
      <DashPage role="teacher" title="Course Not Found" subtitle="" icon={ROLES.teacher.icon}>
        <Card className="flex flex-col items-center gap-4 border bg-card p-12 text-center">
          <Shield className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Course not found</h2>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/teacher/courses">Back to My Courses</Link>
          </Button>
        </Card>
      </DashPage>
    );
  }

  const handleSave = () => {
    updateCourse(courseId, {
      title: title.trim(),
      subject,
      grade,
      description: description.trim(),
      coverEmoji: emoji,
      coverColor: color,
      price: Number(price),
      visibility: visibility as any,
      countryPrices,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePublish = () => { publishCourse(courseId); navigate({ to: "/teacher/courses" }); };
  const handleUnpublish = () => { unpublishCourse(courseId); navigate({ to: "/teacher/courses" }); };
  const handleArchive = () => { archiveCourse(courseId); navigate({ to: "/teacher/courses" }); };

  const addCountryPrice = () => {
    setCountryPrices([...countryPrices, { countryCode: "EG", currency: "EGP", price: 0 }]);
  };

  const updateCP = (index: number, field: keyof CountryPrice, value: string | number) => {
    const updated = [...countryPrices];
    if (field === "countryCode") {
      const country = COUNTRIES.find((c) => c.code === value);
      updated[index] = { ...updated[index], countryCode: value as string, currency: country?.currencyCode ?? "USD" };
    } else if (field === "price") {
      updated[index] = { ...updated[index], price: Number(value) };
    }
    setCountryPrices(updated);
  };

  return (
    <DashPage role="teacher" title={`Edit: ${course.title}`} subtitle={course.publicCode} icon={ROLES.teacher.icon}>
      <div className="flex items-center justify-between">
        <Link to="/teacher/courses" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to My Courses
        </Link>
        <Badge variant="outline" className={cn("rounded-full text-xs", course.status === "published" ? "border-emerald-300 text-emerald-600" : "border-amber-300 text-amber-600")}>
          {course.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Basic Information</h3>
            <div className="space-y-1.5">
              <Label htmlFor="title">Course Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full h-10 rounded-xl border bg-card px-3 text-sm">
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Grade</Label>
                <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full h-10 rounded-xl border bg-card px-3 text-sm">
                  {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none" />
            </div>
          </Card>

          <Card className="border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Pricing</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Base Price (USD)</Label>
                <Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>Visibility</Label>
                <select value={visibility} onChange={(e) => setVisibility(e.target.value as any)} className="w-full h-10 rounded-xl border bg-card px-3 text-sm">
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="unlisted">Unlisted</option>
                </select>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label>Country-Specific Pricing</Label>
                <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={addCountryPrice}>+ Add Country</Button>
              </div>
              {countryPrices.length > 0 && (
                <div className="mt-3 space-y-2">
                  {countryPrices.map((cp, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select value={cp.countryCode} onChange={(e) => updateCP(i, "countryCode", e.target.value)} className="h-9 rounded-lg border bg-card px-2 text-xs flex-1">
                        {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.currencyCode})</option>)}
                      </select>
                      <Input type="number" min="0" value={cp.price} onChange={(e) => updateCP(i, "price", e.target.value)} className="w-24 rounded-lg h-9 text-xs" />
                      <span className="text-xs text-muted-foreground w-8">{cp.currency}</span>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setCountryPrices(countryPrices.filter((_, j) => j !== i))}>×</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Cover</h3>
            <div className={cn("mx-auto grid h-24 w-24 place-items-center rounded-2xl bg-gradient-to-br text-4xl", color)}>
              {emoji}
            </div>
            <div>
              <Label className="text-xs">Emoji</Label>
              <div className="mt-1 grid grid-cols-6 gap-1">
                {EMOJIS.map((e) => (
                  <button key={e} onClick={() => setEmoji(e)} className={cn("grid h-8 w-8 place-items-center rounded-lg text-lg", emoji === e ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-accent")}>{e}</button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">Color</Label>
              <div className="mt-1 grid grid-cols-4 gap-1">
                {COLORS.map((c) => (
                  <button key={c} onClick={() => setColor(c)} className={cn("h-6 rounded-lg bg-gradient-to-r", c, color === c && "ring-2 ring-primary ring-offset-2")} />
                ))}
              </div>
            </div>
          </Card>

          <Card className="border bg-card p-5 space-y-3">
            <Button onClick={handleSave} className="w-full rounded-xl gradient-brand border-0 text-white">
              <Save className="me-1.5 h-4 w-4" /> {saved ? "Saved!" : "Save Changes"}
            </Button>
            {course.status === "draft" && (
              <Button onClick={handlePublish} variant="outline" className="w-full rounded-xl">
                <Upload className="me-1.5 h-4 w-4" /> Publish
              </Button>
            )}
            {course.status === "published" && (
              <Button onClick={handleUnpublish} variant="outline" className="w-full rounded-xl">Unpublish</Button>
            )}
            <Button onClick={handleArchive} variant="ghost" className="w-full rounded-xl text-muted-foreground">Archive</Button>
          </Card>

          <Card className="border bg-card p-4 text-xs text-muted-foreground space-y-1">
            <p><strong>ID:</strong> {course.id}</p>
            <p><strong>Code:</strong> {course.publicCode}</p>
            <p><strong>Created:</strong> {new Date(course.createdAt).toLocaleDateString()}</p>
            <p><strong>Updated:</strong> {new Date(course.updatedAt).toLocaleDateString()}</p>
          </Card>
        </div>
      </div>
    </DashPage>
  );
}
