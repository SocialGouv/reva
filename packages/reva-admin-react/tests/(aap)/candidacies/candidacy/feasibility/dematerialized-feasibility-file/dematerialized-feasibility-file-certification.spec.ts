import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../../shared/helpers/network/requests";

import { DF_CERTIFICATION } from "./dff-mocks";

const CANDIDACY_ID = "57bf364b-8c8b-4ff4-889b-66917e26d7d0";
const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers();
const fvae = graphql.link("https://reva-api/api/graphql");

function createCertificationHandlers() {
  return [
    fvae.query(
      "getCandidacyByIdForAapFeasibilityCertificationPage",
      graphQLResolver({
        getCandidacyById: {
          id: CANDIDACY_ID,
          isCertificationPartial: false,
          certification: DF_CERTIFICATION,
        },
      }),
    ),
  ];
}

test.describe("Dematerialized Feasibility File Certification Page", () => {
  test.describe("Optional fields", () => {
    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createCertificationHandlers()],
        { scope: "test" },
      ],
    });

    test("should allow filling optional certification details and selecting specific competence blocs", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(
        `/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap/certification`,
      );
      await Promise.all([
        aapCommonWait(page),
        waitGraphQL(page, "getCandidacyByIdForAapFeasibilityCertificationPage"),
      ]);

      await page
        .getByTestId("certification-option-input")
        .getByRole("textbox")
        .fill("Test Option");

      await page
        .getByTestId("certification-first-foreign-language-input")
        .getByRole("textbox")
        .fill("English");

      await page
        .getByTestId("certification-second-foreign-language-input")
        .getByRole("textbox")
        .fill("Spanish");

      await page
        .getByTestId("certification-completion-radio-buttons")
        .getByText(
          "Un ou plusieurs bloc(s) de compétences de la certification",
          { exact: true },
        )
        .check();

      const checkboxes = page.locator('input[type="checkbox"]');
      const count = await checkboxes.count();
      for (let i = 0; i < count; i++) {
        await expect(checkboxes.nth(i)).not.toBeChecked();
      }

      await checkboxes.first().check({ force: true });

      const formButtons = page.getByTestId("form-buttons");
      await expect(formButtons).toBeVisible();
      await expect(
        formButtons.getByRole("button", { name: "Enregistrer" }),
      ).toBeEnabled();
    });
  });
});
