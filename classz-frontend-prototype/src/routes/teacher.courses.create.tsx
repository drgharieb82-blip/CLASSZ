import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus, Save, Upload, X } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useTeacherCourseStore, type CountryPrice } from "@/lib/teacher/teacher-course-store";
import { COUNTRIES } from "@/lib/i18n/countries";
import { teacherTeam } from "@/lib/teacherMock";

export const Route = createFileRoute("/teacher/courses/create")({ component: CreateCoursePage });

const SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "English", "Arabic", "CS", "History"];
const GRADES = ["Grade 10", "Grade 11", "Grade 12"];
const EMOJIS = ["📐", "⚛️", "🧪", "📚", "🧬", "💻", "🕌", "🏛️", "🎯", "🔬", "📊", "🎨", "📘", "🧮", "🔭", "🎭"];
const COLORS = [
  "from-violet-500 to-blue-500", "from-blue-500 to-cyan-500", "from-emerald-500 to-teal-500",
  "from-pink-500 to-rose-500", "from-green-500 to-emerald-500", "from-slate-500 to-blue-500",
  "from-amber-500 to-orange-500", "from-orange-500 to-red-500",
];
const LANGUAGES = ["Arabic", "English", "French", "Arabic & English"];

function CreateCoursePage() {
  const navigate = useNavigate();
  const createCourse = useTeacherCourseStore((s) => s.createCourse);

  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [emoji, setEmoji] = useState("📘");
  const [color, setColor] = useState(COLORS[0]);
  const [previewVideo, setPreviewVideo] = useState("");
  const [price, setPrice] = useState("0");
  const [currency, setCurrency] = useState("USD");
  const [visibility, setVisibility] = useState<"public" | "private" | "unlisted">("public");
  const [language, setLanguage] = useState("Arabic");
  const [targetAudience, setTargetAudience] = useState("");
  const [countryPrices, setCountryPrices] = useState<CountryPrice[]>([]);
  const [outcomes, setOutcomes] = useState<string[]>([""]);
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [assistant, setAssistant] = useState("");
  const [contentManager, setContentManager] = useState("");
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
      title: title.trim(), subject, grade,
      description: description.trim(), shortDescription: shortDesc.trim(),
      coverEmoji: emoji, coverColor: color, previewVideoUrl: previewVideo,
      price: Number(price), currency, countryPrices, visibility, language,
      targetAudience, tags,
      outcomes: outcomes.filter((o) => o.trim()),
      requirements: requirements.filter((r) => r.trim()),
      assignedAssistant: assistant, assignedContentManager: contentManager,
      status: publish ? "published" : "draft",
    });
    navigate({ to: "/teacher/courses" });
  };

  const addTag = () => { if (tagInput.trim() && !tags.includes(tagInput.trim())) { setTags([...tags, tagInput.trim()]); setTagInput(""); } };
  const addCountryPrice = () => setCountryPrices([...countryPrices, { countryCode: "EG", currency: "EGP", price: 0 }]);
  const updateCP = (i: number, field: keyof CountryPrice, val: string | number) => {
    const u = [...countryPrices];
    if (field === "countryCode") { const c = COUNTRIES.find((x) => x.code === val); u[i] = { ...u[i], countryCode: val as string, currency: c?.currencyCode ?? "USD" }; }
    else if (field === "price") u[i] = { ...u[i], price: Number(val) };
    setCountryPrices(u);
  };

  return (
    <DashPage role="teacher" title="Create Course" subtitle="Everything students will see about this course" icon={ROLES.teacher.icon}>
      <Link to="/teacher/courses" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to My Courses</Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Basic Information</h3>
            <div className="space-y-1.5"><Label>Course Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Advanced Mathematics Grade 12" className="rounded-xl" />{errors.title && <p className="text-xs text-destructive">{errors.title}</p>}</div>
            <div className="space-y-1.5"><Label>Short Description (one line)</Label><Input value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="Master calculus, algebra, and geometry for Grade 12 exams" className="rounded-xl" /></div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5"><Label>Subject *</Label><select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full h-10 rounded-xl border bg-card px-3 text-sm"><option value="">Select</option>{SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}</select>{errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}</div>
              <div className="space-y-1.5"><Label>Grade *</Label><select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full h-10 rounded-xl border bg-card px-3 text-sm"><option value="">Select</option>{GRADES.map((g) => <option key={g} value={g}>{g}</option>)}</select>{errors.grade && <p className="text-xs text-destructive">{errors.grade}</p>}</div>
              <div className="space-y-1.5"><Label>Language</Label><select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full h-10 rounded-xl border bg-card px-3 text-sm">{LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}</select></div>
            </div>
            <div className="space-y-1.5"><Label>Full Description</Label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Detailed description of the course, what it covers, methodology..." className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none" /></div>
            <div className="space-y-1.5"><Label>Target Audience</Label><Input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="e.g. Grade 12 science students preparing for final exams" className="rounded-xl" /></div>
          </Card>

          {/* What Students Will Learn */}
          <Card className="border bg-card p-5 space-y-4">
            <h3 className="font-semibold">What Students Will Learn</h3>
            <p className="text-xs text-muted-foreground">These outcomes appear on the public course details page.</p>
            {outcomes.map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
                <Input value={o} onChange={(e) => { const u = [...outcomes]; u[i] = e.target.value; setOutcomes(u); }} placeholder="e.g. Solve complex differential equations" className="rounded-xl flex-1" />
                {outcomes.length > 1 && <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setOutcomes(outcomes.filter((_, j) => j !== i))}><X className="h-3.5 w-3.5" /></Button>}
              </div>
            ))}
            <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => setOutcomes([...outcomes, ""])}><Plus className="me-1 h-3 w-3" /> Add Outcome</Button>
          </Card>

          {/* Requirements */}
          <Card className="border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Prerequisites & Requirements</h3>
            {requirements.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={r} onChange={(e) => { const u = [...requirements]; u[i] = e.target.value; setRequirements(u); }} placeholder="e.g. Basic algebra knowledge" className="rounded-xl flex-1" />
                {requirements.length > 1 && <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setRequirements(requirements.filter((_, j) => j !== i))}><X className="h-3.5 w-3.5" /></Button>}
              </div>
            ))}
            <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => setRequirements([...requirements, ""])}><Plus className="me-1 h-3 w-3" /> Add Requirement</Button>
          </Card>

          {/* Pricing */}
          <Card className="border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Pricing</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5"><Label>Base Price (USD)</Label><Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="rounded-xl" />{errors.price && <p className="text-xs text-destructive">{errors.price}</p>}</div>
              <div className="space-y-1.5"><Label>Visibility</Label><select value={visibility} onChange={(e) => setVisibility(e.target.value as any)} className="w-full h-10 rounded-xl border bg-card px-3 text-sm"><option value="public">Public</option><option value="private">Private</option><option value="unlisted">Unlisted</option></select></div>
              <div className="space-y-1.5"><Label>Preview Video URL</Label><Input value={previewVideo} onChange={(e) => setPreviewVideo(e.target.value)} placeholder="https://..." className="rounded-xl" /></div>
            </div>
            <div>
              <div className="flex items-center justify-between"><Label>Country-Specific Pricing</Label><Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={addCountryPrice}>+ Country</Button></div>
              {countryPrices.length > 0 && <div className="mt-3 space-y-2">{countryPrices.map((cp, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select value={cp.countryCode} onChange={(e) => updateCP(i, "countryCode", e.target.value)} className="h-9 rounded-lg border bg-card px-2 text-xs flex-1">{COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.currencyCode})</option>)}</select>
                  <Input type="number" min="0" value={cp.price} onChange={(e) => updateCP(i, "price", e.target.value)} className="w-24 rounded-lg h-9 text-xs" />
                  <span className="text-xs text-muted-foreground w-8">{cp.currency}</span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setCountryPrices(countryPrices.filter((_, j) => j !== i))}>×</Button>
                </div>
              ))}</div>}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cover */}
          <Card className="border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Cover</h3>
            <div className={cn("mx-auto grid h-24 w-24 place-items-center rounded-2xl bg-gradient-to-br text-4xl", color)}>{emoji}</div>
            <div><Label className="text-xs">Emoji</Label><div className="mt-1 grid grid-cols-8 gap-1">{EMOJIS.map((e) => (<button key={e} onClick={() => setEmoji(e)} className={cn("grid h-7 w-7 place-items-center rounded-lg text-base", emoji === e ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-accent")}>{e}</button>))}</div></div>
            <div><Label className="text-xs">Color</Label><div className="mt-1 grid grid-cols-4 gap-1">{COLORS.map((c) => (<button key={c} onClick={() => setColor(c)} className={cn("h-6 rounded-lg bg-gradient-to-r", c, color === c && "ring-2 ring-primary ring-offset-2")} />))}</div></div>
          </Card>

          {/* Tags */}
          <Card className="border bg-card p-5 space-y-3">
            <h3 className="font-semibold text-sm">Tags</h3>
            <div className="flex gap-1"><Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Add tag" className="rounded-lg h-8 text-xs flex-1" /><Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" onClick={addTag}>+</Button></div>
            {tags.length > 0 && <div className="flex flex-wrap gap-1">{tags.map((t) => (<Badge key={t} variant="outline" className="rounded-full text-xs gap-1">{t}<button onClick={() => setTags(tags.filter((x) => x !== t))}><X className="h-2.5 w-2.5" /></button></Badge>))}</div>}
          </Card>

          {/* Team */}
          <Card className="border bg-card p-5 space-y-3">
            <h3 className="font-semibold text-sm">Team Assignment</h3>
            <div className="space-y-1.5"><Label className="text-xs">Assistant Teacher</Label><select value={assistant} onChange={(e) => setAssistant(e.target.value)} className="w-full h-9 rounded-lg border bg-card px-2 text-xs"><option value="">None</option>{teacherTeam.filter((m) => m.role.includes("Assistant") || m.role.includes("Reviewer")).map((m) => <option key={m.id} value={m.id}>{m.name} ({m.id})</option>)}</select></div>
            <div className="space-y-1.5"><Label className="text-xs">Content Manager</Label><select value={contentManager} onChange={(e) => setContentManager(e.target.value)} className="w-full h-9 rounded-lg border bg-card px-2 text-xs"><option value="">None</option>{teacherTeam.filter((m) => m.role.includes("Content")).map((m) => <option key={m.id} value={m.id}>{m.name} ({m.id})</option>)}</select></div>
          </Card>

          {/* Actions */}
          <Card className="border bg-card p-5 space-y-3">
            <Button onClick={() => handleSave(true)} className="w-full rounded-xl gradient-brand border-0 text-white"><Upload className="me-1.5 h-4 w-4" /> Publish Course</Button>
            <Button onClick={() => handleSave(false)} variant="outline" className="w-full rounded-xl"><Save className="me-1.5 h-4 w-4" /> Save as Draft</Button>
            <Button asChild variant="ghost" className="w-full rounded-xl"><Link to="/teacher/courses">Cancel</Link></Button>
          </Card>
        </div>
      </div>
    </DashPage>
  );
}
