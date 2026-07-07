# IMPLEMENTATION BLOCKER

**Discovered during:** Milestone 3 (Teacher Dashboard wiring), while attempting live browser verification against the real backend + database.
**Severity:** Critical — this blocks authentication platform-wide, not just this milestone.
**Status:** STOPPED. Waiting for Dr. Ahmed's decision. No database changes were made.

---

## 1. Description

The live Postgres database (`classz-postgres`, already running in Docker, healthy) is stamped at an Alembic migration revision that **does not exist in the current codebase's migration history**. As a direct consequence, the most recent migration in the repo — which adds a `public_code` column to the `users` table — was never applied to this database. The `User` ORM model in the current codebase requires that column. **Every code path that loads a full `User` row — including `/api/auth/login`, `/api/auth/register`, and `/api/auth/me` — currently fails with a 500 Internal Server Error, for any input, including invalid credentials.** No one can authenticate against this database in its current state.

## 2. Evidence

- `docker exec classz-postgres psql -U classz -d classz -c "select * from alembic_version;"` → `202606150001`.
- This revision id does not appear in any migration file in `backend/alembic/versions/`. The full, verified chain in the repo is: `202606120001 → 202606120002 → … → 202606120012 → 202606210001` (12 sequential migrations, verified by reading each file's `revision`/`down_revision` pair — internally consistent, but `202606150001` is not part of it).
- Running `alembic upgrade head` fails immediately: `ERROR [alembic.util.messaging] Can't locate revision identified by '202606150001'`.
- `docker exec classz-postgres psql -U classz -d classz -c "\dt"` lists **51 tables**, including several that exist in the live database but have **no corresponding model or migration anywhere in the current codebase**: `concepts`, `concept_dependencies`, `question_concept_maps`, `memory_events`, `explainable_insights`, `ai_request_logs`, `revision_plans`, and nine separate `student_memory_*` tables (`student_memory_profiles`, `student_memory_summaries`, `student_memory_weaknesses`, `student_memory_strengths`, `student_memory_recommendations`, `student_memory_forgetting_curve`, `student_memory_attention_profiles`, `student_memory_learning_preferences`, `student_memory_study_patterns`, `student_memory_timeline_events`), plus `student_concept_states`. This matches a discovery from an earlier session: a `student_memory` module (and, evidently, a `concepts`-related module) was built in an earlier commit and later **deleted from the codebase** (models, migration file removed) — but the corresponding migration was apparently never rolled back on this database before its file was deleted, which is exactly the kind of event that produces an orphaned revision id like `202606150001`.
- Direct confirmation the break is real and current: `curl -X POST /api/auth/login` with garbage credentials against the live, running backend (started fresh against this database, no other changes) returns `HTTP 500`, not the expected `401`. Root cause traced directly: attempting to `SELECT` a `User` row throws `asyncpg.exceptions.UndefinedColumnError: column users.public_code does not exist` — confirmed via a throwaway script that queried `User` through the app's own ORM session (script made no writes; deleted after, zero residual rows left in the database, verified by re-querying).
- By contrast, endpoints that only aggregate counts without loading full `User`/other-affected rows (e.g. `GET /api/teacher-dashboard/summary`, `GET /api/courses`) **do work correctly** against this same database — this is specifically a full-row-hydration problem on tables whose live schema has drifted from their current model, not a total outage.

## 3. Why implementation cannot continue (on this axis)

- This is unrelated to Milestone 3's actual code change (Teacher Dashboard wiring), which is already complete, `tsc`-clean, and `vite build`-verified, and whose specific 3 endpoints were independently confirmed working via direct `curl` against this same live database (see Milestone 3 report).
- However, it makes **any further live browser verification of this or any other milestone impossible** — every `/teacher/*`, `/student/*`, `/parent/*`, `/admin/*` route requires a login, and login itself 500s unconditionally right now.
- More importantly: this is squarely a **data-model inconsistency / missing database migration** discovered mid-implementation, and per the ground rules I was given, I am not to invent a fix for something this significant myself (repairing an Alembic history and reconciling orphaned tables is exactly the kind of decision — delete the orphaned tables? keep them and reverse-engineer models for them? reset the DB? — that needs your judgment, not mine).
- This also directly threatens the "go live soon" timeline: if this is the shared/staging database intended for launch, **authentication is currently completely non-functional on it**, independent of anything to do with mock data removal or the Integration Sprint.

## 4. Possible options

| Option | What it does | Risk |
|---|---|---|
| **A. Reconcile Alembic history** | Restore (or recreate) the missing `202606150001`-equivalent migration so the chain is complete, decide what to do with the orphaned `concepts`/`student_memory_*`/etc. tables (keep as dead tables, formally adopt them back into the codebase, or drop them), then run migrations forward to head. | Requires deciding the fate of ~12 orphaned tables from a previously-abandoned feature branch. Most correct long-term fix, but the most work. |
| **B. Manually patch just the missing column** | Directly `ALTER TABLE users ADD COLUMN public_code ...` (matching migration `202606210001`'s DDL) and manually stamp `alembic_version` to `202606210001`, without resolving the underlying broken history. | Fastest unblock for login. Leaves the Alembic chain permanently unable to run cleanly from a true baseline, and leaves the orphaned tables unaddressed — future migrations will hit the same class of problem. |
| **C. Reset the database from scratch** | Drop and recreate the database, run migrations `202606120001 → 202606210001` cleanly from empty. | Destroys the existing real data in this database (1 course "Grade 12 Chemistry", 6 lessons, 1 student, and any existing user accounts) — only acceptable if this data is disposable test data, not something to preserve. |
| **D. Point the app at a different, clean database** | Leave this database alone (in case its data or its orphaned tables matter for something), stand up a fresh Postgres instance and run the current migration chain there. | Safest to existing data; but doesn't resolve whatever this database is (a staging/shared DB with a broken chain still exists somewhere). |

## 5. Recommendation

I'd lean toward **Option B first** (fastest, unblocks all authentication immediately, zero data loss) **as an immediate stop-gap**, followed by **Option A** as a deliberate, separate follow-up task once you've decided what the orphaned `concepts`/`student_memory_*` tables should become (this connects directly to the still-open "build Concepts/Student Memory now vs. defer" decision from the frozen domain model — their table shells already exist in this database, which may actually make "build now" cheaper than previously estimated, worth knowing before that decision is finalized). I have not touched the database and won't without your go-ahead, given how much this affects.

---

**Waiting for your decision before any further backend/database action.** Milestone 3's own report follows separately — its code change stands on its own and does not depend on this being resolved.
