# MILESTONE 3 REPORT — Teacher Dashboard Wiring

**Sprint:** Integration Sprint
**Scope:** Connect an existing, working backend module to its UI. No redesign, no new backend module, no unrelated refactoring/cleanup.
**Note:** A critical, unrelated database/migration issue was discovered while attempting live verification of this milestone — documented separately in `IMPLEMENTATION_BLOCKER.md`. It does not affect the correctness of this milestone's code, which is independently verified below (including direct calls to the real backend against the real database).

---

## 1. What was connected

**Files:**
- Created: `classz-frontend-prototype/src/lib/api/teacher-dashboard.ts`
- Modified: `classz-frontend-prototype/src/routes/teacher.index.tsx`

**Backend (untouched, already existed and already worked):** `backend/app/modules/teacher_dashboard/` — 3 endpoints (`GET /teacher-dashboard/summary`, `/pending-tasks`, `/recent-activity`), already registered in `main.py`, running real DB queries (course/lesson/student/quiz/assignment counts, pending manual-grading queue, last-5 quizzes/assignments). Prior audit established this was fully functional and simply never called by the frontend.

**What changed:**
- New API client (`teacher-dashboard.ts`) mirrors the existing pattern used by `courses.ts`/`chapters.ts`/`lessons.ts` exactly — typed interfaces matching the backend Pydantic schemas verbatim, three thin `api.get()` wrappers.
- `teacher.index.tsx` now fetches all three endpoints on mount and replaces every mock-sourced number with the real equivalent:
  - Total Students, Quizzes Created, Assignments Created stat cards → `summary.total_students` / `quizzes_count` / `assignments_count` (real).
  - Essay/grading queue card → `pending_tasks` from the real endpoint (title, task type, truncated student id, max score, date) — replacing 3 hardcoded essay records.
  - "Recent Sales" table → repurposed to show real "Recent Activity" (merged, sorted `recent_quizzes` + `recent_assignments`) — there is no payments/wallets backend at all yet (confirmed absent in the live-readiness audit), so this section previously showed fabricated dollar amounts with no data behind them; it now shows real content-creation activity instead of continuing to invent financial data.
  - "Active Courses" / "Active Sessions" mini-cards → `summary.total_courses` / `total_lessons` (real; "sessions" maps to the `lessons` table per the existing Session=Lesson convention from Milestone 3 of the original project timeline).
  - Header greeting (teacher name + code) → switched from the `teacherMock.ts` placeholder to `useAuthStore`'s real logged-in user (`full_name`, `publicCode`) — this required no new API call, since the auth store is already populated by a real login; pure reuse of already-existing, already-working state.
  - Monthly Revenue / Wallet Balance → since no payments/wallets backend exists (confirmed, and explicitly deferred by your own decision on course-stats scope), these are now shown as an honest "Coming Soon" card rather than continuing to display invented numbers — consistent with the "Coming Soon" pattern already used elsewhere in this exact codebase (Assessment Analytics, Session Analytics tabs) for genuinely unbuilt features.
  - Team Messages mini-card → dropped the fabricated "12 unread" count (no messaging backend exists); the label remains, the fake number does not.
- `seedTeacherData()` call left untouched (per the "no unrelated cleanup" rule) — it's dead code (returns immediately) per a prior audit, but removing it was not required for this milestone and was left alone.

## 2. Verification performed

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Zero errors in either new/modified file. Total project error count unchanged at 14 (identical, confirmed line-for-line, to the pre-existing baseline). |
| `npx vite build` | Succeeds — `✓ built in 8.73s`. |
| **Live backend, real database** (new for this milestone — the backend actually started successfully) | `GET /api/teacher-dashboard/summary` → `{"total_courses":1,"total_lessons":6,"total_students":1,"pending_grading_count":0,"assignments_count":0,"quizzes_count":0}` — real, live data from the actual Postgres database. `GET /api/teacher-dashboard/pending-tasks` and `/recent-activity` also returned correctly (empty queue/activity, consistent with the real data present in this database — 1 course, 6 lessons, 0 quizzes/assignments yet created). |
| Live browser click-through | **Blocked** — not by this milestone's code, but by a separate, critical, pre-existing database/migration issue (authentication itself 500s for any login attempt against this database) discovered during the attempt. Full detail in `IMPLEMENTATION_BLOCKER.md`. The frontend code's correctness against the real endpoint shapes was confirmed via the direct `curl` calls above, which return exactly the shape `teacher-dashboard.ts`'s TypeScript interfaces expect. |

## 3. Rule compliance

| Rule | Status |
|---|---|
| Never redesign / simplify / replace | ✅ Backend untouched; frontend page keeps its exact layout (same cards, same grid, same sections) — only data sources changed, plus two sections (Revenue/Wallet, Team Messages count) were made honest rather than continuing to show invented numbers |
| Reuse before creating | ✅ Reused the existing, already-working `teacher_dashboard` backend module entirely as-is; reused the existing `useAuthStore` for the header greeting instead of a new call; reused the existing "Coming Soon" UI pattern already present elsewhere in the codebase |
| No unrelated refactoring/cleanup/bug fixing | ✅ `seedTeacherData()`'s dead-code call was left in place; the pre-existing `tsc -b` errors were left untouched |
| Build must finish before moving on | ✅ `vite build` succeeds; isolated `tsc --noEmit` on changed files is clean |
| Preserve UI/UX | ✅ Same page structure; changed content only where it was previously fabricated |

## 4. Discovered, not yet acted on

- **`IMPLEMENTATION_BLOCKER.md`** — critical, cross-cutting: authentication is completely broken against the live database due to a missing column from an unapplied migration, itself caused by a broken Alembic revision chain. This blocks live verification of every milestone in this sprint, and blocks the broader "go live" plan far beyond this milestone. Full evidence and options in that file. **Waiting for your decision before any database action.**
- Once that's resolved, a live browser click-through of this milestone (and a retroactive one for Milestones 1–2) should be done to close the loop — nothing found so far suggests it wouldn't pass, but it hasn't been visually confirmed in a browser.

---

## Next

Paused pending your decision on `IMPLEMENTATION_BLOCKER.md`.
