import { useCallback, useEffect, useState } from "react";

import { studentMemoryService } from "../services";
import type {
  AttentionProfile,
  LearningPreference,
  MemoryEvent,
  MemoryTimeline,
  StudentProfile,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudentMemory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [profile, strengthList, weaknessList, preferences, patterns, attention, timeline] = await Promise.all([
        studentMemoryService.getStudentProfile(),
        studentMemoryService.getStrengths(),
        studentMemoryService.getWeaknesses(),
        studentMemoryService.getLearningPreferences(),
        studentMemoryService.getStudyPatterns(),
        studentMemoryService.getAttentionProfile(),
        studentMemoryService.getTimeline(),
      ]);

      setStudentProfile(profile);
      setStrengths(strengthList);
      setWeaknesses(weaknessList);
      setLearningPreferences(preferences);
      setStudyPatterns(patterns);
      setAttentionProfile(attention);
      setMemoryTimeline(timeline);
    } catch {
      setError(fallbackError);
    } finally {
      setLoading(false);
    }
  }, []);

  const addMemoryEvent = useCallback(async (memoryEvent: MemoryEvent) => {
    setError(null);

    try {
      const updatedTimeline = await studentMemoryService.addMemoryEvent(memoryEvent);
      setMemoryTimeline(updatedTimeline);
    } catch {
      setError(fallbackError);
    }
  }, []);

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
    loading,
    error,
    addMemoryEvent,
    refresh: loadStudentMemory,
    retry: loadStudentMemory,
  };
}
