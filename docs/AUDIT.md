# Tidy V3 current-state audit (PRD Phase 0)

Date: 2026-11-09. Audited code: the working tree on top of commit `1ddb2f7`, including the uncommitted V1 migration work.
Sources of truth: `AGENTS.md` and `docs/PRD_Project_Board_Enhancement_FA.md`. Designs: `design/v3/`.

No application code was changed for this audit.

## Baseline

| Check | Result |
|---|---|
| `npm test` | 115 passed |
| `npx playwright test` | 60 passed |
| `npx tsc --noEmit` | passed |
| `npm run lint` | passed |
| `npm run build` | passed |

## Architecture as found

- Next.js 16 App Router, client-only page: `frontend/app/page.tsx`. No API, database or authentication exists.
- One Zustand persisted store, key `kanban-store`, version 3: `frontend/lib/store.ts`. All reads and writes go through it.
- Model: `frontend/lib/types.ts`. Column order lives in `Column.cardIds`; there is no `Task.columnId` or `position`.
- `ColumnId` is a closed union of five ids (`types.ts:12`). The ids `"done"` and `"todo"` and the CSS variable `--accent-${id}` are used directly in the store, components and shortcuts.
- Card ids (`c1`, or a UUID) also key the task room in `messages` and `unread`.
- Chat images are stored as Data URLs inside `messages`, in localStorage (`Conversation.tsx:153-167`).

## Summary

| FR | Capability | Release | Status |
|---|---|---|---|
| FR-01 | Workspace / project / board | R1 | Improve (multiple projects: Defer) |
| FR-02 | Configurable columns and workflow | R1 | Improve |
| FR-03 | Task CRUD and details | R1 | Improve |
| FR-04 | Drag and drop and ordering | R1 | Improve |
| FR-05 | Assignee, priority, dates, labels | R1 | Improve |
| FR-06 | Checklist and progress | R1 | Add |
| FR-07 | Search, filter, sorting | R1 | Add |
| FR-08 | Comments and mentions | R1 | Add (chat mention: Improve) |
| FR-09 | Activity history | R1 | Improve |
| FR-10 | Files and attachments | R2 | Improve |
| FR-11 | Roles and permissions | R1 | Add, demo only (server enforcement: Defer) |
| FR-12 | Subtasks | R2 | Add |
| FR-14 | WIP limits | R2 | Improve |
| FR-16 | Board, Table, Calendar views | R2 | Add (Board: Existing) |
| FR-19 | Saved views | R2 | Add |
| FR-21 | Notifications and inbox | R2 | Improve |
| FR-29 | Responsive, RTL, accessibility | R1 | Improve |
| FR-30 | Archive, restore, soft delete | R1 | Add (Undo: Existing) |

## Findings by feature

### FR-01 Workspace, project, board: Improve
- Exists: one fixed workspace card in `frontend/components/Sidebar.tsx:92-104`; one board in `frontend/app/page.tsx`.
- Missing: project name and key (`TDY`), Project settings page, Inbox, Archive and Saved views in the sidebar.
- Defer: multiple projects and workspaces (Phase 2). AC-01.3 needs an API, so it is covered only by the demo `can` check.

### FR-02 Columns and workflow: Improve
- Exists: rename, WIP limit and collapse in `frontend/components/Column.tsx:39-120`; store actions `renameColumn`, `setWipLimit`, `toggleColumn` in `frontend/lib/store.ts:340-349`.
- Missing: add, recolor, reorder, delete with target, final-column flag.
- Risk: the closed `ColumnId` type and direct uses of `"done"` and `"todo"` in `store.ts`, `Header.tsx:21`, `Header.tsx:94`, `TaskPanel.tsx:42`, `Board.tsx:111`, `useShortcuts.ts:52` and `Sidebar.tsx:39` must become data driven.
- Risk: `Conversation.tsx:32` assumes the column of a `moved` event still exists, so deleting a column would crash the room. Events need a stored column name.

### FR-03 Task CRUD and details: Improve
- Exists: create and edit dialog with empty-title error in `frontend/components/CardDialog.tsx:59-74`; `updateCard` and `deleteCard` in `store.ts`.
- Missing: stable key, drawer, direct link (AC-03.4), `createdBy`, `createdAt`, lightweight Markdown.
- Behavior change required: card click opens the room today (`frontend/components/Card.tsx:152`); V3 opens the drawer.
- Safe today: details render as plain text (`TaskPanel.tsx:136`). AC-03.5 becomes active when Markdown is added.

### FR-04 Drag and drop: Improve
- Exists: mouse and keyboard, live preview, order persistence in `frontend/components/Board.tsx:37-64` and `store.ts:288-293`; covered by `frontend/e2e/board.spec.ts`.
- Missing: Move to menu (AC-04.4), rejection for hard WIP limits.
- Bug: a move that fails to save at storage quota is neither reverted nor reported; only `sendMessage` checks `lastWriteFailed` (`store.ts:319-325`).
- Not applicable until a server exists: AC-04.3, AC-04.5.

### FR-05 Assignee, priority, dates, labels: Improve
- Exists: multiple members, priority, Jalali due date, fixed labels in `CardDialog.tsx`, `frontend/components/JalaliDatePicker.tsx`, `frontend/components/ui.tsx`.
- Missing: start date and the rule that start cannot be after due.

### FR-06 Checklist: Add
- No model or UI. The manual slider is in `TaskPanel.tsx:60-71`, and it must switch to "from checklist" when items exist.

### FR-07 Search and filter: Add
- Nothing exists. Needs one query function that Board, Table and Calendar all use (AC-07.1).

### FR-08 Comments and mentions: Add
- Task rooms are chat (`frontend/components/Conversation.tsx`), not comments. There is no edit, delete or mention anywhere.

### FR-09 Activity history: Improve
- Exists: `moved`, `progress`, `added`, `removed` chat events through `logEvent` (`store.ts:206-207`).
- Missing: separate activity log, old and new values, field edits, checklist, attachment and archive events.
- Gap: message time is `HH:mm` only, so events have no date.

### FR-10 Attachments: Improve
- Exists: image compression and the 2 MB limit in `frontend/lib/compressImage.ts`, chat images in `Conversation.tsx:153-167`.
- Missing: task attachments, PDF and text files, IndexedDB storage, download and delete.

### FR-11 Roles and permissions: Add, demo only
- One fixed user and no roles. Needs a central `can(role, action)` and a role switcher. Server enforcement (AC-03, AC-04.3, E2E-05) is deferred.

### FR-12 Subtasks: Add
- No parent and child model. The rooms list and board counts must exclude subtasks where `AGENTS.md` says so.

### FR-14 WIP limits: Improve
- Exists: soft limit with at and over states in `Column.tsx:176-216`.
- Missing: `hard_block` mode, its toast and the design's mode label.

### FR-16 Multiple views: Add
- Board exists. `View` is only `"board" | "chat"` (`types.ts:14`). Table, Calendar and the toolbar are new.

### FR-19 Saved views: Add
- Nothing exists.

### FR-21 Notifications: Improve
- Exists: unread chat counts in `Sidebar.tsx:73` and `store.ts`.
- Missing: notification entity, Inbox, bell, deduplication.

### FR-29 Responsive, RTL, accessibility: Improve
- Exists: logical CSS, `dir` switching, focus ring, labels, keyboard drag; Persian-layout shortcuts by physical key in `frontend/lib/useShortcuts.ts`.
- Missing: any layout below desktop width. Playwright runs only at 1860 by 900 (`frontend/playwright.config.ts:11`). Task keys, file names and links need forced LTR.

### FR-30 Archive and soft delete: Add
- Exists: hard delete with a six-second, unpersisted Undo in `store.ts:225-284` and `frontend/components/UndoToast.tsx`.
- Missing: archive, restore, `deletedAt`, Archive page. The `Del` key must change from delete to archive (`useShortcuts.ts:62`).

## Items outside the R1 and R2 list

- **FR-15 Dependencies** is R3 in the PRD, but `AGENTS.md` requires it (drawer, Blocked badge, cycle-rejection test). See the open decision in `PLAN.md`.
- AC-17.1 (start after due) comes from the deferred FR-17, but `AGENTS.md` requires the rule for the drawer, so it is included under FR-05.
- Deferred: FR-13, FR-18, FR-20, FR-22 to FR-28, and FR-17 beyond that rule.

## Risks

| Risk | Mitigation |
|---|---|
| V2 data has images in localStorage, so a second copy as backup can exceed the 5 MB quota | Back up the raw V2 payload to IndexedDB and verify it before migrating |
| Column and position model change touches most components | Do it first, behind unchanged store actions, with the existing tests as the safety net |
| Existing tests encode V2 behavior (card click, `Del`) | Update them in the step that changes the behavior, and say so in the commit |
| Soft-deleted tasks stay in storage | Exclude them everywhere through one selector; listed as a known limitation |
| Blank page when localStorage is blocked: hydration never reports ready (`page.tsx`, from reading the code; not reproduced yet) | Reproduce in Step 1 and fix if confirmed |

## Design and specification differences

`AGENTS.md` wins where they differ, except for visual details it does not specify.

| Topic | Design | `AGENTS.md` | Decision |
|---|---|---|---|
| Board count | Sidebar and Table show 12 | 10 tasks on the board, 2 archived | Count active tasks only (10) |
| Channels section | Not drawn | Required | Keep `# General` |
| Summary and density | Not drawn in the V3 top bar | Required, as in V2 | Place them at the end of the toolbar row, Board only |
| Date format | Short on cards, with year in the drawer | `18 Aban 1405` | Short on cards and calendar cells, full in fields |
| "Couldn't save the move" toast | Shown with Retry | Not specified | Use it for storage-quota failures only |
| TDY-8 checklist | `2/6` in States, none in Board and Table | Not specified | Follow Board and Table: no checklist |
