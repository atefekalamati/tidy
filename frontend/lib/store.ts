import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createSeed, CURRENT_USER_ID, GENERAL_SPACE } from "@/data/seed";
import { migrateLegacyState } from "./migration";
import type {
  Card,
  CardInput,
  ChatMessage,
  Column,
  ColumnId,
  DeletedCard,
  Density,
  Dialog,
  Language,
  Message,
  SpaceId,
  SystemEvent,
  View,
} from "./types";
import { currentTime } from "./utils";

export const initialState = () => ({
  ...createSeed(),
  language: "en" as Language,
  density: "comfortable" as Density,
  view: "board" as View,
  activeSpace: GENERAL_SPACE as SpaceId,
  dialog: null as Dialog | null,
  lastDeleted: null as DeletedCard | null,
});

type Data = ReturnType<typeof initialState>;
type Persisted = Omit<Data, "dialog" | "lastDeleted">;

export const STORE_NAME = "kanban-store";
export const V1_BACKUP_KEY = "kanban-store-v1-backup";
export const PRE_RESTORE_BACKUP_KEY = "kanban-store-before-restore-backup";

type StorageStatus = "loading" | "ready" | "error";
let storageStatus: StorageStatus = "loading";
const storageStatusListeners = new Set<() => void>();
let migrationError: unknown;

const notifyStorageStatus = () => storageStatusListeners.forEach((listener) => listener());

export const subscribeStorageStatus = (listener: () => void) => {
  storageStatusListeners.add(listener);
  return () => storageStatusListeners.delete(listener);
};

export const getStorageStatus = () => storageStatus;

function backupRawState(local: Storage, raw: string) {
  const existingBackup = Object.keys(local).find(
    (key) => (key === V1_BACKUP_KEY || key.startsWith(`${V1_BACKUP_KEY}:`)) && local.getItem(key) === raw,
  );
  if (existingBackup) return existingBackup;

  let key = V1_BACKUP_KEY;
  let suffix = 0;
  while (local.getItem(key) !== null) {
    suffix += 1;
    key = `${V1_BACKUP_KEY}:${Date.now()}-${String(suffix).padStart(6, "0")}`;
  }
  local.setItem(key, raw);
  if (local.getItem(key) !== raw) throw new Error("Could not verify the V1 data backup.");
  return key;
}

function prepareStoredValue(local: Storage, key: string, raw: string | null) {
  if (raw === null || key !== STORE_NAME) return raw;

  let envelope: unknown;
  try {
    envelope = JSON.parse(raw);
  } catch {
    backupRawState(local, raw);
    throw new Error("Saved data is not valid JSON. The original data was backed up and left unchanged.");
  }

  if (typeof envelope !== "object" || envelope === null || Array.isArray(envelope)) {
    backupRawState(local, raw);
    throw new Error("Saved data has an unsupported format. The original data was backed up and left unchanged.");
  }

  const stored = envelope as { version?: unknown; state?: unknown };
  if (typeof stored.version === "number") {
    if (stored.version > 3) throw new Error("Saved data was created by a newer version and was left unchanged.");
    if (stored.version >= 2) return raw;
  }

  backupRawState(local, raw);
  if (typeof stored.version === "number") return raw;
  return JSON.stringify({ ...stored, version: 0 });
}

export function restoreV1Backup() {
  const local = window.localStorage;
  const backupKey = Object.keys(local)
    .filter((key) => key === V1_BACKUP_KEY || key.startsWith(`${V1_BACKUP_KEY}:`))
    .sort()
    .at(-1);
  if (!backupKey) throw new Error("No V1 backup is available.");
  const raw = local.getItem(backupKey);
  if (raw === null) throw new Error("The selected V1 backup could not be read.");
  const current = local.getItem(STORE_NAME);
  if (current !== null && current !== raw) {
    let currentBackupKey = PRE_RESTORE_BACKUP_KEY;
    let suffix = 0;
    while (local.getItem(currentBackupKey) !== null) {
      suffix += 1;
      currentBackupKey = `${PRE_RESTORE_BACKUP_KEY}:${Date.now()}-${String(suffix).padStart(6, "0")}`;
    }
    local.setItem(currentBackupKey, current);
    if (local.getItem(currentBackupKey) !== current) throw new Error("The current data could not be backed up before restore.");
  }
  local.setItem(STORE_NAME, raw);
  if (local.getItem(STORE_NAME) !== raw) throw new Error("The V1 backup could not be restored.");
  return useStore.persist.rehydrate();
}

export interface Store extends Data {
  addCard: (columnId: ColumnId, input: CardInput) => string;
  updateCard: (id: string, input: CardInput) => void;
  deleteCard: (id: string) => void;
  undoDelete: () => void;
  dismissUndo: () => void;
  moveCard: (cardId: string, toColumnId: ColumnId, toIndex: number) => void;
  moveCardBy: (cardId: string, delta: -1 | 1) => void;
  setProgress: (cardId: string, value: number) => void;
  postProgress: (cardId: string) => void;
  addMember: (cardId: string, memberId: string) => void;
  removeMember: (cardId: string, memberId: string) => void;
  /** Returns false, leaving the conversation unchanged, when the browser's storage is full. */
  sendMessage: (spaceId: SpaceId, content: Pick<ChatMessage, "text" | "image">) => boolean;
  createTaskFromMessage: (spaceId: SpaceId, text: string) => string;
  renameColumn: (id: ColumnId, name: string) => void;
  setWipLimit: (id: ColumnId, limit: number | null) => void;
  toggleColumn: (id: ColumnId) => void;
  setLanguage: (language: Language) => void;
  setDensity: (density: Density) => void;
  setView: (view: View) => void;
  openSpace: (spaceId: SpaceId) => void;
  openRoom: (cardId: string) => void;
  openDialog: (dialog: Dialog) => void;
  closeDialog: () => void;
}

const stamp = () => ({ id: crypto.randomUUID(), authorId: CURRENT_USER_ID, time: currentTime() });
const event = (e: SystemEvent) => ({ ...stamp(), type: "event", ...e }) as Message;

const pushMessage = (messages: Data["messages"], spaceId: SpaceId, message: Message) => ({
  ...messages,
  [spaceId]: [...(messages[spaceId] ?? []), message],
});

const markRead = (unread: Data["unread"], spaceId: SpaceId) => {
  const { [spaceId]: _read, ...rest } = unread;
  return rest;
};

export const columnOf = (columns: Column[], cardId: string) =>
  columns.find((c) => c.cardIds.includes(cardId))!;

/** Pure placement of a card; also used for the live preview while dragging. */
export function placeCard(columns: Column[], cardId: string, toColumnId: ColumnId, toIndex: number): Column[] {
  return columns.map((c) => {
    const cardIds = c.cardIds.filter((x) => x !== cardId);
    if (c.id === toColumnId) cardIds.splice(toIndex, 0, cardId);
    return { ...c, cardIds };
  });
}

// A quota error must not surface from inside a store update, so it is recorded here instead.
let lastWriteFailed = false;

let migrationPending = false;

const storage = createJSONStorage<Persisted>(() => {
  const local = window.localStorage;
  return {
    getItem: (key) => prepareStoredValue(local, key, local.getItem(key)),
    removeItem: (key) => local.removeItem(key),
    setItem: (key, value) => {
      try {
        local.setItem(key, value);
        lastWriteFailed = false;
        migrationPending = false;
      } catch (error) {
        lastWriteFailed = true;
        if (migrationPending) {
          migrationPending = false;
          throw error;
        }
      }
    },
  };
});

export const useStore = create<Store>()(
  persist(
    (set, get) => {
      const patchCard = (id: string, patch: Partial<Card>) =>
        set((s) => ({ cards: { ...s.cards, [id]: { ...s.cards[id], ...patch } } }));

      const logEvent = (spaceId: SpaceId, e: SystemEvent) =>
        set((s) => ({ messages: pushMessage(s.messages, spaceId, event(e)) }));

      const appendCard = (columnId: ColumnId, input: CardInput) => {
        const id = crypto.randomUUID();
        set((s) => ({
          cards: { ...s.cards, [id]: { ...input, id, progress: 0 } },
          columns: s.columns.map((c) => (c.id === columnId ? { ...c, cardIds: [...c.cardIds, id] } : c)),
        }));
        return id;
      };

      return {
        ...initialState(),

        addCard: appendCard,

        updateCard: (id, input) => patchCard(id, input),

        deleteCard: (id) =>
          set((s) => {
            const { [id]: card, ...cards } = s.cards;
            const { [id]: room, ...rest } = s.messages;
            const column = columnOf(s.columns, id);
            const announcements = Object.entries(rest).flatMap(([spaceId, list]) =>
              list.flatMap((message, index) =>
                message.type === "task" && message.cardId === id ? [{ spaceId, index, message }] : [],
              ),
            );
            const messages = Object.fromEntries(
              Object.entries(rest).map(([space, list]) => [
                space,
                list.filter((m) => !(m.type === "task" && m.cardId === id)),
              ]),
            );
            return {
              lastDeleted: {
                card,
                columnId: column.id,
                columnIndex: column.cardIds.indexOf(id),
                roomIndex: Object.keys(s.cards).indexOf(id),
                room,
                unread: s.unread[id],
                announcements,
                wasActiveSpace: s.activeSpace === id,
              },
              cards,
              messages,
              unread: markRead(s.unread, id),
              columns: s.columns.map((c) => ({ ...c, cardIds: c.cardIds.filter((x) => x !== id) })),
              activeSpace: s.activeSpace === id ? GENERAL_SPACE : s.activeSpace,
            };
          }),

        undoDelete: () =>
          set((s) => {
            const deleted = s.lastDeleted;
            if (!deleted) return s;
            const { card, columnId, columnIndex, roomIndex, room, unread, announcements, wasActiveSpace } = deleted;

            const entries = Object.entries(s.cards);
            entries.splice(roomIndex, 0, [card.id, card]);

            const messages = room ? { ...s.messages, [card.id]: room } : { ...s.messages };
            for (const { spaceId, index, message } of announcements) {
              const list = [...(messages[spaceId] ?? [])];
              list.splice(index, 0, message);
              messages[spaceId] = list;
            }

            return {
              cards: Object.fromEntries(entries),
              messages,
              unread: unread ? { ...s.unread, [card.id]: unread } : s.unread,
              columns: placeCard(s.columns, card.id, columnId, columnIndex),
              activeSpace: wasActiveSpace && s.activeSpace === GENERAL_SPACE ? card.id : s.activeSpace,
              lastDeleted: null,
            };
          }),

        dismissUndo: () => set({ lastDeleted: null }),

        moveCard: (cardId, toColumnId, toIndex) => {
          const from = columnOf(get().columns, cardId);
          if (from.id === toColumnId && from.cardIds.indexOf(cardId) === toIndex) return;
          set((s) => ({ columns: placeCard(s.columns, cardId, toColumnId, toIndex) }));
          if (from.id !== toColumnId) logEvent(cardId, { event: "moved", columnId: toColumnId });
        },

        moveCardBy: (cardId, delta) => {
          const { columns, moveCard } = get();
          const target = columns[columns.indexOf(columnOf(columns, cardId)) + delta];
          if (target) moveCard(cardId, target.id, target.cardIds.length);
        },

        setProgress: (cardId, value) => patchCard(cardId, { progress: value }),

        postProgress: (cardId) => {
          const { cards, columns } = get();
          const done = columnOf(columns, cardId).id === "done";
          logEvent(cardId, { event: "progress", value: done ? 100 : cards[cardId].progress });
        },

        addMember: (cardId, memberId) => {
          patchCard(cardId, { memberIds: [...get().cards[cardId].memberIds, memberId] });
          logEvent(cardId, { event: "added", memberId });
        },

        removeMember: (cardId, memberId) => {
          patchCard(cardId, { memberIds: get().cards[cardId].memberIds.filter((m) => m !== memberId) });
          logEvent(cardId, { event: "removed", memberId });
        },

        sendMessage: (spaceId, content) => {
          const before = get().messages;
          set({ messages: pushMessage(before, spaceId, { ...stamp(), type: "message", ...content }) });
          if (!lastWriteFailed) return true;
          set({ messages: before });
          return false;
        },

        createTaskFromMessage: (spaceId, text) => {
          const cardId = appendCard("todo", {
            title: text,
            details: "",
            priority: "medium",
            dueDate: null,
            labelIds: [],
            memberIds: [CURRENT_USER_ID],
          });
          set((s) => ({ messages: pushMessage(s.messages, spaceId, { ...stamp(), type: "task", cardId }) }));
          return cardId;
        },

        renameColumn: (id, name) =>
          set((s) => ({
            columns: s.columns.map((c) => (c.id === id ? { ...c, name: name.trim() || undefined } : c)),
          })),

        setWipLimit: (id, limit) =>
          set((s) => ({ columns: s.columns.map((c) => (c.id === id ? { ...c, wipLimit: limit } : c)) })),

        toggleColumn: (id) =>
          set((s) => ({ columns: s.columns.map((c) => (c.id === id ? { ...c, collapsed: !c.collapsed } : c)) })),

        setLanguage: (language) => set({ language }),

        setDensity: (density) => set({ density }),

        setView: (view) =>
          set((s) => ({ view, unread: view === "chat" ? markRead(s.unread, s.activeSpace) : s.unread })),

        openSpace: (spaceId) => set((s) => ({ activeSpace: spaceId, unread: markRead(s.unread, spaceId) })),

        openRoom: (cardId) =>
          set((s) => ({ view: "chat", activeSpace: cardId, unread: markRead(s.unread, cardId) })),

        openDialog: (dialog) => set({ dialog }),

        closeDialog: () => set({ dialog: null }),
      };
    },
    {
      name: STORE_NAME,
      version: 3,
      storage,
      partialize: ({ dialog: _dialog, lastDeleted: _lastDeleted, ...state }) => state,
      // The owner's name comes from the seed, so browsers with older saved data show it too.
      merge: (persisted, current) => {
        const saved = persisted as Persisted | undefined;
        return {
          ...current,
          ...saved,
          members: { ...(saved?.members ?? current.members), [CURRENT_USER_ID]: current.members[CURRENT_USER_ID] },
        };
      },
      migrate: (persisted, version) => {
        if (version === 2) return persisted as Persisted;
        if (version === 0 || version === 1) {
          const migrated = migrateLegacyState(persisted) as Persisted;
          migrationPending = true;
          return migrated;
        }
        throw new Error(`Saved data version ${version} cannot be migrated safely.`);
      },
      onRehydrateStorage: () => {
        storageStatus = "loading";
        migrationError = undefined;
        notifyStorageStatus();
        return (_state, error) => {
          migrationError = error;
          storageStatus = error ? "error" : "ready";
          notifyStorageStatus();
        };
      },
    },
  ),
);

export const getStorageError = () => migrationError;
