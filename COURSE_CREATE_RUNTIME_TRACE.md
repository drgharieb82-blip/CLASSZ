# COURSE CREATE RUNTIME TRACE

**Status: RESOLVED — exact failing step identified with certainty, confirmed directly from the user's real browser session. Root cause found in §5. Fix proposed in §6, not yet applied.**

---

## 0. Environment state discovered before tracing

Before tracing anything, a process inventory turned up a real irregularity:

```
TCP 0.0.0.0:5173  LISTENING  PID 3800
TCP 0.0.0.0:5174  LISTENING  PID 44576
TCP 0.0.0.0:5175  LISTENING  PID 41148
TCP 127.0.0.1:8000 LISTENING PID 11980   (single backend, confirmed only one)
```

**Three separate frontend dev servers are running simultaneously**, on three different ports — leftover from repeated start/stop cycles across this session that did not fully terminate (Windows process trees from `npm run dev` don't always die when the wrapping shell is killed). This matters more than it might look: **`localStorage` is scoped per-origin, and port number is part of the origin.** `http://localhost:5173`, `:5174`, and `:5175` are three *completely separate, non-shared* storage buckets in the browser. A browser tab that first loaded the app on `:5174` (for example, if `:5173` was already busy at the time) has its own independent `classz-auth` entry that has nothing to do with whatever has been tested on `:5173`.

This is directly relevant to the trace below.

---

## 1–13. The trace, step by step

### Reference run (known-good): my own fresh session, `:5173`, current code

| # | Step | Observed |
|---|---|---|
| 1 | Button click | "Save Draft" clicked |
| 2 | React handler | `handleSave(false)` in `teacher.courses.create.tsx` runs, calls `createCourse({ ..., teacherId: user?.id })` |
| 3 | Store function | `teacher-course-store.ts: createCourse` builds `{ title, slug, subject, grade, teacher_id: data.teacherId, description, thumbnail_url, is_published: data.status === "published" }` |
| 4 | API client | `src/lib/api/courses.ts: createCourse(payload)` → `api.post("/api/courses", payload)` |
| 5 | Request payload | `{"title":"Diagnose 422 Test","slug":"diagnose-422-test-jv3v","subject":"Math","grade":"All Levels","teacher_id":"ea38e221-4c45-4387-a000-a890f7b25767","description":null,"thumbnail_url":null,"is_published":false}` — **`teacher_id` is a real UUID** |
| 6 | Authorization header | `Authorization: Bearer eyJhbGci...` present, valid, matches the logged-in session |
| 7 | Network request | Reaches `http://127.0.0.1:8000/api/courses` via the Vite dev proxy |
| 8 | Backend endpoint | `POST /api/courses` → `courses/router.py: create_course` |
| 9 | Backend logs | `INFO: 127.0.0.1:61812 - "POST /api/courses HTTP/1.1" 201 Created` |
| 10 | Validation | Pydantic `CourseCreate` schema accepts the payload — `teacher_id` parses as a valid UUID |
| 11 | Database insert | Row inserted: `id":"1c39d3a0-2fe4-487a-b0cb-35863f721573"` — confirmed via direct SQL query afterward |
| 12 | Response | `201`, full `CourseRead` JSON returned, matches what was inserted |
| 13 | Toast | `"Course saved as draft."` shown |

**Every one of the 13 steps behaves exactly as designed in this session.** This is the fresh session I've been testing against since the last fix.

---

## 2. The contradicting evidence — a second, broken session is active concurrently

The backend's cumulative log (single backend process, port 8000, serving **all** frontend ports simultaneously) shows a very different pattern mixed in with the above:

```
grep -c "teacher_id=TCH-26-0001" /tmp/live_backend.log   ->  18 occurrences
grep -c "422"                     /tmp/live_backend.log   ->  11 occurrences
grep -c "201 Created"              /tmp/live_backend.log   ->  2 occurrences (both mine, traced above)
```

Sample of the failing pattern, interleaved with my own successful requests, including at the very end of the log (i.e. still happening, not historical):

```
INFO: ... "POST /api/courses HTTP/1.1" 201 Created                              <- my test, succeeds
INFO: ... "GET /api/courses?teacher_id=ea38e221-...-...  HTTP/1.1" 200 OK        <- my test, correct UUID
...
INFO: ... "GET /api/courses?teacher_id=TCH-26-0001 HTTP/1.1" 200 OK              <- a DIFFERENT session
INFO: ... "GET /api/courses?teacher_id=TCH-26-0001 HTTP/1.1" 200 OK
INFO: ... "POST /api/courses HTTP/1.1" 422 Unprocessable Content                  <- fails
INFO: ... "POST /api/courses HTTP/1.1" 422 Unprocessable Content                  <- fails again, most recent line in the log
```

**Reproducing the exact failure directly**, to get the real backend error detail (step 10, Validation):

Request:
```json
{
  "title": "Repro Test",
  "slug": "repro-test-xyz",
  "subject": "Math",
  "grade": "All Levels",
  "teacher_id": "TCH-26-0001",
  "is_published": false
}
```

Response — `422`:
```json
{
  "detail": [
    {
      "type": "uuid_parsing",
      "loc": ["body", "teacher_id"],
      "msg": "Input should be a valid UUID, invalid character: expected an optional prefix of `urn:uuid:` followed by [0-9a-fA-F-], found `T` at 1",
      "input": "TCH-26-0001",
      "ctx": { "error": "invalid character: expected an optional prefix of `urn:uuid:` followed by [0-9a-fA-F-], found `T` at 1" }
    }
  ]
}
```

This is a byte-for-byte match for the class of error appearing repeatedly in the live log. **No backend traceback occurs** — this is a clean, expected Pydantic validation rejection (FastAPI does its job correctly here), not a server crash.

---

## 3. Exactly where the flow diverges — pinpointed

Walking the same 13 steps for the **failing** session (reconstructed from what the backend actually received, since I cannot directly inspect that browser tab's memory):

| # | Step | Status |
|---|---|---|
| 1 | Button click | Presumed fine — same UI, same code, same button |
| 2 | React handler | **Diverges here.** `user?.id` in that session's React state does not hold a UUID — it holds the literal string `"TCH-26-0001"` (a public code) |
| 3 | Store function | Faithfully passes through whatever `teacherId` it was given — **not itself broken**, just receiving bad input |
| 4 | API client | Faithfully passes through the payload — **not broken** |
| 5 | Request payload | `"teacher_id":"TCH-26-0001"` — confirms the corruption, unchanged from step 2 |
| 6 | Authorization header | Present (the request reaches the backend and is processed, not rejected at auth) |
| 7 | Network request | Reaches the backend successfully |
| 8 | Backend endpoint | Reached correctly |
| 9 | Backend logs | `422 Unprocessable Content` |
| 10 | **Validation — this is the last step reached** | Pydantic correctly rejects the malformed UUID |
| 11 | Database insert | **Never reached** — request is rejected before any DB interaction |
| 12 | Response | `422` + the JSON body shown above |
| 13 | Toast | Frontend's generic `catch` in `createCourse()` swallows the specific Pydantic detail and shows only "Could not save the course. Check your connection and try again." — technically correct that it failed, but not informative about *why* |

**Conclusion: the request/response pipeline (steps 3 through 13) is not the defect.** Every layer downstream of the React component is behaving exactly as built. The corruption originates at step 2 — the affected browser's `user.id` in the auth store is not a UUID.

---

## 4. Live browser console, provided directly by the user

The user reproduced the failure and shared the real browser console output for `localhost:5177` (a fourth dev server instance, not previously known — see addendum below). Two things in it:

- A pre-existing, unrelated hydration warning (`<a>` cannot be a descendant of `<a>`, in `Logo.tsx`/`AuthLayout.tsx`, on the `/login` page) — cosmetic, predates this investigation, not connected to course creation. Not investigated further.
- `client.ts:26  POST http://localhost:5177/api/courses 422 (Unprocessable Content)` — confirms the failure is real, current, and on the user's actual tab.

### Addendum to §0: a fourth (and, on recheck, sixth) dev server instance

Re-scanning ports without a hardcoded list found **six** frontend dev servers running: `5173, 5174, 5175, 5176, 5177, 5178`. The user's tab is on `:5177`. Fetched that exact port's served source directly (`curl http://localhost:5177/src/routes/__root.tsx`) and confirmed it **is** serving the earlier `login(token, user)` fix correctly — ruling out "wrong/stale server" as the cause.

## 5. Root cause — confirmed directly from the user's actual stored session

Requested the exact `classz-auth` localStorage value from the user's real browser. Result:

```json
{"state":{"token":"dev-token-teacher","user":{"id":"TCH-26-0001","email":"teacher@classz.dev","full_name":"Dr. Layla Hassan","role":"teacher","is_active":true,"internalUUID":"88268df4-a398-46a3-bfdb-7548e44467e6","publicCode":"TCH-26-0001"}},"version":0}
```

**`token: "dev-token-teacher"` is not a JWT.** This is not the real login flow at all (traced in §1) and not the boot-refresh effect (traced and fixed earlier). It is a separate, pre-existing feature: **"Dev Quick Access"**, a set of one-click mock-login buttons rendered on the `/login` page in dev mode only.

`classz-frontend-prototype/src/routes/login.tsx:132`:
```
{import.meta.env.DEV && <DevQuickAccess />}
```

`login.tsx:137-160`:
```js
const mockUsers = [
  { label: "Student (16y)", role: "student", age: 16, name: "Aya Mansour", code: "CLS-26-000001", home: "/student" },
  { label: "Teacher", role: "teacher", age: 35, name: "Dr. Layla Hassan", code: "TCH-26-0001", home: "/teacher" },
  { label: "Parent", role: "parent", age: 42, name: "Mohamed Mansour", code: "PRT-26-0001", home: "/parent" },
  { label: "Admin", role: "admin", age: 30, name: "System Admin", code: "ADM-26-0001", home: "/admin" },
];

function handleQuickLogin(user) {
  login("dev-token-" + user.role, {
    id: user.code,          // <-- bug: a mock public-code string, not a real UUID
    public_code: user.code,
    email: `${user.role}@classz.dev`,
    full_name: user.name,
    role: user.role,
    is_active: true,
  });
  ...
}
```

This directly sets `user.id = "TCH-26-0001"` — a fake public code, never a real database UUID — and a fake token that no backend endpoint can validate. This is a **pre-existing feature, predating every change made in this session**, built for the old fully-mocked/localStorage-only version of the app. It was never updated when Courses (or Sessions, in Milestone 3) became real, API-backed features requiring a genuine `users.id`. This exact incompatibility was already flagged in `MILESTONE_03_REPORT.md`: *"Dev bypass IDs remain incompatible with API-connected routes by design — real login required."*

**Why it partially "worked" and masked itself as intermittent:** `/api/courses` (GET) and `/api/teacher-dashboard/*` don't check the Authorization token at all — confirmed earlier in this session, only `/api/auth/me` does. So browsing courses, loading the dashboard, etc. all silently succeeded with the fake token. Only the one write operation that validates its body strictly — `POST /api/courses`, which requires `teacher_id` to parse as a UUID — ever surfaces the problem, and it does so 100% of the time, every time, for this login path. It was never intermittent; it was this one specific login method being fundamentally incompatible with this one specific real endpoint.

**This has nothing to do with the two things fixed earlier in this investigation** (the `__root.tsx` `setUser()` normalization gap, or the multiple stray dev-server processes). Those were real, separate, legitimate issues, correctly found and fixed — they just weren't this issue.

---

## 6. Proposed fix (not yet applied)

Two ways to make "Dev Quick Access" compatible with the real backend, without removing the convenience it's there for:

| Option | What it does | Trade-off |
|---|---|---|
| **A. Point the mock users at the real seeded launch accounts' UUIDs** | Replace `id: user.code` with the actual `users.id` from the database for student/teacher/admin (confirmed: `admin=98d7d982-...`, `teacher=ea38e221-...`, `student=674bf13e-...`). Keep the instant, no-backend-round-trip click. | Fast, minimal change. Stays a "fake" login (fake token, no real session) — endpoints that ever start checking the Authorization header (none do today except `/api/auth/me`) would still reject it. No seeded `parent` account exists yet, so that button would need a decision (drop it, or seed one). |
| **B. Make Dev Quick Access call the real login endpoint** | `handleQuickLogin` calls `POST /api/auth/login` with the real seeded credentials for that role, exactly like the real login form. | Fully correct, real session, real JWT, works with every current and future endpoint. Requires the backend to be running and reachable (already the operating assumption for everything else in this app). One extra network round-trip on click — negligible. |

**Recommendation: Option B.** It removes this entire category of bug permanently (no more "fake" auth state that only some endpoints happen to ignore), and it costs nothing now that a real backend is expected to be running at all times.

**Not yet applied — waiting for your go-ahead**, per "propose a fix" rather than silently applying one.
