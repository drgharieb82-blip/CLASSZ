import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/roles";
import { ApiError } from "@/lib/api/client";
import {
  getAssistantPermissions,
  listMyAssistants,
  updateAssistantPermissions,
  type AssistantAction,
  type AssistantLinkRead,
  type AssistantResource,
} from "@/lib/api/assistants";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/team/roles")({
  component: RolesPage,
});

const RESOURCE_LABELS: Record<AssistantResource, string> = {
  chapters_lessons: "Chapters & Lessons",
  materials: "Materials",
  sessions: "Sessions & Videos",
  questions: "Content Studio (Questions)",
  quizzes: "Quizzes",
  homework: "Homework",
  grading: "Grading",
  students_data: "Student Data (view)",
  pods: "Student Pods",
  parent_contacts: "Parent Contacts",
  anti_cheating: "Anti-Cheating Events (view)",
  quiz_submissions: "Quiz Submissions",
};

const ACTIONS: AssistantAction[] = ["view", "create", "edit", "delete", "grade"];

// Actions that don't have a real backing endpoint for a given resource yet
// (e.g. no edit/delete-question endpoint exists) are hidden from the grid.
const APPLICABLE_ACTIONS: Record<AssistantResource, AssistantAction[]> = {
  chapters_lessons: ["create", "edit", "delete"],
  materials: ["create", "edit", "delete"],
  sessions: ["create", "edit", "delete", "view"],
  questions: ["create", "edit", "view"],
  quizzes: ["create", "view"],
  homework: ["create", "view"],
  grading: ["view", "grade"],
  students_data: ["view"],
  pods: ["create", "edit", "delete", "view"],
  parent_contacts: ["create", "edit", "delete", "view"],
  anti_cheating: ["view"],
  quiz_submissions: ["view", "grade"],
};

const RESOURCES = Object.keys(RESOURCE_LABELS) as AssistantResource[];

interface GrantKey {
  resource: AssistantResource;
  action: AssistantAction;
}

function key(g: GrantKey): string {
  return `${g.resource}:${g.action}`;
}

function RolesPage() {
  const [assistants, setAssistants] = useState<AssistantLinkRead[]>([]);
  const [selectedLinkId, setSelectedLinkId] = useState("");
  const [grants, setGrants] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const list = await listMyAssistants();
        const active = list.filter((a) => a.status === "active");
        setAssistants(active);
        if (active.length > 0) setSelectedLinkId(active[0].link_id);
        setError("");
      } catch (err) {
        setError(extractDetail(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedLinkId) {
      setGrants(new Set());
      return;
    }
    void getAssistantPermissions(selectedLinkId).then((list) => {
      setGrants(new Set(list.map((g) => key(g))));
    });
  }, [selectedLinkId]);

  const toggle = (resource: AssistantResource, action: AssistantAction) => {
    const k = key({ resource, action });
    setGrants((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const save = async () => {
    if (!selectedLinkId) return;
    setSaving(true);
    try {
      const grantList = Array.from(grants).map((k) => {
        const [resource, action] = k.split(":") as [AssistantResource, AssistantAction];
        return { resource, action };
      });
      await updateAssistantPermissions(selectedLinkId, grantList);
    } catch (err) {
      setError(extractDetail(err));
    } finally {
      setSaving(false);
    }
  };

  const selectedAssistant = useMemo(
    () => assistants.find((a) => a.link_id === selectedLinkId),
    [assistants, selectedLinkId],
  );

  return (
    <DashPage
      role="teacher"
      title="Assistant Permissions"
      subtitle="Grant a specific assistant exactly the actions they need — nothing more."
      icon={ROLES.teacher.icon}
    >
      {loading ? (
        <Card className="border bg-card p-8 text-sm text-muted-foreground">Loading...</Card>
      ) : assistants.length === 0 ? (
        <Card className="border bg-card p-8 text-sm text-muted-foreground">
          No active assistants yet. Invite one from Team &gt; Invitations.
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {assistants.map((a) => (
              <button
                key={a.link_id}
                onClick={() => setSelectedLinkId(a.link_id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  selectedLinkId === a.link_id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {a.full_name}
              </button>
            ))}
          </div>

          {selectedAssistant && (
            <Card className="border bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b p-4">
                <div>
                  <h3 className="font-semibold">{selectedAssistant.full_name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedAssistant.public_code}</p>
                </div>
                <button
                  onClick={() => void save()}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl gradient-brand border-0 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save permissions
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="sticky start-0 z-10 min-w-[220px] bg-muted/30 px-4 py-3 text-start font-semibold text-muted-foreground">
                        Resource
                      </th>
                      {ACTIONS.map((action) => (
                        <th key={action} className="px-3 py-3 text-center capitalize">
                          <Badge variant="outline" className="rounded-full text-[10px]">{action}</Badge>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {RESOURCES.map((resource, i) => (
                      <tr key={resource} className={cn("border-b hover:bg-accent/30", i % 2 === 0 && "bg-muted/10")}>
                        <td className="sticky start-0 z-10 bg-inherit px-4 py-3 font-medium">
                          {RESOURCE_LABELS[resource]}
                        </td>
                        {ACTIONS.map((action) => {
                          const applicable = APPLICABLE_ACTIONS[resource].includes(action);
                          if (!applicable) {
                            return <td key={action} className="px-3 py-3 text-center text-muted-foreground/20">—</td>;
                          }
                          const allowed = grants.has(key({ resource, action }));
                          return (
                            <td key={action} className="px-3 py-3 text-center">
                              <button
                                onClick={() => toggle(resource, action)}
                                className={cn(
                                  "inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                                  allowed
                                    ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                                    : "bg-muted/50 text-muted-foreground/40 hover:bg-muted",
                                )}
                              >
                                {allowed ? <Check className="h-4 w-4" /> : <X className="h-3.5 w-3.5" />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </DashPage>
  );
}

function extractDetail(error: unknown): string {
  if (error instanceof ApiError && typeof error.body === "object" && error.body !== null && "detail" in error.body) {
    return String((error.body as { detail: string }).detail);
  }
  return "Something went wrong.";
}
