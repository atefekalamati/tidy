import type { Page } from "@playwright/test";
import { boardNav, button, card, column, expect, setFa, test } from "./helpers";

const sidebar = (page: Page, name = "Sidebar") => page.getByRole("complementary", { name });
const chatNav = (page: Page) => page.getByRole("button", { name: /^Chat/ });
const breadcrumb = (page: Page) => page.getByRole("navigation", { name: "Breadcrumb" });
const crumb = (page: Page) => breadcrumb(page).locator("[aria-current=page]");
const room = (page: Page, title: string) => page.getByTestId("room").filter({ hasText: title });
const list = (page: Page) => page.getByTestId("sidebar-scroll");

test("shows every part of the sidebar at 256px on the start side", async ({ page }) => {
  const box = (await sidebar(page).boundingBox())!;
  expect(box.width).toBe(256);
  expect(box.x).toBe(0);
  expect(box.height).toBe(page.viewportSize()!.height);

  await expect(sidebar(page).getByRole("heading", { level: 1 })).toHaveText("Tidy.");
  await expect(sidebar(page).getByText("TEAM", { exact: true })).toBeVisible();
  await expect(page.getByTestId("workspace")).toContainText("Carabin team");
  await expect(page.getByTestId("board-count")).toHaveText("10");
  await expect(page.getByTestId("unread-badge")).toHaveText("3");
  await expect(sidebar(page).getByText("CHANNELS")).toBeVisible();
  await expect(sidebar(page).getByText("TASK ROOMS")).toBeVisible();
  await expect(page.getByTestId("room")).toHaveCount(10);
  await expect(room(page, "Task chat room")).toContainText("45% · 3 members");
  await expect(button(sidebar(page), "English")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("profile")).toContainText("Atefe Kalamati");
  await expect(page.getByTestId("profile")).toContainText("Workspace owner");
  await expect(button(sidebar(page), "Account menu")).toBeVisible();
});

test("navigates between Project board and Chat and updates the breadcrumb", async ({ page }) => {
  await expect(boardNav(page)).toHaveAttribute("aria-current", "page");
  await expect(breadcrumb(page)).toContainText("Workspace");
  await expect(crumb(page)).toHaveText("Project board");
  await expect(page.getByTestId("summary")).toBeVisible();
  await expect(button(page, "Compact")).toBeVisible();

  await chatNav(page).click();
  await expect(chatNav(page)).toHaveAttribute("aria-current", "page");
  await expect(crumb(page)).toHaveText("# General");
  await expect(page.getByTestId("summary")).toHaveCount(0);
  await expect(button(page, "Compact")).toHaveCount(0);
  await expect(page.getByTestId("card")).toHaveCount(0);

  await boardNav(page).click();
  await expect(boardNav(page)).toHaveAttribute("aria-current", "page");
  await expect(page.getByTestId("card")).toHaveCount(10);
});

test("opens a task room from the sidebar while on the Board", async ({ page }) => {
  await room(page, "Task chat room").click();
  await expect(chatNav(page)).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { level: 2, name: "Task chat room" })).toBeVisible();
  await expect(crumb(page)).toHaveText("Task chat room");
  await expect(page.getByRole("complementary", { name: "Task info" })).toBeVisible();
  await expect(page.getByRole("img", { name: "chat-panel-v1.png" })).toBeVisible();
  await expect(page.getByTestId("unread-badge")).toHaveText("2");
});

test("opens General from the sidebar while on the Board", async ({ page }) => {
  await button(sidebar(page), "General").click();
  await expect(page.getByRole("heading", { level: 2, name: "# General" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Task info" })).toHaveCount(0);
  await expect(page.getByTestId("unread-badge")).toHaveText("1");
});

test("highlights the active space only while the Chat view is open", async ({ page }) => {
  const active = room(page, "Jalali date picker");
  await expect(active).not.toHaveAttribute("aria-current");

  await active.click();
  await expect(active).toHaveAttribute("aria-current", "true");
  await expect(button(sidebar(page), "General")).not.toHaveAttribute("aria-current");

  await boardNav(page).click();
  await expect(active).not.toHaveAttribute("aria-current");

  await chatNav(page).click();
  await expect(active).toHaveAttribute("aria-current", "true");
});

test("the Chat section has no spaces column of its own", async ({ page }) => {
  await room(page, "Task chat room").click();
  await expect(page.getByTestId("room")).toHaveCount(10);
  await expect(sidebar(page).getByTestId("room")).toHaveCount(10);
  await expect(page.getByRole("main").getByTestId("room")).toHaveCount(0);

  const bar = (await sidebar(page).boundingBox())!;
  const conversation = (await page.getByRole("region", { name: "Task chat room" }).boundingBox())!;
  expect(conversation.x).toBe(bar.x + bar.width);
});

test("the sidebar sits on the right in Persian and is fully translated", async ({ page }) => {
  await setFa(page);
  const bar = sidebar(page, "نوار کناری");
  const box = (await bar.boundingBox())!;
  expect(box.width).toBe(256);
  expect(box.x + box.width).toBe(page.viewportSize()!.width);

  const main = (await page.getByRole("main").boundingBox())!;
  expect(main.x + main.width).toBe(box.x);

  await expect(bar.getByRole("heading", { level: 1 })).toHaveText("Tidy.");
  await expect(bar.getByText("تیم", { exact: true })).toBeVisible();
  await expect(page.getByTestId("workspace")).toContainText("فضای کار");
  await expect(page.getByTestId("workspace")).toContainText("تیم کارابین");
  await expect(page.getByTestId("board-count")).toHaveText("۱۰");
  await expect(page.getByTestId("unread-badge")).toHaveText("۳");
  await expect(bar.getByRole("button", { name: /^تخته‌ی پروژه/ })).toBeVisible();
  await expect(bar.getByText("کانال‌ها")).toBeVisible();
  await expect(bar.getByText("اتاق‌های کار")).toBeVisible();
  await expect(button(bar, "عمومی")).toBeVisible();
  await expect(room(page, "اتاق گفتگوی کار")).toContainText("۴۵٪ · ۳ عضو");
  await expect(page.getByTestId("profile")).toContainText("عاطفه کلماتی");
  await expect(page.getByTestId("profile")).toContainText("مالک فضای کار");
  await expect(page.getByRole("navigation", { name: "مسیر صفحه" })).toContainText("فضای کار");
  await expect(button(page, "کارت جدید")).toBeVisible();
});

test("the rooms list scrolls independently of the page and the board", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 600 });
  const sizes = await list(page).evaluate((el) => ({ content: el.scrollHeight, visible: el.clientHeight }));
  expect(sizes.content).toBeGreaterThan(sizes.visible);

  const logo = page.getByRole("heading", { level: 1 });
  const profile = page.getByTestId("profile");
  const nav = boardNav(page);
  const before = [await logo.boundingBox(), await profile.boundingBox(), await nav.boundingBox()];
  const lastRoom = page.getByTestId("room").last();
  await expect(lastRoom).not.toBeInViewport();

  await list(page).evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await expect(lastRoom).toBeInViewport();
  expect(await list(page).evaluate((el) => el.scrollTop)).toBeGreaterThan(0);

  expect([await logo.boundingBox(), await profile.boundingBox(), await nav.boundingBox()]).toEqual(before);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  expect(await page.getByRole("main").evaluate((el) => el.scrollTop)).toBe(0);

  const position = await list(page).evaluate((el) => el.scrollTop);
  await page.getByRole("main").evaluate((el) => {
    el.scrollTop = 40;
  });
  expect(await page.getByRole("main").evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  expect(await list(page).evaluate((el) => el.scrollTop)).toBe(position);
});

test("New card opens the dialog from both views and adds to To do", async ({ page }) => {
  await button(page, "New card").click();
  await page.locator("dialog").getByLabel("Title").fill("From the header");
  await page.locator("dialog").getByRole("button", { name: "Save" }).click();
  await expect(card(column(page, "todo"), "From the header")).toBeVisible();
  await expect(page.getByTestId("board-count")).toHaveText("11");

  await chatNav(page).click();
  await expect(room(page, "From the header")).toBeVisible();
  await button(page, "New card").click();
  await expect(page.getByRole("dialog", { name: "New card" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).toHaveCount(0);
});

test("the sidebar count and rooms follow a deleted card and its undo", async ({ page }) => {
  const target = card(page, "Board progress bar");
  await target.hover();
  await button(target, "Delete card").click();
  await expect(page.getByTestId("board-count")).toHaveText("9");
  await expect(room(page, "Board progress bar")).toHaveCount(0);
  await button(page.getByTestId("undo-toast"), "Undo").click();
  await expect(page.getByTestId("board-count")).toHaveText("10");
  await expect(page.getByTestId("room").first()).toContainText("Board progress bar");
});
