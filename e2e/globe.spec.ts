import { test, expect } from "@playwright/test";

test("globe renders and is visible", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    const text = msg.text();
    if (msg.type() === "error" && !text.includes("ResizeObserver")) {
      errors.push(text);
    }
  });

  await page.goto("/");
  await expect(page.getByText("Where Is")).toBeVisible({ timeout: 10000 });

  // Wait for globe canvas (class h-full w-full), not the Galaxy background canvas
  const canvas = page.locator("canvas.h-full.w-full");
  await expect(canvas).toBeVisible({ timeout: 8000 });

  // Give time for WebGL to render (cobe uses requestAnimationFrame)
  await page.waitForTimeout(1500);

  const canvasBox = await canvas.boundingBox();
  expect(canvasBox).not.toBeNull();
  expect((canvasBox?.width ?? 0)).toBeGreaterThan(0);
  expect((canvasBox?.height ?? 0)).toBeGreaterThan(0);

  if (errors.length > 0) {
    console.error("Console errors:", errors);
  }
  expect(errors).toHaveLength(0);
});
