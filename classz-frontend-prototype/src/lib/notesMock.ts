export type NoteImportance = "low" | "medium" | "high";
export type NoteSmartType =
  | "chemistry-equation"
  | "physics-law"
  | "math-formula"
  | "definition"
  | "question"
  | "general";

export interface SessionNote {
  id: string;
  body: string;
  subjectName: string;
  courseName: string;
  sessionTitle: string;
  sessionItemTitle: string;
  sessionItemId: string;
  itemType: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  importance: NoteImportance;
  pinned: boolean;
  smartType: NoteSmartType;
}

const CHEM_PATTERNS = /(\b(mol|pH|Ksp|Kc|Kp|ΔH|ΔG|→|⇌|oxidation|reduction|equilibrium|reaction|acid|base|ion)\b|[A-Z][a-z]?[₂₃₄₅₆₇₈₉⁺⁻])/i;
const PHYS_PATTERNS = /\b(Newton|force|velocity|acceleration|energy|momentum|wave|ohm|volt|ampere|F\s*=\s*m|v\s*=|E\s*=|P\s*=)\b/i;
const MATH_PATTERNS = /(∫|∑|lim|d\/dx|derivative|integral|sin|cos|tan|log|ln|x²|√|Σ|\bslope\b|\bfunction\b)/i;
const DEF_PATTERNS = /\b(is defined as|means|refers to|is the|definition|is called)\b/i;
const QUESTION_PATTERNS = /(\?\s*$|^(why|how|what|when|where|does|can|is it|should)\b)/im;

export function detectSmartType(text: string): NoteSmartType {
  if (QUESTION_PATTERNS.test(text)) return "question";
  if (CHEM_PATTERNS.test(text)) return "chemistry-equation";
  if (PHYS_PATTERNS.test(text)) return "physics-law";
  if (MATH_PATTERNS.test(text)) return "math-formula";
  if (DEF_PATTERNS.test(text)) return "definition";
  return "general";
}

export const smartTypeLabels: Record<NoteSmartType, string> = {
  "chemistry-equation": "Chemistry",
  "physics-law": "Physics Law",
  "math-formula": "Math Formula",
  definition: "Definition",
  question: "Question",
  general: "General",
};

export const smartTypeColors: Record<NoteSmartType, string> = {
  "chemistry-equation": "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
  "physics-law": "text-blue-400 bg-blue-500/15 border-blue-500/30",
  "math-formula": "text-violet-400 bg-violet-500/15 border-violet-500/30",
  definition: "text-cyan-400 bg-cyan-500/15 border-cyan-500/30",
  question: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  general: "text-slate-400 bg-slate-500/15 border-slate-500/30",
};

export const importanceColors: Record<NoteImportance, string> = {
  low: "text-slate-400",
  medium: "text-amber-400",
  high: "text-red-400",
};

export const initialNotes: SessionNote[] = [
  {
    id: "n1",
    body: "Ksp = [Ag⁺][Cl⁻] = s². Remember to take the square root to get molar solubility, not use Ksp directly.",
    subjectName: "Mathematics",
    courseName: "Advanced Mathematics",
    sessionTitle: "Session 1: Foundations",
    sessionItemTitle: "Limits Introduction",
    sessionItemId: "s1-2",
    itemType: "video",
    createdAt: "2026-06-18T10:30:00Z",
    updatedAt: "2026-06-18T10:30:00Z",
    tags: ["Ksp", "solubility"],
    importance: "high",
    pinned: true,
    smartType: "chemistry-equation",
  },
  {
    id: "n2",
    body: "The derivative of f(x) = xⁿ is f'(x) = nxⁿ⁻¹. This is the power rule.",
    subjectName: "Mathematics",
    courseName: "Advanced Mathematics",
    sessionTitle: "Session 2: Differential Calculus",
    sessionItemTitle: "Power Rule & Constant Rule",
    sessionItemId: "s2-2",
    itemType: "video",
    createdAt: "2026-06-19T14:15:00Z",
    updatedAt: "2026-06-19T14:15:00Z",
    tags: ["power rule", "derivatives"],
    importance: "medium",
    pinned: false,
    smartType: "math-formula",
  },
  {
    id: "n3",
    body: "Why does the chain rule multiply by the inner derivative? Need to ask the teacher for a visual proof.",
    subjectName: "Mathematics",
    courseName: "Advanced Mathematics",
    sessionTitle: "Session 2: Differential Calculus",
    sessionItemTitle: "Quick Quiz: Derivative Rules",
    sessionItemId: "s2-3",
    itemType: "quiz",
    createdAt: "2026-06-19T15:00:00Z",
    updatedAt: "2026-06-19T15:00:00Z",
    tags: ["chain rule"],
    importance: "medium",
    pinned: false,
    smartType: "question",
  },
  {
    id: "n4",
    body: "A limit is defined as the value that a function approaches as the input approaches some value.",
    subjectName: "Mathematics",
    courseName: "Advanced Mathematics",
    sessionTitle: "Session 1: Foundations",
    sessionItemTitle: "Limits Introduction",
    sessionItemId: "s1-2",
    itemType: "video",
    createdAt: "2026-06-17T09:20:00Z",
    updatedAt: "2026-06-18T11:00:00Z",
    tags: ["limits", "definition"],
    importance: "low",
    pinned: false,
    smartType: "definition",
  },
  {
    id: "n5",
    body: "Product rule: (fg)' = f'g + fg'. Think of it as 'first d-second plus second d-first'.",
    subjectName: "Mathematics",
    courseName: "Advanced Mathematics",
    sessionTitle: "Session 2: Differential Calculus",
    sessionItemTitle: "Derivatives from First Principles",
    sessionItemId: "s2-1",
    itemType: "video",
    createdAt: "2026-06-19T16:30:00Z",
    updatedAt: "2026-06-19T16:30:00Z",
    tags: ["product rule", "derivatives"],
    importance: "high",
    pinned: true,
    smartType: "math-formula",
  },

  // ── Chemistry notes ──
  {
    id: "n6",
    body: "Le Chatelier's Principle: if you disturb equilibrium, the system shifts to counteract the change.",
    subjectName: "Chemistry",
    courseName: "Chemistry Grade 12",
    sessionTitle: "Session 2: Equilibrium",
    sessionItemTitle: "Equilibrium Concepts",
    sessionItemId: "chem-s2-1",
    itemType: "video",
    createdAt: "2026-06-16T08:30:00Z",
    updatedAt: "2026-06-16T08:30:00Z",
    tags: ["equilibrium", "Le Chatelier"],
    importance: "high",
    pinned: true,
    smartType: "chemistry-equation",
  },
  {
    id: "n7",
    body: "For exothermic reactions, increasing temperature shifts equilibrium LEFT (toward reactants).",
    subjectName: "Chemistry",
    courseName: "Chemistry Grade 12",
    sessionTitle: "Session 2: Equilibrium",
    sessionItemTitle: "Equilibrium Concepts",
    sessionItemId: "chem-s2-1",
    itemType: "video",
    createdAt: "2026-06-16T08:45:00Z",
    updatedAt: "2026-06-16T08:45:00Z",
    tags: ["equilibrium", "temperature"],
    importance: "medium",
    pinned: false,
    smartType: "chemistry-equation",
  },
  {
    id: "n8",
    body: "Ksp = [Ag⁺][Cl⁻] = s². Take the square root of Ksp to find molar solubility for 1:1 salts.",
    subjectName: "Chemistry",
    courseName: "Chemistry Grade 12",
    sessionTitle: "Session 2: Equilibrium",
    sessionItemTitle: "Ksp & Solubility",
    sessionItemId: "chem-s2-2",
    itemType: "video",
    createdAt: "2026-06-17T10:00:00Z",
    updatedAt: "2026-06-17T10:00:00Z",
    tags: ["Ksp", "solubility"],
    importance: "high",
    pinned: false,
    smartType: "chemistry-equation",
  },
  {
    id: "n9",
    body: "AN OX RED CAT — Anode = Oxidation, Reduction = Cathode. Works for both galvanic and electrolytic cells.",
    subjectName: "Chemistry",
    courseName: "Chemistry Grade 12",
    sessionTitle: "Session 1: Structure & Bonding",
    sessionItemTitle: "Oxidation & Reduction",
    sessionItemId: "chem-s1-1",
    itemType: "video",
    createdAt: "2026-06-14T11:20:00Z",
    updatedAt: "2026-06-14T11:20:00Z",
    tags: ["redox", "anode", "cathode"],
    importance: "medium",
    pinned: false,
    smartType: "definition",
  },
  {
    id: "n10",
    body: "Why is the anode negative in galvanic cells but positive in electrolytic cells?",
    subjectName: "Chemistry",
    courseName: "Chemistry Grade 12",
    sessionTitle: "Session 1: Structure & Bonding",
    sessionItemTitle: "Electrochemical Cells Quiz",
    sessionItemId: "chem-s1-2",
    itemType: "quiz",
    createdAt: "2026-06-14T14:00:00Z",
    updatedAt: "2026-06-14T14:00:00Z",
    tags: ["electrochemistry"],
    importance: "medium",
    pinned: false,
    smartType: "question",
  },

  // ── Physics notes ──
  {
    id: "n11",
    body: "F = ma — Newton's second law. Force equals mass times acceleration.",
    subjectName: "Physics",
    courseName: "Physics Grade 12",
    sessionTitle: "Session 1: Mechanics",
    sessionItemTitle: "Newton's Laws",
    sessionItemId: "phys-s1-1",
    itemType: "video",
    createdAt: "2026-06-15T09:00:00Z",
    updatedAt: "2026-06-15T09:00:00Z",
    tags: ["Newton", "force"],
    importance: "high",
    pinned: true,
    smartType: "physics-law",
  },
  {
    id: "n12",
    body: "Maximum projectile range occurs at 45° because R = v²sin(2θ)/g and sin(90°) = 1.",
    subjectName: "Physics",
    courseName: "Physics Grade 12",
    sessionTitle: "Session 1: Mechanics",
    sessionItemTitle: "Projectile Motion",
    sessionItemId: "phys-s1-2",
    itemType: "video",
    createdAt: "2026-06-15T10:30:00Z",
    updatedAt: "2026-06-15T10:30:00Z",
    tags: ["projectile", "range"],
    importance: "medium",
    pinned: false,
    smartType: "physics-law",
  },
  {
    id: "n13",
    body: "Doppler effect: approaching source = higher frequency. Moving away = lower frequency.",
    subjectName: "Physics",
    courseName: "Physics Grade 12",
    sessionTitle: "Session 2: Waves",
    sessionItemTitle: "Wave Properties",
    sessionItemId: "phys-s2-1",
    itemType: "video",
    createdAt: "2026-06-17T13:00:00Z",
    updatedAt: "2026-06-17T13:00:00Z",
    tags: ["Doppler", "waves", "frequency"],
    importance: "medium",
    pinned: false,
    smartType: "physics-law",
  },
  {
    id: "n14",
    body: "In series circuits, total resistance = R₁ + R₂ + R₃. Simple addition.",
    subjectName: "Physics",
    courseName: "Physics Grade 12",
    sessionTitle: "Session 3: Electricity",
    sessionItemTitle: "Ohm's Law",
    sessionItemId: "phys-s3-1",
    itemType: "video",
    createdAt: "2026-06-18T11:00:00Z",
    updatedAt: "2026-06-18T11:00:00Z",
    tags: ["resistance", "series"],
    importance: "low",
    pinned: false,
    smartType: "physics-law",
  },

  // ── English notes ──
  {
    id: "n15",
    body: "'Since' and 'for' are used with Present Perfect. 'Since' = point in time, 'for' = duration.",
    subjectName: "English",
    courseName: "English Grade 12",
    sessionTitle: "Session 1: Grammar",
    sessionItemTitle: "Tenses",
    sessionItemId: "eng-s1-1",
    itemType: "video",
    createdAt: "2026-06-13T09:00:00Z",
    updatedAt: "2026-06-13T09:00:00Z",
    tags: ["tenses", "present perfect"],
    importance: "medium",
    pinned: false,
    smartType: "definition",
  },
  {
    id: "n16",
    body: "Essay structure: Introduction (hook + thesis) → Body (3 paragraphs) → Conclusion (restate + final thought).",
    subjectName: "English",
    courseName: "English Grade 12",
    sessionTitle: "Session 2: Writing",
    sessionItemTitle: "Essay Structure",
    sessionItemId: "eng-s2-1",
    itemType: "video",
    createdAt: "2026-06-14T10:00:00Z",
    updatedAt: "2026-06-14T10:00:00Z",
    tags: ["essay", "structure"],
    importance: "high",
    pinned: true,
    smartType: "general",
  },
];
