import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { compressImage } from "@/lib/compressImage";
import { useStore } from "@/lib/store";
import { useShortcuts } from "@/lib/useShortcuts";
import Board from "./Board";
import CardDialog from "./CardDialog";
import Chat from "./Chat";
import Header from "./Header";
import HelpDialog from "./HelpDialog";
import JalaliDatePicker from "./JalaliDatePicker";
import UndoToast, { UNDO_MS } from "./UndoToast";

// jsdom has no canvas; compression itself is covered in lib/compressImage.test.ts.
vi.mock("@/lib/compressImage", async (original) => ({
  ...(await original<typeof import("@/lib/compressImage")>()),
  compressImage: vi.fn(),
}));
const compressed = vi.mocked(compressImage);

const store = () => useStore.getState();
const column = (id: string) => store().columns.find((c) => c.id === id)!;

function Shortcuts() {
  useShortcuts();
  return <Board />;
}

function press(init: KeyboardEventInit, target: EventTarget = document.body) {
  act(() => {
    target.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, ...init }));
  });
}

describe("Header", () => {
  it("shows the brand, summary and unread badge", () => {
    render(<Header />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Tidy.");
    const summary = within(screen.getByTestId("summary"));
    expect(summary.getByText("10 cards")).toBeInTheDocument();
    expect(summary.getByText("20% done")).toBeInTheDocument();
    expect(screen.getByTestId("unread-badge")).toHaveTextContent("3");
  });

  it("switches language, density and section", async () => {
    render(<Header />);
    await userEvent.click(screen.getByRole("button", { name: "Compact" }));
    expect(store().density).toBe("compact");
    await userEvent.click(screen.getByRole("button", { name: "فا" }));
    expect(store().language).toBe("fa");
    expect(screen.getByText("۱۰ کارت")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /گفتگو/ }));
    expect(store().view).toBe("chat");
    expect(screen.queryByTestId("summary")).not.toBeInTheDocument();
  });
});

describe("Board", () => {
  it("renders five columns and the In progress WIP state", () => {
    render(<Board />);
    expect(screen.getAllByRole("region")).toHaveLength(5);
    const doing = screen.getByTestId("column-doing");
    expect(doing).toHaveAttribute("data-wip", "at");
    expect(within(doing).getByTestId("wip-count")).toHaveTextContent("3 / 3");
  });

  it("marks a column over its limit", () => {
    act(() => store().setWipLimit("doing", 2));
    render(<Board />);
    expect(screen.getByTestId("column-doing")).toHaveAttribute("data-wip", "over");
  });

  it("shows due states and always 100% in Done", () => {
    act(() => store().setProgress("c9", 30));
    render(<Board />);
    const done = within(screen.getByTestId("column-done"));
    expect(done.getAllByTestId("card-progress")[0]).toHaveTextContent("100%");
    expect(done.getAllByTestId("card-due")[0]).toHaveAttribute("data-due", "done");
    const doing = within(screen.getByTestId("column-doing")).getAllByTestId("card-due");
    expect(doing.map((el) => el.dataset.due)).toEqual(["today", "overdue", "tomorrow"]);
  });

  it("hides labels in compact density", () => {
    act(() => store().setDensity("compact"));
    render(<Board />);
    expect(screen.queryByText("Bug")).not.toBeInTheDocument();
  });

  it("collapses through the menu and expands from the strip", async () => {
    render(<Board />);
    await userEvent.click(screen.getByRole("button", { name: "To do column menu" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Collapse column" }));
    expect(screen.getByTestId("column-todo")).toHaveAttribute("data-collapsed", "true");
    await userEvent.click(screen.getByRole("button", { name: "Expand To do" }));
    expect(column("todo").collapsed).toBe(false);
  });

  it("renames a column and sets a WIP limit through the menu", async () => {
    render(<Board />);
    await userEvent.click(screen.getByRole("button", { name: "Ideas column menu" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Rename column" }));
    await userEvent.clear(screen.getByRole("textbox", { name: "Rename column" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Rename column" }), "Inbox{Enter}");
    expect(column("ideas").name).toBe("Inbox");

    await userEvent.click(screen.getByRole("button", { name: "Inbox column menu" }));
    await userEvent.click(screen.getByRole("menuitem", { name: /Set WIP limit/ }));
    await userEvent.type(screen.getByRole("spinbutton"), "4{Enter}");
    expect(column("ideas").wipLimit).toBe(4);
  });

  it("opens the task room when a card is clicked", async () => {
    render(<Board />);
    await userEvent.click(screen.getByRole("button", { name: "Task chat room" }));
    expect(store()).toMatchObject({ view: "chat", activeSpace: "c7" });
  });

  it("runs the quick actions", async () => {
    render(<Board />);
    const card = within(screen.getByRole("button", { name: "Column unit tests" }).closest("article")!);
    await userEvent.click(card.getByRole("button", { name: "Move to In progress" }));
    expect(column("doing").cardIds).toContain("c4");
    const moved = within(screen.getByRole("button", { name: "Column unit tests" }).closest("article")!);
    await userEvent.click(moved.getByRole("button", { name: "Delete card" }));
    expect(store().cards.c4).toBeUndefined();
  });
});

describe("Chat", () => {
  const openGeneral = () => render(<Chat />);

  it("hides the task panel in General and shows it in a room", () => {
    openGeneral();
    expect(screen.queryByRole("complementary", { name: "Task info" })).not.toBeInTheDocument();
    act(() => store().openSpace("c7"));
    expect(screen.getByRole("complementary", { name: "Task info" })).toBeInTheDocument();
  });

  it("sends with Enter and clears the composer", async () => {
    openGeneral();
    const input = screen.getByRole("textbox", { name: "Write a message…" });
    await userEvent.type(input, "Hello team{Enter}");
    expect(screen.getByText("Hello team")).toHaveAttribute("dir", "auto");
    expect(input).toHaveValue("");
  });

  it("disables Send and Create task for an empty draft", () => {
    openGeneral();
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Create task" })).toBeDisabled();
  });

  it("creates a task from the draft and opens its room from the announcement", async () => {
    openGeneral();
    await userEvent.type(screen.getByRole("textbox", { name: "Write a message…" }), "Fix login");
    await userEvent.click(screen.getByRole("button", { name: "Create task" }));
    expect(screen.getAllByTestId("task-created")).toHaveLength(2);
    await userEvent.click(within(screen.getAllByTestId("task-created")[1]).getByRole("button", { name: "Open room" }));
    expect(screen.getByRole("heading", { level: 2, name: "Fix login" })).toBeInTheDocument();
    expect(screen.getByText("No messages yet")).toBeInTheDocument();
  });

  const attach = (name = "shot.png", type = "image/png") =>
    userEvent.upload(
      screen.getByLabelText("Attach image"),
      new File([new Uint8Array([1, 2, 3])], name, { type }),
      { applyAccept: false },
    );

  it("applies the 2 MB limit to the compressed image, not the upload", async () => {
    compressed.mockResolvedValueOnce(`data:image/jpeg;base64,${"A".repeat(Math.ceil(((2 * 1024 * 1024 + 1) * 4) / 3))}`);
    openGeneral();
    await attach();
    expect(await screen.findByRole("alert")).toHaveTextContent("2 MB");
    expect(screen.queryByRole("img", { name: "shot.png" })).not.toBeInTheDocument();
  });

  it("accepts a large upload that compresses to under 2 MB", async () => {
    compressed.mockResolvedValueOnce("data:image/jpeg;base64,AAAA");
    openGeneral();
    const big = new File([new Uint8Array(5 * 1024 * 1024)], "big.png", { type: "image/png" });
    await userEvent.upload(screen.getByLabelText("Attach image"), big);
    expect(await screen.findByRole("img", { name: "big.png" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("reports a file that cannot be decoded", async () => {
    compressed.mockRejectedValueOnce(new Error("bad"));
    openGeneral();
    await attach("broken.png");
    expect(await screen.findByRole("alert")).toHaveTextContent("Please choose an image file.");
  });

  it("uploads the compressed image together with the draft as its caption", async () => {
    compressed.mockResolvedValueOnce("data:image/jpeg;base64,AAAA");
    openGeneral();
    await userEvent.type(screen.getByRole("textbox", { name: "Write a message…" }), "Look");
    await attach();
    expect(await screen.findByRole("img", { name: "shot.png" })).toHaveAttribute("src", "data:image/jpeg;base64,AAAA");
    expect(screen.getByText("Look")).toBeInTheDocument();
  });

  it("posts progress and changes members from the panel", async () => {
    act(() => store().openSpace("c1"));
    openGeneral();
    fireEvent.change(screen.getByRole("slider", { name: "Progress" }), { target: { value: "40" } });
    expect(screen.getByTestId("panel-progress")).toHaveTextContent("40%");
    expect(screen.queryByTestId("event")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Post progress update" }));
    expect(screen.getByTestId("event")).toHaveTextContent("You set progress to 40%");

    await userEvent.click(screen.getByRole("button", { name: "+ Ali Rezaei" }));
    expect(screen.getAllByTestId("panel-member")).toHaveLength(2);
    await userEvent.click(screen.getByRole("button", { name: "Remove Maryam Karimi" }));
    expect(screen.getAllByTestId("panel-member")).toHaveLength(1);
    expect(screen.getAllByTestId("event")).toHaveLength(3);
  });

  it("locks the slider at 100% in Done", () => {
    act(() => store().openSpace("c9"));
    openGeneral();
    expect(screen.getByRole("slider", { name: "Progress" })).toBeDisabled();
    expect(screen.getByTestId("panel-progress")).toHaveTextContent("100%");
  });
});

describe("CardDialog", () => {
  it("requires a title", async () => {
    render(<CardDialog columnId="todo" />);
    await userEvent.click(screen.getByRole("button", { name: "Save", hidden: true }));
    expect(screen.getByRole("alert", { hidden: true })).toHaveTextContent("Title is required.");
    expect(column("todo").cardIds).toHaveLength(2);
  });

  it("creates a card with its fields", async () => {
    render(<CardDialog columnId="review" />);
    await userEvent.type(screen.getByLabelText("Title"), "Ship it");
    await userEvent.click(screen.getByRole("button", { name: "High", hidden: true }));
    await userEvent.click(screen.getByRole("button", { name: "Bug", hidden: true }));
    await userEvent.click(screen.getByRole("button", { name: "Ali Rezaei", hidden: true }));
    await userEvent.click(screen.getByRole("button", { name: "Save", hidden: true }));
    const card = store().cards[column("review").cardIds.at(-1)!];
    expect(card).toMatchObject({ title: "Ship it", priority: "high", labelIds: ["bug"], memberIds: ["sara", "ali"], progress: 0, dueDate: null });
  });

  it("keeps sample text localized unless it is edited", async () => {
    const { unmount } = render(<CardDialog columnId="doing" cardId="c5" />);
    await userEvent.click(screen.getByRole("button", { name: "Low", hidden: true }));
    await userEvent.click(screen.getByRole("button", { name: "Save", hidden: true }));
    expect(store().cards.c5.title).toEqual(expect.objectContaining({ fa: "کشیدن و رها کردن کارت‌ها" }));
    expect(store().cards.c5.priority).toBe("low");
    unmount();

    render(<CardDialog columnId="doing" cardId="c5" />);
    await userEvent.clear(screen.getByLabelText("Title"));
    await userEvent.type(screen.getByLabelText("Title"), "Mine");
    await userEvent.click(screen.getByRole("button", { name: "Save", hidden: true }));
    expect(store().cards.c5.title).toBe("Mine");
  });
});

describe("JalaliDatePicker", () => {
  const dateInput = () => screen.getByRole("textbox", { name: "Due date" });
  const day = (text: string) =>
    [...document.querySelectorAll<HTMLElement>(".rmdp-day:not(.rmdp-deactive) span")].find((el) => el.textContent === text)!;

  it("shows the Jalali date with English month names in en", () => {
    render(<JalaliDatePicker value="2026-11-09" onChange={() => {}} />);
    expect(dateInput()).toHaveValue("18 Aban 1405");
  });

  it("shows the Jalali date in Persian in fa", () => {
    act(() => store().setLanguage("fa"));
    render(<JalaliDatePicker value="2026-11-09" onChange={() => {}} />);
    expect(screen.getByRole("textbox", { name: "سررسید" })).toHaveValue("۱۸ آبان ۱۴۰۵");
  });

  it("has no dropdowns", () => {
    render(<JalaliDatePicker value="2026-11-09" onChange={() => {}} />);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("returns the picked day as a Gregorian date", async () => {
    const onChange = vi.fn();
    render(<JalaliDatePicker value="2026-11-09" onChange={onChange} />);
    await userEvent.click(dateInput());
    await userEvent.click(day("20"));
    expect(onChange).toHaveBeenCalledWith("2026-11-11");
  });

  it("does not pick a date just by opening", async () => {
    const onChange = vi.fn();
    render(<JalaliDatePicker value={null} onChange={onChange} />);
    await userEvent.click(dateInput());
    expect(document.querySelector(".rmdp-wrapper")).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    expect(dateInput()).toHaveValue("");
  });

  it("clears the date", async () => {
    const onChange = vi.fn();
    render(<JalaliDatePicker value="2026-11-09" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove due date" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});

describe("UndoToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("appears on delete and restores the card on Undo", () => {
    render(<UndoToast />);
    expect(screen.queryByTestId("undo-toast")).not.toBeInTheDocument();
    act(() => store().deleteCard("c6"));
    expect(screen.getByTestId("undo-toast")).toHaveTextContent("Card deleted · Undo");
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(column("doing").cardIds).toEqual(["c5", "c6", "c7"]);
    expect(screen.queryByTestId("undo-toast")).not.toBeInTheDocument();
  });

  it("disappears after 6 seconds and the card stays deleted", () => {
    render(<UndoToast />);
    act(() => store().deleteCard("c6"));
    act(() => {
      vi.advanceTimersByTime(UNDO_MS - 1);
    });
    expect(screen.getByTestId("undo-toast")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByTestId("undo-toast")).not.toBeInTheDocument();
    expect(store().lastDeleted).toBeNull();
    expect(store().cards.c6).toBeUndefined();
  });

  it("restarts the 6 seconds for a second delete", () => {
    render(<UndoToast />);
    act(() => store().deleteCard("c6"));
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    act(() => store().deleteCard("c7"));
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.getByTestId("undo-toast")).toBeInTheDocument();
  });

  it("is translated", () => {
    act(() => store().setLanguage("fa"));
    render(<UndoToast />);
    act(() => store().deleteCard("c6"));
    expect(screen.getByTestId("undo-toast")).toHaveTextContent("کارت حذف شد · برگرداندن");
  });
});

describe("HelpDialog", () => {
  it("lists every shortcut", () => {
    render(<HelpDialog />);
    for (const key of ["N", "Enter", ",", ".", "Del", "G", "C", "B", "L", "?", "Esc"]) {
      expect(screen.getAllByText(key).length).toBeGreaterThan(0);
    }
  });
});

describe("shortcuts", () => {
  const focusedButton = (title: string) => screen.getByRole("button", { name: title });

  it("toggles language with L", () => {
    render(<Shortcuts />);
    press({ key: "l", code: "KeyL" });
    expect(store().language).toBe("fa");
  });

  it("works on a Persian keyboard layout", () => {
    render(<Shortcuts />);
    press({ key: "م", code: "KeyL" });
    expect(store().language).toBe("fa");
    press({ key: "؟", code: "Slash", shiftKey: true });
    expect(store().dialog).toEqual({ type: "help" });
  });

  it("switches sections with the G chords", () => {
    render(<Shortcuts />);
    press({ key: "g", code: "KeyG" });
    press({ key: "c", code: "KeyC" });
    expect(store().view).toBe("chat");
    press({ key: "g", code: "KeyG" });
    press({ key: "b", code: "KeyB" });
    expect(store().view).toBe("board");
  });

  it("needs the G prefix for C", () => {
    render(<Shortcuts />);
    press({ key: "c", code: "KeyC" });
    expect(store().view).toBe("board");
  });

  it("is disabled while typing", () => {
    render(
      <>
        <Shortcuts />
        <input aria-label="field" />
      </>,
    );
    press({ key: "l", code: "KeyL" }, screen.getByRole("textbox", { name: "field" }));
    expect(store().language).toBe("en");
  });

  it("opens a new card in the focused column and defaults to To do", () => {
    render(<Shortcuts />);
    press({ key: "n", code: "KeyN" });
    expect(store().dialog).toEqual({ type: "card", columnId: "todo" });
    act(() => store().closeDialog());
    press({ key: "n", code: "KeyN" }, focusedButton("Fix mixed text direction"));
    expect(store().dialog).toEqual({ type: "card", columnId: "review" });
  });

  it("moves and deletes the focused card", () => {
    render(<Shortcuts />);
    press({ key: ".", code: "Period" }, focusedButton("Board progress bar"));
    expect(column("todo").cardIds.at(-1)).toBe("c1");
    press({ key: ",", code: "Comma" }, focusedButton("Board progress bar"));
    expect(column("ideas").cardIds.at(-1)).toBe("c1");
    press({ key: "Delete", code: "Delete" }, focusedButton("Board progress bar"));
    expect(store().cards.c1).toBeUndefined();
  });
});
