# Tidy V2 plan

Source of truth: `AGENTS.md`. Design reference: `design/tidy-v2-design-reference.html`. This plan refactors the V1 app in `frontend/` to V2. Phase 1 of the product only: client-side with localStorage, no backend, auth or WebSocket.

## What stays and what changes

| Area | V1 | V2 |
|---|---|---|
| Project layout | `app/`, `components/`, `lib/` | Same. Seed moves to `src/data/seed.ts`, the path AGENTS.md names |
| Drag and drop | dnd-kit, sortable, keyboard | Kept. Hover preview becomes local state, so the store only gets one `moveCard` per drop |
| Store | Zustand persist, key `kanban-store` | Same key, `version: 2`, adds chat, members, WIP, collapse, density, view |
| Language | Persian default, one `i18n.ts` | English default, `lib/i18n/en.ts` and `fa.ts`, sample data as `{ en, fa }` |
| Theme and fonts | Indigo, Inter | Linen Sky as role-named CSS variables, Geist and Vazirmatn |
| Card | One assignee, click opens modal | Many members, progress, click opens task room |
| Edit modal | Custom modal, opened by clicking a card | Native `<dialog>`, used for create and for edit from the task panel |
| Date picker | react-multi-date-picker | Removed (not in the V2 library list). Small Jalali picker on date-fns-jalali |

## Data model

- `Text = string | { en, fa }`. Sample data is localized. User text is a plain string shown with `dir="auto"`.
- Dates are stored as Gregorian `yyyy-MM-dd` and always displayed in Jalali.
- Sample due dates are offsets from the day the sample data is created, so on 17 Aban they match the design exactly and the overdue, Today and Tomorrow states are still shown on any other day.
- All reads and writes go through `lib/store.ts`. Transient UI that must not persist (open dialog, hover preview, composer draft) stays out of localStorage.

## Phases and success criteria

### Phase 1: Foundation
- [x] Install `geist`. Remove `react-multi-date-picker`
- [x] Every Linen Sky color as a role-named CSS variable in `globals.css`, type scale, radii, focus ring
- [x] Geist and Vazirmatn wired, tab title `Tidy - Kanban board`
- **Done when:** the app builds and `<html>` defaults to `lang="en" dir="ltr"` with Geist.

### Phase 2: Data layer
- [x] `lib/types.ts`, `src/data/seed.ts`: 4 members, 5 labels, 10 cards, messages in General and 2 task rooms including an image, a progress event and a member-added event, all in both languages
- [x] `lib/store.ts` actions: `addCard`, `updateCard`, `deleteCard`, `moveCard`, `moveCardBy`, `setProgress`, `postProgress`, `addMember`, `removeMember`, `sendMessage`, `createTaskFromMessage`, `renameColumn`, `setWipLimit`, `toggleColumn`, `setLanguage`, `setDensity`, `setView`, `openSpace`, `openRoom`
- [x] Migration: any stored state below version 2 is replaced by the V2 sample data, without errors
- [x] A full localStorage (image too large for the quota) rolls the message back and shows a short error
- [x] `lib/i18n/en.ts`, `fa.ts`, `useT()`, Persian digits, Jalali dates, due-date state
- **Done when:** unit tests pass for every action, the event each action logs, migration from V1 data, seed coverage in both languages, dictionary key parity, date and due-state helpers.

### Phase 3: App shell
- [x] Header: logo, Board / Chat nav with unread badge, summary bar, `EN | فا`, density, shortcuts button, team avatars
- [x] Language switch changes `dir`, `lang`, font, digits, dates and all sample content, and flips directional icons. Choice persists
- [x] Keyboard shortcuts (N, Enter, `,`, `.`, Del, G C, G B, L, ?, Esc), disabled while typing, working on a Persian keyboard layout too
- **Done when:** component tests pass for header and shortcuts, and there are no hydration warnings.

### Phase 4: Board
- [x] Column header with 3px accent, name, counter, `+`, `⋯` menu (rename, WIP limit, collapse)
- [x] Soft WIP: amber at the limit, red above it with a tinted border, drops never blocked. In progress = 3, Review = 2
- [x] 48px collapsed strip with vertical name and counter
- [x] Card as in the design: labels, 2-line title, progress, priority bars, due badge, message count, stacked avatars, hover lift and quick actions. Done always shows 100%. Compact hides labels
- [x] Drag with mouse and keyboard: 2 degree tilt, dashed gap, tinted target column, landing line. A column change logs a room event
- **Done when:** component tests pass for card and column states and the seed board matches the design in both directions.

### Phase 5: Chat
- [x] Three columns: spaces 272px, conversation, task panel 320px in task rooms only
- [x] Spaces list: General and one room per card with progress and member count
- [x] Text, image (with placeholder for sample images), system event and task-created messages. Empty state
- [x] Composer: image upload (2 MB limit with a short error), text, Create task, Send, Enter sends
- [x] Task panel: progress slider and Post progress update, members add and remove with events, column, priority, due date, labels, details
- **Done when:** component tests pass for sending, Create task, the size limit and the panel.

### Phase 6: Dialogs
- [x] Card dialog for create (`+`, Add card, N) and edit: title (required), details, priority, Jalali due date, labels, members
- [x] Shortcuts dialog
- **Done when:** component tests pass for create, validation and edit, and localized sample text stays localized when an edit leaves it unchanged.

### Phase 7: Playwright integration tests
- [x] Language and direction in both sections
- [x] Drag between columns with mouse and with keyboard
- [x] WIP at and over the limit, collapse, density
- [x] Open a room by clicking a card, send a message, upload an image, oversize image error, create a task from a message
- [x] Change and post progress, add and remove a member
- [x] Shortcuts, V1 data migration
- [x] Persistence of all of the above after reload
- **Done when:** `npm run test:e2e` is green and every bug it found is fixed.

### Phase 8: Final check
- [x] Unit tests, Playwright, lint, type check and build all pass
- [x] No emojis (grep), no physical `ml-/mr-/pl-/pr-/left-/right-` classes (grep), text contrast at least 4.5:1
- [x] README is minimal and up to date, every box here is ticked
- [x] Dev server running and ready to use
- **Done when:** the server responds and all of the above hold.

## Verification

`cd frontend && npm test && npm run lint && npx tsc --noEmit && npm run build && npm run test:e2e`

## Notes

- Playwright freezes the browser clock on 17 Aban 1405 so date assertions are stable.
- Out of scope, per AGENTS.md: archive, search, filter, multiple boards, swimlanes, dark theme, backend.
