import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Gamepad2, Loader2, Moon, Save, Settings, Sparkles, Sun, Volume2, VolumeX } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { ParentAccessCard } from "@/components/student/ParentAccessCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { ApiError } from "@/lib/api/client";
import { getMySettings, updateMySettings, type StudentProfileRead } from "@/lib/api/student";

export const Route = createFileRoute("/student/settings")({
  component: StudentSettingsPage,
});

function StudentSettingsPage() {
  const [settings, setSettings] = useState<StudentProfileRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const {
    theme,
    setTheme,
    uiSoundsEnabled,
    toggleUiSounds,
    cinematicLoginMotionEnabled,
    toggleCinematicLoginMotion,
  } = useApp();

  useEffect(() => {
    let active = true;
    getMySettings()
      .then((response) => {
        if (!active) return;
        setSettings(response);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(extractDetail(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const response = await updateMySettings({
        timezone: settings.timezone,
        language: settings.language,
        theme,
        notifications_enabled: settings.notifications_enabled,
        email_notifications: settings.email_notifications,
        push_notifications: settings.push_notifications,
        weekly_digest_enabled: settings.weekly_digest_enabled,
        study_reminder_enabled: settings.study_reminder_enabled,
        study_goal_minutes: settings.study_goal_minutes,
      });
      setSettings(response);
      setError("");
    } catch (err) {
      setError(extractDetail(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashPage role="student" title="Settings" subtitle="Personalize notifications and study preferences." icon={ROLES.student.icon}>
      {loading ? (
        <Card className="border bg-card p-8 text-sm text-muted-foreground">Loading settings...</Card>
      ) : settings ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <div className="space-y-6">
            <Card className="border bg-card p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/10">
                  <Settings className="h-6 w-6 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Student preferences</p>
                  <h2 className="text-xl font-semibold">{settings.full_name}</h2>
                </div>
              </div>

              <div className="grid gap-4">
                <Field label="Timezone" description="Used for reminders, schedules, and due dates.">
                  <Input value={settings.timezone} onChange={(event) => setSettings({ ...settings, timezone: event.target.value })} />
                </Field>
                <Field label="Language" description="Controls the language used in your student experience.">
                  <Input value={settings.language} onChange={(event) => setSettings({ ...settings, language: event.target.value })} />
                </Field>
                <Field label="Study goal minutes/day" description="Sets your daily study target for progress tracking.">
                  <Input
                    type="number"
                    min={5}
                    max={600}
                    value={settings.study_goal_minutes}
                    onChange={(event) => setSettings({ ...settings, study_goal_minutes: Number(event.target.value) })}
                  />
                </Field>
              </div>
            </Card>

            <Card className="border bg-card p-6">
              <h3 className="font-semibold">Notifications</h3>
              <div className="mt-4 space-y-4">
                <ToggleRow
                  label="Enable notifications"
                  description="Turn all student notifications on or off."
                  checked={settings.notifications_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, notifications_enabled: checked })}
                />
                <ToggleRow
                  label="Email notifications"
                  description="Get important updates in your inbox."
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, email_notifications: checked })}
                />
                <ToggleRow
                  label="Push notifications"
                  description="Receive browser or device alerts when available."
                  checked={settings.push_notifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, push_notifications: checked })}
                />
                <ToggleRow
                  label="Weekly digest"
                  description="Get a summary of your learning each week."
                  checked={settings.weekly_digest_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, weekly_digest_enabled: checked })}
                />
                <ToggleRow
                  label="Study reminders"
                  description="Prompt yourself to stay on schedule."
                  checked={settings.study_reminder_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, study_reminder_enabled: checked })}
                />
              </div>
            </Card>

            <ParentAccessCard />
          </div>

          <Card className="border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10">
                <Sparkles className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Experience</p>
                <h3 className="text-xl font-semibold">Personalize how CLASSZ feels</h3>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold">UI Sounds</h4>
                  <p className="text-sm text-muted-foreground">Controls hover, click, success, and error sounds everywhere in the app.</p>
                </div>
                <ToggleRow
                  label={uiSoundsEnabled ? "Sounds on" : "Sounds off"}
                  description={uiSoundsEnabled ? "Sound feedback is currently enabled." : "Sound feedback is currently disabled."}
                  checked={uiSoundsEnabled}
                  onCheckedChange={toggleUiSounds}
                  icon={uiSoundsEnabled ? Volume2 : VolumeX}
                />
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold">Cinematic Login Motion</h4>
                  <p className="text-sm text-muted-foreground">Plays the staged login intro unless reduced-motion is requested.</p>
                </div>
                <ToggleRow
                  label={cinematicLoginMotionEnabled ? "Login motion on" : "Login motion off"}
                  description={cinematicLoginMotionEnabled ? "The login intro animates in stages." : "The login page appears instantly."}
                  checked={cinematicLoginMotionEnabled}
                  onCheckedChange={toggleCinematicLoginMotion}
                  icon={Sparkles}
                />
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold">Theme</h4>
                  <p className="text-sm text-muted-foreground">Choose a full app theme without cycling through options.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { value: "light" as const, label: "Light", description: "Bright, clean, and simple.", icon: Sun },
                    { value: "dark" as const, label: "Dark", description: "Balanced contrast for long study sessions.", icon: Moon },
                    { value: "game" as const, label: "Game", description: "High-energy mode for a more playful feel.", icon: Gamepad2 },
                  ].map((option) => {
                    const active = theme === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setTheme(option.value)}
                        className={cn(
                          "rounded-2xl border p-4 text-start transition-all",
                          active
                            ? "border-amber-400/50 bg-amber-400/10 shadow-[0_0_0_1px_rgba(251,191,36,0.15)]"
                            : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]",
                        )}
                      >
                        <option.icon className={cn("h-5 w-5", active ? "text-amber-400" : "text-muted-foreground")} />
                        <p className="mt-3 text-sm font-semibold">{option.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={saving} className="rounded-xl gradient-brand border-0 text-white">
                  {saving ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Save className="me-2 h-4 w-4" />}
                  Save Settings
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </DashPage>
  );
}

function Field({ label, description, children }: { label: string; description?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
  icon: Icon = Sparkles,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon?: typeof Sparkles;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg bg-white/5">
          <Icon className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-100">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function extractDetail(error: unknown): string {
  if (error instanceof ApiError && typeof error.body === "object" && error.body !== null && "detail" in error.body) {
    return String((error.body as { detail: string }).detail);
  }
  return "Unable to load settings.";
}
