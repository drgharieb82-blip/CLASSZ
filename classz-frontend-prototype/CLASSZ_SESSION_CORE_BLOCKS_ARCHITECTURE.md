# CLASSZ Session Core Blocks Architecture

**Date:** 2026-06-23
**File:** `src/lib/teacher/session-workspace-types.ts`
**Status:** Upgraded — no duplicate architecture, no standalone builder page

---

## Session Philosophy

A **Session** is a **Learning Experience** — the final packaging layer inside Content Studio.

A session is NOT:
- A chapter
- A single video
- A CRUD form

A session **references** existing assets:
- **Materials** (videos, PDFs, images) via `materialId`
- **Question Bank** (questions) via Assessment Engine
- **Assessment Engine** (quizzes, exams, homework) via `assessmentId`

A session **never duplicates** assets. It composes them into a learning flow.

---

## Block Types

### New Architecture (12 block types)

| Block Type | Purpose | Key Reference |
|------------|---------|---------------|
| `video_playlist` | One or more videos, supports from/to timestamps | `materialId` per item |
| `resources` | PDFs, images, attachments, external links | `materialIds[]` |
| `assessment` | Quiz, exam, homework, assignment — references Assessment Engine | `assessmentId` |
| `text` | Instructions, teacher notes, objectives, announcements, summaries | Inline content |
| `completion_rules` | What the student must do to "complete" the session | Rule definitions |
| `rewards` | XP, coins, badges, certificates on completion | Reward config |
| `notes` | Student note-taking, teacher starter notes | Config flags |
| `qa` | Student Q&A with moderation | Config flags |
| `discussion` | Class discussion thread | Config flags |
| `ai_assistant` | AI-powered explain, summarize, quiz-me, weak concepts | Mode selection |
| `live_meeting` | Meeting URL + schedule for live sessions | URL + datetime |
| `external_link` | Link to external resource | URL |

### Legacy Block Types (still supported)

| Legacy | Maps To |
|--------|---------|
| `video` | `video_playlist` |
| `pdf` | `resources` |
| `image` | `resources` |
| `question_block` | `assessment` |
| `quiz_block` | `assessment` |
| `homework_block` | `assessment` |
| `exam_block` | `assessment` |
| `assignment_block` | `assessment` |
| `summary` | `text` |
| `meeting_link` | `live_meeting` |
| `mind_map` | (no mapping — preserved as-is) |
| `notes` | `notes` (same key) |

Legacy mapping is handled by `LEGACY_TO_NEW_BLOCK_MAP` and `mapLegacyBlockToNewBlock()`.

---

## Video Playlist Block

Supports:
- Single full video (one item, no from/to)
- Multiple full videos (multiple items)
- Video segments (from/to timestamps on same materialId)
- Mixed segments across different videos

```typescript
VideoPlaylistBlock {
  type: "video_playlist"
  items: VideoPlaylistItem[]     // ordered list
  settings: VideoPlaylistSettings
}

VideoPlaylistItem {
  materialId: string             // references teacher-material-store
  fromTime?: number              // seconds (optional clip start)
  toTime?: number                // seconds (optional clip end)
  required: boolean
  completionThresholdPercent: number  // e.g. 80
}

VideoPlaylistSettings {
  autoNext: boolean
  allowSkip: boolean
  showCheckmarks: boolean
  completionThresholdPercent: number  // default threshold
}
```

---

## Resources Block

Aggregates materials without duplication:

```typescript
ResourcesBlock {
  type: "resources"
  materialIds: string[]          // references teacher-material-store
  externalLinks: ExternalLink[]  // title + url
  downloadRequired?: boolean
  visibleAfterBlockId?: string   // show only after another block completes
}
```

---

## Assessment Block

References the Assessment Engine — never copies questions:

```typescript
AssessmentBlock {
  type: "assessment"
  assessmentId: string           // references teacher-assessment-store
  passScoreOverride?: number     // override assessment's default pass score
  attemptLimitOverride?: number
  unlockNextOnPass?: boolean     // gate next block behind passing
}
```

Backward compatibility: legacy `quiz_block`, `homework_block`, `exam_block`, `assignment_block` all map to `assessment`.

---

## Access & Monetization Model

Sessions support flexible access:

| Model | Description |
|-------|-------------|
| `free` | No payment required |
| `paid_once` | One-time purchase |
| `included_in_course` | Bundled with course enrollment |
| `included_in_monthly_subscription` | Part of subscription plan |
| `wallet_only` | Pay with in-app wallet coins |
| `gifted` | Free access granted by teacher |
| `scholarship` | Free access for scholarship students |

Additional fields: `price`, `currency`, `countryPrices[]`, `walletAllowed`, `subscriptionPlanIds[]`, `accessDurationDays`, `availableFrom`, `availableUntil`.

---

## Teaching Modes

| Mode | Description |
|------|-------------|
| `traditional` | Video + Resources + Assessment |
| `enhanced` | Traditional + Notes + Communication |
| `smart_classz` | Enhanced + AI Assistant + Advanced completion/rewards |

Templates are pre-configured for each mode.

---

## Templates

8 built-in templates:

| Template | Type | Mode | Blocks |
|----------|------|------|--------|
| Full Lesson | lesson | traditional | video_playlist, resources, assessment, completion_rules, rewards |
| Enhanced Lesson | lesson | enhanced | + notes |
| Smart CLASSZ Lesson | lesson | smart_classz | + ai_assistant |
| Revision | revision | — | video_playlist, text, assessment |
| Final Revision | final_revision | — | text, assessment, completion_rules |
| Live Session | live | — | live_meeting, notes, assessment |
| Practice Only | practice | — | assessment, rewards |
| Crash Course | crash_course | — | video_playlist, text, assessment, completion_rules, rewards |

---

## Helpers

| Function | Purpose |
|----------|---------|
| `mapLegacyBlockToNewBlock(block)` | Convert legacy block type to new equivalent |
| `normalizeSessionBlock(block)` | Fill defaults (order, required, status) |
| `normalizeSessionWorkspaceData(data)` | Fill all defaults for workspace data |
| `createDefaultBlock(type)` | Generic block with defaults |
| `createDefaultVideoPlaylistBlock()` | Empty video playlist with default settings |
| `createDefaultResourcesBlock()` | Empty resources block |
| `createDefaultAssessmentBlock()` | Empty assessment reference |
| `createDefaultTextBlock(textType)` | Text block with specified type |
| `createDefaultCompletionRulesBlock()` | Default "all required blocks complete" rule |
| `createDefaultRewardsBlock()` | 50 XP + 10 coins default |
| `createDefaultNotesBlock()` | Notes with all student features enabled |
| `createDefaultAIAssistantBlock()` | AI with explain, summarize, quiz_me modes |
| `buildStudentSessionFromWorkspace(data)` | Extract student-visible blocks, completion rules, rewards |

---

## Mock Workspace Examples

3 examples in `MOCK_WORKSPACES`:

1. **Traditional Lesson** — video_playlist (1 video) + resources + assessment
2. **Enhanced Revision** — video_playlist (2 videos) + assessment + completion_rules + rewards
3. **Smart CLASSZ Session** — video_playlist (3 segments with from/to) + resources + assessment + notes + ai_assistant + completion_rules + rewards

---

## What Remains Before UI

- [ ] Session builder UI: Update block palette to render new block types with config panels
- [ ] Video playlist editor: UI to add/reorder playlist items with from/to time pickers
- [ ] Assessment picker: UI to select from Assessment Engine
- [ ] Resources picker: UI to select from Materials library
- [ ] Completion rules editor: UI to define rules per block
- [ ] Rewards editor: UI to set XP, coins, badges, certificate
- [ ] Student session player: Consume `buildStudentSessionFromWorkspace()` output
- [ ] Access model UI: Session pricing/access configuration in settings tab
