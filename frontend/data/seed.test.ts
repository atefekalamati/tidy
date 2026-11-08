import { describe, expect, it } from "vitest";
import type { Text } from "@/lib/types";
import { formatJalaliDay } from "@/lib/utils";
import { createSeed, labels, seedMembers } from "./seed";

const seed = createSeed(new Date(2026, 10, 8, 12));
const cards = Object.values(seed.cards);
const isBilingual = (text: Text) => typeof text === "object" && text.en.length > 0 && text.fa.length > 0;

describe("seed", () => {
  it("has the team, labels and cards the spec requires", () => {
    expect(Object.keys(seedMembers)).toEqual(["sara", "ali", "maryam", "reza"]);
    expect(labels.map((l) => l.id)).toEqual(["design", "frontend", "bug", "docs", "testing"]);
    expect(cards).toHaveLength(10);
    for (const column of seed.columns) expect(column.cardIds.length).toBeGreaterThan(0);
  });

  it("uses the default WIP limits", () => {
    expect(Object.fromEntries(seed.columns.map((c) => [c.id, c.wipLimit]))).toEqual({
      ideas: null,
      todo: null,
      doing: 3,
      review: 2,
      done: null,
    });
  });

  it("defines all sample text in both languages", () => {
    for (const card of cards) {
      expect(isBilingual(card.title)).toBe(true);
      expect(isBilingual(card.details)).toBe(true);
    }
    for (const list of Object.values(seed.messages)) {
      for (const message of list) {
        if (message.type === "message" && message.text) expect(isBilingual(message.text)).toBe(true);
      }
    }
    for (const member of Object.values(seedMembers)) {
      expect(isBilingual(member.name)).toBe(true);
      expect(isBilingual(member.initials)).toBe(true);
    }
  });

  it("matches the design's dates when created on 17 Aban", () => {
    expect(formatJalaliDay(seed.cards.c5.dueDate!, "en")).toBe("17 Aban");
    expect(formatJalaliDay(seed.cards.c6.dueDate!, "en")).toBe("15 Aban");
    expect(formatJalaliDay(seed.cards.c3.dueDate!, "fa")).toBe("۲۰ آبان");
    expect(seed.cards.c1.dueDate).toBeNull();
  });

  it("has messages in General and at least two rooms, with an image, a progress and a member event", () => {
    const { general, ...rooms } = seed.messages;
    expect(general.length).toBeGreaterThan(0);
    expect(Object.keys(rooms).length).toBeGreaterThanOrEqual(2);
    const all = Object.values(seed.messages).flat();
    expect(all.some((m) => m.type === "message" && m.image)).toBe(true);
    expect(all.some((m) => m.type === "event" && m.event === "progress")).toBe(true);
    expect(all.some((m) => m.type === "event" && m.event === "added")).toBe(true);
  });
});
