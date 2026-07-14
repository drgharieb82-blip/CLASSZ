# CLASSZ Flexible Content Architecture Audit

**Date:** 2026-06-21
**Branch:** lovable-ui-import
**Method:** Source inspection (no code changes)
**Goal:** Evaluate current architecture against the flexible session model

---

## 1. What Is Currently Too Linear

### Session → Chapter: 1:1 Lock
**File:** `src/lib/teacher/teacher-session-store.ts` line 11
- `chapterId: string` (single value)
- Sessions cannot span multiple chapters
- Sessions cannot exist without a chapter
- No `chapterIds[]` array

### Material → Session: 1:1 Lock (No Library)
**File:** `src/lib/teacher/teacher-material-store.ts` lines 9-11
- `sessionId: string` (single value, required)
- Materials are created inside a session and locked to it
- No material library concept — cannot upload once and reuse
- Duplicating a video across sessions requires separate records
- No `linkedSessionIds[]` array

### Question → Session/Chapter: 1:1 Lock
**File:** `src/lib/teacher/teacher-question-store.ts` lines 18-20
- `courseId`, `chapterId`, `sessionId` — all single strings
- Questions cannot be reused across sessions
- Only workaround: `duplicateQuestion()` (creates new record)
- No `sessionIds[]` or `chapterIds[]` arrays

### No Lesson Entity
- "Lesson" is treated as a synonym for "Session" throughout
- `courseDetailsMock.ts` line 131: `lessonsCount: chSessions.length`
- No independent Lesson model exists
- Cannot organize topics separately from delivery sessions

### Concept/AtomicConcept: Flat Strings Only
**File:** `src/lib/teacher/teacher-question-store.ts` lines 21-22
- `concept: string`, `atomicConcept: string`
- Not structural entities — no Concept table/store
- Cannot link materials or sessions to concepts
- Cannot track mastery per concept
- Cannot build concept-based revision

### No Video Segmentation
**File:** `src/lib/teacher/teacher-material-store.ts` line 19
- Only `videoDuration?: string` — no segments
- Cannot split a long video into conceptual sections
- Cannot map timestamps to chapters/concepts
- Cannot create session items from video segments

### Session Type Not Flexible
**File:** `src/lib/teacher/teacher-session-store.ts`
- No `sessionType` field (lesson/revision/practice/quiz/exam/homework/mixed)
- No `materialIds[]`, `questionIds[]`, `quizIds[]` arrays
- Session is purely a container for materials in fixed order
- Cannot include standalone quizzes or homework

---

## 2. What Already Supports Flexibility

| Feature | Location | Status |
|---------|----------|--------|
| Multi-status at all levels (draft/published/archived) | All stores | ✅ Working |
| Session-level access control (locked/unlocked/scheduled) | session-store.ts:18 | ✅ Working |
| Session-level pricing (free or paid per session) | session-store.ts:15-16 | ✅ Working |
| Free preview flag per session | session-store.ts:24 | ✅ Working |
| Course-level + country-specific pricing | course-store.ts:26-28 | ✅ Working |
| Material type system (video/pdf/image/attachment/notes) | material-store.ts:5 | ✅ Working |
| Question types (MCQ/essay/calculation) | question-store.ts:5 | ✅ Working |
| Question difficulty/tags for filtering | question-store.ts:14-15 | ✅ Working |
| Question duplication | question-store.ts:131 | ✅ Partial (workaround for reuse) |
| Material ordering within session | material-store.ts:105 | ✅ Working |
| Chapter ordering within course | chapter-store.ts:98 | ✅ Working |
| Session ordering within chapter | session-store.ts:103 | ✅ Working |
| FilterBar + Pagination on all teacher pages | components/filters/ | ✅ Working |
| Public code system for all entities | All stores | ✅ Working |
| Student session player adapts to available content | sessionMock.ts:290-331 | ✅ Working |

---

## 3. Required Model Changes

### 3.1 Session Model (HIGH PRIORITY)

**Current:** Session has single `chapterId`, is a dumb container for materials.

**Required:**
```typescript
interface TeacherSession {
  // ... existing fields kept ...
  
  // NEW: Flexible linking (arrays replace single IDs)
  chapterIds: string[];     // was: chapterId: string
  lessonIds: string[];      // NEW
  conceptIds: string[];     // NEW
  atomicConceptIds: string[]; // NEW
  
  // NEW: Session type
  sessionType: "lesson" | "revision" | "practice" | "quiz" | "exam" | "homework" | "mixed";
  
  // NEW: Content references (session as flexible package)
  materialIds: string[];    // references to material library
  questionIds: string[];    // references to question bank
  quizIds: string[];        // references to quizzes
  examIds: string[];
  homeworkIds: string[];
}
```

### 3.2 Material Model (HIGH PRIORITY)

**Current:** Material locked to one session, no library, no segments.

**Required:**
```typescript
interface TeacherMaterial {
  // ... existing fields kept ...
  
  // REMOVE: sessionId (material lives in library, linked via session.materialIds)
  // KEEP: courseId (optional, for organization)
  
  // NEW: Library concept
  linkedSessionIds: string[];    // which sessions use this material
  linkedChapterIds: string[];
  linkedLessonIds: string[];
  linkedConceptIds: string[];
  linkedAtomicConceptIds: string[];
  reuseCount: number;
  
  // NEW: Video segments
  segments?: VideoSegment[];
  videoDurationSeconds?: number;
  thumbnailUrl?: string;
}

interface VideoSegment {
  segmentId: string;
  startTime: number;    // seconds
  endTime: number;
  title: string;
  chapterIds: string[];
  lessonIds: string[];
  conceptIds: string[];
  atomicConceptIds: string[];
  notes: string;
}
```

### 3.3 Question Model (MEDIUM PRIORITY)

**Current:** Question locked to single course/chapter/session.

**Required:**
```typescript
interface TeacherQuestion {
  // ... existing fields kept ...
  
  // CHANGE: Single IDs → Arrays
  courseId: string;           // keep single (questions belong to one course)
  chapterIds: string[];      // was: chapterId: string
  lessonIds: string[];       // NEW
  conceptIds: string[];      // was: concept: string
  atomicConceptIds: string[]; // was: atomicConcept: string
  sessionIds: string[];      // was: sessionId: string (now multi-link)
}
```

### 3.4 Lesson Model (NEW ENTITY)

**Currently missing.** Add:
```typescript
interface TeacherLesson {
  id: string;
  publicCode: string;        // LSN-26-XXXX
  courseId: string;
  chapterIds: string[];
  title: string;
  description: string;
  order: number;
  conceptIds: string[];
  atomicConceptIds: string[];
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
}
```

### 3.5 Concept Model (NEW ENTITY)

**Currently flat strings.** Add structured entity:
```typescript
interface TeacherConcept {
  id: string;
  publicCode: string;
  courseId: string;
  chapterIds: string[];
  title: string;
  description: string;
  atomicConcepts: AtomicConcept[];
  status: "draft" | "published";
}

interface AtomicConcept {
  id: string;
  title: string;
  description: string;
  parentConceptId: string;
}
```

---

## 4. Required Store Changes

| Store | Change Type | Migration Risk |
|-------|-------------|----------------|
| `teacher-session-store.ts` | **Extend** — add arrays, sessionType | Low (additive fields) |
| `teacher-material-store.ts` | **Restructure** — remove sessionId, add library mode | Medium (changes data flow) |
| `teacher-question-store.ts` | **Extend** — single IDs → arrays | Low (additive) |
| NEW: `teacher-lesson-store.ts` | **Create** | None (new entity) |
| NEW: `teacher-concept-store.ts` | **Create** | None (new entity) |

---

## 5. Required UI Changes

### Teacher Side

| Page | Change | Priority |
|------|--------|----------|
| `/teacher/courses/$courseId/sessions` | Add sessionType selector, material picker from library | High |
| NEW: `/teacher/materials` | Material library page (upload, browse, reuse) | High |
| Session materials page | Change from "create in session" to "pick from library + add new" | High |
| Question create form | Change single selects to multi-select for chapter/session | Medium |
| NEW: Video timestamp editor | Split long video into segments, map to concepts | Medium |
| NEW: `/teacher/courses/$courseId/lessons` | Lesson management separate from sessions | Low |
| NEW: `/teacher/courses/$courseId/concepts` | Concept tree editor | Low |

### Student Side

| Component | Change | Priority |
|-----------|--------|----------|
| Session player | Show content by type (video, pdf, quiz, etc.) — hide empty | Already works |
| Course details | Show chapters + lessons (not just sessions) | Medium |
| Progress tracking | Track per-concept mastery | Low (future) |
| Smart Revision | Link to concepts | Low (future) |

---

## 6. Safe Migration Plan

### Phase A: Non-Breaking Additions (Safe)

1. Add `sessionType` field to TeacherSession (default: "lesson")
2. Add `chapterIds[]` to TeacherSession alongside existing `chapterId` (keep both, prefer array)
3. Add `segments[]` to TeacherMaterial (optional, no impact on existing)
4. Add `linkedChapterIds[]`, `linkedConceptIds[]` to TeacherMaterial (optional)
5. Create `teacher-lesson-store.ts` (new file, no impact)
6. Create `teacher-concept-store.ts` (new file, no impact)

### Phase B: Library Mode (Medium Risk)

7. Add `materialIds[]` to TeacherSession (sessions reference library materials)
8. Make `sessionId` optional on TeacherMaterial (allow library-only materials)
9. Create Material Library page
10. Update session materials page to "pick from library OR upload new"
11. Keep backward compat: materials with `sessionId` still render in that session

### Phase C: Multi-Linking (Low Risk)

12. Change `chapterId` → `chapterIds[]` on questions (keep parsing old single value)
13. Change `sessionId` → `sessionIds[]` on questions
14. Change `concept`/`atomicConcept` strings → `conceptIds[]`/`atomicConceptIds[]`
15. Update question create form to multi-select

### Phase D: Concept System (Future)

16. Create Concept tree UI
17. Link materials → concepts
18. Link sessions → concepts
19. Student concept mastery tracking
20. Smart Revision reads concept graph

---

## 7. Recommended Implementation Phases

### Immediate (Before Quiz Builder)

| # | Task | Files | Risk |
|---|------|-------|------|
| 1 | Add `sessionType` field to session store + UI | session-store.ts, sessions page | None |
| 2 | Add `chapterIds[]` alongside `chapterId` on session | session-store.ts | None |
| 3 | Add `segments[]` to material model | material-store.ts | None |
| 4 | Create Material Library page (upload once, browse) | NEW route | None |
| 5 | Update session page to "pick from library" workflow | sessions page | Low |

### Next (With Quiz Builder)

| # | Task | Files | Risk |
|---|------|-------|------|
| 6 | Add `questionIds[]` to session model | session-store.ts | None |
| 7 | Make questions multi-linkable (sessionIds[]) | question-store.ts | Low |
| 8 | Build Quiz Builder that references question bank | NEW route + store | None |
| 9 | Add `quizIds[]` to session model | session-store.ts | None |

### Later (Concept System)

| # | Task | Risk |
|---|------|------|
| 10 | Create Lesson store + UI | None |
| 11 | Create Concept store + UI | None |
| 12 | Video timestamp editor | None |
| 13 | Concept-based revision integration | Low |
| 14 | Student concept mastery tracking | Medium |

---

## Summary

**Current architecture is 70% correct** in structure but **too rigid in relationships**. The main issues are:
1. All links are 1:1 (need 1:many via arrays)
2. No material library (need reusable resources)
3. No video segmentation
4. No structural concepts (only metadata strings)
5. Session is too simple (needs type + content block references)

The migration is safe because all changes are **additive** — existing fields/stores continue working while new array fields and entities are introduced alongside them. No breaking changes required.
