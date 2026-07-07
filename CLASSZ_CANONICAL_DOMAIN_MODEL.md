# CLASSZ CANONICAL DOMAIN MODEL

**Status:** FROZEN BLUEPRINT — this document is the constitution of the CLASSZ platform.
**Effective from:** the approval of the decisions embedded below.
**Scope:** Model definition only. No code was written. No migrations were created. No implementation file was modified. Nothing beyond the approved decisions has been redesigned.
**Precedence:** Where this document conflicts with any prior document (`CLASSZ_ARCHITECTURE.md`, `CLASSZ_DOMAIN_MODEL_ALIGNMENT.md`, `CLASSZ_SESSION_WORKSPACE_ARCHITECTURE.md`, `CLASSZ_SESSION_CORE_BLOCKS_ARCHITECTURE.md`, `CLASSZ_INTEGRATION_AUDIT.md`, or any other prior audit/spec), **this document wins.** Prior documents remain useful as historical record and implementation detail, but no longer define the domain.
**Unresolved items** are marked `HUMAN DECISION REQUIRED` throughout. Nothing marked this way should be assumed or built without Dr. Ahmed's sign-off.

---

## 1. Academic Domain

The Academic Domain represents **knowledge only** — it has no concept of delivery, teaching format, pricing, or scheduling.

```
Course
  ↓
Chapter
  ↓
Lesson
  ↓
Concept
  ↓
Atomic Concept
```

- **Course** — the top-level subject/curriculum container, owned by a teacher.
- **Chapter** — a named grouping of Lessons within a Course, ordered by position.
- **Lesson** — a curriculum unit within a Chapter. A Lesson is a piece of **knowledge structure**, not a teaching event.
- **Concept** — a distinct idea or skill that belongs to exactly one Lesson.
- **Atomic Concept** — the smallest indivisible unit of knowledge (one fact, one idea) that belongs to exactly one Concept.

The Academic Domain answers: **"What must be known?"** It never answers "how is it taught," "when is it available," or "what does it cost."

`HUMAN DECISION REQUIRED` — The hierarchy above is drawn as a strict single-parent tree (one Lesson per Concept). A prior analysis document proposed a many-to-many `lesson_concepts` join instead (one Concept shared across multiple Lessons, e.g. a concept like "Oxidation Number" appearing in two different lessons). The approved decision as given describes a strict tree. Confirm whether Concepts may ever be shared across more than one Lesson, or whether the tree is strictly single-parent as drawn.

`HUMAN DECISION REQUIRED` — Whether a **concept graph** (edges between Concepts: prerequisite / related / enables, needed for AI recommendations and the Knowledge Graph) is in scope for this frozen model, or a separate future extension. Not addressed in the approved decisions.

---

## 2. Delivery Domain

The Delivery Domain represents **how a teacher packages and teaches** academic knowledge. It is independent of the Academic Domain and connected to it only through references.

```
Course
  ↓
Session
  ↓
Content Blocks
```

- **Session** — a teaching event (a lecture, a revision class, a live session, a practice set, an exam sitting). A Session belongs directly to a **Course**. It is not a child of a Chapter and it is not a Lesson.
- A Session **may reference**:
  - one Lesson, or multiple Lessons
  - one Concept, or multiple Concepts
  - one Atomic Concept, or multiple Atomic Concepts
- A Session **never replaces** a Lesson. A Session is a delivery container; a Lesson remains the unit of knowledge structure regardless of how many Sessions reference it, or how many Lessons a single Session spans.

This is the resolution of the platform's central prior ambiguity: Session and Lesson are now two permanently distinct entities, connected by explicit reference joins (see §10), not a shared table.

The Delivery Domain answers: **"How, and in what package, is knowledge taught?"** It never answers "what concept is this" (that's Academic) or "how is this graded" (that's Assessment).

---

## 3. Assessment Domain

```
Question Bank
  ↓
Assessment
```

- **Question Bank** — a standalone bank of Questions, independent of both the Academic and Delivery Domains. Questions are not owned by a Course, Chapter, Lesson, or Session; they are tagged and categorized independently and pulled into Assessments by reference.
- **Assessment** — built from the Question Bank. One engine, one entity type, governing all assessment behavior.

**Assessment Types:** `QUIZ`, `HOMEWORK`, `ASSIGNMENT`, `EXAM`

All four types share the same underlying Assessment engine — same settings shape, same question-attachment mechanism, same scoring machinery. **Behavior differs by `AssessmentType`**, not by separate tables or separate code paths:

| Type | Typical behavior difference |
|---|---|
| `QUIZ` | Short, often auto-graded, low stakes, frequently repeatable |
| `HOMEWORK` | Submission-based, due date, may mix auto-graded and manually-reviewed questions |
| `ASSIGNMENT` | Project/research/presentation-style, usually manually graded, file upload |
| `EXAM` | Formal, timed, strict, usually single-attempt, highest stakes |

The Assessment Domain answers: **"How is understanding measured and graded?"** It never answers "what does this cover" (that's Academic, via Assessment→Concept references) or "where does the student encounter this" (that's Delivery, via a Session's Assessment-type Content Block).

---

## 4. Content Domain

**Blocks belong ONLY to Sessions.** A Lesson never owns Blocks. Content Blocks are the atomic units a teacher arranges inside a Session to build the actual teaching experience.

**Canonical Block Types:**

```
TEXT
RICH_TEXT
VIDEO
PDF
IMAGE
ATTACHMENT
QUIZ
ASSIGNMENT
CALLOUT
DIVIDER
```

This canonical list supersedes every previously proposed block vocabulary (the backend's old 5-value enum, the 12-type "Session Core Blocks" list, and the 12-type "Session Workspace Canvas Blocks" list). Those documents are now historical record only.

- `TEXT` / `RICH_TEXT` — inline authored content (plain vs. formatted).
- `VIDEO` / `PDF` / `IMAGE` / `ATTACHMENT` — media and file content, referencing the Materials library, not duplicating files.
- `QUIZ` / `ASSIGNMENT` — reference an Assessment (see §3) by id; the block does not carry questions itself.
- `CALLOUT` — a highlighted note/warning/tip, structurally like `TEXT` with a visual treatment.
- `DIVIDER` — a structural/visual separator between blocks, carries no content.

`HUMAN DECISION REQUIRED` — The Assessment Domain defines four `AssessmentType` values (`QUIZ`, `HOMEWORK`, `ASSIGNMENT`, `EXAM`), but the canonical Content Block list only names two assessment-referencing block types (`QUIZ`, `ASSIGNMENT`). Confirm the mapping: does a `QUIZ` block reference any Assessment regardless of type, with `AssessmentType` alone driving in-block behavior (i.e. one block type embeds all four)? Or does `ASSIGNMENT` block cover `HOMEWORK`/`ASSIGNMENT`-type assessments while `QUIZ` block covers `QUIZ`/`EXAM`-type assessments? This determines whether the Content Domain needs exactly two assessment-block types or four.

`HUMAN DECISION REQUIRED` — Several previously documented "session features" have no home in the canonical block list: completion rules, rewards/XP, student notes, Q&A, discussion, AI assistant, live meeting links, and external links. The most consistent placement under this freeze is as **Session-level configuration** (properties of the Session entity itself, not Content Blocks) rather than block types — but this has not been explicitly confirmed and should not be assumed without sign-off.

---

## 5. Student Domain

- The Student is the primary consumer of the Delivery Domain: they enroll in Courses and progress through Sessions.
- A Student's relationship to the platform, in canonical terms:
  - **Enrollment** — a Student's access grant to a Course (see §11 — not currently implemented in any migration).
  - **Session Progress** — a Student's completion/interaction state against a specific Session (start time, completion time, percent complete) — the delivery-level analog of the existing academic `lesson_progress` concept.
  - **Assessment Attempts** — a Student's attempt record against an Assessment (answers, score, timing), scoped by `AssessmentType` behavior.
  - **Student Memory** — a Student's tracked mastery/retention per Concept and Atomic Concept, accumulated over time (see §9).
- Student-facing gamification (XP, levels, streaks, badges) is a cross-cutting concern layered on top of Session/Assessment completion events, not a separate domain of its own for the purposes of this document.

`HUMAN DECISION REQUIRED` — Whether the existing academic-level `lesson_progress` concept is retained as a derived/rollup signal (computed from completed Sessions that reference a Lesson) or deprecated entirely in favor of Session Progress as the sole source of truth. Not addressed in the approved decisions.

---

## 6. Teacher Domain

- The Teacher is the owner and author across both the Academic and Delivery Domains: they create Courses, Chapters, Lessons, Concepts, and Atomic Concepts (Academic), and they build Sessions and Content Blocks (Delivery), and they build Assessments from the Question Bank.
- A Teacher owns their Courses; ownership cascades operationally (a Teacher manages everything beneath their own Course) but does **not** collapse the domain boundaries above — a Teacher's authorship of a Lesson does not make the Lesson a Session, and their authorship of a Session does not make it a Lesson.
- **Assistant Teacher** is a distinct role that supports a Teacher (student management, progress review, lesson-prep support) without owning Courses itself.
- Teacher-facing analytics (concept mastery breakdowns, session engagement, question performance) read from the Assessment, Delivery, and Student Memory domains but do not themselves constitute a separate data domain.

---

## 7. Parent Domain

- The Parent observes a Student's progress, performance, attendance, and achievements. The Parent does not author or own any Academic, Delivery, Assessment, or Content entity.
- The Parent Domain is fundamentally a **read/observation layer** over the Student Domain, scoped to one or more linked Students.

`HUMAN DECISION REQUIRED` — No parent-student linking table or model was found anywhere in the current codebase (the `parents` backend module exists as a directory but is not registered in the running application and has no confirmed schema). The mechanism by which a Parent account is linked to one or more Student accounts is undefined and must be specified.

---

## 8. AI Domain

- The AI Layer is a **support layer**, not a decision-maker: it assists Teachers and Students but does not own Academic, Delivery, or Assessment entities — it reads from them and, where it generates content (questions, summaries, recommendations), that content is attributed to and reviewable by a human (Teacher) before being treated as authoritative.
- Documented AI capabilities: Assistant Teacher (AI chat support for teachers), AI Chat (student-facing), Question Generator, Revision Planner, Weakness Analysis, and — as future vision — AI Homework Checker, AI Exam Generator, AI Video Summaries, AI Concept Maps, AI Personal Tutor.
- Structurally, AI-generated Questions become ordinary Question Bank entries (Assessment Domain) once accepted by a Teacher; AI-generated recommendations reference Concepts/Atomic Concepts (Academic Domain) and a Student's Student Memory state (§9); AI does not introduce a new kind of Course/Lesson/Session/Assessment entity.

`HUMAN DECISION REQUIRED` — No AI Domain schema currently exists (the `ai_content`, `ai_core`, `ai_teacher`, `assistant`, `assistants`, and `revision_plans` backend modules exist as directories but are not registered in the running application, per prior code audit). The concrete entities (e.g. "AI-generated draft question," "revision plan," "AI conversation log") and their relationship to the domains above are undefined and require dedicated design.

---

## 9. Student Memory Domain

- Student Memory is the platform's mechanism for tracking a Student's retention and mastery **per Concept and per Atomic Concept** over time, distinct from a one-time Assessment score.
- It is fed by: Assessment Attempts (Assessment Domain, via the Assessment's Concept/Atomic Concept references) and Session completion signals (Delivery Domain, via the Session's Concept/Atomic Concept references).
- It feeds: Weakness/Strength detection, Adaptive Quizzes, Personalized Revision, Teacher dashboards, Parent reports, and AI recommendations (AI Domain).
- Student Memory does not own Academic, Delivery, or Assessment entities — it is a derived, longitudinal layer that references Students and Concepts/Atomic Concepts.

`HUMAN DECISION REQUIRED` — No Student Memory schema currently exists in the running application. A prior implementation existed in project history and was fully removed; its structure is not treated as authoritative for this freeze. The concrete data model (what constitutes a "retention score," how it decays, what triggers recalculation) is undefined and requires dedicated design.

---

## 10. Relationships

### Academic Domain (internal)
```
Course       1 ──── N   Chapter
Chapter      1 ──── N   Lesson
Lesson       1 ──── N   Concept
Concept      1 ──── N   Atomic Concept
```

### Delivery Domain (internal)
```
Course       1 ──── N   Session
Session      1 ──── N   Content Block
```

### Delivery → Academic (references, not ownership)
```
Session      N ──── N   Lesson            (session_lesson_refs)
Session      N ──── N   Concept           (session_concept_refs)
Session      N ──── N   Atomic Concept    (session_atomic_concept_refs)
```

### Assessment Domain (internal)
```
Question Bank (Question)   N ──── N   Assessment       (assessment_questions)
Assessment                 1 ──── N   Assessment Attempt
```

### Assessment → Academic (references, for concept-level analytics)
```
Assessment   N ──── N   Concept
Assessment   N ──── N   Atomic Concept
```
(Via the Question level, or the Assessment level, or both — `HUMAN DECISION REQUIRED`: whether concept tagging happens on the Question, the Assessment, or is inherited from one to the other. Not addressed by the approved decisions.)

### Content Domain → Delivery / Assessment
```
Content Block   N ──── 1   Session
Content Block   N ──── 1   Assessment      (only for QUIZ / ASSIGNMENT block types; nullable otherwise)
Content Block   N ──── 1   Material        (only for VIDEO / PDF / IMAGE / ATTACHMENT block types; nullable otherwise)
```

### Student Domain
```
Student   N ──── N   Course             (enrollments)
Student   1 ──── N   Session Progress
Student   1 ──── N   Assessment Attempt
Student   1 ──── N   Student Memory record   (one per Concept/Atomic Concept tracked)
```

### Teacher Domain
```
Teacher   1 ──── N   Course
```

### Parent Domain
```
Parent   N ──── N   Student      (link table — see §7, HUMAN DECISION REQUIRED)
```

---

## 11. Database Entity List

Existing tables retained as-is (Academic Domain, confirmed stable in current code):

| Entity | Domain | Status |
|---|---|---|
| `courses` | Academic / Delivery (shared parent) | Exists |
| `chapters` | Academic | Exists |
| `lessons` | Academic | Exists — no longer conflated with Session |
| `questions`, `question_choices`, `question_categories`, `question_tags`, `question_tag_links`, `question_media` | Assessment | Exists, standalone |
| `results` | Assessment | Exists |
| `videos` | Content | Exists — re-parents from `lesson_blocks` to `content_blocks` |

New entities required by this frozen model (none created — model only):

| Entity | Domain | Purpose |
|---|---|---|
| `concepts` | Academic | One row per Concept, FK to `lesson_id` |
| `atomic_concepts` | Academic | One row per Atomic Concept, FK to `concept_id` |
| `concept_connections` | Academic | Graph edges between concepts — **scope unresolved, §1** |
| `sessions` | Delivery | One row per teaching event, FK to `course_id` |
| `content_blocks` | Content | One row per block, FK to `session_id`, `block_type` enum per §4 |
| `session_lesson_refs` | Delivery↔Academic | Join: Session ↔ Lesson |
| `session_concept_refs` | Delivery↔Academic | Join: Session ↔ Concept |
| `session_atomic_concept_refs` | Delivery↔Academic | Join: Session ↔ Atomic Concept |
| `assessments` | Assessment | Unified entity, replaces separate `quizzes`/`assignments` tables; `assessment_type` enum: `QUIZ`/`HOMEWORK`/`ASSIGNMENT`/`EXAM` |
| `assessment_questions` | Assessment | Join: Assessment ↔ Question, replaces `quiz_questions` |
| `assessment_attempts` | Assessment | Replaces `quiz_attempts` + `assignment_submissions`, behavior branches on `assessment_type` |
| `enrollments` | Student | Student ↔ Course access grant — currently absent from every migration |
| `session_progress` | Student | Student ↔ Session completion state |
| `student_memory` | Student Memory | Student ↔ Concept/Atomic Concept retention — **schema unresolved, §9** |
| `parent_student_links` | Parent | Parent ↔ Student — **existence/shape unresolved, §7** |

`HUMAN DECISION REQUIRED` — Migration path for existing data: `quizzes`, `assignments`, `quiz_attempts`, `assignment_submissions`, and `lesson_blocks` all currently hold (or are designed to hold) real data under the old model. This document defines the target shape only; the migration strategy from old tables to new (`assessments`/`assessment_attempts`/`content_blocks`) is not addressed here and requires separate sign-off before any implementation.

---

## 12. Cardinality

| Relationship | Cardinality |
|---|---|
| Course → Chapter | 1 : N |
| Chapter → Lesson | 1 : N |
| Lesson → Concept | 1 : N (see §1 decision flag on cross-lesson sharing) |
| Concept → Atomic Concept | 1 : N |
| Course → Session | 1 : N |
| Session → Content Block | 1 : N |
| Session ↔ Lesson | N : M |
| Session ↔ Concept | N : M |
| Session ↔ Atomic Concept | N : M |
| Question ↔ Assessment | N : M |
| Assessment → Assessment Attempt | 1 : N |
| Content Block → Assessment (QUIZ/ASSIGNMENT blocks only) | N : 1 (nullable) |
| Content Block → Material (VIDEO/PDF/IMAGE/ATTACHMENT blocks only) | N : 1 (nullable) |
| Student ↔ Course | N : M (enrollment) |
| Student → Session Progress | 1 : N |
| Student → Assessment Attempt | 1 : N |
| Student ↔ Concept/Atomic Concept (via Student Memory) | N : M |
| Teacher → Course | 1 : N |
| Parent ↔ Student | N : M |

---

## 13. Ownership Rules

- A **Course** owns its Chapters (Academic) and its Sessions (Delivery). It is the single shared root of both domains.
- A **Chapter** owns its Lessons. A Chapter owns nothing in the Delivery Domain.
- A **Lesson** owns its Concepts. **A Lesson never owns Blocks.**
- A **Concept** owns its Atomic Concepts.
- A **Session** owns its Content Blocks. **A Session never owns Academic Content** — it only references Lessons, Concepts, and Atomic Concepts; it does not own or duplicate them.
- A **Content Block** owns nothing beneath it; it either points to an Assessment, points to a Material, or carries inline content (`TEXT`/`RICH_TEXT`/`CALLOUT`) directly.
- An **Assessment** owns its Assessment Attempts. An Assessment does not own Questions — it references them from the standalone Question Bank.
- The **Question Bank** is owned by no other entity; Questions exist independently of Course/Chapter/Lesson/Session and are pulled into Assessments by reference only.
- A **Teacher** owns Courses. Ownership of a Course implies operational authority over everything beneath it in both domains, but does not collapse domain boundaries (owning a Lesson does not make a Teacher's Session equal to that Lesson).
- A **Student** owns nothing structural; a Student holds Enrollments, Session Progress records, Assessment Attempts, and Student Memory records, all of which reference — but do not own — Course/Session/Assessment/Concept entities.
- A **Parent** owns nothing; a Parent holds a reference link to one or more Students.

---

## 14. Lifecycle Rules

- **Course, Session, Assessment, Content Block** each carry a publish lifecycle: `draft → published → archived`. A `draft` entity is visible only to its owning Teacher. A `published` entity is visible to enrolled/authorized Students per its own access rules. An `archived` entity is hidden from Students but retained for historical/audit purposes.
- **Lesson, Chapter, Concept, Atomic Concept** (pure Academic Domain entities) do not carry an independent publish lifecycle of their own in this model — their visibility is a function of which `published` Sessions reference them, not a status field on themselves. `HUMAN DECISION REQUIRED`: confirm Academic entities have no status of their own, or whether Lessons/Concepts also need independent draft/published states (e.g., a Lesson authored but not yet ready to be referenced by any Session).
- **Enrollment** lifecycle: `pending → active → expired/cancelled`. An active Enrollment is required before a Student may record Session Progress or Assessment Attempts against that Course's Sessions.
- **Session Progress** lifecycle: `not_started → in_progress → completed`. Completion criteria are defined per Session (a Session-level configuration, not a Content Block — see §4 decision flag).
- **Assessment Attempt** lifecycle: `in_progress → submitted → graded`. The transition from `submitted` to `graded` is automatic for auto-gradable question types and manual (Teacher/Assistant action) for others — this branching is driven by `AssessmentType` and per-question grading mode, not by separate tables.
- **Student Memory** record lifecycle: continuously updated (not a discrete state machine) — each new Assessment Attempt or completed Session touching a given Concept/Atomic Concept triggers a recalculation. Exact recalculation and decay rules are `HUMAN DECISION REQUIRED` (§9).

---

## 15. Product Invariants

These statements are permanent and structural. Any future feature, migration, or UI change must not violate them without a new, explicit decision recorded in this document.

1. A Lesson never owns Blocks.
2. A Session never owns Academic Content — it only references Lessons, Concepts, and Atomic Concepts.
3. A Session never replaces a Lesson.
4. Concepts belong to Lessons.
5. Atomic Concepts belong to Concepts.
6. Blocks belong to Sessions — never to Lessons, Chapters, or Courses directly.
7. Assessments are built from the Question Bank — an Assessment never owns a Question outright; it references it.
8. The Question Bank is standalone — it has no required parent in either the Academic or Delivery Domain.
9. All Assessment Types (`QUIZ`, `HOMEWORK`, `ASSIGNMENT`, `EXAM`) share one engine — there is exactly one Assessment entity type; behavior varies by `assessment_type`, not by table.
10. A Course is the single shared root of both the Academic Domain (via Chapters) and the Delivery Domain (via Sessions) — a Chapter is never a parent of a Session.
11. A Student's progress is recorded against Sessions (Delivery), not directly against Lessons (Academic) — any Lesson-level completion signal is derived, never primary.
12. AI-generated content becomes ordinary domain content (a Question, a recommendation) only once accepted by a human Teacher — the AI Domain does not introduce a parallel, unreviewed content pathway.
13. Student Memory is derived, not authoritative on its own — it reflects Assessment Attempts and Session completions; it does not independently grant or revoke academic status.
14. A Parent has read access to a linked Student's data and owns no content of their own.

---

## Summary of Items Still Requiring Dr. Ahmed's Decision

1. Can a Concept belong to more than one Lesson, or is the tree strictly single-parent as drawn? (§1)
2. Is a concept graph (`concept_connections`) in scope for this model or deferred? (§1, §11)
3. Do `QUIZ`/`ASSIGNMENT` Content Blocks together cover all four Assessment Types, or does the Content Domain need four assessment-block types instead of two? (§4, §10)
4. Where do completion rules, rewards, notes, Q&A, discussion, AI assistant, and live-meeting features live — Session-level settings, or a block type not yet named? (§4)
5. Is academic-level `lesson_progress` retained as a derived rollup, or deprecated in favor of `session_progress` as sole source of truth? (§5)
6. What is the Parent–Student linking mechanism? No such table or model currently exists. (§7, §11)
7. What are the concrete AI Domain entities (e.g. AI-generated draft questions, revision plans, conversation logs) and how do they attach to the domains above? (§8)
8. What is the concrete Student Memory schema (retention score definition, decay, recalculation triggers)? (§9)
9. Is Concept/Atomic-Concept tagging done at the Question level, the Assessment level, or both, with inheritance? (§10)
10. What is the data migration path from the existing `quizzes`/`assignments`/`quiz_attempts`/`assignment_submissions`/`lesson_blocks` tables to the new unified `assessments`/`assessment_attempts`/`content_blocks` tables? (§11)
11. Do pure Academic Domain entities (Lesson, Chapter, Concept, Atomic Concept) carry their own independent publish lifecycle, or is visibility entirely derived from referencing Sessions? (§14)
