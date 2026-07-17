import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { createCandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import {
  loginAndWaitForInitialLoad,
  getDefaultFeasibilityHandlers,
} from "@tests/helpers/handlers/feasibility/dematerialized-feasibility-file/dematerialized-feasibility-file.handler";
import { graphQLResolver } from "@tests/helpers/network/msw";
import { waitGraphQL } from "@tests/helpers/network/requests";

import { DF_CERTIFICATION } from "./dff-mocks";

const candidate = createCandidateEntity();

const CANDIDACY_ID = "57bf364b-8c8b-4ff4-889b-66917e26d7d0";

const fvae = graphql.link("https://reva-api/api/graphql");

function createCertificationHandlers() {
  const candidacy = createCandidacyEntity({
    id: CANDIDACY_ID,
    isCertificationPartial: false,
    certification: DF_CERTIFICATION,
    candidate: {
      ...candidate,
      givenName: "John",
      lastname: "Doe",
      firstname: "John",
    },
    typeAccompagnement: "AUTONOME",
  });

  return [
    ...getDefaultFeasibilityHandlers(candidacy),
    fvae.query(
      "getCandidacyByIdForFeasibilityDematAutonomeCertificationPage",
      graphQLResolver({
        getCandidacyById: candidacy,
      }),
    ),
  ];
}

test.describe("Dematerialized Feasibility File Certification Page", () => {
  test.describe("Optional fields", () => {
    test.use({
      mswHandlers: [createCertificationHandlers(), { scope: "test" }],
    });

    test("should allow filling optional certification details and selecting specific competence blocs", async ({
      page,
    }) => {
      await loginAndWaitForInitialLoad(page);

      await page.goto(
        `candidates/${candidate.id}/candidacies/${CANDIDACY_ID}/feasibility-demat-autonome/certification`,
      );
      await waitGraphQL(
        page,
        "getCandidacyByIdForFeasibilityDematAutonomeCertificationPage",
      );

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
        .getByText("Un ou plusieurs bloc(s) de compétences visé(s)", {
          exact: false,
        })
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
