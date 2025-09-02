import { test } from "next/experimental/testmode/playwright/msw";

test("display candidate home page", async ({ page }) => {
  await page.goto("/");
});
