# CLASSZ Flexible Content Architecture — Phase A Complete

**Date:** 2026-06-21
**Status:** Implemented (non-breaking, additive)

---

## What Changed

### Session Model (`teacher-session-store.ts`)

Added fields:
```
sessionType: "lesson" | "revision" | "practice" | "quiz" | "exam" | "homework" | "mixed"
chapterIds: string[]       // multi-chapter support
lessonIds: string[]        // lesson references
conceptIds: string[]       // concept references
atomicConceptIds: string[] // atomic concept references
materialIds: string[]      // material library references
questionIds: string[]      // question bank references
quizIds: string[]          // quiz references
examIds: string[]          // exam references
homeworkIds: string[]      // homework references
hasQuiz: boolean
hasExam: boolean
hasHomework: boolean
hasPractice: boolean
```

**Backward compat:** `chapterId` kept as-is. New sessions auto-populate `chapterIds` from `chapterId`.

### Material Model (`teacher-material-store.ts`)

Added fields:
```
linkedSessionIds: string[]
linkedChapterIds: string[]
linkedLessonIds: string[]
linkedConceptIds: string[]
linkedAtomicConceptIds: string[]
reuseCount: number
segments?: VideoSegment[]
videoDurationSeconds?: number
thumbnailUrl?: string
```

Added type:
```typescript
interface VideoSegment {
  id: string;
  startTime: number;
  endTime: number;
  title: string;
  chapterIds: string[];
  lessonIds: string[];
  conceptIds: string[];
  atomicConceptIds: string[];
  notes?: string;
}
```

**Backward compat:** `sessionId` kept. `listMaterials()` now checks both `sessionId` and `linkedSessionIds`.

### Question Model (`teacher-question-store.ts`)

Added fields:
```
chapterIds: string[]
lessonIds: string[]
conceptIds: string[]
atomicConceptIds: string[]
sessionIds: string[]
```

**Backward compat:** `chapterId`, `sessionId`, `concept`, `atomicConcept` kept. New questions auto-populate arrays from single values.

### New: Lesson Store (`teacher-lesson-store.ts`)

Full CRUD store:
```typescript
interface TeacherLesson {
  id: string;
  publicCode: string;  // LES-26-XXXX
  courseId: string;
  chapterIds: string[];
  title: string;
  description: string;
  order: number;
  conceptIds: string[];
  atomicConceptIds: string[];
  status: "draft" | "published" | "archived";
}
```

### New: Concept Types (`teacher-concept-types.ts`)

Type definitions only (no store yet):
```typescript
interface TeacherConcept {
  id, publicCode (CON-26-XXXX), courseId, chapterIds[], lessonIds[],
  title, description, parentConceptId?, status
}

interface TeacherAtomicConcept {
  id, publicCode (ATC-26-XXXX), courseId, conceptId,
  chapterIds[], lessonIds[], title, description, difficulty, status
}
```

### New: Normalization Helpers (`normalize.ts`)

Functions to ensure old persisted data works:
- `normalizeSession()` — fills missing arrays from single ID fields
- `normalizeMaterial()` — fills linkedSessionIds from sessionId
- `normalizeQuestion()` — fills arrays from single fields

---

## Why Additive Fields Were Added

1. **Sessions can span multiple chapters** — teacher may create a revision session covering 3 chapters
2. **Materials are reusable** — same video used in multiple sessions (linkedSessionIds)
3. **Questions are reusable** — same question in multiple quizzes/sessions (sessionIds)
4. **Video segmentation** — map timestamps to concepts for smart learning
5. **Session types** — distinguish lesson from exam from homework
6. **Lessons exist separately** — a topic/lesson is not the same as a delivery session

---

## What Remains for Phase B

| Task | Description |
|------|-------------|
| Material Library page | Upload once, browse, reuse in sessions |
| Session Builder with block picker | Pick materials/questions from library |
| Video timestamp editor | Split long video into segments |
| Multi-chapter session UI | Select multiple chapters in session form |
| Lesson management page | Create/edit lessons within a course |

---

## What Remains for Phase C (Multi-Linking)

| Task | Description |
|------|-------------|
| Question multi-select | Choose multiple sessions/chapters per question |
| Material sharing UI | Link material to additional sessions |
| Quiz Builder | Build quizzes from question bank (references, not copies) |

---

## What Remains for Phase D (Concept System)

| Task | Description |
|------|-------------|
| Concept store + CRUD | Full store like chapters/sessions |
| Concept tree UI | Hierarchical concept editor |
| Concept → material linking | Map resources to concepts |
| Student concept mastery | Track per-concept progress |
| Smart Revision integration | Revision reads concept graph |

---

## Migration Notes

- **No breaking changes** — all new fields are optional or auto-initialized
- **Old localStorage data** continues working (normalization helpers handle missing fields)
- **Student session player** unchanged — reads materials via `getPublishedMaterials()` which now checks both `sessionId` and `linkedSessionIds`
- **Public course details** unchanged — reads published chapters/sessions as before
- **Existing teacher UIs** unchanged — forms still use single-value fields, arrays populated automatically
