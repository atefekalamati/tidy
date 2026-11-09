# Tidy V3 plan

Sources of truth: `AGENTS.md`, `docs/PRD_Project_Board_Enhancement_FA.md` (R1 and R2 only), `design/v3/`. Current state: `docs/AUDIT.md`.

Status: **awaiting approval. No V3 implementation has started.**

Client-side only. No server, API, authentication or real-time work. R3, R4 and Phase 2 stay deferred, except FR-15 if approved below.

## Working rules

- One step at a time, in this order. Boxes are ticked only after the step's tests pass.
- After each step: `npm test`, `npx tsc --noEmit`, `npm run lint`, `npx playwright test`, then one separate commit directly on `main`. No pushes.
- Tests that encode replaced V2 behavior are updated in the step that replaces it, and the commit says so.
- Each step is reported with the PRD format: Feature ID, previous status, files, acceptance criteria covered, tests, limitations.
- Every new string goes in both `en.ts` and `fa.ts`. Logical CSS only. No emoji.

## Decisions needing your approval

1. **FR-15 Dependencies.** The PRD puts it in R3, and you said R3 is deferred, but `AGENTS.md` requires it in the drawer, on the card and in the tests. The plan follows `AGENTS.md` and includes it in Step 10. If you prefer to defer it, Step 10 becomes subtasks only and the Blocked badge is dropped.
2. **FR-29 mobile scope.** `AGENTS.md` and the designs describe desktop only, while the PRD asks for responsive behavior. The plan does a modest Step 16: usable down to 768px, not a dedicated phone design.

## Decisions already made (change any of them before approval)

- Default demo role is Manager, as in the design. The role only simulates permissions.
- `can(role, action)` keeps exactly that signature. "Member edits only their own tasks" uses separate `task.edit.own` and `task.edit.any` actions, with one small helper that checks membership.
- Reviewer's moves use the column ids `review` and `doing` and the final column. If those columns were deleted, Reviewer has no move rights.
- Migrated V2 tasks get `createdAt` set to the migration time, `createdBy` set to the current user, and one Activity entry saying they came from an earlier version. V2 stored no real values.
- Migration adds no sample content to a user's existing data. New users get the full V3 seed.
- Old chat images stay as Data URLs, because messages must remain untouched. New chat images and attachments go to IndexedDB.
- Soft-deleted tasks stay in storage, hidden everywhere. `AGENTS.md` defines no screen for them.
- Comments are a new entity. Task rooms remain chat.
- Design and specification differences are resolved in `docs/AUDIT.md`.
- `design/tidy-v3-files.zip` is not committed. Its contents are already in `docs/`, `design/v3/` and `AGENTS.md`.

## Steps

### Step 0: Baseline commits
- [ ] Commit the existing uncommitted V1 migration work on its own.
- [ ] Commit the V3 documents: `AGENTS.md`, the PRD, `design/v3/`, `docs/AUDIT.md`, `PLAN.md`.
- **Done when:** the working tree is clean except the zip, and all baseline checks still pass.

### Step 1: Data model and V2 migration (FR-03, FR-05, FR-09 base)
- [ ] New model: `Task` (`id`, `key`, `columnId`, `position`, `parentId`, `startDate`, `dueDate`, `createdBy`, `createdAt`, `archivedAt`, `deletedAt`), `Column` (id, name, color, WIP limit and mode, final flag, collapsed), and `ChecklistItem`, `TaskRelation`, `Comment`, `Attachment`, `ActivityEvent`, `Notification`, `SavedView`. Project name, key and next key number.
- [ ] Store version 4. Existing action names stay, so components change little.
- [ ] Migration from versions 2 and 3, and from V1 through the existing path. Task ids are unchanged, so rooms and unread counts stay attached. Keys are assigned once, in existing card order.
- [ ] Before any rewrite, save the raw V2 payload to IndexedDB (`idb-keyval`) and verify it by reading it back. If that fails, or the migrated write fails, leave the original untouched and show the recovery screen. Extend the recovery screen to the V2 backup.
- [ ] Full V3 seed with dates relative to first run, as `AGENTS.md` lists.
- [ ] Reproduce the suspected blank page when localStorage is blocked, and fix it if confirmed.
- **Done when:** a V2 fixture keeps every card, order, member, progress value, renamed column, WIP limit, collapse state, message (including images), unread count and preference; a second load changes nothing; failed backup and failed write leave the original byte for byte; V1 to V4 works; all existing behavior tests pass.
- **Rollback:** restore the raw backup from the recovery screen.

### Step 2: Configurable columns and project settings (FR-01, FR-02, FR-14)
- [ ] Add column, rename, color, reorder (Move left / right), mark as final, delete. Delete with tasks requires a target; at least one column and exactly one final column remain.
- [ ] WIP modes `warning` and `hard_block`, with the "at its hard limit" toast.
- [ ] Project settings page and new sidebar structure.
- [ ] Replace direct uses of `"done"` and `"todo"`. Store the column name in `moved` events so a deleted column cannot break a room. Roll back and report moves that fail at quota.
- **Done when:** AC-01.1, AC-01.2 and AC-14.1 pass, with Playwright tests for add, rename, color, order, delete with target and `hard_block`, in both languages.

### Step 3: Task drawer (FR-03, FR-04, FR-05)
- [ ] 620px drawer: key, breadcrumb, editable title with empty-title error, status, priority, progress, assignees, labels, start and due with the order rule, created.
- [ ] Card click and `Enter` open the drawer. Direct link `?task=TDY-7`. Focus returns to the card on close.
- [ ] Description with `marked` and `DOMPurify`. Move to with column and Top / Bottom in the drawer and card menu.
- [ ] Open task room tab, Copy link, Duplicate. Card key and forced-LTR ids. `Edit task` opens the drawer.
- **Done when:** AC-03.1 to AC-03.5, AC-04.4 and AC-17.1 pass, including a test that a script in the description does not run.

### Step 4: Checklist and progress (FR-06)
- [ ] Add, tick, edit, delete and reorder items. "3 of 5" in the drawer and `3/5` on the card.
- [ ] Progress from checklist, with the slider disabled and labeled "from checklist". Final column still shows 100%.
- **Done when:** AC-06.1 passes and the value matches on card, drawer and room panel after reload.

### Step 5: Comments and mentions (FR-08)
- [ ] Comments tab: add, edit with "edited", delete, `@mention` suggestions from project members. Same mentions in Chat. The notification itself comes in Step 15.
- **Done when:** comment and mention flows persist after reload, and a script in a comment does not run.

### Step 6: Activity history (FR-09)
- [ ] Every mutating action records an event with actor, time and old and new values. Activity tab in the drawer.
- **Done when:** AC-09.1 passes and a unit test confirms each mutating action logs an event, including the due-date change history test.

### Step 7: Toolbar, search, filter and sort (FR-07)
- [ ] One shared query for search (title, details, key), Assignee, Priority, Label, Due, quick Overdue and sort.
- [ ] Filters-active row, "1 of 3" counts, Clear all, no-results state, drag disabled while filtering, Move to still enabled. Shortcuts `/`, `F`, `X`.
- **Done when:** AC-07.1 and AC-07.2 pass, with tests for search by key, combined filters and disabled drag.

### Step 8: Archive and soft delete (FR-30)
- [ ] Archive from card, drawer and `Del`, with Undo. Archive page with Restore (same column, or the first column if it is gone) and Delete forever.
- [ ] Delete from the menu is soft, with "Card deleted · Undo".
- **Done when:** AC-30.1 passes and archive, Undo and Restore keep comments, subtasks and history.

### Step 9: Demo roles (FR-11)
- [ ] `lib/permissions.ts` with `can(role, action)`. Role switcher with the Demo tag. View-only bar.
- [ ] Disabled controls with a tooltip reason, or hidden. Store actions check `can` again.
- **Done when:** a unit matrix covers all five roles and actions, and Playwright covers Viewer mode. Labeled as simulation only.

### Step 10: Subtasks and dependencies (FR-12, FR-15 if approved)
- [ ] Subtasks are full tasks with one level of `parentId`, their own key and direct link; not on the board.
- [ ] Relations `blocks`, `blocked by`, `relates to`; cycles rejected; Blocked computed from relations.
- **Done when:** AC-12.1, AC-15.1 and AC-15.2 pass.

### Step 11: Attachments (FR-10)
- [ ] Image, PDF and text up to 2 MB after compression, in IndexedDB, with name, size and type, preview, download, delete. New chat images use the same storage. Deleted-forever tasks release their files.
- **Done when:** files survive reload, the size and storage-full errors appear, and file names cannot inject markup. AC-10.1 needs a server and stays deferred.

### Step 12: Table view (FR-16)
- [ ] Columns from `AGENTS.md`, header sort, inline Status, Assignees, Priority and Due, row selection and bulk Move to, Assign, Archive by role. Shortcut `2`.
- **Done when:** AC-16.1 and AC-16.2 pass.

### Step 13: Calendar view (FR-16)
- [ ] Jalali month (Saturday first) and week, Today and previous / next, No due date list, drag onto a day to set the due date. Shortcut `3`.
- **Done when:** AC-16.3 passes, with tests for a task without a date and for setting a date by drag.

### Step 14: Saved views (FR-19)
- [ ] Save type, filters, sort, group and search with a name, Private or Shared. All tasks cannot be deleted. Sidebar section.
- **Done when:** AC-19.2 passes, and saving and opening a view is tested. AC-19.1 is only simulated without users.

### Step 15: Inbox (FR-21)
- [ ] Notifications for mention, assignment, overdue and moves of my tasks; no duplicates. Bell, sidebar count, Mark all as read, click opens the task. Shortcut `G` then `I`.
- **Done when:** AC-21.1 passes for local data, and a mention creates exactly one notification.

### Step 16: Responsive, accessibility and final verification (FR-29)
- [ ] Usable down to 768px per decision 2. Keyboard and focus review of all new surfaces. Full Help dialog.
- [ ] Complete the Playwright list in `AGENTS.md`, every item also in Persian. Update `docs/AUDIT.md`.
- **Done when:** all tests, lint, type check and build pass, and the dev server is running.

## Final report

What changed per FR, test results, bugs found and fixed, decisions made, and known limitations.
