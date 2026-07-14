# TEACHER JOURNEY 01 REPORT — Account → Dashboard → Course

**Result: ALL 10 STEPS PASSED.**
**Method:** Real, live browser session (Playwright, headless Chromium) driving the actual running frontend + backend + Postgres — not a simulation, not unit tests. A brand-new teacher account was registered through `/register/teacher` for this run (not one of the 3 seeded launch accounts), per your instruction. All test data was deleted after verification; the database is back to exactly the 3 official launch accounts and 0 courses.

Screenshots saved to `D:\CLASSZ\verification-screenshots\teacher-journey-01\` (9 screenshots, listed inline below).

---

## Step-by-step results

| # | Step | Result | Evidence |
|---|---|---|---|
| 1 | Register teacher from `/register/teacher` | ✅ PASS | `POST /api/teachers/register` → `201`. Real success screen rendered ("Welcome to CLASSZ! Your teacher account is ready"). Screenshot: `02-step1-success.png` |
| 2 | Login as that teacher | ✅ PASS | Explicitly logged out first (cleared localStorage), then logged in fresh via `/login`. `POST /api/auth/login` → `200`, real JWT returned |
| 3 | Redirect to teacher dashboard | ✅ PASS | Landed on `/teacher/dashboard` automatically after login. Screenshot: `03-step3-dashboard.png` |
| 4 | Open My Courses | ✅ PASS | `/teacher/courses` loaded, correctly showed empty state (0 courses, since this is a brand-new teacher). Screenshot: `04-step4-my-courses-empty.png` |
| 5 | Create Course | ✅ PASS | Navigated to `/teacher/courses/create`, form filled (title="Journey01 Draft Course", subject=Physics) |
| 6 | Save Draft | ✅ PASS | `POST /api/courses` → `201`, `is_published:false`. Redirected to `/teacher/courses`. Screenshot: `06-step6-after-save-draft.png` |
| 7 | Publish Course | ✅ PASS | Created a second course ("Journey01 Published Course", Chemistry) via the "Publish Course" button. `POST /api/courses` → `201`, `is_published:true`. Screenshot: `07-step7-after-publish.png` |
| 8 | Refresh browser | ✅ PASS | Hard reload (`page.reload()`) performed on `/teacher/courses` |
| 9 | Verify course persists from PostgreSQL | ✅ PASS | Both courses still visible after reload, with correct titles, correct draft/published badges, and real public codes (`CRS-B3114B7E`, `CRS-4F537BCE`). Screenshot: `08-step9-after-refresh.png`. **Independently confirmed via direct SQL query** (not just trusting the UI) — see §2 below |
| 10 | Verify teacher dashboard reflects the real course count | ✅ PASS | `GET /api/teacher-dashboard/summary` → `{"total_courses":2,...}`. Dashboard's "Active Courses" mini-card visibly shows **2**. Screenshot: `09-step10-dashboard-count.png` |

---

## 1. API calls used (in sequence, real traffic captured from the live run)

| Step | Method | Endpoint | Status |
|---|---|---|---|
| Register | `POST` | `/api/teachers/register` | 201 |
| Login | `POST` | `/api/auth/login` | 200 |
| Dashboard load | `GET` | `/api/auth/me` | 200 |
| Dashboard load | `GET` | `/api/teacher-dashboard/summary` | 200 (`total_courses:0` — correct, before any course existed) |
| Dashboard load | `GET` | `/api/teacher-dashboard/pending-tasks` | 200 |
| Dashboard load | `GET` | `/api/teacher-dashboard/recent-activity` | 200 |
| My Courses load | `GET` | `/api/courses?teacher_id=<id>` | 200 (`[]`) |
| Create → Save Draft | `POST` | `/api/courses` | 201 |
| My Courses reload | `GET` | `/api/courses?teacher_id=<id>` | 200 (1 course) |
| Chapters count (per course card) | `GET` | `/api/chapters?course_id=<id>` | 200 (`[]`) |
| Create → Publish | `POST` | `/api/courses` | 201 |
| My Courses reload (post-refresh) | `GET` | `/api/courses?teacher_id=<id>` | 200 (2 courses) |
| Dashboard reload (final) | `GET` | `/api/teacher-dashboard/summary` | 200 (`total_courses:2` — confirms step 10) |

No endpoint returned an error, a 4xx, or a 5xx anywhere in this journey.

---

## 2. Database verification (independent of the UI/API — direct SQL)

```
select u.public_code, u.email, u.role, c.title, c.is_published, c.created_at
from users u join courses c on c.teacher_id = u.id
where u.email = 'journey01.teacher@classz-launch.dev'
order by c.created_at;

 public_code |                email                |  role   |           title            | is_published |          created_at
-------------+-------------------------------------+---------+----------------------------+--------------+-------------------------------
 TCH-26-0004 | journey01.teacher@classz-launch.dev | teacher | Journey01 Draft Course     | f            | 2026-07-06 19:55:02.035344+00
 TCH-26-0004 | journey01.teacher@classz-launch.dev | teacher | Journey01 Published Course | t            | 2026-07-06 19:55:06.562269+00
```

Both rows exist, correctly attributed to the real registered teacher (`TCH-26-0004`), with the correct `is_published` flag for each — confirming persistence is real (PostgreSQL), not a client-side illusion.

---

## 3. Screenshots

All saved under `D:\CLASSZ\verification-screenshots\teacher-journey-01\`:

1. `01-step1-review.png` — registration wizard, review step, before submit
2. `02-step1-success.png` — registration success screen
3. `03-step3-dashboard.png` — teacher dashboard immediately after login
4. `04-step4-my-courses-empty.png` — My Courses, empty state (0 courses)
5. `05-step5-create-form.png` — Create Course form filled in
6. `06-step6-after-save-draft.png` — My Courses after Save Draft
7. `07-step7-after-publish.png` — My Courses after Publish Course
8. `08-step9-after-refresh.png` — My Courses after a hard browser reload, both courses still present
9. `09-step10-dashboard-count.png` — Dashboard showing "2 Active Courses"
10. `results.json` — full machine-readable results, network log, and console errors from the run

---

## 4. Bugs fixed as part of this journey

**None required.** Every piece exercised in this journey (registration, login, dashboard wiring, course create/draft/publish) was already built and verified in Milestones 3, 4, and the earlier "Publish/Save Draft not working" fix. This run's purpose was end-to-end confirmation with a genuinely new account, not incremental fixing — and none was needed.

One thing *was* cleaned up, not fixed: two leftover test courses (`QA Test Course`, `QA Publish Course`) from an earlier bug-fix session, tied to the seeded `teacher@classz-launch.dev` account, were still in the database from before this task started. I deleted them to establish a clean baseline count before this run — noted here for transparency, since it affects how "0 courses" in step 4 should be read (it reflects the new teacher's own count, not a claim that the database was empty overall before this task).

---

## 5. Discovered, not fixed (does not block this journey)

**Dashboard subtitle shows "undefined" instead of the real public code.** Visible in screenshot `09-step10-dashboard-count.png`: header reads "Journey01 Teacher · undefined" instead of "Journey01 Teacher · TCH-26-0004". The dashboard reads `user.publicCode` from the auth store, which is correctly populated right after registration/login — but something elsewhere in the app (most likely a `/api/auth/me` refresh calling the store's `setUser()`, which does no field-mapping, versus `login()`, which does) appears to overwrite it with the raw backend field name (`public_code`, snake_case) or leaves it unset. This is cosmetic — it did not block any of the 10 steps, the course counts and persistence are all genuinely correct — but it's a real, reproducible small bug. Not fixed here per "fix only issues that block this journey."

---

## 6. Remaining blockers for future milestones (not this one)

None for this specific journey — it fully passed. For context, still open from prior reports and explicitly out of scope here: Content Studio tabs remain unwired (Materials/Questions/Assessments/Content Tree), Session publish/archive/delete remain local-only, and `/register/teacher` remains intentionally unlinked from any navigation, exactly as instructed.

---

## Confirmed per your rules

- Only this journey's path was touched/tested — no work done on Content Studio or Sessions.
- `/register/teacher` remains unlinked from `/login`, `/register`, or any nav (re-verified: zero references anywhere in the frontend source besides the route file itself and the auto-generated route tree).
- All test accounts, test courses, and test files created during this verification were deleted afterward. Database confirmed back to exactly 3 users (admin/teacher/student) and 0 courses.
