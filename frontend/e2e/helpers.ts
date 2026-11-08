import { expect, test as base, type Locator, type Page } from "@playwright/test";

/** 17 Aban 1405, the "today" of the sample data. */
export const TODAY = new Date("2026-11-08T11:00:00");

export const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

export const test = base.extend<{ errors: string[] }>({
  errors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      await page.clock.setFixedTime(TODAY);
      await page.goto("/");
      await expect(page.getByTestId("card").first()).toBeVisible();
      await use(errors);
      expect(errors).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

export const column = (page: Page, id: string) => page.getByTestId(`column-${id}`);
export const card = (scope: Page | Locator, title: string) => scope.getByTestId("card").filter({ hasText: title });
export const button = (scope: Page | Locator, name: string | RegExp) =>
  scope.getByRole("button", typeof name === "string" ? { name, exact: true } : { name });
export const composer = (page: Page) => page.getByRole("textbox", { name: "Write a message…" });

export const setFa = (page: Page) => button(page, "فا").click();

export async function openRoom(page: Page, title: string) {
  await card(page, title).getByRole("button", { name: title }).click();
  await expect(page.getByRole("heading", { level: 2, name: title })).toBeVisible();
}

/** Reloads and waits until the persisted app has rendered. */
export async function reload(page: Page) {
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

export async function drag(page: Page, source: Locator, target: Locator, { drop = true } = {}) {
  const from = (await source.boundingBox())!;
  const to = (await target.boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2 + 10, from.y + from.height / 2, { steps: 5 });
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 20 });
  if (drop) await page.mouse.up();
}

/** Picks up the focused card, then waits for dnd-kit to measure it: earlier arrow keys are ignored. */
export async function pickUp(page: Page) {
  await page.keyboard.press("Space");
  await expect(page.getByTestId("drag-overlay")).toBeVisible();
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
}
