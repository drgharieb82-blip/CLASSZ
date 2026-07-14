# CLASSZ Platform — Architectural Launch Roadmap
**Lead Software Architect Analysis — July 2026**
**Status: Pre-Launch | Two-Frontend Architecture | ~28% Integration Complete**

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-architecture-overview)
3. [Critical Blockers](#critical-blockers)
4. [Feature Matrix — All 7 Dimensions](#feature-matrix)
5. [Dependency Graph](#dependency-graph)
6. [User Flow Analysis](#user-flow-analysis)
7. [Unified Launch Roadmap](#unified-launch-roadmap)

---

## 1. Executive Summary

CLASSZ is a two-frontend EdTech platform with a FastAPI/PostgreSQL backend. The prototype frontend (`classz-frontend-prototype/`) has 211 routes with complete UX but **zero backend integration beyond login**. The secondary frontend (`frontend/`) has 20 routes with real API integration but incomplete UI. The backend is structurally strong — quiz attempts, auto-grading, progress tracking, and anti-cheating are production-complete — but has **5 missing GET endpoints**, **1 critical schema bug**, and **2 empty service stubs** (payments, wallets).

**Overall launch readiness: ~28%**

The platform cannot launch today due to:
- Teacher data lives only in localStorage — it is never persisted to the database
- No user can see their own content after logging in on a different device
- The PostgreSQL `role_enum` in the database has 5 values; the Python model defines 10 — registration for 5 roles will crash the database with a constraint error
- Teacher, admin, parent, and content routes have no authentication guard — any URL is publicly accessible without login

**Minimum path to v1 launch: 14 integration tasks, estimated 112–140 hours of engineering work**

---

## 2. System Architecture Overview

### Two-Frontend Architecture

| | `classz-frontend-prototype/` | `frontend/` |
|---|---|---|
| Routes | 211 | 20 |
| Purpose | UX prototype / demo | Real integration |
| State | Zustand + localStorage | React Query + backend |
| Auth | Real login; dev bypass tokens | Real login |
| Data | Mock seed + localStorage | Real API |
| Teacher | All UX built, no API calls | Not built |
| Student | All UX built, no API calls | Quiz player only |
| Backend calls | `POST /api/auth/login` only | Full quiz flow |
| **Status** | **Production UX, zero data persistence** | **Working slice, incomplete UI** |

### Backend Module Status

| Module | Router Registered | GET List | GET By ID | POST | PATCH/PUT | DELETE | Auth Guard |
|---|---|---|---|---|---|---|---|
| auth | YES | N/A | `/me` | login, register | — | — | `/me` only |
| courses | YES | YES | YES | YES | **MISSING** | — | **NONE** |
| chapters | YES | **MISSING** | — | YES | — | — | **NONE** |
| lessons | YES | **MISSING** | — | YES | — | — | **NONE** |
| lesson_blocks | YES | YES (filter) | YES | YES | — | — | **NONE** |
| quizzes | YES | YES | YES | YES | — | — | **NONE** |
| questions | YES | YES | YES | YES | — | — | **NONE** |
| quiz_attempts | YES | — | YES | start/answer/submit | — | — | **NONE** |
| results | YES | YES | YES | — | — | — | **NONE** |
| progress | YES | — | YES | start/update/complete | — | — | **NONE** |
| enrollments | YES | YES | — | YES | — | — | **NONE** |
| anti_cheating | YES | YES (by attempt) | — | events/auto-submit | — | — | **NONE** |
| grading | YES | YES (pending) | YES | grade/return | — | — | **NONE** |
| assignments | YES | partial | partial | YES | — | — | **NONE** |
| submissions | YES | partial | partial | YES | — | — | **NONE** |
| videos | YES | — | — | signed-upload | — | — | **NONE** |
| payments | YES (registered) | **EMPTY STUB** | **EMPTY STUB** | **EMPTY STUB** | **EMPTY STUB** | **EMPTY STUB** | **NONE** |
| wallets | YES (registered) | **EMPTY STUB** | **EMPTY STUB** | **EMPTY STUB** | **EMPTY STUB** | **EMPTY STUB** | **NONE** |
| notifications | **NOT registered** | — | — | — | — | — | — |
| parents | **NOT registered** | — | — | — | — | — | — |
| reports | **NOT registered** | — | — | — | — | — | — |
| ai_content | **NOT registered** | — | — | — | — | — | — |

---

## 3. Critical Blockers

These are hard stops. The platform **cannot deploy** without resolving all 6.

### BLOCKER 1: PostgreSQL Role Enum Mismatch
**Severity: CRITICAL — Database crash on registration for 5 roles**

The first Alembic migration creates `role_enum` with only 5 values:
```
admin, teacher, assistant, student, parent
```
The Python `User` model defines 10 roles:
```
admin, super_admin, teacher, assistant, student, parent, developer, content_manager, content_author, finance
```
Any attempt to insert a user with `role = 'super_admin'`, `'developer'`, `'content_manager'`, `'content_author'`, or `'finance'` will raise a PostgreSQL `invalid input value for enum` error and crash the registration endpoint.

**Required fix:** Write a new Alembic migration to `ALTER TYPE role_enum ADD VALUE` for each of the 5 missing roles.
**Files:** `backend/alembic/versions/202606120001_create_users_table.py`, new migration file
**Effort:** 1 hour

---

### BLOCKER 2: Missing GET /api/chapters?course_id=
**Severity: CRITICAL — Entire teacher flow is blocked**

The chapters router only has `POST /api/chapters`. There is no endpoint to list chapters for a course. The teacher cannot load their own chapters after creating them. No chapter = no lesson = no content.

**Required fix:** Add `GET /api/chapters?course_id=<uuid>` route to chapters router and service.
**Files:** `backend/app/modules/chapters/router.py`, `backend/app/modules/chapters/service.py`, `backend/app/modules/chapters/schemas.py`
**Effort:** 2–3 hours

---

### BLOCKER 3: Missing GET /api/lessons?chapter_id=
**Severity: CRITICAL — Lesson player is broken**

The lessons router only has `POST /api/lessons`. There is no endpoint to list lessons for a chapter. The student course player cannot load lessons. The quiz cannot know which lesson it belongs to.

**Required fix:** Add `GET /api/lessons?chapter_id=<uuid>` route to lessons router and service.
**Files:** `backend/app/modules/lessons/router.py`, `backend/app/modules/lessons/service.py`, `backend/app/modules/lessons/schemas.py`
**Effort:** 2–3 hours

---

### BLOCKER 4: No Authentication Guard on Teacher, Admin, Parent Routes
**Severity: CRITICAL — Security breach — any URL accessible without login**

Only `student.tsx` (root layout for student routes) has a `beforeLoad` auth guard in the prototype frontend:
```typescript
// student.tsx
beforeLoad: () => {
  if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: "/login" });
}
```
The files `teacher.tsx`, `admin.tsx`, `parent.tsx`, and `content.tsx` have **no such guard**. Any unauthenticated user can navigate directly to `/teacher/workspace`, `/admin/users`, `/parent/dashboard`, etc.

**Required fix:** Add identical `beforeLoad` guards to `teacher.tsx`, `admin.tsx`, `parent.tsx`, `content.tsx`.
**Files:** All root layout route files for protected areas
**Effort:** 1 hour

---

### BLOCKER 5: All Teacher Data Lost on Device Switch (No API Persistence)
**Severity: CRITICAL — Core product value cannot be delivered**

All 11 teacher Zustand stores write exclusively to `localStorage`. Not one of them calls a backend API. Every course, chapter, session, question, and quiz a teacher creates is trapped on a single browser on a single device. If the teacher logs in from another device, all data is gone. If `localStorage` is cleared, all data is gone. Students cannot access content the teacher created because it was never saved to the database.

The seed function `seedTeacherData()` runs on every ContentStudio page load and populates localStorage with mock data — meaning even the mock data teachers see is not real.

**Required fix:** This is the largest integration task — wire all 11 teacher stores to call real API endpoints on every mutation.
**Files:** All 11 teacher stores in `classz-frontend-prototype/src/lib/teacher/`, new API client functions
**Effort:** 40–60 hours

---

### BLOCKER 6: Question Bank Requires category_id with No Category Management API
**Severity: CRITICAL — Cannot create any question**

The `POST /api/questions` endpoint schema requires a `category_id` (UUID foreign key to `QuestionCategory`). However, there is no `GET /api/question-categories` or `POST /api/question-categories` endpoint anywhere in the backend. The database has a `question_categories` table, but it can only be populated by direct database seed — there is no API surface to create or list categories.

Any frontend that tries to create a question without a valid `category_id` UUID will get a 422 validation error or a foreign key constraint violation.

**Required fix:** Add question category endpoints (`GET /api/question-categories`, `POST /api/question-categories`) and seed default categories on startup, OR make `category_id` nullable in the question schema.
**Files:** `backend/app/modules/question_bank/router.py`, `backend/app/modules/question_bank/service.py`, `backend/app/modules/question_bank/schemas.py`
**Effort:** 3–4 hours

---

## 4. Feature Matrix

All features analyzed across 7 dimensions: UI Complete / Backend Complete / Database Complete / Connected / Missing / Prod-Ready / Launch Blocker

### Authentication & User Management

| Feature | UI ✓ | Backend ✓ | DB ✓ | Connected | Missing | Prod-Ready | Blocks Launch |
|---|---|---|---|---|---|---|---|
| Login | YES | YES | YES | YES | — | YES | — |
| Register | YES | YES | NO | PARTIAL | role_enum migration | NO | **YES — BLOCKER 1** |
| Password Reset | YES (UI link) | NO | NO | NO | Full flow | NO | For launch |
| Get Current User | YES | YES | YES | YES | — | YES | — |
| Role-Based Access | UI routes exist | NO | PARTIAL | NO | Auth guards on routes | NO | **YES — BLOCKER 4** |
| Dev Bypass Tokens | N/A | N/A | N/A | N/A | Remove before prod | NO | Must remove |

### Course Management (Teacher)

| Feature | UI ✓ | Backend ✓ | DB ✓ | Connected | Missing | Prod-Ready | Blocks Launch |
|---|---|---|---|---|---|---|---|
| Create Course | YES | YES | YES | **NO** | Wire store to API | NO | **YES** |
| List My Courses | YES | YES | YES | **NO** | Wire store to API | NO | **YES** |
| Edit Course | YES | **PARTIAL** | YES | **NO** | `PATCH /api/courses/{id}` missing, wire | NO | **YES** |
| Publish Course | YES | **NO** | NO | **NO** | Publish endpoint + status field | NO | **YES** |
| Delete Course | YES | **NO** | NO | **NO** | `DELETE /api/courses/{id}` | NO | Later |

### Chapter Management (Teacher)

| Feature | UI ✓ | Backend ✓ | DB ✓ | Connected | Missing | Prod-Ready | Blocks Launch |
|---|---|---|---|---|---|---|---|
| Create Chapter | YES | YES | YES | **NO** | Wire store to API | NO | **YES** |
| List Chapters | YES | **NO** | YES | **NO** | GET endpoint + wire | NO | **YES — BLOCKER 2** |
| Reorder Chapters | YES | **NO** | NO | **NO** | Order endpoint | NO | Later |

### Lesson Management (Teacher)

| Feature | UI ✓ | Backend ✓ | DB ✓ | Connected | Missing | Prod-Ready | Blocks Launch |
|---|---|---|---|---|---|---|---|
| Create Lesson | YES | YES | YES | **NO** | Wire store to API | NO | **YES** |
| List Lessons | YES | **NO** | YES | **NO** | GET endpoint + wire | NO | **YES — BLOCKER 3** |
| Add Lesson Blocks | YES | YES | YES | **NO** | Wire to API | NO | **YES** |
| Video Upload | YES | YES (signed URL) | YES | **NO** | Frontend upload flow | NO | **YES** |

### Session Builder (Teacher) — Prototype-specific term for Lesson

| Feature | UI ✓ | Backend ✓ | DB ✓ | Connected | Missing | Prod-Ready | Blocks Launch |
|---|---|---|---|---|---|---|---|
| Build Session button | **YES (just fixed)** | maps to lesson | YES | **NO** | API wiring | NO | **YES** |
| Session Overview tab | YES | maps to lesson | YES | **NO** | API wiring | NO | **YES** |
| Session Content tab | YES | maps to lesson_blocks | YES | **NO** | API wiring | NO | **YES** |
| Session Quiz tab | YES | maps to quizzes | YES | **NO** | API wiring | NO | **YES** |

### Question Bank (Teacher)

| Feature | UI ✓ | Backend ✓ | DB ✓ | Connected | Missing | Prod-Ready | Blocks Launch |
|---|---|---|---|---|---|---|---|
| Create Question | YES | YES | YES | **NO** | category_id API, wire store | NO | **YES — BLOCKER 6** |
| List Questions | YES | YES | YES | **NO** | Wire store | NO | **YES** |
| Question Types | YES (7 types) | YES (7 types) | YES | **NO** | Wire | NO | **YES** |

### Quiz Builder (Teacher)

| Feature | UI ✓ | Backend ✓ | DB ✓ | Connected | Missing | Prod-Ready | Blocks Launch |
|---|---|---|---|---|---|---|---|
| Create Quiz | YES | YES | YES | **NO** | Wire store | NO | **YES** |
| Add Questions to Quiz | YES | YES | YES | **NO** | Wire store | NO | **YES** |
| Quiz Settings | YES | PARTIAL | YES | **NO** | Wire; time_limit, passing_score fields exist | NO | **YES** |

### Student Enrollment

| Feature | UI ✓ | Backend ✓ | DB ✓ | Connected | Missing | Prod-Ready | Blocks Launch |
|---|---|---|---|---|---|---|---|
| Course Discovery | YES (mock) | YES | YES | **NO** | Wire course list | NO | **YES** |
| Enroll in Course | YES (mock) | YES | YES | **NO** | Wire enrollment | NO | **YES** |
| Free Enrollment | YES | YES | YES | **NO** | Wire | NO | **YES** |
| Paid Enrollment | YES (UI) | **EMPTY STUB** | NO | NO | Entire payments module | NO | Post-launch |

### Student Lesson Player

| Feature | UI ✓ | Backend ✓ | DB ✓ | Connected | Missing | Prod-Ready | Blocks Launch |
|---|---|---|---|---|---|---|---|
| Display lesson content | YES (mock) | YES | YES | **NO** | Wire lesson/block API | NO | **YES** |
| Video playback | YES (mock) | YES (signed) | YES | **NO** | Wire video API | NO | **YES** |
| Track progress | YES (mock) | **YES** | YES | **NO** | Wire progress API | NO | **YES** |

### Quiz / Assessment (Student)

| Feature | UI ✓ | Backend ✓ | DB ✓ | Connected | Missing | Prod-Ready | Blocks Launch |
|---|---|---|---|---|---|---|---|
| Start quiz attempt | **YES** (frontend/) | **YES** | YES | **YES** (frontend/) | Replace hardcoded studentId | **NEARLY** | **YES** |
| Answer questions | **YES** (frontend/) | **YES** | YES | **YES** (frontend/) | — | YES | — |
| Submit attempt | **YES** (frontend/) | **YES** | YES | **YES** (frontend/) | — | YES | — |
| Auto-grading engine | N/A | **YES** | YES | YES | — | YES | — |
| Anti-cheating | YES (frontend/) | **YES** | YES | **YES** (frontend/) | — | YES | — |
| View result | YES (mock, prototype) | **YES** | YES | **NO** (prototype) | Wire result API | NO | **YES** |

### Manual Grading (Teacher)

| Feature | UI ✓ | Backend ✓ | DB ✓ | Connected | Missing | Prod-Ready | Blocks Launch |
|---|---|---|---|---|---|---|---|
| View pending essays | YES (mock) | **YES** | YES | **NO** | Wire grading API | NO | Post-launch |
| Grade submission | YES (mock) | **YES** | YES | **NO** | Wire | NO | Post-launch |
| Return grade to student | YES (mock) | **YES** | YES | **NO** | Wire | NO | Post-launch |

### Progress Tracking

| Feature | UI ✓ | Backend ✓ | DB ✓ | Connected | Missing | Prod-Ready | Blocks Launch |
|---|---|---|---|---|---|---|---|
| Lesson start tracking | YES (mock) | **YES** | YES | **NO** | Wire | NO | **YES** |
| Progress update | YES (mock) | **YES** | YES | **NO** | Wire | NO | **YES** |
| Lesson complete | YES (mock) | **YES** | YES | **NO** | Wire | NO | **YES** |
| Course completion % | YES (mock, computed) | PARTIAL | YES | **NO** | Aggregation query | NO | Later |

### Admin Panel

| Feature | UI ✓ | Backend ✓ | DB ✓ | Connected | Missing | Prod-Ready | Blocks Launch |
|---|---|---|---|---|---|---|---|
| User management | YES | PARTIAL | YES | **NO** | Admin user endpoints | NO | Later |
| Course moderation | YES | PARTIAL | YES | **NO** | Wire | NO | Later |
| Role management | YES | **NO** | **NO** (enum mismatch) | NO | Fix enum, add endpoints | NO | After BLOCKER 1 |
| Analytics/Reports | YES (mock) | **NOT REGISTERED** | NO | NO | Full module | NO | Post-launch |

### Payments & Finance

| Feature | UI ✓ | Backend ✓ | DB ✓ | Connected | Missing | Prod-Ready | Blocks Launch |
|---|---|---|---|---|---|---|---|
| Course purchase | YES (mock) | **EMPTY STUB** | NO | NO | Entire payments module | NO | Post-launch |
| Wallet system | YES (mock) | **EMPTY STUB** | NO | NO | Entire wallets module | NO | Post-launch |
| Teacher revenue | YES (mock) | **NO** | NO | NO | Financial reporting | NO | Post-launch |

---

## 5. Dependency Graph

Reading: **A → B** means "A must be done before B can work"

```
BLOCKER 1: Fix role enum migration
  → User registration works for all roles
    → Admin can create content_manager accounts
    → Teacher registration works reliably

BLOCKER 4: Auth guards on all protected routes
  → Platform is not publicly exploitable
    → Safe to launch with real users

BLOCKER 2: GET /api/chapters?course_id=
  → Teacher can see their chapters after creating them
    → BLOCKER 3 (GET /api/lessons?chapter_id=) becomes meaningful
      → Student can see lessons in a chapter
        → Student lesson player can load content
          → Progress tracking can fire on lesson open

BLOCKER 3: GET /api/lessons?chapter_id=
  → Lesson player loads real content (depends on BLOCKER 2)
    → Lesson blocks render in player
      → Video content plays via signed URL
        → Progress: start → update → complete fires correctly

BLOCKER 5: Wire teacher stores to API
  → This is the master unlock. Depends on BLOCKERS 1, 2, 3.
  → Breaks into sub-dependencies:

  Wire course store → POST /api/courses, GET /api/courses
    → Wire chapter store → POST /api/chapters, GET /api/chapters (BLOCKER 2)
      → Wire lesson store → POST /api/lessons, GET /api/lessons (BLOCKER 3)
        → Wire lesson_block store → POST /api/lesson-blocks
          → Wire video upload → POST /api/videos
            → Student can view real lesson content

  Wire quiz store → POST /api/quizzes
    → Wire question store (depends on BLOCKER 6)
      → POST /api/questions with valid category_id
        → Quiz attempt flow (already wired in frontend/)

  Wire course publish → PATCH /api/courses/{id}?status=published (missing endpoint)
    → Students can discover and enroll in courses

BLOCKER 6: Question category API
  → Wire question bank store
    → Create questions with valid category_id
      → Build quizzes from real questions
        → Wire quiz store (depends on question store)

Quiz attempt flow (frontend/) — already connected:
  → start attempt → save answers → submit
    → auto-grading engine fires (complete, backend only)
      → result record created
        → Replace hardcoded demoStudentId with real auth user ID
          → Result attributed to correct student
            → Progress: lesson complete fires
              → Course completion % calculated

Enrollment flow:
  Wire enrollment API → students can enroll in published courses
    → (Paid enrollment) → depends on payments module (empty stub, post-launch)

Manual grading:
  Quiz attempt flow complete
    → ESSAY question creates pending_manual_review = true result
      → Wire grading UI → GET /grading/pending
        → Teacher reviews and grades
          → Student receives final score
```

**The critical path for v1 launch:**
```
BLOCKER 1 → BLOCKER 4 → BLOCKER 6 → BLOCKER 2 → BLOCKER 3 → BLOCKER 5 (sub-tasks) → Fix hardcoded studentId → Course publish endpoint → Enrollment wire
```

---

## 6. User Flow Analysis

### FLOW 1: Teacher → Create Course

**Current state:** Teacher creates a course in the UI → saved to localStorage → invisible to backend → invisible to students → lost on device switch

| Step | Existing | Missing | Effort | Risk | Files Affected |
|---|---|---|---|---|---|
| 1. Teacher logs in | Real login via `POST /api/auth/login` | Auth guard on `teacher.tsx` (BLOCKER 4) | 1h | LOW | `classz-frontend-prototype/src/routes/teacher.tsx` |
| 2. Click "New Course" | UI complete | API call to `POST /api/courses` | 3h | LOW | `teacher-course-store.ts`, new `api/courses.ts` |
| 3. Fill course details | UI complete | API call on save | 2h | LOW | `teacher-course-store.ts` |
| 4. See course in list | UI reads from Zustand | API call to `GET /api/courses?teacher_id=` | 2h | LOW | `teacher-course-store.ts` |
| 5. Publish course | UI has button | Backend missing `PATCH /api/courses/{id}` + status logic | 4h | MEDIUM | `backend/app/modules/courses/router.py`, `service.py` |

**Total gap:** ~12 hours

---

### FLOW 2: Teacher → Create Chapter → Create Lesson

| Step | Existing | Missing | Effort | Risk | Files Affected |
|---|---|---|---|---|---|
| 1. Add chapter to course | UI complete | POST to API + BLOCKER 2 (GET chapters) | 4h | LOW | `teacher-chapter-store.ts`, backend chapters router/service |
| 2. Add lesson to chapter | UI complete | POST to API + BLOCKER 3 (GET lessons) | 4h | LOW | `teacher-session-store.ts`, backend lessons router/service |
| 3. Add lesson blocks | UI complete (5 block types) | POST to `lesson-blocks` API | 3h | LOW | `teacher-session-store.ts`, backend lesson_blocks |
| 4. Upload video | UI has dropzone | Wire signed URL flow | 4h | MEDIUM | `teacher-session-store.ts`, `api/videos.ts` |

**Total gap:** ~15 hours (after BLOCKERS 2 & 3 are resolved)

---

### FLOW 3: Teacher → Build Quiz → Assign to Lesson

| Step | Existing | Missing | Effort | Risk | Files Affected |
|---|---|---|---|---|---|
| 1. Create question category | **NO UI for this** | GET + POST `/api/question-categories` endpoint (BLOCKER 6) | 4h | HIGH | Backend question_bank router, frontend category picker |
| 2. Create question | UI complete (7 types) | POST to API with valid `category_id` | 4h | LOW | `teacher-question-store.ts`, `api/questions.ts` |
| 3. Create quiz | UI complete | POST to `/api/quizzes` | 2h | LOW | `teacher-quiz-store.ts`, `api/quizzes.ts` |
| 4. Add questions to quiz | UI complete | POST to `/api/quizzes/{id}/questions` | 2h | LOW | `teacher-quiz-store.ts` |
| 5. Assign quiz to lesson | UI has picker | PATCH lesson with quiz_id, or lesson_block type=quiz | 3h | MEDIUM | Backend lessons model, lesson_blocks |

**Total gap:** ~15 hours (after BLOCKER 6 resolved)

---

### FLOW 4: Teacher → Publish Course

| Step | Existing | Missing | Effort | Risk | Files Affected |
|---|---|---|---|---|---|
| 1. Mark course ready | UI has "Publish" button | Backend `PATCH /api/courses/{id}` with status | 3h | LOW | `backend/app/modules/courses/router.py`, `service.py` |
| 2. Validate course has content | NO validation | Add pre-publish validation (chapters > 0, lessons > 0) | 2h | LOW | `backend/app/modules/courses/service.py` |
| 3. Course appears in catalog | UI mock catalog exists | Wire `GET /api/courses` to frontend catalog | 2h | LOW | `classz-frontend-prototype/src/routes/courses.tsx` |

**Total gap:** ~7 hours

---

### FLOW 5: Student → Discover Course → Enroll

| Step | Existing | Missing | Effort | Risk | Files Affected |
|---|---|---|---|---|---|
| 1. Student logs in | Real login | Auth guard on `student.tsx` (already exists!) | — | — | — |
| 2. Browse course catalog | UI complete (mock data) | Wire `GET /api/courses` (status=published) | 2h | LOW | `classz-frontend-prototype/src/routes/student.*` |
| 3. View course details | UI complete (mock) | Wire `GET /api/courses/{id}` | 1h | LOW | Course detail route |
| 4. Free enrollment | UI has "Enroll" button | Wire `POST /api/enrollments` | 3h | LOW | `api/enrollments.ts` |
| 5. Paid enrollment | UI has "Buy" button | Entire payments module (empty stub) | 40–60h | HIGH | `payments/`, `wallets/`, Stripe/gateway integration |

**Total gap (free enrollment):** ~6 hours
**Total gap (paid enrollment):** ~50+ hours — defer to post-launch

---

### FLOW 6: Student → Open Course → Play Lesson

| Step | Existing | Missing | Effort | Risk | Files Affected |
|---|---|---|---|---|---|
| 1. Student opens enrolled course | UI complete (mock) | Wire enrollment check, load real chapters (BLOCKER 2) | 3h | LOW | Student course routes |
| 2. Select chapter | UI complete (mock) | Wire `GET /api/chapters?course_id=` | 1h | LOW | Student course routes |
| 3. Select lesson | UI complete (mock) | Wire `GET /api/lessons?chapter_id=` (BLOCKER 3) | 1h | LOW | Student lesson route |
| 4. Lesson loads content | UI complete (mock) | Wire `GET /api/lesson-blocks?lesson_id=` | 2h | LOW | Student lesson player |
| 5. Track progress start | UI fires "started" event | Wire `POST /api/progress/start` | 1h | LOW | Progress hook |
| 6. Video plays | UI has player (mock) | Wire signed video URL | 3h | MEDIUM | Video player component |

**Total gap:** ~11 hours (after BLOCKERS 2 & 3)

---

### FLOW 7: Student → Take Quiz → See Result

**This is the most complete flow in the entire codebase.** The secondary frontend (`frontend/`) has a production-ready quiz player. The critical defect is `demoStudentId`.

| Step | Existing | Missing | Effort | Risk | Files Affected |
|---|---|---|---|---|---|
| 1. Open quiz | **YES** — `frontend/src/modules/quiz-player/QuizPlayerPage.tsx` | Remove hardcoded `demoStudentId`, read from auth store | 2h | LOW | `QuizPlayerPage.tsx`, auth store |
| 2. Start attempt | **YES** — `POST /api/quiz-attempts/start` | — | — | — | — |
| 3. Answer questions | **YES** — `POST /api/quiz-attempts/{id}/answer` | — | — | — | — |
| 4. Timer + anti-cheat | **YES** — focus loss, tab switch events fire | — | — | — | — |
| 5. Submit | **YES** — `POST /api/quiz-attempts/{id}/submit` | — | — | — | — |
| 6. Auto-grading | **YES** — complete engine in `results/service.py` | — | — | — | — |
| 7. View result | YES backend | Wire result display in prototype frontend | 3h | LOW | Student result routes |

**Total gap:** ~5 hours — closest to launch-ready of any flow

---

### FLOW 8: Teacher → Review Manual (Essay) Grades

| Step | Existing | Missing | Effort | Risk | Files Affected |
|---|---|---|---|---|---|
| 1. Essay submitted | Auto-grading marks `pending_manual_review = true` | — | — | — | — |
| 2. Teacher sees pending list | UI has grading tab (mock) | Wire `GET /api/grading/pending` | 2h | LOW | Teacher grading UI |
| 3. Teacher reads essay | UI shows submission | Wire `GET /api/grading/{id}` | 1h | LOW | Grading detail |
| 4. Teacher submits grade | UI has score input | Wire `POST /api/grading/{id}/grade` | 2h | LOW | Grading form |
| 5. Student receives grade | Backend fires grade_return | Wire result update in student view | 2h | LOW | Student result page |

**Total gap:** ~7 hours (defer to post-launch v1.1)

---

### FLOW 9: Progress → Course Completion

| Step | Existing | Missing | Effort | Risk | Files Affected |
|---|---|---|---|---|---|
| 1. Lesson started → backend | Backend has start endpoint | Wire frontend | 1h | LOW | Progress hook |
| 2. Lesson in-progress → backend | Backend has update endpoint | Wire frontend + progress % | 1h | LOW | Progress hook |
| 3. Lesson completed → backend | Backend has complete endpoint | Wire on video end / scroll bottom | 2h | MEDIUM | Lesson player |
| 4. Chapter completion % | Backend has per-lesson records | Add aggregation query | 3h | LOW | Progress service |
| 5. Course completion certificate | UI exists (mock) | Backend completion check + certificate record | 5h | MEDIUM | New certificate endpoint |

**Total gap:** ~12 hours (certificate is post-launch)

---

## 7. Unified Launch Roadmap

All tasks ordered highest to lowest priority. Tasks with a `[BLOCKS LAUNCH]` tag must be completed before any public user can use the platform. `[PRE-LAUNCH]` tasks must be completed before the beta launch. `[POST-LAUNCH]` tasks are safe to defer.

---

### PRIORITY 1 — Security & Data Integrity (Must ship first)
**These prevent data loss, security breaches, and database crashes.**

| # | Task | Effort | Risk | Tag |
|---|---|---|---|---|
| 1.1 | Fix PostgreSQL role_enum: new Alembic migration adding 5 missing role values | 1h | LOW | **BLOCKS LAUNCH** |
| 1.2 | Add `beforeLoad` auth guards to `teacher.tsx`, `admin.tsx`, `parent.tsx`, `content.tsx` | 1h | LOW | **BLOCKS LAUNCH** |
| 1.3 | Remove `DevQuickAccess` component from login page (or gate strictly with env check that fails in production) | 1h | LOW | **BLOCKS LAUNCH** |
| 1.4 | Add `get_current_user` auth dependency to ALL backend endpoints (currently only `/api/auth/me` uses it) | 8h | MEDIUM | **BLOCKS LAUNCH** |

**Subtotal: ~11 hours**

---

### PRIORITY 2 — Missing Backend Endpoints (Core teacher flow blocked without these)

| # | Task | Effort | Risk | Tag |
|---|---|---|---|---|
| 2.1 | Add `GET /api/chapters?course_id=` endpoint (router + service + schema) | 3h | LOW | **BLOCKS LAUNCH** |
| 2.2 | Add `GET /api/lessons?chapter_id=` endpoint (router + service + schema) | 3h | LOW | **BLOCKS LAUNCH** |
| 2.3 | Add `PATCH /api/courses/{id}` endpoint for update + publish (status field) | 3h | LOW | **BLOCKS LAUNCH** |
| 2.4 | Add `GET /api/question-categories` and `POST /api/question-categories` endpoints | 3h | LOW | **BLOCKS LAUNCH** |
| 2.5 | Seed default question categories in a startup script or Alembic migration | 1h | LOW | **BLOCKS LAUNCH** |

**Subtotal: ~13 hours**

---

### PRIORITY 3 — Quiz Attempt Flow Fix (Closest to production-ready)
**Fix one line, unlock the entire quiz flow.**

| # | Task | Effort | Risk | Tag |
|---|---|---|---|---|
| 3.1 | Replace hardcoded `demoStudentId = "00000000-0000-0000-0000-000000000001"` in `frontend/src/modules/quiz-player/QuizPlayerPage.tsx` with real authenticated user ID from auth store | 2h | LOW | **BLOCKS LAUNCH** |
| 3.2 | Wire quiz result display: student sees their score after submission in prototype frontend | 3h | LOW | **PRE-LAUNCH** |

**Subtotal: ~5 hours**

---

### PRIORITY 4 — Teacher Store API Integration (Largest task block)
**Wire all 11 teacher Zustand stores to the real backend. This is the master unlock — nothing persists without this.**

| # | Task | Effort | Risk | Tag |
|---|---|---|---|---|
| 4.1 | Create API client module `classz-frontend-prototype/src/lib/api/courses.ts` with `createCourse`, `listMyCourses`, `updateCourse`, `publishCourse` | 4h | LOW | **BLOCKS LAUNCH** |
| 4.2 | Wire `useTeacherCourseStore`: replace localStorage mutations with API calls + read from API on mount | 6h | MEDIUM | **BLOCKS LAUNCH** |
| 4.3 | Create `classz-frontend-prototype/src/lib/api/chapters.ts` with CRUD | 2h | LOW | **BLOCKS LAUNCH** |
| 4.4 | Wire `useTeacherChapterStore`: replace localStorage mutations with API calls | 4h | MEDIUM | **BLOCKS LAUNCH** |
| 4.5 | Create `classz-frontend-prototype/src/lib/api/lessons.ts` with CRUD | 2h | LOW | **BLOCKS LAUNCH** |
| 4.6 | Wire `useTeacherSessionStore` (maps to lessons): replace localStorage mutations with API calls | 6h | MEDIUM | **BLOCKS LAUNCH** |
| 4.7 | Create `classz-frontend-prototype/src/lib/api/lesson-blocks.ts` | 2h | LOW | **BLOCKS LAUNCH** |
| 4.8 | Wire lesson block creation from Content Studio content tab | 4h | MEDIUM | **BLOCKS LAUNCH** |
| 4.9 | Create `classz-frontend-prototype/src/lib/api/questions.ts` | 2h | LOW | **BLOCKS LAUNCH** |
| 4.10 | Wire `useTeacherQuestionStore`: replace localStorage mutations with API calls (requires category_id from P2.4) | 6h | MEDIUM | **BLOCKS LAUNCH** |
| 4.11 | Create `classz-frontend-prototype/src/lib/api/quizzes.ts` | 2h | LOW | **BLOCKS LAUNCH** |
| 4.12 | Wire `useTeacherQuizStore`: replace localStorage mutations with API calls | 4h | MEDIUM | **BLOCKS LAUNCH** |
| 4.13 | Remove `seedTeacherData()` call from `teacher.content-studio.tsx` (and all teacher pages) after stores are wired | 1h | LOW | **BLOCKS LAUNCH** |
| 4.14 | Video upload flow: wire signed URL from `POST /api/videos` to S3/storage upload in lesson block UI | 5h | HIGH | **PRE-LAUNCH** |

**Subtotal: ~50 hours**

---

### PRIORITY 5 — Student Enrollment & Course Discovery

| # | Task | Effort | Risk | Tag |
|---|---|---|---|---|
| 5.1 | Wire course catalog: `GET /api/courses?status=published` → student course list UI | 2h | LOW | **BLOCKS LAUNCH** |
| 5.2 | Wire course detail: `GET /api/courses/{id}` with chapters and lesson previews | 2h | LOW | **BLOCKS LAUNCH** |
| 5.3 | Wire free enrollment: `POST /api/enrollments` on "Enroll Free" button | 3h | LOW | **BLOCKS LAUNCH** |
| 5.4 | Enrollment check before allowing student into course content | 2h | LOW | **BLOCKS LAUNCH** |

**Subtotal: ~9 hours**

---

### PRIORITY 6 — Student Lesson Player

| # | Task | Effort | Risk | Tag |
|---|---|---|---|---|
| 6.1 | Wire lesson list in student course view: `GET /api/chapters?course_id=` + `GET /api/lessons?chapter_id=` | 3h | LOW | **BLOCKS LAUNCH** |
| 6.2 | Wire lesson content: `GET /api/lesson-blocks?lesson_id=` → render blocks by type | 3h | LOW | **BLOCKS LAUNCH** |
| 6.3 | Wire progress tracking: fire `POST /api/progress/start` on lesson open | 1h | LOW | **PRE-LAUNCH** |
| 6.4 | Wire progress update: fire `POST /api/progress/update` during lesson | 2h | LOW | **PRE-LAUNCH** |
| 6.5 | Wire progress complete: fire `POST /api/progress/complete` on lesson finish | 1h | LOW | **PRE-LAUNCH** |
| 6.6 | Wire video playback from signed URLs returned by backend | 3h | MEDIUM | **PRE-LAUNCH** |

**Subtotal: ~13 hours**

---

### PRIORITY 7 — Pre-Launch Polish

| # | Task | Effort | Risk | Tag |
|---|---|---|---|---|
| 7.1 | Add loading states + error boundaries to all newly wired components | 4h | LOW | **PRE-LAUNCH** |
| 7.2 | Add 401/403 handling in API client (already has 401 → redirect, but needs 403 messaging) | 2h | LOW | **PRE-LAUNCH** |
| 7.3 | Password reset flow: `POST /api/auth/forgot-password` + email delivery | 6h | MEDIUM | **PRE-LAUNCH** |
| 7.4 | Email verification on registration | 4h | MEDIUM | **PRE-LAUNCH** |
| 7.5 | Rate limiting on auth endpoints | 2h | LOW | **PRE-LAUNCH** |
| 7.6 | Backend input validation tightening (check all Pydantic schemas for missing validators) | 4h | LOW | **PRE-LAUNCH** |
| 7.7 | Add `student_id` to progress endpoints derived from JWT (not client-supplied) | 3h | HIGH | **PRE-LAUNCH** |
| 7.8 | End-to-end test: full Teacher → Course → Quiz → Student → Result flow | 8h | LOW | **PRE-LAUNCH** |

**Subtotal: ~33 hours**

---

### PRIORITY 8 — Post-Launch (Defer safely)

| # | Task | Effort | Tag |
|---|---|---|---|
| 8.1 | Payments module: full implementation with Stripe/payment gateway | 60–80h | POST-LAUNCH |
| 8.2 | Wallets module: teacher payout, platform fees | 40–60h | POST-LAUNCH |
| 8.3 | Notifications module: register in main.py, implement real-time events | 20–30h | POST-LAUNCH |
| 8.4 | Parent portal API: child progress, attendance, messaging | 30–40h | POST-LAUNCH |
| 8.5 | Reports & analytics module | 20–30h | POST-LAUNCH |
| 8.6 | AI content generation module | 40–60h | POST-LAUNCH |
| 8.7 | Manual grading UI wiring (essays) | 7h | POST-LAUNCH v1.1 |
| 8.8 | Course completion certificates | 8h | POST-LAUNCH v1.1 |
| 8.9 | Chapter/lesson reordering (drag and drop → persist order) | 6h | POST-LAUNCH v1.1 |
| 8.10 | Course deletion, chapter deletion | 4h | POST-LAUNCH v1.1 |
| 8.11 | Admin panel backend wiring | 20h | POST-LAUNCH v1.1 |

---

## Launch Effort Summary

| Priority | Work Block | Effort |
|---|---|---|
| P1 | Security & data integrity | 11h |
| P2 | Missing backend endpoints | 13h |
| P3 | Quiz attempt flow fix | 5h |
| P4 | Teacher store API integration | 50h |
| P5 | Student enrollment & discovery | 9h |
| P6 | Student lesson player | 13h |
| P7 | Pre-launch polish | 33h |
| **TOTAL** | **v1 Launch** | **~134 hours** |

---

## Key Architectural Decisions for Integration

### Decision 1: Single Frontend or Merge?
The two frontends serve different purposes. **Recommendation:** Use `classz-frontend-prototype/` as the sole production frontend. Port the working quiz player from `frontend/` into the prototype's student routes. The prototype has the complete UX shell — it just needs the API wiring from `frontend/`. Do not maintain two separate apps.

### Decision 2: Zustand vs React Query
The prototype's Zustand stores are synchronous and optimistic — they feel fast. **Recommendation:** Keep Zustand for client-side UI state (selected tab, modal open, sort order). Add React Query `useMutation` calls inside each store action so the mutation hits the backend while also updating the local Zustand snapshot. This gives optimistic updates + real persistence without a full architecture rewrite.

### Decision 3: student_id Security
Currently `POST /api/progress/start` accepts `student_id` in the request body. This means a student could claim any `student_id`. **Fix:** Derive `student_id` from the JWT in `get_current_user` dependency — never trust it from the request body. Apply the same fix to quiz attempts.

### Decision 4: Session vs Lesson Terminology
The prototype calls learning units "sessions" (`TeacherSession`, `teacher-session-store`). The backend calls them `lessons`. **Recommendation:** Keep the frontend terminology as-is (it is part of the CLASSZ brand identity). Map `TeacherSession → Lesson` in the API layer only — the user never sees "lesson" in the prototype UI.

---

*Document generated: July 2026*
*Scope: Full architectural analysis across classz-frontend-prototype/ (211 routes), frontend/ (20 routes), backend/ (17 registered modules), alembic/ (13 migrations)*
*Analysis method: Direct file inspection of routers, services, schemas, stores, and migration files*
