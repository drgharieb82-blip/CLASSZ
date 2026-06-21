import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useTeacherCourseStore, type CountryPrice } from "@/lib/teacher/teacher-course-store";
import { COUNTRIES } from "@/lib/i18n/countries";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/teacher/courses/create")({
  component: CreateCoursePage,
});

const SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "English", "Arabic", "CS", "History"];
const GRADES = ["Grade 10", "Grade 11", "Grade 12"];
const EMOJIS = ["📐", "⚛️", "🧪", "📚", "🧬", "💻", "🕌", "🏛️", "🎯", "🔬", "📊", "🎨"];
const COLORS = [
  "from-violet-500 to-blue-500", "from-blue-500 to-cyan-500", "from-emerald-500 to-teal-500",
  "from-pink-500 to-rose-500", "from-green-500 to-emerald-500", "from-slate-500 to-blue-500",
  "from-amber-500 to-orange-500", "from-orange-500 to-red-500",
];

function CreateCoursePage() {
  const navigate = useNavigate();
  const createCourse = useTeacherCourseStore((s) => s.createCourse);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("📘");
  const [color, setColor] = useState(COLORS[0]);
  const [price, setPrice] = useState("0");
  const [currency, setCurrency] = useState("USD");
  const [visibility, setVisibility] = useState<"public" | "private" | "unlisted">("public");
  const [countryPrices, setCountryPrices] = useState<CountryPrice[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    if (!subject) e.subject = "Subject is required";
    if (!grade) e.grade = "Grade is required";
    if (Number(price) < 0) e.price = "Price must be 0 or more";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (publish: boolean) => {
    if (!validate()) return;
    createCourse({
      title: title.trim(),
      subject,
      grade,
      description: description.trim(),
      coverEmoji: emoji,
      coverColor: color,
      price: Number(price),
      currency,
      countryPrices,
      visibility,
      status: publish ? "published" : "draft",
    });
    navigate({ to: "/teacher/courses" });
  };

  const addCountryPrice = () => {
    setCountryPrices([...countryPrices, { countryCode: "EG", currency: "EGP", price: 0 }]);
  };

  const updateCountryPrice = (index: number, field: keyof CountryPrice, value: string | number) => {
    const updated = [...countryPrices];
    if (field === "countryCode") {
      const country = COUNTRIES.find((c) => c.code === value);
      updated[index] = { ...updated[index], countryCode: value as string, currency: country?.currencyCode ?? "USD" };
    } else if (field === "price") {
      updated[index] = { ...updated[index], price: Number(value) };
    }
    setCountryPrices(updated);
  };

  const removeCountryPrice = (index: number) => {
    setCountryPrices(countryPrices.filter((_, i) => i !== index));
  };

  return (
    <DashPage role="teacher" title="Create Course" subtitle="Set up a new course for your students" icon={ROLES.teacher.icon}>
      <Link to="/teacher/courses" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to My Courses
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main Form */}
        <div className="space-y-6">
          <Card className="border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Basic Information</h3>
            <div className="space-y-1.5">
              <Label htmlFor="title">Course Title *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Advanced Mathematics" className="rounded-xl" />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Subject *</Label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full h-10 rounded-xl border bg-card px-3 text-sm">
                  <option value="">Select subject</option>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Grade *</Label>
                <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full h-10 rounded-xl border bg-card px-3 text-sm">
                  <option value="">Select grade</option>
                  {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                {errors.grade && <p className="text-xs text-destructive">{errors.grade}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what students will learn..." rows={4} className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none" />
            </div>
          </Card>

          {/* Pricing */}
          <Card className="border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Pricing</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Base Price (USD)</Label>
                <Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="rounded-xl" />
                {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
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

            {/* Country Pricing */}
            <div>
              <div className="flex items-center justify-between">
                <Label>Country-Specific Pricing</Label>
                <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={addCountryPrice}>+ Add Country</Button>
              </div>
              {countryPrices.length > 0 && (
                <div className="mt-3 space-y-2">
                  {countryPrices.map((cp, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select value={cp.countryCode} onChange={(e) => updateCountryPrice(i, "countryCode", e.target.value)} className="h-9 rounded-lg border bg-card px-2 text-xs flex-1">
                        {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.currencyCode})</option>)}
                      </select>
                      <Input type="number" min="0" value={cp.price} onChange={(e) => updateCountryPrice(i, "price", e.target.value)} className="w-24 rounded-lg h-9 text-xs" />
                      <span className="text-xs text-muted-foreground w-8">{cp.currency}</span>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => removeCountryPrice(i)}>×</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cover */}
          <Card className="border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Cover</h3>
            <div className={cn("mx-auto grid h-24 w-24 place-items-center rounded-2xl bg-gradient-to-br text-4xl", color)}>
              {emoji}
            </div>
            <div>
              <Label className="text-xs">Emoji</Label>
              <div className="mt-1 grid grid-cols-6 gap-1">
                {EMOJIS.map((e) => (
                  <button key={e} onClick={() => setEmoji(e)} className={cn("grid h-8 w-8 place-items-center rounded-lg text-lg transition-colors", emoji === e ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-accent")}>{e}</button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">Color</Label>
              <div className="mt-1 grid grid-cols-4 gap-1">
                {COLORS.map((c) => (
                  <button key={c} onClick={() => setColor(c)} className={cn("h-6 rounded-lg bg-gradient-to-r transition-all", c, color === c && "ring-2 ring-primary ring-offset-2")} />
                ))}
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card className="border bg-card p-5 space-y-3">
            <Button onClick={() => handleSave(true)} className="w-full rounded-xl gradient-brand border-0 text-white">
              <Upload className="me-1.5 h-4 w-4" /> Publish Course
            </Button>
            <Button onClick={() => handleSave(false)} variant="outline" className="w-full rounded-xl">
              <Save className="me-1.5 h-4 w-4" /> Save as Draft
            </Button>
            <Button asChild variant="ghost" className="w-full rounded-xl">
              <Link to="/teacher/courses">Cancel</Link>
            </Button>
          </Card>
        </div>
      </div>
    </DashPage>
  );
}
