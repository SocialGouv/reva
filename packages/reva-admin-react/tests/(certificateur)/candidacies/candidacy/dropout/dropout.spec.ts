import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/helpers/auth/login";
import { getCertificateurCommonHandlers } from "../../../../shared/helpers/common-handlers/certificateur/getCertificateurCommon.handlers";
import { graphQLResolver } from "../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../shared/helpers/network/requests";

import type { Page } from "next/experimental/testmode/playwright/msw";

const fvae = graphql.link("https://reva-api/api/graphql");

const CANDIDACY_ID = "fb451fbc-3218-416d-9ac9-65b13432469f";

function createContactDetailsHandlers() {
  return [
    fvae.query(
      "getCandidacyByIdWithDropout",
      graphQLResolver({
        getCandidacyById: {
          id: CANDIDACY_ID,
          candidacyDropOut: {
            createdAt: 1712102400000,
            validatedAt: 1712102400000,
            dropOutReason: {
              label: "Motif d'abandon",
            },
          },
        },
      }),
    ),
  ];
}

const { certificateurCommonHandlers, certificateurCommonWait } =
  getCertificateurCommonHandlers({ candidacyId: CANDIDACY_ID });

async function visitDropoutPage(page: Page) {
  await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/candidacy-drop-out`);
  await Promise.all([
    certificateurCommonWait(page),
    waitGraphQL(page, "getCandidacyByIdWithDropout"),
  ]);
}

test.describe("Dropout page", () => {
  test.describe("Display and permissions", () => {
    test.use({
      mswHandlers: [
        [...createContactDetailsHandlers(), ...certificateurCommonHandlers],
        { scope: "test" },
      ],
    });

    test("should display the dropout page", async ({ page }) => {
      await login({ page, role: "certificateur" });
      await visitDropoutPage(page);

      await expect(
        page.getByRole("heading", {
          name: "Abandon du candidat",
          level: 1,
        }),
      ).toBeVisible();
    });
  });
});
