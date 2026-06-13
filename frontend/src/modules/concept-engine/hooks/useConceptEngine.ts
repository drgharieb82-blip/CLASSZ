import { useCallback, useEffect, useState } from "react";

import { conceptEngineService } from "../services";
import type { Concept, ConceptDependency, ConceptGraphNode, ConceptWeakness, StudentConceptState } from "../types";

type ConceptEngineState = {
  concepts: Concept[];
  dependencies: ConceptDependency[];
  conceptGraph: ConceptGraphNode[];
  studentConceptStates: StudentConceptState[];
  weakConcepts: ConceptWeakness[];
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConceptEngine = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [conceptList, dependencyList, conceptStates, weakConceptList, graph] = await Promise.all([
        conceptEngineService.getConcepts(),
        conceptEngineService.getConceptDependencies(),
        conceptEngineService.getStudentConceptStates(),
        conceptEngineService.getWeakConcepts(),
        conceptEngineService.getConceptGraph(),
      ]);

      setConcepts(conceptList);
      setDependencies(dependencyList);
      setStudentConceptStates(conceptStates);
      setWeakConcepts(weakConceptList);
      setConceptGraph(graph);
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
    loading,
    error,
    refresh: loadConceptEngine,
    retry: loadConceptEngine,
  };
}
