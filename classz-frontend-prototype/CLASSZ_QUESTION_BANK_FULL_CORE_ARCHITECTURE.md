# CLASSZ Question Bank — Full Core Architecture

## Philosophy

A question is an **independent reusable asset**. It is never locked to one session, one quiz, one exam, or one chapter. Teachers can create questions before building their full academic structure — academic mapping is always optional.

Questions can be: unclassified, partially classified, fully classified, and used across many sessions/quizzes/exams/homework/assignments simultaneously.

---

## Supported Question Types (28 types)

### Basic
| Type | Description |
|------|-------------|
| `mcq` | Multiple choice, single correct answer |
| `multi_select` | Multiple choice, multiple correct answers |
| `true_false` | True or false |
| `short_answer` | Free text with accepted answers list |
| `essay` | Long-form written response |
| `calculation` | Numeric answer with optional unit and tolerance |

### Structured
| Type | Description |
|------|-------------|
| `fill_blank` | Sentence with blanks to fill |
| `matching` | Match left items to right items |
| `ordering` | Arrange items in correct order |
| `table_completion` | Fill in blank cells in a table |
| `matrix` | Grid-based answers |
| `classification` | Sort items into categories |

### Reading / Context
| Type | Description |
|------|-------------|
| `passage` | Reading comprehension with sub-questions |
| `case_study` | Case-based with resources and sub-questions |
| `group_question` | Parent stem with child questions |

### Interactive
| Type | Description |
|------|-------------|
| `drag_drop` | Drag items to drop zones |
| `hotspot` | Click correct areas on an image |
| `image_labeling` | Place labels on an image |
| `graph_plot` | Draw/plot on a graph |
| `equation_builder` | Construct a mathematical equation |
| `chemical_structure` | Draw/input chemical structures |

### Submission
| Type | Description |
|------|-------------|
| `file_upload` | Upload a file as answer |
| `oral_answer` | Record audio answer |
| `video_answer` | Record video answer |

### Technical
| Type | Description |
|------|-------------|
| `coding` | Write code with test cases |

### Learning / Revision
| Type | Description |
|------|-------------|
| `flashcard` | Front/back card for revision |
| `adaptive` | Rule-based adaptive question flow |

---

## Base Model (`TeacherQuestion`)

Every question has:

```
id, publicCode, type, title, body, text, instructions
teacherId, ownerTeacherId, courseId (optional)
difficulty: easy | medium | hard | advanced
estimatedTimeSeconds
source, sourceType, sourceLabel
tags[], notes
status: draft | published | archived
visibility: private | course | shared
version, createdBy, updatedBy, createdAt, updatedAt
```

---

## Answer Data (Discriminated Union)

Each question type has a corresponding `AnswerData` variant with `kind` discriminator matching the question type. All answer data is stored in the `answerData` field.

Legacy fields (`choices`, `modelAnswer`, `correctAnswer`, `unit`, `tolerance`) are preserved for backward compatibility with existing MCQ/Essay/Calculation questions.

---

## Optional Academic Mapping

All academic fields are optional and can be empty arrays:

```
academicLinks: { id, chapterId?, lessonId?, conceptId?, atomicConceptId? }[]
chapterIds[], lessonIds[], conceptIds[], atomicConceptIds[]
```

The `linked*Ids` arrays are auto-populated from `academicLinks` when present. Old single-value fields (`chapterId`, `concept`, `atomicConcept`) are normalized into the arrays.

**Supported states:**
1. Unclassified — no academic mapping at all
2. Partially classified — chapter only, or concept only
3. Fully classified — chapter + lesson + concept + atomic concept
4. Multi-node — same question mapped to multiple chapters/concepts

---

## Many-to-Many Usage

```
sessionIds[], quizIds[], examIds[], homeworkIds[], assignmentIds[], assessmentIds[]
```

A question can appear in unlimited quizzes, exams, sessions, etc. simultaneously. Link/unlink operations are provided as store methods.

---

## Pedagogical Fields

```
hint, explanation, solution
commonMistakes[], teacherNotes, studentFeedback
markingScheme, rubric
points, negativeMarks, partialCreditAllowed
```

---

## Media Support

```
questionImages[], choiceImages[], solutionImages[], attachments[]
```

Stored as URL arrays. Full upload UI to be built later.

---

## Question Relations

```
similarQuestionIds[], easierVersionIds[], harderVersionIds[]
previousYearQuestionIds[], sameConceptQuestionIds[]
parentQuestionId, childQuestionIds[]
```

Supports: easier/harder versions, same-idea grouping, previous year archives, passage/case-study sub-questions.

---

## Usage Analytics

```
useCount, attemptCount, correctCount, wrongCount
averageTimeSeconds, wrongRate
manualReviewCount, pendingReviewCount
```

Default to 0. Updated by `incrementQuestionUse()`.

---

## Store Functions

### CRUD
`createQuestion`, `updateQuestion`, `deleteQuestion`, `publishQuestion`, `archiveQuestion`, `duplicateQuestion`

### Linking
`linkQuestionToSession/Quiz/Exam/Homework/Assignment`
`unlinkQuestionFromSession/Quiz/Exam/Homework/Assignment`
`incrementQuestionUse(questionId, usageType, usageId)`

### Course Operations
`linkQuestionToCourse`, `copyQuestionToCourse`, `moveQuestionToCourse`

### Utilities
`createDefaultAnswerData(type)` — returns empty AnswerData for any type
`normalizeQuestion(partial)` — fills all defaults for incomplete data
`listQuestions(courseId?)`, `getQuestionById(id)`

---

## Backward Compatibility

- `QuestionType` is a superset of the original `"mcq" | "essay" | "calculation"`
- `CreateQuestionData` makes all new fields optional — old callers unchanged
- Legacy `choices`, `modelAnswer`, `correctAnswer`, `unit`, `tolerance` fields preserved
- Legacy `chapterId`, `concept`, `atomicConcept` string fields still normalized into arrays
- Old `sessionId` string still normalized into `sessionIds[]`
- Quiz/Exam/Homework builders that reference `q.type === "mcq"` still work
- Student quiz player that reads `q.choices` still works

---

## Mock Data Coverage

Seed data includes realistic mock questions for: `mcq`, `essay`, `calculation`, `multi_select`, `true_false`, `short_answer`, `fill_blank`, `matching`, `ordering`, `table_completion`, `classification`, `passage`, `drag_drop`, `equation_builder`, `file_upload`, `coding`, `flashcard`, `chemical_structure`.

Also includes 2 unclassified questions (no course/chapter/concept) to validate that academic mapping is truly optional.

---

## Future UI Notes

- Question create/edit form should offer type selector with all 28 types
- Each type renders its own answer editor based on `answerData.kind`
- Academic linking uses repeatable rows (same pattern as Material academic links)
- Question card should show type, difficulty, academic links, usage count
- Passage/case-study types need sub-question management
- Coding type needs code editor integration
- Flashcard type needs flip-card preview
