import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Plus, Save, Upload, X } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useTeacherCourseStore, type CountryPrice, type Testimonial } from "@/lib/teacher/teacher-course-store";
import { COUNTRIES } from "@/lib/i18n/countries";
import { teacherTeam } from "@/lib/teacherMock";

export const Route = createFileRoute("/teacher/courses/create")({ component: CreateCoursePage });

const SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "English", "Arabic", "CS", "History"];
const GRADES = ["Grade 10", "Grade 11", "Grade 12"];
const EMOJIS = ["📐", "⚛️", "🧪", "📚", "🧬", "💻", "🕌", "🏛️", "🎯", "🔬", "📊", "🎨", "📘", "🧮", "🔭", "🎭"];
const COLORS = ["from-violet-500 to-blue-500", "from-blue-500 to-cyan-500", "from-emerald-500 to-teal-500", "from-pink-500 to-rose-500", "from-green-500 to-emerald-500", "from-slate-500 to-blue-500", "from-amber-500 to-orange-500", "from-orange-500 to-red-500"];
const LANGUAGES = ["Arabic", "English", "French", "Arabic & English"];
const TABS = ["Basic", "Marketing", "Pricing", "Media", "Settings"];

function ListEditor({ items, onChange, placeholder }: { items: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
          <Input value={item} onChange={(e) => { const u = [...items]; u[i] = e.target.value; onChange(u); }} placeholder={placeholder} className="rounded-xl flex-1" />
          {items.length > 1 && <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => onChange(items.filter((_, j) => j !== i))}><X className="h-3.5 w-3.5" /></Button>}
        </div>
      ))}
      <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => onChange([...items, ""])}><Plus className="me-1 h-3 w-3" /> Add</Button>
    </div>
  );
}

function CreateCoursePage() {
  const navigate = useNavigate();
  const createCourse = useTeacherCourseStore((s) => s.createCourse);
  const [tab, setTab] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Basic
  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [language, setLanguage] = useState("Arabic");
  const [emoji, setEmoji] = useState("📘");
  const [color, setColor] = useState(COLORS[0]);
  const [targetAudience, setTargetAudience] = useState("");

  // Marketing
  const [outcomes, setOutcomes] = useState<string[]>([""]);
  const [whyJoin, setWhyJoin] = useState<string[]>([""]);
  const [whoIsFor, setWhoIsFor] = useState<string[]>([""]);
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [highlights, setHighlights] = useState<string[]>([""]);
  const [features, setFeatures] = useState<string[]>(["Lifetime access", "Certificate of completion", "AI study assistant"]);
  const [teacherBio, setTeacherBio] = useState("");
  const [teacherHeadline, setTeacherHeadline] = useState("");

  // Pricing
  const [price, setPrice] = useState("0");
  const [currency, setCurrency] = useState("USD");
  const [discountPrice, setDiscountPrice] = useState("");
  const [discountEndsAt, setDiscountEndsAt] = useState("");
  const [countryPrices, setCountryPrices] = useState<CountryPrice[]>([]);
  const [allowWallet, setAllowWallet] = useState(true);

  // Media
  const [promoVideo, setPromoVideo] = useState("");

  // Settings
  const [visibility, setVisibility] = useState<"public" | "private" | "unlisted">("public");
  const [certificate, setCertificate] = useState(true);
  const [accessDuration, setAccessDuration] = useState("Lifetime");
  const [refundPolicy, setRefundPolicy] = useState("30-day money-back guarantee");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [assistant, setAssistant] = useState("");
  const [contentManager, setContentManager] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  const addTag = () => { if (tagInput.trim() && !tags.includes(tagInput.trim())) { setTags([...tags, tagInput.trim()]); setTagInput(""); } };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    if (!subject) e.subject = "Subject is required";
    if (!grade) e.grade = "Grade is required";
    setErrors(e);
    if (Object.keys(e).length > 0) { setTab(0); return false; }
    return true;
  };

  const handleSave = (publish: boolean) => {
    if (!validate()) return;
    createCourse({
      title: title.trim(), subject, grade, language,
      description: description.trim(), shortDescription: shortDesc.trim(),
      coverEmoji: emoji, coverColor: color, promoVideoUrl: promoVideo,
      teacherBio, teacherHeadline,
      outcomes: outcomes.filter((o) => o.trim()), whyJoinThisCourse: whyJoin.filter((w) => w.trim()),
      whoIsThisFor: whoIsFor.filter((w) => w.trim()), requirements: requirements.filter((r) => r.trim()),
      courseHighlights: highlights.filter((h) => h.trim()), includedFeatures: features.filter((f) => f.trim()),
      price: Number(price), currency, countryPrices,
      discountPrice: discountPrice ? Number(discountPrice) : 0, discountEndsAt,
      allowWalletPayment: allowWallet,
      visibility, certificateIncluded: certificate, accessDuration, refundPolicy,
      metaTitle, metaDescription: metaDesc, tags,
      assignedAssistant: assistant, assignedContentManager: contentManager,
      isFeatured, status: publish ? "published" : "draft",
    });
    navigate({ to: "/teacher/courses" });
  };

  return (
    <DashPage role="teacher" title="Create Course" subtitle="Build the complete course page students will see" icon={ROLES.teacher.icon}>
      <Link to="/teacher/courses" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to My Courses</Link>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b pb-px">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} className={cn("whitespace-nowrap rounded-t-lg px-4 py-2 text-sm font-medium transition-colors", tab === i ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground")}>{t}</button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {/* TAB 0: Basic */}
          {tab === 0 && (<>
            <Card className="border bg-card p-5 space-y-4">
              <h3 className="font-semibold">Course Information</h3>
              <div className="space-y-1.5"><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Advanced Mathematics Grade 12" className="rounded-xl" />{errors.title && <p className="text-xs text-destructive">{errors.title}</p>}</div>
              <div className="space-y-1.5"><Label>Short Description</Label><Input value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="One-line tagline for course cards" className="rounded-xl" /></div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5"><Label>Subject *</Label><select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full h-10 rounded-xl border bg-card px-3 text-sm"><option value="">Select</option>{SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}</select>{errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}</div>
                <div className="space-y-1.5"><Label>Grade *</Label><select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full h-10 rounded-xl border bg-card px-3 text-sm"><option value="">Select</option>{GRADES.map((g) => <option key={g} value={g}>{g}</option>)}</select>{errors.grade && <p className="text-xs text-destructive">{errors.grade}</p>}</div>
                <div className="space-y-1.5"><Label>Language</Label><select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full h-10 rounded-xl border bg-card px-3 text-sm">{LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}</select></div>
              </div>
              <div className="space-y-1.5"><Label>Full Description</Label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Detailed course description..." className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none" /></div>
              <div className="space-y-1.5"><Label>Target Audience</Label><Input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="Who is this course for?" className="rounded-xl" /></div>
            </Card>
          </>)}

          {/* TAB 1: Marketing */}
          {tab === 1 && (<>
            <Card className="border bg-card p-5 space-y-4">
              <h3 className="font-semibold">What Students Will Learn</h3>
              <p className="text-xs text-muted-foreground">Shown as checkmark list on the public course page.</p>
              <ListEditor items={outcomes} onChange={setOutcomes} placeholder="e.g. Solve complex differential equations" />
            </Card>
            <Card className="border bg-card p-5 space-y-4">
              <h3 className="font-semibold">Why Join This Course?</h3>
              <ListEditor items={whyJoin} onChange={setWhyJoin} placeholder="e.g. Expert teacher with 15 years experience" />
            </Card>
            <Card className="border bg-card p-5 space-y-4">
              <h3 className="font-semibold">Who Is This For?</h3>
              <ListEditor items={whoIsFor} onChange={setWhoIsFor} placeholder="e.g. Grade 12 science students" />
            </Card>
            <Card className="border bg-card p-5 space-y-4">
              <h3 className="font-semibold">Prerequisites</h3>
              <ListEditor items={requirements} onChange={setRequirements} placeholder="e.g. Basic algebra knowledge" />
            </Card>
            <Card className="border bg-card p-5 space-y-4">
              <h3 className="font-semibold">Course Highlights</h3>
              <ListEditor items={highlights} onChange={setHighlights} placeholder="e.g. 48 video lessons with practice" />
            </Card>
            <Card className="border bg-card p-5 space-y-4">
              <h3 className="font-semibold">What's Included</h3>
              <ListEditor items={features} onChange={setFeatures} placeholder="e.g. Lifetime access" />
            </Card>
            <Card className="border bg-card p-5 space-y-4">
              <h3 className="font-semibold">Teacher Profile (on Course Page)</h3>
              <div className="space-y-1.5"><Label>Headline</Label><Input value={teacherHeadline} onChange={(e) => setTeacherHeadline(e.target.value)} placeholder="e.g. PhD in Mathematics, 15 years teaching" className="rounded-xl" /></div>
              <div className="space-y-1.5"><Label>Bio</Label><textarea value={teacherBio} onChange={(e) => setTeacherBio(e.target.value)} rows={3} placeholder="About the teacher..." className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none" /></div>
            </Card>
          </>)}

          {/* TAB 2: Pricing */}
          {tab === 2 && (<>
            <Card className="border bg-card p-5 space-y-4">
              <h3 className="font-semibold">Course Pricing</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5"><Label>Base Price (USD)</Label><Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="rounded-xl" /></div>
                <div className="space-y-1.5"><Label>Discount Price</Label><Input type="number" min="0" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} placeholder="Optional" className="rounded-xl" /></div>
                <div className="space-y-1.5"><Label>Discount Ends</Label><Input type="date" value={discountEndsAt} onChange={(e) => setDiscountEndsAt(e.target.value)} className="rounded-xl" /></div>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={allowWallet} onChange={(e) => setAllowWallet(e.target.checked)} /> Allow wallet payment</label>
            </Card>
            <Card className="border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between"><h3 className="font-semibold">Country-Specific Pricing</h3><Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => setCountryPrices([...countryPrices, { countryCode: "EG", currency: "EGP", price: 0 }])}>+ Country</Button></div>
              {countryPrices.map((cp, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select value={cp.countryCode} onChange={(e) => { const u = [...countryPrices]; const c = COUNTRIES.find((x) => x.code === e.target.value); u[i] = { ...u[i], countryCode: e.target.value, currency: c?.currencyCode ?? "USD" }; setCountryPrices(u); }} className="h-9 rounded-lg border bg-card px-2 text-xs flex-1">{COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.currencyCode})</option>)}</select>
                  <Input type="number" min="0" value={cp.price} onChange={(e) => { const u = [...countryPrices]; u[i] = { ...u[i], price: Number(e.target.value) }; setCountryPrices(u); }} className="w-24 rounded-lg h-9 text-xs" />
                  <span className="text-xs text-muted-foreground w-8">{cp.currency}</span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setCountryPrices(countryPrices.filter((_, j) => j !== i))}>×</Button>
                </div>
              ))}
            </Card>
          </>)}

          {/* TAB 3: Media */}
          {tab === 3 && (<>
            <Card className="border bg-card p-5 space-y-4">
              <h3 className="font-semibold">Promotional Video</h3>
              <div className="space-y-1.5"><Label>Video URL</Label><Input value={promoVideo} onChange={(e) => setPromoVideo(e.target.value)} placeholder="https://youtube.com/..." className="rounded-xl" /></div>
              <p className="text-xs text-muted-foreground">This video appears on the public course details page as a preview.</p>
            </Card>
            <Card className="border bg-card p-5 space-y-4">
              <h3 className="font-semibold">Course Cover</h3>
              <div className={cn("mx-auto grid h-28 w-28 place-items-center rounded-2xl bg-gradient-to-br text-5xl", color)}>{emoji}</div>
              <div><Label className="text-xs">Emoji</Label><div className="mt-1 grid grid-cols-8 gap-1">{EMOJIS.map((e) => (<button key={e} onClick={() => setEmoji(e)} className={cn("grid h-8 w-8 place-items-center rounded-lg text-lg", emoji === e ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-accent")}>{e}</button>))}</div></div>
              <div><Label className="text-xs">Color</Label><div className="mt-1 grid grid-cols-4 gap-1.5">{COLORS.map((c) => (<button key={c} onClick={() => setColor(c)} className={cn("h-7 rounded-lg bg-gradient-to-r", c, color === c && "ring-2 ring-primary ring-offset-2")} />))}</div></div>
            </Card>
          </>)}

          {/* TAB 4: Settings */}
          {tab === 4 && (<>
            <Card className="border bg-card p-5 space-y-4">
              <h3 className="font-semibold">Visibility & Status</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>Visibility</Label><select value={visibility} onChange={(e) => setVisibility(e.target.value as any)} className="w-full h-10 rounded-xl border bg-card px-3 text-sm"><option value="public">Public</option><option value="private">Private</option><option value="unlisted">Unlisted</option></select></div>
                <div className="flex items-end"><label className="flex items-center gap-2 text-sm h-10"><input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} /> Feature on platform</label></div>
              </div>
            </Card>
            <Card className="border bg-card p-5 space-y-4">
              <h3 className="font-semibold">Certificate & Access</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={certificate} onChange={(e) => setCertificate(e.target.checked)} /> Certificate included</label></div>
                <div className="space-y-1.5"><Label>Access Duration</Label><Input value={accessDuration} onChange={(e) => setAccessDuration(e.target.value)} className="rounded-xl" /></div>
              </div>
              <div className="space-y-1.5"><Label>Refund Policy</Label><Input value={refundPolicy} onChange={(e) => setRefundPolicy(e.target.value)} className="rounded-xl" /></div>
            </Card>
            <Card className="border bg-card p-5 space-y-4">
              <h3 className="font-semibold">Team</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5"><Label className="text-xs">Assistant Teacher</Label><select value={assistant} onChange={(e) => setAssistant(e.target.value)} className="w-full h-9 rounded-lg border bg-card px-2 text-xs"><option value="">None</option>{teacherTeam.filter((m) => m.role.includes("Assistant") || m.role.includes("Reviewer")).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
                <div className="space-y-1.5"><Label className="text-xs">Content Manager</Label><select value={contentManager} onChange={(e) => setContentManager(e.target.value)} className="w-full h-9 rounded-lg border bg-card px-2 text-xs"><option value="">None</option>{teacherTeam.filter((m) => m.role.includes("Content")).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
              </div>
            </Card>
            <Card className="border bg-card p-5 space-y-4">
              <h3 className="font-semibold">SEO & Tags</h3>
              <div className="space-y-1.5"><Label>Meta Title</Label><Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="SEO title (optional)" className="rounded-xl" /></div>
              <div className="space-y-1.5"><Label>Meta Description</Label><Input value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} placeholder="SEO description (optional)" className="rounded-xl" /></div>
              <div><Label className="text-xs">Tags</Label><div className="mt-1 flex gap-1"><Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Add tag" className="rounded-lg h-8 text-xs flex-1" /><Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" onClick={addTag}>+</Button></div>
                {tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{tags.map((t) => (<Badge key={t} variant="outline" className="rounded-full text-xs gap-1">{t}<button onClick={() => setTags(tags.filter((x) => x !== t))}><X className="h-2.5 w-2.5" /></button></Badge>))}</div>}
              </div>
            </Card>
          </>)}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="border bg-card p-5 space-y-3">
            <Button onClick={() => handleSave(true)} className="w-full rounded-xl gradient-brand border-0 text-white"><Upload className="me-1.5 h-4 w-4" /> Publish Course</Button>
            <Button onClick={() => handleSave(false)} variant="outline" className="w-full rounded-xl"><Save className="me-1.5 h-4 w-4" /> Save Draft</Button>
            <Button asChild variant="ghost" className="w-full rounded-xl"><Link to="/teacher/courses">Cancel</Link></Button>
          </Card>
          <Card className="border bg-card p-4">
            <p className="text-xs text-muted-foreground">Sections: {TABS.map((t, i) => (<button key={t} onClick={() => setTab(i)} className={cn("underline-offset-2", tab === i ? "text-primary font-medium" : "text-muted-foreground hover:underline")}>{t}</button>)).reduce((a: React.ReactNode[], b, i) => i === 0 ? [b] : [...a, " · ", b], [])}</p>
          </Card>
        </div>
      </div>
    </DashPage>
  );
}
