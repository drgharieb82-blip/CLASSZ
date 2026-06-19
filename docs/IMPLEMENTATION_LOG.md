# CLASSZ Implementation Log

Tracks what has been built, when, and key decisions made during implementation. This is the ground truth for any agent or developer continuing the work.

## Milestone 0 — SPA Migration Prep (2026-06-18)

**Branch:** `lovable-ui-import`

**Decision:** `classz-frontend-prototype/` is the official production frontend. The old `frontend/` directory is preserved but deprecated.

**Decision:** Convert prototype from TanStack Start (SSR) to pure SPA mode using TanStack Router. Keep FastAPI backend and docker-compose architecture.

### What Changed

| File | Action | Details |
|------|--------|---------|
| `classz-frontend-prototype/index.html` | Created | SPA entry point with fonts, meta tags, `<div id="root">` |
| `classz-frontend-prototype/src/main.tsx` | Created | React root render with `RouterProvider` |
| `classz-frontend-prototype/src/lib/api/client.ts` | Created | Fetch-based API client with JWT injection and 401 redirect |
| `classz-frontend-prototype/src/lib/stores/auth-store.ts` | Created | Zustand store for user, token, login/logout with localStorage persistence |
| `classz-frontend-prototype/src/lib/auth-guard.ts` | Created | `requireAuth()` and `requireRole()` helpers using TanStack Router `redirect()` |
| `classz-frontend-prototype/Dockerfile` | Created | Multi-stage Docker build (dev with Vite, prod with nginx) |
| `classz-frontend-prototype/vite.config.ts` | Modified | Replaced `@lovable.dev/vite-tanstack-config` with direct Vite plugins; added `/api` proxy to `http://127.0.0.1:8000` |
| `classz-frontend-prototype/package.json` | Modified | Removed `@tanstack/react-start`, `@lovable.dev/vite-tanstack-config`, `nitro`. Added `zustand`, `lightningcss`. Updated scripts |
| `classz-frontend-prototype/src/routes/__root.tsx` | Modified | Removed SSR shell (`shellComponent`, `HeadContent`, `Scripts`, `head()`). Kept `RootComponent`, error boundary, 404 |
| `classz-frontend-prototype/tsconfig.json` | Modified | Added `exclude` for archived SSR files |
| `classz-frontend-prototype/src/routeTree.gen.ts` | Modified | Replaced `@tanstack/react-start` module declaration with `@tanstack/react-router` registration |
| `classz-frontend-prototype/src/components/layout/UserMenu.tsx` | Modified | Changed `/settings/*` links from `<Link>` to `<a>` (routes don't exist yet, pre-existing issue) |
| `docker-compose.yml` | Modified | Changed frontend `build.context` from `./frontend` to `./classz-frontend-prototype` |

### SSR Files Preserved (Archived, Not Imported)

These files are no longer referenced by the SPA entry point but are kept intact for reversibility:

- `src/server.ts` — SSR server entry
- `src/start.ts` — TanStack Start middleware
- `src/lib/config.server.ts` — Server-only config
- `src/lib/api/example.functions.ts` — `createServerFn` example
- `src/lib/error-capture.ts` — SSR error capture
- `src/lib/error-page.ts` — Server-side error HTML
- `src/lib/lovable-error-reporting.ts` — Lovable platform reporting

### Validation Results

- `tsc -b`: passes (0 errors)
- `vite build`: passes (built in ~1.5s)
- `npm install`: 399 packages, 0 vulnerabilities

### How to Revert to SSR Mode

1. Restore `vite.config.ts` to the `@lovable.dev/vite-tanstack-config` wrapper
2. Restore `package.json` deps (`@tanstack/react-start`, `@lovable.dev/vite-tanstack-config`, `nitro`)
3. Restore `__root.tsx` (re-add `shellComponent`, `head()`, `Scripts`, `HeadContent`)
4. Remove `index.html` and `src/main.tsx`
5. Archived SSR files are still in place

---

## Milestone 1A — Backend Auth Endpoints (2026-06-19)

**Branch:** `lovable-ui-import`

**Commit 1 of 3** for Milestone 1 (Authentication).

### What Changed

| File | Action | Details |
|------|--------|---------|
| `backend/app/modules/auth/dependencies.py` | Created | `get_current_user` dependency — extracts JWT from `Authorization: Bearer` header, decodes via python-jose, loads User from DB, rejects inactive accounts |
| `backend/app/modules/auth/schemas.py` | Expanded | Added `LoginRequest`, `RegisterRequest` (with role validator limiting self-registration to student/parent), `AuthResponse` (token + user). Kept existing `Token`. |
| `backend/app/modules/auth/service.py` | Expanded | Added `authenticate_user(email, password, session)` and `register_user(data, session)`. Kept existing `issue_access_token`. |
| `backend/app/modules/auth/router.py` | Expanded | Added `POST /login` (401 invalid creds, 403 inactive), `POST /register` (201 success, 409 duplicate email), `GET /me` (returns authenticated user). Kept existing `GET /jwt-config`. |
| `backend/app/core/permissions.py` | Fixed | `require_roles()` now uses `Depends(get_current_user)` instead of broken `current_user: User | None = None` default. Removed redundant 401 check (handled by dependency). |

### New Endpoints

| Method | Path | Auth | Success | Errors |
|--------|------|------|---------|--------|
| POST | `/api/auth/login` | None | 200 + token + user | 401 bad creds, 403 inactive |
| POST | `/api/auth/register` | None | 201 + token + user | 409 duplicate, 422 validation |
| GET | `/api/auth/me` | Bearer JWT | 200 + user | 401 missing/invalid/expired token |

### Design Decisions

- **`HTTPBearer` over `OAuth2PasswordBearer`**: The frontend sends `Authorization: Bearer <token>` from the Zustand store. `HTTPBearer` matches this pattern directly.
- **Self-registration restricted**: Only `student` and `parent` roles can self-register. Teacher/admin accounts will be admin-created in a future milestone.
- **No migration needed**: The `users` table already has all required columns (`email`, `hashed_password`, `full_name`, `role`, `is_active`).
- **Existing endpoints unchanged**: All 60 existing endpoints remain unauthenticated. Auth will be progressively added in later milestones.

### Validation

- All 5 modified/created files pass `py_compile`
- FastAPI app starts and registers 4 auth routes: `/api/auth/jwt-config`, `/api/auth/login`, `/api/auth/register`, `/api/auth/me`

---

## Milestone 1B — Auth Tests (2026-06-19)

**Branch:** `lovable-ui-import`

**Commit 2 of 3** for Milestone 1 (Authentication).

### What Changed

| File | Action | Details |
|------|--------|---------|
| `backend/tests/test_auth.py` | Created | 15 async tests covering login, register, GET /me, and register→login→me round-trip. Uses in-memory SQLite + httpx ASGI transport — no Docker or PostgreSQL required. |
| `backend/app/modules/auth/dependencies.py` | Fixed | `get_current_user` now converts JWT `sub` string to `uuid.UUID` before querying. Without this, SQLAlchemy's PostgreSQL UUID type crashes when comparing with a plain string. |
| `backend/requirements.txt` | Modified | Added `bcrypt<5` pin — passlib 1.7.4's wrap-bug detection is incompatible with bcrypt 5.x. |

### Tests

| Test | Verifies |
|------|----------|
| `test_login_success` | 200, token + user returned, correct role |
| `test_login_wrong_password` | 401, "Invalid email or password" |
| `test_login_nonexistent_email` | 401 |
| `test_login_inactive_user` | 403, "Account deactivated" |
| `test_register_student` | 201, default role is student |
| `test_register_parent` | 201, explicit parent role accepted |
| `test_register_duplicate_email` | 409, "Email already registered" |
| `test_register_restricted_role_teacher` | 422, teacher can't self-register |
| `test_register_restricted_role_admin` | 422, admin can't self-register |
| `test_register_weak_password` | 422, password < 8 chars rejected |
| `test_me_authenticated` | 200, returns user data from valid token |
| `test_me_no_token` | 401, no Authorization header |
| `test_me_invalid_token` | 401, garbage token |
| `test_me_expired_token` | 401, token with past expiry |
| `test_register_then_login` | Full round-trip: register → login → me |

### Bugs Found and Fixed

1. **UUID string mismatch in `get_current_user`**: The JWT `sub` claim is a string (e.g. `"5b3f013b-c478-47de-..."`) but `User.id` is a PostgreSQL UUID column. SQLAlchemy's UUID type requires a `uuid.UUID` object for comparison, not a raw string. Fixed by parsing `user_id` through `uuid.UUID()` before the query.

2. **bcrypt 5.x incompatibility**: passlib 1.7.4's internal wrap-bug detection sends a >72-byte test password. bcrypt 5.x raises `ValueError` for this. Pinned `bcrypt<5` in requirements.txt. This was a pre-existing issue that would also affect production.

### Test Infrastructure

- **No shared fixtures or conftest.py** — all test helpers are local to `test_auth.py`
- **In-memory SQLite** via `aiosqlite` — tables created/dropped per test
- **httpx ASGI transport** — tests call the real FastAPI app without a running server
- **Dev dependencies** (not in requirements.txt): `pytest`, `pytest-asyncio`, `httpx`, `aiosqlite`, `greenlet`

### Validation

```
15 passed, 3 warnings in 14.42s
```

---

## Milestone 1C — Frontend Auth Wiring (2026-06-19)

**Branch:** `lovable-ui-import`

**Commit 3 of 3** for Milestone 1 (Authentication).

### What Changed

| File | Action | Details |
|------|--------|---------|
| `classz-frontend-prototype/src/lib/api/auth.ts` | Created | `loginApi()`, `registerApi()`, `getMeApi()` — typed wrappers around API client |
| `classz-frontend-prototype/src/routes/login.tsx` | Rewritten | Removed demo role selector. Real API call with loading state and error display. On success: saves token+user to Zustand store, redirects by backend role via `ROLES[role].home`. |
| `classz-frontend-prototype/src/routes/register.tsx` | Modified | Final submit calls `registerApi()`. Shows API errors on step 5. Auto-logs-in on success (saves token+user), then shows success animation and redirects to `/student`. |
| `classz-frontend-prototype/src/components/layout/UserMenu.tsx` | Rewritten | Reads `user` from `useAuthStore`. Shows real name, email, and computed initials. Falls back to "Guest" when not authenticated. Logout clears Zustand store + localStorage, navigates to `/login`. |
| `classz-frontend-prototype/src/routes/__root.tsx` | Modified | Added startup token validation: if a token exists in store, calls `GET /api/auth/me` in a try/catch. On success: refreshes user data. On failure (401/network): silently clears auth state. No redirect — user stays on current page. |

### Design Decisions

- **No route guards applied yet**: `requireAuth()` and `requireRole()` exist from M0 but are not wired to any route's `beforeLoad`. All dashboards remain browsable for demo purposes.
- **No redirect on startup**: `__root.tsx` validates the token silently. If it fails, auth state is cleared but the user is not redirected. This prevents redirect loops and keeps demo browsing working.
- **Login clears demo defaults**: Removed `defaultValue="student@classz.io"` and `defaultValue="password"` from inputs. Email and password fields start empty.
- **Register restricted to student**: The wizard only creates student accounts (backend enforces `student`/`parent` only). The role field is not sent, defaulting to `student`.
- **UserMenu "Switch dashboard" kept**: Authenticated or not, users can still browse all 9 role dashboards via the menu. Guards will be tightened in a future milestone.

### Validation

- `tsc -b --noEmit`: passes (0 errors)
- `vite build`: passes (3.13s, 3085 modules)

---

## Lesson Player Redesign (2026-06-19)

**Branch:** `lovable-ui-import`

Full redesign of the student lesson player from a generic dashboard stub to a premium 3-column learning experience inspired by Coursera/Udemy/Notion, using the existing CLASSZ dark design system.

### What Changed

| File | Action | Details |
|------|--------|---------|
| `src/components/lesson/LessonPlayerLayout.tsx` | Created | 3-column responsive layout: left course sidebar (260px), center content area (flex), right info panel (280px). Mobile: both sidebars collapse into animated sheet overlays. Includes its own header with logo, theme/lang toggles, and user menu. |
| `src/components/lesson/CourseSidebar.tsx` | Created | Course card with emoji/progress, chapter accordion with lesson list, certificate card. Uses ScrollArea for overflow. |
| `src/components/lesson/ChapterAccordion.tsx` | Created | Expandable chapters using Radix Accordion. Shows completion count per chapter. |
| `src/components/lesson/LessonItem.tsx` | Created | Lesson row: status icon (check/play/circle/lock), title, duration. Active lesson gets gradient-brand highlight. |
| `src/components/lesson/LessonHeader.tsx` | Created | Breadcrumb nav, lesson number, title, description, progress bar. |
| `src/components/lesson/ContentPlayer.tsx` | Created | Mock video player with 16:9 aspect ratio, play/pause button, progress scrubber, volume/settings/fullscreen controls. Supports video/text/pdf/youtube type placeholders. |
| `src/components/lesson/LessonNavigation.tsx` | Created | Previous/Mark Complete/Next button bar using GradientButton. |
| `src/components/lesson/LessonContent.tsx` | Created | Rich content blocks: text, equations (monospace), notes (primary callout with lightbulb), warnings (warning callout), images (placeholder). |
| `src/components/lesson/LessonTabs.tsx` | Created | 6-tab panel (Overview, Notes, Attachments, Q&A, Discussion, AI). Overview renders LessonOverviewCard + LessonProgressCard + TeacherCard. Other tabs show placeholder states. |
| `src/components/lesson/LessonOverviewCard.tsx` | Created | Objectives list, key concepts tags, duration and content type stat cards. |
| `src/components/lesson/LessonProgressCard.tsx` | Created | Circular SVG progress ring with gradient stroke, watched/remaining time. |
| `src/components/lesson/TeacherCard.tsx` | Created | Teacher avatar, name, subject, profile link. |
| `src/routes/student.lesson.tsx` | Rewritten | Replaced GenericDashboard with full LessonPlayerLayout. No longer wraps in DashboardLayout — uses its own full-screen layout. |
| `src/lib/mock.ts` | Expanded | Added `lessonPlayerData` with course info, 4 chapters / 14 lessons (with completed/active/available/locked states), and current lesson with objectives, key concepts, and 8 content blocks (text, equations, notes, warnings). |

### Components Removed From This Page

- `GenericDashboard` (area chart, donut chart, stat cards, student table) — none of this was lesson-related
- `DashPage` wrapper — the lesson player uses its own `LessonPlayerLayout`

### Responsive Behavior

| Breakpoint | Left Sidebar | Right Panel |
|-----------|-------------|-------------|
| `xl` (1280px+) | Visible 260px | Visible 280px |
| `lg` (1024–1279px) | Visible 260px | Sheet overlay |
| `<lg` | Sheet overlay | Sheet overlay |

### Validation

- `tsc -b --noEmit`: passes (0 errors)
- `vite build`: passes (3.42s, 3103 modules, lesson chunk 44KB)

---

## Student Dashboard Redesign (2026-06-19)

**Branch:** `lovable-ui-import`

Full redesign of the student dashboard from an analytics view to an action-first, decision-first experience. Inspired by Duolingo's "what to do next" pattern, not admin analytics.

### What Was Removed From This Page

- `AnimatedStats` — 4 stat cards (courses enrolled, streak, XP, goals met)
- `PremiumChartCard` with `AreaTrend` — weekly XP area chart
- `ProgressRing` — "Overall progress 68%" aggregate ring
- `PremiumChartCard` with `RadarScores` — subject mastery radar chart
- `CourseCard` grid with old "Continue learning" section
- Hardcoded "Up next: Chain Rule" card

### What Was Added

| Component | File | Purpose |
|-----------|------|---------|
| `ContinueLearningCard` | `components/student/ContinueLearningCard.tsx` | Hero card: resume last lesson with course/chapter/lesson/progress context and resume button |
| `TodayMissionCard` | `components/student/TodayMissionCard.tsx` | Daily action plan: AI-curated recommendations with priority dots and action types (lesson/practice/revision) |
| `AttentionCard` | `components/student/AttentionCard.tsx` | High-priority items: upcoming quizzes, assignments, announcements, newly unlocked lessons with countdown badges |
| `WeakPointsCard` | `components/student/WeakPointsCard.tsx` | Concept-level weak points across all courses with priority bars (Critical/Needs work/Review) |
| `RevisionDueCard` | `components/student/RevisionDueCard.tsx` | Spaced-repetition: lessons due for review with overdue/due urgency indicators |
| `AchievementsCard` | `components/student/AchievementsCard.tsx` | Compact: streak, XP, badge stack — no charts, just numbers |
| `AICoachCard` | `components/student/AICoachCard.tsx` | Personalized AI suggestion with action buttons (weak spots, study plan, ask anything) |
| `CourseProgressCard` | `components/student/CourseProgressCard.tsx` | Per-course progress card: emoji, progress bar, lessons count, teacher. No aggregate. |
| `AnnouncementsCard` | `components/student/AnnouncementsCard.tsx` | Teacher announcements across all enrolled courses with unread indicators |
| `ParentMessagesCard` | `components/student/ParentMessagesCard.tsx` | Family messages (bottom, low priority) |

### Card Order (Top to Bottom)

1. Continue Learning (hero, full-width)
2. Today's Mission + Attention Needed (2-col)
3. Weak Points + Revision Due (2-col)
4. Achievements (full-width, compact)
5. AI Coach (full-width)
6. Progress by Course (3-col grid, per-course)
7. Announcements + Parent Messages (2-col)

### Design Decisions

- **No overall progress** — progress is per-course only. A 68% aggregate across different courses is meaningless.
- **Weak points are concept-level** — "Chemical Equilibrium" not "Chemistry". Atomic concepts the student can actually practice.
- **Attention Needed is high-priority** — quizzes with 3-day countdown get destructive red badges. New unlocks get green "New" badges.
- **AI Coach gives specific advice** — "focus on Chemical Equilibrium and Newton's Third Law today" with action buttons, not a generic "Ask AI" button.
- **Parent Messages at bottom** — low priority, only shown if messages exist.

### Validation

- `tsc -b --noEmit`: passes (0 errors)
- `vite build`: passes (2.18s, 3113 modules, student dashboard chunk 17.8KB)

---

## Student Dashboard v2 — Desktop Layout & Wall of Honor (2026-06-19)

**Branch:** `lovable-ui-import`

Replaces the previous student dashboard commit with a wider desktop layout, new components, and richer card content. This is not a separate page — it amends the same `/student` route with an improved grid and additional features.

### Layout Changes

| Row | Old Layout | New Layout |
|-----|-----------|------------|
| 1 | Separate ContinueLearningCard + 2-col grid | Full-width TodayMissionCard hero with 3 tiers + embedded continue-learning strip |
| 2 | 2-col (mission + attention) | 3-col (weak points + revision + attention) |
| 3 | Stacked (achievements, AI coach) | `2fr 1fr` (AI coach + achievements/favorite stacked) |
| 4 | 3-col course grid | Same, but cards now include last lesson + resume button |
| 5 | (none) | Full-width Wall of Honor carousel (NEW) |
| 6 | 2-col (announcements + parent) | Same |

### Components Changed

| Component | Change |
|-----------|--------|
| `TodayMissionCard` | Rewritten: 3 tiers (Must Do Today / Recommended / Optional) with colored dots. Gradient border. Embedded continue-learning footer strip. Horizontal mission items on desktop. |
| `AttentionCard` | Rewritten: grouped by priority tier (Overdue / Today / Tomorrow / Upcoming) with colored section headers. |
| `AICoachCard` | Rewritten: 5 action buttons (Build Study Plan, Generate Quiz, Explain Weak Points, Review Due Lessons, Ask Anything). Longer personalized recommendation text. |
| `AchievementsCard` | Rewritten: vertical stat rows (streak, XP, weekly rank, total badges, best subject) + recent badge emojis. |
| `CourseProgressCard` | Rewritten: added last lesson name, added Resume button. |
| `ContinueLearningCard` | **Deleted** — merged into TodayMissionCard footer. |

### New Components

| Component | File | Purpose |
|-----------|------|---------|
| `WallOfHonorCard` | `components/student/WallOfHonorCard.tsx` | Course leaderboard carousel with prev/next arrows + dot navigation. 3 tabs (Top XP, Quiz Scores, Top Streak). Two-panel layout: Top 10 with medals (gold/silver/bronze) + "Around Me" (2 above, 2 below). Current student highlighted with gradient-brand. |
| `FavoriteCourseCard` | `components/student/FavoriteCourseCard.tsx` | Most-studied course this week: emoji, teacher, study hours. Stacked below Achievements in 1/3 column. |

### Mock Data Expanded

- `todayMission` restructured into `{ mustDo, recommended, optional }` tiers
- `attention` items now include `tier` field for priority grouping
- `achievements` expanded with `weeklyRank`, `totalBadges`, `bestSubject`, `recentBadges`
- `courseProgress` items now include `lastLesson` field
- `favoriteCourse` object added
- `wallOfHonor` array: 3 courses, each with `top10`, `aroundMe`, `myRank`, `myXp`

### Validation

- `tsc -b --noEmit`: passes (0 errors)
- `vite build`: passes (1.49s, 3114 modules, student dashboard chunk 24.9KB)

---

## Student Dashboard v3 — Visual Polish (2026-06-19)

**Branch:** `lovable-ui-import`

Visual rework to match reference screenshot style. Same card structure, upgraded visual density and flair.

### Key Visual Changes

| Component | Before | After |
|-----------|--------|-------|
| `WallOfHonorCard` | Plain list with emoji medals | Podium-style top 3 with large circular avatars, colored rings (gold/silver/bronze), elevated 1st place. "Around Me" section with avatar bubbles and gradient-highlighted "You" row with glow effect. Position indicator card with large rank number. |
| `AchievementsCard` | Stacked rows with small text | Grid of BigStat tiles: 10×10 icon boxes with colored backgrounds (orange/amber/primary/fuchsia/success), large numbers, badge emoji stack |
| `AICoachCard` | Small icon, compact | 12×12 gradient icon with glow, "Your personal study assistant" subtitle, larger ambient glow blobs |
| `WeakPointsCard` | `p-5` padding | `p-6` padding, `mb-5` header spacing |
| `RevisionDueCard` | `p-5` padding | `p-6` padding, `mb-5` header spacing |

### Validation

- `tsc -b --noEmit`: passes (0 errors)
- `vite build`: passes (1.43s, 3114 modules, student dashboard chunk 27.9KB)

---

## Wall of Honor — Compact & Finalize (2026-06-19)

**Branch:** `lovable-ui-import`

### Final State

The Wall of Honor is a single compact card with:
- **Header**: Trophy icon, course name, 3 tabs (Top XP / Quiz Scores / Top Streak), prev/next course arrows — all in one row
- **Podium**: Top 3 as circular avatars with colored rings (gold/silver/bronze) and medal emojis. 1st place slightly elevated and larger (14×14 vs 10×10).
- **Remaining ranks**: Rows 4–10 in tight list format. "You" row highlighted with `gradient-brand` if present in top 10.
- **Your Rank badge**: Small square card beside the list showing rank number + XP. No "Around Me" section.
- **Dot navigation**: Course carousel dots at the bottom.

### Removed in this iteration
- "Around Me" section (2 students above, 2 below) — removed for compactness
- Large "Your position #14 out of 34 students" frame — replaced with small inline badge

### Known Visual Limitations

1. **Podium is flat** — top 3 avatars are displayed inline. No elevated podium blocks or trophy stands. Works but lacks the dramatic visual impact of gaming leaderboards.
2. **No animation** — course carousel switches instantly. No slide or fade transition between courses.
3. **Quiz Scores and Top Streak tabs** show the same XP data — they're visual placeholders until the backend provides distinct ranking metrics.
4. **No student avatars** — uses initials fallback. Real avatar support requires a user profile image field.
5. **Static mock data** — leaderboard data is hardcoded. Needs backend endpoints for real rankings.

### Desired Future Direction

The Wall of Honor should evolve from a simple leaderboard into a **prestige and rivalry system** that drives daily engagement. Design references:

- **Duolingo Leagues**: Weekly promotion/demotion between tiers (Bronze → Silver → Gold → Diamond). Students compete within their tier, top 10 promote, bottom 5 demote. Creates weekly reset urgency.
- **Clash Royale Ladder**: Trophy-based progression with arenas. Each course could have its own arena (Beginner → Scholar → Master → Legend). Visual arena backdrop changes with rank.
- **FIFA Champions Podium**: Cinematic top-3 reveal with trophy animation, confetti, and spotlight effects. The podium should feel like an award ceremony, not a data table.
- **Stronger rivalry**: Show the student directly above them ("Beat Sara Hassan to reach #13 — you need 100 more XP"). Nudge notifications when someone passes them.

These changes require backend support (ranking endpoints, tier system, weekly reset cron) and are outside the scope of the current frontend milestone.

### Validation

- `tsc -b --noEmit`: passes (0 errors)
- `vite build`: passes (1.39s, 3114 modules)

---

## Student Dashboard v4 - Screenshot Alignment & Prestige Wall (2026-06-19)

**Branch:** `lovable-ui-import`

Incremental refinement of the existing `/student` dashboard to align more tightly with the supplied screenshot and JSON without changing routing, auth, or page architecture.

### What Changed

| Component | Change |
|-----------|--------|
| `src/routes/student.index.tsx` | Rebalanced the page to the screenshot structure: Today's Mission hero, 4-card decision row, 3-card coach/achievement/favorite row, then Wall of Honor. Removed the in-route Progress by Course and messages sections from this page without deleting their components. |
| `TodayMissionCard` | Reworked into a denser hero with three action columns plus a dedicated `Start Today` rail and compact continue-learning footer. |
| `WeakPointsCard` | Restyled to match the new premium card language and switched to explicit High/Medium/Low urgency badges. |
| `RevisionDueCard` | Updated to screenshot-style due chips (`Due today`, `In 1 day`) and richer icon treatments. |
| `AttentionCard` | Simplified into direct status rows (`Overdue`, `Due today`, `Due tomorrow`, `New`) rather than grouped analytics-like sections. |
| `UpcomingEventsCard` | Added as a new fourth card in row 2 because the screenshot includes a dedicated upcoming-events card and none existed previously. |
| `AICoachCard` | Now accepts structured summary/plan data and mirrors the screenshot's recommendation panel plus five CTA buttons. |
| `AchievementsCard` | Rebuilt into larger stat tiles to match the screenshot's emotional achievement treatment. |
| `FavoriteCourseCard` | Expanded to include weekly hours, lessons completed, progress bar, and CTA instead of the prior compact summary. |
| `WallOfHonorCard` | Rebuilt from the compact leaderboard into a prestige layout: podium left, glowing rank card center, around-me plus top-performers panel right, course switching arrows, tab switching, and motion transitions. |
| `src/lib/mock.ts` | Preserved the old `studentDashboard` mock and added a new `studentDashboardPrestige` dataset used only by the updated route. |

### Validation

- `npx tsc -b --noEmit`: passes (0 errors) when rerun outside the sandbox
- `npx vite build`: passes (1.52s) when rerun outside the sandbox

### Follow-up Polish

- Added horizontal arrow navigation to `Today's Mission` so extra mission frames remain reachable instead of clipping.
- Tightened responsive widths in `AI Coach`, `Achievements`, and `Favorite Course` to prevent header/content overflow.
- Rebalanced `Wall of Honor` header and column relationships using `min-w-0`, flexible course selector sizing, and safer large-screen breakpoints.
