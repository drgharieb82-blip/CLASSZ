# MILESTONE 4 REPORT — Teacher Registration (Built, Not Integrated)

**Scope, per your explicit decisions:** build teacher self-registration + all requested data + real file upload, as a standalone capability reachable only by direct URL (`/register/teacher`) — not linked from `/login`, `/register`, or any navigation. Backend schema checked against what already existed (empty `teachers` module placeholder, orphaned legacy `teachers` table) before adding anything new, per your instruction to compare and ask first.

---

## 1. What was built

### Backend

| File | What it does |
|---|---|
| `backend/alembic/versions/202607060001_teacher_profile_table.py` | New migration — additive only, does not touch `users` or any other table. Creates `teachers` (1:1 on `users.id`, cascade delete). |
| `backend/app/modules/teachers/models.py`, `schemas.py`, `service.py`, `router.py` | Populated the previously-empty `teachers` module. New endpoint: `POST /api/teachers/register`. Completely separate from `/api/auth/register` — the existing student/parent registration path was not touched at all. |
| `backend/app/modules/uploads/router.py` | New, self-contained file-upload endpoint: `POST /api/uploads`. Local-disk storage (`backend/uploads/`), served back via a `StaticFiles` mount at `/uploads` in `main.py`. |
| `backend/.gitignore` (via root `.gitignore`) | `backend/uploads/` excluded from version control — uploaded files are user data, never committed. |

**Teacher fields** — compared against what existed, then built exactly what you confirmed:

| Field | Source |
|---|---|
| `full_name`, `email`, `password` (hashed) | Already existed on `users` — reused as-is |
| `name_on_id`, `national_id`, `date_of_birth`, `gender` | New — identity verification fields you requested |
| `id_document_url`, `photo_url` | New — real uploaded file URLs (not placeholders) |
| `nickname`, `bio`, `headline`, `specialization` | New — `bio`/`specialization` matched the legacy table shape you confirmed reusing; `headline` mirrors the field already used on the course-creation page; `nickname` matches the pattern already used in student registration |
| `social_links` | New — JSON, same shape as the `SocialLinks` type already used for course pages |
| `mobile_number`, `mobile_verified` | New — `mobile_verified` defaults `false` and is schema-ready only; no verification flow was built, per your own "will add [that] later" |
| `certification_text`, `certification_document_url` | New — both text description and an uploadable document, per your "both" answer |

### File upload — built for real, not a URL placeholder

No upload infrastructure existed anywhere in the codebase before this (confirmed: no `StaticFiles` mount, no `UploadFile` usage, only `python-multipart` sitting installed-but-unused). Built:
- `POST /api/uploads` — accepts `category` (`identity`/`photo`/`certification`) + file, whitelists **content-type** to JPEG/PNG/WEBP/PDF only, caps size at **8MB**, generates a random filename (never trusts the client's filename — avoids path traversal), stores to `backend/uploads/<category>/<random>.<ext>`.
- Verified live: valid upload → `201` + working URL; disallowed type (`application/x-msdownload`) → `415`; disallowed category → `400`; uploaded file fetches back correctly via the static mount.

**One security limitation to flag, not silently glossed over:** validation trusts the client-supplied `Content-Type` header, not the actual file bytes (no magic-byte sniffing). A client could mislabel a file's content-type to bypass the whitelist. This is a reasonable baseline for a not-yet-live feature but should be hardened (e.g. `python-magic` byte sniffing) before this is ever linked into production.

### Frontend

| File | What it does |
|---|---|
| `src/lib/api/client.ts` | Added `uploadFile()` — the existing `api.*` helpers always JSON-encode; file uploads need `FormData`, so this reuses the same base-URL/auth-token/401-handling logic in a new function rather than duplicating it. |
| `src/lib/api/teachers.ts` | New — `registerTeacherApi`, `uploadTeacherFileApi`. |
| `src/routes/register_.teacher.tsx` | New 5-step registration wizard (Account → Identity → Profile → Certification → Review), visually consistent with the existing student wizard's style (same `Field`/`Stepper`/success-card pattern), but a fully separate, self-contained file — the existing student `register.tsx` was not modified. |

**A real bug was found and fixed while building this:** TanStack Router's file-based routing nests dot-separated files under their prefix as a parent layout. `register.teacher.tsx` nested under `register.tsx` — but `register.tsx` is a full page, not a layout with an `<Outlet/>`, so the child route silently never rendered (confirmed live: navigating to `/register/teacher` rendered the student wizard instead). Fixed by renaming to `register_.teacher.tsx` (the trailing underscore is TanStack Router's documented "don't nest" escape) — confirmed via the generated route tree that it now parents off the app root, not `/register`.

---

## 2. Verification performed

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Zero errors in any new/modified file. Same 14 pre-existing baseline errors, unchanged. |
| `npx vite build` | Succeeds; `register.teacher-*.js` appears as its own chunk. |
| Backend boots with new modules | Clean startup, no import errors. |
| `POST /api/uploads` (curl) | Valid image → `201` + URL; bad content-type → `415`; bad category → `400`; uploaded file fetches back → `200`. |
| `POST /api/teachers/register` (curl) | `201`, real `TCH-26-0002` public code, all fields persisted correctly in `teachers` table, cascade-delete confirmed on cleanup. Duplicate email → `409`. |
| **Full live browser run** (Playwright): confirmed `/login` and `/register` do **not** link to `/register/teacher` anywhere; filled all 5 wizard steps including a real file upload for the ID document; submitted | Real success screen rendered with the actual submitted nickname ("Mr. Ahmed"); DB confirmed the row (`TCH-26-0003`, correct `id_document_url` pointing at the actually-uploaded file). |

All test accounts and uploaded test files were deleted after verification — the database is back to exactly the 3 official launch accounts (admin/teacher/student), nothing else.

---

## 3. One thing worth your attention: the sequence collision

Testing `/api/teachers/register` initially failed with a `TCH-26-0001` collision — because the earlier `seed_launch_users.py` script (from the database reset task) hardcoded public codes directly, bypassing the real `seq_teacher_code`/`seq_student_code`/`seq_admin_code` Postgres sequences entirely. I advanced all three sequences to match (`setval(..., 1, true)`) so the next real registration of any of those three roles won't collide. This was a data-state fix, not a schema change, and was necessary for the very registration feature you asked for to work at all.

Separately, this surfaced that `app/core/identity.py`'s `CodeGeneratorService` — despite its docstring claiming it reads from real Postgres sequences in production — actually only keeps **in-memory** counters that reset on every process restart. I did not use it; `teachers/service.py` reads the real sequence directly instead. Flagging this because if `CodeGeneratorService` is ever relied on elsewhere as-is, it would silently produce colliding/reused codes in any multi-worker or restart-prone deployment.

---

## 4. Confirmed: not integrated, per your instruction

- No link from `/login`.
- No link from `/register`.
- No link from any nav menu, dashboard, or anywhere else in the app (repo-wide search confirms zero references outside the route file itself and the auto-generated route tree).
- Reachable only by typing `/register/teacher` directly.

---

## 5. Rule compliance

| Rule | Status |
|---|---|
| Check existing before adding new | ✅ Compared against the empty `teachers` module and the orphaned legacy table before writing any schema |
| Ask before adding new DB fields | ✅ Did this via the two clarifying question rounds before any code was written |
| Reuse existing patterns | ✅ Reused `hash_password`/`create_access_token` (shared core), `format_public_code` (existing, correct half of `identity.py`), the student wizard's visual/structural conventions, the existing `SocialLinks` shape, the existing `api` client's auth/base-URL logic |
| No unrelated refactoring | ✅ `auth/router.py`, `auth/service.py`, and `register.tsx` (student) were not touched at all — this is a fully separate, additive path |
| Build must finish before moving on | ✅ Both `tsc` and `vite build` clean |

---

## Next

Awaiting your decision on when (if ever) to link this into live navigation, and separately, whether to harden the upload validation (magic-byte sniffing) before that happens.
