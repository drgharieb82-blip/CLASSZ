# Content Studio Backend Compatibility Verification

---

## 1. Current Backend Capabilities

The `lesson_blocks` table is the intended persistence layer for Content Studio blocks.

| Capability | Status | Detail |
|---|---|---|
| Block ordering | ✅ Supported | `position INT NOT NULL` + `UniqueConstraint("lesson_id", "position")` + `list_lesson_blocks` returns ordered by `position ASC` |
| Block type field | ⚠️ Partial | `block_type_enum` in PostgreSQL has 5 values: `TEXT`, `PDF`, `IMAGE`, `VIDEO`, `ATTACHMENT` |
| Content payload | ✅ Supported | `data_json JSON NOT NULL DEFAULT {}` — accepts any structure per block type |
| Metadata | ✅ Supported | Lives in `data_json`; no separate column needed |
| Attachment blocks | ✅ Supported | `ATTACHMENT` enum value + `AttachmentBlockData(file_url, filename)` schema |
| Image blocks | ✅ Supported | `IMAGE` enum value + `ImageBlockData(image_url, caption)` schema |
| PDF blocks | ✅ Supported | `PDF` enum value + `PdfBlockData(file_url, title)` schema |
| Text blocks | ✅ Supported | `TEXT` enum value + `TextBlockData(content)` schema |
| Video blocks | ⚠️ Partial | `VIDEO` enum value **exists in the DB** but the schema validator explicitly rejects it: `raise ValueError("VIDEO blocks are reserved for a future phase")`. A separate `videos` table is linked 1:1 to `lesson_blocks` via `lesson_block_id` FK, storing provider, `provider_video_id`, `duration_seconds`, `thumbnail_url`. The full video infrastructure is built — it is only blocked by a validator. |
| Read (list + single) | ✅ Supported | `GET /api/lesson-blocks?lesson_id=<uuid>` and `GET /api/lesson-blocks/{block_id}` |
| Create | ✅ Supported | `POST /api/lesson-blocks` |

---

## 2. Missing Capabilities

### 2a. Missing block type enum values (DB migration required)

These block types are specified for Content Studio but do **not** exist in `block_type_enum`:

| Block Type | Status |
|---|---|
| `RICH_TEXT` | ❌ Missing from enum |
| `QUIZ` | ❌ Missing from enum |
| `ASSIGNMENT` | ❌ Missing from enum |
| `DIVIDER` | ❌ Missing from enum |
| `CALLOUT` | ❌ Missing from enum |
| `CODE` | ❌ Missing (future — can be deferred) |

`block_type_enum` is a native PostgreSQL enum, not a VARCHAR. Adding values requires `ALTER TYPE block_type_enum ADD VALUE '...'` via Alembic migration. This is the **only** required database change.

### 2b. VIDEO is blocked by a validator (code change, no migration)

`LessonBlockBase.validate_phase_two_a_block_type` in `lesson_blocks/schemas.py` raises a ValueError for VIDEO. The underlying DB column and the related `videos` table are fully built. Unblocking VIDEO requires deleting one validator and adding `BlockType.VIDEO` to `BLOCK_DATA_SCHEMAS`.

### 2c. Missing per-block flags

The frontend Content Studio block model includes `required: boolean` and `locked: boolean` per block. The `lesson_blocks` model has no such columns. These can be stored in `data_json` (no migration needed) or as new columns.

| Missing flag | Frontend uses it? | Recommendation |
|---|---|---|
| `is_required` (block is mandatory to complete session) | Yes | Store in `data_json` — no migration |
| `is_locked` (block gated behind access rule) | Yes | Store in `data_json` — no migration |
| Per-block `release_at` / `hide_at` | No (those are on `lessons`) | Not needed at block level |

### 2d. Missing CRUD operations on blocks

| Operation | Status |
|---|---|
| `PATCH /api/lesson-blocks/{block_id}` (update content, position, flags) | ❌ No endpoint |
| `DELETE /api/lesson-blocks/{block_id}` | ❌ No endpoint |
| Auto-position on create | ❌ Client must provide `position`; no auto-count like chapters/lessons |

### 2e. Schema validation gap for new block types

`validate_data_json_for_block_type` in `LessonBlockBase` calls `BLOCK_DATA_SCHEMAS[self.block_type]` which will raise a `KeyError` for any block type not in the map. New types (RICH_TEXT, QUIZ, ASSIGNMENT, DIVIDER, CALLOUT) need corresponding data schema classes added before they can be used.

### 2f. Quiz and Assignment reference infrastructure

The `quizzes` and `assignments` modules exist and are registered in `main.py`. However, there is no block-level link between a QUIZ block and the quiz it references. When QUIZ/ASSIGNMENT block types are enabled, `data_json` will store the reference (e.g. `{ "quiz_id": "..." }`). No new tables are needed — the reference lives entirely in `data_json`.

---

## 3. Required API Additions

All of these are service/router/schema additions only. No new tables.

| Addition | File(s) |
|---|---|
| Remove VIDEO validator + add VIDEO to `BLOCK_DATA_SCHEMAS` | `lesson_blocks/schemas.py` |
| Add `RichTextBlockData`, `QuizBlockData`, `AssignmentBlockData`, `DividerBlockData`, `CalloutBlockData` schemas | `lesson_blocks/schemas.py` |
| `PATCH /api/lesson-blocks/{block_id}` — partial update (data_json, position) | `lesson_blocks/router.py`, `service.py` |
| `DELETE /api/lesson-blocks/{block_id}` | `lesson_blocks/router.py`, `service.py` |
| Auto-position in `create_lesson_block` — count existing blocks for lesson before insert | `lesson_blocks/service.py` |

---

## 4. Required Database Changes

Only **one** migration is absolutely necessary:

```sql
-- Add new values to the block_type_enum PostgreSQL native enum
ALTER TYPE block_type_enum ADD VALUE 'RICH_TEXT';
ALTER TYPE block_type_enum ADD VALUE 'QUIZ';
ALTER TYPE block_type_enum ADD VALUE 'ASSIGNMENT';
ALTER TYPE block_type_enum ADD VALUE 'DIVIDER';
ALTER TYPE block_type_enum ADD VALUE 'CALLOUT';
```

This requires a new Alembic migration file. No tables are added or altered — only the enum type is extended.

Per-block flags (`is_required`, `is_locked`) **do not** require a migration. They will live in `data_json`.

The `videos` table already exists and is already correctly linked to `lesson_blocks` via `lesson_block_id`. No changes needed.

---

## 5. Frontend Architecture Compatibility

**The current CLASSZ Content Studio architecture can remain unchanged.**

Every item in sections 2 and 3 above is a backend change only:
- New enum values in the DB
- New data schema classes in Python
- Two new router endpoints (PATCH, DELETE)
- One validator removed
- Auto-position logic in service

None of these require touching any frontend file. The frontend's in-memory block model (`BuilderBlock`, `BUILDER_BLOCK_META`, `buildBuilderBlocks`) and the session builder UI are completely unaffected.

When Milestone 4 connects the Content Studio to the backend, the frontend will add API calls to existing endpoints — it will not restructure its block data model or UI.

---

## Summary Table

| Requirement | Ready? | Gap |
|---|---|---|
| Block ordering | ✅ | None |
| Text block | ✅ | None |
| Rich Text block | ❌ | Enum value + schema missing |
| Video block | ⚠️ | Validator blocks it; unblock = 1 code change |
| PDF block | ✅ | None |
| Image block | ✅ | None |
| Attachment block | ✅ | None |
| Quiz block | ❌ | Enum value + schema missing |
| Assignment block | ❌ | Enum value + schema missing |
| Divider block | ❌ | Enum value + schema missing |
| Callout block | ❌ | Enum value + schema missing |
| Code block (future) | ❌ | Deferred — not blocking |
| Content payload | ✅ | `data_json` covers all types |
| Quiz reference in block | ✅ | Goes in `data_json.quiz_id` |
| Assignment reference in block | ✅ | Goes in `data_json.assignment_id` |
| Per-block required flag | ⚠️ | No column; store in `data_json` |
| Per-block locked flag | ⚠️ | No column; store in `data_json` |
| Per-block release options | ✅ | Not needed at block level; lives on `lessons` |
| Read blocks (list + single) | ✅ | None |
| Create block | ⚠️ | No auto-position; client must provide `position` |
| Update block | ❌ | PATCH endpoint missing |
| Delete block | ❌ | DELETE endpoint missing |
| Frontend architecture change | ✅ | Not required |
