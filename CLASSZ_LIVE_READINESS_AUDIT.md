# CLASSZ — Teacher Dashboard / My Courses / Content Studio: Live-Readiness Audit

**Purpose:** Before mock data is removed, this documents exactly what is real vs. mock across every button, field, and tab in these three areas — with file:line evidence — and lists every backend gap that must be filled to go live.
**No code was changed to produce this report.**

---

## Executive Summary

| Area | Read | Create | Update | Publish | Delete | Verdict |
|---|---|---|---|---|---|---|
| **Teacher Dashboard** | mock | — | — | — | — | 100% mock UI, but a **real, working backend already exists and is simply never called** |
| **My Courses** | ✅ real (`GET /api/courses`) | ✅ real (`POST /api/courses`) | ❌ mock only | ❌ mock only | ❌ mock only | Partially real — list/create genuine, every other action is cosmetic |
| **Content Studio → Materials** | mock | mock | mock | mock | mock | 100% mock — **no backend module exists at all** |
| **Content Studio → Video Segments** | mock | mock | mock | n/a | mock | 100% mock — same as Materials (segments live inside Material records) |
| **Content Studio → Questions** | mock | mock | mock | mock | mock | 100% mock — a real `question_bank` backend exists but the teacher UI never calls it |
| **Content Studio → Assessments** (Quiz/Homework/Exam/Assignment) | mock | mock | mock | mock | mock | 100% mock — real `quizzes`/`assignments` backend exists but the unified UI never calls either |
| **Content Studio → Content Tree** (Chapter/Lesson/Concept/Atomic tree) | mock | mock | mock | n/a | mock | 100% mock — no `concepts`/`atomic_concepts` backend exists (already flagged in the frozen domain model) |
| **Content Studio → Sessions** | ✅ real (`GET /api/lessons`) | ✅ real (`POST /api/lessons`) | ❌ mock only | ❌ mock only | ❌ mock only (no DELETE endpoint exists anywhere) | Partially real — same pattern as My Courses |

**Pattern across all seven areas:** wherever a real backend call exists at all, it's only Create and List. Every Update / Publish / Unpublish / Delete / Archive / Lock button in the entire audited surface is a local Zustand state mutation with **no corresponding backend endpoint** — meaning every one of these actions silently reverts the moment the page reloads and re-fetches from the API.

---

## 1. Teacher Dashboard (`/teacher/` and `/teacher/dashboard`)

Every number on the page (revenue, wallet balance, student count, essay queue, recent sales, active courses/sessions) comes from a single hardcoded file, `src/lib/teacherMock.ts` — none of it is computed from any store or API. `[classz-frontend-prototype/src/routes/teacher.index.tsx]`

**The important finding:** a real backend module, `backend/app/modules/teacher_dashboard/`, already exists, is registered in `main.py`, and runs genuine DB queries:
- `GET /teacher-dashboard/summary` — real counts of Courses, Lessons, Students, Assignments, Quizzes, pending grades
- `GET /teacher-dashboard/pending-tasks` — real pending manual-grading queue
- `GET /teacher-dashboard/recent-activity` — real last-5 quizzes/assignments + course overview with joins

**The frontend never calls any of these three endpoints.** A repo-wide search for `teacher-dashboard`/`teacher_dashboard` in the frontend returns zero matches. This is the cheapest possible win in this entire audit — it requires **zero new backend work**, only wiring the existing dashboard page to existing, working endpoints (the exact same kind of "connect existing modules" work done in Milestones 1–2).

All 10 buttons/cards on the dashboard are navigation links (not data actions) and all point to real, existing pages.

---

## 2. My Courses (`/teacher/courses/`)

**Real:** the course list loads from `GET /api/courses?teacher_id=`, and `title`, `subject`, `grade`, and `status` (derived from the real `is_published` boolean) are genuine persisted fields.

**Mock/hardcoded, per course, regardless of what's in the database:**
- `enrollmentCount` — always `0`
- `revenue` — always `0`
- `rating` — always `0`
- `price` — always `0`
- `coverEmoji`/`coverColor` — always the same fixed values for every course
- `publicCode` — client-computed from the row id (`CRS-` + first 8 chars), not a real code system
- `assignedAssistant`/`assignedContentManager` — looked up from a hardcoded team mock, never populated from real data
- `tags` — always empty

**Buttons:** Edit/Chapters/Sessions links navigate correctly. **Publish, Unpublish, Delete, and Archive all only mutate local state** — confirmed: the backend `courses` router has exactly three endpoints (`GET /courses`, `GET /courses/{id}`, `POST /courses`) and **no PATCH, PUT, or DELETE at all**. There is currently no way to change or remove a course on the backend through any UI action. (Also: the "Archive" action exists in the store but isn't even wired to a visible button on this page — dead code, not user-reachable.)

---

## 3. Content Studio — tab by tab

### 3a. Materials
**No backend module exists at all** — `backend/app/modules/materials/` does not exist (confirmed against the full 30-module list; only `videos` exists, and it isn't wired to this store). Upload, Publish, Unpublish, Delete, and Academic-Link editing are all 100% local state (`teacher-material-store.ts`, zero API calls anywhere in the file).

### 3b. Video Segments
Same store, same status: segment add/edit (in `/teacher/materials`) and the new segment link/unlink (Milestone 2) are 100% local — there is no `video_segments` table or endpoint anywhere.

### 3c. Questions
A real backend exists (`question_bank` router: list, get, create, add-choice, add-tag, list/add media, delete-media — 8 endpoints), but it has **no update, no delete, no publish endpoint**, and more importantly: `teacher-question-store.ts`'s create/update/delete/publish never call any of the 8 real endpoints that do exist. The teacher-facing Question Bank is entirely disconnected from its own backend module.

### 3d. Assessments (Quiz/Homework/Exam/Assignment via the unified engine)
Real backends exist for `quizzes` (list/get/create/add-question) and `assignments` (list/get/create/submit) — but the unified `teacher-assessment-store.ts` that the Assessment Engine tab actually uses has **zero API calls anywhere in its 448 lines**. The tab's own UI copy admits this: its Analytics panel literally displays **"No backend analytics yet."**

### 3e. Content Tree
Confirmed unchanged from the earlier audit: 100% local, `localStorage`-only, no backend (no `concepts`/`atomic_concepts` tables exist — already flagged as an open decision in the frozen domain model).

### 3f. Sessions
The one bright spot: Create (`POST /api/lessons`) and List (`GET /api/lessons`) are genuinely wired to the real `lessons` backend (from Milestone 3). Everything else — Update, Publish, Archive, Lock/Unlock, Reorder, Delete — is local-only, because the `lessons` router only exposes `GET` and `POST`; there is no status column on the table at all. Also newly confirmed: the session builder's **"Save Draft" and "Preview" buttons have no click handler whatsoever** (not even local state) — they are currently inert.

---

## 4. What's needed to go live — grouped by effort

### Tier 0 — Zero backend work, pure frontend wiring (cheapest, highest value)
- **Teacher Dashboard**: wire the 3 existing, working endpoints (`summary`, `pending-tasks`, `recent-activity`) into `teacher.index.tsx`, replacing `teacherMock.ts`.

### Tier 1 — Add missing endpoints to already-existing tables
- **Courses**: add `PATCH /api/courses/{id}` (update fields + publish/unpublish) and `DELETE /api/courses/{id}`.
- **Sessions/Lessons**: add a `status` column to `lessons` (or to the future `sessions` table per the frozen domain model — see open question below) plus `PATCH`/`DELETE /api/lessons/{id}`.
- **Questions**: add `PATCH`/`DELETE /api/questions/{id}` and a publish/status mechanism.

### Tier 2 — New backend module needed from scratch
- **Materials + Video Segments**: no table exists at all today. Needs a `materials` table (video/pdf/image/attachment/notes) and a `video_segments` table (or JSON column), plus full CRUD + publish endpoints.

### Tier 3 — Larger architectural work already flagged, now becoming urgent
- **Assessment unification** (Quiz/Homework/Exam/Assignment → one engine): previously deferred in the Sprint 1 plan specifically because it touches the only two tables with real student-attempt data (`quiz_attempts`, `assignment_submissions`). Going live soon makes this decision more urgent, not less risky.
- **Concepts / Atomic Concepts backend**: previously flagged as `HUMAN DECISION REQUIRED` in the frozen domain model (build now vs. defer) — Content Tree, Question tagging, and Assessment concept-filters all currently sit on top of nothing real.

---

## Missing fields / data sources that need your decision before backend work starts

For each of these, the frontend currently shows a confident-looking number that is entirely fake. Before real columns/tables are built, I need to know what the real source of truth should be for each:

1. **Course `enrollmentCount`** — should this come from a new `enrollments` table (which doesn't exist yet either — flagged in an earlier audit as blocking the entire student purchase journey), or a simpler count for now?
2. **Course `revenue`** — depends entirely on Payments/Wallets, both of which are currently empty stub modules (`backend/app/modules/payments/`, `backend/app/modules/wallets/`) with no routes at all.
3. **Course `rating`** — no rating/review mechanism exists anywhere in the backend today. Net-new feature, or drop from the UI for launch?
4. **Course `price`** — currently entered in the create-course wizard but never sent to or returned by the API. Should `courses` gain a `price` column, or does pricing live at the Session level (per the Session Core Blocks Architecture's access-model design), or both?
5. **`assignedAssistant`/`assignedContentManager`** on a course — is this a real feature you want (would need a backend relationship to `users`), or UI that should be removed for launch?

---

## Recommended order of attack

1. Teacher Dashboard wiring (Tier 0) — no backend risk, immediate visible payoff.
2. Courses + Sessions PATCH/DELETE endpoints (Tier 1) — unblocks Publish/Delete across the two most-used pages.
3. Decide the 5 missing-field questions above — these determine the shape of the Tier 1/2 schema work, so answering them now avoids rebuilding endpoints twice.
4. Materials + Video Segments backend (Tier 2).
5. Assessment unification and Concepts/Atomic Concepts (Tier 3) — the two largest, already-flagged architectural decisions.
