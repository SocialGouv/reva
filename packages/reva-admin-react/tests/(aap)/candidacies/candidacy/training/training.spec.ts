import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../shared/helpers/network/requests";

import type { Page } from "next/experimental/testmode/playwright/msw";

const fvae = graphql.link("https://reva-api/api/graphql");

const CANDIDACY_ID = "fb451fbc-3218-416d-9ac9-65b13432469f";
const PAGE_URL = `/admin2/candidacies/${CANDIDACY_ID}/training/`;

const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers();

function createTrainingPageHandlers({
  candidacyStatus = "PARCOURS_CONFIRME",
  feasibilityDecision = "DRAFT",
}: {
  candidacyStatus?: string;
  feasibilityDecision?: string;
} = {}) {
  return [
    fvae.query(
      "getCandidacyAndReferentialForCandidacyTrainingPage",
      graphQLResolver({
        getCandidacyById: {
          id: CANDIDACY_ID,
          typology: "NON_SPECIFIE",
          conventionCollective: null,
          individualHourCount: 10,
          collectiveHourCount: 0,
          additionalHourCount: 0,
          basicSkills: [],
          mandatoryTrainings: [],
          certificateSkills: "",
          otherTraining: "",
          isCertificationPartial: false,
          status: candidacyStatus,
          feasibilityFormat: "DEMATERIALIZED",
          financeModule: "unifvae",
          candidacyOnCandidacyFinancingMethods: [],
          feasibility: {
            decision: feasibilityDecision,
          },
        },
        training_getTrainings: [
          {
            id: "f4cd7a76-3ade-4b8e-9704-7f4a599a05a0",
            label: "Formation obligatoire",
          },
        ],
        getBasicSkills: [
          {
            id: "3e70d49f-e74c-4123-a4f5-d7c7e307d58f",
            label: "Savoir de base",
          },
        ],
        getCandidacyFinancingMethods: [],
      }),
    ),
  ];
}

function createSubmitTrainingHandler() {
  return fvae.mutation(
    "submitTrainingForCandidacyTrainingPage",
    graphQLResolver({
      training_submitTrainingForm: {
        id: CANDIDACY_ID,
      },
    }),
  );
}

async function visitTrainingPage(page: Page) {
  await page.goto(PAGE_URL);
  await Promise.all([
    aapCommonWait(page),
    waitGraphQL(page, "getCandidacyAndReferentialForCandidacyTrainingPage"),
  ]);
}

function getFeasibilityResetWarningModal(page: Page) {
  return page.getByRole("dialog", {
    name: "Vous allez perdre des données dans le dossier de faisabilité",
  });
}

test.describe("Candidacy training page", () => {
  test("should warn before resetting the feasibility file when sending a new training form after the candidate confirmed the training", async ({
    page,
    msw,
  }) => {
    msw.use(
      ...createTrainingPageHandlers({ candidacyStatus: "PARCOURS_CONFIRME" }),
      createSubmitTrainingHandler(),
      ...aapCommonHandlers,
    );

    await login({ page, role: "aap" });
    await visitTrainingPage(page);

    await page.getByRole("button", { name: "Envoyer le parcours" }).click();

    const feasibilityResetWarningModal =
      getFeasibilityResetWarningModal(page);
    await expect(feasibilityResetWarningModal).toBeVisible();
    await expect(
      feasibilityResetWarningModal.getByRole("button", { name: "Annuler" }),
    ).toBeVisible();
    await expect(
      feasibilityResetWarningModal.getByRole("button", { name: "Confirmer" }),
    ).toBeVisible();

    const submitTrainingRequest = waitGraphQL(
      page,
      "submitTrainingForCandidacyTrainingPage",
    );
    await feasibilityResetWarningModal
      .getByRole("button", { name: "Confirmer" })
      .click();
    await submitTrainingRequest;

    await expect(page).toHaveURL(
      `/admin2/candidacies/${CANDIDACY_ID}/summary/`,
    );
  });

  test("should send the training form without warning before the candidate confirmed the training", async ({
    page,
    msw,
  }) => {
    msw.use(
      ...createTrainingPageHandlers({ candidacyStatus: "PRISE_EN_CHARGE" }),
      createSubmitTrainingHandler(),
      ...aapCommonHandlers,
    );

    await login({ page, role: "aap" });
    await visitTrainingPage(page);

    const submitTrainingRequest = waitGraphQL(
      page,
      "submitTrainingForCandidacyTrainingPage",
    );
    await page.getByRole("button", { name: "Envoyer le parcours" }).click();
    await submitTrainingRequest;

    await expect(
      getFeasibilityResetWarningModal(page),
    ).not.toBeVisible();
    await expect(page).toHaveURL(
      `/admin2/candidacies/${CANDIDACY_ID}/summary/`,
    );
  });
});
