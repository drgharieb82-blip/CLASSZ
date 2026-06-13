import { AlertCircle, BrainCircuit, History, Lightbulb, RefreshCw, Target, TrendingDown, Trophy, UserRound } from "lucide-react";

import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";
import { PageContainer } from "../../../components/ui/PageContainer";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { useStudentMemory } from "../hooks";
import { DetectedStrengthCard } from "./DetectedStrengthCard";
import { DetectedWeaknessCard } from "./DetectedWeaknessCard";
import { ForgettingRiskCard } from "./ForgettingRiskCard";
import { LearningStyleCard } from "./LearningStyleCard";
import { LearningPatternInsightCard } from "./LearningPatternInsightCard";
import { LongTermMemoryInsightCard } from "./LongTermMemoryInsightCard";
import { MemoryTimelineCard } from "./MemoryTimelineCard";
import { RecommendationCard } from "./RecommendationCard";
import { StrengthCard } from "./StrengthCard";
import { StudentProfileCard } from "./StudentProfileCard";
import { StudentSummaryCard } from "./StudentSummaryCard";
import { StudyPatternCard } from "./StudyPatternCard";
import { WeaknessCard } from "./WeaknessCard";

export function StudentMemoryOverview() {
  const {
    studentProfile,
    strengths,
    weaknesses,
    learningPreferences,
    studyPatterns,
    attentionProfile,
    memoryTimeline,
    detectedWeaknesses,
    detectedStrengths,
    learningPatternInsights,
    forgettingCurve,
    personalizedRecommendations,
    studentSummary,
    longTermMemoryInsights,
    loading,
    error,
    refresh,
    retry,
  } = useStudentMemory();

  return (
    <PageContainer className="space-y-6">
      <Card className="p-5 sm:p-6">
        <SectionHeader
          eyebrow="Long-term memory"
          title="Student Memory"
          description="Persistent student profile signals for future personalization, adaptation, and progress support."
          icon={<BrainCircuit className="h-6 w-6 text-teal-600 dark:text-teal-300" aria-hidden="true" />}
          action={
            <button type="button" className="ui-button" onClick={() => void refresh()} disabled={loading}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </button>
          }
        />
      </Card>

      {loading ? (
        <LoadingSkeleton lines={8} />
      ) : error ? (
        <Card className="border-rose-200 bg-rose-50 p-5 text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
          <AlertCircle className="mb-3 h-5 w-5" aria-hidden="true" />
          <p className="font-semibold">{error}</p>
          <button type="button" className="ui-button mt-4" onClick={() => void retry()}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </button>
        </Card>
      ) : (
        <>
          <section className="grid gap-4 xl:grid-cols-3">
            {studentProfile ? <StudentProfileCard profile={studentProfile} /> : <EmptyState description="Student profile data will appear here." />}
            {studentProfile ? (
              <LearningStyleCard profile={studentProfile} preference={learningPreferences[0]} />
            ) : (
              <EmptyState description="Learning style data will appear here." />
            )}
            {studyPatterns[0] && attentionProfile ? (
              <StudyPatternCard studyPattern={studyPatterns[0]} attentionProfile={attentionProfile} />
            ) : (
              <EmptyState description="Study pattern data will appear here." />
            )}
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="space-y-4">
              <Card className="p-5">
                <SectionHeader
                  title="Strengths"
                  description="Concepts and behaviors the student can rely on."
                  icon={<Trophy className="h-5 w-5 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />}
                />
              </Card>
              {strengths.length === 0 ? (
                <EmptyState description="Student strengths will appear here when available." icon={<UserRound className="h-5 w-5" aria-hidden="true" />} />
              ) : (
                strengths.map((strength) => <StrengthCard key={strength.id} strength={strength} />)
              )}
            </section>

            <section className="space-y-4">
              <Card className="p-5">
                <SectionHeader
                  title="Weaknesses"
                  description="Concepts that need targeted support."
                  icon={<TrendingDown className="h-5 w-5 text-amber-600 dark:text-amber-300" aria-hidden="true" />}
                />
              </Card>
              {weaknesses.length === 0 ? (
                <EmptyState description="Student weaknesses will appear here when available." />
              ) : (
                weaknesses.map((weakness) => <WeaknessCard key={weakness.id} weakness={weakness} />)
              )}
            </section>
          </div>

          <section className="space-y-4">
            <Card className="p-5">
              <SectionHeader
                eyebrow="Phase 6.4 - 6.5"
                title="Detected Learning Signals"
                description="Local memory analysis for current weakness and strength signals."
                icon={<Target className="h-5 w-5 text-rose-600 dark:text-rose-300" aria-hidden="true" />}
              />
            </Card>
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="space-y-4">
                {detectedWeaknesses.length === 0 ? (
                  <EmptyState description="Detected weaknesses will appear here when memory has enough signals." />
                ) : (
                  detectedWeaknesses.map((weakness) => <DetectedWeaknessCard key={weakness.id} weakness={weakness} />)
                )}
              </div>
              <div className="space-y-4">
                {detectedStrengths.length === 0 ? (
                  <EmptyState description="Detected strengths will appear here when mastery evidence is available." />
                ) : (
                  detectedStrengths.map((strength) => <DetectedStrengthCard key={strength.id} strength={strength} />)
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <Card className="p-5">
              <SectionHeader
                eyebrow="Phase 6.6 - 6.8"
                title="Patterns, Forgetting Risk, and Recommendations"
                description="Local analysis of study rhythm, retention risk, and personalized next actions."
                icon={<Lightbulb className="h-5 w-5 text-violet-600 dark:text-violet-300" aria-hidden="true" />}
              />
            </Card>
            <div className="grid gap-6 xl:grid-cols-3">
              <div className="space-y-4">
                {learningPatternInsights.length === 0 ? (
                  <EmptyState description="Learning pattern insights will appear here." />
                ) : (
                  learningPatternInsights.map((pattern) => <LearningPatternInsightCard key={pattern.id} pattern={pattern} />)
                )}
              </div>
              <div className="space-y-4">
                {forgettingCurve.length === 0 ? (
                  <EmptyState description="Forgetting curve risks will appear here." />
                ) : (
                  forgettingCurve.map((risk) => <ForgettingRiskCard key={risk.id} risk={risk} />)
                )}
              </div>
              <div className="space-y-4">
                {personalizedRecommendations.length === 0 ? (
                  <EmptyState description="Personalized recommendations will appear here." />
                ) : (
                  personalizedRecommendations.map((recommendation) => (
                    <RecommendationCard key={recommendation.id} recommendation={recommendation} />
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <Card className="p-5">
              <SectionHeader
                eyebrow="Phase 6.9 - 6.10"
                title="Summary and Long-Term Memory"
                description="Generated student summary and aggregated long-term memory insights."
                icon={<BrainCircuit className="h-5 w-5 text-teal-600 dark:text-teal-300" aria-hidden="true" />}
              />
            </Card>
            {studentSummary ? <StudentSummaryCard summary={studentSummary} /> : <EmptyState description="Student summary will appear here." />}
            <div className="grid gap-4 xl:grid-cols-2">
              {longTermMemoryInsights.length === 0 ? (
                <EmptyState description="Long-term memory insights will appear here." />
              ) : (
                longTermMemoryInsights.map((insight) => <LongTermMemoryInsightCard key={insight.id} insight={insight} />)
              )}
            </div>
          </section>

          <section className="space-y-4">
            <Card className="p-5">
              <SectionHeader
                eyebrow="Phase 6.3"
                title="Memory Timeline"
                description="A chronological view of meaningful learning events collected from the student memory layer."
                icon={<History className="h-5 w-5 text-teal-600 dark:text-teal-300" aria-hidden="true" />}
              />
            </Card>
            {!memoryTimeline || memoryTimeline.events.length === 0 ? (
              <EmptyState description="Student memory events will appear here as the student completes lessons, quizzes, revisions, and learning path updates." />
            ) : (
              <div className="grid gap-4">
                {memoryTimeline.events.map((event) => (
                  <MemoryTimelineCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </PageContainer>
  );
}
