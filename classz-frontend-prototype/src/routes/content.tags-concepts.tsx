import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Hash, Search, Plus } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { ROLES } from "@/lib/roles";
import { tagsConcepts, type TagConcept } from "@/lib/content-manager-mock-data";

export const Route = createFileRoute("/content/tags-concepts")({
  component: TagsConceptsPage,
});

const typeBadgeCfg: Record<string, { cls: string }> = {
  tag: { cls: "bg-slate-500/10 text-slate-600 border-slate-300" },
  concept: { cls: "bg-blue-500/10 text-blue-600 border-blue-300" },
  "atomic-concept": { cls: "bg-violet-500/10 text-violet-600 border-violet-300" },
};

const statusBadgeCfg: Record<string, { cls: string }> = {
  active: { cls: "bg-emerald-500/10 text-emerald-600 border-emerald-300" },
  deprecated: { cls: "bg-amber-500/10 text-amber-600 border-amber-300" },
};

function TagsConceptsPage() {
  const { t } = useApp();
  const [items, setItems] = useState<TagConcept[]>(tagsConcepts);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"tag" | "concept" | "atomic-concept">("tag");
  const [newSubject, setNewSubject] = useState("");

  const filtered = items.filter((item) => {
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (tab === "tags" && item.type !== "tag") return false;
    if (tab === "concepts" && item.type !== "concept") return false;
    if (tab === "atomic" && item.type !== "atomic-concept") return false;
    return true;
  });

  function handleAdd() {
    if (!newName.trim()) return;
    const newItem: TagConcept = {
      id: `TC-${String(items.length + 1).padStart(3, "0")}`,
      name: newName.trim(),
      type: newType,
      subject: newSubject.trim() || "General",
      usageCount: 0,
      status: "active",
    };
    setItems((prev) => [newItem, ...prev]);
    setNewName("");
    setNewType("tag");
    setNewSubject("");
    setDialogOpen(false);
  }

  return (
    <DashPage
      role="content"
      title="cm.tagsConcepts"
      subtitle="cm.tagsConceptsSubtitle"
      icon={Hash}
      actions={
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 me-1" /> {t("cm.addTagConcept")}
        </Button>
      }
    >
      {/* ── Search ── */}
      <Card className="border bg-card p-4">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("cm.searchTagsConcepts")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
      </Card>

      {/* ── Tabs + Table ── */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">{t("cm.all")}</TabsTrigger>
          <TabsTrigger value="tags">{t("cm.tags")}</TabsTrigger>
          <TabsTrigger value="concepts">{t("cm.concepts")}</TabsTrigger>
          <TabsTrigger value="atomic">{t("cm.atomicConcepts")}</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <Card className="border bg-card p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-start text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pe-4 text-start font-medium">{t("cm.name")}</th>
                    <th className="py-2 pe-4 text-start font-medium">{t("cm.type")}</th>
                    <th className="py-2 pe-4 text-start font-medium">{t("cm.subject")}</th>
                    <th className="py-2 pe-4 text-start font-medium">{t("cm.usageCount")}</th>
                    <th className="py-2 text-start font-medium">{t("cm.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="border-b border-border/50 transition-colors hover:bg-accent/40">
                      <td className="py-2.5 pe-4 font-medium">{item.name}</td>
                      <td className="py-2.5 pe-4">
                        <Badge variant="outline" className={cn("text-xs rounded-full capitalize", typeBadgeCfg[item.type]?.cls)}>
                          {item.type}
                        </Badge>
                      </td>
                      <td className="py-2.5 pe-4 text-muted-foreground">{item.subject}</td>
                      <td className="py-2.5 pe-4 text-muted-foreground">{item.usageCount.toLocaleString()}</td>
                      <td className="py-2.5">
                        <Badge variant="outline" className={cn("text-xs rounded-full capitalize", statusBadgeCfg[item.status]?.cls)}>
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">{t("cm.noResults")}</div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Add Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("cm.addTagConcept")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("cm.name")}</label>
              <Input
                placeholder={t("cm.enterName")}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("cm.type")}</label>
              <Select value={newType} onValueChange={(v) => setNewType(v as "tag" | "concept" | "atomic-concept")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tag">{t("cm.tag")}</SelectItem>
                  <SelectItem value="concept">{t("cm.concept")}</SelectItem>
                  <SelectItem value="atomic-concept">{t("cm.atomicConcept")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("cm.subject")}</label>
              <Input
                placeholder={t("cm.enterSubject")}
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("cm.cancel")}</Button>
            <Button onClick={handleAdd}>{t("cm.add")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashPage>
  );
}
