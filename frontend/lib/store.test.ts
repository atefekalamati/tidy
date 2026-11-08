import { describe, expect, it, vi } from "vitest";
import { GENERAL_SPACE } from "@/src/data/seed";
import { initialState, placeCard, useStore } from "./store";
import type { CardInput } from "./types";

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

  it("writes data at version 2 and leaves the open dialog out", () => {
    store().openDialog({ type: "help" });
    store().setLanguage("fa");
    expect(stored().version).toBe(2);
    expect(stored().state.language).toBe("fa");
    expect(stored().state).not.toHaveProperty("dialog");
  });

  it("replaces V1 data with the V2 sample data", async () => {
    localStorage.setItem(
      "kanban-store",
      JSON.stringify({
        version: 0,
        state: {
          language: "fa",
          columns: [{ id: "todo", cardIds: ["old"] }],
          cards: { old: { id: "old", title: "V1", priority: "low", labelIds: [], assigneeId: "x" } },
        },
      }),
    );
    await useStore.persist.rehydrate();
    expect(store().cards.old).toBeUndefined();
    expect(Object.keys(store().cards)).toHaveLength(10);
    expect(store().language).toBe("en");
    expect(stored().version).toBe(2);
    expect(stored().state.cards.old).toBeUndefined();
  });

  it("survives corrupt storage", async () => {
    localStorage.setItem("kanban-store", "{not json");
    await useStore.persist.rehydrate();
    expect(Object.keys(store().cards)).toHaveLength(10);
  });
});
