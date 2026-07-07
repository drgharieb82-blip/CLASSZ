import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { StickyNote, Search, Plus, Lock, Globe, Trash2 } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import { atNotes, assignedStudents, type ATNote } from "@/lib/assistant-teacher-mock-data";

export const Route = createFileRoute("/assistant-teacher/notes")({ component: NotesPage });

function NotesPage() {
  const { t } = useApp();
  const [notes, setNotes] = useState<ATNote[]>(atNotes);
  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newStudent, setNewStudent] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newPrivate, setNewPrivate] = useState(true);

  const uniqueStudents = [...new Set(assignedStudents.map((s) => s.name))];

  const filtered = useMemo(() => {
    if (!search) return notes;
    const q = search.toLowerCase();
    return notes.filter((n) => n.student.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
  }, [notes, search]);

  const privateCount = notes.filter((n) => n.private).length;
  const sharedCount = notes.filter((n) => !n.private).length;

  const handleAddNote = () => {
    if (!newStudent || !newContent) return;
    const newNote: ATNote = {
      id: `NT-${String(notes.length + 1).padStart(3, "0")}`,
      student: newStudent,
      content: newContent,
      date: new Date().toISOString().split("T")[0],
      private: newPrivate,
    };
    setNotes((prev) => [newNote, ...prev]);
    setShowAddDialog(false);
    setNewStudent("");
    setNewContent("");
    setNewPrivate(true);
  };

  const handleDelete = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <DashPage
      role="assistant_teacher"
      title="at.notes"
      subtitle="at.notesSubtitle"
      icon={ROLES.assistant_teacher.icon}
      actions={
        <Button size="sm" className="rounded-lg gap-1.5 text-xs" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-3.5 w-3.5" />{t("at.addNote")}
        </Button>
      }
    >
      {/* Summary */}
      <div className="grid gap-3 grid-cols-3">
        <Card className="flex items-center gap-3 border bg-card p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/10">
            <StickyNote className="h-4.5 w-4.5 text-teal-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{notes.length}</p>
            <p className="text-xs text-muted-foreground">{t("at.totalNotes")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
            <Lock className="h-4.5 w-4.5 text-amber-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{privateCount}</p>
            <p className="text-xs text-muted-foreground">{t("at.private")}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border bg-card p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
            <Globe className="h-4.5 w-4.5 text-blue-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{sharedCount}</p>
            <p className="text-xs text-muted-foreground">{t("at.shared")}</p>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("at.searchNotes")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ps-9 h-9 text-sm bg-muted/30 border"
        />
      </div>

      {/* Notes grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((note) => (
          <Card key={note.id} className="border bg-card p-4 space-y-3 group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{note.student}</p>
                {note.private ? (
                  <Badge variant="outline" className="rounded-full text-[10px] px-1.5 py-0 border-amber-400/40 text-amber-400 bg-amber-500/10 gap-0.5">
                    <Lock className="h-2.5 w-2.5" />{t("at.private")}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="rounded-full text-[10px] px-1.5 py-0 border-blue-400/40 text-blue-400 bg-blue-500/10 gap-0.5">
                    <Globe className="h-2.5 w-2.5" />{t("at.shared")}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(note.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{note.content}</p>
            <p className="text-[10px] text-muted-foreground">{note.date}</p>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
            {t("at.noNotesFound")}
          </div>
        )}
      </div>

      {/* Add Note Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">{t("at.addNote")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">{t("at.student")}</Label>
              <Select value={newStudent} onValueChange={setNewStudent}>
                <SelectTrigger className="h-9 text-sm bg-muted/30 border">
                  <SelectValue placeholder={t("at.selectStudent")} />
                </SelectTrigger>
                <SelectContent>
                  {uniqueStudents.map((name) => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">{t("at.content")}</Label>
              <textarea
                rows={4}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder={t("at.noteContentPlaceholder")}
                className="w-full rounded-lg border bg-muted/30 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">{t("at.privateNote")}</Label>
                <p className="text-[10px] text-muted-foreground">{t("at.privateNoteDesc")}</p>
              </div>
              <Switch checked={newPrivate} onCheckedChange={setNewPrivate} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAddDialog(false)} className="rounded-lg">
              {t("at.cancel")}
            </Button>
            <Button size="sm" onClick={handleAddNote} disabled={!newStudent || !newContent} className="rounded-lg">
              {t("at.saveNote")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashPage>
  );
}
