# DATABASE LAUNCH RESET REPORT

**Executed:** per Dr. Ahmed's explicit approval — fresh launch database, legacy preserved (not reset or deleted), migrations run from zero, minimum users seeded, authentication verified end-to-end before any further implementation.
**Result: SUCCESS.** All 7 steps completed. Authentication verified via real HTTP calls (curl) and a real browser session (Playwright) for all 3 roles.

---

## 1. Legacy database preserved (not reset, not deleted)

Two independent preservation measures were taken — the original database was neither reset nor deleted:

- **Live, queryable copy:** the original `classz` database was renamed to `classz_legacy` via `ALTER DATABASE classz RENAME TO classz_legacy` — a metadata-only operation; every row, every table (including the 12 orphaned tables from the deleted `concepts`/`student_memory` feature — see `IMPLEMENTATION_BLOCKER.md`) remains fully intact and queryable under the new name, in the same running Postgres container.
- **Portable file backup:** a full `pg_dump` (custom format) of the original database was also taken before the rename, saved at `backend/db_backups/classz_legacy_20260706_182128.dump` (168 KB) — independent of the container's lifecycle, restorable with `pg_restore` at any time.

Nothing was dropped. Nothing was overwritten. Both the live renamed copy and the file backup point at the exact same original data.

## 2. New clean launch database created

`CREATE DATABASE classz OWNER classz` — a genuinely empty database, using the same name (`classz`) the application already expects by default (`Settings.postgres_db = "classz"`), so no environment variable changes are needed going forward.

## 3. Current repo migrations run from zero

Running `alembic upgrade head` against the new empty database **initially failed** — a real, pre-existing bug was found and had to be fixed to complete this step (see §5 below). After the fix, all 13 migrations (`202606120001` → `202606210001`) ran cleanly in sequence with zero errors. Final state verified directly:

```
alembic_version: 202606210001   (the true, current head)
25 tables total — courses, chapters, lessons, lesson_blocks, lesson_progress,
users, videos, questions, question_categories, question_choices, question_tags,
question_tag_links, question_media, question_results, quizzes, quiz_questions,
quiz_attempts, quiz_answers, quiz_results, assignments, assignment_submissions,
submission_files, manual_grades, anti_cheating_events, alembic_version
```

This matches the current codebase's models exactly — no orphaned tables, no drift, no unexplained columns. This is the clean baseline `IMPLEMENTATION_BLOCKER.md` called for.

## 4. Minimum launch users seeded

A reusable, idempotent script was added: `backend/scripts/seed_launch_users.py`. It creates exactly 3 accounts (skips any that already exist, safe to re-run):

| Role | Email | Password | Public code |
|---|---|---|---|
| Admin | `admin@classz-launch.dev` | `LaunchAdmin123!` | `ADM-26-0001` |
| Teacher | `teacher@classz-launch.dev` | `LaunchTeacher123!` | `TCH-26-0001` |
| Student | `student@classz-launch.dev` | `LaunchStudent123!` | `CLS-26-000001` |

**These are placeholder credentials for verification only — rotate/replace before any real launch.** Confirmed via direct query: exactly these 3 rows exist in the new database, nothing else.

The script sets `public_code` explicitly. This was necessary — see the second finding in §5; the normal registration path does not set this field itself.

## 5. Two pre-existing bugs discovered and required to complete this task

### 5a. Migration `202606120001` could not run on a genuinely empty database (fixed)

`role_enum.create(op.get_bind(), checkfirst=True)` (an explicit type-creation call) was followed by `op.create_table(..., sa.Column("role", role_enum, ...))`, where `role_enum` still carried SQLAlchemy's default `create_type=True`. On a genuinely empty database, this causes `CREATE TYPE role_enum` to be attempted twice in the same transaction → `DuplicateObject: type "role_enum" already exists` → the entire migration transaction rolled back.

This is very likely the root cause of how the legacy database ended up in its broken state in the first place: this migration chain may never have been successfully run start-to-finish against a truly empty database before now — every other migration that follows the identical explicit-create pattern (`block_type_enum`, `video_provider_enum`, `question_type_enum`, `difficulty_enum`, `attempt_status_enum`, `submission_status_enum`, `grade_status_enum`, `event_type_enum` — 8 more files) was checked individually and **all 8 already correctly avoid this** by declaring a second, `create_type=False` variant of the enum for use inside `op.create_table`. Only `202606120001_create_users_table.py` was missing that second variant.

**Fix applied** (the only code change made during this task): removed the redundant explicit `role_enum.create(...)` call in `backend/alembic/versions/202606120001_create_users_table.py`, since `op.create_table` already creates the type as part of table creation. No column, table, or type definition changed — only the duplicate creation path was removed. Confirmed: migrations now run start-to-finish with zero errors.

### 5b. Real user self-registration is broken on any correctly-migrated database (found, NOT fixed — flagging for your decision)

While verifying auth, I tested `POST /api/auth/register` (the real endpoint students/parents use to self-register) against the new, cleanly-migrated database. **It returns HTTP 500.**

Root cause: `register_user()` (`backend/app/modules/auth/service.py`) constructs a new `User(...)` without setting `public_code` — but `public_code` is a `NOT NULL` column with no database-level default (the migration only backfills existing rows at migration time; it does not add a trigger or server-side default for future inserts). Every new registration attempt violates the NOT NULL constraint and 500s.

**This was not fixed** — it's outside the 7 steps you specified for this task, and deciding how new users should get a `public_code` (e.g., using the `seq_*_code` sequences the identity migration already created, which currently sit completely unused) is a real design choice, not a one-line patch. **Flagging this now because it directly affects "going live soon": as things stand, no new student or parent could successfully create an account.** Recommend this becomes the very next fix before real users are ever pointed at this database.

## 6. Authentication verified end-to-end

**Direct HTTP verification** (backend run locally against the new database, via `curl`):
- `POST /api/auth/login` → `200`, valid JWT returned, for all 3 seeded accounts (admin, teacher, student).
- `GET /api/auth/me` with each token → `200`, correct `id`/`public_code`/`email`/`full_name`/`role` returned, for all 3.

**Real browser verification** (Playwright, frontend dev server + backend + database, all genuinely running together — the first successful live browser check in this entire sprint, now that auth actually works):
- Teacher login → redirected to `/teacher/dashboard`. Screenshot confirms the Milestone 3 dashboard renders correctly with **real** seeded data: header shows "Launch Teacher · TCH-26-0001" (not the old mock "Dr. Layla Hassan"), "1 Total Students", "0 Quizzes Created", "0 Assignments Created", a "Coming Soon" badge on Monthly Revenue, and correct empty states ("Nothing pending grading right now", "No recent quizzes or assignments yet").
- Admin login → redirected to `/admin`.
- Student login → redirected to `/student`.
- No console errors related to the dashboard or auth flow (one pre-existing, unrelated hydration warning about a nested `<a>` tag fires on the login page itself, before any of this session's code runs — not a functional error, not touched).

## 7. Cleanup performed

- Backend and frontend dev processes stopped after verification.
- Database re-queried after all steps to confirm exactly 3 users exist (`admin@classz-launch.dev`, `teacher@classz-launch.dev`, `student@classz-launch.dev`) — no stray test rows left from the earlier blocked attempt (that attempt failed before any write occurred, confirmed at the time).
- `backend/scripts/seed_launch_users.py` kept intentionally (idempotent, reusable for any future fresh database).

---

## Files changed/added in this task

| File | Change |
|---|---|
| `backend/alembic/versions/202606120001_create_users_table.py` | Removed one redundant `role_enum.create(...)` call (bug fix required to run migrations from zero — see §5a) |
| `backend/scripts/seed_launch_users.py` | New — idempotent launch-user seeding script |
| `backend/db_backups/classz_legacy_20260706_182128.dump` | New — full backup of the original database before rename |
| Database (server-side, not a code file) | `classz` renamed to `classz_legacy`; new empty `classz` created, migrated to head, seeded with 3 users |

---

## Summary for launch planning

- ✅ Legacy data fully preserved, two ways (renamed live copy + file backup).
- ✅ Clean launch database now matches the current codebase exactly, no drift.
- ✅ Admin, teacher, and student can all log in and reach their dashboards — verified live, not just in theory.
- ⚠️ **New user registration is currently broken** on any correctly-migrated database (§5b) — needs a decision and a fix before real users arrive. This is the natural next task.
- ⚠️ The bcrypt/passlib version-detection warning seen during seeding (`"(trapped) error reading bcrypt version"`) is a harmless, caught warning from a passlib/bcrypt version mismatch in the installed dependencies — password hashing worked correctly (confirmed by successful logins) but this dependency pairing should be updated at some point to remove the noise.

**Ready to continue implementation now that auth is verified**, per step 7 of your instructions. Awaiting direction on the next milestone (and/or a decision on the §5b registration bug).
