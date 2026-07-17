import {
  expect,
  graphql,
  test,
  type Page,
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
const BLOC_ID = "4c06558e-8e3e-4559-882e-321607a6b4e1";

const fvae = graphql.link("https://reva-api/api/graphql");

function createCompetenciesBlockHandlers() {
  const candidacy = createCandidacyEntity({
    id: CANDIDACY_ID,
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
      "getBlocDeCompetencesForCompetenciesBlockPage",
      graphQLResolver({
        feasibility_getActiveFeasibilityByCandidacyId: {
          candidacy: candidacy,
          dematerializedFeasibilityFile: {
            id: "e21a3d6c-977f-4ee4-ad5f-e7c74d7e0b56",
            certificationCompetenceDetails: [],
            blocsDeCompetences: [
              {
                certificationCompetenceBloc: {
                  id: BLOC_ID,
                  code: "RNCP38565BC01",
                  label: "Accompagner le développement du jeune enfant",
                  text: null,
                  competences: [],
                },
              },
            ],
          },
        },
      }),
    ),
  ];
}

async function visitCompetenciesBlock(page: Page) {
  await loginAndWaitForInitialLoad(page);
  await page.goto(
    `candidates/${candidate.id}/candidacies/${CANDIDACY_ID}/feasibility-demat-autonome/competencies-blocks/${BLOC_ID}/`,
  );
  await waitGraphQL(page, "getBlocDeCompetencesForCompetenciesBlockPage");
}

test.describe("Dematerialized Feasibility File - Competencies Block Page", () => {
  test.describe("Form Initial State", () => {
    test.use({
      mswHandlers: [[...createCompetenciesBlockHandlers()], { scope: "test" }],
    });

    test("should display the competencies block form with disabled submit button", async ({
      page,
    }) => {
      await visitCompetenciesBlock(page);

      const formButtons = page.getByTestId("form-buttons");
      await expect(formButtons).toBeVisible();
      await expect(
        formButtons.getByRole("button", { name: "Enregistrer" }),
      ).toBeDisabled();
    });
  });

  test.describe("Block Comment Section", () => {
    test.use({
      mswHandlers: [[...createCompetenciesBlockHandlers()], { scope: "test" }],
    });

    test("should enable submit button when adding a valid block comment", async ({
      page,
    }) => {
      await visitCompetenciesBlock(page);

      await page
        .getByTestId("block-comment-input")
        .getByRole("textbox")
        .fill("Test comment for the block");

      const formButtons = page.getByTestId("form-buttons");
      await expect(formButtons).toBeVisible();
      await expect(
        formButtons.getByRole("button", { name: "Enregistrer" }),
      ).not.toBeDisabled();
    });

    test("should keep submit button disabled when block comment is empty", async ({
      page,
    }) => {
      await visitCompetenciesBlock(page);

      await expect(
        page.getByTestId("block-comment-input").getByRole("textbox"),
      ).toHaveValue("");

      await expect(
        page
          .getByTestId("form-buttons")
          .getByRole("button", { name: "Enregistrer" }),
      ).toBeDisabled();
    });
  });

  test.describe("Navigation", () => {
    test.use({
      mswHandlers: [[...createCompetenciesBlockHandlers()], { scope: "test" }],
    });

    test("should provide a link back to the feasibility summary page", async ({
      page,
    }) => {
      await visitCompetenciesBlock(page);

      await page.getByTestId("back-button").click();

      await expect(page).toHaveURL(/\/feasibility-demat-autonome/);
    });
  });
});
