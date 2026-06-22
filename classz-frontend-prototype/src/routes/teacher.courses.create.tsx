import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ImagePlus, Plus, Save, Upload, X } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useTeacherCourseStore, type CountryPrice, type CourseCategory, type PricingModel, type SocialLinks } from "@/lib/teacher/teacher-course-store";
import { COUNTRIES } from "@/lib/i18n/countries";
import { teacherTeam } from "@/lib/teacherMock";

export const Route = createFileRoute("/teacher/courses/create")({ component: CreateCoursePage });

const CATEGORIES: { value: CourseCategory; label: string }[] = [
  { value: "academic", label: "Academic (School/University)" },
  { value: "training", label: "Training Course" },
  { value: "professional", label: "Professional Development" },
  { value: "general", label: "General Learning" },
];

const COMMON_SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "English", "Arabic", "CS", "History", "IELTS", "TOEFL", "Supply Chain", "Marketing", "Accounting", "Programming", "Data Science", "Business"];

const EMOJIS = ["📐", "⚛️", "🧪", "📚", "🧬", "💻", "🕌", "🏛️", "🎯", "🔬", "📊", "🎨", "📘", "🧮", "🔭", "🎭"];
const COLORS = ["from-violet-500 to-blue-500", "from-blue-500 to-cyan-500", "from-emerald-500 to-teal-500", "from-pink-500 to-rose-500", "from-green-500 to-emerald-500", "from-slate-500 to-blue-500", "from-amber-500 to-orange-500", "from-orange-500 to-red-500"];
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
  const [category, setCategory] = useState<CourseCategory>("academic");
  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [customGrade, setCustomGrade] = useState("");
  const [language, setLanguage] = useState("");
  const [emoji, setEmoji] = useState("📘");
  const [color, setColor] = useState(COLORS[0]);

  // Marketing
  const [outcomes, setOutcomes] = useState<string[]>([""]);
  const [whyJoin, setWhyJoin] = useState<string[]>([""]);
  const [whoIsFor, setWhoIsFor] = useState<string[]>([""]);
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [highlights, setHighlights] = useState<string[]>([""]);
  const [features, setFeatures] = useState<string[]>(["Lifetime access", "Certificate of completion", "AI study assistant"]);
  const [teacherBio, setTeacherBio] = useState("");
  const [teacherHeadline, setTeacherHeadline] = useState("");
  const [social, setSocial] = useState<SocialLinks>({});

  // Pricing
  const [pricingModel, setPricingModel] = useState<PricingModel>("one_time");
  const [price, setPrice] = useState("0");
  const [monthlyPrice, setMonthlyPrice] = useState("0");
  const [perSessionPrice, setPerSessionPrice] = useState("0");
  const [bundleSize, setBundleSize] = useState("5");
  const [bundlePrice, setBundlePrice] = useState("0");
  const [currency, setCurrency] = useState("USD");
  const [discountPrice, setDiscountPrice] = useState("");
  const [discountEndsAt, setDiscountEndsAt] = useState("");
  const [countryPrices, setCountryPrices] = useState<CountryPrice[]>([]);
  const [allowWallet, setAllowWallet] = useState(true);

  // Media
  const [coverImageUrl, setCoverImageUrl] = useState("");
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
  const finalSubject = subject === "__custom" ? customSubject : subject;
  const finalGrade = grade === "__custom" ? customGrade : grade;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    if (!finalSubject.trim()) e.subject = "Subject is required";
    setErrors(e);
    if (Object.keys(e).length > 0) { setTab(0); return false; }
    return true;
  };

  const handleSave = (publish: boolean) => {
    if (!validate()) return;
    createCourse({
      title: title.trim(), category, subject: finalSubject, customSubject, grade: finalGrade, customGrade,
      language, description: description.trim(), shortDescription: shortDesc.trim(),
      coverEmoji: emoji, coverColor: color, coverImageUrl, promoVideoUrl: promoVideo,
      teacherBio, teacherHeadline, socialLinks: social,
      outcomes: outcomes.filter((o) => o.trim()), whyJoinThisCourse: whyJoin.filter((w) => w.trim()),
      whoIsThisFor: whoIsFor.filter((w) => w.trim()), requirements: requirements.filter((r) => r.trim()),
      courseHighlights: highlights.filter((h) => h.trim()), includedFeatures: features.filter((f) => f.trim()),
      pricingModel, price: Number(price), monthlyPrice: Number(monthlyPrice),
      perSessionPrice: Number(perSessionPrice), bundleSize: Number(bundleSize), bundlePrice: Number(bundlePrice),
      currency, countryPrices, discountPrice: discountPrice ? Number(discountPrice) : 0, discountEndsAt,
      allowWalletPayment: allowWallet, visibility, certificateIncluded: certificate,
      accessDuration, refundPolicy, metaTitle, metaDescription: metaDesc, tags,
      assignedAssistant: assistant, assignedContentManager: contentManager,
      isFeatured, status: publish ? "published" : "draft",
    });
    navigate({ to: "/teacher/courses" });
  };

  return (
    <DashPage role="teacher" title="Create Course" subtitle="Build the complete course page students will see" icon={ROLES.teacher.icon}>
      <Link to="/teacher/courses" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to My Courses</Link>

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

              <div className="space-y-1.5">
                <Label>Category</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button key={c.value} onClick={() => setCategory(c.value)} className={cn("rounded-xl border px-4 py-2 text-sm font-medium transition-colors", category === c.value ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent")}>{c.label}</button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Subject *</Label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full h-10 rounded-xl border bg-card px-3 text-sm">
                    <option value="">Select or type custom</option>
                    {COMMON_SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    <option value="__custom">Other (type below)</option>
                  </select>
                  {subject === "__custom" && <Input value={customSubject} onChange={(e) => setCustomSubject(e.target.value)} placeholder="Type your subject" className="rounded-xl mt-1.5" />}
                  {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Grade / Level</Label>
                  {category === "academic" ? (
                    <>
                      <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full h-10 rounded-xl border bg-card px-3 text-sm">
                        <option value="">Select or type custom</option>
                        {["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "University Year 1", "University Year 2", "University Year 3", "University Year 4"].map((g) => <option key={g} value={g}>{g}</option>)}
                        <option value="__custom">Other</option>
                      </select>
                      {grade === "__custom" && <Input value={customGrade} onChange={(e) => setCustomGrade(e.target.value)} placeholder="Type level" className="rounded-xl mt-1.5" />}
                    </>
                  ) : (
                    <Input value={customGrade} onChange={(e) => { setGrade("__custom"); setCustomGrade(e.target.value); }} placeholder="e.g. Beginner, Intermediate, Advanced, All Levels" className="rounded-xl" />
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Language</Label>
                <Input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="e.g. Arabic, English, Arabic & English, French" className="rounded-xl" />
              </div>

              <div className="space-y-1.5"><Label>Full Description</Label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Detailed course description..." className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none" /></div>
            </Card>
          </>)}

          {/* TAB 1: Marketing */}
          {tab === 1 && (<>
            <Card className="border bg-card p-5 space-y-4">
              <h3 className="font-semibold">What Students Will Learn</h3>
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
              <h3 className="font-semibold">Teacher Profile</h3>
              <div className="space-y-1.5"><Label>Headline</Label><Input value={teacherHeadline} onChange={(e) => setTeacherHeadline(e.target.value)} placeholder="e.g. PhD in Mathematics, 15 years teaching" className="rounded-xl" /></div>
              <div className="space-y-1.5"><Label>Bio</Label><textarea value={teacherBio} onChange={(e) => setTeacherBio(e.target.value)} rows={3} placeholder="About the teacher..." className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none" /></div>
            </Card>
            <Card className="border bg-card p-5 space-y-4">
              <h3 className="font-semibold">Social Links</h3>
              <p className="text-xs text-muted-foreground">Share your course on social media. Links shown on course page.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5"><Label className="text-xs">Facebook</Label><Input value={social.facebook || ""} onChange={(e) => setSocial({ ...social, facebook: e.target.value })} placeholder="https://facebook.com/..." className="rounded-xl" /></div>
                <div className="space-y-1.5"><Label className="text-xs">Instagram</Label><Input value={social.instagram || ""} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} placeholder="https://instagram.com/..." className="rounded-xl" /></div>
                <div className="space-y-1.5"><Label className="text-xs">YouTube Channel</Label><Input value={social.youtube || ""} onChange={(e) => setSocial({ ...social, youtube: e.target.value })} placeholder="https://youtube.com/..." className="rounded-xl" /></div>
                <div className="space-y-1.5"><Label className="text-xs">Telegram</Label><Input value={social.telegram || ""} onChange={(e) => setSocial({ ...social, telegram: e.target.value })} placeholder="https://t.me/..." className="rounded-xl" /></div>
                <div className="space-y-1.5"><Label className="text-xs">WhatsApp Group</Label><Input value={social.whatsapp || ""} onChange={(e) => setSocial({ ...social, whatsapp: e.target.value })} placeholder="https://chat.whatsapp.com/..." className="rounded-xl" /></div>
                <div className="space-y-1.5"><Label className="text-xs">Website</Label><Input value={social.website || ""} onChange={(e) => setSocial({ ...social, website: e.target.value })} placeholder="https://..." className="rounded-xl" /></div>
              </div>
            </Card>
          </>)}

          {/* TAB 2: Pricing */}
          {tab === 2 && (<>
            <Card className="border bg-card p-5 space-y-4">
              <h3 className="font-semibold">Pricing Model</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {([
                  { value: "one_time" as PricingModel, label: "One-Time Payment", desc: "Student pays once for full course access" },
                  { value: "monthly" as PricingModel, label: "Monthly Subscription", desc: "Student pays monthly for continued access" },
                  { value: "per_session" as PricingModel, label: "Per Session", desc: "Student pays for each session individually" },
                  { value: "session_bundle" as PricingModel, label: "Session Bundle", desc: "Student buys a bundle of N sessions" },
                ]).map((pm) => (
                  <button key={pm.value} onClick={() => setPricingModel(pm.value)} className={cn("rounded-xl border p-3 text-start transition-colors", pricingModel === pm.value ? "border-primary bg-primary/5" : "hover:bg-accent")}>
                    <p className="text-sm font-medium">{pm.label}</p>
                    <p className="text-xs text-muted-foreground">{pm.desc}</p>
                  </button>
                ))}
              </div>
            </Card>
            <Card className="border bg-card p-5 space-y-4">
              <h3 className="font-semibold">Price Details</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {pricingModel === "one_time" && (
                  <div className="space-y-1.5"><Label>Course Price</Label><Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="rounded-xl" /></div>
                )}
                {pricingModel === "monthly" && (
                  <div className="space-y-1.5"><Label>Monthly Price</Label><Input type="number" min="0" value={monthlyPrice} onChange={(e) => setMonthlyPrice(e.target.value)} className="rounded-xl" /></div>
                )}
                {pricingModel === "per_session" && (
                  <div className="space-y-1.5"><Label>Price Per Session</Label><Input type="number" min="0" value={perSessionPrice} onChange={(e) => setPerSessionPrice(e.target.value)} className="rounded-xl" /></div>
                )}
                {pricingModel === "session_bundle" && (<>
                  <div className="space-y-1.5"><Label>Sessions in Bundle</Label><Input type="number" min="1" value={bundleSize} onChange={(e) => setBundleSize(e.target.value)} className="rounded-xl" /></div>
                  <div className="space-y-1.5"><Label>Bundle Price</Label><Input type="number" min="0" value={bundlePrice} onChange={(e) => setBundlePrice(e.target.value)} className="rounded-xl" /></div>
                </>)}
                <div className="space-y-1.5"><Label>Discount Price</Label><Input type="number" min="0" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} placeholder="Optional" className="rounded-xl" /></div>
                <div className="space-y-1.5"><Label>Discount Ends</Label><Input type="date" value={discountEndsAt} onChange={(e) => setDiscountEndsAt(e.target.value)} className="rounded-xl" /></div>
                <div className="space-y-1.5"><Label>Currency</Label><Input value={currency} onChange={(e) => setCurrency(e.target.value)} className="rounded-xl" /></div>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={allowWallet} onChange={(e) => setAllowWallet(e.target.checked)} /> Allow wallet payment</label>
            </Card>
            <Card className="border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between"><h3 className="font-semibold">Country-Specific Pricing</h3><Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => setCountryPrices([...countryPrices, { countryCode: "EG", currency: "EGP", price: 0 }])}>+ Country</Button></div>
              {countryPrices.map((cp, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select value={cp.countryCode} onChange={(e) => { const u = [...countryPrices]; const c = COUNTRIES.find((x) => x.code === e.target.value); u[i] = { countryCode: e.target.value, currency: c?.currencyCode ?? "USD", price: u[i].price }; setCountryPrices(u); }} className="h-9 rounded-lg border bg-card px-2 text-xs flex-1">{COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.currencyCode})</option>)}</select>
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
              <h3 className="font-semibold">Course Cover Image</h3>
              <p className="text-xs text-muted-foreground">Upload or paste URL for the course thumbnail shown on cards and the course page.</p>
              {coverImageUrl ? (
                <div className="relative">
                  <img src={coverImageUrl} alt="Cover" className="w-full max-h-48 object-cover rounded-xl border" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <Button variant="ghost" size="icon" className="absolute top-2 end-2 h-8 w-8 rounded-full bg-background/80" onClick={() => setCoverImageUrl("")}><X className="h-4 w-4" /></Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8">
                  <ImagePlus className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Paste image URL below</p>
                </div>
              )}
              <Input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} placeholder="https://example.com/course-cover.jpg" className="rounded-xl" />
            </Card>
            <Card className="border bg-card p-5 space-y-4">
              <h3 className="font-semibold">Promotional Video</h3>
              <Input value={promoVideo} onChange={(e) => setPromoVideo(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="rounded-xl" />
              <p className="text-xs text-muted-foreground">Appears as a preview on the public course page.</p>
            </Card>
            <Card className="border bg-card p-5 space-y-4">
              <h3 className="font-semibold">Course Cover (Emoji + Color)</h3>
              <p className="text-xs text-muted-foreground">Used when no cover image is uploaded.</p>
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
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={certificate} onChange={(e) => setCertificate(e.target.checked)} /> Certificate included</label>
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
              <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="SEO title" className="rounded-xl" />
              <Input value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} placeholder="SEO description" className="rounded-xl" />
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
