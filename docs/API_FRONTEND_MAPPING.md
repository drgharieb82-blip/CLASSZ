# CLASSZ API ↔ Frontend Mapping

Maps backend API endpoints to frontend pages. Shows what's wired, what exists but isn't connected, and what's missing entirely.

## Legend

| Status | Meaning |
|--------|---------|
| Wired | Frontend page calls the backend endpoint |
| Ready | Both endpoint and page exist but are not connected |
| Page Only | Frontend page exists, no backend endpoint |
| API Only | Backend endpoint exists, no frontend page uses it |
| Missing | Neither endpoint nor page exists for this feature |

## Academic Core

| Feature | Backend Endpoint | Frontend Page | Status |
|---------|-----------------|---------------|--------|
| List courses | `GET /api/courses` | `/courses`, `/student/courses`, `/teacher/courses`, `/admin/courses` | Ready |
| Course details | `GET /api/courses/{id}` | `/student/course-details` | Ready |
| Create course | `POST /api/courses` | `/teacher/courses` | Ready |
| Create chapter | `POST /api/chapters` | `/teacher/chapters` | Ready |
| Create lesson | `POST /api/lessons` | `/teacher/lessons` | Ready |
| List lesson blocks | `GET /api/lesson-blocks` | `/student/lesson` | Ready |
| Create lesson block | `POST /api/lesson-blocks` | (lesson builder in old frontend) | Ready |
| List videos | `GET /api/videos` | `/student/lesson` | Ready |
| Get video | `GET /api/videos/{id}` | `/student/lesson` | Ready |
| Create video | `POST /api/videos` | — | API Only |

## Assessments

| Feature | Backend Endpoint | Frontend Page | Status |
|---------|-----------------|---------------|--------|
| List questions | `GET /api/questions` | `/teacher/questions`, `/questions/` | Ready |
| Create question | `POST /api/questions` | `/teacher/questions/create` | Ready |
| Add choice | `POST /api/questions/{id}/choices` | `/teacher/questions/create` | Ready |
| List quizzes | `GET /api/quizzes` | `/quiz/start` | Ready |
| Create quiz | `POST /api/quizzes` | — | API Only |
| Start attempt | `POST /api/quiz-attempts/start` | `/quiz/start` | Ready |
| Submit answer | `POST /api/quiz-attempts/{id}/answer` | `/quiz/start` | Ready |
| Submit attempt | `POST /api/quiz-attempts/{id}/submit` | `/quiz/start` | Ready |
| Get result | `GET /api/results/{attempt_id}` | `/quiz/start` (completion screen) | Ready |
| Grade attempt | `POST /api/results/grade/{attempt_id}` | — | API Only |
| List assignments | `GET /api/assignments` | `/teacher/assignments` | Ready |
| Submit assignment | `POST /api/assignments/{id}/submit` | — | Ready |

## Grading & Progress

| Feature | Backend Endpoint | Frontend Page | Status |
|---------|-----------------|---------------|--------|
| Pending grades | `GET /api/grading/pending` | — | API Only |
| Grade submission | `POST /api/grading/{id}/grade` | — | API Only |
| Start lesson | `POST /api/progress/start` | `/student/lesson` | Ready |
| Update progress | `POST /api/progress/update` | `/student/lesson` | Ready |
| Complete lesson | `POST /api/progress/complete` | `/student/lesson` | Ready |

## Anti-Cheating

| Feature | Backend Endpoint | Frontend Page | Status |
|---------|-----------------|---------------|--------|
| Log event | `POST /api/anti-cheating/events` | `/quiz/start` | Ready |
| Auto-submit | `POST /api/anti-cheating/attempts/{id}/auto-submit` | `/quiz/start` | Ready |

## Teacher Dashboard

| Feature | Backend Endpoint | Frontend Page | Status |
|---------|-----------------|---------------|--------|
| Summary | `GET /api/teacher-dashboard/summary` | `/teacher/` | Ready |
| Pending tasks | `GET /api/teacher-dashboard/pending-tasks` | `/teacher/` | Ready |
| Recent activity | `GET /api/teacher-dashboard/recent-activity` | `/teacher/` | Ready |

## AI Content

| Feature | Backend Endpoint | Frontend Page | Status |
|---------|-----------------|---------------|--------|
| Generate content | `POST /api/ai-content/*` (7 endpoints) | `/assistant/*` | Ready (backend needs `ai_core` module) |

## Authentication

| Feature | Backend Endpoint | Frontend Page | Status |
|---------|-----------------|---------------|--------|
| Login | `POST /api/auth/login` | `/login` | Ready |
| Register | `POST /api/auth/register` | `/register` | Ready |
| Get current user | `GET /api/auth/me` | (UserMenu, DashboardLayout) | Ready |
| Logout | — (frontend-only) | (UserMenu) | Page Only |

## Student Features

| Feature | Backend Endpoint | Frontend Page | Status |
|---------|-----------------|---------------|--------|
| Student dashboard | — | `/student/` | Page Only |
| Student progress | — | `/student/progress` | Page Only |
| Leaderboard | — | `/student/leaderboard` | Page Only |
| Certificates | — | `/student/certificates` | Page Only |
| Notifications | — | `/student/notifications` | Page Only |

## Parent Features

| Feature | Backend Endpoint | Frontend Page | Status |
|---------|-----------------|---------------|--------|
| Parent dashboard | — | `/parent/` | Page Only |
| Child progress | — | `/parent/progress` | Page Only |
| Homework | — | `/parent/homework` | Page Only |
| Messages | — | `/parent/messages` | Page Only |
| Attendance | — | `/parent/attendance` | Page Only |

## Admin/Super/Finance/Developer/Content

All pages exist in the frontend with mock data. No backend endpoints exist for these roles.

| Role | Pages | Backend Status |
|------|-------|---------------|
| Admin | 8 pages | Stub router (empty) |
| Super Admin | 4 pages | No module |
| Finance | 5 pages | Stub router (empty) |
| Developer | 7 pages | No module |
| Content Manager | 5 pages | No module |

## System

| Feature | Backend Endpoint | Frontend Page | Status |
|---------|-----------------|---------------|--------|
| Health check | `GET /api/health` | `/developer/api-health` | Ready |
