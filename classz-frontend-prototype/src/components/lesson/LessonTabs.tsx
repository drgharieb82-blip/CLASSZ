import { useState } from "react";
import { BookOpen, StickyNote, Paperclip, HelpCircle, MessageSquare, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LessonOverviewCard } from "./LessonOverviewCard";
import { LessonProgressCard } from "./LessonProgressCard";
import { TeacherCard } from "./TeacherCard";

interface LessonTabsProps {
  objectives: string[];
  keyConcepts: string[];
  duration: string;
  contentType: string;
  progress: number;
  watchedTime: string;
  remainingTime: string;
  teacherName: string;
  teacherSubject: string;
  teacherInitials: string;
}

const TABS = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "attachments", label: "Attach", icon: Paperclip },
  { id: "questions", label: "Q&A", icon: HelpCircle },
  { id: "discussion", label: "Discuss", icon: MessageSquare },
  { id: "ai", label: "AI", icon: Bot },
] as const;

export function LessonTabs(props: LessonTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b">
        <div className="grid grid-cols-6 px-1 py-1.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-medium transition-colors",
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <LessonOverviewCard
                objectives={props.objectives}
                keyConcepts={props.keyConcepts}
                duration={props.duration}
                contentType={props.contentType}
              />
              <LessonProgressCard
                percent={props.progress}
                watchedTime={props.watchedTime}
                remainingTime={props.remainingTime}
              />
              <TeacherCard
                name={props.teacherName}
                subject={props.teacherSubject}
                initials={props.teacherInitials}
              />
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Notes</p>
              <div className="rounded-2xl border border-dashed bg-card/40 p-6 text-center">
                <StickyNote className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No notes yet. Start taking notes as you learn.</p>
              </div>
            </div>
          )}

          {activeTab === "attachments" && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attachments</p>
              {["Lecture Slides.pdf", "Practice Problems.pdf", "Formula Sheet.pdf"].map((name) => (
                <div key={name} className="flex items-center gap-3 rounded-xl border bg-card/70 p-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-sm">📄</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">PDF • 2.4 MB</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "questions" && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Questions</p>
              <div className="rounded-2xl border border-dashed bg-card/40 p-6 text-center">
                <HelpCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Ask a question about this lesson.</p>
              </div>
            </div>
          )}

          {activeTab === "discussion" && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Discussion</p>
              <div className="rounded-2xl border border-dashed bg-card/40 p-6 text-center">
                <MessageSquare className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Join the discussion with your classmates.</p>
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Assistant</p>
              <div className="rounded-2xl border border-dashed bg-card/40 p-6 text-center">
                <Bot className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Ask the AI to explain concepts from this lesson.</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
