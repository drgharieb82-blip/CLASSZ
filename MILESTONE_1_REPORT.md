# MILESTONE 1 REPORT — Assessment Engine ↔ Session Builder

**Sprint:** Integration Sprint
**Scope:** Connect existing modules only. No redesign, no rewrite, no new modules created.
**Source of priority:** `CLASSZ_INTEGRATION_MAP.md`, §E1 — flagged as *"the single highest-value, lowest-effort fix in the entire map"* because the store logic (attach/detach functions, session-scoped filters) already existed and was already correctly written; only the UI to trigger it was missing.

---

## 1. What was connected

**Module pair:** Assessment Engine (`teacher-quiz-store.ts`, `teacher-exam-store.ts`, `teacher-homework-store.ts`) ↔ Session Builder (`teacher.courses.$courseId.sessions.$sessionId.tsx`).

**File modified:** `classz-frontend-prototype/src/routes/teacher.courses.$courseId.sessions.$sessionId.tsx` (only file touched).

**Before:** The Session Builder's left "Assess" panel already loaded and displayed a course's Quizzes, Exams, and Homework (`allQuizzes`/`allExams`/`allHomework`, lines 75/77/79), and the canvas already had correct read-side filters (`quizzes`/`exams`/`homework`, filtered by `sessionIds?.includes(sessionId)`, lines 74/76/78) that would render them as canvas blocks — but nothing in the UI ever called the store's own `attachQuizToSession`/`attachToSession`/`detachFromSession` functions, so those filters always evaluated to empty and the panel items were inert `<div>`s.

**After:**
- The three list sections in the "Assess" panel are now interactive buttons. Each shows whether it is already linked to the open session (checkmark + highlighted border, matching the existing `LibraryItem`/`QuestionItem` visual pattern already used elsewhere on the same page) and toggles attach/detach on click:
  - Quiz → `attachQuizToSession(quizId, sessionId)` / `detachQuizFromSession(quizId, sessionId)` (`teacher-quiz-store.ts`)
  - Exam → `attachToSession(examId, sessionId)` / `detachFromSession(examId, sessionId)` (`teacher-exam-store.ts`)
  - Homework → `attachToSession(hwId, sessionId)` / `detachFromSession(hwId, sessionId)` (`teacher-homework-store.ts`)
- Once attached, the block appears in the Session Canvas immediately — no new canvas logic was needed, since `canvasBlocks` (line ~89) already builds `quiz_block`/`exam_block`/`homework_block` entries from these same filtered arrays.
- **Two latent bugs, made newly reachable by this change, were fixed in the same file** (not new features — corrections to existing logic that would have silently misbehaved the moment a non-material block ever appeared in the canvas, which was impossible before this milestone):
  1. The canvas block delete button unconditionally called `deleteMaterial(block.entityId)` for *any* block type. A new `removeBlock(block)` helper now branches by `block.type`, calling the correct store's detach function for quiz/exam/homework blocks and `deleteMaterial` only for material blocks.
  2. The move up/down buttons operated on a `materials`-only array regardless of which block was clicked, which would have silently reordered unrelated materials (or done nothing) if used on a quiz/exam/homework block. They are now shown only for material blocks (`isMaterialBlock(block)`, checked via the `mat-` id prefix already assigned at block-construction time), since no shared cross-type ordering field exists — introducing one would be a schema/design change, out of scope for this sprint.

No existing store, component, or type was replaced or redesigned. No new store was created. Zero lines changed outside this one route file.

---

## 2. Verification performed

| Check | Result |
|---|---|
| `npx tsc --noEmit` (project-wide) | Zero errors in the modified file. 14 pre-existing errors remain in 5 unrelated files (see §3 — not introduced by this change). |
| `npx vite build` (production bundle) | **Succeeds** — `✓ built in 15.64s`. The modified route's chunk (`teacher.courses._courseId.sessions._sessionId-*.js`) is present in the output. |
| Real store execution (Node, actual project source, no mocks) | Imported the actual `teacher-quiz-store.ts`, `teacher-exam-store.ts`, `teacher-homework-store.ts` modules and exercised the exact functions the UI now calls: create → attach → confirm session-filter match (mirroring the builder's own `sessionIds?.includes(sessionId)` query) → detach → confirm filter match clears. **All checks passed** for all three stores. |
| Live browser click-through | **Attempted, not completed** — see §3 for why, and what would unblock it. |

### 3. What could not be verified live, and why

A full click-through (open Session Builder → click a quiz → see block appear → click again → see it disappear) requires a running instance. This was attempted and blocked by conditions unrelated to this change:

- The backend (Postgres + FastAPI) is not running in this environment, and Docker is unavailable (`docker ps` fails — daemon not running).
- All `/teacher/*` routes are now gated by a client-side auth guard (`src/routes/teacher.tsx:5-9`, `useAuthStore.getState().isAuthenticated`) that redirects to `/login` without a valid session.
- Course, Chapter, and Session data (`teacher-course-store`, `teacher-chapter-store`, `teacher-session-store`) hold **no persisted state** (none of the three use Zustand's `persist` middleware) and their create actions call real backend endpoints (`POST /api/courses`, `/api/chapters`, `/api/lessons`) that fail silently (return `null`) without a backend — so even bypassing the auth guard would not produce a session to open.
- Quiz/Exam/Homework (the module actually being connected) *are* fully local, `persist`-backed, and require no backend — the obstacle is entirely on the Course→Chapter→Session side of reaching the builder page, not on the Assessment Engine side this milestone touched.

Given this, live verification was substituted with direct execution of the real store modules (above), which exercises the identical function calls, arguments, and filter logic the UI now triggers — the same code path, minus the click. This is disclosed rather than assumed: **a live browser confirmation is still recommended** once a backend is available or a dev-mode auth/data bypass exists, and is called out explicitly rather than claimed as done.

---

## 4. Rule compliance

| Rule | Status |
|---|---|
| Never redesign the product | ✅ No type, store, or UI pattern was redesigned — the existing `LibraryItem`/`QuestionItem` isLinked visual convention was reused verbatim for Quiz/Exam/Homework items |
| Never simplify the product | ✅ Nothing was removed; two latent bugs were fixed defensively, not simplified away |
| Never replace a module | ✅ `teacher-quiz-store.ts`/`teacher-exam-store.ts`/`teacher-homework-store.ts` untouched — only consumed |
| Reuse everything possible | ✅ Zero new store functions, zero new types — 100% of the wiring calls functions that already existed with zero callers |
| Connect existing modules before creating new ones | ✅ This entire milestone is exactly that |
| Preserve current UI/UX | ✅ Same panel, same layout, same visual language; items that were static are now interactive in the same style as adjacent, already-interactive items on the same screen |
| Build must finish before moving on | ⚠️ `npm run build` (which chains `tsc -b`) fails at the type-check gate due to 6 pre-existing errors in 5 files not touched by this milestone (`ParentPortalDashboard.tsx`, `app-context.tsx`, `platform-finance-mock-data.ts`, `seed-teacher-data.ts`, `teacher.content-studio.tsx`). These predate this session (present in the working tree before any edits made today). `vite build` (the actual bundler) succeeds. Fixing these is out of scope for "connect existing modules" and would itself violate "never redesign/replace" if done as a drive-by inside this milestone — flagging for a separate, explicit cleanup task rather than silently absorbing it or silently ignoring the rule. |

No `IMPLEMENTATION_BLOCKER.md` was produced for the `tsc -b` finding: it is pre-existing, unrelated broken type-checking in other files — not an architectural conflict, contradictory document, missing DB relationship, product ambiguity, or data-model inconsistency requiring a decision. It's flagged transparently above instead.

---

## 5. Discovered, not yet acted on

- **Assignment** (`teacher-assignment-store.ts`) has the identical `sessionIds`/`attachToSession`/`detachFromSession` shape as Exam/Homework but is not imported into the Session Builder route at all (not even read-only). It was intentionally left out of this milestone to keep the diff minimal and independently verifiable; it is a natural next small addition, symmetrical to what was just done.
- Question Bank ↔ Session Builder (`CLASSZ_INTEGRATION_MAP.md` §D2) has the exact same "wired filter, no write UI" shape as this milestone and is the next-most-analogous fix.

---

## Next

Awaiting instruction to proceed to the next milestone (candidates per the integration map: Question Bank ↔ Session Builder attach UI, or Academic Links ↔ Session Builder's `linkSession` wiring) or a decision on the `tsc -b` pre-existing error cleanup.
