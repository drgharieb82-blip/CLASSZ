export interface WrongQuestion {
  id: string;
  subjectId: string;
  subjectName: string;
  courseName: string;
  chapterName: string;
  lessonName: string;
  conceptName: string;
  atomicConcept: string;
  difficulty: "Easy" | "Medium" | "Hard";
  source: "quiz" | "practice" | "chapter-exam" | "final-exam";
  type: "mcq" | "essay" | "diagram";
  body: string;
  diagramDescription?: string;
  options?: string[];
  studentAnswer: number | string;
  correctAnswer: number | string;
  explanation: string;
  dateAnsweredWrong: string;
  retryCount: number;
  lastRetryDate: string | null;
  retryCorrected: boolean;
  bookmarked: boolean;
  notes: string;
}

export interface WrongQSubjectSummary {
  subjectId: string;
  subjectName: string;
  emoji: string;
  color: string;
  totalWrong: number;
  retriedCount: number;
  stillWeakCount: number;
  accuracyAfterRetry: number;
  lastMistakeDate: string;
}

export const wrongQuestionsList: WrongQuestion[] = [
  // ── Chemistry ──
  {
    id: "wq-1",
    subjectId: "sub-chem",
    subjectName: "Chemistry",
    courseName: "Chemistry Grade 12",
    chapterName: "Chemical Equilibrium",
    lessonName: "Equilibrium Concepts",
    conceptName: "Le Chatelier's Principle",
    atomicConcept: "Effect of temperature on exothermic reactions",
    difficulty: "Medium",
    source: "quiz",
    type: "mcq",
    body: "For the reaction N₂(g) + 3H₂(g) ⇌ 2NH₃(g) + heat, what happens if the temperature is increased?",
    options: [
      "Equilibrium shifts right, producing more NH₃",
      "Equilibrium shifts left, producing more N₂ and H₂",
      "No change in equilibrium position",
      "The reaction stops completely",
    ],
    studentAnswer: 0,
    correctAnswer: 1,
    explanation: "This is an exothermic reaction. Increasing temperature shifts equilibrium in the endothermic direction (left).",
    dateAnsweredWrong: "2026-06-18",
    retryCount: 1,
    lastRetryDate: "2026-06-19",
    retryCorrected: false,
    bookmarked: true,
    notes: "I keep confusing which direction exothermic shifts with temp increase",
  },
  {
    id: "wq-2",
    subjectId: "sub-chem",
    subjectName: "Chemistry",
    courseName: "Chemistry Grade 12",
    chapterName: "Chemical Equilibrium",
    lessonName: "Ksp & Solubility",
    conceptName: "Ksp Calculations",
    atomicConcept: "Molar solubility from Ksp",
    difficulty: "Medium",
    source: "chapter-exam",
    type: "mcq",
    body: "If the Ksp of AgCl is 1.8 × 10⁻¹⁰, what is the molar solubility of AgCl?",
    options: ["1.34 × 10⁻⁵ M", "1.8 × 10⁻¹⁰ M", "9.0 × 10⁻⁶ M", "3.24 × 10⁻²⁰ M"],
    studentAnswer: 1,
    correctAnswer: 0,
    explanation: "For AgCl: Ksp = s². So s = √(1.8 × 10⁻¹⁰) = 1.34 × 10⁻⁵ M.",
    dateAnsweredWrong: "2026-06-17",
    retryCount: 0,
    lastRetryDate: null,
    retryCorrected: false,
    bookmarked: false,
    notes: "",
  },
  {
    id: "wq-3",
    subjectId: "sub-chem",
    subjectName: "Chemistry",
    courseName: "Chemistry Grade 12",
    chapterName: "Electrochemistry",
    lessonName: "Electrochemical Cells",
    conceptName: "Galvanic Cells",
    atomicConcept: "Anode vs cathode in galvanic cells",
    difficulty: "Medium",
    source: "practice",
    type: "mcq",
    body: "In a galvanic cell, oxidation occurs at the:",
    options: ["Cathode", "Anode", "Salt bridge", "External wire"],
    studentAnswer: 0,
    correctAnswer: 1,
    explanation: "AN OX RED CAT: Anode = Oxidation, Cathode = Reduction.",
    dateAnsweredWrong: "2026-06-15",
    retryCount: 2,
    lastRetryDate: "2026-06-18",
    retryCorrected: true,
    bookmarked: false,
    notes: "",
  },
  {
    id: "wq-4",
    subjectId: "sub-chem",
    subjectName: "Chemistry",
    courseName: "Chemistry Grade 12",
    chapterName: "Organic Chemistry",
    lessonName: "Functional Groups",
    conceptName: "Alcohols & Phenols",
    atomicConcept: "Lucas reagent test",
    difficulty: "Medium",
    source: "practice",
    type: "mcq",
    body: "Which reagent distinguishes primary, secondary, and tertiary alcohols?",
    options: ["Bromine water", "Lucas reagent", "Fehling's solution", "Tollens' reagent"],
    studentAnswer: 2,
    correctAnswer: 1,
    explanation: "Lucas reagent (ZnCl₂ + conc. HCl) reacts fastest with tertiary, then secondary, then primary.",
    dateAnsweredWrong: "2026-06-16",
    retryCount: 0,
    lastRetryDate: null,
    retryCorrected: false,
    bookmarked: true,
    notes: "",
  },
  {
    id: "wq-5",
    subjectId: "sub-chem",
    subjectName: "Chemistry",
    courseName: "Chemistry Grade 12",
    chapterName: "Structure of the Atom",
    lessonName: "Electron Configuration",
    conceptName: "Aufbau Principle",
    atomicConcept: "Chromium exception",
    difficulty: "Medium",
    source: "final-exam",
    type: "essay",
    body: "Write the electron configuration of Iron (Fe, Z=26) and explain why chromium (Cr, Z=24) is an exception to the Aufbau principle.",
    studentAnswer: "Fe: 1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁸. Chromium follows Aufbau normally.",
    correctAnswer: "Fe: 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶. Chromium is [Ar] 3d⁵ 4s¹ because half-filled d subshells are more stable.",
    explanation: "Fe has 4s² 3d⁶, not 3d⁸. Cr is [Ar] 3d⁵ 4s¹ due to exchange energy stabilization of the half-filled d subshell.",
    dateAnsweredWrong: "2026-06-14",
    retryCount: 1,
    lastRetryDate: "2026-06-16",
    retryCorrected: true,
    bookmarked: false,
    notes: "Need to remember: 4s fills before 3d, and Cr/Cu are exceptions",
  },

  // ── Physics ──
  {
    id: "wq-6",
    subjectId: "sub-phys",
    subjectName: "Physics",
    courseName: "Physics Grade 12",
    chapterName: "Mechanics",
    lessonName: "Projectile Motion",
    conceptName: "Range equation",
    atomicConcept: "Maximum range angle",
    difficulty: "Easy",
    source: "quiz",
    type: "mcq",
    body: "At what angle of projection is the range of a projectile maximum?",
    options: ["30°", "45°", "60°", "90°"],
    studentAnswer: 2,
    correctAnswer: 1,
    explanation: "Maximum range occurs at 45° because R = v²sin(2θ)/g, and sin(90°) = 1 is the maximum value.",
    dateAnsweredWrong: "2026-06-18",
    retryCount: 0,
    lastRetryDate: null,
    retryCorrected: false,
    bookmarked: false,
    notes: "",
  },
  {
    id: "wq-7",
    subjectId: "sub-phys",
    subjectName: "Physics",
    courseName: "Physics Grade 12",
    chapterName: "Waves & Sound",
    lessonName: "Wave Properties",
    conceptName: "Doppler Effect",
    atomicConcept: "Frequency change with source motion",
    difficulty: "Hard",
    source: "chapter-exam",
    type: "mcq",
    body: "When a sound source moves toward an observer, the observed frequency:",
    options: ["Decreases", "Increases", "Stays the same", "Becomes zero"],
    studentAnswer: 0,
    correctAnswer: 1,
    explanation: "When the source approaches, wavefronts are compressed, resulting in a higher observed frequency.",
    dateAnsweredWrong: "2026-06-17",
    retryCount: 1,
    lastRetryDate: "2026-06-19",
    retryCorrected: false,
    bookmarked: true,
    notes: "",
  },
  {
    id: "wq-8",
    subjectId: "sub-phys",
    subjectName: "Physics",
    courseName: "Physics Grade 12",
    chapterName: "Electricity",
    lessonName: "Ohm's Law",
    conceptName: "Series circuits",
    atomicConcept: "Total resistance in series",
    difficulty: "Easy",
    source: "practice",
    type: "mcq",
    body: "Three resistors of 2Ω, 3Ω, and 5Ω are connected in series. What is the total resistance?",
    options: ["0.97Ω", "3.33Ω", "10Ω", "30Ω"],
    studentAnswer: 1,
    correctAnswer: 2,
    explanation: "In series, total resistance is the sum: R = 2 + 3 + 5 = 10Ω.",
    dateAnsweredWrong: "2026-06-12",
    retryCount: 1,
    lastRetryDate: "2026-06-13",
    retryCorrected: true,
    bookmarked: false,
    notes: "",
  },

  // ── Mathematics ──
  {
    id: "wq-9",
    subjectId: "sub-math",
    subjectName: "Mathematics",
    courseName: "Mathematics Grade 12",
    chapterName: "Differential Calculus",
    lessonName: "Chain Rule",
    conceptName: "Composite function differentiation",
    atomicConcept: "Chain rule application",
    difficulty: "Medium",
    source: "quiz",
    type: "mcq",
    body: "What is the derivative of f(x) = sin(3x²)?",
    options: ["cos(3x²)", "6x·cos(3x²)", "3x²·cos(3x²)", "cos(6x)"],
    studentAnswer: 0,
    correctAnswer: 1,
    explanation: "Using chain rule: f'(x) = cos(3x²) · d/dx(3x²) = cos(3x²) · 6x = 6x·cos(3x²).",
    dateAnsweredWrong: "2026-06-19",
    retryCount: 0,
    lastRetryDate: null,
    retryCorrected: false,
    bookmarked: true,
    notes: "Forgot to multiply by the inner derivative",
  },
  {
    id: "wq-10",
    subjectId: "sub-math",
    subjectName: "Mathematics",
    courseName: "Mathematics Grade 12",
    chapterName: "Integral Calculus",
    lessonName: "Integration by Substitution",
    conceptName: "u-substitution",
    atomicConcept: "Choosing the correct u",
    difficulty: "Hard",
    source: "final-exam",
    type: "essay",
    body: "Evaluate ∫ 2x·cos(x²) dx using substitution.",
    studentAnswer: "sin(x²)/2x + C",
    correctAnswer: "Let u = x², du = 2x dx. ∫ cos(u) du = sin(u) + C = sin(x²) + C.",
    explanation: "With u = x², du = 2x dx matches exactly. The integral becomes ∫ cos(u) du = sin(u) + C = sin(x²) + C.",
    dateAnsweredWrong: "2026-06-15",
    retryCount: 0,
    lastRetryDate: null,
    retryCorrected: false,
    bookmarked: false,
    notes: "",
  },

  // ── English ──
  {
    id: "wq-11",
    subjectId: "sub-eng",
    subjectName: "English",
    courseName: "English Grade 12",
    chapterName: "Grammar",
    lessonName: "Tenses",
    conceptName: "Present Perfect vs Past Simple",
    atomicConcept: "Time expressions with tenses",
    difficulty: "Easy",
    source: "practice",
    type: "mcq",
    body: "Choose the correct tense: 'I ___ (live) in Cairo since 2020.'",
    options: ["lived", "have lived", "am living", "was living"],
    studentAnswer: 0,
    correctAnswer: 1,
    explanation: "'Since 2020' indicates an action that started in the past and continues to the present — use Present Perfect.",
    dateAnsweredWrong: "2026-06-16",
    retryCount: 1,
    lastRetryDate: "2026-06-17",
    retryCorrected: true,
    bookmarked: false,
    notes: "",
  },

  // ── Arabic ──
  {
    id: "wq-12",
    subjectId: "sub-arabic",
    subjectName: "Arabic",
    courseName: "Arabic Grade 12",
    chapterName: "النحو",
    lessonName: "المبتدأ والخبر",
    conceptName: "إعراب المبتدأ",
    atomicConcept: "رفع المبتدأ",
    difficulty: "Medium",
    source: "quiz",
    type: "mcq",
    body: "ما إعراب كلمة 'العلمُ' في جملة 'العلمُ نورٌ'؟",
    options: ["فاعل مرفوع", "مبتدأ مرفوع", "خبر مرفوع", "مفعول به منصوب"],
    studentAnswer: 0,
    correctAnswer: 1,
    explanation: "'العلمُ' في هذه الجملة الاسمية هو المبتدأ، مرفوع وعلامة رفعه الضمة الظاهرة.",
    dateAnsweredWrong: "2026-06-14",
    retryCount: 0,
    lastRetryDate: null,
    retryCorrected: false,
    bookmarked: false,
    notes: "",
  },
];

export function getWrongSubjectSummaries(): WrongQSubjectSummary[] {
  const subjects = [
    { id: "sub-chem", name: "Chemistry", emoji: "🧪", color: "from-emerald-500 to-teal-500" },
    { id: "sub-phys", name: "Physics", emoji: "⚛️", color: "from-blue-500 to-cyan-500" },
    { id: "sub-bio", name: "Biology", emoji: "🧬", color: "from-green-500 to-emerald-500" },
    { id: "sub-math", name: "Mathematics", emoji: "📐", color: "from-violet-500 to-blue-500" },
    { id: "sub-arabic", name: "Arabic", emoji: "🕌", color: "from-amber-500 to-orange-500" },
    { id: "sub-eng", name: "English", emoji: "📚", color: "from-pink-500 to-rose-500" },
  ];

  return subjects.map((s) => {
    const qs = wrongQuestionsList.filter((q) => q.subjectId === s.id);
    const retried = qs.filter((q) => q.retryCount > 0);
    const corrected = qs.filter((q) => q.retryCorrected);
    const stillWeak = qs.filter((q) => !q.retryCorrected);
    const dates = qs.map((q) => q.dateAnsweredWrong).sort().reverse();

    return {
      subjectId: s.id,
      subjectName: s.name,
      emoji: s.emoji,
      color: s.color,
      totalWrong: qs.length,
      retriedCount: retried.length,
      stillWeakCount: stillWeak.length,
      accuracyAfterRetry: retried.length > 0 ? Math.round((corrected.length / retried.length) * 100) : 0,
      lastMistakeDate: dates[0] ?? "—",
    };
  });
}

export function getWrongQuestionsForSubject(subjectId: string): WrongQuestion[] {
  return wrongQuestionsList.filter((q) => q.subjectId === subjectId);
}
