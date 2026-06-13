import { AlertCircle, BrainCircuit, RefreshCw, TrendingDown, Trophy, UserRound } from "lucide-react";

import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";
import { PageContainer } from "../../../components/ui/PageContainer";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { useStudentMemory } from "../hooks";
import { LearningStyleCard } from "./LearningStyleCard";
import { StrengthCard } from "./StrengthCard";
import { StudentProfileCard } from "./StudentProfileCard";
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
        </>
      )}
    </PageContainer>
  );
}
