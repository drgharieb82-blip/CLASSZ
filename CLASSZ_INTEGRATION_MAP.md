# CLASSZ INTEGRATION MAP

**Status:** Evidence-based report. No code was modified. No modules were redesigned, rewritten, or replaced.
**Premise (confirmed in the prior session):** the domain model is correct. What follows documents, pair by pair, why the six existing modules below do not talk to each other today, using only what is verifiable in the current codebase.
**Scope caveat that applies to every pair in this document:** all six modules are Zustand stores living entirely in the browser (`localStorage` via `persist`, or plain in-memory state). None of them have a backend table or API today except where explicitly noted (Question Bank ↔ Assessment Engine has one real backend join, cited in §13). "Connect" in this document means **wire the existing frontend store functions to each other and to their UI** — it does not mean building backend persistence, which is a separate, already-documented initiative.

**Module roster (for reference):**

| Module | Primary files |
|---|---|
| Material Library | `src/lib/teacher/teacher-material-store.ts`; UI at `src/routes/teacher.materials.tsx` (legacy) and `MaterialsTab` inside `src/routes/teacher.content-studio.tsx:1228` |
| Video Segments | `VideoSegment` type, `teacher-material-store.ts:21-31`; UI only in `src/routes/teacher.materials.tsx:73-112` |
| Academic Links | `AcademicLink` type, `teacher-material-store.ts:11-19`; `QuestionAcademicLink` type, `teacher-question-store.ts` (Academic Link section); shared tree data source `src/lib/teacher/content-tree-store.ts` |
| Question Bank | `src/lib/teacher/teacher-question-store.ts`; UI at `src/routes/teacher.questions.*.tsx`; shared `AcademicLinksEditor` component at `src/components/question/QuestionWorkspaceShared.tsx:119` |
| Assessment Engine | Unified: `src/lib/teacher/teacher-assessment-store.ts`; legacy per-type: `teacher-quiz-store.ts`, `teacher-exam-store.ts`, `teacher-homework-store.ts`, `teacher-assignment-store.ts`; UI: `src/components/teacher/AssessmentEngineTab.tsx`, `src/routes/teacher.assessments.*.tsx` |
| Session Builder | `src/lib/teacher/teacher-session-store.ts`; UI at `src/routes/teacher.courses.$courseId.sessions.$sessionId.tsx` |

---

## Section A — Material Library pairs

### A1. Material Library ↔ Video Segments

1. **Existing connection:** Tight — `VideoSegment[]` is a direct field on the Material record itself (`TeacherMaterial.segments?`, `teacher-material-store.ts:48`). The legacy `/teacher/materials` page (`teacher.materials.tsx:73-112`) lets a teacher add/edit/reorder/remove segments (`startTime`, `endTime`, `title`, per-segment concept tags) against a specific Material, and saves them into `data.segments` on `createMaterial`/`updateMaterial` (line 112).
2. **Missing connection:** Content Studio's own Materials tab (`MaterialsTab`, `teacher.content-studio.tsx:1228`) has **no segment editor at all** — a repo-wide search for "segment" inside `teacher.content-studio.tsx` returns zero matches. A teacher using the modern Content Studio path cannot create or see Video Segments; only the older, separate `/teacher/materials` route exposes them.
3. **Exact files:** `teacher-material-store.ts:21-31,48`; `src/routes/teacher.materials.tsx:73-112,201-268`; absence confirmed in `src/routes/teacher.content-studio.tsx` (function `MaterialsTab`, line 1228 onward).
4. **Estimated effort: Low.** The `VideoSegment` type, the store field, and a full working segment-editor UI already exist in `teacher.materials.tsx`. The task is to port that existing editor block into `MaterialsTab` in Content Studio — no new type, no new store logic.

### A2. Material Library ↔ Academic Links

1. **Existing connection:** Content Studio's `MaterialsTab` already has a real, working Academic Links editor: `acLinks` state (`teacher.content-studio.tsx:1250`), `addAcLink`/`removeAcLink`/`updateAcLink` (lines 1257-1259), populated from real `content-tree-store` nodes (`treeChapters`/`getLessons`/`getConcepts`/`getAtomics`, lines 1250-1253), and saved onto the material via `data.academicLinks = acLinks.filter(...)` (line 1314).
2. **Missing connection:** The legacy `/teacher/materials` page's Video Segment editor (§A1) tags each segment with its **own**, separate `chapterIds/lessonIds/conceptIds/atomicConceptIds` arrays (`teacher-material-store.ts:26-29`) — and a search of `teacher.materials.tsx` confirms it does **not** import `content-tree-store` at all. So Video Segments' concept tags and Academic Links' concept tags are two different tagging systems on the same `TeacherMaterial` record, one grounded in real tree-node ids and one not provably grounded in anything shared.
3. **Exact files:** `teacher.content-studio.tsx:1228-1259,1314` (working link); `teacher.materials.tsx` (no `content-tree-store` import — confirmed by search); `teacher-material-store.ts:11-19` (`AcademicLink`) vs `:21-31` (`VideoSegment`) — two independent tag shapes on one entity.
4. **Estimated effort: Medium.** Requires reconciling two existing, overlapping tagging shapes (`AcademicLink` and `VideoSegment`'s own tag arrays) into one path, or explicitly deciding which one is authoritative — this is a decision + wiring task, not new design, since the target data source (`content-tree-store`) already exists and is already used successfully in the other half of Material Library.

### A3. Material Library ↔ Question Bank

1. **Existing connection:** None found. A repo-wide search shows no field on `TeacherQuestion` referencing a Material id, and no field on `TeacherMaterial` referencing a Question id.
2. **Missing connection:** A question cannot be linked to "the material/segment it was written about" — e.g. there is no way to say "this question tests the concept covered in minutes 5-12 of this video." Both modules independently tag the **same** concept-tree nodes (Material via `AcademicLink`, Question via `QuestionAcademicLink`/`academicLinks`, `teacher-question-store.ts` Academic Link section) but never reference each other directly.
3. **Exact files:** `teacher-material-store.ts` (no question reference field); `teacher-question-store.ts` (no material reference field, confirmed by inspection of the full `TeacherQuestion` interface).
4. **Estimated effort: Low.** Both entities already carry the same shape of concept-tag arrays pointing at the same `content-tree-store` node ids; a direct Material↔Question link (if wanted) is an additive field plus a picker, not new architecture.

### A4. Material Library ↔ Assessment Engine

1. **Existing connection:** None found. No field on `TeacherAssessment` (or any legacy `TeacherQuiz`/`TeacherExam`/`TeacherHomework`/`TeacherAssignment`) references a Material id.
2. **Missing connection:** An Assessment cannot reference "the video this quiz follows" directly — only indirectly, through the Session that both happen to be attached to (see §A5, §15).
3. **Exact files:** `teacher-assessment-store.ts` (`TeacherAssessment` fields — `questionIds`, `courseIds/chapterIds/lessonIds/conceptIds/atomicConceptIds/sessionIds`, no material field); `teacher-material-store.ts` (no assessment field).
4. **Estimated effort: Low.** No field exists on either side; this is a from-scratch (but small) additive link, not a fix to something broken.

### A5. Material Library ↔ Session Builder

1. **Existing connection:** This is the **strongest** pair in the entire map. `TeacherMaterial.sessionId` (singular "home" session, `teacher-material-store.ts:35`) plus `linkedSessionIds[]` (line 70) and `linkMaterialToSession(materialId, sessionId)` (confirmed store action). The live Session Builder route (`teacher.courses.$courseId.sessions.$sessionId.tsx`) filters materials by the open session's id and renders them as canvas blocks, and its "Add Block" action calls `createMaterial(...)` directly scoped to the open session.
2. **Missing connection:** Segments (§A1) are invisible to the builder — a repo-wide search for "segment" inside `teacher.courses.$courseId.sessions.$sessionId.tsx` returns **zero matches**. A teacher can place a whole Material into a Session, but cannot place a specific timed slice of it (the exact capability described in the prior turn's product vision).
3. **Exact files:** `teacher-material-store.ts:35,70`; `teacher.courses.$courseId.sessions.$sessionId.tsx` (material-filter and `createMaterial` calls, confirmed present; "segment" search confirmed absent).
4. **Estimated effort: Medium.** The Material↔Session wiring already works end-to-end; the gap is specifically letting a canvas block reference `(materialId, segmentId or fromTime/toTime)` instead of only `materialId`. This touches the block-rendering logic in one route file plus reading the already-existing `segments` array — no new store, no new entity.

---

## Section B — Video Segments pairs (remaining)

### B1. Video Segments ↔ Question Bank

1. **Existing connection:** None. No field anywhere links a Question to a specific segment or timestamp.
2. **Missing connection:** Cannot express "ask this question right after this 3-minute segment ends" — the exact placement-based interaction described as the product goal.
3. **Exact files:** `teacher-material-store.ts:21-31` (`VideoSegment`, no question reference field); `teacher-question-store.ts` (no segment reference field).
4. **Estimated effort: Medium.** Requires a new (small) reference field — `segmentId?` — on the Question side, or a `questionIds[]` array on `VideoSegment`; either is additive, not a redesign, but touches two files' types plus whatever UI is built for it.

### B2. Video Segments ↔ Assessment Engine

1. **Existing connection:** None.
2. **Missing connection:** Same gap as B1, one level up — cannot attach a Quiz/Homework/Exam to trigger at a specific segment boundary.
3. **Exact files:** `teacher-material-store.ts:21-31`; `teacher-assessment-store.ts` (no segment field), legacy `teacher-quiz-store.ts`/`teacher-exam-store.ts`/`teacher-homework-store.ts` (no segment field).
4. **Estimated effort: Medium.** Same shape of fix as B1.

### B3. Video Segments ↔ Session Builder

1. **Existing connection:** None — already established in §A5. Restated here because the question set lists it as its own pair: zero references to "segment" anywhere in the Session Builder route file.
2. **Missing connection:** This is the specific, named gap from the prior turn's product discussion — a Session cannot currently be composed of individual timed slices of a lecture; only whole Materials.
3. **Exact files:** `teacher-material-store.ts:21-31` (`VideoSegment` exists); `teacher.courses.$courseId.sessions.$sessionId.tsx` (confirmed zero "segment" matches).
4. **Estimated effort: Medium.** As in §A5 — reading an already-existing array and extending the canvas-block shape to carry an optional segment/time-range reference. No new module.

---

## Section C — Academic Links pairs (remaining)

### C1. Academic Links ↔ Question Bank

1. **Existing connection:** Real and working. `src/components/question/QuestionWorkspaceShared.tsx:119` defines a single shared `AcademicLinksEditor` component, used by `teacher.questions.create.tsx` and the question edit page, which reads live `content-tree-store` nodes (`treeNodes`/`treeChapters` props) to populate chapter/lesson/concept/atomic-concept pickers, and writes into `TeacherQuestion.academicLinks`/`chapterIds`/`lessonIds`/`conceptIds`/`atomicConceptIds`.
2. **Missing connection:** None found for this specific pair — this is the one pair in the whole map with a shared, reusable component grounded in the same tree data on both the read and write side.
3. **Exact files:** `src/components/question/QuestionWorkspaceShared.tsx:119`; `src/routes/teacher.questions.create.tsx` (consumes it); `src/lib/teacher/content-tree-store.ts` (shared data source); `teacher-question-store.ts` (`QuestionAcademicLink`, `chapterIds/lessonIds/conceptIds/atomicConceptIds`).
4. **Estimated effort: None required.** Already connected.

### C2. Academic Links ↔ Assessment Engine

1. **Existing connection:** Partial, read-side only. `AssessmentEngineTab.tsx:110-119` filters `content-tree-store` nodes by `type === "concept"`/`"atomic_concept"` **and** cross-references them against `assessment.conceptIds`/`atomicConceptIds` to build filter dropdowns — meaning `TeacherAssessment.conceptIds` values are expected to be real tree-node ids, and the display logic already assumes/relies on that.
2. **Missing connection:** No confirmed write-side UI showing a teacher picking concepts from the tree when **creating** an Assessment (unlike the confirmed Question Bank case in C1). The legacy converters (`quizToAssessment`, `examToAssessment`, etc., in `teacher-assessment-store.ts`) simply carry through whatever `conceptIds`/`atomicConceptIds` the legacy Quiz/Exam/Homework/Assignment record already had — and those legacy stores' own `conceptIds`/`atomicConceptIds` fields default to empty and are not populated by seed data (established in the prior session's research).
3. **Exact files:** `AssessmentEngineTab.tsx:69,110-119` (read-side, works); `teacher-assessment-store.ts` (`conceptIds`/`atomicConceptIds` fields, converter functions); legacy `teacher-quiz-store.ts`/`teacher-exam-store.ts` (own `conceptIds` fields, unpopulated).
4. **Estimated effort: Low.** The exact same `AcademicLinksEditor` component confirmed working for Question Bank (§C1) already accepts `treeNodes`/`treeChapters` as props — reusing it on the Assessment creation form (`teacher.assessments.create.tsx`, which already imports `useContentTreeStore` per its own import list) is a matter of rendering the existing shared component, not building a new one.

### C3. Academic Links ↔ Session Builder

1. **Existing connection:** Read-side only. The Session Builder route imports `useContentTreeStore` and filters `treeNodes` by `courseId` for its "Coverage" tab display.
2. **Missing connection:** The write-side link is absent. `content-tree-store.ts` has a `linkSession(nodeId, sessionId)` action (lines 120-125) whose entire purpose is to register "this tree node is covered by this session" — and a repo-wide search confirms it is **never called** anywhere in the codebase (routes, components, or seed data). So a Session's coverage of the Academic tree is displayed but never actually recorded.
3. **Exact files:** `content-tree-store.ts:47,120-125` (`linkSession`, defined, zero callers); `teacher.courses.$courseId.sessions.$sessionId.tsx` (reads `treeNodes` for its Coverage tab, per confirmed imports, but does not call `linkSession`).
4. **Estimated effort: Low.** The store action already exists and already updates `linkedSessionIds` correctly (confirmed logic at lines 120-125); the fix is adding one call to it wherever a teacher currently links a Material/Assessment to a Session in the builder UI.

---

## Section D — Question Bank pairs (remaining)

### D1. Question Bank ↔ Assessment Engine

1. **Existing connection:** The strongest cross-module connection with real backend depth, not just frontend. On the frontend: `TeacherAssessment.questionIds: string[]` plus `attachQuestion`/`detachQuestion`/`reorderQuestions` actions exist in `teacher-assessment-store.ts`. On the backend (the one exception to this document's "frontend-only" caveat): a real `quiz_questions` join table exists (`backend/app/modules/quizzes/models.py`, `QuizQuestion` class) linking `quiz_id → quizzes.id` and `question_id → questions.id`.
2. **Missing connection:** The backend join only covers the `Quiz` assessment type — `backend/app/modules/assignments/models.py`'s `AssignmentSubmission`/`SubmissionFile` classes have no reference to `questions` at all (confirmed in the prior session's backend research). So Question↔Assessment is backend-real for Quiz, and frontend-only (via the unified `TeacherAssessment.questionIds`) for Homework/Assignment/Exam.
3. **Exact files:** `teacher-assessment-store.ts` (`questionIds`, `attachQuestion`/`detachQuestion`); backend `backend/app/modules/quizzes/models.py` (`QuizQuestion`, real FK join); backend `backend/app/modules/assignments/models.py` (`AssignmentSubmission`, no question FK).
4. **Estimated effort: Low** at the frontend level (already wired). **Out of scope / separate initiative** at the backend level for Homework/Assignment/Exam — that gap is the Assessment-unification work already flagged as deferred in the prior session's Sprint 1 plan, not a simple connection task.

### D2. Question Bank ↔ Session Builder

1. **Existing connection:** Partial, read-only, and confirmed broken end-to-end. The Session Builder filters `teacher-question-store` questions by `q.sessionId === sessionId || q.sessionIds?.includes(sessionId)` (`teacher.courses.$courseId.sessions.$sessionId.tsx:69-70`) to build an aggregate "question_block." `TeacherQuestion` does carry both a legacy `sessionId: string` field and a modern `sessionIds: string[]` field for exactly this purpose.
2. **Missing connection:** There is no UI anywhere that ever sets a question's `sessionId`/`sessionIds`. A search of `teacher.questions.create.tsx` and the shared `QuestionWorkspaceShared.tsx` component for "sessionId" returns **zero matches** — a question is only ever created scoped to a Course, never to a Session. As a direct consequence, the Session Builder's question-filter query above will always evaluate to an empty list in practice, even though the filter logic itself is correctly written.
3. **Exact files:** `teacher.courses.$courseId.sessions.$sessionId.tsx:69-70` (filter, functionally correct but unreachable); `teacher-question-store.ts` (`sessionId`, `sessionIds` fields exist); `teacher.questions.create.tsx` + `QuestionWorkspaceShared.tsx` (confirmed: no `sessionId`-setting UI exists in either).
4. **Estimated effort: Low.** Both the data field and the read-side filter already exist and are correctly written; the only missing piece is a UI control (e.g. a session picker on question creation, or an "attach question to session" action in the builder) to actually write to the field that already exists for this exact purpose.

---

## Section E — Assessment Engine ↔ Session Builder

### E1. Assessment Engine ↔ Session Builder

1. **Existing connection:** Structurally the most complete pair after Material↔Session, but confirmed **non-functional in practice for the same reason as D2**. All four legacy stores (`teacher-quiz-store.ts:15,48-49,131-142,159`; `teacher-exam-store.ts:14,51-52,81-82,89`; `teacher-homework-store.ts:13,42-43,68-69,76`; `teacher-assignment-store.ts:13,41-42,66-67,74`) each carry a real `sessionIds: string[]` field, a matching `attachToSession`/`detachFromSession` pair of actions, and a `getPublished*ForSession(sessionId)` accessor. The Session Builder route (`teacher.courses.$courseId.sessions.$sessionId.tsx:74-79`) correctly imports all four stores and filters each collection by `sessionIds?.includes(sessionId)` to build quiz/exam/homework blocks.
2. **Missing connection:** A repo-wide search across `src/routes/` and `src/components/` for calls to `attachQuizToSession`, `attachToSession`, or `attachQuestion` returns **zero matches**. Exactly as in D2: the attach/detach functions exist, the read-side filters exist and are correctly written, but no button, picker, or form anywhere in the application ever calls them. The Session Builder's Quiz/Exam/Homework sections will therefore always render empty for any session, regardless of how many quizzes/exams/homework a teacher has created for the course.
3. **Exact files:** `teacher-quiz-store.ts:48-49,131-142`; `teacher-exam-store.ts:51-52,81-82`; `teacher-homework-store.ts:42-43,68-69`; `teacher-assignment-store.ts:41-42,66-67` (all attach/detach functions, zero callers); `teacher.courses.$courseId.sessions.$sessionId.tsx:74-79` (correct filters, `allQuizzes`/`allExams`/`allHomework` course-scoped lists already loaded at the same lines, ready to be offered as an attach picker).
4. **Estimated effort: Low.** This is the single highest-value, lowest-effort fix in the entire map: the store functions, the filtered read queries, and even the unfiltered course-wide lists needed to build a picker (`allQuizzes`, `allExams`, `allHomework`, already present at lines 75/77/79) all already exist in the same file. The only missing piece is a picker UI element in the builder that calls the already-existing `attachToSession`/`attachQuizToSession` functions.

---

## Summary — All 15 Pairs Ranked by Effort

| Pair | Connection status | Effort |
|---|---|---|
| Academic Links ↔ Question Bank | ✅ Fully connected | None |
| Material Library ↔ Session Builder | ✅ Connected (whole-material level) | — (extension only, see below) |
| Assessment Engine ↔ Session Builder | ⚠️ Wired but unreachable (no write UI) | **Low** |
| Question Bank ↔ Session Builder | ⚠️ Wired but unreachable (no write UI) | **Low** |
| Academic Links ↔ Session Builder | ⚠️ Read-only; write action exists, unused | **Low** |
| Academic Links ↔ Assessment Engine | ⚠️ Read-side works; write UI missing | **Low** |
| Question Bank ↔ Assessment Engine | ✅ Frontend wired / ⚠️ backend partial (Quiz only) | **Low** (frontend) |
| Material Library ↔ Video Segments | ⚠️ Works in legacy page only | **Low** |
| Material Library ↔ Question Bank | ❌ No connection | **Low** |
| Material Library ↔ Assessment Engine | ❌ No connection | **Low** |
| Material Library ↔ Academic Links | ⚠️ Two parallel, unreconciled tagging systems | **Medium** |
| Material Library ↔ Session Builder (segment-level) | ❌ No segment awareness in builder | **Medium** |
| Video Segments ↔ Session Builder | ❌ No connection | **Medium** |
| Video Segments ↔ Question Bank | ❌ No connection | **Medium** |
| Video Segments ↔ Assessment Engine | ❌ No connection | **Medium** |

**Pattern observed across the majority of "Low effort" pairs:** the recurring root cause is not missing architecture — it is missing **write-side UI** for attach/link functions that already exist and are already correctly read from. `attachQuizToSession`, `attachToSession` (exam/homework/assignment), `linkSession` (content-tree-store), and question `sessionId` assignment are each fully implemented as store functions with zero callers anywhere in the application. Connecting these six modules is, for most pairs, a UI task on top of existing logic — not new module design.
