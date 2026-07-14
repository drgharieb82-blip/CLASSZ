# CLASSZ Session Workspace Architecture

**Date:** 2026-06-22
**Status:** Foundation implemented, Graph Mode future-ready

---

## Philosophy

Teachers don't sell videos — they sell **learning experiences**.
A session is a curated package of content, practice, and assessment.

---

## Session Types (10)

| Type | Use Case |
|------|----------|
| Lesson | Standard teaching session |
| Revision | Review and reinforcement |
| Practice | Question-focused session |
| Quiz Session | Quiz + explanation |
| Exam Session | Formal assessment |
| Homework Session | Assignment delivery |
| Mixed | Any combination |
| Live | Meeting + notes |
| Crash Course | Intensive fast coverage |
| Final Revision | Pre-exam summary |

---

## Session Templates (Built-in)

| Template | Blocks |
|----------|--------|
| Full Lesson | Video → PDF → Questions → Quiz → Homework |
| Revision | Video → Mind Map → Questions → Quiz |
| Final Revision | Summary → Questions → Exam |
| Live Session | Meeting Link → Notes → Homework |
| Practice Only | Questions → Quiz |
| Crash Course | Video → Summary → Quiz → Exam |

Teachers can save custom templates.

---

## Session Workspace Layout (Target)

```
┌────────────┬──────────────────────────────┬─────────────┐
│ LEFT       │ CENTER                       │ RIGHT       │
│            │                              │             │
│ Content    │ Session Canvas               │ Properties  │
│ Tree       │                              │ Access      │
│            │ [Video Block]                │ Analytics   │
│ Session    │ [PDF Block]                  │ Publish     │
│ Tree       │ [Quiz Block]                 │ Preview     │
│            │ [Homework Block]             │             │
│ Materials  │                              │ Metadata    │
│            │                              │             │
│ Questions  │ + Add Block                  │ Audit       │
└────────────┴──────────────────────────────┴─────────────┘
```

---

## Session Canvas Blocks (12)

| Block | Description |
|-------|-------------|
| Video | Attach or upload video |
| PDF | Attach PDF/worksheet |
| Notes | Text content |
| Image | Visual content |
| Question Block | Practice questions |
| Quiz Block | Attached quiz |
| Homework Block | Attached homework |
| Exam Block | Attached exam |
| Assignment Block | Attached assignment |
| Meeting Link | Live session URL |
| Mind Map | Visual concept map |
| Summary | Quick reference |

---

## Session Dependencies

Session can require completion of:
- Previous session(s)
- Quiz with minimum score
- Homework submission
- Custom conditions

---

## Completion Rules

Session is "complete" when:
- Watch X% of video
- Answer N questions
- Score X% on quiz
- Submit homework
- Custom rule

---

## Session Rewards

| Reward | Description |
|--------|-------------|
| XP | Experience points |
| Coins | Wallet coins |
| Badge | Achievement badge |
| Achievement | Unlock achievement |

---

## Session Versioning

- Version counter increments on each update
- Restore previous versions (future)
- Clone session creates new UUID + publicCode

---

## Session Series

Group related sessions:
- "Organic Revision Series"
- "Crash Course: Derivatives"
- "Final Revision Pack"

---

## Release Schedule

| Mode | Behavior |
|------|----------|
| Publish Now | Immediately available |
| Schedule | Available at set date/time |
| After Previous | Unlocks when prerequisite complete |
| Lock After | Access expires after N days |

---

## Target Students

| Target | Who sees it |
|--------|-------------|
| All | Everyone enrolled |
| Country | Specific countries |
| Group | Student groups |
| Weak Students | Students at risk |
| Scholarship | Scholarship holders |
| Specific | Hand-picked students |

---

## Session Graph (Future)

Visual dependency graph like FigJam/Miro:
- Nodes = sessions
- Edges = dependencies
- Coverage overlay = concepts covered
- Colors = session types

---

## Implementation Status

| Feature | Status |
|---------|--------|
| Session types (10) | ✅ Types defined |
| Built-in templates (6) | ✅ Implemented |
| Session Workspace page | ✅ List + Templates + Graph placeholder |
| Block types (12) | ✅ Types defined |
| Canvas blocks in session editor | ✅ Already works (Phase B) |
| Dependencies model | ✅ Types defined |
| Completion rules model | ✅ Types defined |
| Rewards model | ✅ Types defined |
| Session graph view | 🔮 Future |
| Drag-and-drop canvas | 🔮 Future |
| Version history UI | 🔮 Future |
| Session preview modes | 🔮 Future |

---

## Current Session Builder (Existing)

The per-course session management at `/teacher/courses/$courseId/sessions/$sessionId`
already supports:
- Material blocks (video, PDF, notes, etc.)
- Quiz block (active)
- Exam block (active)
- Homework block (active)
- Assignment block (active)
- Publish/unpublish per material
- Reorder materials

The Session Workspace page at `/teacher/sessions` is the **global overview**
that shows all sessions across courses with templates and future graph mode.
