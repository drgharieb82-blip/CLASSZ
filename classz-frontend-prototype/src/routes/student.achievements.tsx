import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Award, Lock, Sparkles, Star, Trophy, Zap } from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { achievements, currentXP, currentLevel, currentTitle, nextLevelXP, currentStreak, dailyMissions } from "@/lib/gamificationMock";
import { VictoryScene } from "@/components/illustrations/Characters";

export const Route = createFileRoute("/student/achievements")({
  component: AchievementsPage,
});

function AchievementsPage() {
  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);
  const xpPercent = Math.min(100, Math.round((currentXP / nextLevelXP) * 100));

  return (
    <DashPage role="student" title="Trophy Room" subtitle="Your achievements, badges, and rewards" icon={ROLES.student.icon}>
      {/* XP & Level */}
      <Card className="relative overflow-hidden border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="rounded-full gradient-brand border-0 text-white text-sm px-3">Level {currentLevel}</Badge>
              <span className="text-sm font-semibold">{currentTitle}</span>
            </div>
            <p className="mt-2 text-3xl font-bold">{currentXP.toLocaleString()} XP</p>
            <p className="text-sm text-muted-foreground">{nextLevelXP - currentXP} XP to next level</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-500">{currentStreak}</p>
              <p className="text-xs text-muted-foreground">Day streak</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{unlocked.length}</p>
              <p className="text-xs text-muted-foreground">Badges</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Level {currentLevel}</span>
            <span>Level {currentLevel + 1}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </Card>

      {/* Daily Missions */}
      <Card className="border bg-card p-5">
        <h3 className="flex items-center gap-2 font-semibold"><Zap className="h-4 w-4 text-amber-500" /> Daily Missions</h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {dailyMissions.map((m) => (
            <div key={m.id} className={cn("flex items-center gap-3 rounded-xl border px-4 py-3", m.completed && "bg-emerald-500/5 border-emerald-500/20")}>
              <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm", m.completed ? "bg-emerald-500/10" : "bg-muted")}>
                {m.completed ? "✓" : `${m.progress}/${m.target}`}
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-medium", m.completed && "line-through text-muted-foreground")}>{m.title}</p>
                <p className="text-xs text-muted-foreground">{m.reward}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Unlocked Achievements */}
      <div>
        <h3 className="flex items-center gap-2 font-semibold mb-4"><Trophy className="h-4 w-4 text-primary" /> Unlocked ({unlocked.length})</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {unlocked.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border bg-card p-4 transition-colors hover:border-primary/30">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-xl">{a.icon}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="rounded-full text-xs text-primary">+{a.xpReward} XP</Badge>
                      {a.unlockedAt && <span className="text-xs text-muted-foreground">{a.unlockedAt}</span>}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Locked Achievements */}
      <div>
        <h3 className="flex items-center gap-2 font-semibold mb-4"><Lock className="h-4 w-4 text-muted-foreground" /> Locked ({locked.length})</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {locked.map((a) => (
            <Card key={a.id} className="border bg-card p-4 opacity-60">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-xl grayscale">{a.icon}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                  <Badge variant="outline" className="mt-2 rounded-full text-xs">+{a.xpReward} XP</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashPage>
  );
}
