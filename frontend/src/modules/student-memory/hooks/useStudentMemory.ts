import { useCallback, useEffect, useState } from "react";

import { studentMemoryService } from "../services";
import type {
  AttentionProfile,
  DetectedStrength,
  DetectedWeakness,
  ForgettingCurveItem,
  LearningPreference,
  LearningPatternInsight,
  LongTermMemoryInsight,
  MemoryEvent,
  MemoryTimeline,
  PersonalizedRecommendation,
  StudentProfile,
  StudentSummary,
  StudentStrength,
  StudentWeakness,
  StudyPattern,
} from "../types";

type StudentMemoryState = {
  studentProfile: StudentProfile | null;
  strengths: StudentStrength[];
  weaknesses: StudentWeakness[];
  learningPreferences: LearningPreference[];
  studyPatterns: StudyPattern[];
  attentionProfile: AttentionProfile | null;
  memoryTimeline: MemoryTimeline | null;
  detectedWeaknesses: DetectedWeakness[];
  detectedStrengths: DetectedStrength[];
  learningPatternInsights: LearningPatternInsight[];
  forgettingCurve: ForgettingCurveItem[];
  personalizedRecommendations: PersonalizedRecommendation[];
  studentSummary: StudentSummary | null;
  longTermMemoryInsights: LongTermMemoryInsight[];
  loading: boolean;
  error: string | null;
  addMemoryEvent: (memoryEvent: MemoryEvent) => Promise<void>;
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
};

const fallbackError = "Student memory could not be loaded. Please try again.";

export function useStudentMemory(): StudentMemoryState {
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [strengths, setStrengths] = useState<StudentStrength[]>([]);
  const [weaknesses, setWeaknesses] = useState<StudentWeakness[]>([]);
  const [learningPreferences, setLearningPreferences] = useState<LearningPreference[]>([]);
  const [studyPatterns, setStudyPatterns] = useState<StudyPattern[]>([]);
  const [attentionProfile, setAttentionProfile] = useState<AttentionProfile | null>(null);
  const [memoryTimeline, setMemoryTimeline] = useState<MemoryTimeline | null>(null);
  const [detectedWeaknesses, setDetectedWeaknesses] = useState<DetectedWeakness[]>([]);
  const [detectedStrengths, setDetectedStrengths] = useState<DetectedStrength[]>([]);
  const [learningPatternInsights, setLearningPatternInsights] = useState<LearningPatternInsight[]>([]);
  const [forgettingCurve, setForgettingCurve] = useState<ForgettingCurveItem[]>([]);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [studentSummary, setStudentSummary] = useState<StudentSummary | null>(null);
  const [longTermMemoryInsights, setLongTermMemoryInsights] = useState<LongTermMemoryInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudentMemory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const memory = await studentMemoryService.getStudentMemory();

      setStudentProfile(memory.studentProfile);
      setStrengths(memory.strengths);
      setWeaknesses(memory.weaknesses);
      setLearningPreferences(memory.learningPreferences);
      setStudyPatterns(memory.studyPatterns);
      setAttentionProfile(memory.attentionProfile);
      setMemoryTimeline(memory.memoryTimeline);
      setDetectedWeaknesses(memory.detectedWeaknesses);
      setDetectedStrengths(memory.detectedStrengths);
      setLearningPatternInsights(memory.learningPatternInsights);
      setForgettingCurve(memory.forgettingCurve);
      setPersonalizedRecommendations(memory.personalizedRecommendations);
      setStudentSummary(memory.studentSummary);
      setLongTermMemoryInsights(memory.longTermMemoryInsights);
    } catch {
      setError(fallbackError);
    } finally {
      setLoading(false);
    }
  }, []);

  const addMemoryEvent = useCallback(async (memoryEvent: MemoryEvent) => {
    setError(null);

    try {
      await studentMemoryService.addMemoryEvent(memoryEvent);
      await loadStudentMemory();
    } catch {
      setError(fallbackError);
    }
  }, [loadStudentMemory]);

  useEffect(() => {
    void loadStudentMemory();
  }, [loadStudentMemory]);

  return {
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
    addMemoryEvent,
    refresh: loadStudentMemory,
    retry: loadStudentMemory,
  };
}
