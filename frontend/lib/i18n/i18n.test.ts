import { describe, expect, it } from "vitest";
import { en } from "./en";
import { fa } from "./fa";
import { translator } from "./index";

function paths(value: object, prefix = ""): string[] {
  return Object.entries(value)
    .flatMap(([key, v]) => (v && typeof v === "object" ? paths(v, `${prefix}${key}.`) : [`${prefix}${key}`]))
    .sort();
}

describe("dictionaries", () => {
  it("have the same keys", () => {
    expect(paths(fa)).toEqual(paths(en));
  });

  it("resolves localized text and leaves user text alone", () => {
    const { L } = translator("fa");
    expect(L({ en: "Hello", fa: "سلام" })).toBe("سلام");
    expect(L("my own text")).toBe("my own text");
  });

  it("prefers a custom column name over the translated default", () => {
    expect(translator("fa").columnName({ id: "todo" })).toBe("برای انجام");
    expect(translator("fa").columnName({ id: "todo", name: "Next" })).toBe("Next");
  });

  it("agrees the Persian verb with the subject of an event", () => {
    expect(fa.events.created(fa.you)).toBe("شما یک کار ساختید");
    expect(fa.events.created("علی رضایی")).toBe("علی رضایی یک کار ساخت");
  });

  it("uses the singular for one in English", () => {
    expect(en.memberCount("1")).toBe("1 member");
    expect(en.memberCount("2")).toBe("2 members");
  });
});
