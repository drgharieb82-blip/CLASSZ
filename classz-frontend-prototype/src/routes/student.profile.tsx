import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Loader2, Save, UserRound } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ROLES } from "@/lib/roles";
import { ApiError } from "@/lib/api/client";
import { getMyProfile, updateMyProfile, type StudentProfileRead } from "@/lib/api/student";

export const Route = createFileRoute("/student/profile")({
  component: StudentProfilePage,
});

function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfileRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getMyProfile()
      .then((response) => {
        if (!active) return;
        setProfile(response);
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
    if (!profile) return;
    setSaving(true);
    try {
      const response = await updateMyProfile({
        full_name: profile.full_name,
        headline: profile.headline,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
      });
      setProfile(response);
      setError("");
    } catch (err) {
      setError(extractDetail(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashPage role="student" title="Profile" subtitle="Keep your public profile fresh." icon={ROLES.student.icon}>
      {loading ? (
        <Card className="border bg-card p-8 text-sm text-muted-foreground">Loading profile...</Card>
      ) : profile ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <Card className="border bg-card p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/10">
                <UserRound className="h-6 w-6 text-violet-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Public code {profile.public_code}</p>
                <h2 className="text-xl font-semibold">{profile.full_name}</h2>
              </div>
            </div>

            <div className="grid gap-4">
              <Field label="Full name">
                <Input value={profile.full_name} onChange={(event) => setProfile({ ...profile, full_name: event.target.value })} />
              </Field>
              <Field label="Headline">
                <Input
                  value={profile.headline ?? ""}
                  onChange={(event) => setProfile({ ...profile, headline: event.target.value })}
                  placeholder="e.g. Grade 12 student"
                />
              </Field>
              <Field label="Avatar URL">
                <Input
                  value={profile.avatar_url ?? ""}
                  onChange={(event) => setProfile({ ...profile, avatar_url: event.target.value })}
                  placeholder="https://..."
                />
              </Field>
              <Field label="Bio">
                <Textarea
                  value={profile.bio ?? ""}
                  onChange={(event) => setProfile({ ...profile, bio: event.target.value })}
                  placeholder="Tell people a little about your study goals."
                  rows={6}
                />
              </Field>

              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={saving} className="rounded-xl gradient-brand border-0 text-white">
                  {saving ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Save className="me-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>

          <Card className="border bg-card p-6">
            <h3 className="font-semibold">Account info</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <Item label="Email" value={profile.email} />
              <Item label="Timezone" value={profile.timezone} />
              <Item label="Language" value={profile.language} />
              <Item label="Theme" value={profile.theme} />
              <Item label="Study goal" value={`${profile.study_goal_minutes} minutes/day`} />
              <Item label="Notifications" value={profile.notifications_enabled ? "Enabled" : "Disabled"} />
            </dl>
          </Card>
        </div>
      ) : null}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </DashPage>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right text-slate-200">{value}</dd>
    </div>
  );
}

function extractDetail(error: unknown): string {
  if (error instanceof ApiError && typeof error.body === "object" && error.body !== null && "detail" in error.body) {
    return String((error.body as { detail: string }).detail);
  }
  return "Unable to load profile.";
}
