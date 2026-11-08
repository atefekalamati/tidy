import { PNG, button, card, column, composer, expect, openRoom, reload, setFa, test } from "./helpers";

const panel = (page: Parameters<typeof composer>[0]) => page.getByRole("complementary", { name: "Task info" });

test.describe("from the board", () => {
  test("clicking a card opens its task room with the info panel", async ({ page }) => {
    await openRoom(page, "Task chat room");
    await expect(page.getByRole("button", { name: /^Chat/ })).toHaveAttribute("aria-current", "page");
    await expect(page.getByText("In progress · 3 members").first()).toBeVisible();
    await expect(page.getByRole("img", { name: "chat-panel-v1.png" })).toBeVisible();
    await expect(page.getByTestId("event").first()).toHaveText(/You added Reza Mohammadi/);
    await expect(page.getByTestId("panel-progress")).toHaveText("45%");
    await expect(panel(page)).toContainText("Tomorrow");
    await expect(panel(page)).toContainText("Medium");
    await expect(panel(page)).toContainText("Design");
    await expect(panel(page)).toContainText("Group chat per task");
  });

  test("the quick action opens the room too", async ({ page }) => {
    const target = card(page, "Drag and drop cards");
    await target.hover();
    await button(target, "Open task room").click();
    await expect(page.getByRole("heading", { level: 2, name: "Drag and drop cards" })).toBeVisible();
  });
});

test.describe("in the chat section", () => {
  test.beforeEach(async ({ page }) => {
    await page.getByRole("button", { name: /^Chat/ }).click();
    await expect(composer(page)).toBeVisible();
  });

  test("General has no task panel and spaces list one room per card", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 2, name: "# General" })).toBeVisible();
    await expect(panel(page)).toHaveCount(0);
    await expect(page.getByTestId("room")).toHaveCount(10);
    await expect(page.getByTestId("task-created")).toContainText("You created a task");
    await expect(page.getByRole("img", { name: "empty-states-moodboard.png" })).toBeVisible();
  });

  test("the unread badge clears as spaces are read and stays cleared", async ({ page }) => {
    await expect(page.getByTestId("unread-badge")).toHaveText("1");
    await page.getByTestId("room").filter({ hasText: "Task chat room" }).click();
    await expect(page.getByTestId("unread-badge")).toHaveCount(0);
    await reload(page);
    await expect(page.getByTestId("unread-badge")).toHaveCount(0);
  });

  test("language switch changes direction and sample conversation", async ({ page }) => {
    await page.getByTestId("room").filter({ hasText: "Task chat room" }).click();
    await setFa(page);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { level: 2, name: "اتاق گفتگوی کار" })).toBeVisible();
    await expect(page.getByText("اولین چیدمان پنل گفتگو.")).toBeVisible();
    await expect(page.getByTestId("event").first()).toContainText("شما این عضو را اضافه کردید: رضا محمدی");
    await expect(page.getByTestId("event").first()).toContainText("۰۹:۱۱");
    await expect(page.getByTestId("panel-progress")).toHaveText("۴۵٪");
    await expect(page.getByRole("complementary", { name: "اطلاعات کار" })).toContainText("فردا");
    await expect(page.getByRole("textbox", { name: "پیام بنویس…" })).toBeVisible();

    const spaces = (await page.getByRole("complementary", { name: "گفتگوها" }).boundingBox())!;
    const info = (await page.getByRole("complementary", { name: "اطلاعات کار" }).boundingBox())!;
    expect(spaces.x).toBeGreaterThan(info.x);

    const arrow = page.getByRole("button", { name: "ارسال" }).locator("svg");
    await expect(arrow).toHaveCSS("scale", "-1 1");
  });

  test("sends a message with Enter and with the button, and keeps them after reload", async ({ page }) => {
    await composer(page).fill("First note");
    await composer(page).press("Enter");
    await composer(page).fill("یادداشت فارسی");
    await button(page, "Send").click();
    await expect(composer(page)).toHaveValue("");

    const own = page.getByTestId("message").filter({ hasText: "First note" });
    await expect(own).toContainText("You");
    await expect(own.locator("span[dir=auto]")).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(page.getByText("یادداشت فارسی")).toHaveAttribute("dir", "auto");

    await setFa(page);
    await expect(page.getByText("First note")).toBeVisible();
    await button(page, "EN").click();

    await reload(page);
    await expect(page.getByText("First note")).toBeVisible();
    await expect(page.getByText("یادداشت فارسی")).toBeVisible();
  });

  test("uploads an image with a caption and keeps it after reload", async ({ page }) => {
    await composer(page).fill("Latest mockup");
    await page.getByLabel("Attach image").setInputFiles({ name: "mockup.png", mimeType: "image/png", buffer: PNG });
    const image = page.getByRole("img", { name: "mockup.png" });
    await expect(image).toHaveAttribute("src", /^data:image\/png;base64,/);
    await expect(page.getByText("Latest mockup")).toBeVisible();
    await expect(composer(page)).toHaveValue("");

    await reload(page);
    await expect(page.getByRole("img", { name: "mockup.png" })).toHaveJSProperty("naturalWidth", 1);
  });

  test("rejects an image over 2 MB and a file that is not an image", async ({ page }) => {
    const before = await page.getByTestId("message").count();
    await page.getByLabel("Attach image").setInputFiles({
      name: "huge.png",
      mimeType: "image/png",
      buffer: Buffer.alloc(2 * 1024 * 1024 + 1),
    });
    await expect(page.locator("p[role=alert]")).toHaveText("Image must be 2 MB or smaller.");
    await page.getByLabel("Attach image").setInputFiles({ name: "a.txt", mimeType: "text/plain", buffer: Buffer.from("x") });
    await expect(page.locator("p[role=alert]")).toHaveText("Please choose an image file.");
    await expect(page.getByTestId("message")).toHaveCount(before);
  });

  test("shows a short error when localStorage is full and loses nothing", async ({ page }) => {
    await composer(page).fill("before");
    await composer(page).press("Enter");
    await page.evaluate(() => {
      Storage.prototype.setItem = () => {
        throw new DOMException("full", "QuotaExceededError");
      };
    });
    await page.getByLabel("Attach image").setInputFiles({ name: "x.png", mimeType: "image/png", buffer: PNG });
    await expect(page.locator("p[role=alert]")).toHaveText("Browser storage is full. The image was not sent.");
    await expect(page.getByRole("img", { name: "x.png" })).toHaveCount(0);
    await reload(page);
    await expect(page.getByText("before")).toBeVisible();
  });

  test("creates a task from a message and announces it", async ({ page }) => {
    await composer(page).fill("Prepare the release notes");
    await button(page, "Create task").click();
    const announcement = page.getByTestId("task-created").filter({ hasText: "Prepare the release notes" });
    await expect(announcement).toContainText("You created a task");

    await announcement.getByRole("button", { name: "Open room" }).click();
    await expect(page.getByRole("heading", { level: 2, name: "Prepare the release notes" })).toBeVisible();
    await expect(page.getByText("No messages yet")).toBeVisible();
    await expect(page.getByTestId("panel-member")).toHaveCount(1);

    await reload(page);
    await expect(page.getByRole("heading", { level: 2, name: "Prepare the release notes" })).toBeVisible();
    await button(page, "Board").click();
    const created = card(column(page, "todo"), "Prepare the release notes");
    await expect(created).toContainText("Medium");
    await expect(created.getByTestId("card-progress")).toHaveText("0%");
  });
});

test.describe("task panel", () => {
  test("changes and posts progress, then shows it on the board after reload", async ({ page }) => {
    await openRoom(page, "Jalali date picker");
    await page.getByRole("slider", { name: "Progress" }).fill("70");
    await expect(page.getByTestId("panel-progress")).toHaveText("70%");
    await expect(page.getByTestId("event")).toHaveCount(0);

    await button(page, "Post progress update").click();
    await expect(page.getByTestId("event")).toHaveText(/You set progress to 70%/);

    await reload(page);
    await expect(page.getByTestId("panel-progress")).toHaveText("70%");
    await expect(page.getByTestId("event")).toHaveText(/You set progress to 70%/);
    await button(page, "Board").click();
    await expect(card(page, "Jalali date picker").getByTestId("card-progress")).toHaveText("70%");
  });

  test("adds and removes members with events, and persists them", async ({ page }) => {
    await openRoom(page, "Keyboard shortcut sheet");
    await expect(page.getByTestId("panel-member")).toHaveCount(0);
    await button(page, "+ Ali Rezaei").click();
    await button(page, "+ Reza Mohammadi").click();
    await expect(page.getByTestId("panel-member")).toHaveCount(2);
    await expect(page.getByTestId("event").first()).toHaveText(/You added Ali Rezaei/);

    await button(page, "Remove Ali Rezaei").click();
    await expect(page.getByTestId("panel-member")).toHaveCount(1);
    await expect(page.getByTestId("event").last()).toHaveText(/You removed Ali Rezaei/);
    await expect(button(page, "+ Ali Rezaei")).toBeVisible();

    await reload(page);
    await expect(page.getByTestId("panel-member")).toHaveCount(1);
    await expect(page.getByTestId("event")).toHaveCount(3);
    await button(page, "Board").click();
    await expect(card(page, "Keyboard shortcut sheet").getByTitle("Reza Mohammadi")).toBeVisible();
  });

  test("edits a task from the panel", async ({ page }) => {
    await openRoom(page, "Board progress bar");
    await button(page, "Edit task").click();
    const dialog = page.getByRole("dialog", { name: "Edit card" });
    await expect(dialog.getByLabel("Title")).toHaveValue("Board progress bar");
    await button(dialog, "High").click();
    await dialog.getByLabel("Title").fill("Header progress bar");
    await dialog.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("heading", { level: 2, name: "Header progress bar" })).toBeVisible();
    await expect(panel(page)).toContainText("High");
  });

  test("a card deleted on the board leaves nothing broken in chat", async ({ page }) => {
    await openRoom(page, "Task chat room");
    await button(page, "Board").click();
    const target = card(page, "Task chat room");
    await target.hover();
    await button(target, "Delete card").click();
    await page.getByRole("button", { name: /^Chat/ }).click();
    await expect(page.getByRole("heading", { level: 2, name: "# General" })).toBeVisible();
    await expect(page.getByTestId("task-created")).toHaveCount(0);
  });
});

test("V1 data in localStorage is replaced by the V2 sample data", async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem(
      "kanban-store",
      JSON.stringify({
        version: 0,
        state: {
          language: "fa",
          columns: [{ id: "todo", cardIds: ["old"] }],
          cards: { old: { id: "old", title: "کارت قدیمی", priority: "low", labelIds: [], assigneeId: "x" } },
        },
      }),
    );
  });
  await reload(page);
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.getByTestId("card")).toHaveCount(10);
  await expect(page.getByText("کارت قدیمی")).toHaveCount(0);
  const version = await page.evaluate(() => JSON.parse(localStorage.getItem("kanban-store")!).version);
  expect(version).toBe(2);
});
