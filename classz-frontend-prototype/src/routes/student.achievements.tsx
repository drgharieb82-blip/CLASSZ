import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Award, Flame, Lock, Sparkles, Star, Trophy, Zap } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import {
  getXPSummary, getStudentAchievements, ACHIEVEMENTS,
  generateDailyMissions, type AchievementDefinition,
} from "@/lib/xp";
import { VictoryScene } from "@/components/illustrations/Characters";

export const Route = createFileRoute("/student/achievements")({
  component: AchievementsPage,
});

type TabKey = "all" | "learning" | "practice" | "streak" | "mastery" | "social";
const tabs: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "learning", label: "Learning" },
  { key: "practice", label: "Practice" },
  { key: "streak", label: "Streaks" },
  { key: "mastery", label: "Mastery" },
  { key: "social", label: "Social" },
];

function AchievementsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const summary = getXPSummary();
  const studentAchievements = getStudentAchievements();
  const missions = generateDailyMissions();

  const unlockedIds = new Set(studentAchievements.filter((a) => a.isUnlocked).map((a) => a.achievementId));

  const filteredAchievements = ACHIEVEMENTS.filter(
    (a) => activeTab === "all" || a.category === activeTab,
  );
  const unlocked = filteredAchievements.filter((a) => unlockedIds.has(a.achievementId));
  const locked = filteredAchievements.filter((a) => !unlockedIds.has(a.achievementId));

  const missionsComplete = missions.filter((m) => m.completed).length;

  return (
    <DashPage role="student" title="Trophy Room" subtitle="Your achievements, badges, and rewards" icon={ROLES.student.icon}>
      {/* XP & Level Hero */}
      <Card className="relative overflow-hidden border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="rounded-full gradient-brand border-0 text-white text-sm px-3">
                Level {summary.currentLevel.level}
              </Badge>
              <span className="text-sm font-semibold">{summary.currentLevel.title}</span>
            </div>
            <p className="mt-2 text-3xl font-bold">{summary.totalXP.toLocaleString()} XP</p>
            <p className="text-sm text-muted-foreground">
              {summary.xpToNext > 0 ? `${summary.xpToNext.toLocaleString()} XP to next level` : "Max level reached!"}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <Flame className="mx-auto h-5 w-5 text-amber-500" />
              <p className="text-xl font-bold">23</p>
              <p className="text-xs text-muted-foreground">Streak</p>
            </div>
            <div className="text-center">
              <Trophy className="mx-auto h-5 w-5 text-primary" />
              <p className="text-xl font-bold">{summary.unlockedAchievements}</p>
              <p className="text-xs text-muted-foreground">Badges</p>
            </div>
            <div className="text-center">
              <Star className="mx-auto h-5 w-5 text-amber-400" />
              <p className="text-xl font-bold">{summary.totalAchievements}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
        {/* XP Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Level {summary.currentLevel.level}</span>
            <span>{summary.nextLevel ? `Level ${summary.nextLevel.level}` : "MAX"}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${summary.progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </Card>

      {/* Daily Missions */}
      <Card className="border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold"><Zap className="h-4 w-4 text-amber-500" /> Daily Missions</h3>
          <span className="text-xs text-muted-foreground">{missionsComplete}/{missions.length} complete</span>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {missions.map((m) => (
            <div key={m.id} className={cn("flex items-center gap-3 rounded-xl border px-4 py-3", m.completed && "bg-emerald-500/5 border-emerald-500/20")}>
              <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold", m.completed ? "bg-emerald-500/10 text-emerald-600" : "bg-muted")}>
                {m.completed ? "✓" : `${m.progress}/${m.target}`}
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-medium", m.completed && "line-through text-muted-foreground")}>{m.title}</p>
                <p className="text-xs text-muted-foreground">+{m.xpReward} XP</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
              activeTab === t.key ? "border-primary bg-primary/10 text-primary" : "bg-card hover:bg-accent",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 font-semibold mb-4"><Award className="h-4 w-4 text-primary" /> Unlocked ({unlocked.length})</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {unlocked.map((a, i) => (
              <AchievementCard key={a.achievementId} achievement={a} unlocked unlockedAt={studentAchievements.find((sa) => sa.achievementId === a.achievementId)?.unlockedAt} delay={i * 0.04} />
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 font-semibold mb-4"><Lock className="h-4 w-4 text-muted-foreground" /> Locked ({locked.length})</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {locked.map((a) => (
              <AchievementCard key={a.achievementId} achievement={a} unlocked={false} delay={0} />
            ))}
          </div>
        </div>
      )}
    </DashPage>
  );
}

function AchievementCard({ achievement: a, unlocked, unlockedAt, delay }: { achievement: AchievementDefinition; unlocked: boolean; unlockedAt?: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
    >
      <Card className={cn("border bg-card p-4 transition-colors", unlocked ? "hover:border-primary/30" : "opacity-50")}>
        <div className="flex items-start gap-3">
          <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl", unlocked ? "bg-primary/10" : "bg-muted grayscale")}>{a.icon}</span>
          <div className="min-w-0">
            <p className="font-semibold text-sm">{a.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="rounded-full text-xs text-primary">+{a.xpReward} XP</Badge>
              {unlockedAt && <span className="text-xs text-muted-foreground">{unlockedAt}</span>}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
