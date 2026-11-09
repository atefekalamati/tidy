import { describe, expect, it, vi } from "vitest";
import { GENERAL_SPACE } from "@/data/seed";
import {
  getStorageStatus,
  initialState,
  placeCard,
  PRE_RESTORE_BACKUP_KEY,
  restoreV1Backup,
  STORE_NAME,
  useStore,
  V1_BACKUP_KEY,
} from "./store";
import type { CardInput } from "./types";

it("shows the owner's current name when older saved data has a different one", async () => {
  const oldOwner = { id: "sara", name: { en: "Old Name", fa: "Old Name" }, initials: { en: "ON", fa: "ON" } };
  localStorage.setItem(STORE_NAME, JSON.stringify({ version: 3, state: { members: { sara: oldOwner } } }));
  await useStore.persist.rehydrate();
  expect(useStore.getState().members.sara.name.en).toBe("Atefe Kalamati");
});

const store = () => useStore.getState();
const column = (id: string) => store().columns.find((c) => c.id === id)!;
const lastMessage = (space: string) => store().messages[space].at(-1)!;

const input: CardInput = {
  title: "New",
  details: "",
  priority: "low",
  dueDate: null,
  labelIds: [],
  memberIds: ["ali"],
};

describe("cards", () => {
  it("adds a card at the end of a column with zero progress", () => {
    const id = store().addCard("review", input);
    expect(column("review").cardIds.at(-1)).toBe(id);
    expect(store().cards[id]).toMatchObject({ title: "New", progress: 0, memberIds: ["ali"] });
  });

  it("updates a card without touching its progress", () => {
    store().updateCard("c5", { ...input, title: "Edited" });
    expect(store().cards.c5).toMatchObject({ title: "Edited", progress: 60 });
  });

  it("deletes a card with its room, unread count and task announcements", () => {
    store().openSpace("c7");
    store().deleteCard("c7");
    expect(store().cards.c7).toBeUndefined();
    expect(column("doing").cardIds).not.toContain("c7");
    expect(store().messages.c7).toBeUndefined();
    expect(store().unread.c7).toBeUndefined();
    expect(store().messages.general.some((m) => m.type === "task" && m.cardId === "c7")).toBe(false);
    expect(store().activeSpace).toBe(GENERAL_SPACE);
  });
});

describe("undo delete", () => {
  const snapshot = () =>
    structuredClone({
      cards: store().cards,
      cardOrder: Object.keys(store().cards),
      columns: store().columns,
      messages: store().messages,
      unread: store().unread,
    });

  it("restores everything exactly as it was", () => {
    store().setProgress("c7", 70);
    store().removeMember("c7", "reza");
    const before = snapshot();
    store().deleteCard("c7");
    expect(store().lastDeleted?.card.id).toBe("c7");
    expect(snapshot()).not.toEqual(before);
    store().undoDelete();
    expect(snapshot()).toEqual(before);
    expect(store().lastDeleted).toBeNull();
  });

  it("restores the column position of a card in the middle", () => {
    store().deleteCard("c6");
    expect(column("doing").cardIds).toEqual(["c5", "c7"]);
    store().undoDelete();
    expect(column("doing").cardIds).toEqual(["c5", "c6", "c7"]);
  });

  it("restores the task announcement at its place in General", () => {
    const before = store().messages.general.map((m) => m.id);
    store().deleteCard("c7");
    store().undoDelete();
    expect(store().messages.general.map((m) => m.id)).toEqual(before);
  });

  it("keeps messages sent after the delete", () => {
    store().deleteCard("c7");
    store().sendMessage("general", { text: "later" });
    store().undoDelete();
    expect(store().messages.general.at(-1)).toMatchObject({ text: "later" });
    expect(store().messages.general.some((m) => m.type === "task" && m.cardId === "c7")).toBe(true);
  });

  it("reopens the room if it was the active space", () => {
    store().openSpace("c7");
    store().deleteCard("c7");
    expect(store().activeSpace).toBe(GENERAL_SPACE);
    store().undoDelete();
    expect(store().activeSpace).toBe("c7");
  });

  it("restores a card that had no conversation", () => {
    store().deleteCard("c1");
    store().undoDelete();
    expect(store().cards.c1).toBeDefined();
    expect(store().messages.c1).toBeUndefined();
  });

  it("does nothing after the undo window is dismissed", () => {
    store().deleteCard("c1");
    store().dismissUndo();
    store().undoDelete();
    expect(store().cards.c1).toBeUndefined();
  });

  it("undoes the most recent delete", () => {
    store().deleteCard("c1");
    store().deleteCard("c2");
    store().undoDelete();
    expect(store().cards.c2).toBeDefined();
    expect(store().cards.c1).toBeUndefined();
  });

  it("never persists the undo snapshot", () => {
    store().deleteCard("c1");
    expect(JSON.parse(localStorage.getItem("kanban-store")!).state).not.toHaveProperty("lastDeleted");
  });
});

describe("moveCard", () => {
  it("reorders within a column without logging an event", () => {
    const before = store().messages.c1;
    store().moveCard("c2", "ideas", 0);
    expect(column("ideas").cardIds).toEqual(["c2", "c1"]);
    expect(store().messages.c1).toBe(before);
    expect(store().messages.c2).toBeUndefined();
  });

  it("moves across columns and logs one room event", () => {
    store().moveCard("c1", "doing", 1);
    expect(column("ideas").cardIds).toEqual(["c2"]);
    expect(column("doing").cardIds).toEqual(["c5", "c1", "c6", "c7"]);
    expect(store().messages.c1).toHaveLength(1);
    expect(lastMessage("c1")).toMatchObject({ type: "event", event: "moved", columnId: "doing", authorId: "sara" });
  });

  it("is never blocked by a WIP limit", () => {
    store().moveCard("c1", "doing", 0);
    expect(column("doing").cardIds).toHaveLength(4);
    expect(column("doing").wipLimit).toBe(3);
  });

  it("moves to the end of the adjacent column and stops at the edges", () => {
    store().moveCardBy("c4", 1);
    expect(column("doing").cardIds.at(-1)).toBe("c4");
    store().moveCardBy("c4", -1);
    expect(column("todo").cardIds.at(-1)).toBe("c4");
    store().moveCardBy("c9", 1);
    expect(column("done").cardIds).toContain("c9");
    store().moveCardBy("c1", -1);
    expect(column("ideas").cardIds).toContain("c1");
  });

  it("placeCard does not change the input", () => {
    const columns = store().columns;
    const copy = JSON.stringify(columns);
    placeCard(columns, "c1", "done", 0);
    expect(JSON.stringify(columns)).toBe(copy);
  });
});

describe("progress and members", () => {
  it("sets progress without an event and posts one on request", () => {
    const count = store().messages.c5.length;
    store().setProgress("c5", 75);
    expect(store().cards.c5.progress).toBe(75);
    expect(store().messages.c5).toHaveLength(count);
    store().postProgress("c5");
    expect(lastMessage("c5")).toMatchObject({ event: "progress", value: 75 });
  });

  it("posts 100 for a card in Done", () => {
    store().setProgress("c9", 40);
    store().postProgress("c9");
    expect(lastMessage("c9")).toMatchObject({ event: "progress", value: 100 });
  });

  it("adds and removes members with events", () => {
    store().addMember("c1", "reza");
    expect(store().cards.c1.memberIds).toEqual(["maryam", "reza"]);
    expect(lastMessage("c1")).toMatchObject({ event: "added", memberId: "reza" });
    store().removeMember("c1", "maryam");
    expect(store().cards.c1.memberIds).toEqual(["reza"]);
    expect(lastMessage("c1")).toMatchObject({ event: "removed", memberId: "maryam" });
  });
});

describe("chat", () => {
  it("sends a message as the current user", () => {
    expect(store().sendMessage("c1", { text: "hello" })).toBe(true);
    expect(lastMessage("c1")).toMatchObject({ type: "message", authorId: "sara", text: "hello" });
    expect(lastMessage("c1").time).toMatch(/^\d\d:\d\d$/);
  });

  it("rolls an image back and reports failure when storage is full", () => {
    const before = store().messages.general;
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    expect(store().sendMessage("general", { image: { src: "data:x", file: "a.png" } })).toBe(false);
    expect(store().messages.general).toBe(before);
    setItem.mockRestore();
    expect(store().sendMessage("general", { text: "ok" })).toBe(true);
  });

  it("turns a message into a To do card and announces it", () => {
    const id = store().createTaskFromMessage("general", "Write docs");
    expect(column("todo").cardIds.at(-1)).toBe(id);
    expect(store().cards[id]).toMatchObject({ title: "Write docs", priority: "medium", memberIds: ["sara"], progress: 0, dueDate: null });
    expect(lastMessage("general")).toMatchObject({ type: "task", cardId: id });
  });

  it("clears unread counts as spaces are opened", () => {
    expect(store().unread).toEqual({ general: 2, c7: 1 });
    store().setView("chat");
    expect(store().unread).toEqual({ c7: 1 });
    store().openRoom("c7");
    expect(store().unread).toEqual({});
    expect(store()).toMatchObject({ view: "chat", activeSpace: "c7" });
  });
});

describe("columns and preferences", () => {
  it("renames a column and restores the default when blank", () => {
    store().renameColumn("todo", "  Next  ");
    expect(column("todo").name).toBe("Next");
    store().renameColumn("todo", "   ");
    expect(column("todo").name).toBeUndefined();
  });

  it("sets a WIP limit and collapses a column", () => {
    store().setWipLimit("todo", 5);
    expect(column("todo").wipLimit).toBe(5);
    store().toggleColumn("todo");
    expect(column("todo").collapsed).toBe(true);
  });

  it("changes language and density", () => {
    store().setLanguage("fa");
    store().setDensity("compact");
    expect(store()).toMatchObject({ language: "fa", density: "compact" });
  });
});

describe("persistence", () => {
  const stored = () => JSON.parse(localStorage.getItem("kanban-store")!);

  it("defaults to English, comfortable, Board", () => {
    expect(initialState()).toMatchObject({ language: "en", density: "comfortable", view: "board" });
  });

  it("writes data at version 3 and leaves the open dialog out", () => {
    store().openDialog({ type: "help" });
    store().setLanguage("fa");
    expect(stored().version).toBe(3);
    expect(stored().state.language).toBe("fa");
    expect(stored().state).not.toHaveProperty("dialog");
  });

  const legacyRaw = JSON.stringify({
    version: 0,
    state: {
      language: "fa",
      density: "compact",
      columns: [
        { id: "todo", name: "Next", cardIds: ["older", "old"], wipLimit: 4, collapsed: true },
        { id: "in-progress", cardIds: ["doing-card"] },
      ],
      cards: {
        older: { id: "older", title: "First task", priority: "high", labelIds: ["bug"], assigneeId: "x", extra: "kept" },
        old: {
          id: "old",
          title: "کارت قدیمی",
          details: "متن",
          priority: "low",
          dueDate: "2026-11-18",
          labelIds: ["design"],
          assigneeId: "ali",
          progress: 40,
        },
        "doing-card": { id: "doing-card", title: { en: "Working", fa: "در حال انجام" }, status: "doing" },
      },
      messages: {
        general: [{ id: "announcement", type: "task", authorId: "sara", time: "09:00", cardId: "old" }],
        old: [{ id: "message", type: "message", authorId: "x", time: "09:01", text: "Saved conversation" }],
      },
      unread: { old: 1 },
    },
  });

  it("backs up raw V1 data and migrates tasks, order, assignees and preferences", async () => {
    localStorage.setItem(STORE_NAME, legacyRaw);
    await useStore.persist.rehydrate();
    expect(localStorage.getItem(V1_BACKUP_KEY)).toBe(legacyRaw);
    expect(stored().version).toBe(3);
    expect(store()).toMatchObject({ language: "fa", density: "compact" });
    expect(store().cards).toMatchObject({
      older: { id: "older", title: "First task", memberIds: ["x"], progress: 0, extra: "kept" },
      old: { id: "old", title: "کارت قدیمی", details: "متن", memberIds: ["ali"], progress: 40 },
      "doing-card": { id: "doing-card", memberIds: [], progress: 0 },
    });
    expect(store().columns).toMatchObject([
      { id: "ideas", cardIds: [] },
      { id: "todo", name: "Next", cardIds: ["older", "old"], wipLimit: 4, collapsed: true },
      { id: "doing", cardIds: ["doing-card"] },
      { id: "review", cardIds: [] },
      { id: "done", cardIds: [] },
    ]);
    expect(store().members.x).toMatchObject({ id: "x", name: { en: "x", fa: "x" } });
    expect(store().messages.general).toEqual([
      { id: "announcement", type: "task", authorId: "sara", time: "09:00", cardId: "old" },
    ]);
    expect(store().messages.old).toEqual([
      { id: "message", type: "message", authorId: "x", time: "09:01", text: "Saved conversation" },
    ]);
    expect(store().unread).toEqual({ old: 1 });
    expect(getStorageStatus()).toBe("ready");
  });

  it("can restore the raw backup and safely re-run the migration", async () => {
    localStorage.setItem(STORE_NAME, legacyRaw);
    await useStore.persist.rehydrate();
    store().deleteCard("old");
    const currentRaw = localStorage.getItem(STORE_NAME);
    await restoreV1Backup();
    expect(store().cards.old).toMatchObject({ title: "کارت قدیمی", memberIds: ["ali"] });
    expect(localStorage.getItem(V1_BACKUP_KEY)).toBe(legacyRaw);
    expect(localStorage.getItem(PRE_RESTORE_BACKUP_KEY)).toBe(currentRaw);
    expect(stored().version).toBe(3);
  });

  it("does not overwrite V1 data when a backup cannot be written", async () => {
    localStorage.setItem(STORE_NAME, legacyRaw);
    const nativeSetItem = Storage.prototype.setItem;
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
      if (key === V1_BACKUP_KEY) throw new DOMException("full", "QuotaExceededError");
      nativeSetItem.call(this, key, value);
    });
    await useStore.persist.rehydrate();
    setItem.mockRestore();
    expect(getStorageStatus()).toBe("error");
    expect(localStorage.getItem(STORE_NAME)).toBe(legacyRaw);
    expect(localStorage.getItem(V1_BACKUP_KEY)).toBeNull();
  });

  it("keeps the original and backup if saving the converted state fails", async () => {
    localStorage.setItem(STORE_NAME, legacyRaw);
    const nativeSetItem = Storage.prototype.setItem;
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
      if (key === STORE_NAME) throw new DOMException("full", "QuotaExceededError");
      nativeSetItem.call(this, key, value);
    });
    await useStore.persist.rehydrate();
    setItem.mockRestore();
    expect(getStorageStatus()).toBe("error");
    expect(localStorage.getItem(STORE_NAME)).toBe(legacyRaw);
    expect(localStorage.getItem(V1_BACKUP_KEY)).toBe(legacyRaw);
  });

  it("backs up corrupt data and blocks hydration without replacing it", async () => {
    const corrupt = "{not json";
    localStorage.setItem(STORE_NAME, corrupt);
    await useStore.persist.rehydrate();
    expect(getStorageStatus()).toBe("error");
    expect(localStorage.getItem(STORE_NAME)).toBe(corrupt);
    expect(localStorage.getItem(V1_BACKUP_KEY)).toBe(corrupt);
  });

  it("backs up and migrates legacy data without a version field", async () => {
    const raw = JSON.stringify({
      state: {
        columns: [{ id: "todo", cardIds: ["unversioned"] }],
        cards: { unversioned: { title: "Unversioned task" } },
      },
    });
    localStorage.setItem(STORE_NAME, raw);
    await useStore.persist.rehydrate();
    expect(localStorage.getItem(V1_BACKUP_KEY)).toBe(raw);
    expect(store().cards.unversioned.title).toBe("Unversioned task");
    expect(stored().version).toBe(3);
  });

  it("leaves data from a newer app version untouched", async () => {
    const raw = JSON.stringify({ version: 4, state: { cards: {} } });
    localStorage.setItem(STORE_NAME, raw);
    await useStore.persist.rehydrate();
    expect(getStorageStatus()).toBe("error");
    expect(localStorage.getItem(STORE_NAME)).toBe(raw);
    expect(localStorage.getItem(V1_BACKUP_KEY)).toBeNull();
  });

  it("preserves a V2 store when upgrading its storage version", async () => {
    const state = structuredClone(stored().state);
    state.cards.c1.title = "Existing user edit";
    localStorage.setItem(STORE_NAME, JSON.stringify({ version: 2, state }));
    await useStore.persist.rehydrate();
    expect(store().cards.c1.title).toBe("Existing user edit");
    expect(stored().version).toBe(3);
  });

  it("survives corrupt storage", async () => {
    localStorage.setItem("kanban-store", "{not json");
    await useStore.persist.rehydrate();
    expect(getStorageStatus()).toBe("error");
    expect(localStorage.getItem("kanban-store")).toBe("{not json");
  });
});
