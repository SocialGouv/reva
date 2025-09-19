import {
  expect,
  test,
  graphql,
} from "next/experimental/testmode/playwright/msw";

import { login } from "./helpers/auth";
import { data } from "./helpers/msw";

const fvae = graphql.link("https://reva-api/api/graphql");

test.describe("Authentication", () => {
  test.use({
    mswHandlers: [
      [
        fvae.query(
          "activeFeaturesForConnectedUser",
          data({
            activeFeaturesForConnectedUser: [],
          }),
        ),
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
});
