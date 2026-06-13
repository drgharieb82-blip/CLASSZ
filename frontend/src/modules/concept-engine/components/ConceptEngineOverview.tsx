import { AlertCircle, BrainCircuit, GitBranch, RefreshCw, TrendingDown } from "lucide-react";

import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";
import { PageContainer } from "../../../components/ui/PageContainer";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { useConceptEngine } from "../hooks";
import { ConceptCard } from "./ConceptCard";
import { ConceptDependencyCard } from "./ConceptDependencyCard";
import { ConceptGraphCard } from "./ConceptGraphCard";
import { ConceptProgressCard } from "./ConceptProgressCard";
import { ConceptWeaknessCard } from "./ConceptWeaknessCard";

export function ConceptEngineOverview() {
  const { concepts, dependencies, conceptGraph, studentConceptStates, weakConcepts, loading, error, refresh, retry } = useConceptEngine();

  const conceptById = new Map(concepts.map((concept) => [concept.id, concept]));

  return (
    <PageContainer className="space-y-6">
      <Card className="p-5 sm:p-6">
        <SectionHeader
          eyebrow="Foundation"
          title="Concept Engine"
          description="Centralized concept state prepared for future adaptive reasoning and AI-assisted learning paths."
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
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {concepts.length === 0 ? (
              <EmptyState description="Concepts will appear here after the Concept Engine service returns data." />
            ) : (
              concepts.map((concept) => <ConceptCard key={concept.id} concept={concept} />)
            )}
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            {studentConceptStates.map((state) => {
              const concept = conceptById.get(state.conceptId);
              return concept ? <ConceptProgressCard key={state.conceptId} concept={concept} state={state} /> : null;
            })}
          </section>

          <section className="space-y-4">
            <Card className="p-5">
              <SectionHeader
                title="Concept Graph"
                description="Relationship map for prerequisites, dependencies, related concepts, and strengthening paths."
                icon={<GitBranch className="h-5 w-5 text-teal-600 dark:text-teal-300" aria-hidden="true" />}
              />
            </Card>
            {conceptGraph.length === 0 ? (
              <EmptyState description="Concept graph relationships will appear here when available." />
            ) : (
              <div className="grid gap-4 xl:grid-cols-3">
                {conceptGraph.map((node) => <ConceptGraphCard key={node.conceptId} node={node} />)}
              </div>
            )}
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="space-y-4">
              <Card className="p-5">
                <SectionHeader
                  title="Weak Concepts"
                  description="Concepts that need targeted revision based on current student state."
                  icon={<TrendingDown className="h-5 w-5 text-amber-600 dark:text-amber-300" aria-hidden="true" />}
                />
              </Card>
              {weakConcepts.length === 0 ? (
                <EmptyState description="Weak concept signals will appear here when available." />
              ) : (
                weakConcepts.map((weakness) => <ConceptWeaknessCard key={weakness.id} weakness={weakness} />)
              )}
            </section>

            <section className="space-y-4">
              <Card className="p-5">
                <SectionHeader
                  title="Dependencies"
                  description="Prerequisite and supporting concept relationships."
                  icon={<GitBranch className="h-5 w-5 text-violet-600 dark:text-violet-300" aria-hidden="true" />}
                />
              </Card>
              {dependencies.length === 0 ? (
                <EmptyState description="Concept dependencies will appear here when available." />
              ) : (
                dependencies.map((dependency) => <ConceptDependencyCard key={dependency.id} dependency={dependency} />)
              )}
            </section>
          </div>
        </>
      )}
    </PageContainer>
  );
}
