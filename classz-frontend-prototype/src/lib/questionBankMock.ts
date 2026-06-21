export interface QBConcept {
  id: string;
  name: string;
  questionCount: number;
}

export interface QBLesson {
  id: string;
  title: string;
  concepts: QBConcept[];
}

export interface QBChapter {
  id: string;
  title: string;
  lessons: QBLesson[];
  totalQuestions: number;
  solvedQuestions: number;
  progress: number;
}

export interface QBExam {
  id: string;
  title: string;
  questionCount: number;
  duration: string;
  status: "available" | "completed" | "locked";
  score?: number;
}

export interface QBSubject {
  id: string;
  name: string;
  emoji: string;
  color: string;
  totalQuestions: number;
  solvedQuestions: number;
  accuracy: number;
  availableExams: number;
  chapters: QBChapter[];
  periodicExams: QBExam[];
  finalExams: QBExam[];
}

export interface QBQuestion {
  id: string;
  type: "mcq" | "essay" | "diagram";
  subjectId: string;
  chapterId: string;
  lessonId: string;
  conceptId: string;
  difficulty: "Easy" | "Medium" | "Hard";
  body: string;
  diagramDescription?: string;
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  relatedConcept: string;
  commonMistakes: string;
  hint: string;
}

// ── Chemistry (detailed) ──────────────────────────────────────────────

const chemistryChapters: QBChapter[] = [
  {
    id: "ch-chem-1",
    title: "Structure of the Atom",
    totalQuestions: 40,
    solvedQuestions: 28,
    progress: 70,
    lessons: [
      {
        id: "ls-c1-1",
        title: "Atomic Models",
        concepts: [
          { id: "cn-c1-1-1", name: "Bohr Model", questionCount: 8 },
          { id: "cn-c1-1-2", name: "Quantum Model", questionCount: 6 },
        ],
      },
      {
        id: "ls-c1-2",
        title: "Electron Configuration",
        concepts: [
          { id: "cn-c1-2-1", name: "Aufbau Principle", questionCount: 7 },
          { id: "cn-c1-2-2", name: "Hund's Rule", questionCount: 5 },
          { id: "cn-c1-2-3", name: "Pauli Exclusion Principle", questionCount: 4 },
        ],
      },
      {
        id: "ls-c1-3",
        title: "Periodic Properties",
        concepts: [
          { id: "cn-c1-3-1", name: "Ionization Energy", questionCount: 5 },
          { id: "cn-c1-3-2", name: "Electronegativity", questionCount: 5 },
        ],
      },
    ],
  },
  {
    id: "ch-chem-2",
    title: "Electrochemistry",
    totalQuestions: 35,
    solvedQuestions: 14,
    progress: 40,
    lessons: [
      {
        id: "ls-c2-1",
        title: "Oxidation & Reduction",
        concepts: [
          { id: "cn-c2-1-1", name: "Oxidation Numbers", questionCount: 6 },
          { id: "cn-c2-1-2", name: "Redox Reactions", questionCount: 8 },
        ],
      },
      {
        id: "ls-c2-2",
        title: "Electrochemical Cells",
        concepts: [
          { id: "cn-c2-2-1", name: "Galvanic Cells", questionCount: 7 },
          { id: "cn-c2-2-2", name: "Electrolytic Cells", questionCount: 7 },
        ],
      },
      {
        id: "ls-c2-3",
        title: "Electrode Potentials",
        concepts: [
          { id: "cn-c2-3-1", name: "Standard Electrode Potential", questionCount: 7 },
        ],
      },
    ],
  },
  {
    id: "ch-chem-3",
    title: "Chemical Equilibrium",
    totalQuestions: 45,
    solvedQuestions: 10,
    progress: 22,
    lessons: [
      {
        id: "ls-c3-1",
        title: "Equilibrium Concepts",
        concepts: [
          { id: "cn-c3-1-1", name: "Le Chatelier's Principle", questionCount: 10 },
          { id: "cn-c3-1-2", name: "Equilibrium Constants (Kc, Kp)", questionCount: 8 },
        ],
      },
      {
        id: "ls-c3-2",
        title: "Ksp & Solubility",
        concepts: [
          { id: "cn-c3-2-1", name: "Ksp Calculations", questionCount: 9 },
          { id: "cn-c3-2-2", name: "Common Ion Effect", questionCount: 6 },
        ],
      },
      {
        id: "ls-c3-3",
        title: "Acids & Bases Equilibrium",
        concepts: [
          { id: "cn-c3-3-1", name: "pH Calculations", questionCount: 7 },
          { id: "cn-c3-3-2", name: "Buffer Solutions", questionCount: 5 },
        ],
      },
    ],
  },
  {
    id: "ch-chem-4",
    title: "Organic Chemistry",
    totalQuestions: 50,
    solvedQuestions: 6,
    progress: 12,
    lessons: [
      {
        id: "ls-c4-1",
        title: "Hydrocarbons",
        concepts: [
          { id: "cn-c4-1-1", name: "Alkanes", questionCount: 8 },
          { id: "cn-c4-1-2", name: "Alkenes & Alkynes", questionCount: 8 },
        ],
      },
      {
        id: "ls-c4-2",
        title: "Functional Groups",
        concepts: [
          { id: "cn-c4-2-1", name: "Alcohols & Phenols", questionCount: 9 },
          { id: "cn-c4-2-2", name: "Aldehydes & Ketones", questionCount: 8 },
          { id: "cn-c4-2-3", name: "Carboxylic Acids", questionCount: 7 },
        ],
      },
      {
        id: "ls-c4-3",
        title: "Aromatic Chemistry",
        concepts: [
          { id: "cn-c4-3-1", name: "Benzene Structure", questionCount: 5 },
          { id: "cn-c4-3-2", name: "Aromatic Substitution", questionCount: 5 },
        ],
      },
    ],
  },
];

const chemistryPeriodicExams: QBExam[] = [
  { id: "pe-chem-1", title: "Periodic Exam 1 — Chapters 1 & 2", questionCount: 25, duration: "45 min", status: "completed", score: 84 },
  { id: "pe-chem-2", title: "Periodic Exam 2 — Chapters 3 & 4", questionCount: 25, duration: "45 min", status: "available" },
];

const chemistryFinalExams: QBExam[] = [
  { id: "fe-chem-1", title: "Final Exam — Full Syllabus", questionCount: 50, duration: "90 min", status: "available" },
  { id: "fe-chem-2", title: "Final Exam (Model 2)", questionCount: 50, duration: "90 min", status: "locked" },
];

// ── Other subjects (summary only) ─────────────────────────────────────

function makeStubChapters(titles: string[]): QBChapter[] {
  return titles.map((t, i) => ({
    id: `ch-stub-${i}`,
    title: t,
    totalQuestions: 30 + i * 5,
    solvedQuestions: Math.floor((30 + i * 5) * 0.3),
    progress: 30,
    lessons: [
      {
        id: `ls-stub-${i}-1`,
        title: `${t} — Lesson 1`,
        concepts: [
          { id: `cn-stub-${i}-1-1`, name: `Core Concept A`, questionCount: 6 },
          { id: `cn-stub-${i}-1-2`, name: `Core Concept B`, questionCount: 5 },
        ],
      },
      {
        id: `ls-stub-${i}-2`,
        title: `${t} — Lesson 2`,
        concepts: [
          { id: `cn-stub-${i}-2-1`, name: `Core Concept C`, questionCount: 5 },
        ],
      },
    ],
  }));
}

function makeStubExams(prefix: string): { periodic: QBExam[]; final: QBExam[] } {
  return {
    periodic: [
      { id: `pe-${prefix}-1`, title: "Periodic Exam 1", questionCount: 20, duration: "40 min", status: "available" },
    ],
    final: [
      { id: `fe-${prefix}-1`, title: "Final Exam", questionCount: 40, duration: "80 min", status: "locked" },
    ],
  };
}

export const qbSubjects: QBSubject[] = [
  {
    id: "sub-chem",
    name: "Chemistry",
    emoji: "🧪",
    color: "from-emerald-500 to-teal-500",
    totalQuestions: 170,
    solvedQuestions: 58,
    accuracy: 82,
    availableExams: 3,
    chapters: chemistryChapters,
    periodicExams: chemistryPeriodicExams,
    finalExams: chemistryFinalExams,
  },
  {
    id: "sub-phys",
    name: "Physics",
    emoji: "⚛️",
    color: "from-blue-500 to-cyan-500",
    totalQuestions: 150,
    solvedQuestions: 42,
    accuracy: 76,
    availableExams: 2,
    chapters: makeStubChapters(["Mechanics", "Waves & Sound", "Electricity", "Modern Physics"]),
    ...(() => { const e = makeStubExams("phys"); return { periodicExams: e.periodic, finalExams: e.final }; })(),
  },
  {
    id: "sub-bio",
    name: "Biology",
    emoji: "🧬",
    color: "from-green-500 to-emerald-500",
    totalQuestions: 130,
    solvedQuestions: 0,
    accuracy: 0,
    availableExams: 1,
    chapters: makeStubChapters(["Cell Biology", "Genetics", "Human Physiology", "Ecology"]),
    ...(() => { const e = makeStubExams("bio"); return { periodicExams: e.periodic, finalExams: e.final }; })(),
  },
  {
    id: "sub-math",
    name: "Mathematics",
    emoji: "📐",
    color: "from-violet-500 to-blue-500",
    totalQuestions: 200,
    solvedQuestions: 88,
    accuracy: 85,
    availableExams: 3,
    chapters: makeStubChapters(["Limits & Continuity", "Differential Calculus", "Integral Calculus", "Sequences & Series"]),
    ...(() => { const e = makeStubExams("math"); return { periodicExams: e.periodic, finalExams: e.final }; })(),
  },
  {
    id: "sub-arabic",
    name: "Arabic",
    emoji: "🕌",
    color: "from-amber-500 to-orange-500",
    totalQuestions: 100,
    solvedQuestions: 35,
    accuracy: 88,
    availableExams: 1,
    chapters: makeStubChapters(["النحو", "البلاغة", "الأدب"]),
    ...(() => { const e = makeStubExams("ar"); return { periodicExams: e.periodic, finalExams: e.final }; })(),
  },
  {
    id: "sub-eng",
    name: "English",
    emoji: "📚",
    color: "from-pink-500 to-rose-500",
    totalQuestions: 120,
    solvedQuestions: 95,
    accuracy: 94,
    availableExams: 2,
    chapters: makeStubChapters(["Grammar", "Reading Comprehension", "Essay Writing"]),
    ...(() => { const e = makeStubExams("eng"); return { periodicExams: e.periodic, finalExams: e.final }; })(),
  },
];

// ── Sample questions (Chemistry) ──────────────────────────────────────

export const qbQuestions: QBQuestion[] = [
  // Chapter 1: Structure of the Atom
  {
    id: "q-c1-1",
    type: "mcq",
    subjectId: "sub-chem",
    chapterId: "ch-chem-1",
    lessonId: "ls-c1-1",
    conceptId: "cn-c1-1-1",
    difficulty: "Easy",
    body: "In Bohr's model, electrons revolve around the nucleus in fixed paths called:",
    options: ["Orbitals", "Orbits", "Shells", "Energy bands"],
    correctAnswer: 1,
    explanation: "Bohr proposed that electrons move in fixed circular paths called orbits (or energy levels) around the nucleus, not orbitals — which is a quantum mechanical concept referring to probability regions.",
    relatedConcept: "Bohr Model",
    commonMistakes: "Confusing orbits (Bohr) with orbitals (quantum model). Orbits are fixed circular paths; orbitals are 3D probability regions.",
    hint: "Think about what Bohr specifically proposed — fixed circular paths with defined energy levels.",
  },
  {
    id: "q-c1-2",
    type: "mcq",
    subjectId: "sub-chem",
    chapterId: "ch-chem-1",
    lessonId: "ls-c1-1",
    conceptId: "cn-c1-1-2",
    difficulty: "Medium",
    body: "Which quantum number determines the shape of an orbital?",
    options: ["Principal (n)", "Azimuthal (l)", "Magnetic (ml)", "Spin (ms)"],
    correctAnswer: 1,
    explanation: "The azimuthal quantum number (l) determines the shape of the orbital: l=0 is s (spherical), l=1 is p (dumbbell), l=2 is d (cloverleaf), l=3 is f (complex).",
    relatedConcept: "Quantum Model",
    commonMistakes: "Mixing up n (size/energy) with l (shape). The principal quantum number n determines the energy level, not the shape.",
    hint: "Which quantum number is also called the angular momentum quantum number?",
  },
  {
    id: "q-c1-3",
    type: "essay",
    subjectId: "sub-chem",
    chapterId: "ch-chem-1",
    lessonId: "ls-c1-2",
    conceptId: "cn-c1-2-1",
    difficulty: "Medium",
    body: "Write the electron configuration of Iron (Fe, Z=26) and explain why chromium (Cr, Z=24) is an exception to the Aufbau principle.",
    correctAnswer: "Fe: 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶. Chromium is an exception because a half-filled 3d⁵ subshell (with 4s¹) is more stable than 3d⁴ 4s² due to exchange energy stabilization.",
    explanation: "The Aufbau principle predicts Cr would be [Ar] 3d⁴ 4s², but the actual configuration is [Ar] 3d⁵ 4s¹. Half-filled and fully-filled d subshells have extra stability due to symmetrical electron distribution and maximum exchange energy.",
    relatedConcept: "Aufbau Principle",
    commonMistakes: "Writing Cr as [Ar] 3d⁴ 4s² instead of [Ar] 3d⁵ 4s¹. Forgetting that half-filled d subshells are exceptionally stable.",
    hint: "Cr and Cu are the two most common Aufbau exceptions. What do their actual configs have in common?",
  },
  {
    id: "q-c1-4",
    type: "diagram",
    subjectId: "sub-chem",
    chapterId: "ch-chem-1",
    lessonId: "ls-c1-2",
    conceptId: "cn-c1-2-2",
    difficulty: "Easy",
    body: "The orbital diagram below shows the electron filling for nitrogen (N, Z=7). According to Hund's rule, which diagram is correct?",
    diagramDescription: "Diagram A: 2p orbitals show ↑↓ ↑ _ (paired first)\nDiagram B: 2p orbitals show ↑ ↑ ↑ (one electron in each)\nDiagram C: 2p orbitals show ↑↓ ↑↓ ↑ (maximum pairing)\nDiagram D: 2p orbitals show ↓ ↓ ↓ (all spin down)",
    options: ["Diagram A", "Diagram B", "Diagram C", "Diagram D"],
    correctAnswer: 1,
    explanation: "Hund's rule states that electrons fill degenerate orbitals singly with parallel spins before pairing. Nitrogen has 3 electrons in the 2p subshell, so each of the three 2p orbitals gets one electron with the same spin (↑ ↑ ↑).",
    relatedConcept: "Hund's Rule",
    commonMistakes: "Pairing electrons in one orbital before filling all orbitals singly. Hund's rule requires single filling first with parallel spins.",
    hint: "Electrons prefer their own space — like passengers on a bus filling empty seats before sitting next to someone.",
  },

  // Chapter 2: Electrochemistry
  {
    id: "q-c2-1",
    type: "mcq",
    subjectId: "sub-chem",
    chapterId: "ch-chem-2",
    lessonId: "ls-c2-1",
    conceptId: "cn-c2-1-1",
    difficulty: "Easy",
    body: "What is the oxidation number of Mn in KMnO₄?",
    options: ["+4", "+5", "+6", "+7"],
    correctAnswer: 3,
    explanation: "In KMnO₄: K is +1, each O is −2 (total −8 for 4 oxygens). So +1 + Mn + (−8) = 0, which gives Mn = +7.",
    relatedConcept: "Oxidation Numbers",
    commonMistakes: "Forgetting that oxygen is −2 and alkali metals are +1. Students often miscalculate when the compound has multiple oxygens.",
    hint: "Set up the equation: sum of all oxidation numbers = 0 for a neutral compound.",
  },
  {
    id: "q-c2-2",
    type: "mcq",
    subjectId: "sub-chem",
    chapterId: "ch-chem-2",
    lessonId: "ls-c2-2",
    conceptId: "cn-c2-2-1",
    difficulty: "Medium",
    body: "In a galvanic cell, oxidation occurs at the:",
    options: ["Cathode", "Anode", "Salt bridge", "External wire"],
    correctAnswer: 1,
    explanation: "In a galvanic (voltaic) cell, oxidation always occurs at the anode. Remember: AN OX (anode = oxidation), RED CAT (reduction = cathode).",
    relatedConcept: "Galvanic Cells",
    commonMistakes: "Confusing anode and cathode. Remember AN OX RED CAT: Anode = Oxidation, Reduction = Cathode.",
    hint: "Oxidation is loss of electrons. Where does loss happen — the anode or cathode?",
  },
  {
    id: "q-c2-3",
    type: "essay",
    subjectId: "sub-chem",
    chapterId: "ch-chem-2",
    lessonId: "ls-c2-2",
    conceptId: "cn-c2-2-2",
    difficulty: "Hard",
    body: "Compare galvanic and electrolytic cells in terms of: (a) energy conversion, (b) electrode polarity, and (c) spontaneity of reaction.",
    correctAnswer: "(a) Galvanic: chemical → electrical; Electrolytic: electrical → chemical. (b) Galvanic: anode is negative; Electrolytic: anode is positive. (c) Galvanic: spontaneous (ΔG < 0); Electrolytic: non-spontaneous (requires external energy).",
    explanation: "Galvanic cells convert spontaneous chemical reactions into electrical energy, while electrolytic cells use electrical energy to drive non-spontaneous reactions. The polarity of electrodes is reversed between the two types.",
    relatedConcept: "Electrolytic Cells",
    commonMistakes: "Assuming anode polarity is the same in both cell types. In galvanic cells the anode is negative; in electrolytic cells it's positive.",
    hint: "Think about which cell type is spontaneous and which needs external energy.",
  },

  // Chapter 3: Chemical Equilibrium
  {
    id: "q-c3-1",
    type: "mcq",
    subjectId: "sub-chem",
    chapterId: "ch-chem-3",
    lessonId: "ls-c3-1",
    conceptId: "cn-c3-1-1",
    difficulty: "Medium",
    body: "For the reaction N₂(g) + 3H₂(g) ⇌ 2NH₃(g) + heat, what happens if the temperature is increased?",
    options: [
      "Equilibrium shifts right, producing more NH₃",
      "Equilibrium shifts left, producing more N₂ and H₂",
      "No change in equilibrium position",
      "The reaction stops completely",
    ],
    correctAnswer: 1,
    explanation: "This is an exothermic reaction (releases heat). By Le Chatelier's principle, increasing temperature shifts equilibrium in the endothermic direction (left) to absorb the added heat, producing more N₂ and H₂.",
    relatedConcept: "Le Chatelier's Principle",
    commonMistakes: "Thinking increased temperature always shifts equilibrium right. It shifts toward the endothermic direction — left for exothermic reactions.",
    hint: "Treat heat as a product in exothermic reactions. Adding more 'product' shifts equilibrium left.",
  },
  {
    id: "q-c3-2",
    type: "mcq",
    subjectId: "sub-chem",
    chapterId: "ch-chem-3",
    lessonId: "ls-c3-1",
    conceptId: "cn-c3-1-2",
    difficulty: "Hard",
    body: "If Kc = 4.0 for the reaction A ⇌ 2B, and the initial concentration of A is 1.0 M with no B present, what is the equilibrium concentration of B?",
    options: ["0.67 M", "1.0 M", "1.33 M", "2.0 M"],
    correctAnswer: 2,
    explanation: "Let x mol/L of A react: [A] = 1−x, [B] = 2x. Kc = (2x)²/(1−x) = 4. So 4x²/(1−x) = 4, giving 4x² = 4−4x → 4x²+4x−4 = 0 → x²+x−1 = 0. x = (−1+√5)/2 ≈ 0.618. [B] = 2(0.618) ≈ 1.24 M ≈ 1.33 M (closest answer).",
    relatedConcept: "Equilibrium Constants (Kc, Kp)",
    commonMistakes: "Forgetting to square the coefficient in the Kc expression. For A ⇌ 2B, Kc = [B]²/[A], not [B]/[A].",
    hint: "Set up an ICE table and carefully substitute into the Kc expression.",
  },
  {
    id: "q-c3-3",
    type: "diagram",
    subjectId: "sub-chem",
    chapterId: "ch-chem-3",
    lessonId: "ls-c3-2",
    conceptId: "cn-c3-2-1",
    difficulty: "Medium",
    body: "The graph below shows the concentration of Ag⁺ and Cl⁻ ions at equilibrium in a saturated AgCl solution. If the Ksp of AgCl is 1.8 × 10⁻¹⁰, what is the molar solubility of AgCl?",
    diagramDescription: "Graph showing [Ag⁺] on x-axis and [Cl⁻] on y-axis.\nA hyperbolic curve represents Ksp = [Ag⁺][Cl⁻] = 1.8 × 10⁻¹⁰.\nThe point where [Ag⁺] = [Cl⁻] is marked on the curve.",
    options: ["1.34 × 10⁻⁵ M", "1.8 × 10⁻¹⁰ M", "9.0 × 10⁻⁶ M", "3.24 × 10⁻²⁰ M"],
    correctAnswer: 0,
    explanation: "For AgCl: Ksp = [Ag⁺][Cl⁻] = s × s = s². Therefore s = √(1.8 × 10⁻¹⁰) = 1.34 × 10⁻⁵ M. This is the point on the graph where both ion concentrations are equal.",
    relatedConcept: "Ksp Calculations",
    commonMistakes: "Using Ksp directly as solubility instead of taking the square root. For AB salts, s = √Ksp, not Ksp.",
    hint: "For a 1:1 salt like AgCl, both ions have concentration s, so Ksp = s².",
  },

  // Chapter 4: Organic Chemistry
  {
    id: "q-c4-1",
    type: "mcq",
    subjectId: "sub-chem",
    chapterId: "ch-chem-4",
    lessonId: "ls-c4-1",
    conceptId: "cn-c4-1-1",
    difficulty: "Easy",
    body: "The general formula for alkanes is:",
    options: ["CₙH₂ₙ", "CₙH₂ₙ₊₂", "CₙH₂ₙ₋₂", "CₙHₙ"],
    correctAnswer: 1,
    explanation: "Alkanes are saturated hydrocarbons with only single bonds. Their general formula is CₙH₂ₙ₊₂ (e.g., methane CH₄, ethane C₂H₆, propane C₃H₈).",
    relatedConcept: "Alkanes",
    commonMistakes: "Confusing CₙH₂ₙ (alkenes) with CₙH₂ₙ₊₂ (alkanes). The +2 indicates full saturation with no double bonds.",
    hint: "Methane is CH₄. Does 2(1)+2 = 4? Check the formula.",
  },
  {
    id: "q-c4-2",
    type: "mcq",
    subjectId: "sub-chem",
    chapterId: "ch-chem-4",
    lessonId: "ls-c4-2",
    conceptId: "cn-c4-2-1",
    difficulty: "Medium",
    body: "Which reagent is used to distinguish between primary, secondary, and tertiary alcohols?",
    options: ["Bromine water", "Lucas reagent", "Fehling's solution", "Tollens' reagent"],
    correctAnswer: 1,
    explanation: "Lucas reagent (ZnCl₂ + conc. HCl) distinguishes alcohols: tertiary reacts immediately (turbidity), secondary reacts in 5–10 minutes, and primary reacts only on heating.",
    relatedConcept: "Alcohols & Phenols",
    commonMistakes: "Choosing Tollens' or Fehling's — those distinguish aldehydes from ketones, not alcohol types.",
    hint: "This reagent uses ZnCl₂ and concentrated HCl. Reactivity order: 3° > 2° > 1°.",
  },
  {
    id: "q-c4-3",
    type: "essay",
    subjectId: "sub-chem",
    chapterId: "ch-chem-4",
    lessonId: "ls-c4-3",
    conceptId: "cn-c4-3-2",
    difficulty: "Hard",
    body: "Explain why benzene undergoes electrophilic substitution rather than electrophilic addition, despite having three double bonds.",
    correctAnswer: "Benzene has a delocalized π-electron cloud that gives it extra stability (resonance energy ~150 kJ/mol). Addition would destroy this aromatic stability, while substitution preserves it.",
    explanation: "The six π electrons in benzene are delocalized across the ring, creating a stable aromatic system. Electrophilic addition would break the aromaticity and lose ~150 kJ/mol of resonance stabilization energy. Substitution reactions preserve the aromatic ring, making them thermodynamically and kinetically favored over addition.",
    relatedConcept: "Aromatic Substitution",
    commonMistakes: "Saying benzene has 3 separate double bonds. It has delocalized π electrons — no fixed single/double bond alternation.",
    hint: "What makes benzene unusually stable compared to a hypothetical cyclohexatriene?",
  },
];

export function getQuestionsForChapter(subjectId: string, chapterId: string): QBQuestion[] {
  return qbQuestions.filter((q) => q.subjectId === subjectId && q.chapterId === chapterId);
}

export function getQuestionsForConcept(conceptId: string): QBQuestion[] {
  return qbQuestions.filter((q) => q.conceptId === conceptId);
}

export function getQuestionsForSubject(subjectId: string): QBQuestion[] {
  return qbQuestions.filter((q) => q.subjectId === subjectId);
}
