import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  User, Mail, Lock, IdCard, Camera, FileText, Award, Phone, Link2,
  Check, ChevronLeft, ChevronRight, PartyPopper, ShieldCheck, Eye, EyeOff, Upload,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle, LangSwitcher } from "@/components/brand/Toggles";
import { GradientButton } from "@/components/premium/GradientButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { registerTeacherApi, uploadTeacherFileApi, type UploadCategory } from "@/lib/api/teachers";
import { useAuthStore } from "@/lib/stores/auth-store";
import { ApiError } from "@/lib/api/client";

// NOTE: intentionally not linked from /login, /register, or any nav menu yet.
// Reachable only by direct URL, per the "build it, don't integrate it live yet" decision.
export const Route = createFileRoute("/register_/teacher")({
  head: () => ({ meta: [{ title: "Register as a teacher — CLASSZ" }] }),
  component: RegisterTeacherPage,
});

const STEPS = [
  { id: 1, label: "Account", icon: Mail },
  { id: 2, label: "Identity", icon: IdCard },
  { id: 3, label: "Profile", icon: User },
  { id: 4, label: "Certification", icon: Award },
  { id: 5, label: "Review", icon: ShieldCheck },
];

interface FormState {
  fullName: string;
  email: string;
  password: string;
  confirm: string;
  nameOnId: string;
  nationalId: string;
  dob: string;
  gender: string;
  idDocumentUrl: string;
  photoUrl: string;
  nickname: string;
  bio: string;
  headline: string;
  specialization: string;
  mobile: string;
  socialLink: string;
  certificationText: string;
  certificationDocumentUrl: string;
  agree: boolean;
}

const initial: FormState = {
  fullName: "", email: "", password: "", confirm: "",
  nameOnId: "", nationalId: "", dob: "", gender: "",
  idDocumentUrl: "", photoUrl: "",
  nickname: "", bio: "", headline: "", specialization: "", mobile: "", socialLink: "",
  certificationText: "", certificationDocumentUrl: "",
  agree: false,
};

function strength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
const STRENGTH_META = [
  { label: "Too weak", color: "bg-rose-500", text: "text-rose-500" },
  { label: "Weak", color: "bg-orange-500", text: "text-orange-500" },
  { label: "Fair", color: "bg-amber-500", text: "text-amber-500" },
  { label: "Good", color: "bg-lime-500", text: "text-lime-500" },
  { label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" },
];

function Field({
  id, label, icon: Icon, value, onChange, type = "text", placeholder, error, optional,
}: {
  id: string; label: string; icon: React.ElementType; value: string;
  onChange: (v: string) => void; type?: string; placeholder?: string; error?: string; optional?: boolean;
}) {
  const [show, setShow] = useState(false);
  const isPw = type === "password";
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}{optional && <span className="text-muted-foreground font-normal"> (optional)</span>}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={isPw ? (show ? "text" : "password") : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn("ps-9 rounded-xl", isPw && "pe-9", error && "border-destructive focus-visible:ring-destructive")}
        />
        {isPw && (
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function TextAreaField({ id, label, value, onChange, placeholder, optional }: {
  id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string; optional?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}{optional && <span className="text-muted-foreground font-normal"> (optional)</span>}</Label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none"
      />
    </div>
  );
}

function FileUploadField({
  label, icon: Icon, category, url, onUploaded, optional,
}: {
  label: string; icon: React.ElementType; category: UploadCategory; url: string;
  onUploaded: (url: string) => void; optional?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const res = await uploadTeacherFileApi(category, file);
      onUploaded(res.url);
    } catch (err) {
      setError(err instanceof ApiError && typeof err.body === "object" && err.body !== null && "detail" in err.body
        ? String((err.body as { detail: string }).detail)
        : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <Label>{label}{optional && <span className="text-muted-foreground font-normal"> (optional)</span>}</Label>
      <div className="flex items-center gap-3 rounded-2xl border border-dashed p-4">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-muted shrink-0">
          {url ? <Check className="h-5 w-5 text-emerald-500" /> : <Icon className="h-5 w-5 text-muted-foreground" />}
        </span>
        <div className="text-sm min-w-0 flex-1">
          <p className="font-medium truncate">{url ? "Uploaded" : uploading ? "Uploading…" : "No file selected"}</p>
          <p className="text-muted-foreground text-xs">JPEG, PNG, WEBP, or PDF · up to 8MB</p>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <label className="ms-auto shrink-0 cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-accent inline-flex items-center gap-1.5">
          <Upload className="h-3.5 w-3.5" />
          {url ? "Replace" : "Browse"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
      </div>
    </div>
  );
}

function RegisterTeacherPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initial);
  const [done, setDone] = useState(false);
  const [touched, setTouched] = useState(false);
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof FormState, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  const pwScore = useMemo(() => strength(form.password), [form.password]);

  const errors = useMemo(() => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (step === 1) {
      if (!form.fullName.trim()) e.fullName = "Full name is required";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Enter a valid email";
      if (pwScore < 2) e.password = "Choose a stronger password";
      if (form.confirm !== form.password || !form.confirm) e.confirm = "Passwords do not match";
    }
    if (step === 2) {
      if (!form.nameOnId.trim()) e.nameOnId = "Name as it appears on your ID is required";
      if (!form.nationalId.trim()) e.nationalId = "National ID number is required";
    }
    return e;
  }, [step, form, pwScore]);

  const stepValid = Object.keys(errors).length === 0;

  const next = () => {
    setTouched(true);
    if (!stepValid) return;
    setTouched(false);
    setStep((s) => Math.min(5, s + 1));
  };
  const back = () => { setTouched(false); setStep((s) => Math.max(1, s - 1)); };

  const submit = async () => {
    if (!form.agree) { setTouched(true); return; }
    setApiError("");
    setSubmitting(true);
    try {
      const res = await registerTeacherApi({
        email: form.email,
        password: form.password,
        full_name: form.fullName.trim(),
        name_on_id: form.nameOnId.trim() || undefined,
        national_id: form.nationalId.trim() || undefined,
        id_document_url: form.idDocumentUrl || undefined,
        photo_url: form.photoUrl || undefined,
        gender: form.gender || undefined,
        date_of_birth: form.dob || undefined,
        nickname: form.nickname.trim() || undefined,
        bio: form.bio.trim() || undefined,
        headline: form.headline.trim() || undefined,
        specialization: form.specialization.trim() || undefined,
        social_links: form.socialLink.trim() ? { primary: form.socialLink.trim() } : undefined,
        mobile_number: form.mobile.trim() || undefined,
        certification_text: form.certificationText.trim() || undefined,
        certification_document_url: form.certificationDocumentUrl || undefined,
      });
      login(res.access_token, res.user, res.refresh_token);
      setDone(true);
      setTimeout(() => navigate({ to: "/teacher" }), 3200);
    } catch (err) {
      if (err instanceof ApiError) {
        const detail =
          typeof err.body === "object" && err.body !== null && "detail" in err.body
            ? String((err.body as { detail: string }).detail)
            : "Registration failed. Please try again.";
        setApiError(detail);
      } else {
        setApiError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="flex items-center justify-between p-6">
        <Logo />
        <div className="flex items-center gap-1">
          <LangSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center px-4 pb-16 sm:items-center">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {done ? (
              <TeacherSuccessCard key="success" nickname={form.nickname} />
            ) : (
              <motion.div
                key="wizard"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-3xl border bg-card/60 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
              >
                <div className="mb-2 text-center">
                  <h1 className="text-2xl font-extrabold tracking-tight">Register as a Teacher</h1>
                  <p className="mt-1 text-sm text-muted-foreground">Set up your CLASSZ teacher profile</p>
                </div>

                <TeacherStepper step={step} />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="mt-8 space-y-4"
                  >
                    {step === 1 && (
                      <>
                        <Field id="fullName" label="Full name" icon={User} value={form.fullName} onChange={(v) => set("fullName", v)} placeholder="e.g. Ahmed Mohamed" error={touched ? errors.fullName : undefined} />
                        <Field id="email" label="Email" icon={Mail} type="email" value={form.email} onChange={(v) => set("email", v)} placeholder="you@email.com" error={touched ? errors.email : undefined} />
                        <Field id="password" label="Password" icon={Lock} type="password" value={form.password} onChange={(v) => set("password", v)} placeholder="Create a password" error={touched ? errors.password : undefined} />
                        {form.password && (
                          <div className="space-y-1.5">
                            <div className="flex gap-1.5">
                              {[0, 1, 2, 3].map((i) => (
                                <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i < pwScore ? STRENGTH_META[pwScore].color : "bg-muted")} />
                              ))}
                            </div>
                            <p className={cn("text-xs font-medium", STRENGTH_META[pwScore].text)}>{STRENGTH_META[pwScore].label}</p>
                          </div>
                        )}
                        <Field id="confirm" label="Confirm password" icon={Lock} type="password" value={form.confirm} onChange={(v) => set("confirm", v)} placeholder="Re-enter password" error={touched ? errors.confirm : undefined} />
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <Field id="nameOnId" label="Name as it appears on your ID" icon={IdCard} value={form.nameOnId} onChange={(v) => set("nameOnId", v)} placeholder="Full legal name" error={touched ? errors.nameOnId : undefined} />
                        <Field id="nationalId" label="National ID number" icon={IdCard} value={form.nationalId} onChange={(v) => set("nationalId", v)} placeholder="14-digit national ID" error={touched ? errors.nationalId : undefined} />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field id="dob" label="Date of birth" icon={User} type="date" value={form.dob} onChange={(v) => set("dob", v)} optional />
                          <div className="space-y-1.5">
                            <Label>Gender <span className="text-muted-foreground font-normal">(optional)</span></Label>
                            <div className="grid grid-cols-3 gap-2">
                              {["Male", "Female", "Other"].map((g) => (
                                <button key={g} type="button" onClick={() => set("gender", g)} className={cn("rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors", form.gender === g ? "gradient-brand text-white border-0" : "hover:bg-accent")}>{g}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <FileUploadField label="Attach ID document" icon={IdCard} category="identity" url={form.idDocumentUrl} onUploaded={(u) => set("idDocumentUrl", u)} />
                        <FileUploadField label="Photo" icon={Camera} category="photo" url={form.photoUrl} onUploaded={(u) => set("photoUrl", u)} optional />
                      </>
                    )}

                    {step === 3 && (
                      <>
                        <Field id="nickname" label="Nickname" icon={User} value={form.nickname} onChange={(v) => set("nickname", v)} placeholder="What students will call you" optional />
                        <Field id="headline" label="Professional headline" icon={Award} value={form.headline} onChange={(v) => set("headline", v)} placeholder="e.g. PhD in Mathematics, 15 years teaching experience" optional />
                        <Field id="specialization" label="Specialization / subject expertise" icon={Award} value={form.specialization} onChange={(v) => set("specialization", v)} placeholder="e.g. Organic Chemistry" optional />
                        <TextAreaField id="bio" label="Bio" value={form.bio} onChange={(v) => set("bio", v)} placeholder="A short introduction students will see" optional />
                        <Field id="mobile" label="Mobile number" icon={Phone} value={form.mobile} onChange={(v) => set("mobile", v)} placeholder="+20 100 000 0000" optional />
                        <p className="text-xs text-muted-foreground -mt-2">Mobile verification will be added in a future update.</p>
                        <Field id="socialLink" label="Social media link" icon={Link2} value={form.socialLink} onChange={(v) => set("socialLink", v)} placeholder="https://facebook.com/yourprofile" optional />
                      </>
                    )}

                    {step === 4 && (
                      <>
                        <TextAreaField id="certificationText" label="Certification description" value={form.certificationText} onChange={(v) => set("certificationText", v)} placeholder="e.g. Cambridge Certified Teacher, Ministry of Education License #12345" optional />
                        <FileUploadField label="Attach certification document" icon={FileText} category="certification" url={form.certificationDocumentUrl} onUploaded={(u) => set("certificationDocumentUrl", u)} optional />
                      </>
                    )}

                    {step === 5 && (
                      <div className="space-y-4">
                        <div className="rounded-2xl border bg-background/40 p-5">
                          <div className="flex items-center gap-3 border-b pb-4">
                            <span className="grid h-14 w-14 place-items-center rounded-2xl gradient-brand text-2xl text-white">
                              {form.photoUrl ? <Check className="h-6 w-6" /> : <User className="h-6 w-6" />}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-lg font-bold">{form.nickname || form.fullName || "Your name"}</p>
                              <p className="truncate text-sm text-muted-foreground">{form.email || "your@email.com"}</p>
                            </div>
                          </div>
                          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                            <Summary label="Full name" value={form.fullName} />
                            <Summary label="Name on ID" value={form.nameOnId} />
                            <Summary label="National ID" value={form.nationalId} />
                            <Summary label="Specialization" value={form.specialization} />
                            <Summary label="Headline" value={form.headline} />
                            <Summary label="Mobile" value={form.mobile} />
                            <Summary label="ID document" value={form.idDocumentUrl ? "Uploaded" : "Not attached"} />
                            <Summary label="Certification" value={form.certificationDocumentUrl ? "Uploaded" : form.certificationText ? "Description only" : "None"} />
                          </dl>
                        </div>
                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
                          <Checkbox checked={form.agree} onCheckedChange={(c) => set("agree", Boolean(c))} className="mt-0.5" />
                          <span className="text-sm text-muted-foreground">I agree to the <span className="font-medium text-primary">Terms of Service</span> and <span className="font-medium text-primary">Privacy Policy</span>, and confirm the identity information provided is accurate.</span>
                        </label>
                        {touched && !form.agree && <p className="text-xs text-destructive">Please accept the terms to continue</p>}
                        {apiError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{apiError}</p>}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex items-center justify-between gap-3">
                  {step > 1 ? (
                    <GradientButton variant="outline" onClick={back}><ChevronLeft className="h-4 w-4" /> Back</GradientButton>
                  ) : (
                    <span className="text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-semibold text-primary">Log in</Link></span>
                  )}
                  {step < 5 ? (
                    <GradientButton onClick={next}>Continue <ChevronRight className="h-4 w-4" /></GradientButton>
                  ) : (
                    <GradientButton onClick={submit} disabled={submitting}>{submitting ? "Creating…" : "Create teacher account"} <Check className="h-4 w-4" /></GradientButton>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}

function TeacherStepper({ step }: { step: number }) {
  return (
    <div className="mt-6 flex items-center">
      {STEPS.map((s, i) => {
        const active = step === s.id;
        const complete = step > s.id;
        return (
          <div key={s.id} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn("grid h-10 w-10 place-items-center rounded-full border-2 transition-colors", complete ? "gradient-brand border-0 text-white" : active ? "border-primary text-primary" : "border-muted text-muted-foreground")}>
                {complete ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
              </div>
              <span className={cn("hidden text-xs font-medium sm:block", active || complete ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="mx-2 h-0.5 flex-1 rounded-full bg-muted">
                <div className={cn("h-full rounded-full transition-all duration-500", complete ? "w-full gradient-brand" : "w-0")} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TeacherSuccessCard({ nickname }: { nickname: string }) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-3xl border bg-card/60 p-10 text-center shadow-2xl backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 180, damping: 12 }}
        className="mx-auto grid h-24 w-24 place-items-center rounded-3xl gradient-brand text-white shadow-xl"
      >
        <ShieldCheck className="h-10 w-10" />
      </motion.div>
      <div className="mt-6 flex items-center justify-center gap-2 text-2xl font-extrabold">
        <PartyPopper className="h-6 w-6 text-primary" /> Welcome to CLASSZ!
      </div>
      <p className="mt-2 text-muted-foreground">
        Your teacher account is ready{nickname ? `, ${nickname}` : ""}. Let's set up your first course.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link to="/teacher" className="inline-flex items-center gap-2 rounded-xl gradient-brand px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.03]">
          Go to Dashboard <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mx-auto mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-muted">
        <motion.div className="h-full gradient-brand" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 3 }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Auto-redirecting to your dashboard…</p>
    </motion.div>
  );
}
