import {
  expect,
  test,
  graphql,
} from "next/experimental/testmode/playwright/msw";

import { login } from "./helpers/auth";
import { createCandidateHandlers } from "./helpers/candidate";
import { data } from "./helpers/msw";

const fvae = graphql.link("https://reva-api/api/graphql");

test.describe("Authentication", () => {
  test.use({
    mswHandlers: [
      [
        ...createCandidateHandlers(),
      ],
      { scope: "test" },
    ],
  });

  test("shows logout button on dashboard", async ({ page }) => {
    await login(page);

    await expect(
      page.getByRole("button", { name: "Se déconnecter" }),
    ).toBeVisible();
  });

  test("shows candidate name on dashboard", async ({ page }) => {
    await login(page);

    await expect(
      page.locator('[data-test="candidate-dashboard"]'),
    ).toBeVisible();

    await expect(
      page.locator('[data-test="project-home-fullname"]'),
    ).toHaveText("John Doe");
  });
});
