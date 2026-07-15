import {
  expect,
  graphql,
  Page,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../../shared/helpers/network/requests";

const CANDIDACY_ID = "57bf364b-8c8b-4ff4-889b-66917e26d7d0";
const PAGE_URL = `/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap/complement-experience-parcours-vise/`;
const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers();
const fvae = graphql.link("https://reva-api/api/graphql");

function createPageQueryHandler(complementExperienceParcoursVise?: string) {
  const getDematerializedFeasibilityFileForComplementExperienceParcoursVisePageQuery =
    fvae.query(
      "getDematerializedFeasibilityFileForComplementExperienceParcoursVisePage",
      graphQLResolver({
        feasibility_getActiveFeasibilityByCandidacyId: {
          dematerializedFeasibilityFile: {
            id: "e21a3d6c-977f-4ee4-ad5f-e7c74d7e0b56",
            complementExperienceParcoursVise:
              complementExperienceParcoursVise ?? null,
          },
        },
      }),
    );

  const updateComplementExperienceParcoursViseForComplementExperienceParcoursVisePageMutation =
    fvae.mutation(
      "updateComplementExperienceParcoursViseForComplementExperienceParcoursVisePage",
      graphQLResolver({
        dematerialized_feasibility_file_createOrUpdateComplementExperienceParcoursVise:
          {
            id: "e21a3d6c-977f-4ee4-ad5f-e7c74d7e0b56",
            complementExperienceParcoursVise: "Test complement experience",
          },
      }),
    );

  return [
    getDematerializedFeasibilityFileForComplementExperienceParcoursVisePageQuery,
    updateComplementExperienceParcoursViseForComplementExperienceParcoursVisePageMutation,
  ];
}

async function visitPage(page: Page) {
  await login({ role: "aapCollaborateur", page });
  await page.goto(PAGE_URL);
  await Promise.all([
    aapCommonWait(page),
    waitGraphQL(
      page,
      "getDematerializedFeasibilityFileForComplementExperienceParcoursVisePage",
    ),
  ]);
}

test.describe("Dematerialized Feasibility File - Complement Experience Parcours Visé Page", () => {
  test.describe("When i access the page with no data", () => {
    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createPageQueryHandler()],
        { scope: "test" },
      ],
    });

    test("it should display the page heading and textarea", async ({
      page,
    }) => {
      await visitPage(page);

      await expect(
        page.getByRole("heading", { name: "Blocs de compétences" }),
      ).toBeVisible();
      await expect(
        page.getByTestId("block-comment-input").getByRole("textbox"),
      ).toBeVisible();
    });
  });

  test.describe("When i access the page with existing data", () => {
    const EXISTING_VALUE =
      "Expérience complémentaire liée au parcours visé existante";

    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createPageQueryHandler(EXISTING_VALUE)],
        { scope: "test" },
      ],
    });

    test("it should pre-fill the textarea with the existing value from the API", async ({
      page,
    }) => {
      await visitPage(page);

      await expect(
        page.getByTestId("block-comment-input").getByRole("textbox"),
      ).toHaveValue(EXISTING_VALUE);
    });
  });

  test.describe("When i interact with the form", () => {
    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createPageQueryHandler()],
        { scope: "test" },
      ],
    });

    test("it should call the mutation and redirect to the feasibility summary after a successful submission", async ({
      page,
    }) => {
      await visitPage(page);

      await page
        .getByTestId("block-comment-input")
        .getByRole("textbox")
        .fill("Test complement experience");

      const updateMutation = waitGraphQL(
        page,
        "updateComplementExperienceParcoursViseForComplementExperienceParcoursVisePage",
      );

      await page
        .getByTestId("form-buttons")
        .getByRole("button", { name: "Enregistrer" })
        .click();

      await updateMutation;

      await expect(page).toHaveURL(
        `/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap/`,
      );
    });
  });
});
