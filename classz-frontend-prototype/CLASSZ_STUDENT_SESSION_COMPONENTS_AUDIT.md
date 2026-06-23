# CLASSZ Student Session Experience — Component Audit

**Date:** 2026-06-23
**Branch:** lovable-ui-import
**Scope:** Read-only audit — no code changes made

---

## 1. ROUTES INSPECTED

| Route | File | Purpose |
|-------|------|---------|
| `/student/lesson` | `src/routes/student.lesson.tsx` | Redirect → finds active enrolled course → `/student/courses/$courseId/session` |
| `/student/courses/$courseId/session` | `src/routes/student.courses.$courseId.session.tsx` | **Main Session Player** — primary content playback experience |
| `/student/courses/$courseId/` | `src/routes/student.courses.$courseId.index.tsx` | Course Overview — stats, performance, continue CTA |
| `/student/courses/$courseId/continue` | `src/routes/student.courses.$courseId.continue.tsx` | Redirect → `/student/courses/$courseId/session` |
| `/student/courses/$courseId/resources` | `src/routes/student.courses.$courseId.resources.tsx` | Course Resources — lists attachment items from sessions |
| `/student/courses/` | `src/routes/student.courses.index.tsx` | My Courses — grid of enrolled course cards |
| `/student/courses/$courseId/enroll` | `src/routes/student.courses.$courseId.enroll.tsx` | Enrollment/payment flow |

---

## 2. COMPONENTS IDENTIFIED

### 2.1 Session Player Layout (`LessonPlayerLayout.tsx`)

Three-panel responsive layout:

```
┌──────────────────────────────────────────────────┐
│  HEADER: Logo · Panel Toggle · Lang · Theme · User │
├────────┬───────────────────────┬─────────────────┤
│        │                       │                 │
│ LEFT   │   MAIN CONTENT        │   RIGHT PANEL   │
│ SIDEBAR│   (scrollable)        │   (tabs)        │
│ 260px  │                       │   280px         │
│        │                       │                 │
│ (hidden│                       │ (hidden <xl,    │
│ <lg,   │                       │  slide-over)    │
│ slide) │                       │                 │
└────────┴───────────────────────┴─────────────────┘
```

### 2.2 Left Sidebar — `SessionSidebar.tsx`

| Component | Status | Description |
|-----------|--------|-------------|
| Course Header | ✅ Working | Emoji, name, progress bar, items completed count |
| Sessions Accordion | ✅ Working | Radix Accordion, multiple open, per-session item list |
| Session Item Row | ✅ Working | Type icon (color-coded), title, type label, duration/question count |
| Item Status Icons | ✅ Working | ✔ completed (green), 🔒 locked, type icon for active/available |
| Active Item Highlight | ✅ Working | Gradient brand background on selected item |
| Certificate Footer | ✅ Working | "Complete all sessions to earn" CTA (static, no real logic) |

**Item types supported:** video, quiz, homework, attachment, notes, discussion

### 2.3 Main Content Area

#### LessonHeader (`LessonHeader.tsx`)
| Element | Status | Description |
|---------|--------|-------------|
| Breadcrumb | ✅ Working | Dashboard > My Courses > Course Name > Session Name |
| Lesson Counter | ✅ Working | "Lesson N of M" |
| Title | ✅ Working | Active item title |
| Description | ✅ Working | Video description or type summary |
| Progress Bar | ✅ Working | Course-level progress percentage |

#### ContentPlayer (`ContentPlayer.tsx`)
| Element | Status | Description |
|---------|--------|-------------|
| Video Player | ⚠️ Mock/Placeholder | Emoji thumbnail + "Click play to start" — no real video |
| Play/Pause Button | ⚠️ Mock | Toggles `playing` state, no actual media playback |
| Progress Bar | ⚠️ Hardcoded | Always shows 24%, hardcoded "04:24 / 18:30" |
| Volume Control | ⚠️ Placeholder | Button renders, no functionality |
| Settings | ⚠️ Placeholder | Button renders, no functionality |
| Fullscreen | ⚠️ Placeholder | Button renders, no functionality |
| YouTube Embed | ⚠️ Placeholder | Shows "YouTube embed placeholder" text |
| PDF Viewer | ⚠️ Placeholder | Shows "PDF viewer placeholder" text |
| Text Content | ⚠️ Placeholder | Shows "Text content view" text |

#### LessonContent (`LessonContent.tsx`)
| Block Type | Status | Description |
|------------|--------|-------------|
| Text | ✅ Working | Paragraph rendering |
| Equation | ✅ Working | Monospace block with optional label |
| Note | ✅ Working | Lightbulb icon + tip content |
| Warning | ✅ Working | Warning icon + alert content |
| Image | ⚠️ Placeholder | Shows text label in a placeholder box, no real image |

#### QuizCard (`SessionItemContent.tsx`)
| Element | Status | Description |
|---------|--------|-------------|
| Icon + Title | ✅ Working | Gradient icon, title, subtitle |
| Metadata | ✅ Working | Question count, duration, passing score |
| Start/Retake Button | ⚠️ No Navigation | `GradientButton` renders but has no `onClick` or `Link` — does nothing |

#### HomeworkCard (`SessionItemContent.tsx`)
| Element | Status | Description |
|---------|--------|-------------|
| Icon + Title | ✅ Working | Rose gradient icon, title, subtitle |
| Metadata | ✅ Working | Question count, duration, due date, attempts allowed |
| Start/Review Button | ⚠️ No Navigation | Button renders but has no `onClick` or `Link` — does nothing |

#### AttachmentCard (`SessionItemContent.tsx`)
| Element | Status | Description |
|---------|--------|-------------|
| Icon + Title | ✅ Working | Cyan gradient icon, title, subtitle |
| File Info | ✅ Working | File name, size, type badge |
| Download/Preview Buttons | ⚠️ No Action | Buttons render but have no download logic |

#### LessonNavigation (`LessonNavigation.tsx`)
| Element | Status | Description |
|---------|--------|-------------|
| Previous Lesson | ✅ Working | Navigates to previous item (skips locked) |
| Next Lesson | ✅ Working | Navigates to next item (skips locked) |
| Mark as Completed | ⚠️ No Handler | Button renders, `onComplete` is not wired up in parent |

### 2.4 Right Panel — `LessonTabs.tsx`

Six tabs in a vertical panel:

| Tab | Icon | Status | Description |
|-----|------|--------|-------------|
| **Overview** | BookOpen | ✅ Working | Objectives, Key Concepts, Duration, Content Type, Progress Circle, Teacher Card, Session Countdown |
| **Notes** | StickyNote | ✅ Fully Working | Add/Edit/Delete/Pin notes, smart type detection, importance levels, tag support |
| **Attach** | Paperclip | ⚠️ Hardcoded | Always shows 3 static PDFs ("Lecture Slides.pdf", "Practice Problems.pdf", "Formula Sheet.pdf") |
| **Q&A** | HelpCircle | ⚠️ Empty Placeholder | "Ask a question about this lesson" — no input, no functionality |
| **Discuss** | MessageSquare | ⚠️ Empty Placeholder | "Join the discussion" — no input, no functionality |
| **AI** | Bot | ⚠️ Empty Placeholder | "Ask the AI to explain concepts" — no input, no functionality |

#### Overview Tab Sub-components

| Component | File | Status |
|-----------|------|--------|
| `SessionCountdown` | LessonTabs.tsx (inline) | ✅ Working — live countdown for session access expiry |
| `LessonOverviewCard` | LessonOverviewCard.tsx | ✅ Working — objectives list, key concepts chips, duration/type grid |
| `LessonProgressCard` | LessonProgressCard.tsx | ⚠️ Partially Mock — SVG circle renders, but watched/remaining time is hardcoded "—" |
| `TeacherCard` | TeacherCard.tsx | ✅ Working — avatar, name, subject, external link button (no-op) |

#### Notes Tab (`NotesPanel`)
| Feature | Status |
|---------|--------|
| Add Note | ✅ Working |
| Edit Note | ✅ Working |
| Delete Note | ✅ Working |
| Pin/Unpin | ✅ Working |
| Smart Type Detection | ✅ Working (chemistry, physics, math, definition, question, general) |
| Importance Levels | ✅ Working (low, medium, high) |
| Tags | ✅ Working |
| Per-session-item filtering | ✅ Working |
| Persistence | ❌ In-memory only (resets on page reload) |

### 2.5 Components NOT Present

| Expected Component | Status |
|-------------------|--------|
| Bookmarks / Highlights | ❌ Not implemented |
| Downloads section | ❌ Not implemented (AttachmentCard has no-op buttons) |
| Announcements | ❌ Not in session player |
| Teacher Notes (visible to student) | ❌ Not implemented |
| XP / Rewards display | ❌ Not in session player |
| Certificates progress | ⚠️ Static CTA in sidebar footer only |
| Wrong Questions review | ❌ Not linked from session |
| Recommendations | ❌ Not implemented |
| Real Quiz/Exam integration | ❌ Quiz/Homework cards are display-only |
| Completion tracking (real) | ❌ Mark Complete button not wired |

---

## 3. DATA SOURCES

| Component | Data Source | Type |
|-----------|------------|------|
| Session Player (main) | `src/lib/sessionMock.ts` → `getSessionCourseById()` | Mock file with hardcoded data for courses c1, c2, c3 |
| Teacher-created sessions | `src/lib/sessionMock.ts` → `buildTeacherSessionCourse()` | Bridges to `teacher-session-store` + `teacher-material-store` |
| Notes system | `src/lib/notesMock.ts` → `initialNotes` array | Mock file, in-memory state only |
| Course Overview page | `src/lib/enrolled-courses.ts` → `getEnrolledCourse()` | Mock file + `enrollment-store` |
| Course list | `src/lib/enrolled-courses.ts` → `getAllEnrolledCourses()` | Mock file `src/lib/mock.ts` + `enrollment-store` |
| Resources page | `src/lib/sessionMock.ts` → attachment items | Derived from session mock data |
| Lesson redirect | `src/lib/enrolled-courses.ts` | Finds first active enrolled course |

### Data flow for teacher-created content

```
teacher-course-store.courses
  └→ teacher-session-store.sessions (filtered by courseId, published)
       └→ teacher-material-store.materials (filtered by sessionId, published)
            └→ buildTeacherSessionCourse() maps materials to SessionItems
                 └→ SessionPlayer renders them
```

**Key gap:** `buildTeacherSessionCourse()` only maps materials (video, pdf, attachment). It does NOT pull:
- Quizzes from `teacher-quiz-store`
- Exams from `teacher-exam-store`
- Homework from `teacher-homework-store`
- Assessments from `teacher-assessment-store`
- Questions from `teacher-question-store`

### Stores referenced (directly or indirectly)

| Store | Used By | Connection Status |
|-------|---------|------------------|
| `teacher-course-store` | sessionMock.ts (via `getCourseById`) | ✅ Connected |
| `teacher-session-store` | sessionMock.ts (via `getPublishedSessions`) | ✅ Connected |
| `teacher-material-store` | sessionMock.ts (via `getPublishedMaterials`) | ✅ Connected |
| `teacher-quiz-store` | — | ❌ Not connected to session player |
| `teacher-exam-store` | — | ❌ Not connected to session player |
| `teacher-homework-store` | — | ❌ Not connected to session player |
| `teacher-assessment-store` | — | ❌ Not connected to session player |
| `teacher-question-store` | — | ❌ Not connected to session player |
| `enrollment-store` | enrolled-courses.ts | ✅ Connected |
| Student progress store | — | ❌ Does not exist |

---

## 4. CURRENT STUDENT SESSION STRUCTURE

### Session Player Page (`/student/courses/$courseId/session`)

```
┌─ LessonPlayerLayout ─────────────────────────────────────────┐
│                                                               │
│  HEADER BAR                                                   │
│  ├─ Hamburger (mobile sidebar toggle)                        │
│  ├─ Logo → /student                                          │
│  ├─ Panel toggle (mobile right panel)                        │
│  ├─ LangSwitcher                                             │
│  ├─ ThemeToggle                                              │
│  └─ UserMenu (student)                                       │
│                                                               │
├──────────┬────────────────────────┬──────────────────────────┤
│          │                        │                          │
│ SESSION  │  MAIN CONTENT          │  LESSON TABS PANEL       │
│ SIDEBAR  │                        │                          │
│          │  ┌─ LessonHeader ────┐ │  Tab Bar:                │
│ Course   │  │ Breadcrumb        │ │  [Overview][Notes]       │
│ Header   │  │ Lesson N of M     │ │  [Attach][Q&A]           │
│ ├─ Emoji │  │ Title             │ │  [Discuss][AI]           │
│ ├─ Name  │  │ Description       │ │                          │
│ ├─ %bar  │  │ Progress bar      │ │  Overview Tab:           │
│ └─ x/y   │  └──────────────────┘ │  ├─ SessionCountdown     │
│          │                        │  ├─ LessonOverviewCard   │
│ Sessions │  ┌─ Content ─────────┐ │  │  ├─ Objectives        │
│ Accordion│  │                   │ │  │  ├─ Key Concepts      │
│ ├─ Sess1 │  │  IF video:        │ │  │  └─ Duration/Type     │
│ │ ├─ 📹  │  │   ContentPlayer   │ │  ├─ LessonProgressCard  │
│ │ ├─ 📝  │  │   + LessonContent │ │  │  └─ SVG circle + %   │
│ │ └─ 📎  │  │                   │ │  └─ TeacherCard          │
│ ├─ Sess2 │  │  IF quiz:         │ │     ├─ Avatar           │
│ │ ├─ 📹  │  │   QuizCard        │ │     ├─ Name             │
│ │ └─ 📋  │  │                   │ │     └─ Subject           │
│ └─ Sess3 │  │  IF homework:     │ │                          │
│   ├─ 📹  │  │   HomeworkCard    │ │  Notes Tab:              │
│   └─ 🔒  │  │                   │ │  ├─ Add Note button     │
│          │  │  IF attachment:   │ │  ├─ Compose form        │
│ Certificate│ │   AttachmentCard  │ │  │  ├─ Textarea         │
│ Footer   │  │                   │ │  │  ├─ Tags input       │
│          │  └──────────────────┘ │  │  ├─ Importance        │
│          │                        │  │  └─ Smart type detect │
│          │  ┌─ LessonNavigation─┐ │  └─ Notes list          │
│          │  │ [Prev] [Complete]  │ │     ├─ Smart type badge │
│          │  │        [Next]      │ │     ├─ Pin toggle       │
│          │  └──────────────────┘ │     ├─ Edit/Delete      │
│          │                        │     └─ Tags + date      │
└──────────┴────────────────────────┴──────────────────────────┘
```

### Course Overview Page (`/student/courses/$courseId/`)

```
┌─ CourseWorkspaceLayout ─────────────────────────────┐
│  Header + Sidebar Navigation                         │
│                                                       │
│  Stat Cards (2x2 or 4-col):                          │
│  ├─ Lessons: completed/total                         │
│  ├─ Quizzes: completed/total                         │
│  ├─ Average Score: %                                 │
│  └─ Sessions: completed/total                        │
│                                                       │
│  Two-Column Grid:                                     │
│  ├─ Course Details                                   │
│  │  ├─ Teacher                                       │
│  │  ├─ Total Lessons                                 │
│  │  ├─ Last Activity                                 │
│  │  └─ Next Lesson                                   │
│  └─ Performance                                      │
│     ├─ Progress bar                                  │
│     ├─ Weakest Concept                               │
│     ├─ Strongest Concept                             │
│     ├─ Average Score                                 │
│     └─ Status                                        │
│                                                       │
│  [Continue Learning] CTA → /session                  │
└───────────────────────────────────────────────────────┘
```

---

## 5. MISSING / BROKEN ITEMS

### Critical — No Real Functionality

| Item | Issue |
|------|-------|
| **Video playback** | ContentPlayer is a mock — no actual video URL loading, no streaming, hardcoded time/progress |
| **Quiz/Homework start** | QuizCard and HomeworkCard buttons have no `onClick` or routing — completely non-functional |
| **Mark as Complete** | `onComplete` prop exists on LessonNavigation but is never passed from parent |
| **Download files** | AttachmentCard Download/Preview buttons have no handlers |
| **Student progress persistence** | No student progress store exists — progress is computed from mock `status` fields |
| **Notes persistence** | Notes are in-memory (`useState`) — lost on page reload |

### Placeholders — No Implementation

| Item | Location | Current State |
|------|----------|---------------|
| Q&A tab | LessonTabs | Empty box with "Ask a question" text |
| Discussion tab | LessonTabs | Empty box with "Join the discussion" text |
| AI Assistant tab | LessonTabs | Empty box with "Ask the AI" text |
| Attachments tab | LessonTabs | 3 hardcoded PDF names, no real files |
| PDF viewer | ContentPlayer | Text placeholder only |
| YouTube embed | ContentPlayer | Text placeholder only |
| Certificate | SessionSidebar footer | Static "Complete all sessions to earn" — no real certificate logic |
| TeacherCard link | TeacherCard | ExternalLink button renders, no action |

### Missing Assessment Integration

| Gap | Detail |
|-----|--------|
| Quiz → Question Bank | QuizCard shows metadata but cannot launch a real quiz with questions from `teacher-question-store` |
| Homework → Question Bank | HomeworkCard shows metadata but cannot launch real homework |
| Exam integration | No exam card or exam flow exists in session player at all |
| Assessment Engine | `teacher-assessment-store` assessments are not surfaced in student session |
| Practice questions | No practice question flow within session context |

### Missing Material Integration

| Gap | Detail |
|-----|--------|
| Real video URLs | `buildTeacherSessionCourse()` passes `videoUrl` from materials but ContentPlayer ignores it |
| PDF rendering | Materials with type "pdf" have `fileUrl` but no viewer |
| Image materials | Materials with type "image" not rendered |
| Notes materials | Materials with type "notes" mapped to SessionItemType "notes" but no notes-type content card exists |

### Missing Progress Integration

| Gap | Detail |
|-----|--------|
| No student progress store | Progress is derived from hardcoded `status` on mock SessionItems |
| No completion tracking | Cannot mark items as completed (button exists but not wired) |
| No watched time tracking | ContentPlayer doesn't track actual watch time |
| No quiz score recording | No mechanism to record quiz/homework results |
| Course overview stats | Uses `enrolledCourses` mock data with hardcoded values |

### Missing Completion Rules

| Gap | Detail |
|-----|--------|
| No unlock logic | Locked items are just CSS-disabled — no real unlock-after-completion flow |
| No prerequisite chain | No logic to auto-unlock next item when current is completed |
| No passing score gates | Quizzes show passing score but can't enforce it |
| No session expiry enforcement | SessionCountdown renders but doesn't block access after expiry |

### Missing Rewards

| Gap | Detail |
|-----|--------|
| No XP display in session | XP/rewards not shown during session playback |
| No completion rewards | No XP awarded for completing items |
| No streak tracking | No streak or gamification in session context |
| No certificate generation | Certificate CTA is static — no real certificate on completion |

---

## 6. SESSION BUILDER IMPLICATIONS

### Student Component → Teacher Builder Block Mapping

| Student Sees | Teacher Needs |
|-------------|---------------|
| **Video player** | **Video Block** — attach video URL, set duration, description, thumbnail |
| **Video description / LessonContent** | **Content Block** — rich text, equations, notes, warnings, images below video |
| **QuizCard** (pre/attention/post quiz) | **Quiz Block** — select questions, set duration, passing score, attempts |
| **HomeworkCard** | **Homework Block** — select questions, set due date, attempts, scoring |
| **AttachmentCard** (PDF, file) | **Resource Block** — upload/link files, set file type metadata |
| **Session Sidebar (item order)** | **Session Items Ordering** — drag-and-drop reorder of blocks within session |
| **SessionCountdown (access timer)** | **Access Settings Block** — free/paid, duration days, price |
| **LessonHeader objectives** | **Objectives Block** — define learning objectives shown in Overview tab |
| **Overview → Key Concepts** | **Concepts Block** — tag key concepts for the session |
| **Notes tab** | No builder block needed — student-owned feature |
| **Q&A tab** | **Discussion Settings Block** — enable/disable Q&A, moderation |
| **Discussion tab** | **Discussion Settings Block** — enable/disable discussion |
| **AI tab** | **AI Settings Block** — enable/disable AI assistant, set context |
| **Attachments tab** | Derives from Resource Blocks — no separate builder block needed |
| **LessonNavigation** | **Session Flow Block** — define completion rules, unlock logic, prerequisite chain |
| **Certificate footer** | **Completion Rewards Block** — define certificate, XP rewards, badges |
| **Mark as Complete** | **Completion Rules Block** — what counts as complete (watch %, pass quiz, submit homework) |

### Blocks NOT Surfaced to Student Yet (Teacher Should Build)

| Builder Block | Reason |
|---------------|--------|
| **Exam Block** | No exam card exists in student session — needs ExamCard component |
| **Practice Block** | No practice question flow — needs integration with question bank |
| **Announcement Block** | Teacher should post session-level announcements |
| **Prerequisite Block** | Define unlock conditions (complete item X before Y) |
| **Grading Block** | Define auto-grade vs manual grade, rubric for homework/essays |

---

## 7. RECOMMENDATION

### Recommended Teacher Session Builder Blocks

Based on the current student experience, the Teacher Session Builder should include these blocks:

#### Tier 1 — Core Content (must have for MVP)

1. **Video Block** — URL, duration, description, thumbnail
2. **Resource Block** — File upload (PDF, image, etc.), metadata
3. **Content Block** — Rich text, equations, notes, warnings below video
4. **Quiz Block** — Question selection, duration, passing score, attempts, position (pre/attention/post)
5. **Homework Block** — Question selection, due date, attempts, scoring

#### Tier 2 — Session Structure (must have for MVP)

6. **Session Items Order** — Drag-and-drop block ordering
7. **Access Settings** — Free/paid toggle, duration days, price
8. **Completion Rules** — What counts as complete, unlock conditions, prerequisite chain

#### Tier 3 — Enrichment (high value, second pass)

9. **Objectives Block** — Learning objectives list
10. **Concepts Block** — Key concepts tags
11. **Exam Block** — Full exam with timer, scoring, XP
12. **Assessment Block** — Unified assessment engine integration (all 15 types)

#### Tier 4 — Engagement (future)

13. **Discussion Settings** — Enable/disable Q&A and discussion tabs
14. **AI Settings** — Enable/disable AI assistant, set context/constraints
15. **Announcement Block** — Session-level announcements
16. **Rewards Block** — XP awards, badges, certificate rules

### Architecture Notes

- The session player already supports a **flat item list** per session — the builder should produce items in the same `SessionItem[]` shape
- The `buildTeacherSessionCourse()` bridge in `sessionMock.ts` already maps teacher materials → student view — extend this bridge for quizzes/homework/assessments
- The builder should write to `teacher-session-store` which already has the `items` concept
- Notes system is student-side only — no builder involvement needed
- Consider a **Block Preview** in the builder that mirrors the student view (QuizCard, HomeworkCard, etc.)

---

## 8. VALIDATION

```
$ npx tsc --noEmit
```

**Result:** Pre-existing errors in `teacher.assessments.$assessmentId.tsx` (5 errors — `timeLimitSec` property and undefined checks). These are **unrelated** to this audit and exist on the current branch.

No code was changed during this audit. Build state is unchanged.
