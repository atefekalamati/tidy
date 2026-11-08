import { describe, expect, it } from "vitest";
import { currentTime, dueState, formatJalaliDay, formatNumber, formatPercent, toISODate, toPersianDigits } from "./utils";

// 8 Nov 2026 is 17 Aban 1405.
const today = new Date(2026, 10, 8, 12);

describe("numbers", () => {
  it("converts digits", () => {
    expect(toPersianDigits("10:25")).toBe("۱۰:۲۵");
    expect(formatNumber(3, "en")).toBe("3");
    expect(formatNumber(3, "fa")).toBe("۳");
  });

  it("formats percentages", () => {
    expect(formatPercent(45, "en")).toBe("45%");
    expect(formatPercent(45, "fa")).toBe("۴۵٪");
  });
});

describe("dates", () => {
  it("shows Jalali day and month in both languages", () => {
    expect(formatJalaliDay("2026-11-09", "en")).toBe("18 Aban");
    expect(formatJalaliDay("2026-11-09", "fa")).toBe("۱۸ آبان");
  });

  it("formats ISO dates and times from local fields", () => {
    expect(toISODate(today)).toBe("2026-11-08");
    expect(currentTime(new Date(2026, 0, 1, 7, 5))).toBe("07:05");
  });

  it.each([
    ["2026-11-07", "overdue"],
    ["2026-11-08", "today"],
    ["2026-11-09", "tomorrow"],
    ["2026-11-10", "later"],
  ])("classifies %s as %s", (date, state) => {
    expect(dueState(date, false, today)).toBe(state);
  });

  it("reports done regardless of the date", () => {
    expect(dueState("2026-01-01", true, today)).toBe("done");
  });
});
