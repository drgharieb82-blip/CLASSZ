export type LearningStyle = "visual" | "auditory" | "reading" | "practice" | "mixed";

export type DifficultyPreference = "easy" | "medium" | "hard" | "adaptive";

export type MemoryEventType =
  | "LessonCompleted"
  | "QuizCompleted"
  | "WeaknessDetected"
  | "MasteryImproved"
  | "RevisionCompleted"
  | "LearningPathUpdated";

export type MemoryImportance = "low" | "medium" | "high";

export type MemoryPriority = "low" | "medium" | "high";

export type ForgettingUrgency = "Low" | "Medium" | "High" | "Critical";

export type ReviewPriority = "Low" | "Medium" | "High" | "Critical";

export type MemoryEvent = {
  id: string;
  timestamp: string;
  eventType: MemoryEventType;
  title: string;
  description: string;
  importance: MemoryImportance;
};

export type MemoryTimeline = {
  id: string;
  studentId: string;
  events: MemoryEvent[];
};

export type DetectedWeakness = {
  id: string;
  conceptId: string;
  conceptName: string;
  subject: string;
  severity: MemoryPriority;
  confidence: number;
  evidence: string[];
  recommendedAction: string;
};

export type DetectedStrength = {
  id: string;
  conceptId: string;
  conceptName: string;
  subject: string;
  confidence: number;
  evidence: string[];
  reinforcementAction: string;
};

export type LearningPatternInsight = {
  id: string;
  patternType: "consistency" | "sessionLength" | "preferredTime" | "motivation";
  title: string;
  description: string;
  confidence: number;
  recommendation: string;
};

export type LearningPattern = {
  id: string;
  patternName: string;
  description: string;
  frequency: string;
  confidence: number;
};

export type ForgettingCurvePoint = {
  conceptId: string;
  conceptName: string;
  lastReviewedAt: string;
  retentionScore: number;
  predictedForgettingDate: string;
  urgency: ForgettingUrgency;
};

export type ConceptReviewNeed = {
  conceptId: string;
  conceptName: string;
  urgency: ForgettingUrgency;
  recommendedReviewAt: string;
  reason: string;
};

export type ReviewTask = {
  conceptId: string;
  conceptName: string;
  reason: string;
  durationMinutes: number;
  urgency: ReviewPriority;
};

export type ReviewSession = {
  id: string;
  scheduledAt: string;
  estimatedMinutes: number;
  priority: ReviewPriority;
  tasks: ReviewTask[];
};

export type ForgettingCurveItem = ForgettingCurvePoint & {
  id: string;
  riskLevel: MemoryPriority;
  nextReviewAt: string;
  recommendation: string;
};

export type PersonalizedRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: MemoryPriority;
  actionType: "review" | "practice" | "quiz" | "lesson" | "learningPath";
  relatedConcept: string;
};

export type StudentSummary = {
  id: string;
  generatedAt: string;
  headline: string;
  overview: string;
  nextBestAction: string;
  confidence: number;
  strengthsCount: number;
  weaknessesCount: number;
};

export type LongTermMemoryInsight = {
  id: string;
  title: string;
  description: string;
  signalType: "strength" | "weakness" | "pattern" | "forgetting" | "recommendation";
  confidence: number;
  importance: MemoryImportance;
};

export type PersonalKnowledgeNode = {
  id: string;
  conceptId: string;
  conceptName: string;
  subject: string;
  mastery: number;
  confidence: number;
  weaknessScore: number;
  importance: number;
  connectedConceptsCount: number;
  relationSummary: string;
};

export type PersonalKnowledgeEdge = {
  id: string;
  sourceConceptId: string;
  targetConceptId: string;
  relationType: "supports" | "dependsOn" | "conflictsWith" | "reinforces";
  strength: number;
  summary: string;
};

export type PersonalKnowledgeGraph = {
  id: string;
  studentId: string;
  generatedAt: string;
  nodes: PersonalKnowledgeNode[];
  edges: PersonalKnowledgeEdge[];
};

export type LongTermMemoryItem = {
  id: string;
  title: string;
  type: "concept" | "behavior" | "preference" | "risk" | "recommendation";
  importance: MemoryImportance;
  relatedConcept: string;
  insightSummary: string;
  createdAt: string;
};

export type MemoryInsight = {
  id: string;
  title: string;
  summary: string;
  importance: MemoryImportance;
  relatedConcept: string;
  confidence: number;
};

export type MemoryTrend = {
  id: string;
  title: string;
  direction: "improving" | "stable" | "declining";
  conceptName: string;
  summary: string;
  confidence: number;
};

export type PersonaTrait = {
  id: string;
  name: string;
  category: "strength" | "risk" | "neutral";
  confidence: number;
  summary: string;
};

export type LearningBehavior = {
  id: string;
  behaviorType: "consistency" | "attention" | "motivation" | "difficulty" | "review";
  title: string;
  summary: string;
  confidence: number;
};

export type StudentPersona = {
  id: string;
  studentId: string;
  personaName: string;
  learningStyle: LearningStyle;
  strengthTraits: PersonaTrait[];
  riskTraits: PersonaTrait[];
  learningBehaviors: LearningBehavior[];
  behaviorSummary: string;
  recommendedTeachingApproach: string;
};

export type TutorContextSection = {
  id: string;
  title: string;
  summary: string;
  priority: MemoryPriority;
};

export type TutorRecommendation = {
  id: string;
  title: string;
  action: string;
  rationale: string;
  priority: MemoryPriority;
};

export type PersonalTutorContext = {
  id: string;
  studentId: string;
  generatedAt: string;
  studentSummary: string;
  keyWeaknesses: string[];
  keyStrengths: string[];
  preferredLearningStyle: LearningStyle;
  nextRecommendedAction: string;
  tutorInstructions: string;
  sections: TutorContextSection[];
  recommendations: TutorRecommendation[];
};

export type StudentMemorySnapshot = {
  studentProfile: StudentProfile;
  strengths: StudentStrength[];
  weaknesses: StudentWeakness[];
  learningPreferences: LearningPreference[];
  learningPatterns: LearningPattern[];
  studyHabit: StudyHabit;
  studyPatterns: StudyPattern[];
  attentionProfile: AttentionProfile | null;
  memoryTimeline: MemoryTimeline;
  detectedWeaknesses: DetectedWeakness[];
  detectedStrengths: DetectedStrength[];
  learningPatternInsights: LearningPatternInsight[];
  forgettingCurve: ForgettingCurveItem[];
  reviewNeeds: ConceptReviewNeed[];
  reviewSessions: ReviewSession[];
  personalizedRecommendations: PersonalizedRecommendation[];
  studentSummary: StudentSummary | null;
  longTermMemoryInsights: LongTermMemoryInsight[];
  personalKnowledgeGraph: PersonalKnowledgeGraph;
  longTermMemory: LongTermMemoryItem[];
  memoryInsights: MemoryInsight[];
  memoryTrends: MemoryTrend[];
  studentPersona: StudentPersona;
  personalTutorContext: PersonalTutorContext;
};

export type StudentStrength = {
  id: string;
  conceptId: string;
  conceptName: string;
  subject: string;
  masteryLevel: number;
  evidence: string;
};

export type StudentWeakness = {
  id: string;
  conceptId: string;
  conceptName: string;
  subject: string;
  masteryLevel: number;
  priority: "low" | "medium" | "high";
  recommendedAction: string;
};

export type LearningPreference = {
  id: string;
  learningStyle: LearningStyle;
  preferredLanguage: "ar" | "en";
  preferredDifficulty: DifficultyPreference;
  bestContentType: "video" | "notes" | "questions" | "mixed";
};

export type StudyHabit = {
  preferredStudyTime: "morning" | "afternoon" | "evening" | "night";
  averageSessionMinutes: number;
  consistencyScore: number;
};

export type AttentionProfile = {
  focusLevel: number;
  distractionLevel: number;
  preferredSessionLength: number;
  attentionSpan: number;
  bestSessionLength: number;
  breakFrequencyMinutes: number;
  needsMotivation: boolean;
};

export type StudyPattern = {
  id: string;
  averageSessionMinutes: number;
  preferredStudyTime: "morning" | "afternoon" | "evening" | "night";
  weeklyStudyDays: number;
  consistencyLevel: "low" | "medium" | "high";
};

export type StudentProfile = {
  studentId: string;
  displayName: string;
  grade: string;
  preferredLanguage: "ar" | "en";
  learningStyle: LearningStyle;
  averageSessionMinutes: number;
  preferredDifficulty: DifficultyPreference;
  attentionSpan: number;
  strengths: StudentStrength[];
  weaknesses: StudentWeakness[];
};
