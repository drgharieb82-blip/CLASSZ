![1783419521979](image/SPRINT_1_DOMAIN_CORRECTION_PLAN/1783419521979.png)![1783419527798](image/SPRINT_1_DOMAIN_CORRECTION_PLAN/1783419527798.png)![1783419532115](image/SPRINT_1_DOMAIN_CORRECTION_PLAN/1783419532115.png)![1783419544402](image/SPRINT_1_DOMAIN_CORRECTION_PLAN/1783419544402.png)# SPRINT 1 — DOMAIN CORRECTION FOUNDATION

**Status:** PLANNING ONLY. No code was written. No migrations were created. No implementation file was modified.
**Governing document:** `CLASSZ_CANONICAL_DOMAIN_MODEL.md` (frozen — overrides all previous assumptions, including the Milestone 3 Session=Lesson mapping).
**Goal of this sprint:** Correct the backend/frontend foundation so CLASSZ structurally follows the canonical domain model — without changing any visible UI, route, or terminology, and without touching the Assessment engine migration (explicitly deferred, see "Out of Scope").

---

## 0. Sprint Boundary — What Sprint 1 Does and Does Not Cover

**In scope** (maps 1:1 to the 8 tasks given):
1. Independent `sessions` backend module
2. Blocks re-homed from `lesson_blocks` (Lesson-owned) to `session_blocks` (Session-owned)
3. `session_lesson_refs`, `session_concept_refs`, `session_atomic_concept_refs` join tables
4. `concepts` and `atomic_concepts` entities (Academic Domain, currently non-existent)
5. Unified `assessments` entity — **design only**, no migration this sprint (see rationale in §5)
6. Frontend API layer: `TeacherSession` reads/writes `/api/sessions`, not `/api/lessons`
7. Zero visible UI/terminology change — only the data layer underneath changes
8. Disposition plan for the Milestone 3 lessons-as-sessions code and data

**Out of scope for Sprint 1** (deferred, per the canonical model's own open-decision list):
- Migrating `quizzes`/`assignments`/`quiz_attempts`/`assignment_submissions` into the unified `assessments` table (Decision item #10 in the canonical model — high-risk, touches live attempt data, needs its own sprint)
- Any pricing/monetization schema on `sessions` (price, currency, access model) — not one of the 8 listed tasks
- Concept/Atomic Concept authoring UI — backend entities only this sprint, no new teacher-facing screens
- Enrollment, wallet, payments backend — pre-existing gaps, unrelated to this correction
- Student Memory, AI Domain, Parent-linking schemas — all flagged `HUMAN DECISION REQUIRED` in the canonical model and not part of the 8 tasks

---

## 1. Exact Implementation Order

Phases are sequenced by hard FK dependency, not by convenience. Each phase ends at a checkpoint (§8) that must pass before the next phase starts.

```
Phase 0 — Pre-flight                     (branch, backups, no schema change)
Phase 1 — Academic Domain addition       (concepts, atomic_concepts)
Phase 2 — Delivery Domain foundation     (sessions table + module)
Phase 3 — Session Blocks + Video reparent
Phase 4 — Reference joins                (session_lesson_refs / _concept_refs / _atomic_concept_refs)
Phase 5 — Assessment design note         (no migration — see §5)
Phase 6 — Frontend API layer correction
Phase 7 — Milestone 3 legacy disposition
Phase 8 — Full regression checkpoint
```

Rationale for this order:
- `concepts`/`atomic_concepts` only depend on the already-existing `lessons` table → can be built first, in isolation, with zero risk to anything currently working.
- `sessions` only depends on the already-existing `courses` table → second, also isolated.
- `session_blocks` depends on `sessions` (Phase 2) → third. Video re-parenting is bundled here because `videos` currently FKs to `lesson_blocks`, the table `session_blocks` is replacing for delivery content.
- The three reference-join tables depend on `sessions` (Phase 2), `lessons` (pre-existing), `concepts` and `atomic_concepts` (Phase 1) all existing simultaneously → must come after Phases 1–2.
- Frontend changes (Phase 6) come only after the backend `sessions`/`session_blocks` endpoints are live and checkpointed — never ship a frontend pointed at an endpoint that hasn't passed its own checkpoint.
- Legacy disposition (Phase 7) comes last, once the new path is proven, so there is always a working fallback until the very end of the sprint.

---

## 2. Database Migrations Needed

All migrations are additive (`CREATE TABLE` / `ADD COLUMN`) except one flagged non-additive change in Phase 3. Naming follows the existing convention (`YYYYMMDDNNNN_description.py`); exact timestamps assigned at implementation time.

| # | Migration (illustrative name) | Phase | Change | Reversible? |
|---|---|---|---|---|
| M1 | `_academic_concepts_foundation.py` | 1 | `CREATE TABLE concepts` (FK `lesson_id → lessons.id`, cascade); `CREATE TABLE atomic_concepts` (FK `concept_id → concepts.id`, cascade) | Yes — pure additive, `downgrade()` drops both tables |
| M2 | `_delivery_sessions_foundation.py` | 2 | `CREATE TABLE sessions` (FK `course_id → courses.id`, cascade; fields per §3 minimal set below) | Yes — additive |
| M3 | `_session_blocks_foundation.py` | 3 | `CREATE TABLE session_blocks` (FK `session_id → sessions.id`, cascade; new `session_block_type_enum` — **a new enum, not an ALTER on the existing `block_type_enum`**, to avoid touching `lesson_blocks`) | Yes — additive |
| M4 | `_reparent_videos_to_session_blocks.py` | 3 | `ALTER TABLE videos ADD COLUMN session_block_id UUID NULL, FK → session_blocks.id`. **`lesson_block_id` is NOT dropped this sprint** — both columns coexist, nullable, so a video row can point to either during transition. Application code will only ever populate `session_block_id` going forward. | Yes — additive; downgrade drops the new column only |
| M5 | `_session_reference_joins.py` | 4 | `CREATE TABLE session_lesson_refs` (session_id, lesson_id, composite unique, both FKs cascade); `CREATE TABLE session_concept_refs` (session_id, concept_id); `CREATE TABLE session_atomic_concept_refs` (session_id, atomic_concept_id) | Yes — additive |

No migration is created for Assessments in this sprint (§5). No migration touches `lessons`, `lesson_blocks`, `quizzes`, `assignments`, `quiz_attempts`, or `assignment_submissions` — all five remain byte-for-byte as they are today.

`HUMAN DECISION REQUIRED` (inherited from the canonical model, resurfacing here as an implementation blocker): `session_blocks` needs a way to reference an Assessment for its `QUIZ`/`ASSIGNMENT` block types, but the unified `assessments` table doesn't exist yet this sprint. **Interim design for M3 only:** add two nullable FK columns, `quiz_id → quizzes.id` and `assignment_id → assignments.id`, used only when `block_type IN ('QUIZ','ASSIGNMENT')`. These two columns are explicitly interim scaffolding, to be replaced by a single `assessment_id → assessments.id` FK once Sprint 2 unifies the Assessment engine. This must be confirmed before Phase 3 starts, or `session_blocks` cannot support quiz/assignment blocks at all this sprint.

---

## 3. Backend Files to Create / Modify

### Phase 1 — `backend/app/modules/concepts/` (directory exists today, empty — populate it)

| File | Action | Contents |
|---|---|---|
| `concepts/models.py` | Create | `Concept` model (`id`, `lesson_id` FK, `title`, `description`, `position`, timestamps); `AtomicConcept` model (`id`, `concept_id` FK, `title`, `description`, `position`, timestamps) |
| `concepts/schemas.py` | Create | `ConceptCreate`/`ConceptRead`, `AtomicConceptCreate`/`AtomicConceptRead` |
| `concepts/service.py` | Create | `create_concept`, `list_concepts(lesson_id)`, `create_atomic_concept`, `list_atomic_concepts(concept_id)` — mirrors the existing `lessons/service.py` position-auto-calculation pattern |
| `concepts/router.py` | Create | `GET/POST /api/concepts`, `GET/POST /api/atomic-concepts` |
| `concepts/__init__.py` | Create/confirm | Module init |
| `backend/app/main.py` | Modify | Import and register `concepts_router` |

### Phase 2 — `backend/app/modules/sessions/` (new directory)

| File | Action | Contents |
|---|---|---|
| `sessions/models.py` | Create | `Session` model — `id`, `course_id` FK (cascade), `title`, `description`, `session_type`, `status`, `position`, `is_free_preview`, `release_at`, `hide_at`, `requires_previous_completion`, `is_locked`, `duration_minutes`, timestamps. (Monetization/access-model fields explicitly deferred — out of scope §0.) |
| `sessions/schemas.py` | Create | `SessionCreate`, `SessionRead` — mirrors `lessons/schemas.py` structure exactly, renamed |
| `sessions/service.py` | Create | `create_session` (auto-position by course), `list_sessions(course_id)` — mirrors `lessons/service.py` |
| `sessions/router.py` | Create | `GET /api/sessions?course_id=`, `POST /api/sessions` |
| `sessions/__init__.py` | Create | Module init |
| `backend/app/main.py` | Modify | Import and register `sessions_router` |

### Phase 3 — `backend/app/modules/session_blocks/` (new directory) + `videos` modification

| File | Action | Contents |
|---|---|---|
| `session_blocks/models.py` | Create | `SessionBlock` model — `id`, `session_id` FK (cascade), `block_type` (new `session_block_type_enum`: `TEXT, RICH_TEXT, VIDEO, PDF, IMAGE, ATTACHMENT, QUIZ, ASSIGNMENT, CALLOUT, DIVIDER`), `position`, `data_json`, interim `quiz_id`/`assignment_id` nullable FKs (see §2 decision flag), timestamps |
| `session_blocks/schemas.py` | Create | Per-block-type data schemas mirroring `lesson_blocks/schemas.py` (`TextBlockData`, `RichTextBlockData`, `PdfBlockData`, `ImageBlockData`, `AttachmentBlockData`, `CalloutBlockData`, `DividerBlockData` — new; `VideoBlockData`, `QuizBlockData`, `AssignmentBlockData` — new, not previously defined anywhere) |
| `session_blocks/service.py` | Create | `list_session_blocks(session_id)`, `get_session_block`, `create_session_block` — CRUD parity with `lesson_blocks/service.py` at minimum |
| `session_blocks/router.py` | Create | `GET /api/session-blocks?session_id=`, `GET /api/session-blocks/{id}`, `POST /api/session-blocks` |
| `session_blocks/__init__.py` | Create | Module init |
| `backend/app/modules/videos/models.py` | Modify | Add `session_block_id` (nullable UUID FK → `session_blocks.id`) alongside existing `lesson_block_id` (unchanged, not dropped this sprint) |
| `backend/app/modules/videos/schemas.py` | Modify | Accept optional `session_block_id` on create |
| `backend/app/modules/videos/service.py` | Modify | New video creation paths use `session_block_id`; existing `lesson_block_id` path left untouched for backward compatibility |
| `backend/app/main.py` | Modify | Import and register `session_blocks_router` |

### Phase 4 — Reference join tables (no new module; lives inside `sessions` module for now)

| File | Action | Contents |
|---|---|---|
| `sessions/models.py` | Modify (append) | `SessionLessonRef`, `SessionConceptRef`, `SessionAtomicConceptRef` models — each a simple composite-key join row |
| `sessions/schemas.py` | Modify (append) | Corresponding create/read schemas |
| `sessions/service.py` | Modify (append) | `link_lesson_to_session`, `link_concept_to_session`, `link_atomic_concept_to_session`, and matching `unlink_*`/`list_*` functions |
| `sessions/router.py` | Modify (append) | `POST/DELETE /api/sessions/{id}/lessons/{lesson_id}`, `.../concepts/{concept_id}`, `.../atomic-concepts/{atomic_concept_id}`, plus `GET` list variants |

### Confirm-before-building

| File | Action needed |
|---|---|
| `backend/app/db/migrations.py` (or equivalent migration registry, per prior investigation this file was touched when the now-removed `student_memory` migration was added/removed) | Confirm whether any new module requires registration here beyond the standard Alembic `versions/` file — verify before Phase 1 begins |

---

## 4. Frontend Files to Create / Modify

**Hard constraint for this entire phase:** no route file, no page layout, no user-visible copy changes. Every change below is either a new file the UI doesn't know about, or an internal edit to a store/API-client file whose public function signatures stay stable.

| File | Action | Change |
|---|---|---|
| `src/lib/api/sessions.ts` | Create | `createSession`, `listSessions(courseId)`, mirroring `src/lib/api/lessons.ts` exactly but pointed at `/api/sessions` and shaped to the new `SessionRead`/`SessionCreatePayload` (course-scoped, not chapter-scoped) |
| `src/lib/api/session-blocks.ts` | Create | Minimal `createSessionBlock`, `listSessionBlocks(sessionId)` — parity with what `lesson-blocks` would need, kept minimal since Content Studio block-wiring itself remains out of scope this sprint (per `CONTENT_STUDIO_VERIFICATION.md`, blocks aren't wired to any backend today regardless) |
| `src/lib/teacher/teacher-session-store.ts` | Modify | Replace `createLesson`/`listLessons` imports with `createSession`/`listSessions`; rewrite `toSession()` adapter to map directly from `SessionRead` (no more Lesson-field translation); `createSession()`/`loadSessions()` now send/receive `course_id` as the primary key parameter instead of `chapter_id` |
| `src/lib/teacher/teacher-session-store.ts` | Modify | `TeacherSession.chapterId` (singular) stops being sent to the backend as an FK — becomes a **client-derived, read-only convenience field** computed from the session's linked lessons (see chapter-filter mitigation, §6 risk R4) rather than a value the store owns |
| `src/lib/teacher/session-workspace-types.ts` | Modify | Align its independent `SessionStatus` type (`draft/published/archived/locked`) down to the 3-value canonical set (`draft/published/archived`) used by `teacher-session-store.ts`, per the already-approved Decision 6 recommendation — this file is not wired to any live route, so this is a low-risk type-only edit |
| `src/routes/teacher.courses.$courseId.sessions.tsx` | Modify (internal only) | `loadSessions(chapterId, courseId)` call becomes `loadSessions(courseId)`; the existing chapter filter dropdown is preserved in the UI but now filters client-side over the derived `chapterId` field (§6 R4) instead of driving the API query |
| `src/routes/teacher.courses.$courseId.sessions.$sessionId.tsx` | No change required | Reads `getSessionById`/store actions whose public shape is unchanged |
| `src/routes/teacher.content-studio.tsx` | No change required | Consumes `useTeacherSessionStore` at the same public interface |
| `src/routes/student.courses.$courseId.session.tsx` | No change required | Reads through `sessionMock.ts` → `getPublishedSessions()`, whose public interface is unchanged |
| `src/lib/sessionMock.ts` | No change required this sprint | `buildTeacherSessionCourse()` continues to work unmodified since `TeacherSession`'s public shape is preserved |
| `src/lib/api/lessons.ts` | No change | Left fully intact — it remains the correct client for real Academic Lessons (see §7) |

---

## 5. Assessment Unified Entity — Design Only (No Migration This Sprint)

Per the canonical model, all Assessment Types (`QUIZ`, `HOMEWORK`, `ASSIGNMENT`, `EXAM`) are meant to share one `assessments` engine. This sprint documents the target shape but does **not** migrate the existing `quizzes`/`assignments`/`quiz_attempts`/`assignment_submissions` tables, for the same reason flagged in `SESSION_DECISIONS_FOR_APPROVAL.md` Decision 5: those tables hold the only currently-working, end-to-end assessment-tracking data in the system, and migrating them under sprint time pressure is the highest-risk move available.

**Target shape (for Sprint 2 planning, not built now):**
- `assessments` — `id`, `course_id`, `chapter_id` (nullable), `lesson_id` (nullable), `assessment_type` (`QUIZ`/`HOMEWORK`/`ASSIGNMENT`/`EXAM`), settings fields (duration, passing score, attempts, grading mode), timestamps
- `assessment_questions` — join, replaces `quiz_questions`
- `assessment_attempts` — replaces `quiz_attempts` + `assignment_submissions`, behavior branches on `assessment_type`

This design is recorded here so that Sprint 1's interim `session_blocks.quiz_id`/`assignment_id` columns (§2) have a documented replacement target and are not mistaken for a permanent design.

---

## 6. Risks

| # | Risk | Detail | Mitigation |
|---|---|---|---|
| R1 | Breaking the only working teacher flow | `teacher-session-store.ts`'s create/list flow is the one thing Milestone 3 got fully working end-to-end. Repointing it to `/api/sessions` is a breaking change if done before the backend is checkpointed. | Backend Phases 1–4 must each pass their own checkpoint (§8) before Phase 6 (frontend) starts. Never merge frontend and backend session changes in the same deploy without the backend already live and verified. |
| R2 | Chapter-filter UX regression | Sessions no longer have a `chapter_id` FK (per the canonical model, Session's parent is Course only). The existing sessions-list page's chapter filter has nothing to query against until a session actually has lesson references attached — and there is no lesson-linking UI yet (out of scope, §0). A freshly migrated session, with zero `session_lesson_refs`, would show up in no chapter group at all. | Preserve the filter as a client-side, best-effort derivation (§4); explicitly warn stakeholders that the chapter filter will show "Unassigned" for every session until lesson-linking exists, rather than silently disappearing — this is a real, visible regression the sprint must flag, not silently absorb. |
| R3 | Milestone 3 test data confusion | Rows in `lessons` created via the old Session-create form are test data pretending to be lessons. Per the domain-alignment document, this was already known to be disposable ("test data only... no production data migration required"). If left untouched, teachers may see stray "lesson" rows under a real Chapter with no obvious origin. | Explicit disposition plan in §7 — do not leave ambiguous. |
| R4 | Interim FK scaffolding gets treated as permanent | The `quiz_id`/`assignment_id` columns on `session_blocks` (§2) are explicitly temporary. If Sprint 2 (Assessment unification) slips, this scaffolding could calcify the same way the Session=Lesson mapping did. | This document names the interim columns as interim in the schema comment/design note itself; Sprint 2 scoping should treat their removal as a tracked follow-up, not an optional cleanup. |
| R5 | New enum vs. altering existing enum | Reusing/altering `block_type_enum` (used by `lesson_blocks`) risks unintended interaction with the untouched `lesson_blocks` table. | M3 creates a distinct `session_block_type_enum` rather than mutating the existing one (§2). |
| R6 | Video re-parenting ambiguity during transition | With both `lesson_block_id` and `session_block_id` nullable on `videos` simultaneously, it becomes possible (application-level, not DB-level) to create a video row pointing at neither, or attempt to point at both. | Application-layer validation (not a DB constraint this sprint) should reject "both null" and "both set" on write; full enforcement (making the correct one required) deferred to the Sprint 2 cleanup once `lesson_block_id` is retired. |
| R7 | Scope creep into Assessment migration | Given the assessment design work in §5 is fresh in-progress context, there is a natural pull to "just migrate `quizzes` too while we're here." | Explicitly called out as out-of-scope (§0); Sprint 1's Definition of Done (§8) does not include any `assessments` table. |
| R8 | Sprint 1 timeline risk | Five new/modified backend modules, three new tables, one schema modification to a table with real production-shaped rows (`videos`), plus a frontend store rewrite, is substantial scope for a single sprint if the environment is genuinely time-boxed. | Phases 1–2 (concepts/atomic_concepts, sessions) are isolated and independently shippable if the sprint needs to be split; Phase 3 (blocks + video reparenting) is the most complex and should be scheduled with the most buffer. |

---

## 7. Milestone 3 Legacy Disposition (Task 8)

The Milestone 3 changes are, specifically: `backend/app/modules/lessons/schemas.py` (split `LessonCreate`), `lessons/service.py` (auto-position, `list_lessons`), `lessons/router.py` (`GET /api/lessons?chapter_id=`), and the frontend's `teacher-session-store.ts` calling these as if lessons were sessions.

**Decision: keep the backend Lesson endpoints exactly as they are; stop the frontend from calling them for Session purposes.**

1. **`backend/app/modules/lessons/*` is NOT reverted or removed.** The domain-alignment document already established that `lessons` was always structurally correct for real Academic Lessons — the only error was using it as if it were Sessions. The `GET /api/lessons?chapter_id=` endpoint and the auto-position logic remain exactly as built; they simply resume being used for their original, correct purpose (Academic Lesson CRUD), which Sprint 1 does not otherwise touch.
2. **`teacher-session-store.ts` stops importing from `src/lib/api/lessons.ts`** entirely (Phase 6, §4) — this is the actual undo of the Milestone 3 mismap, at the only layer where the mismap lived (the frontend's choice of which API to call).
3. **Existing rows in `lessons` created by the old Session-create flow** (test data, per the domain-alignment document's own conclusion) are left in place but **flagged for manual review, not auto-deleted.** Recommend a one-time, manually-run audit query (not part of this sprint's automated migrations) to identify rows created through the old flow — e.g. by creation-date range corresponding to Milestone 3 testing — for a human to decide whether to delete or keep as legitimate placeholder Lessons. **Do not script an automatic delete** without confirming no shared/staging environment has since treated this data as real.
4. **`teacher-lesson-store.ts`** (a separate, pre-existing frontend store for actual academic Lessons, found disconnected from any route during prior investigation) is left untouched this sprint — its relationship to the corrected model is not one of the 8 listed tasks and remains `HUMAN DECISION REQUIRED` from the canonical model's open list.

---

## 8. Build / Test Checkpoints

Each checkpoint must pass before the next phase begins. None of these are implemented yet — they are the gate criteria for when implementation happens.

| Checkpoint | After Phase | Pass criteria |
|---|---|---|
| **A** | 1 (concepts/atomic_concepts) | `alembic upgrade head` succeeds; `alembic downgrade -1` succeeds and round-trips cleanly; `pytest` (backend suite) green; manual smoke test: create a Concept under an existing Lesson, create an Atomic Concept under it, list both back |
| **B** | 2 (sessions) | Migration round-trip as above; `POST /api/sessions` + `GET /api/sessions?course_id=` manually smoke-tested; `sessions_router` confirmed present in `main.py`'s registered router list; `pytest` green |
| **C** | 3 (session_blocks + videos reparent) | Migration round-trip; `POST /api/session-blocks` smoke-tested for every one of the 10 canonical block types (with `QUIZ`/`ASSIGNMENT` using the interim `quiz_id`/`assignment_id` columns); existing `videos` endpoints still function; a new video row can be created against `session_block_id` |
| **D** | 4 (reference joins) | Migration round-trip; manually link one Session to one Lesson, one Concept, one Atomic Concept via the new endpoints; confirm cascade-delete behavior when the parent Session (or the referenced Lesson/Concept) is deleted |
| **E** | 6 (frontend) | `npx tsc --noEmit` — zero errors; `vite build` — exit 0; manual browser smoke test: teacher creates a session and the network tab shows a call to `/api/sessions`, **not** `/api/lessons`; session appears in the sessions list; chapter filter still renders (with the known "Unassigned" caveat, R2); publish/archive still update local state as before |
| **F** | 8 (final regression) | Full backend `pytest` suite green; full frontend build green; full manual walk-through: Teacher creates Course → Chapter → Lesson (confirms Lesson flow still works, untouched) → Session (confirms new flow) → publishes Session; Student opens the Session Player and it still renders (confirms `sessionMock.ts` bridge unaffected); confirm no regression in any Milestone 1–3 flow that this sprint did not intend to touch |

---

## 9. Rollback Strategy

- **Branching:** all Sprint 1 work happens on a dedicated branch (e.g. `sprint-1-domain-correction`); the pre-sprint commit is tagged for instant reference. No merge to `main` until Checkpoint F passes.
- **Backend migrations are additive by design (M1, M2, M3, M5)** — each has a clean `downgrade()` that drops only the new table(s). Rolling back any of these does not touch `lessons`, `lesson_blocks`, `quizzes`, `assignments`, or their data.
- **M4 (videos re-parenting) is the one schema change to an existing table.** Because it only *adds* a nullable column (`session_block_id`) without dropping `lesson_block_id`, its `downgrade()` is equally clean — drop the added column, no data loss, since nothing this sprint requires `lesson_block_id` to be removed.
- **Frontend rollback:** because `src/lib/api/lessons.ts` and the old lesson-calling logic are left fully intact (not deleted) per §7, a frontend-only rollback is a matter of reverting the Phase 6 commit(s) to `teacher-session-store.ts` — the old, working Milestone 3 path is still physically present in git history and did not require the backend to change to be restored.
- **No destructive action is taken against Milestone 3 data** (§7) — the legacy rows remain available for inspection or recovery regardless of which direction the sprint goes.
- **If Checkpoint C or D fails** (the highest-complexity phases), the sprint can stop after Checkpoint B with Phases 1–2 merged alone — `concepts`/`atomic_concepts`/`sessions` are independently valid additions even without `session_blocks` or the reference joins, since nothing yet depends on them.

---

## Summary of Items Still Requiring Confirmation Before Phase 1 Starts

1. Confirm the interim `session_blocks.quiz_id`/`assignment_id` scaffolding approach (§2) is acceptable, or specify an alternative, before `session_blocks/models.py` is written.
2. Confirm the chapter-filter mitigation approach (§4, §6 R2) — client-derived `chapterId` from lesson references, with an expected "Unassigned" state until lesson-linking UI exists — is an acceptable interim UX, or specify an alternative before Phase 6 starts.
3. Confirm whether `backend/app/db/migrations.py` (or equivalent registry) needs updates for the new modules (§3, "Confirm-before-building").
4. Confirm the Milestone 3 legacy-data review process (§7, item 3) — who performs the manual audit of old test rows in `lessons`, and on what timeline.
