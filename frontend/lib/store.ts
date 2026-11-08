import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createSeed, CURRENT_USER_ID, GENERAL_SPACE } from "@/src/data/seed";
import type {
  Card,
  CardInput,
  ChatMessage,
  Column,
  ColumnId,
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
});

type Data = ReturnType<typeof initialState>;

export interface Store extends Data {
  addCard: (columnId: ColumnId, input: CardInput) => string;
  updateCard: (id: string, input: CardInput) => void;
  deleteCard: (id: string) => void;
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

const storage = createJSONStorage<Omit<Data, "dialog">>(() => {
  const local = window.localStorage;
  return {
    getItem: (key) => local.getItem(key),
    removeItem: (key) => local.removeItem(key),
    setItem: (key, value) => {
      try {
        local.setItem(key, value);
        lastWriteFailed = false;
      } catch {
        lastWriteFailed = true;
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
            const { [id]: _card, ...cards } = s.cards;
            const { [id]: _room, ...rest } = s.messages;
            const messages = Object.fromEntries(
              Object.entries(rest).map(([space, list]) => [
                space,
                list.filter((m) => !(m.type === "task" && m.cardId === id)),
              ]),
            );
            return {
              cards,
              messages,
              unread: markRead(s.unread, id),
              columns: s.columns.map((c) => ({ ...c, cardIds: c.cardIds.filter((x) => x !== id) })),
              activeSpace: s.activeSpace === id ? GENERAL_SPACE : s.activeSpace,
            };
          }),

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
      name: "kanban-store",
      version: 2,
      storage,
      partialize: ({ dialog: _dialog, ...state }) => state,
      // V1 data has a different shape (single assignee, no chat), so it is replaced by the V2 sample data.
      migrate: () => {
        const { dialog: _dialog, ...fresh } = initialState();
        return fresh;
      },
    },
  ),
);
