const { test, expect } = require("@playwright/test");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

test("offline keyboard, Chinese IME, floating mode, and long press selection", async ({ page }, testInfo) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(pathToFileURL(path.resolve("demo.html")).href);
  await page.waitForFunction(() => window.YkcxZhDictionary && window.YkcxZhDictionary.entryCount > 100000);
  expect(await page.evaluate(() => window.YkcxZhDictionary.entryCount)).toBe(114144);
  expect(await page.locator(".ykcx-keyboard .ykcx-material-icon").count()).toBeGreaterThanOrEqual(7);
  expect(await page.locator(".ykcx-keyboard").textContent()).not.toContain("🌐");

  const input = page.locator("#name");
  await input.click();
  await expect(page.locator(".ykcx-keyboard")).toHaveClass(/ykcx-visible/);
  await page.locator('[data-key="h"]').click();
  await page.locator('[data-key="i"]').click();
  await expect(input).toHaveValue("hi");

  await page.locator('[data-key="language"]').click();
  for (const key of ["n", "i", "h", "a", "o"]) await page.locator(`[data-key="${key}"]`).click();
  await expect(page.locator(".ykcx-composition")).toHaveText("nihao");
  await expect(page.locator(".ykcx-candidate", { hasText: "你好" }).first()).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("chinese-keyboard.png"), fullPage: true });
  await page.locator(".ykcx-candidate", { hasText: "你好" }).first().click();
  await expect(input).toHaveValue("hi你好");

  for (const key of ["z", "h", "o", "n", "g", "g", "u", "o", "r", "e", "n"]) {
    await page.locator(`[data-key="${key}"]`).click();
  }
  await expect(page.locator(".ykcx-candidate", { hasText: "中国人" }).first()).toBeVisible();
  await page.locator(".ykcx-candidate", { hasText: "中国人" }).first().click();
  await expect(input).toHaveValue("hi你好中国人");

  await page.locator("#floating").click();
  await expect(page.locator(".ykcx-keyboard")).toHaveClass(/ykcx-mode-floating/);
  await expect(page.locator(".ykcx-drag-handle")).toBeVisible();
  await page.locator("#hide").click();

  const paragraph = page.locator("article p").last();
  const point = await paragraph.evaluate((element) => {
    const node = element.firstChild;
    const start = node.nodeValue.indexOf("English");
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, start + "English".length);
    const rect = range.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  });
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.waitForTimeout(650);
  await page.mouse.up();
  await expect(page.locator(".ykcx-selection-overlay")).toHaveClass(/ykcx-selection-visible/);
  await expect(page.locator(".ykcx-selection-handle-start")).toBeVisible();
  await expect(page.locator(".ykcx-selection-handle-end")).toBeVisible();
  const startHandleBox = await page.locator(".ykcx-selection-handle-start").boundingBox();
  const endHandleBox = await page.locator(".ykcx-selection-handle-end").boundingBox();
  expect(Math.abs(startHandleBox.x - endHandleBox.x)).toBeGreaterThan(5);
  expect(await page.evaluate(() => getSelection().toString())).toBe("English");
  await page.screenshot({ path: testInfo.outputPath("long-press-selection.png"), fullPage: true });
  expect(errors).toEqual([]);
});
