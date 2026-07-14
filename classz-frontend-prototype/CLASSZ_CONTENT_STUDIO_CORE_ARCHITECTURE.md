# CLASSZ Content Studio — Core Architecture

**Date:** 2026-06-22
**Status:** Foundation implemented

---

## Naming

Material Library → **Content Studio**

Route: `/teacher/content-studio`
Old route `/teacher/materials` still works (not removed).

---

## Course-First Workflow

Content Studio opens with a course selector at the top.
All tabs are scoped to the selected course.
Teacher can switch between "Current Course" and "All My Library" where applicable.

---

## Tabs

1. **Content Tree** — Course → Chapters → Lessons → Concepts → Atomic Concepts
2. **Sessions** — All session types for the course
3. **Materials** — Videos, PDFs, images, attachments, notes, worksheets
4. **Questions** — MCQ, Essay, Calculation with full metadata
5. **Quizzes** — Build from question bank
6. **Homework** — Worksheets, essays, file uploads
7. **Exams** — Formal exams with teacher-controlled XP
8. **Assignments** — Projects, research, presentations

---

## Cross-Course Reuse

| Action | Entity behavior | PublicCode |
|--------|----------------|------------|
| Link | Same entity, multiple course links | Unchanged |
| Copy | New entity, new UUID | New code generated |
| Move | Same entity, removed from old course | Unchanged |
| Share | Same entity, linkedCourseIds[] | Unchanged |

---

## Public Code System

Every Content Studio entity has a permanent immutable publicCode.

| Entity | Prefix | Digits | Example |
|--------|--------|--------|---------|
| Subject | SUB | 6 | SUB-26-000001 |
| Course | CRS | 6 | CRS-26-000001 |
| Chapter | CHP | 6 | CHP-26-000001 |
| Lesson | LES | 6 | LES-26-000001 |
| Concept | CON | 6 | CON-26-000001 |
| Atomic Concept | ATC | 6 | ATC-26-000001 |
| Session | SES | 6 | SES-26-000001 |
| Material | MAT | 6 | MAT-26-000001 |
| Video Segment | SEG | 6 | SEG-26-000001 |
| Question | QST | 6 | QST-26-000001 |
| Quiz | QZ | 6 | QZ-26-000001 |
| Exam | EXM | 6 | EXM-26-000001 |
| Homework | HWK | 6 | HWK-26-000001 |
| Assignment | ASN | 6 | ASN-26-000001 |

Backend: `backend/app/core/identity.py` — CodeGeneratorService with PostgreSQL sequences.
Frontend: `src/lib/content-studio/base-entity.ts` — mock generation for development.

---

## Base Entity Metadata

Every entity includes:

```typescript
interface BaseEntityMetadata {
  internalUUID, publicCode, title, status,
  createdBy, createdAt,
  updatedBy, updatedAt,
  publishedBy?, publishedAt?,
  archivedBy?, archivedAt?,
  ownership: { ownerTeacherId, ownerTeacherCode },
  version, copiedFromEntityCode?,
  isOfficial, isCustom,
  tags[], notes,
  useCount, isFavorite
}
```

---

## Audit Trail

```typescript
interface AuditEvent {
  id, entityType, entityId, entityPublicCode,
  action, actor, createdAt, details?
}
```

Actions: created, updated, published, unpublished, archived, deleted, copied, moved, linked, unlinked, used_in_session, used_in_quiz

---

## Implementation Status

| Component | Status |
|-----------|--------|
| Base entity types | ✅ Implemented |
| Backend identity (all codes) | ✅ Updated (14 entity types) |
| Content Studio page | ✅ Course selector + 8 tabs |
| Sidebar updated | ✅ "Content Studio" link |
| Old routes preserved | ✅ /teacher/materials still works |
| Metadata helpers | ✅ create, update, publish, archive, copy |
| Audit event types | ✅ Type definitions |

---

## What Remains for Backend Integration

- PostgreSQL sequences for all 14 Content Studio entity types
- Database models with BaseEntityMetadata fields
- API endpoints for CRUD with audit logging
- Replace localStorage stores with API calls
- Real file upload (S3/R2) replacing URL placeholders
- Audit trail persistence and query endpoints
