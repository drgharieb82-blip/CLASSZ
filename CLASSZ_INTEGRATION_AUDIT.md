# CLASSZ Integration Audit
**Date:** 2026-07-05  
**Auditor:** Claude Code  
**Purpose:** Full-stack integration readiness assessment for 15-day MVP sprint

---

## Executive Summary

### Overall Completion: **~28%**

The CLASSZ platform has excellent UI coverage and a solid backend foundation, but the two are **almost entirely disconnected**. The primary prototype frontend (211 routes) uses Zustand stores backed by localStorage as a substitute for the real backend. The backend has real FastAPI + PostgreSQL endpoints, but they are unprotected, missing critical domain modules (enrollment, payments), and not called by the primary frontend. A secondary frontend (`frontend/`) exists that is genuinely integrated with the backend (quiz player, courses, videos) but covers only ~20 routes and lacks the complete user experience.

The MVP is achievable in 15 days but requires systematic wiring — no new features, just connecting existing pieces.

---

### Critical Blockers (Must fix before any MVP flow works)

| # | Blocker | Impact |
|---|---------|--------|
| B1 | **No enrollment backend endpoint** — `POST /api/enrollments` does not exist; enrollment is Zustand-only | Students cannot purchase/access courses |
| B2 | **Zero auth protection on backend** — Only `/api/auth/me` uses `get_current_user`; all other endpoints are open | Any user can write/delete anything |
| B3 | **Primary frontend makes zero API calls for content** — All 11 teacher Zustand stores write to localStorage, never to backend | Teacher-created content never reaches the database |
| B4 | **Session concept mismatch** — Frontend calls learning units "sessions"; backend models them as `lessons` + `lesson_blocks` | Frontend stores session data that has no backend equivalent |
| B5 | **Payments module is empty** — `backend/app/modules/payments/router.py` has no routes; `service.py` is a stub | No payment flow is possible |
| B6 | **Missing GET endpoints** — Backend has `POST /api/chapters` but no `GET /api/chapters?courseId=`. Same for lessons, videos | Frontend cannot load teacher-created content even if it was stored |

---

### High Priority Items

| # | Item | Effort |
|---|------|--------|
| H1 | Add `GET /api/courses/{id}/chapters` with nested lessons | 3h |
| H2 | Wire teacher course create form to `POST /api/courses` | 4h |
| H3 | Wire teacher chapter/session creation to backend | 6h |
| H4 | Wire student course listing to `GET /api/courses` | 3h |
| H5 | Build enrollment backend (`POST /api/enrollments`, `GET /api/enrollments/me`) | 6h |
| H6 | Wire student quiz player (prototype) to real quiz attempt API | 6h |
| H7 | Add `get_current_user` to all write endpoints in backend | 4h |
| H8 | Wire student session/lesson player to backend lesson_blocks | 6h |

---

### Medium Priority Items

| # | Item | Effort |
|---|------|--------|
| M1 | Wire teacher question bank to `POST /api/question-bank` | 4h |
| M2 | Wire teacher quiz builder to `POST /api/quizzes` + `POST /api/quizzes/{id}/questions` | 5h |
| M3 | Wire progress tracking to `POST /api/progress/start`, `/update`, `/complete` | 5h |
| M4 | Wire results page in prototype to `GET /api/results/{attempt_id}` | 3h |
| M5 | Basic wallet backend (recharge, deduct balance) | 5h |
| M6 | Register missing modules in `backend/app/main.py` (payments, wallets, notifications) | 1h |
| M7 | Wire student wrong-questions and progress pages to real data | 4h |

---

### Low Priority Items

| # | Item | Effort |
|---|------|--------|
| L1 | Admin module endpoints (CRUD users, courses, reports) | 6h |
| L2 | Parent portal real data | 4h |
| L3 | Teacher analytics/insights real data | 6h |
| L4 | Notifications real-time delivery | 5h |
| L5 | Anti-cheating integration in prototype quiz player | 3h |
| L6 | Content Manager publish workflow | 4h |

---

## Full Module Audit Matrix

### Architecture Overview

```
d:\CLASSZ\
├── backend/                     FastAPI + PostgreSQL (real, async, Alembic migrations)
├── classz-frontend-prototype/   PRIMARY frontend — 211 routes, Zustand/mock only
├── frontend/                    SECONDARY frontend — 20 routes, actually connected to backend
└── docker-compose.yml           Postgres + Backend + Frontend orchestrated
```

**The core problem:** Two frontends exist. The primary (prototype) has beautiful, complete UI but is entirely mock. The secondary has real backend integration but is incomplete UI. The MVP path is to **wire the primary frontend to the real backend APIs**.

---

### 1. Authentication

| Check | Status | Notes |
|-------|--------|-------|
| UI exists | ✅ | Login, Register, Forgot Password pages in prototype |
| Store exists | ✅ | `auth-store.ts` (Zustand + persist) |
| API client exists | ✅ | `lib/api/auth.ts` with `loginApi`, `registerApi`, `getMeApi` |
| Backend endpoint exists | ✅ | `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me` |
| Database support | ✅ | `users` table with bcrypt passwords, UUID PKs, roles |
| Connected | ✅ | Login/Register actually call real backend |
| Fully working | ⚠️ | Login/register work; `getMeApi` is never called (no session hydration on refresh) |
| Blocking issues | Token not rehydrated from API on refresh — uses localStorage snapshot |
| Estimated hours | 2h |

---

### 2. Course Management (Teacher Creates Course)

| Check | Status | Notes |
|-------|--------|-------|
| UI exists | ✅ | `teacher.courses.create.tsx`, `teacher.courses.$courseId.edit.tsx`, full multi-step form |
| Store exists | ✅ | `teacher-course-store.ts` (Zustand, 50+ fields) |
| API client exists | ❌ | No `lib/api/courses.ts` in prototype |
| Backend endpoint exists | ✅ | `POST /api/courses`, `GET /api/courses`, `GET /api/courses/{id}` |
| Database support | ✅ | `courses` table with full schema |
| Connected | ❌ | Course creation writes to Zustand only, never hits backend |
| Fully working | ❌ | All teacher course data lives in localStorage, lost on different device |
| Blocking issues | Teacher-created courses cannot be seen by students |
| Estimated hours | 6h |

---

### 3. Chapter Management (Teacher Creates Chapters)

| Check | Status | Notes |
|-------|--------|-------|
| UI exists | ✅ | `teacher.courses.$courseId.chapters.tsx`, Content Studio tree |
| Store exists | ✅ | `teacher-chapter-store.ts` |
| API client exists | ❌ | None |
| Backend endpoint exists | ⚠️ | Only `POST /api/chapters` — NO `GET /api/chapters?courseId=` |
| Database support | ✅ | `chapters` table with position, course FK |
| Connected | ❌ | Zustand only |
| Fully working | ❌ | |
| Blocking issues | Backend missing list/get endpoint for chapters |
| Estimated hours | 5h (includes adding GET endpoint to backend) |

---

### 4. Lesson / Session Builder (Teacher Builds Content)

| Check | Status | Notes |
|-------|--------|-------|
| UI exists | ✅ | `teacher.content-studio.tsx` (sessions tab), `teacher.courses.$courseId.sessions.$sessionId.tsx` |
| Store exists | ✅ | `teacher-session-store.ts`, `teacher-lesson-store.ts`, `teacher-material-store.ts` |
| API client exists | ❌ | None |
| Backend endpoint exists | ⚠️ | Backend has `lessons` + `lesson_blocks`, but frontend calls them "sessions" — schema mismatch |
| Database support | ✅ | `lessons` + `lesson_blocks` tables; full block types (TEXT, PDF, VIDEO, etc.) |
| Connected | ❌ | Zustand only |
| Fully working | ❌ | |
| Blocking issues | **Concept mismatch**: prototype's "session" = backend's "lesson". Mapping layer needed |
| Estimated hours | 8h |

---

### 5. Question Bank (Teacher Adds Questions)

| Check | Status | Notes |
|-------|--------|-------|
| UI exists | ✅ | `teacher.questions.tsx`, `teacher.questions.create.tsx`, full MCQ + essay + calculation builder |
| Store exists | ✅ | `teacher-question-store.ts` |
| API client exists | ❌ | Not in prototype (exists in `frontend/` secondary app) |
| Backend endpoint exists | ✅ | `GET/POST /api/question-bank`, `POST /api/question-bank/{id}/choices`, `POST /api/question-bank/{id}/media` |
| Database support | ✅ | `questions`, `question_choices`, `question_tags`, `question_media` tables |
| Connected | ❌ | Zustand only in prototype |
| Fully working | ✅ in secondary `frontend/` | `frontend/src/modules/question-bank/` is fully wired |
| Blocking issues | Secondary frontend integration exists — can port the API client to prototype |
| Estimated hours | 4h |

---

### 6. Quiz Builder (Teacher Builds Quiz)

| Check | Status | Notes |
|-------|--------|-------|
| UI exists | ✅ | `teacher.quizzes.create.tsx`, `teacher.quizzes.$quizId.edit.tsx`, Assessment Engine tab |
| Store exists | ✅ | `teacher-quiz-store.ts`, `teacher-assessment-store.ts` |
| API client exists | ❌ | Not in prototype |
| Backend endpoint exists | ✅ | `GET/POST /api/quizzes`, `POST /api/quizzes/{id}/questions` |
| Database support | ✅ | `quizzes`, `quiz_questions` tables |
| Connected | ❌ | Zustand only in prototype |
| Fully working | ✅ in secondary `frontend/` | `frontend/src/modules/quizzes/` wired |
| Blocking issues | None after porting API layer |
| Estimated hours | 5h |

---

### 7. Student Course Discovery

| Check | Status | Notes |
|-------|--------|-------|
| UI exists | ✅ | `courses.index.tsx`, `courses.$courseId.tsx`, `student.courses.index.tsx` |
| Store exists | ⚠️ | No store — reads from `mock.ts` hardcoded array |
| API client exists | ❌ | Not in prototype |
| Backend endpoint exists | ✅ | `GET /api/courses`, `GET /api/courses/{id}` |
| Database support | ✅ | `courses` table |
| Connected | ❌ | Reads hardcoded mock data |
| Fully working | ✅ in secondary `frontend/` | `frontend/src/modules/courses/api.ts` connected |
| Blocking issues | Student sees only 8 hardcoded courses, not teacher-created ones |
| Estimated hours | 3h |

---

### 8. Enrollment / Payment (Student Purchases Course)

| Check | Status | Notes |
|-------|--------|-------|
| UI exists | ✅ | `student.courses.$courseId.enroll.tsx` — wallet, card, Fawry, Vodafone Cash options |
| Store exists | ✅ | `enrollment-store.ts`, `wallet-store.ts` (Zustand, localStorage) |
| API client exists | ❌ | None |
| Backend endpoint exists | ❌ | **NO enrollment endpoint exists in backend** |
| Database support | ❌ | No `enrollments` table in any migration |
| Connected | ❌ | Pure Zustand with mock deduction |
| Fully working | ❌ | Frontend pretends to pay, no real record exists |
| Blocking issues | **Critical** — This is the money flow. Must be built from scratch |
| Estimated hours | 10h (backend + frontend wiring) |

---

### 9. Student Session / Lesson Player

| Check | Status | Notes |
|-------|--------|-------|
| UI exists | ✅ | `student.courses.$courseId.session.tsx`, `LessonPlayerLayout`, `ContentPlayer`, `SessionSidebar` |
| Store exists | ⚠️ | Reads from `sessionMock.ts` — hardcoded content for courses ec1, ec2 only |
| API client exists | ❌ | None in prototype |
| Backend endpoint exists | ✅ | `GET/POST /api/lesson-blocks` with block types |
| Database support | ✅ | `lesson_blocks` table (TEXT, PDF, VIDEO, IMAGE, ATTACHMENT) |
| Connected | ❌ | Reads static mock; ec3, ec4 show empty state |
| Fully working | ✅ in secondary `frontend/` | `frontend/src/modules/lessons/LessonPage.tsx` wired |
| Blocking issues | Player exists; data source must be switched from mock to API |
| Estimated hours | 6h |

---

### 10. Video Player

| Check | Status | Notes |
|-------|--------|-------|
| UI exists | ✅ | `ContentPlayer.tsx` handles video type blocks |
| Store exists | ⚠️ | `teacher-material-store.ts` stores video URLs locally |
| API client exists | ❌ | Not in prototype |
| Backend endpoint exists | ✅ | `GET /api/videos`, `POST /api/videos`, `GET /api/videos/{id}` |
| Database support | ✅ | `videos` table |
| Connected | ❌ | |
| Fully working | ✅ in secondary `frontend/` | `frontend/src/modules/videos/VideoPlayerPage.tsx` wired |
| Blocking issues | |
| Estimated hours | 4h |

---

### 11. Student Quiz Player

| Check | Status | Notes |
|-------|--------|-------|
| UI exists | ✅ | `student.quizzes.$quizId.tsx` — intro, active, result phases |
| Store exists | ⚠️ | Reads quiz from `teacher-quiz-store.ts`, questions from `teacher-question-store.ts` |
| API client exists | ❌ | Not in prototype |
| Backend endpoint exists | ✅ | Full flow: `POST /quiz-attempts/start`, `POST /{id}/answer`, `POST /{id}/submit` |
| Database support | ✅ | `quiz_attempts`, `quiz_answers` tables |
| Connected | ❌ | Reads from Zustand mock data, XP calculated locally |
| Fully working | ✅ in secondary `frontend/` | `frontend/src/modules/quiz-player/QuizPlayerPage.tsx` — complete with anti-cheating, timer |
| Blocking issues | The real quiz player is in `frontend/` — either port it or wire prototype's version |
| Estimated hours | 6h |

---

### 12. Auto-Grading & Results

| Check | Status | Notes |
|-------|--------|-------|
| UI exists | ✅ | `student.quizzes.$quizId.tsx` result phase; `teacher.assessment.results.tsx` |
| Store exists | ⚠️ | Local score calculation in component state |
| API client exists | ❌ | Not in prototype |
| Backend endpoint exists | ✅ | `POST /api/results/grade/{attempt_id}`, `GET /api/results/{attempt_id}` |
| Database support | ✅ | `quiz_results`, `question_results` tables |
| Connected | ❌ | Score computed client-side, no persistence |
| Fully working | ✅ in secondary `frontend/` | `frontend/src/modules/results/` wired |
| Blocking issues | |
| Estimated hours | 3h |

---

### 13. Progress Tracking

| Check | Status | Notes |
|-------|--------|-------|
| UI exists | ✅ | `student.progress.tsx`, progress bars in course workspace |
| Store exists | ⚠️ | Reads from `progressMock.ts` |
| API client exists | ❌ | None |
| Backend endpoint exists | ✅ | `POST /api/progress/start`, `/update`, `/complete`, `GET /api/progress/{lesson_id}` |
| Database support | ✅ | `lesson_progress` table with position, percent_complete |
| Connected | ❌ | |
| Fully working | ❌ | |
| Blocking issues | |
| Estimated hours | 5h |

---

### 14. Manual Grading

| Check | Status | Notes |
|-------|--------|-------|
| UI exists | ✅ | `teacher.assessment.manual-grading.tsx`, `teacher.assessment.grading-queue.tsx` |
| Store exists | ⚠️ | Mock data |
| API client exists | ❌ | Not in prototype (exists in `frontend/src/modules/grading/api.ts`) |
| Backend endpoint exists | ✅ | `GET /api/grading/pending`, `POST /api/grading/{id}/grade`, `POST /api/grading/{id}/return` |
| Database support | ✅ | `manual_grades` table |
| Connected | ❌ | |
| Blocking issues | |
| Estimated hours | 4h |

---

### 15. Assignments

| Check | Status | Notes |
|-------|--------|-------|
| UI exists | ✅ | `teacher.assignments.tsx`, `teacher.homework.tsx` |
| Store exists | ✅ | `teacher-assignment-store.ts`, `teacher-homework-store.ts` |
| API client exists | ❌ | Not in prototype (exists in `frontend/src/modules/assignments/api.ts`) |
| Backend endpoint exists | ✅ | `GET/POST /api/assignments`, `POST /api/assignments/{id}/submit` |
| Database support | ✅ | `assignments`, `assignment_submissions` tables |
| Connected | ❌ | |
| Blocking issues | |
| Estimated hours | 4h |

---

### 16. Exams

| Check | Status | Notes |
|-------|--------|-------|
| UI exists | ✅ | `teacher.exams.create.tsx`, `teacher.exams.tsx` |
| Store exists | ✅ | `teacher-exam-store.ts` |
| API client exists | ❌ | None |
| Backend endpoint exists | ⚠️ | No dedicated exam endpoint — uses quiz flow |
| Database support | ⚠️ | No separate `exams` table; exams are quizzes with flags |
| Connected | ❌ | |
| Blocking issues | |
| Estimated hours | 3h |

---

### 17. Anti-Cheating

| Check | Status | Notes |
|-------|--------|-------|
| UI exists | ✅ | Focus warning, security badges, timer in secondary frontend |
| Store exists | ⚠️ | Not in prototype |
| API client exists | ✅ | `frontend/src/modules/anti-cheating/api.ts` |
| Backend endpoint exists | ✅ | `POST /api/anti-cheating` events, IP/device tracking |
| Database support | ✅ | `quiz_attempts` has focus_loss_count, device_fingerprint, ip_address |
| Connected | ✅ in secondary `frontend/` | Full anti-cheating in `QuizPlayerPage.tsx` |
| Fully working | ✅ in secondary `frontend/` | |
| Blocking issues | Not connected in prototype |
| Estimated hours | 3h (port to prototype) |

---

### 18. Teacher Dashboard & Analytics

| Check | Status | Notes |
|-------|--------|-------|
| UI exists | ✅ | `teacher.dashboard.tsx`, `teacher.insights.*` (12 routes) |
| Store exists | ⚠️ | Mock data via `insights-mock-data.ts` |
| API client exists | ❌ | Not in prototype (exists in `frontend/src/modules/teacher-dashboard/api.ts`) |
| Backend endpoint exists | ✅ | `teacher_dashboard` module registered |
| Database support | ⚠️ | Partial — queries need to be written |
| Connected | ❌ | |
| Blocking issues | Low priority for MVP |
| Estimated hours | 6h |

---

### 19. Admin Panel

| Check | Status | Notes |
|-------|--------|-------|
| UI exists | ✅ | 31 admin routes with full management tables |
| Store exists | ⚠️ | `admin-mock-data.ts` |
| API client exists | ❌ | None |
| Backend endpoint exists | ⚠️ | `admin` module exists but registered in main.py's imports but NOT in include_router list |
| Database support | ✅ | `users` table supports all admin operations |
| Connected | ❌ | |
| Blocking issues | Low priority for MVP |
| Estimated hours | 6h |

---

### 20. Wallet

| Check | Status | Notes |
|-------|--------|-------|
| UI exists | ✅ | `student.wallet.tsx` with recharge + history |
| Store exists | ✅ | `wallet-store.ts` (Zustand) |
| API client exists | ❌ | None |
| Backend endpoint exists | ❌ | `wallets/router.py` is empty stub; `service.py` is a stub |
| Database support | ❌ | No `wallets` table in any migration |
| Connected | ❌ | |
| Fully working | ❌ | Pure localStorage fiction |
| Blocking issues | **Critical** — wallet is the payment mechanism for enrollment |
| Estimated hours | 6h (build backend + wire frontend) |

---

### 21. Navigation & Route Guards

| Check | Status | Notes |
|-------|--------|-------|
| UI exists | ✅ | `DashboardLayout` with full sidebar navigation per role |
| Auth guard exists | ✅ | `requireAuth()`, `requireRole()` in `auth-guard.ts` |
| Applied to routes | ⚠️ | Only `student.tsx` and `courses.$courseId.tsx` use `requireAuth` |
| Role-based redirect | ✅ | Login redirects to role home correctly |
| Blocking issues | Most teacher/admin routes have no auth guard on beforeLoad |
| Estimated hours | 2h |

---

### 22. Backend Auth Protection

| Check | Status | Notes |
|-------|--------|-------|
| Auth middleware exists | ✅ | `get_current_user` dependency in `auth/dependencies.py` |
| Applied to all routes | ❌ | **Only 1 endpoint uses it**: `GET /api/auth/me` |
| All content write routes unprotected | ❌ | `POST /api/courses`, `POST /api/chapters`, etc. accept requests from anyone |
| Role-based permission | ❌ | No `is_teacher`, `is_admin` checks anywhere |
| Blocking issues | **Security blocker** — any unauthenticated user can create/delete content |
| Estimated hours | 4h (add to all write endpoints) |

---

### 23. Notifications

| Check | Status | Notes |
|-------|--------|-------|
| UI exists | ✅ | `student.notifications.tsx`, notification bell in header |
| Store exists | ⚠️ | `notificationsMock.ts` |
| API client exists | ❌ | None |
| Backend endpoint exists | ⚠️ | Module exists but NOT registered in `main.py` |
| Database support | ❌ | No `notifications` table in migrations |
| Connected | ❌ | |
| Blocking issues | Not MVP-blocking |
| Estimated hours | 4h |

---

### 24. Parent Portal

| Check | Status | Notes |
|-------|--------|-------|
| UI exists | ✅ | 5 parent routes + full dashboard component |
| Store exists | ⚠️ | `parent-mock-data.ts` |
| API client exists | ❌ | None |
| Backend endpoint exists | ⚠️ | Module exists but NOT registered in `main.py` |
| Database support | ❌ | No parent-specific tables |
| Connected | ❌ | |
| Blocking issues | Not MVP-blocking |
| Estimated hours | 6h |

---

## Integration Roadmap

> Each slice delivers a testable, end-to-end working user flow. Complete them in order — later slices depend on earlier ones.

---

### Slice 1 — Backend Foundation (Day 1–2) | 8h

**Goal:** Backend is secure and has all necessary read endpoints.

```
Tasks:
1. Add get_current_user dependency to all POST/PUT/PATCH/DELETE endpoints
2. Add role guards: is_teacher, is_admin helpers
3. Add GET /api/courses/{id}/chapters (with nested lessons)
4. Add GET /api/chapters/{id}/lessons
5. Add GET /api/lessons/{id} with blocks
6. Register missing modules in main.py: payments, wallets, notifications
7. Fix admin/users/parents module inclusion
```

**Deliverable:** Backend is production-safe; all read paths exist.

---

### Slice 2 — Teacher Creates & Publishes a Course (Day 3–5) | 14h

**Goal:** A logged-in teacher can create a course, add chapters, and publish it.

```
Tasks:
1. Create lib/api/courses.ts in prototype (createCourse, getCourse, listCourses)
2. Create lib/api/chapters.ts (createChapter, listChapters)
3. Wire teacher.courses.create.tsx form submit → POST /api/courses
4. Wire teacher.courses.$courseId.chapters.tsx → POST /api/chapters
5. Wire course listing page to GET /api/courses (teacher's own)
6. Replace teacher-course-store create action to also call API
7. Replace teacher-chapter-store create action to also call API
8. Publish course: wire publish button → PATCH /api/courses/{id} { is_published: true }
```

**Deliverable:** Teacher can create a real persisted course. Another device sees it.

---

### Slice 3 — Teacher Builds Sessions (Lessons + Blocks) (Day 5–7) | 10h

**Goal:** Teacher can add sessions/lessons with content blocks to a chapter.

```
Tasks:
1. Define session→lesson mapping layer (session ≡ lesson; session blocks ≡ lesson_blocks)
2. Create lib/api/lessons.ts (createLesson, getLesson)
3. Create lib/api/lesson-blocks.ts (createBlock, listBlocks)
4. Wire SessionsBuilderTab create session → POST /api/lessons
5. Wire block add actions → POST /api/lesson-blocks
6. Load sessions from GET /api/courses/{id}/chapters → lessons chain
7. Wire teacher-session-store to use API as source of truth, Zustand as cache
```

**Deliverable:** Teacher builds a session with video/PDF/quiz blocks; it persists.

---

### Slice 4 — Teacher Builds Question Bank & Quiz (Day 7–9) | 9h

**Goal:** Teacher can create questions and assemble them into a quiz.

```
Tasks:
1. Port question-bank API client from frontend/ to classz-frontend-prototype/
2. Wire teacher.questions.create.tsx → POST /api/question-bank + POST /api/question-bank/{id}/choices
3. Wire question list to GET /api/question-bank
4. Port quiz API client
5. Wire teacher.quizzes.create.tsx → POST /api/quizzes
6. Wire quiz question add → POST /api/quizzes/{id}/questions
7. Link quiz to lesson block in session builder
```

**Deliverable:** Teacher creates a quiz with real questions stored in PostgreSQL.

---

### Slice 5 — Enrollment & Payment (Day 9–11) | 10h

**Goal:** Student can enroll in a published course.

```
Backend tasks:
1. Create enrollments table migration
2. Create enrollment model (student_id, course_id, enrolled_at, access_expires_at, payment_method, amount_paid)
3. Create POST /api/enrollments (verify course is published, check existing enrollment)
4. Create GET /api/enrollments/me (list enrolled course IDs for current user)
5. Basic wallet: POST /api/wallets/recharge, POST /api/wallets/pay, GET /api/wallets/balance

Frontend tasks:
6. Wire student.wallet.tsx recharge → POST /api/wallets/recharge
7. Wire enroll button → POST /api/enrollments (deduct from wallet or mark pending)
8. Load enrolled courses from GET /api/enrollments/me instead of localStorage
9. Guard /student/courses/$courseId/session: check enrollment before entry
```

**Deliverable:** Student pays from wallet, enrolls, enrollment is in database.

---

### Slice 6 — Student Views Course & Studies (Day 11–12) | 8h

**Goal:** Enrolled student can browse published courses and play session content.

```
Tasks:
1. Wire courses.index.tsx → GET /api/courses (published only)
2. Wire student.courses.$courseId.index.tsx → GET /api/courses/{id} with chapters
3. Wire session player → load lesson blocks from API instead of sessionMock.ts
4. Wire video blocks → GET /api/videos/{id}
5. Wire progress start/update on session open/scroll: POST /api/progress/start, /update
6. Wire progress complete: POST /api/progress/complete on last block
7. Load student's enrolled courses list from GET /api/enrollments/me
```

**Deliverable:** Student browses real courses, plays content, progress is tracked.

---

### Slice 7 — Student Takes Quiz & Sees Results (Day 12–13) | 7h

**Goal:** Student can take a quiz linked to a session and see their score.

```
Tasks:
1. Port quiz player API client from frontend/ to prototype
2. Wire student.quizzes.$quizId.tsx:
   - onStart: POST /api/quiz-attempts/start
   - onAnswer: POST /api/quiz-attempts/{id}/answer
   - onSubmit: POST /api/quiz-attempts/{id}/submit → POST /api/results/grade/{id}
3. Wire result phase to GET /api/results/{attempt_id}
4. Show question-level breakdown (is_correct, earned_points)
5. Store XP in result, display in UI
```

**Deliverable:** Student completes full quiz flow → real score persists.

---

### Slice 8 — Teacher Views Submissions & Grades (Day 13–14) | 6h

**Goal:** Teacher sees which students submitted quizzes and can grade open-ended questions.

```
Tasks:
1. Port grading API client from frontend/
2. Wire teacher.assessment.grading-queue.tsx → GET /api/grading/pending
3. Wire teacher.assessment.manual-grading.tsx → POST /api/grading/{id}/grade
4. Wire teacher.assessment.results.tsx → GET /api/results (by quiz)
5. Wire student-level progress in teacher.students pages to real data
```

**Deliverable:** Teacher grades submissions; student can see returned score.

---

### Slice 9 — Auth Hardening & Route Guards (Day 14) | 4h

**Goal:** All routes are protected; unauthenticated users are redirected.

```
Tasks:
1. Add beforeLoad: requireRole(['teacher']) to all /teacher/* routes
2. Add beforeLoad: requireRole(['student']) to all /student/* routes
3. Add beforeLoad: requireRole(['admin']) to all /admin/* routes
4. Call getMeApi() on app boot to rehydrate user from token
5. Handle 401 globally: logout + redirect to /login
```

**Deliverable:** Security baseline established; roles enforced.

---

### Slice 10 — Polish & Smoke Test (Day 15) | 4h

**Goal:** Full MVP flow works end-to-end with no console errors.

```
Tasks:
1. Smoke test: Teacher registers → creates course → adds chapter → builds session → adds quiz → publishes
2. Smoke test: Student registers → browses courses → enrolls → plays session → takes quiz → views result
3. Fix any broken API calls found during smoke test
4. Verify Docker compose starts cleanly: postgres → backend → frontend
5. Run alembic upgrade head to confirm migrations apply clean
```

**Deliverable:** Working MVP.

---

## Launch Checklist

### Backend Completeness
- [ ] `GET /api/courses/{id}/chapters` endpoint added
- [ ] `GET /api/chapters/{id}/lessons` endpoint added
- [ ] `GET /api/lessons/{id}` with blocks endpoint added
- [ ] `get_current_user` applied to all write endpoints (POST/PUT/PATCH/DELETE)
- [ ] Role guards added (`is_teacher`, `is_admin`, `is_student`)
- [ ] Enrollments table migration written and applied
- [ ] Enrollments module created (`POST /api/enrollments`, `GET /api/enrollments/me`)
- [ ] Wallet table migration written and applied
- [ ] Wallet endpoints implemented (`POST /api/wallets/recharge`, `POST /api/wallets/pay`, `GET /api/wallets/balance`)
- [ ] Missing modules registered in `main.py` (payments, wallets, notifications)
- [ ] `POST /api/courses` — update endpoint (`PATCH /api/courses/{id}`) added
- [ ] `PATCH /api/courses/{id}` includes `is_published` toggle
- [ ] Student can only access enrolled courses' content (authorization check on lesson GET)

### Frontend — Teacher Flow
- [ ] `lib/api/courses.ts` created in prototype
- [ ] `lib/api/chapters.ts` created in prototype
- [ ] `lib/api/lessons.ts` created in prototype
- [ ] `lib/api/lesson-blocks.ts` created in prototype
- [ ] `lib/api/questions.ts` created (or ported from `frontend/`)
- [ ] `lib/api/quizzes.ts` created (or ported from `frontend/`)
- [ ] Course create form submits to `POST /api/courses`
- [ ] Course list loads from `GET /api/courses` (teacher's own)
- [ ] Chapter create submits to `POST /api/chapters`
- [ ] Session/lesson create submits to `POST /api/lessons`
- [ ] Block create submits to `POST /api/lesson-blocks`
- [ ] Question create submits to `POST /api/question-bank`
- [ ] Quiz create submits to `POST /api/quizzes`
- [ ] Publish course button triggers `PATCH /api/courses/{id} { is_published: true }`
- [ ] Teacher can view their own grading queue from real API

### Frontend — Student Flow
- [ ] Public course list reads from `GET /api/courses?published=true`
- [ ] Course detail page reads from `GET /api/courses/{id}` with chapters
- [ ] Enrolled course list reads from `GET /api/enrollments/me`
- [ ] Enroll button triggers `POST /api/enrollments`
- [ ] Wallet balance reads from `GET /api/wallets/balance`
- [ ] Wallet recharge triggers `POST /api/wallets/recharge`
- [ ] Session player loads blocks from `GET /api/lessons/{id}` (not sessionMock.ts)
- [ ] Video player loads from `GET /api/videos/{id}`
- [ ] Progress start fires on session open
- [ ] Progress update fires on scroll/completion of blocks
- [ ] Quiz start triggers `POST /api/quiz-attempts/start`
- [ ] Each answer submission triggers `POST /api/quiz-attempts/{id}/answer`
- [ ] Quiz submit triggers `POST /api/quiz-attempts/{id}/submit` then `POST /api/results/grade/{id}`
- [ ] Results page loads from `GET /api/results/{attempt_id}`
- [ ] XP/gamification is derived from real result data

### Frontend — Auth & Security
- [ ] App boot calls `GET /api/auth/me` to rehydrate user from token (not just localStorage)
- [ ] Teacher routes have `requireRole(['teacher'])` guard
- [ ] Student routes have `requireRole(['student'])` guard
- [ ] Admin routes have `requireRole(['admin'])` guard
- [ ] Global 401 handler logs out and redirects
- [ ] Dev quick-access panel (`DevQuickAccess`) removed or gated to non-production

### Infrastructure
- [ ] `.env` file created from `.env.example` with production secrets
- [ ] `JWT_SECRET_KEY` set to a real random secret (not `change-me-in-production`)
- [ ] `docker-compose up` starts all three services cleanly
- [ ] `alembic upgrade head` runs without errors
- [ ] CORS origins updated to match production domain
- [ ] `ACCESS_TOKEN_EXPIRE_MINUTES` set appropriately for production
- [ ] Database seeded with at least one teacher account for demo

### Data Integrity
- [ ] All Zustand stores (`teacher-course-store`, `teacher-chapter-store`, etc.) are replaced or supplemented by real API calls — localStorage is no longer the source of truth
- [ ] Mock data files (`sessionMock.ts`, `courseDetailsMock.ts`, `mock.ts`) are no longer used in production routes
- [ ] Enrollment check is enforced before serving lesson content (cannot skip enrollment)
- [ ] Quiz attempt is linked to real authenticated student UUID (not `demoStudentId` hardcoded)

### Testing
- [ ] End-to-end: Teacher registers → creates course → adds session → adds quiz → publishes
- [ ] End-to-end: Student registers → finds course → enrolls (wallet) → plays session → takes quiz → views score
- [ ] Edge: Student without enrollment cannot access session
- [ ] Edge: Unauthenticated user cannot create a course
- [ ] Edge: Teacher cannot see another teacher's unpublished course

---

## Summary Table

| Module | UI | Store | API Layer | Backend | DB | Connected | Priority | Hours |
|--------|----|----|----|----|----|----|---|---|
| Auth (login/register) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Done | 2h polish |
| Course Create (Teacher) | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | **Critical** | 6h |
| Chapter Create | ✅ | ✅ | ❌ | ⚠️ | ✅ | ❌ | **Critical** | 5h |
| Session/Lesson Builder | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | **Critical** | 8h |
| Question Bank | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | **Critical** | 4h |
| Quiz Builder | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | **Critical** | 5h |
| Course Discovery (Student) | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | **Critical** | 3h |
| Enrollment | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | **Critical** | 10h |
| Wallet | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | **Critical** | 6h |
| Session Player | ✅ | ⚠️ | ❌ | ✅ | ✅ | ❌ | **Critical** | 6h |
| Video Player | ✅ | ⚠️ | ❌ | ✅ | ✅ | ❌ | High | 4h |
| Quiz Player | ✅ | ⚠️ | ❌ | ✅ | ✅ | ❌ | **Critical** | 6h |
| Auto-Grading & Results | ✅ | ⚠️ | ❌ | ✅ | ✅ | ❌ | **Critical** | 3h |
| Progress Tracking | ✅ | ⚠️ | ❌ | ✅ | ✅ | ❌ | High | 5h |
| Manual Grading | ✅ | ⚠️ | ❌ | ✅ | ✅ | ❌ | High | 4h |
| Assignments | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | Medium | 4h |
| Backend Auth Guards | — | — | — | ❌ | — | — | **Critical** | 4h |
| Route Guards (Frontend) | — | — | ⚠️ | — | — | ⚠️ | High | 2h |
| Teacher Dashboard | ✅ | ⚠️ | ❌ | ✅ | ⚠️ | ❌ | Medium | 6h |
| Admin Panel | ✅ | ⚠️ | ❌ | ⚠️ | ✅ | ❌ | Low | 6h |
| Notifications | ✅ | ⚠️ | ❌ | ⚠️ | ❌ | ❌ | Low | 4h |
| Parent Portal | ✅ | ⚠️ | ❌ | ⚠️ | ❌ | ❌ | Low | 6h |
| Anti-Cheating | ✅ | — | ✅* | ✅ | ✅ | ✅* | Medium | 3h |
| Certificates | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ | Low | 4h |

*Connected in `frontend/` only

**Total estimated hours to MVP: ~83h**  
**At 5.5h/day over 15 days: achievable.**

---

*Legend: ✅ Exists/Done · ⚠️ Partial/Mock · ❌ Missing*
