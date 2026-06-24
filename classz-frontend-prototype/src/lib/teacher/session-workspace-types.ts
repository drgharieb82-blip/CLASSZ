/**
 * CLASSZ Session Workspace Types
 *
 * Session = Learning Experience / Packaging Layer.
 * It references existing assets (Materials, Question Bank, Assessment Engine).
 * It never duplicates assets.
 */

/* ═══════════════════════════════════════════════════════════
   SESSION TYPES
   ═══════════════════════════════════════════════════════════ */

export type SessionWorkspaceType =
  | "lesson" | "revision" | "practice" | "quiz_session" | "exam_session"
  | "homework_session" | "mixed" | "live" | "crash_course" | "final_revision";

export type SessionTeachingMode = "traditional" | "enhanced" | "smart_classz";

export type SessionAccessModel =
  | "free" | "paid_once" | "included_in_course"
  | "included_in_monthly_subscription" | "wallet_only"
  | "gifted" | "scholarship";

export type SessionStatus = "draft" | "published" | "archived" | "locked";

/* ═══════════════════════════════════════════════════════════
   BLOCK TYPES — new architecture + legacy compat
   ═══════════════════════════════════════════════════════════ */

export type NewSessionBlockType =
  | "video_playlist" | "resources" | "assessment" | "text"
  | "completion_rules" | "rewards" | "notes"
  | "qa" | "discussion" | "ai_assistant"
  | "live_meeting" | "external_link";

export type LegacySessionBlockType =
  | "video" | "pdf" | "image" | "question_block"
  | "quiz_block" | "homework_block" | "exam_block" | "assignment_block"
  | "meeting_link" | "mind_map" | "summary";

export type SessionBlockType = NewSessionBlockType | LegacySessionBlockType;

export const LEGACY_TO_NEW_BLOCK_MAP: Partial<Record<LegacySessionBlockType, NewSessionBlockType>> = {
  video: "video_playlist",
  pdf: "resources",
  image: "resources",
  quiz_block: "assessment",
  homework_block: "assessment",
  exam_block: "assessment",
  assignment_block: "assessment",
  question_block: "assessment",
  summary: "text",
  meeting_link: "live_meeting",
};

export const NEW_BLOCK_TYPES: NewSessionBlockType[] = [
  "video_playlist", "resources", "assessment", "text",
  "completion_rules", "rewards", "notes",
  "qa", "discussion", "ai_assistant",
  "live_meeting", "external_link",
];

/* ═══════════════════════════════════════════════════════════
   BASE SESSION BLOCK
   ═══════════════════════════════════════════════════════════ */

export interface SessionBlock {
  id: string;
  publicCode?: string;
  type: SessionBlockType;
  title: string;
  description?: string;
  order: number;
  required?: boolean;
  status?: "active" | "hidden" | "disabled";
  entityId?: string;
  isNew?: boolean;
}

/* ═══════════════════════════════════════════════════════════
   VIDEO PLAYLIST BLOCK
   ═══════════════════════════════════════════════════════════ */

export interface VideoPlaylistItem {
  id: string;
  title: string;
  description?: string;
  materialId: string;
  fromTime?: number;
  toTime?: number;
  required: boolean;
  completionThresholdPercent: number;
  order: number;
  notes?: string;
}

export interface VideoPlaylistSettings {
  autoNext: boolean;
  allowSkip: boolean;
  showCheckmarks: boolean;
  showDuration: boolean;
  completionThresholdPercent: number;
}

export interface VideoPlaylistBlock extends SessionBlock {
  type: "video_playlist";
  items: VideoPlaylistItem[];
  settings: VideoPlaylistSettings;
}

/* ═══════════════════════════════════════════════════════════
   RESOURCES BLOCK
   ═══════════════════════════════════════════════════════════ */

export interface ExternalLink {
  id: string;
  title: string;
  url: string;
  description?: string;
}

export interface ResourcesBlock extends SessionBlock {
  type: "resources";
  materialIds: string[];
  externalLinks: ExternalLink[];
  downloadRequired?: boolean;
  visibleAfterBlockId?: string;
}

/* ═══════════════════════════════════════════════════════════
   ASSESSMENT BLOCK — references Assessment Engine
   ═══════════════════════════════════════════════════════════ */

export interface AssessmentBlock extends SessionBlock {
  type: "assessment";
  assessmentId: string;
  passScoreOverride?: number;
  attemptLimitOverride?: number;
  unlockNextOnPass?: boolean;
}

/* ═══════════════════════════════════════════════════════════
   TEXT BLOCK
   ═══════════════════════════════════════════════════════════ */

export type TextBlockType = "instructions" | "teacher_note" | "objectives" | "announcement" | "summary";

export interface TextBlock extends SessionBlock {
  type: "text";
  content: string;
  textType: TextBlockType;
}

/* ═══════════════════════════════════════════════════════════
   COMPLETION RULES BLOCK
   ═══════════════════════════════════════════════════════════ */

export type CompletionRuleType =
  | "watch_percentage" | "assessment_pass" | "resource_download"
  | "homework_submit" | "manual_complete" | "all_required_blocks_complete";

export interface CompletionRule {
  id: string;
  ruleType: CompletionRuleType;
  targetBlockId?: string;
  threshold?: number;
  required: boolean;
  description?: string;
}

export interface CompletionRulesBlock extends SessionBlock {
  type: "completion_rules";
  rules: CompletionRule[];
}

/* ═══════════════════════════════════════════════════════════
   REWARDS BLOCK
   ═══════════════════════════════════════════════════════════ */

export type RewardTrigger = "session_complete" | "assessment_pass" | "perfect_score" | "streak";

export interface RewardsBlock extends SessionBlock {
  type: "rewards";
  xp: number;
  walletCoins?: number;
  badgeIds: string[];
  certificateEnabled: boolean;
  rewardOn: RewardTrigger;
}

/* ═══════════════════════════════════════════════════════════
   COMMUNICATION / SUPPORT BLOCKS
   ═══════════════════════════════════════════════════════════ */

export interface NotesBlock extends SessionBlock {
  type: "notes";
  allowStudentNotes: boolean;
  allowPrivateNotes: boolean;
  allowPinnedNotes: boolean;
  teacherStarterNotes: string[];
}

export interface QABlock extends SessionBlock {
  type: "qa";
  enabled: boolean;
  allowStudentQuestions: boolean;
  moderationRequired: boolean;
  assignedAssistantIds: string[];
}

export interface DiscussionBlock extends SessionBlock {
  type: "discussion";
  enabled: boolean;
  moderationRequired: boolean;
  teamOnly?: boolean;
}

export type AIAssistantMode = "explain" | "summarize" | "quiz_me" | "weak_concepts" | "ask_teacher";

export interface AIAssistantBlock extends SessionBlock {
  type: "ai_assistant";
  enabled: boolean;
  modes: AIAssistantMode[];
}

/* ═══════════════════════════════════════════════════════════
   LIVE MEETING & EXTERNAL LINK BLOCKS
   ═══════════════════════════════════════════════════════════ */

export interface LiveMeetingBlock extends SessionBlock {
  type: "live_meeting";
  meetingUrl?: string;
  scheduledAt?: string;
  durationMinutes?: number;
}

export interface ExternalLinkBlock extends SessionBlock {
  type: "external_link";
  url: string;
  openInNewTab: boolean;
}

/* ═══════════════════════════════════════════════════════════
   TYPED BLOCK UNION
   ═══════════════════════════════════════════════════════════ */

export type TypedSessionBlock =
  | VideoPlaylistBlock | ResourcesBlock | AssessmentBlock | TextBlock
  | CompletionRulesBlock | RewardsBlock | NotesBlock | QABlock
  | DiscussionBlock | AIAssistantBlock | LiveMeetingBlock | ExternalLinkBlock
  | SessionBlock; // fallback for legacy blocks

/* ═══════════════════════════════════════════════════════════
   SESSION DEPENDENCIES
   ═══════════════════════════════════════════════════════════ */

export interface SessionDependency {
  type: "session" | "quiz_score" | "homework_complete";
  entityId: string;
  entityTitle: string;
  minScore?: number;
}

/* ═══════════════════════════════════════════════════════════
   LEGACY COMPLETION / REWARD (kept for backward compat)
   ═══════════════════════════════════════════════════════════ */

export interface SessionCompletionRule {
  watchPercent?: number;
  questionCount?: number;
  quizMinScore?: number;
  homeworkSubmitted?: boolean;
  customRule?: string;
}

export interface SessionReward {
  xp: number;
  coins?: number;
  badgeId?: string;
  achievementId?: string;
}

/* ═══════════════════════════════════════════════════════════
   SESSION TARGET & OBJECTIVES
   ═══════════════════════════════════════════════════════════ */

export interface SessionTarget {
  type: "all" | "country" | "group" | "weak_students" | "scholarship" | "specific";
  value?: string;
}

export interface LearningObjective {
  conceptId: string;
  conceptTitle: string;
  atomicConceptIds: string[];
}

/* ═══════════════════════════════════════════════════════════
   COUNTRY PRICE
   ═══════════════════════════════════════════════════════════ */

export interface CountryPrice {
  countryCode: string;
  price: number;
  currency: string;
}

/* ═══════════════════════════════════════════════════════════
   SESSION WORKSPACE DATA — upgraded
   ═══════════════════════════════════════════════════════════ */

export interface SessionWorkspaceData {
  // Identity
  id?: string;
  internalUUID?: string;
  publicCode?: string;

  // Ownership
  teacherId?: string;
  courseId?: string;

  // Info
  title?: string;
  subtitle: string;
  description?: string;
  thumbnailUrl: string;
  bannerUrl: string;
  previewVideoUrl: string;
  teacherNote: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;

  // Type & Mode
  workspaceType: SessionWorkspaceType;
  teachingMode?: SessionTeachingMode;
  templateId?: string;

  // Canvas — accepts both new typed blocks and legacy SessionBlock
  blocks: TypedSessionBlock[];

  // Dependencies
  dependencies: SessionDependency[];
  prerequisiteSessionIds: string[];

  // Completion (legacy — use CompletionRulesBlock for new sessions)
  completionRules: SessionCompletionRule;

  // Rewards (legacy — use RewardsBlock for new sessions)
  rewards: SessionReward;

  // Target
  targets: SessionTarget[];

  // Objectives
  objectives: LearningObjective[];

  // Access model
  accessModel?: SessionAccessModel;
  price?: number;
  currency?: string;
  countryPrices?: CountryPrice[];
  walletAllowed?: boolean;
  subscriptionPlanIds?: string[];
  accessDurationDays?: number;
  availableFrom?: string;
  availableUntil?: string;
  lockAfterDays?: number;

  // Series
  seriesId?: string;
  seriesName?: string;

  // Schedule
  publishAt?: string;
  closeAt?: string;

  // Team
  assignedAssistant?: string;
  assignedContentManager?: string;
  assignedGrader?: string;

  // Status
  status?: SessionStatus;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;

  // Version
  version: number;
  clonedFrom?: string;
}

/* ═══════════════════════════════════════════════════════════
   TEMPLATES
   ═══════════════════════════════════════════════════════════ */

export interface SessionTemplate {
  id: string;
  name: string;
  type: SessionWorkspaceType;
  blocks: SessionBlockType[];
  isBuiltIn: boolean;
  teachingMode?: SessionTeachingMode;
}

export const BUILT_IN_TEMPLATES: SessionTemplate[] = [
  { id: "tpl-full-lesson", name: "Full Lesson", type: "lesson", teachingMode: "traditional", blocks: ["video_playlist", "resources", "assessment", "completion_rules", "rewards"], isBuiltIn: true },
  { id: "tpl-enhanced-lesson", name: "Enhanced Lesson", type: "lesson", teachingMode: "enhanced", blocks: ["video_playlist", "resources", "assessment", "notes", "completion_rules", "rewards"], isBuiltIn: true },
  { id: "tpl-smart-lesson", name: "Smart CLASSZ Lesson", type: "lesson", teachingMode: "smart_classz", blocks: ["video_playlist", "resources", "assessment", "notes", "ai_assistant", "completion_rules", "rewards"], isBuiltIn: true },
  { id: "tpl-revision", name: "Revision", type: "revision", blocks: ["video_playlist", "text", "assessment"], isBuiltIn: true },
  { id: "tpl-final-revision", name: "Final Revision", type: "final_revision", blocks: ["text", "assessment", "completion_rules"], isBuiltIn: true },
  { id: "tpl-live", name: "Live Session", type: "live", blocks: ["live_meeting", "notes", "assessment"], isBuiltIn: true },
  { id: "tpl-practice", name: "Practice Only", type: "practice", blocks: ["assessment", "rewards"], isBuiltIn: true },
  { id: "tpl-crash", name: "Crash Course", type: "crash_course", blocks: ["video_playlist", "text", "assessment", "completion_rules", "rewards"], isBuiltIn: true },
];

/* ═══════════════════════════════════════════════════════════
   METADATA — covers both new and legacy block types
   ═══════════════════════════════════════════════════════════ */

export const SESSION_TYPE_META: Record<SessionWorkspaceType, { label: string; color: string }> = {
  lesson: { label: "Lesson", color: "text-blue-600 bg-blue-500/10" },
  revision: { label: "Revision", color: "text-violet-600 bg-violet-500/10" },
  practice: { label: "Practice", color: "text-emerald-600 bg-emerald-500/10" },
  quiz_session: { label: "Quiz", color: "text-amber-600 bg-amber-500/10" },
  exam_session: { label: "Exam", color: "text-rose-600 bg-rose-500/10" },
  homework_session: { label: "Homework", color: "text-orange-600 bg-orange-500/10" },
  mixed: { label: "Mixed", color: "text-cyan-600 bg-cyan-500/10" },
  live: { label: "Live", color: "text-green-600 bg-green-500/10" },
  crash_course: { label: "Crash Course", color: "text-pink-600 bg-pink-500/10" },
  final_revision: { label: "Final Revision", color: "text-indigo-600 bg-indigo-500/10" },
};

export const BLOCK_META: Record<SessionBlockType, { label: string; icon: string; color: string }> = {
  // New blocks
  video_playlist: { label: "Video Playlist", icon: "🎬", color: "border-blue-300 bg-blue-500/5" },
  resources: { label: "Resources", icon: "📦", color: "border-rose-300 bg-rose-500/5" },
  assessment: { label: "Assessment", icon: "📋", color: "border-cyan-300 bg-cyan-500/5" },
  text: { label: "Text", icon: "📝", color: "border-slate-300 bg-slate-500/5" },
  completion_rules: { label: "Completion Rules", icon: "✅", color: "border-emerald-300 bg-emerald-500/5" },
  rewards: { label: "Rewards", icon: "🏆", color: "border-amber-300 bg-amber-500/5" },
  notes: { label: "Notes", icon: "📝", color: "border-violet-300 bg-violet-500/5" },
  qa: { label: "Q&A", icon: "❓", color: "border-amber-300 bg-amber-500/5" },
  discussion: { label: "Discussion", icon: "💬", color: "border-teal-300 bg-teal-500/5" },
  ai_assistant: { label: "AI Assistant", icon: "🤖", color: "border-purple-300 bg-purple-500/5" },
  live_meeting: { label: "Live Meeting", icon: "📡", color: "border-green-300 bg-green-500/5" },
  external_link: { label: "External Link", icon: "🔗", color: "border-sky-300 bg-sky-500/5" },
  // Legacy blocks (kept for backward compat — "notes" already defined above)
  video: { label: "Video", icon: "🎬", color: "border-blue-300 bg-blue-500/5" },
  pdf: { label: "PDF", icon: "📄", color: "border-rose-300 bg-rose-500/5" },
  image: { label: "Image", icon: "🖼️", color: "border-emerald-300 bg-emerald-500/5" },
  question_block: { label: "Questions", icon: "❓", color: "border-amber-300 bg-amber-500/5" },
  quiz_block: { label: "Quiz", icon: "📋", color: "border-cyan-300 bg-cyan-500/5" },
  homework_block: { label: "Homework", icon: "✏️", color: "border-orange-300 bg-orange-500/5" },
  exam_block: { label: "Exam", icon: "📑", color: "border-red-300 bg-red-500/5" },
  assignment_block: { label: "Assignment", icon: "📁", color: "border-slate-300 bg-slate-500/5" },
  meeting_link: { label: "Live Meeting", icon: "📡", color: "border-green-300 bg-green-500/5" },
  mind_map: { label: "Mind Map", icon: "🧠", color: "border-pink-300 bg-pink-500/5" },
  summary: { label: "Summary", icon: "📊", color: "border-indigo-300 bg-indigo-500/5" },
};

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */

let _blockCounter = 0;
function nextBlockId(): string {
  return `blk-${Date.now()}-${++_blockCounter}`;
}

export function mapLegacyBlockToNewBlock(block: SessionBlock): SessionBlock {
  const mapped = LEGACY_TO_NEW_BLOCK_MAP[block.type as LegacySessionBlockType];
  if (!mapped) return block;
  return { ...block, type: mapped };
}

export function normalizeSessionBlock<T extends SessionBlock>(block: T): T {
  return {
    ...block,
    order: block.order ?? 0,
    required: block.required ?? false,
    status: block.status ?? "active",
  };
}

export function normalizeSessionWorkspaceData(data: Partial<SessionWorkspaceData>): SessionWorkspaceData {
  const defaults: SessionWorkspaceData = {
    subtitle: "",
    thumbnailUrl: "",
    bannerUrl: "",
    previewVideoUrl: "",
    teacherNote: "",
    difficulty: "beginner",
    estimatedMinutes: 0,
    workspaceType: "lesson",
    blocks: [],
    dependencies: [],
    prerequisiteSessionIds: [],
    completionRules: {},
    rewards: { xp: 0 },
    targets: [{ type: "all" }],
    objectives: [],
    version: 1,
  };
  return {
    ...defaults,
    ...data,
    blocks: (data.blocks || []).map((b) => normalizeSessionBlock(b)),
  };
}

export function createDefaultBlock(type: SessionBlockType, order: number = 0): SessionBlock {
  const meta = BLOCK_META[type];
  return {
    id: nextBlockId(),
    type,
    title: meta?.label || type,
    order,
    required: false,
    status: "active",
  };
}

export function createDefaultVideoPlaylistBlock(order: number = 0): VideoPlaylistBlock {
  return {
    id: nextBlockId(),
    type: "video_playlist",
    title: "Video Playlist",
    order,
    required: true,
    status: "active",
    items: [],
    settings: {
      autoNext: true,
      allowSkip: false,
      showCheckmarks: true,
      showDuration: true,
      completionThresholdPercent: 80,
    },
  };
}

export function createDefaultResourcesBlock(order: number = 0): ResourcesBlock {
  return {
    id: nextBlockId(),
    type: "resources",
    title: "Resources",
    order,
    required: false,
    status: "active",
    materialIds: [],
    externalLinks: [],
  };
}

export function createDefaultAssessmentBlock(order: number = 0): AssessmentBlock {
  return {
    id: nextBlockId(),
    type: "assessment",
    title: "Assessment",
    order,
    required: false,
    status: "active",
    assessmentId: "",
    unlockNextOnPass: false,
  };
}

export function createDefaultTextBlock(textType: TextBlockType = "instructions", order: number = 0): TextBlock {
  return {
    id: nextBlockId(),
    type: "text",
    title: textType.charAt(0).toUpperCase() + textType.slice(1).replace("_", " "),
    order,
    required: false,
    status: "active",
    content: "",
    textType,
  };
}

export function createDefaultCompletionRulesBlock(order: number = 0): CompletionRulesBlock {
  return {
    id: nextBlockId(),
    type: "completion_rules",
    title: "Completion Rules",
    order,
    required: false,
    status: "active",
    rules: [
      { id: "cr-1", ruleType: "all_required_blocks_complete", required: true, description: "Complete all required blocks" },
    ],
  };
}

export function createDefaultRewardsBlock(order: number = 0): RewardsBlock {
  return {
    id: nextBlockId(),
    type: "rewards",
    title: "Rewards",
    order,
    required: false,
    status: "active",
    xp: 50,
    walletCoins: 10,
    badgeIds: [],
    certificateEnabled: false,
    rewardOn: "session_complete",
  };
}

export function createDefaultNotesBlock(order: number = 0): NotesBlock {
  return {
    id: nextBlockId(),
    type: "notes",
    title: "Notes",
    order,
    required: false,
    status: "active",
    allowStudentNotes: true,
    allowPrivateNotes: true,
    allowPinnedNotes: true,
    teacherStarterNotes: [],
  };
}

export function createDefaultAIAssistantBlock(order: number = 0): AIAssistantBlock {
  return {
    id: nextBlockId(),
    type: "ai_assistant",
    title: "AI Assistant",
    order,
    required: false,
    status: "active",
    enabled: true,
    modes: ["explain", "summarize", "quiz_me"],
  };
}

export function buildStudentSessionFromWorkspace(data: SessionWorkspaceData): {
  blocks: TypedSessionBlock[];
  completionRules: CompletionRule[];
  rewards: RewardsBlock | null;
} {
  const studentBlocks = data.blocks
    .filter((b) => b.status !== "hidden" && b.status !== "disabled")
    .map((b) => normalizeSessionBlock(b))
    .sort((a, b) => a.order - b.order);

  const completionBlock = studentBlocks.find((b) => b.type === "completion_rules") as CompletionRulesBlock | undefined;
  const rewardsBlock = studentBlocks.find((b) => b.type === "rewards") as RewardsBlock | undefined;

  return {
    blocks: studentBlocks.filter((b) => b.type !== "completion_rules" && b.type !== "rewards"),
    completionRules: completionBlock?.rules || [],
    rewards: rewardsBlock || null,
  };
}

/* ═══════════════════════════════════════════════════════════
   MOCK WORKSPACE EXAMPLES
   ═══════════════════════════════════════════════════════════ */

export const MOCK_WORKSPACES: SessionWorkspaceData[] = [
  // 1. Traditional lesson
  normalizeSessionWorkspaceData({
    id: "ws-trad-1",
    publicCode: "SES-26-000001",
    title: "Limits Introduction",
    subtitle: "Understanding the concept of limits",
    workspaceType: "lesson",
    teachingMode: "traditional",
    difficulty: "beginner",
    estimatedMinutes: 45,
    accessModel: "included_in_course",
    status: "published",
    version: 1,
    blocks: [
      { ...createDefaultVideoPlaylistBlock(0), title: "Lesson Video", items: [{ id: "vpi-1", title: "Limits Introduction", description: "Full lesson video", materialId: "mat-1", required: true, completionThresholdPercent: 80, order: 0 }] },
      { ...createDefaultResourcesBlock(1), title: "Lesson Resources", materialIds: ["mat-pdf-1"] },
      { ...createDefaultAssessmentBlock(2), title: "Post-Lesson Quiz", assessmentId: "asm-1", required: true, unlockNextOnPass: true },
    ],
  }),

  // 2. Enhanced revision
  normalizeSessionWorkspaceData({
    id: "ws-rev-1",
    publicCode: "SES-26-000002",
    title: "Derivatives Review",
    subtitle: "Comprehensive derivatives revision",
    workspaceType: "revision",
    teachingMode: "enhanced",
    difficulty: "intermediate",
    estimatedMinutes: 60,
    accessModel: "paid_once",
    price: 15,
    currency: "USD",
    status: "published",
    version: 1,
    blocks: [
      {
        ...createDefaultVideoPlaylistBlock(0),
        title: "Revision Videos",
        items: [
          { id: "vpi-r1", title: "Power Rule Recap", materialId: "mat-2", required: true, completionThresholdPercent: 80, order: 0, description: "" },
          { id: "vpi-r2", title: "Chain Rule Recap", materialId: "mat-3", required: true, completionThresholdPercent: 80, order: 1, description: "" },
        ],
      },
      { ...createDefaultAssessmentBlock(1), title: "Revision Assessment", assessmentId: "asm-2", required: true },
      {
        ...createDefaultCompletionRulesBlock(2),
        rules: [
          { id: "cr-r1", ruleType: "watch_percentage", threshold: 80, required: true, description: "Watch 80% of all videos" },
          { id: "cr-r2", ruleType: "assessment_pass", targetBlockId: "blk-assessment", threshold: 70, required: true, description: "Score 70%+ on assessment" },
        ],
      },
      { ...createDefaultRewardsBlock(3), xp: 100, walletCoins: 20, rewardOn: "session_complete" },
    ],
  }),

  // 3. Smart CLASSZ session
  normalizeSessionWorkspaceData({
    id: "ws-smart-1",
    publicCode: "SES-26-000003",
    title: "Integration Techniques Mastery",
    subtitle: "Master integration with AI-powered support",
    workspaceType: "lesson",
    teachingMode: "smart_classz",
    difficulty: "advanced",
    estimatedMinutes: 90,
    accessModel: "paid_once",
    price: 25,
    currency: "USD",
    status: "draft",
    version: 1,
    blocks: [
      {
        ...createDefaultVideoPlaylistBlock(0),
        title: "Integration Videos",
        settings: { autoNext: true, allowSkip: false, showCheckmarks: true, showDuration: true, completionThresholdPercent: 85 },
        items: [
          { id: "vpi-s1", title: "Substitution Method", materialId: "mat-4", fromTime: 0, toTime: 900, required: true, completionThresholdPercent: 85, order: 0, description: "" },
          { id: "vpi-s2", title: "Integration by Parts", materialId: "mat-4", fromTime: 900, toTime: 1800, required: true, completionThresholdPercent: 85, order: 1, description: "" },
          { id: "vpi-s3", title: "Partial Fractions", materialId: "mat-5", required: true, completionThresholdPercent: 85, order: 2, description: "" },
        ],
      },
      { ...createDefaultResourcesBlock(1), title: "Formula Sheets & Practice", materialIds: ["mat-pdf-2", "mat-pdf-3"], externalLinks: [{ id: "el-1", title: "Desmos Graphing Calculator", url: "https://www.desmos.com/calculator" }] },
      { ...createDefaultAssessmentBlock(2), title: "Integration Challenge", assessmentId: "asm-3", required: true, passScoreOverride: 75, attemptLimitOverride: 3, unlockNextOnPass: true },
      { ...createDefaultNotesBlock(3), teacherStarterNotes: ["Remember: ∫ u dv = uv − ∫ v du", "LIATE rule for choosing u in integration by parts"] },
      { ...createDefaultAIAssistantBlock(4), modes: ["explain", "summarize", "quiz_me", "weak_concepts"] },
      {
        ...createDefaultCompletionRulesBlock(5),
        rules: [
          { id: "cr-s1", ruleType: "watch_percentage", threshold: 85, required: true, description: "Watch 85% of all videos" },
          { id: "cr-s2", ruleType: "assessment_pass", threshold: 75, required: true, description: "Score 75%+ on assessment" },
          { id: "cr-s3", ruleType: "resource_download", required: false, description: "Download formula sheets" },
        ],
      },
      { ...createDefaultRewardsBlock(6), xp: 200, walletCoins: 50, certificateEnabled: true, rewardOn: "session_complete" },
    ],
  }),
];
