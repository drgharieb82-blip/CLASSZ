# CLASSZ Assessment Engine — Core Architecture

## Why Unified Assessment Engine

Quiz, Homework, Exam, and Assignment are not fundamentally different things — they are all **containers of questions with different settings**. A practice quiz and a final exam differ in timer strictness, attempt limits, and grading policy — not in structure.

The Assessment Engine replaces four separate core concepts with one: `TeacherAssessment`. The `assessmentType` field determines the behavior preset, while `settings` and `rewards` control the specifics.

## Assessment Types (15 presets)

| Type | Category | Key Defaults |
|------|----------|-------------|
| `practice_quiz` | Quiz | 3 attempts, show answers after submit |
| `session_quiz` | Quiz | 10 min, 2 attempts, auto-grade |
| `revision_quiz` | Quiz | 5 attempts, show answers immediately, review mode |
| `homework` | Homework | Due date, late submission allowed, 10% penalty |
| `exam` | Exam | 60 min strict timer, 1 attempt, show after due date |
| `mock_exam` | Exam | 90 min strict, 2 attempts, review after submit |
| `final_exam` | Exam | 120 min strict, 1 attempt, never show answers |
| `placement_test` | Test | 30 min, 1 attempt, no answers shown |
| `diagnostic_test` | Test | No time limit, show answers, analytics focus |
| `assignment` | Assignment | File upload, manual review, late OK |
| `project` | Assignment | File upload, manual review |
| `research` | Assignment | File upload, manual review |
| `presentation` | Assignment | File upload, manual review |
| `adaptive_assessment` | Adaptive | Auto-grade, show after submit |
| `custom` | Custom | No preset — fully manual |

## Assessment Model

```
TeacherAssessment {
  id, publicCode (ASM-26-XXXXXX)
  title, subtitle, description, instructions, thumbnail, tags
  assessmentType
  questionIds[] — references Question Bank
  courseIds[], chapterIds[], lessonIds[], conceptIds[], atomicConceptIds[]
  sessionIds[]
  settings: AssessmentSettings
  rewards: AssessmentRewards
  status, visibility, version, timestamps
}
```

## Settings

```
AssessmentSettings {
  durationMinutes, hasStrictTimer, attemptLimit
  passingScorePercent, totalScore, pointsPerQuestion
  negativeMarksEnabled, negativeMarksValue, partialCreditAllowed
  shuffleQuestions, shuffleChoices
  showAnswersPolicy, showExplanationPolicy, reviewModeAllowed
  startAt, endAt, dueDate, allowLateSubmission, latePenaltyPercent
  manualReviewRequired, autoGradeAllowed
  fileUploadAllowed, allowedFileTypes, maxFileSizeMB
  rubric, gradingNotes
}
```

Policies: `immediately | after_submit | after_due_date | never`

## Rewards

```
AssessmentRewards {
  xpReward, passScoreBonus, perfectScoreBonus
  allowRetakeXp, maxRetakeXp, walletCoinsReward, badgeIds
}
```

## Question Bank Relation

- Assessments reference questions by `questionIds[]` — never copy
- Questions track `usedInAssessmentIds[]` for analytics
- Existing `usedInQuizIds[]`, `usedInExamIds[]` etc. remain for backward compat

## Presets

`createAssessmentPreset(type)` returns sensible defaults for `settings` and `rewards`. Teachers can override any field.

## Store Functions

CRUD: `create/update/delete/publish/archive/duplicate`
Questions: `attach/detach/reorder`
Sessions: `attachToSession/detachFromSession`
Course ops: `copyToCourse/moveToCourse`

## Backward Compatibility

Old stores (`teacher-quiz-store`, `teacher-homework-store`, `teacher-exam-store`, `teacher-assignment-store`) remain **untouched**. Adapter functions convert between formats:

| Direction | Function |
|-----------|----------|
| Quiz → Assessment | `quizToAssessment(quiz)` |
| Exam → Assessment | `examToAssessment(exam)` |
| Homework → Assessment | `homeworkToAssessment(hw)` |
| Assignment → Assessment | `assignmentToAssessment(asn)` |
| Assessment → Quiz-like | `assessmentToQuizLike(a)` |
| Assessment → Exam-like | `assessmentToExamLike(a)` |
| Assessment → Homework-like | `assessmentToHomeworkLike(a)` |
| Assessment → Assignment-like | `assessmentToAssignmentLike(a)` |

Existing Quiz Builder, student quiz flow, homework/exam pages — all continue working against their original stores.

## Migration Path (Future)

1. Build new Assessment UI using `teacher-assessment-store`
2. Add migration button: "Convert to Assessment Engine"
3. Run adapters to copy old data into assessment store
4. Gradually replace old pages with Assessment Engine pages
5. Eventually deprecate old stores (not in this phase)

## Mock Data

15 mock assessments seeded covering every type, with varied settings and question counts.
