# CLASSZ Domain Model Alignment Analysis

**Date:** 2026-07-05  
**Purpose:** Verify whether the current codebase supports the real CLASSZ two-structure domain model.  
**Scope:** Read-only. No code changes. No migrations. No redesigns.

---

## The Real Domain Model (Reference)

```
Structure 1 — Academic (Knowledge)          Structure 2 — Delivery (Teaching)
────────────────────────────────────        ──────────────────────────────────────
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

The two structures are **independent** but connected through references.  
A Session is a delivery container, not a curriculum unit.

---

## Question 1 — Does the current architecture support this domain model?

**No.**

The current architecture conflates the two structures into one. The core problem is:

> In Milestone 3, `TeacherSession` (frontend, delivery concept) was wired to the `lessons` table (backend, academic concept).

This means the backend currently has no separation between "academic lesson" and "delivery session." They share the same table, the same rows, and the same IDs. A record in the `lessons` table is simultaneously being treated as both a curriculum unit and a teaching event.

A secondary problem: `lesson_blocks` (the content blocks table) is attached to `lessons` via a `lesson_id` FK (migration 002). Under the real model, content blocks belong to delivery Sessions, not to academic Lessons. The table is on the wrong parent.

---

## Question 2 — What is missing?

### Academic Structure gaps

| Missing Element | What it represents |
|----------------|-------------------|
| `concepts` table | Atomic unit of knowledge — the core differentiator of CLASSZ |
| `atomic_concepts` table | The smallest chunk of knowledge (one fact, one idea) |
| `lesson_concepts` join table | Which concepts belong to a lesson |
| `concept_connections` table | Graph edges between concepts (prerequisite, related, enables) |

The `concepts` module directory exists at `backend/app/modules/concepts/` but contains **only a `__pycache__` folder** — no Python source files at all. It is an empty placeholder.

### Delivery Structure gaps

| Missing Element | What it represents |
|----------------|-------------------|
| `sessions` table | The teaching event itself (lecture, class, live session) |
| `session_blocks` table | Content blocks belonging to a session (video, PDF, quiz embed, etc.) |
| `session_lesson_refs` table | Which lessons a session covers (many-to-many) |
| `session_concept_refs` table | Which concepts a session covers (many-to-many) |
| `session_atomic_concept_refs` table | Which atomic concepts a session covers (many-to-many) |

### Supporting infrastructure gaps

| Missing Element | What it represents |
|----------------|-------------------|
| `enrollments` table | Student ↔ Course access. Blocks the entire student journey. |
| Session `status` column | Sessions need draft/published/archived — `lessons` table has no status column |

---

## Question 3 — Which existing database tables already fit this model?

### Academic Structure — tables that fit

| Table | Fits Academic Model? | Notes |
|-------|---------------------|-------|
| `courses` | ✅ Yes | Correct root of the academic hierarchy |
| `chapters` | ✅ Yes | Correct second level, FK to `courses` |
| `lessons` | ✅ Yes — but currently misused | The table is correct for the academic model. The problem is that it is also being used as the sessions table (Milestone 3 wiring). The schema itself is fine for academic lessons. |
| `lesson_progress` | ✅ Yes | Tracks student progress through academic lessons — correct placement |

### Delivery Structure — tables that partially fit

| Table | Fits Delivery Model? | Notes |
|-------|---------------------|-------|
| `lesson_blocks` | ⚠️ Wrong parent | The table stores content blocks (Video, PDF, Text, Image, Attachment) — these are delivery content. But the FK is `lesson_id → lessons.id`, meaning blocks are currently attached to academic lessons, not to delivery sessions. The structure is right; the parent is wrong. |
| `videos` | ⚠️ Indirect | Attached to `lesson_blocks` via `lesson_block_id`. Correct delivery content type — but inherits the wrong parent from `lesson_blocks`. |
| `quizzes` | ✅ Partial fit | Has optional `lesson_id` FK — links a quiz to an academic lesson (correct direction). But has no `session_id` — cannot link to a delivery session. |
| `assignments` | ✅ Partial fit | Same pattern as quizzes — `lesson_id` FK exists (academic reference), no `session_id` (no delivery reference). |

### Standalone — fits both models

| Table | Notes |
|-------|-------|
| `questions` | Standalone question bank — no dependency on either structure. Correctly independent. |
| `question_choices` | Child of `questions`. Correct. |
| `question_categories` | Standalone taxonomy. Correct. |
| `question_tags` | Standalone tags. Correct. |
| `question_tag_links` | Join table. Correct. |
| `question_media` | Attached to questions. Correct. |
| `quiz_questions` | Links `quizzes` to `questions`. Correct. |
| `quiz_attempts` | Student quiz attempts. Correct. |
| `quiz_attempt_answers` | Student answers. Correct. |
| `results` | Auto-graded results. Correct. |
| `assignment_submissions` | Student submissions. Correct. |

---

## Question 4 — Which relationships already exist?

The relationships that exist today in the database (from Alembic migrations 001–010 + 202606210001):

### Academic chain

```
users ──────────────────────────────── (teacher_id) ──→ courses
courses ─────────────────────────────── (course_id) ──→ chapters
chapters ────────────────────────────── (chapter_id) ─→ lessons
lessons ─────────────────────────────── (lesson_id) ──→ lesson_blocks
lesson_blocks ──────────────────────── (lesson_block_id) → videos
lessons + users ────────────────────── (lesson_id, student_id) → lesson_progress
```

### Assessment connections (linked to academic, not delivery)

```
courses ────────────────────────────────────── (course_id) ──→ quizzes
chapters ──────────────────────────────────── (chapter_id) ──→ quizzes  [nullable]
lessons ────────────────────────────────────── (lesson_id) ──→ quizzes  [nullable]
courses ────────────────────────────────────── (course_id) ──→ assignments
chapters ──────────────────────────────────── (chapter_id) ──→ assignments  [nullable]
lessons ────────────────────────────────────── (lesson_id) ──→ assignments  [nullable]
quizzes ──────────────────────────────────── (quiz_id) ──→ quiz_questions
questions ──────────────────────────────── (question_id) ──→ quiz_questions
```

### Question bank (standalone)

```
question_categories ─── (category_id) ─→ questions
questions ──────────── (question_id) ──→ question_choices
questions ──────────── (question_id) ──→ question_media
questions + question_tags ──────────── (question_id, tag_id) → question_tag_links
```

---

## Question 5 — Which relationships are missing?

The relationships required by the real domain model that do not exist today:

### Academic Structure — missing

| Missing Relationship | Required By |
|---------------------|------------|
| `lessons → concepts` (one lesson contains many concepts) | Concept Engine, Knowledge Graph |
| `concepts → atomic_concepts` (one concept contains atomic chunks) | Concept Engine, Student Memory |
| `concepts → concepts` (concept prerequisite/related/enables graph) | AI Recommendations, Knowledge Graph |

### Delivery Structure — missing (entire structure absent)

| Missing Relationship | Required By |
|---------------------|------------|
| `sessions → courses` (a session belongs to a course) | Session creation, scheduling |
| `session_blocks → sessions` (blocks belong to sessions, not lessons) | Content Studio |
| `videos → sessions` (via session_blocks) | Video delivery |
| `sessions → lessons` many-to-many (which lessons does a session cover?) | Student Memory, Progress |
| `sessions → concepts` many-to-many (which concepts does a session cover?) | AI, Recommendations |
| `sessions → atomic_concepts` many-to-many (finest-grain reference) | Student Memory |
| `quizzes → sessions` (a quiz can be embedded in a session) | Assessment delivery |
| `assignments → sessions` (an assignment can be linked to a session) | Assessment delivery |

### Supporting — missing

| Missing Relationship | Required By |
|---------------------|------------|
| `enrollments → (courses, students)` | Student access, entire student journey |
| `session_progress → (sessions, students)` | Student progress per session |

### Relationships that exist but point at the wrong parent

| Relationship | Current (wrong) | Should be |
|---|---|---|
| `lesson_blocks.lesson_id` | → `lessons.id` | → `sessions.id` |
| `videos.lesson_block_id` | → `lesson_blocks` (which is on academic lessons) | → `session_blocks` (on delivery sessions) |
| `quizzes.lesson_id` | References academic lesson | Should also reference `sessions.id` for delivery linkage |
| `assignments.lesson_id` | References academic lesson | Should also reference `sessions.id` for delivery linkage |

---

## Question 6 — Can this be implemented without redesigning the existing frontend?

**Mostly yes, with one clarification needed.**

### What does NOT need to change in the frontend

| Frontend Element | Safe? | Reason |
|-----------------|-------|--------|
| Session list UI (`teacher.courses.$courseId.sessions.tsx`) | ✅ Safe | The page layout, card design, and create form are presentation only |
| Content Studio UI (block builder, tabs) | ✅ Safe | The entire block builder UI is unaffected by which table the session lives in |
| Session store interface (`TeacherSession` type) | ✅ Safe | The TypeScript type can keep all its fields; only the API calls need to change |
| `createSession` / `loadSessions` function signatures | ✅ Safe | The store API surface (what the UI calls) can stay identical |
| Chapter store, Course store | ✅ Safe | Academic structure is unchanged |
| All pages other than sessions | ✅ Safe | None are affected by the sessions/lessons distinction |

### What would change in the frontend (API layer only)

| Frontend Element | Change Needed | Nature of change |
|-----------------|--------------|-----------------|
| `src/lib/api/lessons.ts` | Must be replaced or complemented by `src/lib/api/sessions.ts` | The API calls would point to `POST /api/sessions` instead of `POST /api/lessons`. File rename + URL change only. |
| `teacher-session-store.ts` — `createSession` | Would call `POST /api/sessions` instead of `POST /api/lessons` | 2-line change in the store |
| `teacher-session-store.ts` — `loadSessions` | Would call `GET /api/sessions?course_id=<id>` instead of `GET /api/lessons?chapter_id=<id>` | The chapter filter would change to a course-level query (or sessions reference chapters through their lesson references) |
| `TeacherSession.chapterId` field | This field assumes a session belongs to one chapter | Under the real model, a session belongs to a course and references lessons (each lesson is in a chapter). The field becomes either removed or a derived value. |

### The one clarification needed

The current frontend session page (`/teacher/courses/$courseId/sessions`) uses a chapter filter — sessions are currently filtered and grouped by chapter. This was inherited from the incorrect mapping of Session=Lesson.

Under the real domain model:
- Sessions belong to a **Course**, not to a Chapter
- A session **references** lessons (which are in chapters) but is not a child of any chapter
- The sessions list for a course shows all sessions for that course

This means the chapter filter dropdown on the sessions page is not a "redesign" question — it is a consequence of the wrong data model. When the backend sessions table is built, sessions will be fetched by `course_id` only, and the session's covered content (which lessons/concepts) will be in a separate references join.

Whether the chapter filter UI stays or goes is a product decision (Dr. Ahmed), not a technical one. The page itself — its layout, its cards, its create form — is fully reusable.

---

## Summary

| Question | Answer |
|----------|--------|
| Does current architecture support the domain model? | ❌ No. The two structures are conflated. `lessons` is used for both academic and delivery purposes. |
| What is missing? | `sessions` table, `session_blocks`, session reference joins (`session_lesson_refs`, `session_concept_refs`), `concepts`, `atomic_concepts`, `enrollments` |
| Which tables fit the academic model? | `courses`, `chapters`, `lessons`, `lesson_progress` |
| Which tables fit the delivery model? | None directly — `lesson_blocks` has the right structure but the wrong parent |
| Which relationships exist correctly? | Academic chain: courses→chapters→lessons. Assessment links to lessons. Question bank (standalone). |
| Which relationships are missing? | All of: Session→Course, Session→Blocks, Session→LessonRefs, Session→ConceptRefs, Lesson→Concepts, Concept→AtomicConcepts, Enrollments |
| Can frontend survive without redesign? | ✅ Yes. Session pages, Content Studio UI, and store interfaces are all compatible with the real model. The only code that changes is the API client layer (which URL to call) and the session store's `chapter_id`→`course_id` parent change. |

---

## The Core Architectural Correction Required

```
Current (wrong):
  lessons table ← TeacherSession is stored here
  lesson_blocks table ← Content blocks are here (attached to academic lessons)

Correct:
  lessons table ← Academic curriculum unit (unchanged)
  sessions table ← Delivery teaching event (new table needed)
  session_blocks table ← Content blocks (new, or lesson_blocks re-parented)
  
  Session references:
    session_lesson_refs (session_id, lesson_id) ← many-to-many
    session_concept_refs (session_id, concept_id) ← many-to-many
```

The data already created in `lessons` during Milestones 1–3 testing is test data only and will need to be re-created once the `sessions` table exists. No production data migration is required at this stage.
