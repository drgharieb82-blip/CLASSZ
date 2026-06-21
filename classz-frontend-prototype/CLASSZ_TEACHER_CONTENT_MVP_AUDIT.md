# CLASSZ Teacher Content MVP Audit

**Date:** 2026-06-21
**Branch:** lovable-ui-import
**Method:** Source code inspection (no changes made)
**Scope:** Teacher content creation flow: Course → Chapter → Session → Material → Quiz

---

## Summary

16 teacher routes exist. Only 4 are functional (dashboard, students, revenue, sessions UI). The rest are generic placeholders using `GenericDashboard`. No CRUD operations exist anywhere — all pages are read-only.

---

## Existing Pages

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/teacher` | `teacher.index.tsx` | **Complete** | Real dashboard with revenue, essay queue, recent sales, quick actions |
| `/teacher/courses` | `teacher.courses.tsx` | **Placeholder** | Generic chart dashboard, no course list |
| `/teacher/chapters` | `teacher.chapters.tsx` | **Placeholder** | Generic chart dashboard |
| `/teacher/lessons` | `teacher.lessons.tsx` | **Placeholder** | Generic chart dashboard |
| `/teacher/sessions` | `teacher.sessions.tsx` | **Partial** | Mock session list with status/price/items, Create button (non-functional) |
| `/teacher/questions` | `teacher.questions.tsx` | **Placeholder** | Generic chart dashboard |
| `/teacher/questions/create` | `teacher.questions.create.tsx` | **Placeholder** | Generic chart dashboard, no form |
| `/teacher/quizzes` | `teacher.quizzes.tsx` | **Partial** | Mock quiz list with analytics button |
| `/teacher/assignments` | `teacher.assignments.tsx` | **Placeholder** | Generic chart dashboard |
| `/teacher/students` | `teacher.students.tsx` | **Complete** | FilterBar + Pagination + country filters |
| `/teacher/revenue` | `teacher.revenue.tsx` | **Complete** | FilterBar + Pagination + multi-currency |
| `/teacher/analytics` | `teacher.analytics.tsx` | **Partial** | Real data: top sessions, difficult concepts, at-risk students, drop-offs |
| `/teacher/rewards` | `teacher.rewards.tsx` | **Partial** | Coupons/scholarships/gifts UI, no submission |
| `/teacher/team` | `teacher.team.tsx` | **Partial** | Team list with permissions display |
| `/teacher/chat` | `teacher.chat.tsx` | **Partial** | Channel list + mock messages |
| `/teacher/generator` | `teacher.generator.tsx` | **Partial** | Tool cards, some "coming soon" |

---

## Missing Pages

| Route | Purpose | Priority |
|-------|---------|----------|
| `/teacher/courses/create` | Create new course form | **Critical** |
| `/teacher/courses/$courseId` | Course detail/edit page | **Critical** |
| `/teacher/courses/$courseId/chapters` | Manage chapters within course | **Critical** |
| `/teacher/courses/$courseId/chapters/$chapterId/sessions` | Sessions within chapter | **High** |
| `/teacher/sessions/create` | Create new session form | **High** |
| `/teacher/sessions/$sessionId` | Edit session + add materials | **High** |
| `/teacher/questions/bank` | Full question bank with filters | **High** |
| `/teacher/questions/$questionId` | Edit individual question | **Medium** |
| `/teacher/quizzes/create` | Quiz builder form | **High** |
| `/teacher/quizzes/$quizId` | Edit quiz + view analytics | **Medium** |

---

## Partial Pages (Need Enhancement)

| Page | What Exists | What's Missing |
|------|-------------|----------------|
| `teacher.sessions.tsx` | Mock list with status badges | Create form, edit modal, drag-and-drop material ordering |
| `teacher.quizzes.tsx` | Mock list with types | Create form, question selection UI, timer config |
| `teacher.analytics.tsx` | Static mock data cards | FilterBar, date range, drill-down by course/chapter |
| `teacher.rewards.tsx` | Coupon/scholarship display | Create coupon form, grant scholarship modal |

---

## Broken Routes / Issues

| # | Issue | Severity |
|---|-------|----------|
| 1 | Course ID mismatch: student catalog uses `c1`-`c8`, teacherCourses uses `CRS-26-XXXX` | **Medium** — no linkage between teacher's courses and student-visible catalog |
| 2 | `teacher.courses.tsx` uses `GenericDashboard` — completely non-functional | **High** — teacher cannot see their own courses |
| 3 | `teacher.questions.create.tsx` shows generic chart, not a form | **High** — teacher cannot create questions |
| 4 | `teacher.chapters.tsx` and `teacher.lessons.tsx` are identical generic pages | **Low** — duplicated placeholders |
| 5 | Session Builder "Create Session" button has no handler | **Medium** — UI suggests functionality that doesn't exist |

---

## Duplicate Routes / Components

| Item | Files | Recommendation |
|------|-------|----------------|
| Generic placeholder pages | `teacher.courses.tsx`, `teacher.chapters.tsx`, `teacher.lessons.tsx`, `teacher.questions.tsx`, `teacher.questions.create.tsx`, `teacher.assignments.tsx` | Replace all with real content |
| `GenericDashboard` usage | 6 teacher pages use it | Remove from teacher pages entirely |
| Course data structures | `lib/mock.ts` (courses[]) vs `lib/teacherMock.ts` (teacherCourses[]) | Unify into single course model with teacher view |

---

## What Should Be Reused

| Component/Module | Currently Used By | Reuse In |
|------------------|-------------------|----------|
| `FilterBar` | teacher.students, teacher.revenue | All teacher list pages |
| `Pagination` | teacher.students, teacher.revenue | All teacher list pages |
| `DashPage` | All teacher pages | Keep as layout wrapper |
| `Card`, `Badge`, `Button` | Everywhere | Standard UI primitives |
| `query-types.ts` | Infrastructure | All teacher CRUD pages |
| `COUNTRIES` data | Students, Revenue | Course pricing, student profiles |
| `teacherMock.ts` structures | Dashboard, Students, Revenue | Extend for courses/chapters/sessions |
| Course/Session data model | Student session player | Teacher session builder |

---

## What Should Be Created

### New Components

| Component | Purpose |
|-----------|---------|
| `CourseForm` | Create/edit course (title, description, subject, grade, price, cover) |
| `ChapterForm` | Create/edit chapter within course |
| `SessionForm` | Create/edit session (title, price, dates, visibility, target) |
| `MaterialUploader` | Upload video/PDF/images/attachments with type selection |
| `QuestionForm` | Create MCQ/essay/calculation question with difficulty, tags, explanation |
| `QuizBuilder` | Select questions, set timer, randomization, pass score |
| `CourseCard` (teacher variant) | Course card with edit/publish/stats actions |
| `CoursePricingTable` | Multi-country pricing setup |

### New Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/teacher/courses` (replace) | CoursesList | Filterable course list with create button |
| `/teacher/courses/create` | CreateCourse | Course creation form |
| `/teacher/courses/$courseId` | CourseDetail | Course overview with tabs (chapters, sessions, pricing, stats) |
| `/teacher/sessions/create` | CreateSession | Session builder with material upload |
| `/teacher/sessions/$sessionId` | EditSession | Session editor with content ordering |
| `/teacher/questions/create` (replace) | CreateQuestion | Question creation form with preview |
| `/teacher/quizzes/create` | CreateQuiz | Quiz builder with question pool selection |

### New Data / Stores

| Store/Module | Purpose |
|--------------|---------|
| `teacher-course-store.ts` | CRUD for courses (localStorage mock, backend later) |
| `teacher-session-store.ts` | CRUD for sessions within courses |
| `teacher-question-store.ts` | CRUD for question bank |
| `teacher-quiz-store.ts` | CRUD for quizzes |

---

## Connection Points (Student ↔ Teacher)

| Student Side | Teacher Side | Connection Status |
|--------------|--------------|-------------------|
| `/courses` catalog | Teacher's published courses | **Partial** — course data exists but IDs mismatch |
| `/courses/:id` details | Course content (chapters, sessions) | **Working** — courseDetailsMock serves data |
| Enrollment + payment | Course pricing | **Working** — price comes from course data |
| `/student/courses/:id/session` | Session content (videos, quizzes) | **Working** — sessionMock serves data |
| Quiz practice → XP | Quiz configuration (teacher sets XP) | **Not connected** — XP is calculated client-side |
| Student progress | Teacher analytics | **Not connected** — separate mock data |

---

## Recommended Implementation Order

### Phase 1: Course Management (Critical Path)

1. **Replace `teacher.courses.tsx`** with real course list using FilterBar + teacherCourses data
2. **Create `teacher.courses.create.tsx`** — form: title, subject, grade, description, price, cover emoji/image
3. **Create course store** (`teacher-course-store.ts`) — CRUD with localStorage persistence
4. **Unify course IDs** — bridge teacherCourses (CRS-26-XXXX) with student catalog (c1-c8)

### Phase 2: Chapter + Session Builder

5. **Create chapter management** within course detail page (add/reorder/delete chapters)
6. **Enhance `teacher.sessions.tsx`** — connect to courses, add create form
7. **Create session editor** — add materials (video, PDF, attachment), set pricing, dates
8. **Create material upload UI** — file type selection, preview, ordering

### Phase 3: Question Bank + Quiz Builder

9. **Replace `teacher.questions.tsx`** with full question bank (FilterBar + CRUD)
10. **Replace `teacher.questions.create.tsx`** with real form (MCQ/essay/calc, difficulty, tags, explanation)
11. **Enhance `teacher.quizzes.tsx`** — add create quiz flow
12. **Create quiz builder** — select from question bank, set timer, randomization, XP config

### Phase 4: Integration

13. **Connect teacher courses to student catalog** — published courses appear in /courses
14. **Connect session content to student player** — teacher-created sessions load in session player
15. **Connect quiz config to XP system** — teacher ExamXPConfig flows to student XP awards

---

## Files to Remove After Implementation

| File | Reason |
|------|--------|
| `teacher.chapters.tsx` | Merge into course detail page |
| `teacher.lessons.tsx` | Merge into session builder |
| `teacher.assignments.tsx` | Merge into course detail or quizzes |

---

## Out of Scope (Excluded per Requirements)

- Team Management (already partial)
- Chat/Communication (already partial)
- Rewards/Promotions (already partial)
- Generator Studio (already partial)
- Advanced Analytics (already partial)

These can be enhanced after the content creation flow is complete.

---

## Final Assessment

**Teacher Content MVP Readiness: 25%**

The infrastructure is solid (FilterBar, Pagination, query types, country data, teacherMock), but the core content creation flow (Course → Chapter → Session → Material → Quiz) does not exist. All 6 placeholder pages using `GenericDashboard` need full replacement.

**Estimated work:**
- Phase 1 (Course Management): 4 pages/components
- Phase 2 (Session Builder): 3 pages/components
- Phase 3 (Question/Quiz): 3 pages/components
- Phase 4 (Integration): 3 connection points

**Total:** ~13 new components/pages to reach Teacher Content MVP.
