import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  User, Calendar, IdCard, Phone, Mail, Lock, Users, Heart, Camera,
  Sparkles, Check, ChevronLeft, ChevronRight, PartyPopper, ShieldCheck,
  Eye, EyeOff,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle, LangSwitcher } from "@/components/brand/Toggles";
import { GradientButton } from "@/components/premium/GradientButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create student account — CLASSZ" }] }),
  component: RegisterPage,
});

const STEPS = [
  { id: 1, label: "Student", icon: User },
  { id: 2, label: "Account", icon: Mail },
  { id: 3, label: "Parent", icon: Users },
  { id: 4, label: "Identity", icon: Camera },
  { id: 5, label: "Review", icon: ShieldCheck },
];

const AVATARS = ["🦊", "🐼", "🦉", "🐧", "🦁", "🐨", "🦄", "🐸", "🐙", "🦖"];

interface FormState {
  fullName: string;
  dob: string;
  gender: string;
  nationalId: string;
  whatsapp: string;
  email: string;
  password: string;
  confirm: string;
  parentName: string;
  relationship: string;
  parentWhatsapp: string;
  avatar: string;
  nickname: string;
  agree: boolean;
}

const initial: FormState = {
  fullName: "", dob: "", gender: "", nationalId: "",
  whatsapp: "", email: "", password: "", confirm: "",
  parentName: "", relationship: "", parentWhatsapp: "",
  avatar: AVATARS[0], nickname: "", agree: false,
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
  id, label, icon: Icon, value, onChange, type = "text", placeholder, error,
}: {
  id: string; label: string; icon: React.ElementType; value: string;
  onChange: (v: string) => void; type?: string; placeholder?: string; error?: string;
}) {
  const [show, setShow] = useState(false);
  const isPw = type === "password";
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
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

function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initial);
  const [done, setDone] = useState(false);
  const [touched, setTouched] = useState(false);

  const set = (k: keyof FormState, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  const pwScore = useMemo(() => strength(form.password), [form.password]);

  const errors = useMemo(() => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (step === 1) {
      if (!form.fullName.trim()) e.fullName = "Full name is required";
      if (!form.dob) e.dob = "Date of birth is required";
      if (!form.gender) e.gender = "Select a gender";
    }
    if (step === 2) {
      if (!/^\+?[0-9\s-]{7,}$/.test(form.whatsapp)) e.whatsapp = "Enter a valid WhatsApp number";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Enter a valid email";
      if (pwScore < 2) e.password = "Choose a stronger password";
      if (form.confirm !== form.password || !form.confirm) e.confirm = "Passwords do not match";
    }
    if (step === 3) {
      if (!form.parentName.trim()) e.parentName = "Parent name is required";
      if (!form.relationship) e.relationship = "Select a relationship";
      if (!/^\+?[0-9\s-]{7,}$/.test(form.parentWhatsapp)) e.parentWhatsapp = "Enter a valid number";
    }
    if (step === 4) {
      if (!form.nickname.trim()) e.nickname = "Pick a nickname";
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

  const submit = () => {
    if (!form.agree) { setTouched(true); return; }
    setDone(true);
    setTimeout(() => navigate({ to: "/student" }), 2600);
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
              <SuccessCard key="success" nickname={form.nickname} avatar={form.avatar} />
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
                  <h1 className="text-2xl font-extrabold tracking-tight">Create your student account</h1>
                  <p className="mt-1 text-sm text-muted-foreground">Join CLASSZ in a few simple steps</p>
                </div>

                <Stepper step={step} />

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
                        <Field id="fullName" label="Full name" icon={User} value={form.fullName} onChange={(v) => set("fullName", v)} placeholder="e.g. Aya Mahmoud" error={touched ? errors.fullName : undefined} />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field id="dob" label="Date of birth" icon={Calendar} type="date" value={form.dob} onChange={(v) => set("dob", v)} error={touched ? errors.dob : undefined} />
                          <div className="space-y-1.5">
                            <Label>Gender</Label>
                            <div className="grid grid-cols-3 gap-2">
                              {["Male", "Female", "Other"].map((g) => (
                                <button key={g} type="button" onClick={() => set("gender", g)} className={cn("rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors", form.gender === g ? "gradient-brand text-white border-0" : "hover:bg-accent")}>{g}</button>
                              ))}
                            </div>
                            {touched && errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
                          </div>
                        </div>
                        <Field id="nationalId" label="National ID (optional)" icon={IdCard} value={form.nationalId} onChange={(v) => set("nationalId", v)} placeholder="14-digit national ID" />
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <Field id="whatsapp" label="WhatsApp number" icon={Phone} value={form.whatsapp} onChange={(v) => set("whatsapp", v)} placeholder="+20 100 000 0000" error={touched ? errors.whatsapp : undefined} />
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

                    {step === 3 && (
                      <>
                        <Field id="parentName" label="Parent / guardian name" icon={User} value={form.parentName} onChange={(v) => set("parentName", v)} placeholder="Parent full name" error={touched ? errors.parentName : undefined} />
                        <div className="space-y-1.5">
                          <Label>Relationship</Label>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {["Father", "Mother", "Guardian", "Other"].map((r) => (
                              <button key={r} type="button" onClick={() => set("relationship", r)} className={cn("rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors", form.relationship === r ? "gradient-brand text-white border-0" : "hover:bg-accent")}>{r}</button>
                            ))}
                          </div>
                          {touched && errors.relationship && <p className="text-xs text-destructive">{errors.relationship}</p>}
                        </div>
                        <Field id="parentWhatsapp" label="Parent WhatsApp" icon={Phone} value={form.parentWhatsapp} onChange={(v) => set("parentWhatsapp", v)} placeholder="+20 100 000 0000" error={touched ? errors.parentWhatsapp : undefined} />
                      </>
                    )}

                    {step === 4 && (
                      <>
                        <div className="space-y-2">
                          <Label>Choose an avatar</Label>
                          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                            {AVATARS.map((a) => (
                              <button key={a} type="button" onClick={() => set("avatar", a)} className={cn("grid aspect-square place-items-center rounded-2xl border text-2xl transition-transform hover:scale-105", form.avatar === a ? "border-primary bg-primary/10 ring-2 ring-primary" : "hover:bg-accent")}>{a}</button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl border border-dashed p-4">
                          <span className="grid h-12 w-12 place-items-center rounded-xl bg-muted"><Camera className="h-5 w-5 text-muted-foreground" /></span>
                          <div className="text-sm">
                            <p className="font-medium">Upload a photo</p>
                            <p className="text-muted-foreground">PNG or JPG, up to 5MB (optional)</p>
                          </div>
                          <button type="button" className="ms-auto rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-accent">Browse</button>
                        </div>
                        <Field id="nickname" label="Nickname" icon={Sparkles} value={form.nickname} onChange={(v) => set("nickname", v)} placeholder="What should we call you?" error={touched ? errors.nickname : undefined} />
                      </>
                    )}

                    {step === 5 && (
                      <div className="space-y-4">
                        <div className="rounded-2xl border bg-background/40 p-5">
                          <div className="flex items-center gap-3 border-b pb-4">
                            <span className="grid h-14 w-14 place-items-center rounded-2xl gradient-brand text-3xl">{form.avatar}</span>
                            <div className="min-w-0">
                              <p className="truncate text-lg font-bold">{form.nickname || form.fullName || "Your nickname"}</p>
                              <p className="truncate text-sm text-muted-foreground">{form.email || "your@email.com"}</p>
                            </div>
                          </div>
                          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                            <Summary label="Full name" value={form.fullName} />
                            <Summary label="Date of birth" value={form.dob} />
                            <Summary label="Gender" value={form.gender} />
                            <Summary label="WhatsApp" value={form.whatsapp} />
                            <Summary label="Parent" value={`${form.parentName}${form.relationship ? ` (${form.relationship})` : ""}`} />
                            <Summary label="Parent WhatsApp" value={form.parentWhatsapp} />
                          </dl>
                        </div>
                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
                          <Checkbox checked={form.agree} onCheckedChange={(c) => set("agree", Boolean(c))} className="mt-0.5" />
                          <span className="text-sm text-muted-foreground">I agree to the <span className="font-medium text-primary">Terms of Service</span> and <span className="font-medium text-primary">Privacy Policy</span>.</span>
                        </label>
                        {touched && !form.agree && <p className="text-xs text-destructive">Please accept the terms to continue</p>}
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
                    <GradientButton onClick={submit}>Create account <Check className="h-4 w-4" /></GradientButton>
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

function Stepper({ step }: { step: number }) {
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

function SuccessCard({ nickname, avatar }: { nickname: string; avatar: string }) {
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
        className="mx-auto grid h-24 w-24 place-items-center rounded-3xl gradient-brand text-5xl shadow-xl"
      >
        {avatar}
      </motion.div>
      <div className="mt-6 flex items-center justify-center gap-2 text-2xl font-extrabold">
        <PartyPopper className="h-6 w-6 text-primary" /> Welcome to CLASSZ!
      </div>
      <p className="mt-2 text-muted-foreground">
        Your account is ready{nickname ? `, ${nickname}` : ""}. Taking you to your dashboard…
      </p>
      <div className="mx-auto mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-muted">
        <motion.div className="h-full gradient-brand" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2.4 }} />
      </div>
    </motion.div>
  );
}
