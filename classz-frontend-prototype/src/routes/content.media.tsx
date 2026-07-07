import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Image, FileText, Play, Search, Download,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { ROLES } from "@/lib/roles";
import { mediaItems } from "@/lib/content-manager-mock-data";

export const Route = createFileRoute("/content/media")({
  component: MediaPage,
});

const fileTypeConfig: Record<string, { icon: typeof FileText; color: string; bg: string }> = {
  pdf: { icon: FileText, color: "text-rose-500", bg: "bg-rose-500/10" },
  image: { icon: Image, color: "text-blue-500", bg: "bg-blue-500/10" },
  video: { icon: Play, color: "text-violet-500", bg: "bg-violet-500/10" },
};

function MediaPage() {
  const { t } = useApp();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const filtered = mediaItems.filter((item) => {
    if (search && !item.name.toLowerCase().includes(search.toLowerCase()) && !item.course.toLowerCase().includes(search.toLowerCase())) return false;
    if (tab === "pdfs" && item.type !== "pdf") return false;
    if (tab === "images" && item.type !== "image") return false;
    if (tab === "videos" && item.type !== "video") return false;
    return true;
  });

  return (
    <DashPage role="content" title="cm.mediaLibrary" subtitle="cm.mediaLibrarySubtitle" icon={Image}>
      {/* ── Search ── */}
      <Card className="border bg-card p-4">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("cm.searchMedia")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
      </Card>

      {/* ── Tabs + Grid ── */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">{t("cm.all")}</TabsTrigger>
          <TabsTrigger value="pdfs">{t("cm.pdfs")}</TabsTrigger>
          <TabsTrigger value="images">{t("cm.images")}</TabsTrigger>
          <TabsTrigger value="videos">{t("cm.videos")}</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">{t("cm.noResults")}</div>
          ) : (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((item) => {
                const config = fileTypeConfig[item.type];
                const Icon = config.icon;
                return (
                  <Card key={item.id} className="border bg-card p-4 transition-all hover:shadow-lg group cursor-pointer">
                    {/* File type icon */}
                    <div className={cn("grid h-12 w-12 place-items-center rounded-xl mb-3", config.bg)}>
                      <Icon className={cn("h-6 w-6", config.color)} />
                    </div>

                    {/* Name */}
                    <p className="text-sm font-semibold truncate mb-1 group-hover:text-primary transition-colors">{item.name}</p>

                    {/* Size + Course */}
                    <p className="text-xs text-muted-foreground truncate">{item.size} &middot; {item.course}</p>

                    {/* Uploaded by + Date */}
                    <p className="text-xs text-muted-foreground mt-2 truncate">{item.uploadedBy}</p>
                    <p className="text-xs text-muted-foreground">{item.uploadedAt}</p>

                    {/* Downloads */}
                    <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                      <Download className="h-3 w-3" />
                      <span>{item.downloads.toLocaleString()} {t("cm.downloads")}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashPage>
  );
}
