import { createFileRoute } from "@tanstack/react-router";
import { Gamepad2, Moon, Sparkles, Sun, User, Volume2, VolumeX } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { useAuthStore } from "@/lib/stores/auth-store";

export const Route = createFileRoute("/parent/settings")({
  component: ParentSettingsPage,
});

function ParentSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const {
    theme,
    setTheme,
    uiSoundsEnabled,
    toggleUiSounds,
    cinematicLoginMotionEnabled,
    toggleCinematicLoginMotion,
  } = useApp();

  return (
    <DashPage role="parent" title="Settings" subtitle="Your account and experience preferences." icon={ROLES.parent.icon}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="space-y-6">
          <Card className="border bg-card p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/10">
                <User className="h-6 w-6 text-violet-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Parent account</p>
                <h2 className="text-xl font-semibold">{user?.full_name ?? "—"}</h2>
              </div>
            </div>

            <div className="grid gap-4">
              <InfoRow label="Email" value={user?.email ?? "—"} />
              <InfoRow label="Account code" value={user?.publicCode ?? "—"} />
              <InfoRow label="Role" value="Parent" />
            </div>
          </Card>
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
          </div>
        </Card>
      </div>
    </DashPage>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-slate-100">{value}</span>
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
