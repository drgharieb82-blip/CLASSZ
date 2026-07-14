# CLASSZ Documents vs. Code Audit

**Date:** 2026-07-05  
**Auditor:** Delivery Lead (Claude)  
**Purpose:** Find the real CLASSZ product model by comparing official project documents against the current implementation.  
**Scope:** Read-only. No code changes. No recommendations for implementation. Only inspect, compare, and report.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ MATCH | Docs and code agree |
| 🟡 PARTIAL | Code implements part of the documented idea |
| ❌ CONFLICT | Code differs from docs in a meaningful way |
| ⚪ MISSING | Documented idea has no implementation at all |
| 🧊 OBSOLETE | Document describes something no longer used |

---

## 1. Documents Found

| # | Document | Location | Pages / Size |
|---|----------|----------|-------------|
| 1 | `CLASSZ_ARCHITECTURE.md` | `d:/CLASSZ/` | Vision, principles, full hierarchy |
| 2 | `CLASSZ_LAUNCH_ROADMAP.md` | `d:/CLASSZ/` | July 2026 architectural analysis |
| 3 | `CLASSZ_INTEGRATION_AUDIT.md` | `d:/CLASSZ/` | 24-module audit, integration roadmap |
| 4 | `CLASSZ_HANDOFF_2026-06-20.md` | `d:/CLASSZ/` | June 20 handoff notes |
| 5 | `docs/DECISIONS.md` | `d:/CLASSZ/docs/` | D001–D007 architectural decisions |
| 6 | `docs/API_FRONTEND_MAPPING.md` | `d:/CLASSZ/docs/` | Endpoint-to-page mapping table |
| 7 | `docs/MASTER_PLAN.md` | `d:/CLASSZ/docs/` | 15-phase delivery plan |
| 8 | `CLASSZ_CONTENT_STUDIO_CORE_ARCHITECTURE.md` | `classz-frontend-prototype/` | 8-tab Content Studio, public code system |
| 9 | `CLASSZ_SESSION_CORE_BLOCKS_ARCHITECTURE.md` | `classz-frontend-prototype/` | 12 new block types, legacy mapping |
| 10 | `CLASSZ_SESSION_WORKSPACE_ARCHITECTURE.md` | `classz-frontend-prototype/` | 10 session types, canvas blocks |
| 11 | `CLASSZ_ASSESSMENT_ENGINE_CORE_ARCHITECTURE.md` | `classz-frontend-prototype/` | Unified assessment, 15 presets |
| 12 | `CLASSZ_QUESTION_BANK_FULL_CORE_ARCHITECTURE.md` | `classz-frontend-prototype/` | 28 question types |
| 13 | `CONTENT_STUDIO_VERIFICATION.md` | `d:/CLASSZ/` | Backend block type capability audit |
| 14 | `MILESTONE_03_REPORT.md` | `d:/CLASSZ/` | Session/Lesson integration status |

**Not audited** (exist in repo, not in scope of this audit):  
`docs/CODEX_HANDOFF.md`, `docs/COMPONENTS_LIBRARY.md`, `docs/DESIGN_SYSTEM.md`, `docs/FRONTEND_MIGRATION_PLAN.md`, `docs/IMPLEMENTATION_LOG.md`, `design/dashboards/*.md`, `design/layouts/*.md`, `classz-frontend-prototype/CLASSZ_FLEXIBLE_CONTENT_ARCHITECTURE_Phase*.md`, `classz-frontend-prototype/CLASSZ_FULL_PLATFORM_QA.md`, `classz-frontend-prototype/CLASSZ_STUDENT_JOURNEY_AUDIT.md`, `classz-frontend-prototype/CLASSZ_TEACHER_CONTENT_*.md`

---

## 2. Which Documents Appear Current

| Document | Currency | Evidence |
|----------|----------|----------|
| `docs/DECISIONS.md` | ✅ Current | D001 correctly identifies `classz-frontend-prototype/` as production. D004 documents Session=Lesson, enforced in Milestone 3. D006 role list matches frontend `roles.ts`. |
| `docs/API_FRONTEND_MAPPING.md` | ✅ Current | Accurately reflects the state after Milestones 1-3: courses, chapters, lessons are "Wired"; student/parent/admin pages are "Page Only". |
| `CLASSZ_INTEGRATION_AUDIT.md` | ✅ Current | Written July 2026; accurately reports ~28% integration, 6 blockers, and the 24 backend modules. |
| `CLASSZ_LAUNCH_ROADMAP.md` | ✅ Current | July 2026 analysis matches current code reality (auth is wired, teacher CRUD partially wired, everything else is mock data). |
| `CONTENT_STUDIO_VERIFICATION.md` | ✅ Current | Generated during this integration cycle. Reflects actual backend block enum state. |
| `MILESTONE_03_REPORT.md` | ✅ Current | Generated during this integration cycle. |
| `CLASSZ_CONTENT_STUDIO_CORE_ARCHITECTURE.md` | 🟡 Aspirational | Describes the full intended design (8 tabs, public codes, entity metadata). Frontend UI reflects this aspiration; backend support is partial. |
| `CLASSZ_ASSESSMENT_ENGINE_CORE_ARCHITECTURE.md` | 🟡 Aspirational | Unified assessment model is the goal. Current code has separate quiz/assignment modules and a partially-built `teacher-assessment-store`. |
| `CLASSZ_QUESTION_BANK_FULL_CORE_ARCHITECTURE.md` | 🟡 Aspirational | 28 question types documented; backend has 7. |

---

## 3. Which Documents Appear Outdated

| Document | Outdated How | Evidence |
|----------|-------------|----------|
| `CLASSZ_ARCHITECTURE.md` (hierarchy section) | 🧊 Partially obsolete | Defines hierarchy as Course→Chapter→**Lesson**→Concept→Resources. The "Lesson" label is correct for the backend model, but the frontend has permanently branded it "Session" per D004. The document predates that decision. |
| `CLASSZ_ARCHITECTURE.md` (role section) | ❌ Outdated | Lists 6 user types: Student, Teacher, Assistant Teacher, Parent, Admin, Super Admin. The frontend now defines 10 roles, and the Python model has 10 roles. The architecture doc is missing: Developer, Content Manager, Finance. |
| `CLASSZ_HANDOFF_2026-06-20.md` | 🧊 Mostly obsolete | Covers work done on `frontend/` (the deprecated secondary app). The decision D001 identified `classz-frontend-prototype/` as the production app. The handoff document's changes are for the wrong frontend. |
| `docs/MASTER_PLAN.md` | ❌ Outdated | 15-phase plan. Phases 1-3 are described as sequential database-first. The actual implementation jumped directly to UI-first with mock data and is only now adding backend integration. Phase sequencing does not match reality. |
| `CLASSZ_SESSION_CORE_BLOCKS_ARCHITECTURE.md` | ❌ Conflicts with backend | Defines 12 new block types (TEACHING_UNIT, CONCEPT_CARD, FLASHCARD, etc.). Backend DB has 5 types (TEXT, PDF, IMAGE, VIDEO, ATTACHMENT). The two are structurally incompatible without DB migrations. |
| `CLASSZ_SESSION_WORKSPACE_ARCHITECTURE.md` | 🟡 Partially obsolete | Defines 10 session types and 12 canvas blocks with different names than `CLASSZ_SESSION_CORE_BLOCKS_ARCHITECTURE.md`. The two block-type documents conflict with each other. |

---

## 4. Official Product Hierarchy — According to Documents

### Primary source: `CLASSZ_ARCHITECTURE.md`

```
Platform
└── Academy (multi-tenant unit, owned by teacher or institution)
    └── Course
        └── Chapter
            └── Lesson  ← called "Session" in frontend (D004)
                ├── Content Blocks  (what teacher builds)
                └── Concept  ← Atomic unit of knowledge
                    ├── Atomic Concept  (smallest chunk: one fact)
                    ├── Resources  (attachments, links, media)
                    └── Connections  (links to other concepts)
```

**Content block types** (per `CLASSZ_SESSION_CORE_BLOCKS_ARCHITECTURE.md`):  
12 named types: TEACHING_UNIT, CONCEPT_CARD, FLASHCARD, INTERACTIVE_EXERCISE, MEDIA_EMBED, CODE_BLOCK, DIVIDER, CALLOUT, QUIZ_EMBED, EXAM_EMBED, HOMEWORK_EMBED, PRACTICE_SET

**Content block types** (per `CLASSZ_SESSION_WORKSPACE_ARCHITECTURE.md` — a different document):  
12 canvas blocks with different names: Text, Rich Text, Video, Image, PDF, Code, Quiz, Assignment, Concept, Flashcard, Divider, Callout

**Assessment hierarchy** (per `CLASSZ_ASSESSMENT_ENGINE_CORE_ARCHITECTURE.md`):  
Unified `TeacherAssessment` model with 15 type presets: Quiz, Exam, Homework Assignment, Mini Quiz, Practice Set, Reading Assignment, Lab Activity, Project, Poll, Survey, Case Study, Essay, Portfolio, Self-Assessment, Reflection

**Question Bank** (per `CLASSZ_QUESTION_BANK_FULL_CORE_ARCHITECTURE.md`):  
28 question types including MCQ, True/False, Short Answer, Essay, Matching, Fill-in-the-blank, Code, Diagram, Audio, Video, Hotspot, Ordering, etc.

**User Roles** (per `CLASSZ_ARCHITECTURE.md`):  
6 types: Student, Teacher, Assistant Teacher, Parent, Admin, Super Admin

---

## 5. Actual Hierarchy — According to Code

### Backend (PostgreSQL tables, verified via Alembic migrations)

```
Platform (no Academy concept in backend)
└── courses  (table: courses)
    └── chapters  (table: chapters, position auto-calculated)
        └── lessons  (table: lessons — frontend calls these "Sessions")
            └── lesson_blocks  (table: lesson_blocks)
                └── block_type_enum: TEXT | PDF | IMAGE | VIDEO | ATTACHMENT
```

**Assessment hierarchy (backend):**  
- `quizzes` table → `quiz_attempts` table → `results` table
- `assignments` table → submission flow
- No unified assessment model

**Question Bank (backend):**  
- `question_bank` module registered in `main.py`
- Question type enum has 7 values (not 28)

**User roles (backend Python `Role` enum — 10 values):**  
`admin`, `super_admin`, `teacher`, `assistant`, `student`, `parent`, `developer`, `content_manager`, `content_author`, `finance`

**User roles (PostgreSQL DB enum from migration 001 — 5 values):**  
`admin`, `teacher`, `assistant`, `student`, `parent`

### Frontend (`classz-frontend-prototype/`)

```
Platform
└── (no Academy UI concept)
    └── Course  (TeacherCourse in store — wired to API ✅)
        └── Chapter  (TeacherChapter in store — wired to API ✅)
            └── Session  (TeacherSession in store — wired to API as Lesson ✅)
                └── Content Blocks  (builder UI — in-memory only, not wired)
                    └── Concept  (content-tree-store.ts — in-memory only)
```

**User roles (frontend `roles.ts` — 10 values):**  
`student`, `teacher`, `assistant`, `parent`, `admin`, `developer`, `content`, `finance`, `superadmin`, `assistant_teacher`

---

## 6. Course / Chapter / Lesson (Session) Comparison

| Concept | Docs Say | Backend Has | Frontend Has | Status |
|---------|----------|-------------|--------------|--------|
| **Course** | Core entity, owned by teacher/academy | `courses` table, `POST/GET /api/courses` | `TeacherCourse`, wired to API | ✅ MATCH |
| **Chapter** | Groups lessons inside a course | `chapters` table, `POST/GET /api/chapters` | `TeacherChapter`, wired to API | ✅ MATCH |
| **Lesson** | Unit of learning inside chapter | `lessons` table (docs call it "Lesson") | Called "Session" in UI (D004 approved) | ✅ MATCH by design |
| **Session** | Frontend brand name for Lesson | Not a DB concept | `TeacherSession`, maps to `lessons` table | ✅ MATCH by design (D004) |
| **Course slug** | Unique URL-friendly identifier | `slug` column, unique constraint | Generated as `${title}-${timestamp-suffix}` | ✅ MATCH |
| **Position / Order** | Ordering within parent | Auto-calculated by COUNT on backend | Displayed as `position + 1` = `order` | ✅ MATCH |
| **Session `requires_previous_completion`** | Gating model in docs | Column exists in `lessons` table | Mapped as `requires_previous_completion` in API payload | ✅ MATCH |
| **Session price** | Sessions can be individually priced | No `price` column in `lessons` | `TeacherSession.price` field (mock, not persisted) | ⚪ MISSING |
| **Session `durationMinutes`** | Duration of a session | No `duration_minutes` column in `lessons` | `TeacherSession.durationMinutes` (mock, not persisted) | ⚪ MISSING |
| **Academy** | Multi-tenant container for courses | No `academies` table | `admin/academies` page exists with mock data | ⚪ MISSING |

---

## 7. Concept / Atomic Concept Comparison

| Concept | Docs Say | Backend Has | Frontend Has | Status |
|---------|----------|-------------|--------------|--------|
| **Concept** | Atomic unit of knowledge, the core engine of CLASSZ | `concepts` module directory exists in backend (`backend/app/modules/concepts/`) | `content-tree-store.ts` — in-memory Zustand store only | ⚪ MISSING (unverified whether tables exist in DB) |
| **Atomic Concept** | Smallest knowledge chunk — one fact, one idea | Not in any migration | Not in any frontend store | ⚪ MISSING |
| **Concept connections** | Graph between concepts (prerequisite, related) | Not in any migration | Not in any frontend store | ⚪ MISSING |
| **Concept inside Session** | Each block/concept is linked to the concept graph | No FK in `lesson_blocks` to concepts | `TeacherSession.conceptIds[]` field exists (empty array, not persisted) | ⚪ MISSING |
| **Concept analytics** | Teacher sees concept-level mastery | No tables | `/teacher/insights/concept-analytics` page with mock data | ⚪ MISSING |
| **Student Memory** | AI tracks per-concept retention | `student_memory` backend module exists | No frontend page wired to it | 🟡 PARTIAL (backend exists, frontend disconnected) |

**Verdict:** The Concept Engine is the most critical gap between documents and code. It is the stated core differentiator of CLASSZ per `CLASSZ_ARCHITECTURE.md` ("Concept Engine is CLASSZ's core innovation") but has no database tables and no wired frontend. Only the `content-tree-store.ts` in-memory store and `TeacherSession.conceptIds[]` placeholder fields acknowledge its existence.

---

## 8. Content Studio Comparison

### Block Types

| Block Type | Architecture Doc | Backend DB | Frontend Builder | Status |
|-----------|-----------------|-----------|-----------------|--------|
| TEXT / Rich Text | ✅ Listed (as RICH_TEXT in SESSION_CORE_BLOCKS) | `TEXT` enum value exists | Text block in builder | 🟡 PARTIAL — DB has TEXT, not RICH_TEXT; schema mismatch |
| VIDEO | ✅ Listed | `VIDEO` enum value exists in DB | Video block in builder | 🟡 PARTIAL — blocked by validator in schema.py |
| PDF | ✅ Listed | `PDF` enum value exists | PDF block in builder | ✅ MATCH |
| IMAGE | ✅ Listed | `IMAGE` enum value exists | Image block in builder | ✅ MATCH |
| ATTACHMENT | ✅ Listed | `ATTACHMENT` enum value exists | Attachment block in builder | ✅ MATCH |
| RICH_TEXT (separate from TEXT) | ✅ In SESSION_CORE_BLOCKS doc | ❌ Not in DB enum | In builder | ❌ CONFLICT — DB migration needed |
| QUIZ_EMBED | ✅ In SESSION_CORE_BLOCKS doc | ❌ Not in DB enum | In builder | ❌ CONFLICT — DB migration needed |
| ASSIGNMENT_EMBED | ✅ In SESSION_CORE_BLOCKS doc | ❌ Not in DB enum | In builder | ❌ CONFLICT — DB migration needed |
| DIVIDER | ✅ In SESSION_CORE_BLOCKS doc | ❌ Not in DB enum | In builder | ❌ CONFLICT — DB migration needed |
| CALLOUT | ✅ In SESSION_CORE_BLOCKS doc | ❌ Not in DB enum | In builder | ❌ CONFLICT — DB migration needed |
| CONCEPT_CARD | ✅ In SESSION_CORE_BLOCKS doc | ❌ Not in DB enum | Not confirmed in builder | ❌ CONFLICT |
| FLASHCARD | ✅ In SESSION_CORE_BLOCKS doc | ❌ Not in DB enum | Not confirmed in builder | ❌ CONFLICT |
| CODE_BLOCK | ✅ In SESSION_CORE_BLOCKS doc | ❌ Not in DB enum | In builder | ❌ CONFLICT — DB migration needed |
| TEACHING_UNIT | SESSION_CORE_BLOCKS doc only | ❌ Not in DB enum | Unknown | ❌ CONFLICT |

### Block type naming conflict

**`CLASSZ_SESSION_CORE_BLOCKS_ARCHITECTURE.md`** defines 12 types:  
`TEACHING_UNIT, CONCEPT_CARD, FLASHCARD, INTERACTIVE_EXERCISE, MEDIA_EMBED, CODE_BLOCK, DIVIDER, CALLOUT, QUIZ_EMBED, EXAM_EMBED, HOMEWORK_EMBED, PRACTICE_SET`

**`CLASSZ_SESSION_WORKSPACE_ARCHITECTURE.md`** defines 12 canvas blocks with different names:  
`Text, Rich Text, Video, Image, PDF, Code, Quiz, Assignment, Concept, Flashcard, Divider, Callout`

**These two documents are mutually inconsistent.** They were written at different times and define different vocabularies for the same feature. Neither matches the backend DB enum (5 values).

### Content Studio Tabs

| Tab | Architecture Doc | Backend | Frontend | Status |
|-----|-----------------|---------|----------|--------|
| Canvas (block builder) | ✅ Defined | Partially ready (5 block types) | ✅ UI exists | 🟡 PARTIAL — not wired |
| Quiz Builder | ✅ Defined | `quizzes` module exists | ✅ UI exists | 🟡 PARTIAL — not connected to sessions |
| Assessment settings | ✅ Defined | Partial (separate quiz/assignment) | ✅ UI exists | 🟡 PARTIAL |
| Access & Scheduling | ✅ Defined | `release_at`, `hide_at` on lessons | ✅ UI exists | ✅ MATCH (backend supports it) |
| Resources | ✅ Defined | Attachments in lesson_blocks | ✅ UI exists | 🟡 PARTIAL |
| Analytics tab | ✅ Defined | Progress module exists | ✅ UI exists | ⚪ MISSING — not wired |
| Settings tab | ✅ Defined | Some fields on lessons | ✅ UI exists | 🟡 PARTIAL |
| Preview tab | ✅ Defined | No backend needed | ✅ UI exists | ✅ MATCH |

### Content Studio operations

| Operation | Backend | Status |
|-----------|---------|--------|
| Create block | `POST /api/lesson-blocks` (client must supply position) | ⚪ Not wired — auto-position missing |
| Read blocks | `GET /api/lesson-blocks?lesson_id=<uuid>` | ⚪ Not wired |
| Update block | ❌ No PATCH endpoint | ❌ CONFLICT — update is in the UI but no API |
| Delete block | ❌ No DELETE endpoint | ❌ CONFLICT — delete is in the UI but no API |
| Reorder blocks | ❌ No reorder endpoint | ❌ CONFLICT |

---

## 9. Teacher Journey Comparison

| Step | Docs Say | Backend | Frontend | Status |
|------|----------|---------|----------|--------|
| Register | Auth flow | `POST /api/auth/register` | ✅ Wired | ✅ MATCH |
| Login | Auth flow | `POST /api/auth/login` → JWT | ✅ Wired | ✅ MATCH |
| Create course | Teacher creates course with title, subject, grade | `POST /api/courses` | ✅ Wired (Milestone 1) | ✅ MATCH |
| Create chapter | Teacher adds chapter to course | `POST /api/chapters` | ✅ Wired (Milestone 2) | ✅ MATCH |
| Create session | Teacher creates session inside chapter | `POST /api/lessons` | ✅ Wired (Milestone 3) | ✅ MATCH |
| Build content | Teacher adds blocks to session | `POST /api/lesson-blocks` (exists) | ❌ Not wired | ⚪ MISSING |
| Attach quiz | Teacher embeds quiz in session | Quiz module exists | Not connected to Content Studio | ⚪ MISSING |
| Publish session | Teacher publishes for students | No `status` field on `lessons` | UI has publish button (mock) | ❌ CONFLICT — status exists in frontend, not in backend |
| Teacher dashboard | Summary stats for teacher | `GET /api/teacher-dashboard/summary` | ⚪ Not wired to real data | 🟡 PARTIAL |
| View student submissions | Teacher grades student work | `GET /api/grading/pending`, `POST /api/grading/{id}/grade` | Pages exist with mock data | 🟡 PARTIAL (API Only per mapping doc) |
| Revenue / Business | Teacher tracks earnings | `wallets` module is empty stub | UI fully built with mock data | ⚪ MISSING |
| Team management | Teacher manages assistant teachers | No backend module | UI fully built with mock data | ⚪ MISSING |
| Student analytics | Teacher views per-concept mastery | No wired endpoints | UI built with mock data | ⚪ MISSING |

---

## 10. Student Journey Comparison

| Step | Docs Say | Backend | Frontend | Status |
|------|----------|---------|----------|--------|
| Register / Login | Auth flow | ✅ Auth wired | ✅ Wired | ✅ MATCH |
| Browse courses | Student sees course catalog | `GET /api/courses` | Page exists with mock data | 🟡 PARTIAL — API exists, not wired |
| Enroll in course | Student joins a course | ❌ No `enrollments` table or module | No enrollment page | ⚪ MISSING |
| View enrolled courses | Student's course list | ❌ Enrollment doesn't exist | Page exists with mock data | ⚪ MISSING |
| Open a lesson | Student opens session/lesson content | `GET /api/lesson-blocks?lesson_id=<uuid>` | Student lesson player page exists | 🟡 PARTIAL — API exists, not wired in prototype |
| Watch video | Student watches lesson video | `videos` table + endpoint exists | Video block in lesson player | 🟡 PARTIAL — not wired in prototype |
| Take quiz | Student takes a quiz | `POST /api/quiz-attempts/start` etc. | Quiz player page exists | 🟡 PARTIAL — wired in old `frontend/`, not in prototype |
| Progress tracking | Student sees completion status | `POST /api/progress/start/update/complete` | Student progress page has mock data | 🟡 PARTIAL — API exists, not wired in prototype |
| Leaderboard | Student sees rankings | No backend endpoint | Page with mock data | ⚪ MISSING |
| Certificates | Student earns and downloads certs | No backend module | Page with mock data | ⚪ MISSING |
| Student Wallet | Student earns/redeems points | `wallets` module is empty stub | Wallet page with mock data | ⚪ MISSING |
| Smart Revision | AI-powered spaced repetition | `revision_plans` module exists | `/student/revision` page with mock data | 🟡 PARTIAL |
| AI Assistant | Personalized AI tutor | `ai_content` + `ai_core` modules exist | `/assistant` pages exist | 🟡 PARTIAL — backend needs `ai_core` config |

**Critical gap: There is no enrollment system.** Without enrollments, the concept of "a student's courses" doesn't exist in the database. This blocks the entire student journey.

---

## 11. Roles and Permissions Comparison

### Role definitions across three sources

| Role | Architecture Doc | Python `Role` enum | PostgreSQL DB (migration 001) | Frontend `roles.ts` |
|------|-----------------|-------------------|-------------------------------|---------------------|
| Student | ✅ | `student` | `student` | `student` |
| Teacher | ✅ | `teacher` | `teacher` | `teacher` |
| Assistant Teacher | ✅ | `assistant` | `assistant` | `assistant_teacher` |
| Parent | ✅ | `parent` | `parent` | `parent` |
| Admin | ✅ | `admin` | `admin` | `admin` |
| Super Admin | ✅ | `super_admin` | ❌ Not in DB | `superadmin` |
| Developer | ❌ Not mentioned | `developer` | ❌ Not in DB | `developer` |
| Content Manager | ❌ Not mentioned | `content_manager` | ❌ Not in DB | `content` |
| Content Author | ❌ Not mentioned | `content_author` | ❌ Not in DB | ❌ Not in frontend |
| Finance | ❌ Not mentioned | `finance` | ❌ Not in DB | `finance` |
| AI Assistant | ✅ (as role) | ❌ Not in Python model | ❌ Not in DB | `assistant` (nav role) |

### Key mismatches in roles

1. **DB vs. Python (BLOCKER):** Migration 001 created 5 enum values. The Python `Role` enum has 10 values. Any user registered with a role not in the DB enum (`super_admin`, `developer`, `content_manager`, `content_author`, `finance`) will cause a PostgreSQL enum constraint violation on write. The DB must be migrated with `ALTER TYPE role_enum ADD VALUE`.

2. **Frontend `assistant` vs. backend `assistant`:** Frontend uses `assistant` as a nav role for the AI chatbot interface. Backend uses `assistant` for human Assistant Teachers. These are two different things sharing the same string value.

3. **Frontend `assistant_teacher` has no backend match:** Frontend `roles.ts` defines `assistant_teacher` as a role key. Backend Python enum has `assistant`. No mapping exists.

4. **`content_author` is in Python model but not in frontend:** This role has no frontend experience defined.

5. **Architecture doc defines 6 roles; code has 10 backend + 10 frontend.** The architecture document is not the source of truth for roles. Decision D006 (`docs/DECISIONS.md`) is the actual source of truth.

### Auth guards

| Area | Protection | Status |
|------|-----------|--------|
| Teacher routes | `teacher.tsx` `beforeLoad` guard → redirects unauthenticated users | ✅ Implemented (added this cycle) |
| Student routes | `beforeLoad` guard (pre-existing) | ✅ Implemented |
| Admin routes | ❌ No route-level guard | ❌ MISSING |
| Content routes | ❌ No route-level guard | ❌ MISSING |
| Backend endpoints | Only `/api/auth/me` uses `get_current_user` dependency | ❌ CONFLICT — most API endpoints are unprotected |

---

## 12. Major Mismatches

| # | Area | Mismatch | Severity |
|---|------|----------|----------|
| **M1** | Role enum | DB has 5 roles; Python model has 10. Registering `super_admin`, `developer`, `content_manager`, `content_author`, or `finance` users will crash at the DB layer. | 🔴 BLOCKER |
| **M2** | Enrollment | Architecture requires enrollments as the gateway to student access. No enrollment table, module, or API endpoint exists anywhere. The entire student learning journey depends on this. | 🔴 BLOCKER |
| **M3** | Backend auth | Only `/api/auth/me` is protected. All course, chapter, lesson, quiz, and assignment endpoints accept requests from unauthenticated callers. | 🔴 BLOCKER |
| **M4** | Block types (two docs conflict) | `CLASSZ_SESSION_CORE_BLOCKS_ARCHITECTURE.md` and `CLASSZ_SESSION_WORKSPACE_ARCHITECTURE.md` define 12 block types each with different names. Backend has 5. Frontend has ~9. No single source of truth for block type vocabulary. | 🔴 BLOCKER |
| **M5** | Concept Engine | Described as CLASSZ's core innovation in `CLASSZ_ARCHITECTURE.md`. No DB tables. No API endpoints. No frontend integration. Only in-memory placeholders. | 🟠 HIGH |
| **M6** | Content Studio not wired | The Content Studio block builder is complete UI but sends no API calls. `PATCH /api/lesson-blocks` and `DELETE /api/lesson-blocks` don't exist. Auto-position on create is missing. Blocks are not persisted. | 🟠 HIGH |
| **M7** | Session publish status | Frontend has `session.status` with values `draft/published/archived`. Backend `lessons` table has no `status` column. Publishing does nothing at the DB level. | 🟠 HIGH |
| **M8** | Assistant role naming | Frontend `assistant` role = AI chatbot. Frontend `assistant_teacher` role = human assistant. Backend `assistant` value = human assistant. String collision between roles. | 🟠 HIGH |
| **M9** | Unified Assessment vs. separate modules | Architecture doc requires a unified `TeacherAssessment` model. Backend has separate `quizzes`, `assignments`, `quiz_attempts`, `results`. Frontend has old quiz/assignment stores AND a new `teacher-assessment-store`. Three different models for the same concept. | 🟠 HIGH |
| **M10** | `session.price` and `durationMinutes` | Frontend `TeacherSession` has `price` and `durationMinutes` fields. Backend `lessons` table has neither column. These fields are never persisted. | 🟡 MEDIUM |
| **M11** | Student journey uses deprecated `frontend/` | Quiz player, lesson player, and progress tracking are wired in the old `frontend/` app (deprecated per D001), not in `classz-frontend-prototype/`. | 🟡 MEDIUM |
| **M12** | Public code system | Architecture and `CLASSZ_CONTENT_STUDIO_CORE_ARCHITECTURE.md` document an immutable public code system for 14 entity types. Only `users` has a real `public_code` column (migration 202606210001). Courses, chapters, sessions use `SES-${id.slice(0,8)}` style mock codes generated in frontend only. | 🟡 MEDIUM |
| **M13** | Teacher dashboard not wired | Backend has `GET /api/teacher-dashboard/summary`, `pending-tasks`, `recent-activity`. Frontend teacher dashboard shows hardcoded mock data and does not call these endpoints. | 🟡 MEDIUM |
| **M14** | 28 question types vs. 7 | Question bank architecture documents 28 types. Backend implements 7. | 🟡 MEDIUM |
| **M15** | Academy / multi-tenancy | Architecture describes Academy as the multi-tenant container. No `academies` table exists in any migration. Frontend admin pages for academies exist with mock data. | 🟡 MEDIUM |

---

## 13. Decisions That Need Dr. Ahmed's Approval

The following are open questions where the documents conflict and no authoritative decision exists. A product decision — not a technical one — is needed for each.

---

### Decision A — Which block type vocabulary is canonical?

**The conflict:**  
- `CLASSZ_SESSION_CORE_BLOCKS_ARCHITECTURE.md` defines 12 types with names like `TEACHING_UNIT`, `CONCEPT_CARD`, `MEDIA_EMBED`
- `CLASSZ_SESSION_WORKSPACE_ARCHITECTURE.md` defines 12 types with names like `Text`, `Rich Text`, `Video`, `Concept`, `Flashcard`
- The backend DB has 5 types: `TEXT`, `PDF`, `IMAGE`, `VIDEO`, `ATTACHMENT`
- The frontend builder currently uses ~9 names that partially match both documents

**Options:**
1. Use the SESSION_CORE_BLOCKS vocabulary — semantically richer, aligned with the Concept Engine
2. Use the SESSION_WORKSPACE vocabulary — simpler, closer to what exists today
3. Start with the 5 DB types and add only what's needed for MVP

**Why it matters:** Whichever vocabulary is chosen becomes the permanent DB enum. PostgreSQL native enums cannot have values removed after creation.

---

### Decision B — When does the Concept Engine get built?

**The conflict:**  
`CLASSZ_ARCHITECTURE.md` calls the Concept Engine "the core innovation." But it has zero backend tables and zero wired frontend. Building it is a major undertaking.

**Options:**
1. Build it now, before or alongside Content Studio (blocks become Concept-aware from day one)
2. Defer it to after MVP launch — ship Session blocks without concept linking, add concept graph later
3. Keep it as an in-memory prototype (current state) and never build the backend

**Why it matters:** If deferred, the `TeacherSession.conceptIds[]` and `content-tree-store.ts` become permanent placeholders. If built now, it changes the block schema and the session builder significantly.

---

### Decision C — Unified Assessment or keep separate quiz/assignment?

**The conflict:**  
`CLASSZ_ASSESSMENT_ENGINE_CORE_ARCHITECTURE.md` specifies a single unified `TeacherAssessment` model replacing the current separate `quizzes`, `assignments`, `quiz_attempts` models. A new `teacher-assessment-store` has been started in the frontend.

**Options:**
1. Proceed with unification — delete old quiz/assignment stores, build the unified model
2. Keep separate quiz and assignment as-is — they work today, unification is a refactor risk
3. Wrap — keep the backend models unchanged but present them through a unified frontend UI

**Why it matters:** Option 1 requires new backend tables or major schema changes. Option 2 leaves three models for one concept. Option 3 may be the pragmatic MVP path.

---

### Decision D — Role string values: fix the collision

**The conflict:**  
Frontend `assistant` = AI chatbot role (nav destination: `/assistant`).  
Backend `assistant` = human Assistant Teacher.  
Frontend `assistant_teacher` = human Assistant Teacher.  
These cannot be unified without renaming one of them.

**Options:**
1. Rename backend `assistant` → `assistant_teacher` (matches frontend `assistant_teacher`, but requires DB migration and Python model change)
2. Rename frontend AI chatbot role from `assistant` to something else (e.g., `ai_assistant`) — no DB change
3. Leave the collision and document it as UI-only split

**Why it matters:** When authentication is enforced, the backend will reject `assistant_teacher` tokens because that string value doesn't exist in the DB enum.

---

### Decision E — When does enrollment get built?

**The conflict:**  
Without an `enrollments` table, there is no way to:
- Know which students have access to which courses
- Show a student their enrolled courses
- Gate lesson access by enrollment
- Track progress per student per course

**Options:**
1. Build enrollment before wiring the student journey (blocking the student milestone)
2. Ship with open access (any authenticated student sees all courses) temporarily, add enrollment later
3. Use a placeholder: store enrollment in a JSON column on the user record until a real table is built

**Why it matters:** Every student-facing milestone depends on this answer.

---

### Decision F — Fix backend auth guard coverage before or after MVP features?

**The conflict:**  
Currently only `/api/auth/me` has a backend auth guard. All course, chapter, lesson, and block creation endpoints are publicly accessible to any HTTP client. The security gap is real.

**Options:**
1. Fix all endpoints now (add `current_user: User = Depends(get_current_user)` to every protected router) — blocks progress on features but closes security hole
2. Fix teacher-facing write endpoints now, fix read endpoints later
3. Defer until deployment — acceptable for development, not for staging

**Why it matters:** This is a security issue, not a feature issue. Deploying to any shared environment with open endpoints is a risk.

---

## 14. Source of Truth Recommendation

### What should be the authoritative source for each area:

| Area | Recommended Source of Truth | Why |
|------|----------------------------|-----|
| **Which frontend is production** | `docs/DECISIONS.md` D001 | Unambiguous: `classz-frontend-prototype/` is production |
| **Naming convention (Session=Lesson)** | `docs/DECISIONS.md` D004 | Enforced and working. Do not revisit. |
| **Role definitions** | `docs/DECISIONS.md` D006 | Most up-to-date. Must be reconciled with the DB enum (see Decision D above). |
| **Product hierarchy (Course→Chapter→Session→Blocks)** | `docs/DECISIONS.md` D004 + actual code | The 4-level hierarchy is implemented and stable. CLASSZ_ARCHITECTURE.md's 5-level (with Concept) is aspirational. |
| **Block type vocabulary** | **Needs Decision A** | Two documents conflict. Neither matches the backend. A decision is required before Milestone 4. |
| **Assessment model** | **Needs Decision C** | Three models exist for one concept. |
| **API endpoint registry** | `docs/API_FRONTEND_MAPPING.md` | Accurate as of July 2026. Should be kept updated after each milestone. |
| **Integration progress** | `CLASSZ_INTEGRATION_AUDIT.md` + Milestone reports | Current and maintained by this integration cycle. |
| **Backend schema** | Alembic migrations (ground truth) | The migrations are the only reliable statement of what is actually in PostgreSQL. |
| **Frontend routes** | `classz-frontend-prototype/src/routeTree.gen.ts` | Auto-generated by TanStack Router; always accurate. |

### Documents that should be archived or reconciled

| Document | Action |
|----------|--------|
| `CLASSZ_ARCHITECTURE.md` | Keep as vision, but label it aspirational. Do not treat hierarchy section as implementation spec until Concept Engine decision is made. |
| `CLASSZ_SESSION_CORE_BLOCKS_ARCHITECTURE.md` | Supersede or superseded by `CLASSZ_SESSION_WORKSPACE_ARCHITECTURE.md` — Dr. Ahmed must pick one. Both cannot be active simultaneously. |
| `CLASSZ_SESSION_WORKSPACE_ARCHITECTURE.md` | Same as above. |
| `docs/MASTER_PLAN.md` | Archive. 15-phase plan does not match the actual implementation order. The integration roadmap in `CLASSZ_INTEGRATION_AUDIT.md` is the real plan. |
| `CLASSZ_HANDOFF_2026-06-20.md` | Archive. Covers work on the deprecated `frontend/` app. |

---

## Summary Scorecard

| Area | Status |
|------|--------|
| Course creation | ✅ MATCH — fully wired |
| Chapter creation | ✅ MATCH — fully wired |
| Session creation | ✅ MATCH — wired as Lesson |
| Content Studio blocks | ❌ CONFLICT — block types inconsistent across 3 documents, none wired to API |
| Concept Engine | ⚪ MISSING — largest documented feature with zero backend implementation |
| Assessment | 🟡 PARTIAL — separate modules exist, unified model not built |
| Question Bank | 🟡 PARTIAL — 7 of 28 types implemented |
| Enrollment | ⚪ MISSING — no table, no module, blocks entire student journey |
| Student journey | 🟡 PARTIAL — wired in deprecated `frontend/`, not in `classz-frontend-prototype/` |
| Teacher dashboard | 🟡 PARTIAL — API exists, frontend not wired |
| Roles | ❌ CONFLICT — DB has 5, Python has 10, frontend has 10, naming collisions exist |
| Backend auth guards | ❌ CONFLICT — only 1 of ~30+ endpoints is protected |
| Public code system | 🟡 PARTIAL — users have real codes, all other entities use mock codes |
| Academy / multi-tenancy | ⚪ MISSING — no backend tables |
| AI / Concept analytics | ⚪ MISSING — modules exist but not wired |
| Payments / Wallet | ⚪ MISSING — empty stubs |
