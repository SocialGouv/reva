import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import { graphQLResolver } from "@tests/helpers/network/msw";

const fvae = graphql.link("https://reva-api/api/graphql");

const handlers = [
  fvae.query(
    "activeFeaturesForConnectedUser",
    graphQLResolver({ activeFeaturesForConnectedUser: [] }),
  ),
  fvae.query(
    "candidate_getCandidateForUserDropdown",
    graphQLResolver({ candidate_getCandidateWithCandidacy: null }),
  ),
];

test.describe("Logout", () => {
  test.use({ mswHandlers: [handlers, { scope: "test" }] });

  test("déconnecte l'utilisateur via Keycloak avec id_token_hint et redirige vers /logout-confirmation", async ({
    page,
    baseURL,
  }) => {
    let capturedLogoutUrl: string | undefined;

    const logoutConfirmationUrl = new URL(
      "/candidat/logout-confirmation",
      baseURL,
    ).toString();

    await page.route(
      "**/realms/reva-app/protocol/openid-connect/logout*",
      async (route) => {
        capturedLogoutUrl = route.request().url();
        await route.fulfill({
          status: 302,
          headers: { Location: logoutConfirmationUrl },
        });
      },
    );

    await login(page, { authenticated: true });

    const accountToggle = page
      .getByRole("button", { name: /Mon compte/i })
      .first();
    await expect(accountToggle).toBeVisible();
    await accountToggle.click();
    await expect(accountToggle).toHaveAttribute("aria-expanded", "true");

    await page.getByRole("button", { name: "Se déconnecter" }).click();

    await expect.poll(() => capturedLogoutUrl).toBeDefined();

    const url = new URL(capturedLogoutUrl!);
    expect(url.searchParams.get("id_token_hint")).toBeTruthy();
    expect(url.searchParams.get("state")).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(url.searchParams.get("post_logout_redirect_uri")).toContain(
      "/candidat/logout-confirmation",
    );
  });
});
