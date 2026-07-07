# SESSION MODULE — DECISIONS FOR APPROVAL

**Source:** Extracted from the six `HUMAN DECISION REQUIRED` items in `SESSION_MODULE_SPEC_DRAFT.md`.
**Status:** Awaiting Dr. Ahmed's decision on each item below. Nothing here has been implemented.
**Scope:** No code was written. No migrations were created. No implementation file was modified.

---

## Decision 1 — Session's Parent: Course Only, or Course + Chapter?

**Source:** `SESSION_MODULE_SPEC_DRAFT.md` §5, §2 ("Chapter" row)

### 1. Decision Title
Does a Session belong directly to a **Course** only, or does it remain a required child of a **Chapter**?

### 2. Why This Decision Matters
The domain-alignment document defines Sessions as belonging to a Course, with Lessons (which live inside Chapters) merely *referenced*, not owned. The current code and UI do the opposite: `chapter_id` is the mandatory FK on `lessons`, and the teacher UI filters/creates sessions per chapter. Every future join (session↔lesson, session↔concept), every session list query, and the sessions page's chapter-filter dropdown all depend on which parent is authoritative. Picking wrong means re-keying every session row and rewriting the sessions list page later.

### 3. Available Options
- **A. Course-only parent** — sessions attach to `course_id`; chapter becomes purely a reference (`chapterIds[]`/lesson references), not a parent.
- **B. Chapter-required parent** — keep today's model: sessions live under a chapter, as `lessons` does now.
- **C. Course-parent with optional chapter tag** — `course_id` required, `chapter_id` nullable, used only for filtering/display.

### 4. Neutral Technical Impact
- **A.** Matches the documented domain model exactly; removes the chapter-filter dependency from session creation; requires the sessions list page to change its query from "sessions of a chapter" to "sessions of a course," and requires deciding separately how a session's covered lessons/chapters get shown (via the lesson-reference join, not a parent FK).
- **B.** Zero migration effort — it's what exists today. Continues the conflation the domain-alignment document flags as architecturally wrong; every future session↔lesson many-to-many join becomes redundant with the parent FK (a session's chapter is already implied by its one designated lesson, contradicting the "many lessons per session" reference model).
- **C.** Splits the difference: unblocks course-level session listing immediately while preserving the existing chapter filter UI with minimal rework. Leaves the "what is the real parent" ambiguity formally unresolved, which could resurface when the lesson-reference join is eventually built.

### 5. Recommended Default for a 15-Day Launch
**Option C (course-parent, optional chapter tag).** It requires the least rework of the existing, working sessions list/filter UI, while not permanently cementing the chapter as an FK-level parent — keeping the door open for the documented course-only model post-launch.

### 6. What Will Break If We Choose Wrong
- Choosing B and later needing A: every session row needs a backfilled `course_id`, the sessions list query and chapter-filter dropdown need rework, and any session that referenced a chapter implicitly (via its lesson) needs to be re-derived through a new join table.
- Choosing A too early without the lesson-reference join built: the sessions list loses the ability to filter/group by chapter, which today's teachers actively use, with no replacement ready in the 15-day window.

---

## Decision 2 — Keep Session=Lesson Mapping, or Build a Separate `sessions` Table?

**Source:** `SESSION_MODULE_SPEC_DRAFT.md` §5, §8

### 1. Decision Title
Should `Session` remain permanently mapped 1:1 onto the backend `lessons` table (a naming/branding choice), or should a genuinely separate `sessions` table be built?

### 2. Why This Decision Matters
This is the single largest fork in the whole spec. Two existing project documents directly contradict each other: the domain-alignment document calls the current mapping an architectural error that conflates two independent structures (academic vs. delivery); a separate integration-audit document recommends keeping it permanently and only translating names in the API layer. Every other open decision (parent, block model, references) inherits from whichever way this one goes.

### 3. Available Options
- **A. Build a real `sessions` table**, separate from `lessons`, with its own reference joins to lessons/concepts.
- **B. Keep the permanent Session=Lesson mapping** — "lessons" stays the backend name forever; "Session" is a frontend-only brand name mapped in the API client layer.
- **C. Ship on the existing mapping for launch, explicitly flagged as temporary**, with a committed follow-up milestone to split it out.

### 4. Neutral Technical Impact
- **A.** Correct per the documented domain model; unlocks true many-to-many session↔lesson/concept references and session-specific fields (price, duration, status) without polluting the academic `lessons` table. Highest effort: new table, new migration, new router/service/schema module, frontend API-layer rewrite (store logic can stay, only endpoints change per the domain-alignment document's own assessment).
- **B.** Zero additional backend work. Simplicity is permanent, not just for launch. Permanently blocks the academic/delivery separation the platform's own architecture document treats as foundational (Concept Engine, multi-format delivery of the same lesson) — every future feature that assumes "one session ≠ one lesson" (e.g., a revision session covering three lessons) becomes structurally impossible without eventually doing option A anyway.
- **C.** Fastest path to a working launch; defers the large migration to a point where real usage data can inform the join design. Risk: "temporary" mappings that ship tend to calcify once real teacher/student data exists in the `lessons` table under the Session identity — the later migration becomes a data migration, not just a schema one.

### 5. Recommended Default for a 15-Day Launch
**Option C (ship on the existing mapping, explicitly temporary).** A from-scratch `sessions` table plus reference joins is not achievable credibly in 15 days alongside the other undecided items (block model, concept engine). Shipping on the current mapping is the only option that doesn't block launch, provided it's recorded as a deliberate, temporary decision — not silently adopted as option B by default.

### 6. What Will Break If We Choose Wrong
- Silently defaulting to B (never revisiting) forecloses the "one session, many lessons" and "one lesson, many sessions" use cases already documented as core to the product (Revision, Crash Course, Final Revision session types spanning multiple lessons) — those session types would have no way to reference more than one lesson.
- Choosing A under launch time pressure risks an unreviewed migration touching the table that already holds real teacher-created content (per Milestone 3, test data exists in `lessons` today) — a rushed split risks data loss or broken FKs in the one table currently wired end-to-end.

---

## Decision 3 — Which Block-Type Vocabulary Is Canonical?

**Source:** `SESSION_MODULE_SPEC_DRAFT.md` §7

### 1. Decision Title
Which of the three conflicting block-type lists is canonical, and how does it reconcile with the backend's existing 5-value enum?

### 2. Why This Decision Matters
Three sources disagree: `CLASSZ_SESSION_CORE_BLOCKS_ARCHITECTURE.md` (12 new types: video_playlist, resources, assessment, text, completion_rules, rewards, notes, qa, discussion, ai_assistant, live_meeting, external_link), `CLASSZ_SESSION_WORKSPACE_ARCHITECTURE.md` (a differently-named list of 12 "Canvas Blocks": Video, PDF, Notes, Image, Question Block, Quiz Block, Homework Block, Exam Block, Assignment Block, Meeting Link, Mind Map, Summary), and the backend's actual `block_type_enum` (5 values: TEXT, PDF, IMAGE, VIDEO, ATTACHMENT — with VIDEO itself blocked by a validator). Meanwhile, the live builder UI today doesn't persist any of these as distinct block rows at all — "Add Block" actually just creates a `TeacherMaterial`. Whatever is decided determines the shape of every future `PATCH`/`DELETE` block endpoint and every block-rendering component.

### 3. Available Options
- **A. Adopt the newer 12-type reference model** (`video_playlist`, `resources`, `assessment`, etc.) as canonical, and migrate the backend enum and legacy UI to match.
- **B. Adopt the backend's existing 5-value enum as canonical for launch**, treating quiz/assessment/completion/rewards/etc. as out-of-scope block types for now, added later.
- **C. Formalize what's actually running today** — blocks are `TeacherMaterial` rows plus separate quiz/exam/homework links, not a distinct block entity at all — and defer the "block model" concept entirely.

### 4. Neutral Technical Impact
- **A.** Matches the most recently written architecture document and best reflects where the product is headed (assessment blocks, completion rules, rewards, AI assistant as first-class blocks). Requires a Postgres enum migration, new per-type data schemas, new validators, and a full rewrite of the builder route (which today doesn't use this model at all) — the largest scope of the three options.
- **B.** Minimal backend change (the enum already exists; per `CONTENT_STUDIO_VERIFICATION.md`, unblocking VIDEO is a one-validator change, and adding RICH_TEXT/QUIZ/ASSIGNMENT/DIVIDER/CALLOUT is enum-only, no new tables). Cheapest and lowest-risk path but leaves the two richer, documented block models (workspace and core-blocks docs) formally un-adopted — future work will still need to reconcile them eventually.
- **C.** No new schema work needed — describes exactly what's running. Risk: it means "session blocks" remain, indefinitely, an aggregation of unrelated store types (materials + quiz + exam + homework) rather than an ordered, reorderable list of typed blocks — reordering/mixing block types freely (a core feature of "session as curated package") stays awkward.

### 5. Recommended Default for a 15-Day Launch
**Option B (extend the existing 5-value enum, minimally)** — per `CONTENT_STUDIO_VERIFICATION.md`, unblocking VIDEO and adding a small number of enum values is already scoped as low-effort, no-migration-risk work. It gets teachers a materially richer block set without touching the builder's actual data model in the 15-day window.

### 6. What Will Break If We Choose Wrong
- Building toward option A under time pressure without reconciling the two conflicting 12-type documents first risks shipping a third, slightly different vocabulary — compounding the existing confusion rather than resolving it.
- Silently choosing C by default (i.e., never deciding) means the "Add Block" UI keeps quietly mislabeling material creations as block types the backend enum doesn't even support (e.g., choosing "Quiz Block" from the palette currently coerces into a material type) — a launch-blocking source of teacher confusion if not explicitly scoped down to the block types that actually work.

---

## Decision 4 — Build the Concept Engine Now, or Defer It?

**Source:** `SESSION_MODULE_SPEC_DRAFT.md` §9

### 1. Decision Title
Should the Concept Engine (`concepts` table, `atomic_concepts` table, concept graph) be built now, alongside the Session module, or deferred, shipping sessions without real concept linking?

### 2. Why This Decision Matters
The architecture document calls the Concept Engine CLASSZ's core differentiator — the mechanism for weakness/strength detection and personalized revision. But it currently has zero backend implementation (the `concepts` module directory has no source files) and every frontend `conceptIds`/`atomicConceptIds` field across Session, Assessment, Quiz, Exam, and Material is a verified-always-empty placeholder. Deciding now avoids building a session schema today that has to be reshaped again the moment concept linking is added.

### 3. Available Options
- **A. Build the Concept Engine now**, before or alongside the Session module, so sessions are concept-aware from day one.
- **B. Defer it entirely** — ship Session blocks without concept linking; add the concept graph in a later phase.
- **C. Keep it in-memory/placeholder only** (current state) — no backend module, ever, until a dedicated phase is scoped.

### 4. Neutral Technical Impact
- **A.** Enables concept-level analytics, weakness detection, and Student Memory to work from day one for anything built during this window. Significant scope: two new tables, a concept graph (prerequisite/related/enables edges), a `lesson_concepts` join, and reference joins from Session — none of which exist in any form today, per both the backend module audit and the domain-alignment document.
- **B.** Session and block schema can be finalized without needing to also design the concept graph; `conceptIds`/`atomicConceptIds` fields stay as declared-but-unused placeholders (as they are today) until a dedicated phase. Risk: the fields the frontend already declares (`TeacherSession.conceptIds`, etc.) become long-lived dead code that must be revisited and possibly reshaped later.
- **C.** Identical to B in effect for this launch window, but framed as an indefinite deferral rather than a scoped follow-up — carries the highest risk of the "concept-based learning" principle (a stated core platform principle) never actually getting built.

### 5. Recommended Default for a 15-Day Launch
**Option B (defer, but as a scoped follow-up, not an indefinite one).** Building a full concept graph in 15 days alongside the Session module itself is not realistic, and the frontend placeholders already tolerate concept fields being empty without breaking anything currently working. This should be explicitly scheduled as the next module after Sessions ship, not silently dropped.

### 6. What Will Break If We Choose Wrong
- Choosing A and running out of time mid-build risks shipping neither a working Concept Engine nor a working Session module by the 15-day deadline — the two are being asked to land simultaneously with no existing foundation for either.
- Choosing C (indefinite deferral) risks the platform's own stated "concept-based learning" principle never getting revisited, since every subsequent milestone will have its own competing priorities — this is the option most likely to result in permanent scope loss if not explicitly re-scheduled.

---

## Decision 5 — Which Assessment Model Is Canonical?

**Source:** `SESSION_MODULE_SPEC_DRAFT.md` §6, §7 (referencing `CLASSZ_DOCUMENTS_VS_CODE_AUDIT.md` "Decision C" — flagged as unresolved, not fully explored in the spec draft)

### 1. Decision Title
Is the canonical assessment model the existing separate `quizzes`/`assignments` backend tables and matching legacy frontend stores, or the newer unified `TeacherAssessment` store?

### 2. Why This Decision Matters
Three different models for "assessment" currently coexist: the backend's separate `quizzes` and `assignments` tables (each with their own attempt/submission tracking), the frontend's older separate `teacher-quiz-store`/`teacher-exam-store`/`teacher-homework-store`/`teacher-assignment-store`, and a newer unified `teacher-assessment-store` with 14 assessment types and its own `sessionIds[]` reference field. A Session's "Assessment Block" (`assessmentId`) only makes sense once it's clear which of these `assessmentId` actually points to. Backend quiz/assignment tables today have no `session_id` field at all, only `lesson_id`.

### 3. Available Options
- **A. Adopt the unified `TeacherAssessment` model as canonical**, migrating backend `quizzes`/`assignments` toward a single assessment table (or a shared reference layer) with a real `session_id`.
- **B. Keep `quizzes`/`assignments` as the canonical backend model**, treating `TeacherAssessment` as a frontend-only display/aggregation layer with adapter functions (which already exist: `quizToAssessment`, `examToAssessment`, etc.) converting to and from it.
- **C. Defer the decision** — sessions reference quizzes/assignments directly via their existing `lesson_id`-style FK pattern for launch, without resolving the unification question at all.

### 4. Neutral Technical Impact
- **A.** Cleanest long-term model — one assessment concept, one settings/rewards shape, real `sessionIds` support already designed in the frontend type. Requires a backend migration merging or bridging `quizzes` and `assignments` (and their attempt/submission tables), which is a substantial schema change with existing production-shaped data (quiz_attempts, assignment_submissions) to preserve.
- **B.** No backend migration needed; the frontend adapter functions (`quizToAssessment`/`assessmentToQuizLike` etc.) already exist and work today, purely in-memory. Leaves three parallel representations of "assessment" alive simultaneously, which is already flagged as a source of confusion in the project's own audit document.
- **C.** No decision cost now; sessions can reference quizzes/assignments today via the same `lesson_id`-style pattern already used elsewhere (nullable FK), with no new `session_id` column needed to demonstrate a working link during launch. Postpones resolving the three-model duplication indefinitely.

### 5. Recommended Default for a 15-Day Launch
**Option C (defer, reference quizzes/assignments as-is).** This decision is large enough (attempt/submission table migration) that it shouldn't be bundled into a Session-module launch window; the existing adapter functions already let the UI show a unified view without forcing a backend change.

### 6. What Will Break If We Choose Wrong
- Attempting A within the launch window risks destabilizing `quiz_attempts`/`assignment_submissions`, which are the only two assessment-tracking tables currently confirmed working end-to-end — any migration error here breaks real quiz-taking, not just the Session module.
- Deferring indefinitely without ever revisiting (silently treating C as permanent) leaves the `TeacherAssessment.sessionIds[]` field permanently disconnected from any real backend reference, meaning "attach an assessment to a session" remains cosmetic indefinitely.

---

## Decision 6 — Reconcile the Two Conflicting `SessionStatus` Types

**Source:** `SESSION_MODULE_SPEC_DRAFT.md` §11

### 1. Decision Title
Which `SessionStatus` definition is correct — `"draft" | "published" | "archived"` (in `teacher-session-store.ts`) or `"draft" | "published" | "archived" | "locked"` (in `session-workspace-types.ts`) — before either is used to design a backend column?

### 2. Why This Decision Matters
This is a self-inflicted inconsistency within the frontend codebase alone (not a docs-vs-code conflict) — two type definitions with the same name disagree on their own value set. Neither is currently persisted to any backend column (the `lessons` table has no status field at all today), so this is the cheapest of the six decisions to fix, but it must be resolved before any `status` column is added to a real table, or the same ambiguity gets baked into the database permanently.

### 3. Available Options
- **A. Adopt the 4-value set** (`draft/published/archived/locked`) as canonical, treating "locked" as a distinct state from "archived" (e.g., access-restricted but still visible).
- **B. Adopt the 3-value set** (`draft/published/archived`) as canonical, treating "locked" as an orthogonal concern already covered by the separate `accessStatus` field (`locked/unlocked/scheduled`) that exists on `TeacherSession`.
- **C. Merge the two files' type definitions into one shared type**, used by both stores, without changing the value set itself yet — purely a code-hygiene fix, deferring the value-set question.

### 4. Neutral Technical Impact
- **A.** Slightly richer state model; requires updating the currently-used `teacher-session-store.ts` type and every place it's checked (`getPublishedSessions`, the sessions list filter). Introduces a state ("locked" status) that overlaps in meaning with the existing, separate `accessStatus` field, unless clearly differentiated.
- **B.** No functional change to the currently-wired store; only requires updating `session-workspace-types.ts` (which is not connected to any live route today, per the frontend audit) to match. Lowest-risk option since it doesn't touch the code path actually in use.
- **C.** Removes the duplication itself (one shared type instead of two independent declarations) without forcing a decision on whether "locked" belongs in status or access — cleanest engineering hygiene, defers the semantic question.

### 5. Recommended Default for a 15-Day Launch
**Option B (3-value set, treat "locked" as an access concern).** `teacher-session-store.ts` is the type actually wired to the working create/publish/archive flow; `session-workspace-types.ts` is documented as not connected to any live route. Aligning the unused file to the used one is strictly additive cleanup with no behavior change and no risk to what's currently working.

### 6. What Will Break If We Choose Wrong
- If a backend `status` column is designed against whichever type happens to be read first (without this decision being made explicitly), and the other file is wired up later (e.g., when `session-workspace-types.ts` is eventually connected to a real route), the database enum will need an `ALTER TYPE` migration to add the missing value — avoidable if resolved now while the cost is zero.
- Leaving both types alive un-reconciled risks a future contributor picking the "locked" 4-value version for a new feature (since it's the more recently written, more detailed file) while the shipped backend column only supports 3 values — a mismatch that would only surface as a runtime validation error after code is already written against it.
