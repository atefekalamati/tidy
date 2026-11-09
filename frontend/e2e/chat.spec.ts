import { PNG, boardNav, button, card, column, composer, expect, makeImage, openRoom, reload, setEn, setFa, test } from "./helpers";

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

    const spaces = (await page.getByRole("complementary", { name: "نوار کناری" }).boundingBox())!;
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
    await setEn(page);

    await reload(page);
    await expect(page.getByText("First note")).toBeVisible();
    await expect(page.getByText("یادداشت فارسی")).toBeVisible();
  });

  test("uploads an image with a caption and keeps it after reload", async ({ page }) => {
    await composer(page).fill("Latest mockup");
    const buffer = await makeImage(page, { width: 10, height: 10 });
    await page.getByLabel("Attach image").setInputFiles({ name: "mockup.png", mimeType: "image/png", buffer });
    const image = page.getByRole("img", { name: "mockup.png" });
    await expect(image).toHaveAttribute("src", /^data:image\/jpeg;base64,/);
    await expect(page.getByText("Latest mockup")).toBeVisible();
    await expect(composer(page)).toHaveValue("");

    await reload(page);
    await expect(page.getByRole("img", { name: "mockup.png" })).toHaveJSProperty("naturalWidth", 10);
  });

  test("resizes the longest side to 1280px and converts to JPEG", async ({ page }) => {
    const buffer = await makeImage(page, { width: 2560, height: 1280 });
    await page.getByLabel("Attach image").setInputFiles({ name: "wide.png", mimeType: "image/png", buffer });
    const image = page.getByRole("img", { name: "wide.png" });
    await expect(image).toHaveAttribute("src", /^data:image\/jpeg;base64,/);
    await expect(image).toHaveJSProperty("naturalWidth", 1280);
    await expect(image).toHaveJSProperty("naturalHeight", 640);
  });

  test("resizes portrait images by their height", async ({ page }) => {
    const buffer = await makeImage(page, { width: 800, height: 1600 });
    await page.getByLabel("Attach image").setInputFiles({ name: "tall.png", mimeType: "image/png", buffer });
    const image = page.getByRole("img", { name: "tall.png" });
    await expect(image).toHaveJSProperty("naturalWidth", 640);
    await expect(image).toHaveJSProperty("naturalHeight", 1280);
  });

  test("does not enlarge small images", async ({ page }) => {
    const buffer = await makeImage(page, { width: 300, height: 200 });
    await page.getByLabel("Attach image").setInputFiles({ name: "small.png", mimeType: "image/png", buffer });
    await expect(page.getByRole("img", { name: "small.png" })).toHaveJSProperty("naturalWidth", 300);
  });

  test("keeps a PNG with transparency as PNG", async ({ page }) => {
    const buffer = await makeImage(page, { width: 1600, height: 800, alpha: 128 });
    await page.getByLabel("Attach image").setInputFiles({ name: "clear.png", mimeType: "image/png", buffer });
    const image = page.getByRole("img", { name: "clear.png" });
    await expect(image).toHaveAttribute("src", /^data:image\/png;base64,/);
    await expect(image).toHaveJSProperty("naturalWidth", 1280);
    const alpha = await image.evaluate((el: HTMLImageElement) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d")!;
      context.drawImage(el, 0, 0);
      return context.getImageData(0, 0, 1, 1).data[3];
    });
    expect(alpha).toBeLessThan(255);
  });

  test("accepts an upload over 2 MB that compresses below the limit, and keeps it after reload", async ({ page }) => {
    const buffer = await makeImage(page, { width: 1600, height: 1600, noise: 32 });
    expect(buffer.length).toBeGreaterThan(2 * 1024 * 1024);
    await page.getByLabel("Attach image").setInputFiles({ name: "photo.png", mimeType: "image/png", buffer });
    await expect(page.getByRole("img", { name: "photo.png" })).toHaveJSProperty("naturalWidth", 1280);
    await expect(page.locator("p[role=alert]")).toHaveCount(0);
    await reload(page);
    await expect(page.getByRole("img", { name: "photo.png" })).toHaveJSProperty("naturalWidth", 1280);
  });

  test("rejects an image still over 2 MB after compression, and files that are not images", async ({ page }) => {
    const before = await page.getByTestId("message").count();
    const buffer = await makeImage(page, { width: 1280, height: 1280, alpha: 200, noise: 255 });
    await page.getByLabel("Attach image").setInputFiles({ name: "huge.png", mimeType: "image/png", buffer });
    await expect(page.locator("p[role=alert]")).toHaveText("Image must be 2 MB or smaller.");
    await page.getByLabel("Attach image").setInputFiles({ name: "a.txt", mimeType: "text/plain", buffer: Buffer.from("x") });
    await expect(page.locator("p[role=alert]")).toHaveText("Please choose an image file.");
    await page.getByLabel("Attach image").setInputFiles({ name: "broken.png", mimeType: "image/png", buffer: Buffer.from("not a png") });
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
    await boardNav(page).click();
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
    await boardNav(page).click();
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
    await boardNav(page).click();
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
    await boardNav(page).click();
    const target = card(page, "Task chat room");
    await target.hover();
    await button(target, "Delete card").click();
    await page.getByRole("button", { name: /^Chat/ }).click();
    await expect(page.getByRole("heading", { level: 2, name: "# General" })).toBeVisible();
    await expect(page.getByTestId("task-created")).toHaveCount(0);
  });
});

test("V1 data is backed up, migrated, and retained after reload", async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem(
      "kanban-store",
      JSON.stringify({
        version: 0,
        state: {
          language: "fa",
          columns: [{ id: "todo", cardIds: ["old"] }],
          cards: {
            old: {
              id: "old",
              title: "کارت قدیمی",
              details: "توضیحات حفظ‌شده",
              priority: "low",
              labelIds: ["legacy-label"],
              assigneeId: "x",
            },
          },
        },
      }),
    );
  });
  const rawV1 = await page.evaluate(() => localStorage.getItem("kanban-store"));
  await reload(page);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByTestId("card")).toHaveCount(1);
  await expect(card(page, "کارت قدیمی")).toBeVisible();
  await expect(card(page, "کارت قدیمی")).toContainText("legacy-label");
  await expect(page.getByTestId("column-todo")).toContainText("کارت قدیمی");
  const saved = await page.evaluate(() => ({
    backup: localStorage.getItem("kanban-store-v1-backup"),
    data: JSON.parse(localStorage.getItem("kanban-store")!),
  }));
  expect(saved.backup).toBe(rawV1);
  expect(saved.data.version).toBe(3);
  expect(saved.data.state.cards.old).toMatchObject({
    details: "توضیحات حفظ‌شده",
    memberIds: ["x"],
  });
  await reload(page);
  await expect(page.getByTestId("card")).toHaveCount(1);
  await expect(card(page, "کارت قدیمی")).toBeVisible();
  await expect(card(page, "کارت قدیمی")).toContainText("legacy-label");
});

test("migration stops safely when a raw V1 backup cannot be written", async ({ page }) => {
  const rawV1 = JSON.stringify({
    version: 0,
    state: {
      columns: [{ id: "todo", cardIds: ["old"] }],
      cards: { old: { id: "old", title: "Keep me", priority: "low" } },
    },
  });
  await page.evaluate((raw) => {
    localStorage.setItem("kanban-store", raw);
  }, rawV1);
  await page.addInitScript(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "kanban-store-v1-backup") throw new DOMException("full", "QuotaExceededError");
      nativeSetItem.call(this, key, value);
    };
  });
  await page.reload();
  await expect(page.locator("section[role=alert]")).toContainText("Saved data could not be loaded safely");
  await expect(page.getByTestId("card")).toHaveCount(0);
  const saved = await page.evaluate(() => ({
    current: localStorage.getItem("kanban-store"),
    backup: localStorage.getItem("kanban-store-v1-backup"),
  }));
  expect(saved.current).toBe(rawV1);
  expect(saved.backup).toBeNull();
});
