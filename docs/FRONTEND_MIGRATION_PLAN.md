# CLASSZ Frontend Migration Plan

Tracks the migration from prototype (mock data) to production-ready frontend connected to the FastAPI backend.

## Overview

The `classz-frontend-prototype/` has 83 routes across 9 roles, all rendering with mock data. This plan covers connecting each module to the real backend API incrementally.

## Milestones

### Milestone 0: SPA Conversion ✅ (2026-06-18)

- [x] Create SPA entry (`index.html`, `src/main.tsx`)
- [x] Replace Lovable/Start vite config with standard Vite + TanStack Router plugin
- [x] Add `/api` proxy to FastAPI backend
- [x] Create API client (`src/lib/api/client.ts`)
- [x] Create auth store with Zustand (`src/lib/stores/auth-store.ts`)
- [x] Create route guard helpers (`src/lib/auth-guard.ts`)
- [x] Update `docker-compose.yml` to point to prototype
- [x] Archive SSR files (kept, not deleted)
- [x] TypeScript passes, Vite build passes

### Milestone 1: Authentication ✅ (2026-06-19)

- [x] Backend: implement `POST /api/auth/login`
- [x] Backend: implement `POST /api/auth/register`
- [x] Backend: implement `GET /api/auth/me`
- [x] Backend: implement `get_current_user` dependency (JWT decode → user load)
- [x] Frontend: wire `/login` page to `POST /api/auth/login`
- [x] Frontend: wire `/register` page to `POST /api/auth/register`
- [x] Frontend: replace hardcoded "Alex Rivera" with real user data
- [x] Frontend: add 401 interceptor → redirect to `/login` (existed from M0 in `client.ts`)
- [ ] Frontend: wire route guards to protected routes (deferred — guards exist but not applied, to keep demo browsing alive)

### Milestone 2: Academic Core Wiring (Not Started)

- [ ] Wire `/courses` catalog → `GET /api/courses`
- [ ] Wire `/student/course-details` → `GET /api/courses/{id}`
- [ ] Wire `/student/lesson` → `GET /api/lesson-blocks?lesson_id=X`
- [ ] Wire `/student/lesson` video → `GET /api/videos/{id}`
- [ ] Wire lesson progress → `POST /api/progress/*`
- [ ] Add loading/error states to wired pages

### Milestone 3: Assessment Wiring (Not Started)

- [ ] Wire `/teacher/questions` → `GET /api/questions`
- [ ] Wire `/teacher/questions/create` → `POST /api/questions`
- [ ] Wire `/quiz/start` → `POST /api/quiz-attempts/*`
- [ ] Wire quiz results → `GET /api/results/{attempt_id}`
- [ ] Wire `/teacher/assignments` → `GET /api/assignments`
- [ ] Wire anti-cheating → `POST /api/anti-cheating/events`

### Milestone 4: Teacher Dashboard Wiring (Not Started)

- [ ] Wire `/teacher/` dashboard → `GET /api/teacher-dashboard/*`
- [ ] Wire analytics page with real chart data

### Milestone 5: New Backend Endpoints (Not Started)

- [ ] Student dashboard aggregation endpoint
- [ ] User CRUD endpoints (for admin panel)
- [ ] Pagination on all list endpoints
- [ ] Search/filter query params on courses, questions, users
- [ ] File upload endpoint

### Milestone 6: Extended Modules (Not Started)

- [ ] Parent monitoring endpoints and wiring
- [ ] Finance/payment system
- [ ] Admin CRUD operations
- [ ] Notification system
- [ ] AI assistant chat (requires `ai_core` module)

## Data Flow Pattern

When wiring a page to the backend:

1. Create a typed API function in the module (e.g., `src/lib/api/courses.ts`)
2. Create a React Query hook using `useQuery` / `useMutation`
3. Replace mock data import with the hook in the route component
4. Add loading skeleton and error states
5. Keep mock data file intact — it serves as a type reference and fallback for development

## Testing Strategy

- TypeScript strict mode catches type mismatches between API responses and UI expectations
- Vite proxy eliminates CORS issues during development
- API client handles 401 globally — no per-page auth logic needed
