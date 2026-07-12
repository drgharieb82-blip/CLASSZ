import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Howl } from "howler";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Globe,
  GraduationCap,
  Loader2,
  Lock,
  LogIn,
  Mail,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SoundToggle } from "@/components/brand/Toggles";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useVisualModeStore } from "@/lib/stores/visual-mode-store";
import { loginApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { useUiSounds } from "@/lib/ui-sounds";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — CLASSZ" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    returnUrl: (search.returnUrl as string) || "",
  }),
  component: LoginPage,
});

const CINZEL = { fontFamily: "'Cinzel', serif" } as const;

const ROLE_TABS = [
  { key: "student", label: "Student", icon: GraduationCap },
  { key: "teacher", label: "Teacher", icon: Users },
  { key: "parent", label: "Parent", icon: Users },
] as const;

type RoleTabKey = (typeof ROLE_TABS)[number]["key"];

function LoginPage() {
  const navigate = useNavigate();
  const { returnUrl } = Route.useSearch();
  const login = useAuthStore((state) => state.login);
  const { lang, toggleLang, cinematicLoginMotionEnabled, uiSoundsEnabled } = useApp();
  const reduceMotion = useReducedMotion();
  const { playSuccess, playError } = useUiSounds();
  const [sceneReady, setSceneReady] = useState(false);
  const shouldAnimateIntro = cinematicLoginMotionEnabled && !reduceMotion;

  const [roleTab, setRoleTab] = useState<RoleTabKey>("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [comingSoon, setComingSoon] = useState("");
  const [artworkSrc, setArtworkSrc] = useState("/api/dev/login-artwork");
  const artworkUrlRef = useRef<string | null>(null);
  const artworkCandidates = ["/api/dev/login-artwork"];
  const loginSoundRef = useRef<Howl | null>(null);

  useEffect(() => {
    setSceneReady(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const refreshArtwork = async () => {
      for (const candidate of artworkCandidates) {
        try {
          const response = await fetch(candidate, { cache: "no-store" });
          if (!response.ok) {
            continue;
          }

          const blob = await response.blob();
          const nextUrl = URL.createObjectURL(blob);

          if (cancelled) {
            URL.revokeObjectURL(nextUrl);
            return;
          }

          const previousUrl = artworkUrlRef.current;
          artworkUrlRef.current = nextUrl;
          setArtworkSrc(nextUrl);

          if (previousUrl) {
            URL.revokeObjectURL(previousUrl);
          }
          return;
        } catch {
          // Try the next candidate.
        }
      }
    };

    void refreshArtwork();
    const intervalId = window.setInterval(refreshArtwork, import.meta.env.DEV ? 2000 : 15000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      if (artworkUrlRef.current) {
        URL.revokeObjectURL(artworkUrlRef.current);
        artworkUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Wait for the same trigger that starts the artwork's fade-in
    // (`sceneReady`) so the roar swells in alongside the photo instead of
    // racing ahead of it on raw mount.
    if (typeof window === "undefined" || !sceneReady) return;

    const sound = new Howl({
      src: ["/api/dev/login-sound"],
      html5: true,
      preload: true,
      loop: false,
      volume: 0,
    });

    loginSoundRef.current = sound;
    let hasStarted = false;

    // The artwork motion.div fades in over `delay: 0.2s` + `duration: 1.2s`
    // (see the <img> wrapper below) — mirror that timing here so the sound
    // finishes swelling in right as the photo fully appears.
    const fadeInMs = shouldAnimateIntro ? 1400 : 300;

    const startWithFade = () => {
      if (hasStarted || !uiSoundsEnabled) return;
      hasStarted = true;

      try {
        sound.stop();
        sound.volume(0);
        const soundId = sound.play();
        sound.fade(0, 0.18, fadeInMs, soundId);
      } catch {
        hasStarted = false;
      }
    };

    const unlock = () => startWithFade();
    const unlockEvents: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "touchstart", "mousedown"];

    startWithFade();
    unlockEvents.forEach((eventName) => window.addEventListener(eventName, unlock, { passive: true }));

    return () => {
      unlockEvents.forEach((eventName) => window.removeEventListener(eventName, unlock));
      if (sound.playing()) {
        sound.fade(sound.volume(), 0, 500);
        window.setTimeout(() => {
          sound.stop();
          sound.unload();
        }, 550);
      } else {
        sound.unload();
      }
      if (loginSoundRef.current === sound) {
        loginSoundRef.current = null;
      }
    };
  }, [uiSoundsEnabled, sceneReady, shouldAnimateIntro]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginApi(identifier, password);
      login(response.access_token, response.user, response.refresh_token);
      playSuccess();
      const destination = returnUrl || ROLES[response.user.role]?.home || "/";
      navigate({ to: destination });
    } catch (err) {
      playError();
      if (err instanceof ApiError) {
        const detail =
          typeof err.body === "object" && err.body !== null && "detail" in err.body
            ? String((err.body as { detail: string }).detail)
            : "Invalid email or password";
        setError(detail);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-[100svh] overflow-hidden bg-[#05070a] text-white">
      <div className="absolute inset-0 z-0 flex items-center justify-center bg-[#05070a]">
        <motion.div
          className="relative h-full max-h-full w-full max-w-full"
          style={{
            width: "min(100vw, calc(100svh * 16 / 9))",
            height: "min(100svh, calc(100vw * 9 / 16))",
            willChange: "transform, opacity, filter",
          }}
          initial={shouldAnimateIntro ? { opacity: 0, scale: 1.04, filter: "blur(10px)" } : false}
          animate={shouldAnimateIntro && sceneReady ? { opacity: 1, scale: 1, filter: "blur(0px)" } : undefined}
          transition={shouldAnimateIntro ? { duration: 1.2, ease: "easeOut", delay: 0.2 } : undefined}
        >
          <img
            src={artworkSrc}
            alt=""
            aria-hidden="true"
            className="h-full w-full select-none object-contain object-center"
          />
        </motion.div>
      </div>

      {shouldAnimateIntro && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[1] bg-black"
          initial={{ opacity: 1 }}
          animate={sceneReady ? { opacity: 0 } : undefined}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
        />
      )}
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(to_right,rgba(5,7,10,0.48),rgba(5,7,10,0.1)_12%,rgba(5,7,10,0)_20%,rgba(5,7,10,0)_80%,rgba(5,7,10,0.1)_88%,rgba(5,7,10,0.48))]" />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(circle_at_center,rgba(12,18,33,0.06),rgba(3,5,10,0.2)_56%,rgba(3,5,10,0.5)_100%)]" />

      <div className="sr-only">
        <h1>CLASSZ — Learn. Achieve. Lead.</h1>
        <p>Welcome to CLASSZ Academy. Enter the academy of knowledge and begin your journey to become a legend.</p>
        <p>Secure: your data is safe. Trusted by thousands. Excellence in education.</p>
      </div>

      <div className="relative z-[3] grid h-[100svh] grid-rows-[1fr]">
        <main className="relative flex items-center justify-center px-4 py-3 sm:px-6 sm:py-4 sm:translate-y-24 lg:translate-y-28">
          <div className="flex flex-col items-center">
            <motion.div
              initial={shouldAnimateIntro ? { opacity: 0, y: 80, scale: 0.95 } : false}
              animate={shouldAnimateIntro && sceneReady ? { opacity: 1, y: 0, scale: 1 } : undefined}
              transition={shouldAnimateIntro ? { type: "spring", stiffness: 120, damping: 18, delay: 1.4 } : undefined}
            >
              <div className="w-full max-w-[min(88vw,360px)] rounded-[28px] border border-amber-300/25 bg-[#0a0f1be8] px-4 py-2.5 shadow-[0_30px_90px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:px-5 sm:py-3">
                <motion.div
                  className="text-center"
                  initial={shouldAnimateIntro ? { opacity: 0, y: 10 } : false}
                  animate={shouldAnimateIntro && sceneReady ? { opacity: 1, y: 0 } : undefined}
                  transition={shouldAnimateIntro ? { duration: 0.35, ease: "easeOut", delay: 1.55 } : undefined}
                >
                  <p className="text-[10px] uppercase tracking-[0.34em] text-amber-200/80">Login</p>
                  <h2 className="mt-1 text-[1.35rem] font-semibold tracking-[0.14em] text-amber-100" style={CINZEL}>
                    Continue your journey
                  </h2>
                </motion.div>

                <div className="mt-2.5 grid grid-cols-3 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
                  {ROLE_TABS.map((tab, index) => (
                    <motion.div
                      key={tab.key}
                      initial={shouldAnimateIntro ? { opacity: 0, y: 10 } : false}
                      animate={shouldAnimateIntro && sceneReady ? { opacity: 1, y: 0 } : undefined}
                      transition={shouldAnimateIntro ? { duration: 0.28, ease: "easeOut", delay: 1.8 + index * 0.08 } : undefined}
                    >
                      <button
                        type="button"
                        onClick={() => setRoleTab(tab.key)}
                        className={cn(
                          "flex w-full items-center justify-center gap-1.5 rounded-xl px-2 py-1 text-xs font-semibold transition-colors",
                          roleTab === tab.key
                            ? "bg-gradient-to-br from-amber-300 to-amber-500 text-[#241505] shadow-[0_0_30px_rgba(245,180,60,0.18)]"
                            : "text-slate-400 hover:text-slate-200",
                        )}
                      >
                        <tab.icon className="h-3.5 w-3.5" />
                        {tab.label}
                      </button>
                    </motion.div>
                  ))}
                </div>

                <form className="mt-2.5 space-y-2" onSubmit={handleSubmit}>
                  <motion.div
                    className="relative"
                    initial={shouldAnimateIntro ? { opacity: 0, y: 12 } : false}
                    animate={shouldAnimateIntro && sceneReady ? { opacity: 1, y: 0 } : undefined}
                    transition={shouldAnimateIntro ? { duration: 0.28, ease: "easeOut", delay: 2.0 } : undefined}
                  >
                    <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(event) => setIdentifier(event.target.value)}
                      placeholder="Email or Username"
                      required
                      className="h-9 w-full rounded-xl border border-white/10 bg-white/[0.03] ps-9 pe-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 transition-[border-color,box-shadow,background-color] focus:border-amber-400/50 focus:shadow-[0_0_0_1px_rgba(251,191,36,0.2),0_0_24px_rgba(245,180,60,0.18)]"
                    />
                  </motion.div>

                  <motion.div
                    className="relative"
                    initial={shouldAnimateIntro ? { opacity: 0, y: 12 } : false}
                    animate={shouldAnimateIntro && sceneReady ? { opacity: 1, y: 0 } : undefined}
                    transition={shouldAnimateIntro ? { duration: 0.28, ease: "easeOut", delay: 2.08 } : undefined}
                  >
                    <Lock className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Password"
                      required
                      className="h-9 w-full rounded-xl border border-white/10 bg-white/[0.03] ps-9 pe-9 text-sm text-slate-100 outline-none placeholder:text-slate-500 transition-[border-color,box-shadow,background-color] focus:border-amber-400/50 focus:shadow-[0_0_0_1px_rgba(251,191,36,0.2),0_0_24px_rgba(245,180,60,0.18)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </motion.div>

                  <motion.div
                    className="flex items-center justify-between text-xs"
                    initial={shouldAnimateIntro ? { opacity: 0, y: 10 } : false}
                    animate={shouldAnimateIntro && sceneReady ? { opacity: 1, y: 0 } : undefined}
                    transition={shouldAnimateIntro ? { duration: 0.28, ease: "easeOut", delay: 2.16 } : undefined}
                  >
                    <label className="flex cursor-pointer items-center gap-2 text-slate-300">
                      <Checkbox checked={remember} onCheckedChange={(checked) => setRemember(Boolean(checked))} />
                      Remember me
                    </label>
                    <Link to="/forgot-password" className="font-medium text-amber-300 hover:underline">
                      Forgot Password?
                    </Link>
                  </motion.div>

                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.p
                        key={error}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.div
                    initial={shouldAnimateIntro ? { opacity: 0, y: 12 } : false}
                    animate={shouldAnimateIntro && sceneReady ? { opacity: 1, y: 0 } : undefined}
                    transition={shouldAnimateIntro ? { duration: 0.28, ease: "easeOut", delay: 2.24 } : undefined}
                  >
                    <Button
                      type="submit"
                      disabled={loading}
                    className="group relative flex h-9 w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600 text-sm font-bold tracking-[0.18em] text-[#241505] shadow-[0_10px_30px_rgba(245,180,60,0.35)] hover:!bg-gradient-to-r hover:!from-amber-300 hover:!via-amber-400 hover:!to-amber-600 hover:!text-[#241505]"
                      style={CINZEL}
                    >
                      <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:translate-x-[280%] group-hover:opacity-100" />
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> SIGNING IN...
                        </>
                      ) : (
                        <>
                          LOGIN <LogIn className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>

                <motion.div
                  className="my-2.5 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-slate-500"
                  initial={shouldAnimateIntro ? { opacity: 0, y: 10 } : false}
                  animate={shouldAnimateIntro && sceneReady ? { opacity: 1, y: 0 } : undefined}
                  transition={shouldAnimateIntro ? { duration: 0.28, ease: "easeOut", delay: 2.3 } : undefined}
                >
                  <span className="h-px flex-1 bg-white/10" />
                  OR
                  <span className="h-px flex-1 bg-white/10" />
                </motion.div>

                <div className="space-y-1.5">
                  <motion.div
                    initial={shouldAnimateIntro ? { opacity: 0, y: 12 } : false}
                    animate={shouldAnimateIntro && sceneReady ? { opacity: 1, y: 0 } : undefined}
                    transition={shouldAnimateIntro ? { duration: 0.28, ease: "easeOut", delay: 2.38 } : undefined}
                  >
                    <SocialButton label="Continue with Google" onClick={() => setComingSoon("google")} />
                  </motion.div>
                  <motion.div
                    initial={shouldAnimateIntro ? { opacity: 0, y: 12 } : false}
                    animate={shouldAnimateIntro && sceneReady ? { opacity: 1, y: 0 } : undefined}
                    transition={shouldAnimateIntro ? { duration: 0.28, ease: "easeOut", delay: 2.46 } : undefined}
                  >
                    <SocialButton label="Continue with Apple" onClick={() => setComingSoon("apple")} />
                  </motion.div>
                </div>

                <AnimatePresence mode="wait">
                  {comingSoon && (
                    <motion.p
                      key={comingSoon}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-1.5 text-center text-[11px] text-slate-500"
                    >
                      {comingSoon === "google" ? "Google" : "Apple"} sign-in isn't wired up yet — use email and password for now.
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.p
                  className="mt-2.5 text-center text-xs text-slate-400"
                  initial={shouldAnimateIntro ? { opacity: 0, y: 10 } : false}
                  animate={shouldAnimateIntro && sceneReady ? { opacity: 1, y: 0 } : undefined}
                  transition={shouldAnimateIntro ? { duration: 0.28, ease: "easeOut", delay: 2.54 } : undefined}
                >
                  Don't have an account?{" "}
                  <Link to="/register" className="font-semibold text-amber-300 hover:underline">
                    Sign Up
                  </Link>
                </motion.p>

                {import.meta.env.DEV && (
                  <motion.div
                    initial={shouldAnimateIntro ? { opacity: 0, y: 12 } : false}
                    animate={shouldAnimateIntro && sceneReady ? { opacity: 1, y: 0 } : undefined}
                    transition={shouldAnimateIntro ? { duration: 0.28, ease: "easeOut", delay: 2.62 } : undefined}
                  >
                    <DevQuickAccess />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      <div className="absolute left-4 top-4 z-[4] inline-flex items-center gap-2">
        <Button
          type="button"
          onClick={toggleLang}
          title={lang === "en" ? "Switch to Arabic" : "Switch to English"}
          aria-label="Toggle language"
          variant="ghost"
          size="icon"
          className="rounded-full border border-white/10 bg-black/30 text-slate-300 backdrop-blur-sm hover:bg-black/50 hover:text-white"
        >
          <Globe className="h-4 w-4" />
        </Button>
        <SoundToggle />
      </div>

      <Button
        asChild
        variant="ghost"
        className="absolute right-4 top-4 z-[4] inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-2 text-xs font-medium text-slate-200 backdrop-blur-sm transition-colors hover:bg-black/50 hover:text-white"
      >
        <Link to="/">
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
      </Button>
    </div>
  );
}

function SocialButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className="flex h-10 w-full items-center justify-center rounded-xl border border-amber-300/25 bg-white/[0.02] text-sm text-slate-100 hover:!bg-white/[0.05] hover:!text-slate-100"
    >
      {label}
    </Button>
  );
}

// Dev Quick Access signs in with the real seeded launch accounts via the real
// /api/auth/login endpoint - no fake tokens, no fake user.id assignments.
const QUICK_ACCESS_ACCOUNTS = [
  { label: "Student", role: "student" as const, age: 16, email: "student@classz-launch.dev", password: "LaunchStudent123!" },
  { label: "Teacher", role: "teacher" as const, age: 35, email: "teacher@classz-launch.dev", password: "LaunchTeacher123!" },
  { label: "Parent", role: "parent" as const, age: 40, email: "parent@classz-launch.dev", password: "LaunchParent123!" },
  { label: "Assistant", role: "assistant" as const, age: 28, email: "assistant@classz-launch.dev", password: "LaunchAssistant123!" },
  { label: "Admin", role: "admin" as const, age: 30, email: "admin@classz-launch.dev", password: "LaunchAdmin123!" },
  { label: "Finance", role: "finance" as const, age: 32, email: "finance@classz-launch.dev", password: "LaunchFinance123!" },
] as const;

function DevQuickAccess() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const setAge = useVisualModeStore((s) => s.setAge);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleQuickLogin = async (account: (typeof QUICK_ACCESS_ACCOUNTS)[number]) => {
    setError("");
    setLoadingRole(account.role);
    try {
      const res = await loginApi(account.email, account.password);
      login(res.access_token, res.user, res.refresh_token);
      setAge(account.age);
      navigate({ to: ROLES[res.user.role]?.home || "/" });
    } catch (err) {
      setError(
        err instanceof ApiError && typeof err.body === "object" && err.body !== null && "detail" in err.body
          ? String((err.body as { detail: string }).detail)
          : "Dev Quick Access failed - is the backend running?",
      );
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="mt-3 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-2.5">
      <p className="mb-0.5 text-center text-[10px] font-semibold uppercase tracking-wide text-amber-400">Dev Quick Access</p>
      <p className="mb-1.5 text-center text-[10px] leading-tight text-slate-500">Signs in with the real seeded launch accounts.</p>
      {error && <p className="mb-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-[11px] text-red-300">{error}</p>}
      <div className="grid grid-cols-2 gap-1.5">
        {QUICK_ACCESS_ACCOUNTS.map((account) => (
          <button
            key={account.role}
            type="button"
            onClick={() => handleQuickLogin(account)}
            disabled={loadingRole !== null}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1 text-center text-xs font-medium text-slate-200 transition-colors hover:bg-white/[0.08] disabled:opacity-50"
          >
            {loadingRole === account.role ? "Signing in..." : account.label}
          </button>
        ))}
        <Link
          to="/courses"
          className="col-span-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1 text-center text-xs font-medium text-slate-200 transition-colors hover:bg-white/[0.08]"
        >
          Courses Store (Public)
        </Link>
      </div>
    </div>
  );
}
