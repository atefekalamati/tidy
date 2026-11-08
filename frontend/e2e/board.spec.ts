import { button, card, column, drag, expect, pickUp, reload, setFa, test } from "./helpers";

test("first visit shows the English sample board", async ({ page }) => {
  await expect(page).toHaveTitle("Tidy - Kanban board");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tidy.");
  await expect(page.getByTestId("column-ideas")).toContainText("Ideas");
  await expect(page.getByTestId("card")).toHaveCount(10);
  const summary = page.getByTestId("summary");
  await expect(summary).toContainText("10 cards");
  await expect(summary).toContainText("1 overdue");
  await expect(summary).toContainText("20% done");
  await expect(page.getByTestId("unread-badge")).toHaveText("3");
});

test("due badges follow today's date", async ({ page }) => {
  const due = (title: string) => card(page, title).getByTestId("card-due");
  await expect(due("Drag and drop cards")).toHaveText("Today");
  await expect(due("Drag and drop cards")).toHaveAttribute("data-due", "today");
  await expect(due("Task chat room")).toHaveText("Tomorrow");
  await expect(due("Jalali date picker")).toHaveText("15 Aban");
  await expect(due("Jalali date picker")).toHaveAttribute("data-due", "overdue");
  await expect(due("Column unit tests")).toHaveText("25 Aban");
  await expect(due("Write AGENTS.md")).toHaveText("Done");
});

test("language switch changes direction, font, digits and sample data on the board", async ({ page }) => {
  await setFa(page);
  const html = page.locator("html");
  await expect(html).toHaveAttribute("dir", "rtl");
  await expect(html).toHaveAttribute("lang", "fa");
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).fontFamily)).toMatch(/vazirmatn/i);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tidy.");
  await expect(column(page, "doing")).toContainText("در حال انجام");
  await expect(column(page, "doing").getByTestId("wip-count")).toHaveText("۳ / ۳");
  await expect(card(page, "کشیدن و رها کردن کارت‌ها")).toContainText("امروز");
  await expect(card(page, "انتخابگر تاریخ شمسی")).toContainText("۱۵ آبان");
  await expect(card(page, "اصلاح جهت متن ترکیبی")).toContainText("باگ");
  await expect(card(page, "اصلاح جهت متن ترکیبی")).toContainText("۹۰٪");
  await expect(page.getByTitle("علی رضایی").first()).toHaveText("عر");
  await expect(page.getByTestId("summary")).toContainText("۱۰ کارت");

  const columns = page.locator("[data-column-id]");
  const first = (await columns.first().boundingBox())!;
  const last = (await columns.last().boundingBox())!;
  expect(first.x).toBeGreaterThan(last.x);

  await reload(page);
  await expect(html).toHaveAttribute("dir", "rtl");
  await expect(column(page, "doing")).toContainText("در حال انجام");

  await button(page, "EN").click();
  await expect(html).toHaveAttribute("dir", "ltr");
  await expect(column(page, "doing")).toContainText("In progress");
});

test("drags a card between columns with the mouse and logs the move", async ({ page }) => {
  const source = card(page, "Board progress bar");
  await drag(page, source, column(page, "review"), { drop: false });

  await expect(page.getByTestId("drag-overlay")).toBeVisible();
  await expect(page.getByTestId("drag-overlay")).toHaveClass(/rotate-2/);
  await expect(page.getByTestId("drop-line")).toBeVisible();
  await expect(card(column(page, "review"), "Board progress bar")).toHaveClass(/border-dashed/);
  await expect(column(page, "review")).toHaveAttribute("data-drop-target", "true");

  await page.mouse.up();
  await expect(page.getByTestId("drag-overlay")).toBeHidden();
  await expect(card(column(page, "review"), "Board progress bar")).toBeVisible();
  await expect(card(column(page, "ideas"), "Board progress bar")).toHaveCount(0);
  // The click that ends a drag must not open the room.
  await expect(page.getByRole("button", { name: "Add card to Ideas" })).toBeVisible();

  await reload(page);
  await expect(card(column(page, "review"), "Board progress bar")).toBeVisible();

  await card(page, "Board progress bar").getByRole("button", { name: "Board progress bar" }).click();
  await expect(page.getByTestId("event")).toHaveText(/You moved this to Review/);
  await expect(page.getByTestId("event")).toHaveCount(1);
});

test("reorders within a column with the mouse", async ({ page }) => {
  await drag(page, card(page, "Task chat room"), card(page, "Drag and drop cards"));
  const titles = column(page, "doing").getByTestId("card");
  await expect(titles.first()).toContainText("Task chat room");
  await reload(page);
  await expect(column(page, "doing").getByTestId("card").first()).toContainText("Task chat room");
});

test("moves a card with the keyboard", async ({ page }) => {
  const open = card(page, "Column unit tests").getByRole("button", { name: "Column unit tests" });
  await open.focus();
  await pickUp(page);
  await page.keyboard.press("ArrowRight");
  await expect(card(column(page, "doing"), "Column unit tests")).toBeVisible();
  await page.keyboard.press("Space");
  await expect(page.getByTestId("drag-overlay")).toBeHidden();
  await expect(card(column(page, "doing"), "Column unit tests")).toBeVisible();
  await expect(button(page, "Board")).toHaveAttribute("aria-current", "page");

  await reload(page);
  await expect(card(column(page, "doing"), "Column unit tests")).toBeVisible();
});

test("drags with the mouse and the keyboard in right-to-left mode", async ({ page }) => {
  await setFa(page);
  await drag(page, card(page, "نوار پیشرفت تخته"), column(page, "todo"));
  await expect(card(column(page, "todo"), "نوار پیشرفت تخته")).toBeVisible();
  await expect(page.getByTestId("drag-overlay")).toBeHidden(); // The drop animation has finished.

  await card(page, "نوار پیشرفت تخته").getByRole("button", { name: "نوار پیشرفت تخته" }).focus();
  await pickUp(page);
  await page.keyboard.press("ArrowLeft");
  await expect(card(column(page, "doing"), "نوار پیشرفت تخته")).toBeVisible();
  await page.keyboard.press("Space");
  await expect(page.getByTestId("drag-overlay")).toBeHidden();
  await reload(page);
  await expect(card(column(page, "doing"), "نوار پیشرفت تخته")).toBeVisible();
});

test("Esc cancels a keyboard drag", async ({ page }) => {
  await card(page, "Column unit tests").getByRole("button", { name: "Column unit tests" }).focus();
  await pickUp(page);
  await page.keyboard.press("ArrowRight");
  await expect(card(column(page, "doing"), "Column unit tests")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(card(column(page, "todo"), "Column unit tests")).toBeVisible();
  await expect(page.getByTestId("drag-overlay")).toBeHidden();
  await reload(page);
  await expect(card(column(page, "todo"), "Column unit tests")).toBeVisible();
});

test("a drop is allowed over the WIP limit and shows the warning states", async ({ page }) => {
  const doing = column(page, "doing");
  await expect(doing).toHaveAttribute("data-wip", "at");
  await expect(doing.getByTestId("wip-count")).toHaveText("3 / 3");
  await expect(doing.getByTestId("wip-count")).toHaveCSS("color", "rgb(138, 75, 6)");

  await drag(page, card(page, "Column unit tests"), doing);
  await expect(card(doing, "Column unit tests")).toBeVisible();
  await expect(doing).toHaveAttribute("data-wip", "over");
  await expect(doing.getByTestId("wip-count")).toHaveText("4 / 3");
  await expect(doing.getByTestId("wip-count")).toHaveCSS("color", "rgb(180, 35, 24)");
  await expect(doing).toHaveCSS("border-left-color", "rgb(240, 180, 172)");

  await reload(page);
  await expect(column(page, "doing")).toHaveAttribute("data-wip", "over");
});

test("sets and clears a WIP limit from the column menu", async ({ page }) => {
  const todo = column(page, "todo");
  await expect(todo.getByTestId("wip-count")).toHaveText("2");
  await button(todo, "To do column menu").click();
  await todo.getByRole("menuitem", { name: /Set WIP limit/ }).click();
  await todo.getByRole("spinbutton").fill("2");
  await todo.getByRole("spinbutton").press("Enter");
  await expect(todo.getByTestId("wip-count")).toHaveText("2 / 2");
  await expect(todo).toHaveAttribute("data-wip", "at");

  await reload(page);
  await expect(column(page, "todo").getByTestId("wip-count")).toHaveText("2 / 2");

  await button(todo, "To do column menu").click();
  await todo.getByRole("menuitem", { name: /Set WIP limit/ }).click();
  await todo.getByRole("spinbutton").fill("");
  await todo.getByRole("spinbutton").press("Enter");
  await expect(todo.getByTestId("wip-count")).toHaveText("2");
});

test("renames a column, keeps the name across languages", async ({ page }) => {
  const ideas = column(page, "ideas");
  await button(ideas, "Ideas column menu").click();
  await ideas.getByRole("menuitem", { name: "Rename column" }).click();
  await ideas.getByRole("textbox").fill("Backlog");
  await ideas.getByRole("textbox").press("Enter");
  await expect(ideas.getByRole("heading")).toHaveText("Backlog");
  await setFa(page);
  await expect(ideas.getByRole("heading")).toHaveText("Backlog");
  await reload(page);
  await expect(column(page, "ideas").getByRole("heading")).toHaveText("Backlog");
});

test("the column menu closes with Esc and on an outside click", async ({ page }) => {
  const ideas = column(page, "ideas");
  await button(ideas, "Ideas column menu").click();
  await expect(ideas.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(ideas.getByRole("menu")).toBeHidden();
  await expect(button(ideas, "Ideas column menu")).toBeFocused();
  await button(ideas, "Ideas column menu").click();
  await page.getByRole("heading", { level: 1 }).click();
  await expect(ideas.getByRole("menu")).toBeHidden();
});

test("collapses a column to a 48px strip and persists it", async ({ page }) => {
  const todo = column(page, "todo");
  await button(todo, "To do column menu").click();
  await todo.getByRole("menuitem", { name: "Collapse column" }).click();
  await expect(todo).toHaveAttribute("data-collapsed", "true");
  await expect.poll(async () => (await todo.boundingBox())!.width).toBe(48);
  await expect(todo).toContainText("To do");
  await expect(card(todo, "Column unit tests")).toHaveCount(0);

  await reload(page);
  await expect(column(page, "todo")).toHaveAttribute("data-collapsed", "true");
  await button(page, "Expand To do").click();
  await expect(card(column(page, "todo"), "Column unit tests")).toBeVisible();
});

test("a card can be dropped on a collapsed column", async ({ page }) => {
  const review = column(page, "review");
  await button(review, "Review column menu").click();
  await review.getByRole("menuitem", { name: "Collapse column" }).click();
  await drag(page, card(page, "Column unit tests"), review);
  await button(page, "Expand Review").click();
  await expect(card(column(page, "review"), "Column unit tests")).toBeVisible();
});

test("compact density hides labels and persists", async ({ page }) => {
  const target = card(page, "Fix mixed text direction");
  await expect(target).toContainText("Bug");
  const comfy = (await target.boundingBox())!.height;
  await button(page, "Compact").click();
  await expect(target).not.toContainText("Bug");
  expect((await target.boundingBox())!.height).toBeLessThan(comfy);
  await reload(page);
  await expect(button(page, "Compact")).toHaveAttribute("aria-pressed", "true");
  await expect(card(page, "Fix mixed text direction")).not.toContainText("Bug");
});

test("a card in Done always shows 100% and returns to its own progress", async ({ page }) => {
  const target = card(page, "Fix mixed text direction");
  await expect(target.getByTestId("card-progress")).toHaveText("90%");
  await target.hover();
  await button(target, "Move to Done").click();
  const inDone = card(column(page, "done"), "Fix mixed text direction");
  await expect(inDone.getByTestId("card-progress")).toHaveText("100%");
  await expect(inDone.getByTestId("card-due")).toHaveText("Done");
  await expect(page.getByTestId("summary")).toContainText("30% done");
  await drag(page, inDone, column(page, "review"));
  await expect(card(column(page, "review"), "Fix mixed text direction").getByTestId("card-progress")).toHaveText("90%");
});

test("quick actions appear on hover and delete a card", async ({ page }) => {
  const target = card(page, "Board progress bar");
  const del = button(target, "Delete card");
  await expect(del.locator("xpath=..")).toHaveCSS("opacity", "0");
  await target.hover();
  await expect(del.locator("xpath=..")).toHaveCSS("opacity", "1");
  await del.click();
  await expect(page.getByTestId("card")).toHaveCount(9);
  await reload(page);
  await expect(page.getByTestId("card")).toHaveCount(9);
});

test("adds a card from the dialog with every field", async ({ page }) => {
  await button(page, "Add card to Review").click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(dialog.getByRole("alert")).toHaveText("Title is required.");
  await dialog.getByLabel("Title").fill("Audit contrast");
  await dialog.getByLabel("Details").fill("Check every text pair");
  await button(dialog, "High").click();
  await button(dialog, "Testing").click();
  await button(dialog, "Reza Mohammadi").click();
  await button(dialog, "Set a due date").click();
  await dialog.getByLabel("Day").selectOption("18");
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(dialog).toBeHidden();

  const added = card(column(page, "review"), "Audit contrast");
  await expect(added).toContainText("High");
  await expect(added).toContainText("Testing");
  await expect(added.getByTestId("card-due")).toHaveText("Tomorrow");
  await expect(added.getByTitle("Reza Mohammadi")).toBeVisible();
  await reload(page);
  await expect(card(column(page, "review"), "Audit contrast")).toBeVisible();
});

test("keyboard shortcuts drive the board", async ({ page }) => {
  await page.keyboard.press("?");
  await expect(page.getByRole("dialog", { name: "Keyboard shortcuts" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.keyboard.press("g");
  await page.keyboard.press("c");
  await expect(page.getByLabel("Attach image")).toBeAttached();
  await page.keyboard.press("g");
  await page.keyboard.press("b");
  await expect(page.getByTestId("card").first()).toBeVisible();

  await page.keyboard.press("l");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.keyboard.press("l");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");

  const open = card(page, "Column unit tests").getByRole("button", { name: "Column unit tests" });
  await open.focus();
  await page.keyboard.press("n");
  const dialog = page.getByRole("dialog", { name: "New card" });
  await expect(dialog.getByLabel("Title")).toBeFocused();
  await expect(dialog.getByLabel("Title")).toHaveValue("");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(open).toBeFocused();

  await page.keyboard.press(".");
  await expect(card(column(page, "doing"), "Column unit tests")).toBeVisible();
  await expect(card(column(page, "doing"), "Column unit tests").getByRole("button", { name: "Column unit tests" })).toBeFocused();
  await page.keyboard.press(".");
  await expect(card(column(page, "review"), "Column unit tests")).toBeVisible();
  await page.keyboard.press(",");
  await expect(card(column(page, "doing"), "Column unit tests")).toBeVisible();

  await page.keyboard.press("Delete");
  await expect(card(page, "Column unit tests")).toHaveCount(0);
  await expect(page.locator("[data-card-open]:focus")).toHaveCount(1);

  await page.locator("[data-card-open]:focus").press("Enter");
  await expect(page.getByLabel("Attach image")).toBeAttached();
  await expect(page.getByRole("complementary", { name: "Task info" })).toBeVisible();
});

test("shortcuts stay off while typing in a field", async ({ page }) => {
  await button(page, "Add card to Ideas").click();
  await page.getByRole("dialog").getByLabel("Title").pressSequentially("glnc");
  await expect(page.getByRole("dialog").getByLabel("Title")).toHaveValue("glnc");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
});
