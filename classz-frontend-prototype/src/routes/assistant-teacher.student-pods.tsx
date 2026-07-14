import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UsersRound, Plus, Pencil, Trash2, UserPlus, X, Inbox } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { ROLES } from "@/lib/roles";
import { useApp } from "@/lib/app-context";
import { useAssistantScopedCourses, extractErrorDetail } from "@/hooks/use-assistant-scope";
import {
  listPods, createPod, updatePod, deletePod, addPodMember, removePodMember,
  getRoster, type StudentPodRead, type StudentRosterEntry,
} from "@/lib/api/students";

export const Route = createFileRoute("/assistant-teacher/student-pods")({ component: StudentPodsPage });

function StudentPodsPage() {
  const { t } = useApp();
  const { courses, loading: coursesLoading, error: coursesError, hasPermission } = useAssistantScopedCourses("pods", "view");
  const [courseId, setCourseId] = useState<string>("");
  const [pods, setPods] = useState<StudentPodRead[]>([]);
  const [podsLoading, setPodsLoading] = useState(false);
  const [podsError, setPodsError] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editPod, setEditPod] = useState<StudentPodRead | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const [deletePodTarget, setDeletePodTarget] = useState<StudentPodRead | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  const [memberPod, setMemberPod] = useState<StudentPodRead | null>(null);
  const [roster, setRoster] = useState<StudentRosterEntry[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [memberError, setMemberError] = useState("");

  useEffect(() => {
    if (!courseId && courses.length > 0) setCourseId(courses[0].course.id);
  }, [courses, courseId]);

  const refreshPods = async (cid: string) => {
    setPodsLoading(true);
    setPodsError("");
    try {
      setPods(await listPods(cid));
    } catch (err) {
      setPodsError(extractErrorDetail(err));
    } finally {
      setPodsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) void refreshPods(courseId);
  }, [courseId]);

  const canCreate = courseId ? hasPermission(courseId, "pods", "create") : false;
  const canEdit = courseId ? hasPermission(courseId, "pods", "edit") : false;
  const canDelete = courseId ? hasPermission(courseId, "pods", "delete") : false;
  const canViewRoster = courseId ? hasPermission(courseId, "students_data", "view") : false;

  const openCreate = () => {
    setCreateName("");
    setCreateDescription("");
    setCreateError("");
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!createName.trim()) return;
    setCreateSaving(true);
    setCreateError("");
    try {
      await createPod(courseId, createName.trim(), createDescription.trim() || undefined);
      setCreateOpen(false);
      await refreshPods(courseId);
    } catch (err) {
      setCreateError(extractErrorDetail(err));
    } finally {
      setCreateSaving(false);
    }
  };

  const openEdit = (pod: StudentPodRead) => {
    setEditPod(pod);
    setEditName(pod.name);
    setEditDescription(pod.description ?? "");
    setEditError("");
  };

  const handleEdit = async () => {
    if (!editPod || !editName.trim()) return;
    setEditSaving(true);
    setEditError("");
    try {
      await updatePod(editPod.id, { name: editName.trim(), description: editDescription.trim() || undefined });
      setEditPod(null);
      await refreshPods(courseId);
    } catch (err) {
      setEditError(extractErrorDetail(err));
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePodTarget) return;
    setDeleteSaving(true);
    try {
      await deletePod(deletePodTarget.id);
      setDeletePodTarget(null);
      await refreshPods(courseId);
    } catch (err) {
      setPodsError(extractErrorDetail(err));
      setDeletePodTarget(null);
    } finally {
      setDeleteSaving(false);
    }
  };

  const openMembers = async (pod: StudentPodRead) => {
    setMemberPod(pod);
    setMemberError("");
    if (canViewRoster) {
      setRosterLoading(true);
      try {
        setRoster(await getRoster(courseId));
      } catch (err) {
        setMemberError(extractErrorDetail(err));
      } finally {
        setRosterLoading(false);
      }
    }
  };

  const handleAddMember = async (studentId: string) => {
    if (!memberPod) return;
    setMemberError("");
    try {
      const updated = await addPodMember(memberPod.id, studentId);
      setMemberPod(updated);
      await refreshPods(courseId);
    } catch (err) {
      setMemberError(extractErrorDetail(err));
    }
  };

  const handleRemoveMember = async (studentId: string) => {
    if (!memberPod) return;
    setMemberError("");
    try {
      await removePodMember(memberPod.id, studentId);
      setMemberPod({ ...memberPod, members: memberPod.members.filter((m) => m.student_id !== studentId) });
      await refreshPods(courseId);
    } catch (err) {
      setMemberError(extractErrorDetail(err));
    }
  };

  const availableToAdd = roster.filter((r) => !memberPod?.members.some((m) => m.student_id === r.student_id));

  return (
    <DashPage
      role="assistant"
      title="at.studentPods"
      subtitle="at.studentPodsSubtitle"
      icon={ROLES.assistant.icon}
      actions={canCreate ? (
        <Button size="sm" className="rounded-xl gap-1.5" onClick={openCreate}>
          <Plus className="h-4 w-4" /> {t("at.createPod")}
        </Button>
      ) : undefined}
    >
      {coursesLoading ? (
        <Card className="border bg-card p-8 text-center text-sm text-muted-foreground">{t("common.loading")}</Card>
      ) : coursesError ? (
        <Card className="border border-destructive/40 bg-destructive/5 p-8 text-center text-sm text-destructive">{coursesError}</Card>
      ) : courses.length === 0 ? (
        <Card className="border bg-card p-8 text-center text-sm text-muted-foreground">
          {t("at.noPodAccess")}
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger className="w-[260px] h-9 text-sm bg-muted/30 border">
                <SelectValue placeholder={t("at.selectCourse")} />
              </SelectTrigger>
              <SelectContent>
                {courses.map(({ course }) => (
                  <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {podsLoading ? (
            <Card className="border bg-card p-8 text-center text-sm text-muted-foreground">{t("common.loading")}</Card>
          ) : podsError ? (
            <Card className="border border-destructive/40 bg-destructive/5 p-8 text-center text-sm text-destructive">{podsError}</Card>
          ) : pods.length === 0 ? (
            <Card className="border bg-card p-8 text-center text-sm text-muted-foreground">
              <Inbox className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
              {t("at.noPodsYet")}
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pods.map((pod) => (
                <Card key={pod.id} className="border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">{pod.name}</h3>
                      {pod.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{pod.description}</p>}
                    </div>
                    <Badge variant="outline" className="rounded-full text-xs border-teal-400/40 text-teal-400 bg-teal-500/10 shrink-0">
                      <UsersRound className="h-3 w-3 me-1" />{pod.members.length}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {pod.members.slice(0, 4).map((m) => (
                      <Badge key={m.student_id} variant="outline" className="rounded-full text-[10px] px-1.5 py-0">
                        {m.full_name}
                      </Badge>
                    ))}
                    {pod.members.length > 4 && (
                      <Badge variant="outline" className="rounded-full text-[10px] px-1.5 py-0">
                        +{pod.members.length - 4}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <Button variant="outline" size="sm" className="h-7 text-xs rounded-lg gap-1" onClick={() => openMembers(pod)}>
                      <UserPlus className="h-3 w-3" />{t("at.members")}
                    </Button>
                    {canEdit && (
                      <Button variant="outline" size="sm" className="h-7 text-xs rounded-lg gap-1" onClick={() => openEdit(pod)}>
                        <Pencil className="h-3 w-3" />{t("at.editPod")}
                      </Button>
                    )}
                    {canDelete && (
                      <Button variant="outline" size="sm" className="h-7 text-xs rounded-lg gap-1 text-destructive hover:text-destructive" onClick={() => setDeletePodTarget(pod)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create pod dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-base">{t("at.createPod")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm">{t("at.podName")}</Label>
              <Input value={createName} onChange={(e) => setCreateName(e.target.value)} className="h-9 text-sm bg-muted/30 border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">{t("at.podDescription")}</Label>
              <Input value={createDescription} onChange={(e) => setCreateDescription(e.target.value)} className="h-9 text-sm bg-muted/30 border" />
            </div>
            {createError && <p className="text-sm text-destructive">{createError}</p>}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)} className="rounded-lg">{t("at.cancel")}</Button>
            <Button size="sm" onClick={handleCreate} disabled={createSaving || !createName.trim()} className="rounded-lg">{t("at.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit pod dialog */}
      <Dialog open={!!editPod} onOpenChange={(open) => !open && setEditPod(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-base">{t("at.editPod")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm">{t("at.podName")}</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-9 text-sm bg-muted/30 border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">{t("at.podDescription")}</Label>
              <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="h-9 text-sm bg-muted/30 border" />
            </div>
            {editError && <p className="text-sm text-destructive">{editError}</p>}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditPod(null)} className="rounded-lg">{t("at.cancel")}</Button>
            <Button size="sm" onClick={handleEdit} disabled={editSaving || !editName.trim()} className="rounded-lg">{t("at.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deletePodTarget} onOpenChange={(open) => !open && setDeletePodTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="text-base">{t("at.deletePod")}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{t("at.deletePodConfirm", { name: deletePodTarget?.name ?? "" })}</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeletePodTarget(null)} className="rounded-lg">{t("at.cancel")}</Button>
            <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleteSaving} className="rounded-lg">{t("at.delete")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Members dialog */}
      <Dialog open={!!memberPod} onOpenChange={(open) => !open && setMemberPod(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-base">{memberPod?.name} · {t("at.members")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {memberPod?.members.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("at.noMembersYet")}</p>
            ) : (
              <div className="space-y-1.5">
                {memberPod?.members.map((m) => (
                  <div key={m.student_id} className="flex items-center justify-between rounded-lg border bg-muted/30 p-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{m.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                    </div>
                    {canEdit && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleRemoveMember(m.student_id)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {canEdit && canViewRoster && (
              <div className="space-y-1.5 pt-2 border-t">
                <Label className="text-sm">{t("at.addMember")}</Label>
                {rosterLoading ? (
                  <p className="text-xs text-muted-foreground">{t("common.loading")}</p>
                ) : availableToAdd.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t("at.noStudentsToAdd")}</p>
                ) : (
                  <Select onValueChange={handleAddMember} value="">
                    <SelectTrigger className="h-9 text-sm bg-muted/30 border">
                      <SelectValue placeholder={t("at.selectStudent")} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableToAdd.map((s) => (
                        <SelectItem key={s.student_id} value={s.student_id}>{s.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
            {memberError && <p className="text-sm text-destructive">{memberError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setMemberPod(null)} className="rounded-lg">{t("at.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashPage>
  );
}
