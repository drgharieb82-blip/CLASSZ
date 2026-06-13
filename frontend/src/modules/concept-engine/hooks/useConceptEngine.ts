import { useCallback, useEffect, useState } from "react";

import { conceptEngineService } from "../services";
import type { AffectedConcept, Concept, ConceptDependency, ConceptGraphNode, ConceptReason, ConceptWeakness, ExplainableInsight, LearningPathStep, RevisionStep, StudentConceptState } from "../types";

type ConceptEngineState = {
  concepts: Concept[];
  dependencies: ConceptDependency[];
  conceptGraph: ConceptGraphNode[];
  studentConceptStates: StudentConceptState[];
  weakConcepts: ConceptWeakness[];
  affectedConcepts: AffectedConcept[];
  revisionPlan: RevisionStep[];
  learningPath: LearningPathStep[];
  conceptReasons: ConceptReason[];
  explainableInsights: ExplainableInsight[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
};

const fallbackError = "Concept Engine data could not be loaded. Please try again.";

export function useConceptEngine(): ConceptEngineState {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [dependencies, setDependencies] = useState<ConceptDependency[]>([]);
  const [conceptGraph, setConceptGraph] = useState<ConceptGraphNode[]>([]);
  const [studentConceptStates, setStudentConceptStates] = useState<StudentConceptState[]>([]);
  const [weakConcepts, setWeakConcepts] = useState<ConceptWeakness[]>([]);
  const [affectedConcepts, setAffectedConcepts] = useState<AffectedConcept[]>([]);
  const [revisionPlan, setRevisionPlan] = useState<RevisionStep[]>([]);
  const [learningPath, setLearningPath] = useState<LearningPathStep[]>([]);
  const [conceptReasons, setConceptReasons] = useState<ConceptReason[]>([]);
  const [explainableInsights, setExplainableInsights] = useState<ExplainableInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConceptEngine = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [conceptList, dependencyList, conceptStates, weakConceptList, graph, affectedConceptList, revisionSteps, pathSteps, reasons, insights] = await Promise.all([
        conceptEngineService.getConcepts(),
        conceptEngineService.getConceptDependencies(),
        conceptEngineService.getStudentConceptStates(),
        conceptEngineService.getWeakConcepts(),
        conceptEngineService.getConceptGraph(),
        conceptEngineService.getAffectedConcepts(),
        conceptEngineService.getRevisionPlan(),
        conceptEngineService.getLearningPath(),
        conceptEngineService.getConceptReasons(),
        conceptEngineService.getExplainableInsights(),
      ]);

      setConcepts(conceptList);
      setDependencies(dependencyList);
      setStudentConceptStates(conceptStates);
      setWeakConcepts(weakConceptList);
      setConceptGraph(graph);
      setAffectedConcepts(affectedConceptList);
      setRevisionPlan(revisionSteps);
      setLearningPath(pathSteps);
      setConceptReasons(reasons);
      setExplainableInsights(insights);
    } catch {
      setError(fallbackError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConceptEngine();
  }, [loadConceptEngine]);

  return {
    concepts,
    dependencies,
    conceptGraph,
    studentConceptStates,
    weakConcepts,
    affectedConcepts,
    revisionPlan,
    learningPath,
    conceptReasons,
    explainableInsights,
    loading,
    error,
    refresh: loadConceptEngine,
    retry: loadConceptEngine,
  };
}
