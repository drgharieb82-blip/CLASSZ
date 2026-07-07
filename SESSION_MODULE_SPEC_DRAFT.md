# SESSION MODULE — SPECIFICATION DRAFT

**Status:** DRAFT — for Dr. Ahmed's review and approval only.
**Scope:** Read-only reconstruction. No code was written. No migrations were created. No tables were created.
**Method:** Every statement below is tagged with its evidence source:

- `[CODE]` — verified directly in the current repository source (file/line cited)
- `[DOCUMENT]` — found in an existing project markdown document (file cited)
- `[INFERRED]` — a reasonable synthesis of two or more sourced facts, not stated outright anywhere
- `[UNKNOWN]` — no evidence found in code or documents
- **`HUMAN DECISION REQUIRED`** — the codebase/documents contain a genuine open question, conflict, or product decision that only Dr. Ahmed can resolve. Nothing under this label should be assumed or built without his sign-off.

---

## 1. Purpose

**What is a Session, today, in the actual running system?**

A Session is **not a distinct backend entity**. It is a frontend-only branding concept that is currently 1:1 wired to the backend's `lessons` table. `[CODE: backend/app/modules/lessons/models.py; classz-frontend-prototype/src/lib/api/lessons.ts]` `[DOCUMENT: MILESTONE_03_REPORT.md — "Session is a frontend-only concept. No backend model was renamed. No new tables were created."]`

**What is a Session supposed to be, per the architecture documents?**

A Session is the **delivery/teaching event** — a curated packaging of content, practice, and assessment that a teacher builds and a student experiences in one sitting (a lecture, a revision session, a live class, a practice set, an exam). `[DOCUMENT: CLASSZ_SESSION_WORKSPACE_ARCHITECTURE.md — "Teachers don't sell videos — they sell learning experiences. A session is a curated package of content, practice, and assessment."]`

A Session is explicitly **not**:
- A chapter
- A single video
- A CRUD form

A Session **references** existing assets — materials (video/PDF/image), the Question Bank, and the Assessment Engine (quiz/exam/homework) — and **never duplicates** them. `[DOCUMENT: CLASSZ_SESSION_CORE_BLOCKS_ARCHITECTURE.md]`

**What business problem does it solve?**

It separates *what a student must learn* (the Academic structure: Course → Chapter → Lesson → Concept → Atomic Concept) from *how a teacher chooses to teach/deliver it* (the Delivery structure: Course → Session → Content Blocks). The same academic content can be delivered through different session formats — a full lesson, a revision, a crash course, a live class, an exam-only session — without re-authoring the underlying materials, questions, or concepts each time. `[DOCUMENT: CLASSZ_DOMAIN_MODEL_ALIGNMENT.md — "The two structures are independent but connected through references. A Session is a delivery container, not a curriculum unit."]`

`[INFERRED]` The reason this distinction was made mid-project rather than from the start is that Milestone 3 needed *a* working backend quickly, so "Session" was wired to the nearest existing table (`lessons`) as a pragmatic shortcut, with the real Session/Lesson split documented as future work.

---

## 2. Position in the Domain

The domain is described as **two independent structures connected by references**: `[DOCUMENT: CLASSZ_DOMAIN_MODEL_ALIGNMENT.md]`

```
Structure 1 — Academic (Knowledge)          Structure 2 — Delivery (Teaching)
Course                                      Course
└── Chapter                                 └── Session  (a teaching event)
    └── Lesson                                  └── Content Blocks
        └── Concept                                 (Video, PDF, Text, Image,
            └── Atomic Concept                       Attachment, Quiz, Assignment…)

                                            Session references Academic entities:
                                                ├── Lesson References
                                                ├── Concept References
                                                └── Atomic Concept References
```

Relationship to each entity:

| Entity | Relationship to Session (target model) | Relationship to Session (current code) |
|---|---|---|
| **Course** | Session belongs to a Course (parent) `[DOCUMENT: CLASSZ_DOMAIN_MODEL_ALIGNMENT.md]` | `TeacherSession.courseId` exists and is used as the parent `[CODE: teacher-session-store.ts:16]`. Backend `lessons` has no `course_id` — only `chapter_id` `[CODE: lessons/models.py]` |
| **Chapter** | Session does **not** belong to a chapter; it only *references* lessons that happen to live in chapters `[DOCUMENT: CLASSZ_DOMAIN_MODEL_ALIGNMENT.md]` | `TeacherSession.chapterId` (singular, required) is currently the actual parent used for filtering/creation, plus a separate `chapterIds[]` "flexible field" `[CODE: teacher-session-store.ts:17,33]`. Backend `lessons.chapter_id` is a mandatory FK `[CODE: lessons/models.py:16-21]`. **This is the core conflation the domain-alignment document identifies as wrong.** |
| **Lesson** | Session **references** lessons (many-to-many), does not equal a lesson `[DOCUMENT]` | Session **is currently implemented as** a Lesson row (1:1) `[CODE + DOCUMENT: MILESTONE_03_REPORT.md]`. A separate `lessonIds: string[]` field exists on `TeacherSession` for the "reference" model but is always empty and unused `[CODE: teacher-session-store.ts:34, 96]` |
| **Concept** | Session references concepts covered, many-to-many `[DOCUMENT]` | `TeacherSession.conceptIds: string[]` exists, always initialized empty, never populated by any store action or route `[CODE: teacher-session-store.ts:35,96]`. No `concepts` table exists in the backend at all `[CODE: backend/app/modules/concepts/ contains only __pycache__, no .py source]` |
| **Atomic Concept** | Session references atomic concepts, finest-grain reference, feeds Student Memory `[DOCUMENT]` | `TeacherSession.atomicConceptIds: string[]`, same status as Concept — declared, always empty `[CODE: teacher-session-store.ts:36,97]`. No backend table. |
| **Question Bank** | Sessions reference questions/practice sets, standalone entity `[DOCUMENT: CLASSZ_CONTENT_STUDIO_CORE_ARCHITECTURE.md]` | `TeacherSession.questionIds: string[]` field exists, empty by default `[CODE: teacher-session-store.ts:38]`. In the actual session builder route, a "question_block" is synthesized from `teacher-question-store` items filtered by `sessionId`, not from `questionIds` `[CODE: teacher.courses.$courseId.sessions.$sessionId.tsx]`. Backend `questions` table is fully standalone with no FK to lessons/sessions `[DOCUMENT: CLASSZ_DOMAIN_MODEL_ALIGNMENT.md]` |
| **Content Studio** | Content Studio is the umbrella authoring surface; "Sessions" is one of its tabs alongside Content Tree, Materials, Questions, Quizzes/Assessment Engine `[DOCUMENT: CLASSZ_CONTENT_STUDIO_CORE_ARCHITECTURE.md]` | Confirmed in code: `teacher.content-studio.tsx` renders a `SessionsBuilderTab` alongside Content Tree / Materials / Question Bank / Assessment Engine tabs, scoped to a selected course `[CODE: teacher.content-studio.tsx]` |
| **Lesson Player** | Student-facing playback surface for a Session's content, item by item `[INFERRED from naming and structure]` | The actual route is a **Session Player** (`student.courses.$courseId.session.tsx`) built from `LessonPlayerLayout`/`SessionSidebar`/`ContentPlayer` components — the "lesson" naming in component filenames is legacy, the data it plays is Session data `[CODE: CLASSZ_STUDENT_SESSION_COMPONENTS_AUDIT.md + student.courses.$courseId.session.tsx]` |
| **Publishing** | Sessions have a publish lifecycle (draft/published/archived) gating student visibility `[DOCUMENT: CLASSZ_SESSION_CORE_BLOCKS_ARCHITECTURE.md — SessionWorkspaceData.status]` | `TeacherSession.status` exists frontend-only; backend `lessons` has no status column at all; publish/archive actions never call an API `[CODE — see §11]` |
| **Student Progress** | Progress should be tracked per session (and per item within it) `[DOCUMENT: CLASSZ_DOMAIN_MODEL_ALIGNMENT.md — "missing: session_progress → (sessions, students)"]` | Only `lesson_progress` exists, keyed `(student_id, lesson_id)`, one row per pair — there is no session-level or per-block progress table `[CODE — see §13]` |
| **Student Memory** | Sessions (via concept/atomic-concept references) should feed per-concept retention tracking `[DOCUMENT: CLASSZ_ARCHITECTURE.md — Concept Engine]` | `student_memory` module currently has no source files (empty placeholder); a fuller implementation existed in a past commit and was later removed from the codebase `[CODE — see §15]` |

---

## 3. Teacher Workflow

Reconstructed strictly from the routes and store code that exist today, plus the documented target UX. `[CODE: teacher.content-studio.tsx, teacher.courses.$courseId.sessions.tsx, teacher.courses.$courseId.sessions.$sessionId.tsx]`

1. Teacher opens **Content Studio** (`/teacher/content-studio`) and picks a Course from the top course selector. `[CODE]`
2. Teacher switches to the **Sessions** tab (visually distinct from Content Tree/Materials/Questions/Assessment Engine tabs). `[CODE]`
3. Teacher optionally filters by Chapter, then clicks **Create Session**, filling in title, description, price, currency, free-preview flag, open/close dates, duration, and session type. `[CODE: teacher.courses.$courseId.sessions.tsx]`
4. On submit, the app calls `createSession()`, which sends `POST /api/lessons` with `chapter_id, title, description, is_free_preview, release_at, hide_at, is_locked` — everything else entered in step 3 (price, currency, duration, sessionType) is **kept only in local state and never sent to the backend**. `[CODE: teacher-session-store.ts:114-132; src/lib/api/lessons.ts:17-30]`
5. Teacher opens the session to enter the **Session Builder** (`/teacher/courses/$courseId/sessions/$sessionId`), which has five tabs: `[CODE: teacher.courses.$courseId.sessions.$sessionId.tsx]`
   - **Build** — add/reorder/delete content blocks (today this actually creates `TeacherMaterial` rows tagged with the session's id, not distinct block entities), edit session properties, access/pricing, release schedule, and hardcoded (non-functional) completion-rules/rewards checkboxes.
   - **Timeline** — read-only estimated-duration view.
   - **Coverage** — shows concept-tree coverage summary for the course (not specific to this session's own concept links, since those are unpopulated).
   - **Settings** — pricing/currency/access status/free-preview, plus target-students and prerequisites UI that have no store wiring behind them.
   - **Analytics** — fully static placeholder numbers, marked "Coming Soon".
6. Teacher clicks **Publish** or **Archive**, which flips `TeacherSession.status` **locally only** — no backend call exists for this. `[CODE: teacher-session-store.ts:162-176; §11 below]`
7. "Save Draft" and "Preview" buttons exist in the UI but have no click handler at all. `[CODE: teacher.courses.$courseId.sessions.$sessionId.tsx]`

Per the target architecture, this workflow is meant to expand to: choosing a **Session Type** (10 types) or a **built-in Template** (6–8 templates) that pre-populates blocks, then filling in **Dependencies**, **Completion Rules**, **Rewards**, **Target audience**, and **Access/Monetization model**. `[DOCUMENT: CLASSZ_SESSION_WORKSPACE_ARCHITECTURE.md, CLASSZ_SESSION_CORE_BLOCKS_ARCHITECTURE.md]`

---

## 4. Student Workflow

Reconstructed from the student session player route and the underlying mock/bridge data layer. `[CODE: student.courses.$courseId.session.tsx, src/lib/sessionMock.ts; DOCUMENT: CLASSZ_STUDENT_SESSION_COMPONENTS_AUDIT.md]`

1. Student browses **My Courses**, opens an enrolled course (enrollment itself is Zustand-only today — no backend `enrollments` table exists `[DOCUMENT: CLASSZ_INTEGRATION_AUDIT.md B1]`).
2. Student clicks **Continue Learning** / opens `/student/courses/$courseId/session`, landing on the **Session Player**.
3. The left **Session Sidebar** shows an accordion of all Sessions for the course (only `status === "published"` sessions are ever surfaced) with items inside each (video/quiz/homework/attachment/notes/discussion), each showing a status icon (completed/locked/active/available). `[CODE: sessionMock.ts buildTeacherSessionCourse]`
4. The player auto-selects the first "active" item, else the first "available" item, else the first item overall, and renders it in the center panel via `ContentPlayer` (video — currently a mock placeholder, no real playback), `QuizCard`, `HomeworkCard`, or `AttachmentCard`. `[CODE: student.courses.$courseId.session.tsx]`
5. The right panel offers six tabs: Overview (objectives/key concepts/teacher card — working), Notes (fully working but in-memory only, lost on reload), Attach (hardcoded static file list), Q&A/Discuss/AI (empty placeholders, no functionality). `[DOCUMENT: CLASSZ_STUDENT_SESSION_COMPONENTS_AUDIT.md]`
6. Student uses Prev/Next to move between items; Next is blocked if the following item's status is `"locked"`. `[CODE]`
7. A **Mark as Complete** button exists in the navigation bar but its `onComplete` handler is never wired to anything — clicking it does nothing. `[CODE: LessonNavigation.tsx per DOCUMENT audit]`
8. Because no item is ever programmatically marked `"completed"` for real (non-mock) courses, session/course progress always computes to 0%. `[CODE: sessionMock.ts getSessionProgress + buildTeacherSessionCourse]`
9. Quiz/Homework "Start"/"Retake" buttons render but have no `onClick`/navigation — they do not launch a real assessment attempt. `[DOCUMENT: CLASSZ_STUDENT_SESSION_COMPONENTS_AUDIT.md]`

---

## 5. Required Database Entity (Suggested Fields Only — NOT for implementation)

This section lists fields **suggested** by cross-referencing (a) the domain-alignment document's proposed `sessions` table, (b) the frontend's `TeacherSession` interface (currently the closest thing to a real spec, even though unpersisted), and (c) `SessionWorkspaceData` (the newer, richer type). **No schema decision has been made. This is not an implementation instruction.**

| Suggested Field | Source |
|---|---|
| `id` (UUID) | `[INFERRED]` — standard across all existing tables `[CODE: courses/chapters/lessons models]` |
| `public_code` | `[DOCUMENT: CLASSZ_CONTENT_STUDIO_CORE_ARCHITECTURE.md — "SES" prefix reserved]`; also a Postgres sequence `seq_session_code` already exists, unused `[CODE: 202606210001_add_public_code_identity.py:37]` |
| `course_id` (FK) | `[DOCUMENT: CLASSZ_DOMAIN_MODEL_ALIGNMENT.md]`, `[CODE: TeacherSession.courseId]` |
| `teacher_id` / `owner_teacher_id` | `[CODE: TeacherAssessment has this pattern; TeacherSession does not currently, but Course already has teacher_id]` — `[INFERRED]` |
| `title`, `description` | `[CODE: TeacherSession, lessons table]` |
| `session_type` (enum) | `[CODE: TeacherSession.sessionType]`, `[DOCUMENT: 10 types in Workspace Architecture]` — **type vocabularies conflict between documents, see §7 decision flag** |
| `teaching_mode` (traditional/enhanced/smart_classz) | `[DOCUMENT: CLASSZ_SESSION_CORE_BLOCKS_ARCHITECTURE.md]` |
| `status` (draft/published/archived[/locked]) | `[CODE: TeacherSession.status]`, `[DOCUMENT: SessionWorkspaceData.status has a 4th value "locked"]` — **two conflicting status enums exist in frontend code alone, see §11** |
| `order` / `position` | `[CODE: TeacherSession.order, lessons.position]` |
| `is_free_preview` | `[CODE: lessons.is_free_preview, TeacherSession.isFreePreview]` |
| `release_at` / `open_at`, `hide_at` / `close_at` | `[CODE: lessons.release_at/hide_at, TeacherSession.openAt/closeAt]` |
| `requires_previous_completion`, `is_locked` | `[CODE: lessons table columns]` |
| `duration_minutes` | `[CODE: TeacherSession.durationMinutes — not persisted anywhere today]` |
| `access_model` (free/paid_once/included_in_course/subscription/wallet_only/gifted/scholarship) | `[DOCUMENT: CLASSZ_SESSION_CORE_BLOCKS_ARCHITECTURE.md]` |
| `price`, `currency`, `country_prices[]` | `[CODE: TeacherSession.price/currency]`, `[DOCUMENT: countryPrices[] in SessionWorkspaceData]` |
| `access_duration_days`, `available_from`, `available_until`, `lock_after_days` | `[DOCUMENT: CLASSZ_SESSION_CORE_BLOCKS_ARCHITECTURE.md]` |
| `series_id` / `series_name` | `[DOCUMENT: "Session Series" — Organic Revision Series, Crash Course: Derivatives]` |
| `version`, `cloned_from` | `[DOCUMENT: Session Versioning section]` |
| `created_by`, `updated_by`, `published_by`/`published_at`, `archived_by`/`archived_at` | `[DOCUMENT: CLASSZ_CONTENT_STUDIO_CORE_ARCHITECTURE.md BaseEntityMetadata]` |

`HUMAN DECISION REQUIRED` — Whether a Session's direct parent is `course_id` only (per the domain-alignment document) or whether `chapter_id` remains a required parent (per current code and the current UI's chapter filter). The domain-alignment document explicitly defers this: *"Whether the chapter filter UI stays or goes is a product decision (Dr. Ahmed), not a technical one."* `[DOCUMENT: CLASSZ_DOMAIN_MODEL_ALIGNMENT.md]`

`HUMAN DECISION REQUIRED` — Whether `sessions` becomes a genuinely new table (separate from `lessons`) or whether the existing session=lesson mapping is kept permanently as a naming/branding choice. Both positions exist in the documents: the domain-alignment document calls the current mapping an architectural conflation that should be corrected; a separate integration-audit document recommends *keeping* `TeacherSession → Lesson` as a permanent naming decision, mapped only in the API layer. `[DOCUMENT: CLASSZ_DOMAIN_MODEL_ALIGNMENT.md vs CLASSZ_INTEGRATION_AUDIT.md "Decision 4: Session vs Lesson Terminology"]` These two documents disagree with each other.

---

## 6. Required Relationships

**One-to-many**

| Relationship | Status |
|---|---|
| Course → Sessions | Missing at DB level; exists as `TeacherSession.courseId` in frontend only `[CODE]`. Required per `[DOCUMENT: CLASSZ_DOMAIN_MODEL_ALIGNMENT.md]` |
| Session → Content Blocks | Missing as a real block entity; today, blocks are actually rows in the unrelated `TeacherMaterial`/quiz/exam/homework stores, filtered by a `sessionId`-like field `[CODE: teacher-material-store.ts sessionId field, TeacherSession builder route]` |
| Session → Session Progress records (per student) | Missing entirely — no session-level progress table exists anywhere `[CODE — see §13]` |

**Many-to-many**

| Relationship | Status |
|---|---|
| Session ↔ Lesson (which academic lessons a session covers) | Missing at DB level. `TeacherSession.lessonIds: string[]` declared, always empty `[CODE: teacher-session-store.ts:34]`. Required per `[DOCUMENT: CLASSZ_DOMAIN_MODEL_ALIGNMENT.md — session_lesson_refs table]` |
| Session ↔ Concept | Missing at DB level (no `concepts` table exists at all). `TeacherSession.conceptIds[]` declared, always empty `[CODE]`. Required per `[DOCUMENT]` |
| Session ↔ Atomic Concept | Same status as Concept, one level finer `[CODE + DOCUMENT]` |
| Session ↔ Material | Implemented today, but inverted: `TeacherMaterial.linkedSessionIds[]` and `.sessionId` point *from* material *to* session, rather than a join table `[CODE: teacher-material-store.ts:35,70]` |
| Session ↔ Assessment (quiz/exam/homework) | Partially implemented, also inverted: `TeacherAssessment.sessionIds[]` points from assessment to session(s); an `AssessmentBlock.assessmentId` (declared in the newer, unused `session-workspace-types.ts` model) would point the other way, but that model is not wired to the actual builder route `[CODE: teacher-assessment-store.ts:97, session-workspace-types.ts:136]` |
| Session ↔ Question (practice bank) | `TeacherSession.questionIds[]` declared, empty, unused; actual builder route pulls questions by matching `question.sessionId`-equivalent filter instead `[CODE]` |

**Reference relationships (pointer, not ownership)**

| Reference | Status |
|---|---|
| `AssessmentBlock.assessmentId → TeacherAssessment.id` | Declared in `session-workspace-types.ts`, not used by the live builder route `[CODE]` |
| `VideoPlaylistItem.materialId → TeacherMaterial.id` | Declared, not used by the live builder route (which references materials by `sessionId` filter, not per-block `materialId`) `[CODE]` |
| `ContentTreeNode.linkedSessionIds[] → Session.id` (reverse link from concept tree) | Implemented as a store action (`linkSession`) but **never called** anywhere in the seed data or any route — always empty in practice `[CODE: content-tree-store.ts:120-125, verified zero callers]` |

`HUMAN DECISION REQUIRED` — Two competing block/reference models currently coexist in the codebase: (a) the older, *actually wired* model where a session's "blocks" are really just `TeacherMaterial`/quiz/exam/homework rows filtered by an id, and (b) the newer, richer, fully-typed `SessionWorkspaceData`/`TypedSessionBlock` model in `session-workspace-types.ts` that is documented as canonical but not connected to any store or route. A decision is needed on whether to build (b) for real, or to formalize (a) as the actual data model. `[CODE + DOCUMENT: CLASSZ_SESSION_CORE_BLOCKS_ARCHITECTURE.md]`

---

## 7. Content Studio Integration

Content Studio is the umbrella authoring page; "Sessions" is one of its tabs, alongside Content Tree, Materials, Questions, Quizzes, Homework, Exams, Assignments. `[DOCUMENT: CLASSZ_CONTENT_STUDIO_CORE_ARCHITECTURE.md]`

How blocks belong to sessions, **today, in actual code**:
- The builder route (`teacher.courses.$courseId.sessions.$sessionId.tsx`) constructs a local, in-memory `CanvasBlock[]` list by combining: materials filtered by `sessionId` → mapped to video/pdf/notes/image blocks; practice questions aggregated into one "question_block"; and one block per linked quiz/exam/homework record. `[CODE]`
- Clicking "Add Block" from the palette of 12 new block-type names (imported from `session-workspace-types.ts` for labels only) actually calls `createMaterial(...)`, coercing the chosen type into one of the existing material types. **The 12 new block types are not persisted as distinct entities** — they are relabeled material creations. `[CODE]`
- Reordering blocks calls `reorderMaterials` (a material-store action), not a session-block-store action, because no such store exists. `[CODE]`

How blocks are *documented* to belong to sessions (target model):
- A session references, but does not duplicate, Materials (`materialId`/`materialIds[]`), the Assessment Engine (`assessmentId`), and inline text/notes/discussion/AI/live-meeting configuration blocks. `[DOCUMENT: CLASSZ_SESSION_CORE_BLOCKS_ARCHITECTURE.md]`

Content Studio's own documented required backend work for *any* of its tabs (not session-specific, but a hard dependency): Postgres sequences for all 14 entity types, database models carrying `BaseEntityMetadata`, CRUD API endpoints with audit logging, and replacement of every localStorage-backed store with real API calls. `[DOCUMENT: CLASSZ_CONTENT_STUDIO_CORE_ARCHITECTURE.md — "What Remains for Backend Integration"]`

`HUMAN DECISION REQUIRED` — The block-type vocabulary itself is contested across three documents that do not agree with each other or with the backend: `CLASSZ_SESSION_CORE_BLOCKS_ARCHITECTURE.md` (12 new types), `CLASSZ_SESSION_WORKSPACE_ARCHITECTURE.md` (a differently-named list of 12 "Canvas Blocks"), and the backend's actual `block_type_enum` (5 values: TEXT, PDF, IMAGE, VIDEO, ATTACHMENT, with VIDEO explicitly blocked by a validator). `[DOCUMENT + CODE: CONTENT_STUDIO_VERIFICATION.md; CLASSZ_DOCUMENTS_VS_CODE_AUDIT.md "Decision A"]`

---

## 8. Lesson References

- Target model: a Session references N Lessons via a `session_lesson_refs` many-to-many join table; a Lesson is unaware of which Sessions reference it. `[DOCUMENT: CLASSZ_DOMAIN_MODEL_ALIGNMENT.md]`
- Current code reality: there is no such join. Instead, a Session *is* a Lesson row (one-to-one, same primary key, same table). `[CODE: lessons/models.py + MILESTONE_03_REPORT.md mapping table]`
- A vestigial `TeacherSession.lessonIds: string[]` field exists for the future many-to-many model but is never set by any code path. `[CODE: teacher-session-store.ts:34, 96]`
- A parallel, apparently unrelated `teacher-lesson-store.ts` also exists in the frontend, defining its own `TeacherLesson` type with its own `conceptIds`/`atomicConceptIds` fields, separate from `TeacherSession` — its relationship to Sessions is `[UNKNOWN]`; it was not wired into any route inspected in this pass.

---

## 9. Concept References

- Target model: a Session references N Concepts (many-to-many), enabling concept-level analytics on delivery content, and Concepts sit under Lessons in the Academic structure. `[DOCUMENT: CLASSZ_DOMAIN_MODEL_ALIGNMENT.md, CLASSZ_ARCHITECTURE.md Concept Engine]`
- Current code reality: no `concepts` table exists in the backend (module directory contains only stale compiled bytecode, no source). `[CODE: backend/app/modules/concepts/]`
- `TeacherSession.conceptIds[]` is declared but always empty; the same empty-declaration pattern repeats on `TeacherAssessment.conceptIds`, `TeacherQuiz.conceptIds`, `TeacherExam.conceptIds`, `TeacherMaterial.linkedConceptIds`. None are populated by seed data or any store action. `[CODE — verified by repo-wide grep]`
- The only place a concept-like value is genuinely populated end-to-end is a **free-text string** field (`concept: "Power Rule"`) on seeded `TeacherQuestion` records — used for display/tagging, not as a foreign key to any real concept entity. `[CODE: teacher-question-store.ts, seed-teacher-data.ts]`
- A separate, reverse-direction linking mechanism exists on the Content Tree (`ContentTreeNode.linkedSessionIds[]`, with a `linkSession()` store action) but it is never invoked anywhere in seed data or routes. `[CODE: content-tree-store.ts]`
- A `TeacherConcept`/atomic-concept CRUD store is explicitly declared as **not yet built** — "Types only for Phase A — full CRUD store in Phase D." `[CODE: teacher-concept-types.ts header comment]`

`HUMAN DECISION REQUIRED` — Whether to build the Concept Engine (concepts table, atomic_concepts table, concept graph) before or alongside the Session module, or to defer it entirely and ship sessions without concept linking. Both options are explicitly on the table in a project document. `[DOCUMENT: CLASSZ_DOCUMENTS_VS_CODE_AUDIT.md "Decision B"]`

---

## 10. Atomic Concept References

- Target model: the finest-grain reference a Session can carry, feeding Student Memory retention tracking directly. `[DOCUMENT: CLASSZ_DOMAIN_MODEL_ALIGNMENT.md]`
- Current code reality: identical situation to Concept References (§9) one level down — `atomicConceptIds[]` fields exist on `TeacherSession`, `TeacherAssessment`, `TeacherQuiz`, `TeacherExam`, `TeacherMaterial` (`linkedAtomicConceptIds`), all declared, all always empty. `[CODE]`
- No `atomic_concepts` table exists anywhere in the backend. `[CODE + DOCUMENT: CLASSZ_DOMAIN_MODEL_ALIGNMENT.md]`

---

## 11. Publishing Rules

- Frontend declares **two different, non-identical** `SessionStatus` types:
  - `"draft" | "published" | "archived"` in `teacher-session-store.ts:8`
  - `"draft" | "published" | "archived" | "locked"` in `session-workspace-types.ts:24`
  `[CODE]` — these are not the same type and are not reconciled anywhere.
- `publishSession()` / `archiveSession()` only call the local `updateSession()` setter, which mutates in-memory Zustand state. **No API call is made.** `[CODE: teacher-session-store.ts:162-176]`
- The backend `lessons` table has **no status column at all** — publishing currently does nothing at the database level, even conceptually. `[CODE: lessons/models.py]` `[DOCUMENT: CLASSZ_DOCUMENTS_VS_CODE_AUDIT.md "M7 — Session publish status"]`
- The student-facing bridge (`buildTeacherSessionCourse`) only ever shows sessions where `status === "published"` — meaning a course whose sessions are all in draft renders "Session Not Available Yet" to students. Since publish state never leaves the browser, this filter only works within a single browser/session. `[CODE: sessionMock.ts:294-295]`
- The `teacher-session-store` itself is **not** wrapped in Zustand's `persist` middleware (unlike `content-tree-store`, `teacher-assessment-store`, `teacher-material-store`), so `status` (and every other local mutation) does not even survive a page reload. `[CODE]`
- Content Studio's general entity metadata model documents `publishedBy`/`publishedAt`/`archivedBy`/`archivedAt` audit fields intended for every entity type, sessions included. `[DOCUMENT: CLASSZ_CONTENT_STUDIO_CORE_ARCHITECTURE.md BaseEntityMetadata]`

---

## 12. Purchase Rules

- Target access/monetization model (documented, not built): `free`, `paid_once`, `included_in_course`, `included_in_monthly_subscription`, `wallet_only`, `gifted`, `scholarship`, with supporting fields `price`, `currency`, `countryPrices[]`, `walletAllowed`, `subscriptionPlanIds[]`, `accessDurationDays`, `availableFrom`/`availableUntil`. `[DOCUMENT: CLASSZ_SESSION_CORE_BLOCKS_ARCHITECTURE.md]`
- Current code reality: `TeacherSession.price`, `.currency`, `.isFreePreview` exist as frontend fields but are **not sent to the backend** — `LessonCreatePayload` has no price/currency field at all, so a created session's price is never persisted. `[CODE: src/lib/api/lessons.ts:17-26]`
- The student-facing bridge hardcodes `access.durationDays = 30` for every session regardless of what a teacher configured, and derives `access.type` only from the free-preview flag. `[CODE: sessionMock.ts:313-319]`
- No `enrollments` table exists in any migration — enrollment/access-gating itself is Zustand-only (`enrollment-store.ts`, localStorage). `[DOCUMENT: CLASSZ_INTEGRATION_AUDIT.md B1, "Database support: No `enrollments` table in any migration"]`
- No functioning payments or wallet backend exists — `payments/router.py` has no routes, `service.py` is a stub; `wallets/router.py` is likewise an empty stub. Neither module is registered in `main.py`. `[DOCUMENT: CLASSZ_INTEGRATION_AUDIT.md B5]` `[CODE: main.py router registrations — payments/wallets absent]`
- **Conclusion:** there is currently no enforceable purchase rule of any kind for Sessions — pricing is decorative UI state only.

---

## 13. Progress Rules

- Only entity that tracks any real progress today is `LessonProgress` (table `lesson_progress`), keyed by a unique `(student_id, lesson_id)` pair, with `started_at`, `completed_at`, `percent_complete` (int), `last_position_seconds` (int). `[CODE: backend/app/modules/progress/models.py]`
- Because the constraint is unique per `(student, lesson)`, there is exactly **one** progress row per student per lesson — no concept of multiple sessions/attempts against the same lesson, and (since Session = Lesson today) no way to track progress separately per session-item within it. `[CODE]`
- No session-level or block-level progress table exists anywhere. `[DOCUMENT: CLASSZ_DOMAIN_MODEL_ALIGNMENT.md — "session_progress → (sessions, students)" listed as missing]`
- On the student side, item-level status (`completed`/`active`/`available`/`locked`) shown in the session player is **derived**, not tracked: `buildTeacherSessionCourse()` sets every unlocked item's status to `"available"` and never to `"completed"` — so real (non-mock) sessions can never show completed progress. `[CODE: sessionMock.ts:297-309]`
- The "Mark as Complete" button in the student player renders but its handler is never wired to any store or API call. `[DOCUMENT: CLASSZ_STUDENT_SESSION_COMPONENTS_AUDIT.md]`
- A `CompletionRulesBlock`/`CompletionRule` type model exists (watch-percentage, assessment-pass, resource-download, homework-submit, manual-complete, all-required-blocks-complete) but the actual builder UI's "Completion Rules" checkboxes are hardcoded with no store wiring behind them. `[CODE: session-workspace-types.ts:158-174; teacher.courses.$courseId.sessions.$sessionId.tsx:556-566]`

---

## 14. Analytics Impact

- The Session Builder's **Analytics** tab is fully static mock data with a "Coming Soon" badge — it reflects nothing real about the session. `[CODE: teacher.courses.$courseId.sessions.$sessionId.tsx:846-870]`
- Backend teacher-dashboard endpoints exist (`GET /api/teacher-dashboard/summary`, `pending-tasks`, `recent-activity`) but the frontend teacher dashboard is not wired to them — it shows hardcoded mock data. `[DOCUMENT: CLASSZ_INTEGRATION_AUDIT.md M13]`
- Concept-level analytics pages (`/teacher/insights/concept-analytics`) exist in the frontend with mock data only, and have no backend tables to draw from, since Concepts don't exist yet. `[DOCUMENT: CLASSZ_DOCUMENTS_VS_CODE_AUDIT.md]`
- `[INFERRED]` Because Session→Lesson, Session→Concept, and Session→Progress relationships are all currently either missing or unpersisted, no analytics query could currently answer even a basic question like "which sessions have the lowest completion rate" against real data.

---

## 15. Student Memory Impact

- The `student_memory` backend module directory currently contains **no source files** — only stale compiled bytecode artifacts remain on disk. It is not registered in `main.py` and exposes no live endpoints. `[CODE: backend/app/modules/student_memory/]`
- Historical note (git history, not current code): an earlier commit added a substantial `student_memory` module (models, repository, router, schemas, service, seed script) plus a dedicated Alembic migration, and both were fully removed in later commits. The removed module's field-level detail was not pulled into this document since it does not reflect the current system — it can be retrieved from git history on request if useful context for a rebuild. `[CODE: git log — commit that added it, subsequent commits that removed it]`
- Per the architecture document, Student Memory (retention per concept) is meant to be fed by exactly the Concept/Atomic-Concept references a Session carries — since neither Concepts nor a live Student Memory module currently exist, **there is presently no path by which anything a student does inside a Session could reach Student Memory.** `[DOCUMENT: CLASSZ_ARCHITECTURE.md — Concept Engine section]` `[INFERRED from §9/§10/this section combined]`
- One backend module reference elsewhere describes `student_memory` as an existing module in a comparison table `[DOCUMENT: CLASSZ_DOCUMENTS_VS_CODE_AUDIT.md — "🟡 PARTIAL (backend exists, frontend disconnected)"]` — this appears to describe a point in time before the module was removed, or reflects the historical commit noted above rather than the current tree. **This is a document/code discrepancy, not a currently-buildable integration point.**

---

## Summary of Open Decisions Requiring Dr. Ahmed's Sign-Off

1. Session's parent: `course_id` only, or does `chapter_id` remain required? (§5)
2. Keep Session permanently mapped onto the `lessons` table (branding-only), or build a genuinely separate `sessions` table? Two existing documents disagree with each other on this. (§5)
3. Which block-type vocabulary is canonical — and reconcile it with the backend's 5-value enum? Three documents disagree. (§7)
4. Build the Concept Engine now (changes the session/block schema significantly) or defer it and ship sessions without concept linking? (§9)
5. Which assessment model is canonical — separate `quizzes`/`assignments` tables, or the newer unified `TeacherAssessment`? (Referenced by §6/§7; not fully explored in this document but flagged as unresolved in `CLASSZ_DOCUMENTS_VS_CODE_AUDIT.md "Decision C"`.)
6. Reconcile the two conflicting frontend `SessionStatus` type definitions before either is used to design a backend column. (§11)
