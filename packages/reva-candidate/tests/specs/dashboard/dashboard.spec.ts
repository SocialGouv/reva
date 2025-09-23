import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import { createCandidateHandlers } from "@tests/helpers/candidate/candidate";

test.describe("Authenticated on dashboard", () => {
  test.use({
    mswHandlers: [[...createCandidateHandlers()], { scope: "test" }],
  });

  test("shows candidate name", async ({ page }) => {
    await login(page);

    await expect(
      page.locator('[data-test="candidate-dashboard"]'),
    ).toBeVisible();

    await expect(
      page.locator('[data-test="project-home-fullname"]'),
    ).toHaveText("John Doe");
  });

  test("shows logout button", async ({ page }) => {
    await login(page);

    await expect(
      page.getByRole("button", { name: "Se déconnecter" }),
    ).toBeVisible();
  });
});
