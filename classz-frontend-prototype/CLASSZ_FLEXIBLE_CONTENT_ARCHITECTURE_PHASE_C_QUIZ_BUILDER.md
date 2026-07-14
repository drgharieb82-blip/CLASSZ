# CLASSZ Flexible Content Architecture — Phase C: Quiz Builder

**Date:** 2026-06-21
**Status:** Implemented

---

## What Was Implemented

### Quiz Store (`teacher-quiz-store.ts`)

Full CRUD with flexible linking:
- 7 quiz types: practice, session_quiz, revision, homework_quiz, checkpoint, exam_prep, standalone
- Multi-linking: chapterIds[], lessonIds[], sessionIds[], conceptIds[], atomicConceptIds[]
- Question references: questionIds[] (reusable, not copied)
- Settings: duration, attemptLimit, shuffle, show answers/explanations, passing score, XP
- Visibility: public, enrolled_only, private
- Actions: create, update, delete, publish, archive, duplicate, attach/detach session

### Quiz List Page (`/teacher/quizzes`)

- FilterBar: Type, Status, Course
- Pagination
- Quiz cards with: title, code, type badge, questions count, duration, XP, status
- Actions: Edit, Publish, Duplicate, Delete
- Empty state with create CTA

### Create Quiz Page (`/teacher/quizzes/create`)

- Basic info: title, description, quiz type, course
- Question picker with filter (text/concept search)
- Selected questions list with reorder
- Settings sidebar: duration, attempt limit, passing %, XP, shuffle, show answers
- Save Draft (0+ questions) or Publish (1+ questions required)

### Edit Quiz Page (`/teacher/quizzes/$quizId/edit`)

- Stats overview (questions, duration, XP)
- Question list display
- Settings summary
- Not found state

### Session Builder Quiz Block (Active)

- Shows attached quizzes with: title, question count, duration, XP
- "Edit" link to quiz edit page
- If no quiz: "Create Quiz →" link
- Uses `getPublishedQuizzesForSession(sessionId)`

### Student Quiz Route (`/student/quizzes/$quizId`)

Three phases:
1. **Intro**: quiz title, description, questions count, duration, XP, pass %, start button
2. **Active**: question display (MCQ radio, calculation input, essay textarea), progress bar, prev/next/submit
3. **Result**: pass/fail, score %, XP earned badge, VictoryScene (≥80%), retry button

### XP Integration

- `awardQuizXP()` called on submit
- Deduplication prevents full XP farming on retakes
- XP earned displayed on result screen
- Respects existing XP rules (30 base + score×0.4 + bonuses)

---

## Quiz Relationship to Sessions

A quiz is **NOT mandatory** inside a session. It can be:

| Relationship | How |
|-------------|-----|
| Standalone | quiz.sessionIds = [] |
| Linked to session | quiz.sessionIds includes session ID |
| Multiple sessions | quiz.sessionIds has multiple entries |
| Course-level | quiz.courseId set, no session link |
| Chapter-level | quiz.chapterIds set |

Teacher attaches/detaches quizzes freely. Session builder shows attached quizzes or offers to create new ones.

---

## Student Flow

1. Student opens session → sees Quiz CTA (if published quiz attached)
2. Clicks "Start Quiz" → `/student/quizzes/$quizId`
3. Answers questions (MCQ/calculation/essay)
4. Submits → score calculated
5. XP awarded (first attempt: full, retakes: reduced)
6. Result shown with pass/fail and XP

Session without quiz → quiz block hidden (no empty tab).

---

## What Remains

| Task | Description |
|------|-------------|
| Exam Builder | Full exam with teacher-configurable XP (ExamXPConfig) |
| Homework Builder | Assignments with due dates |
| Quiz in student session player | Auto-show quiz CTA inside session player sidebar |
| Quiz analytics | Results per student, average scores, difficult questions |
| Essay grading | Manual review flow for essay questions |

---

## Backward Compatibility

- Existing sessions without quizzes continue working unchanged
- Existing student session player unaffected
- Existing question bank untouched
- XP system unchanged (same deduplication rules)
- Certificates and leaderboard assets NOT touched
