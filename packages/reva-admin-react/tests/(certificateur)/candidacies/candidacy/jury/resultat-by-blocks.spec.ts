import {
  expect,
  graphql,
  Page,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/helpers/auth/login";
import { getCertificateurCommonHandlers } from "../../../../shared/helpers/common-handlers/certificateur/getCertificateurCommon.handlers";
import { graphQLResolver } from "../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../shared/helpers/network/requests";

const fvae = graphql.link("https://reva-api/api/graphql");

const CANDIDACY_ID = "42288593-2a6b-4606-aedd-0d76348b39f4";
const JURY_ID = "jury-id";
const JURY_PAGE_PATH = `/admin2/candidacies/${CANDIDACY_ID}/jury`;
const PAST_JURY_DATE = 1711929600000;

const juryResultRadioByValue = (page: Page, value: string) =>
  page.locator(`input[type="radio"][name="result"][value="${value}"]`);

function createGetJuryByCandidacyIdHandler({
  typeAccompagnement,
  isCertificationPartial,
}: {
  typeAccompagnement: "AUTONOME" | "ACCOMPAGNE";
  isCertificationPartial: boolean;
}) {
  return fvae.query(
    "getJuryByCandidacyId",
    graphQLResolver({
      getCandidacyById: {
        id: CANDIDACY_ID,
        isCertificationPartial,
        typeAccompagnement,
        activeDossierDeValidation: {
          updatedAt: 1712102400000,
          decision: "PENDING",
        },
        certification: {
          id: "certification-id",
          label: "Certification test",
          codeRncp: "RNCP12345",
          typeDiplome: "Titre professionnel",
        },
        jury: {
          id: JURY_ID,
          dateOfSession: PAST_JURY_DATE,
          timeOfSession: null,
          timeSpecified: false,
          addressOfSession: null,
          informationOfSession: null,
          result: null,
          dateOfResult: null,
          informationOfResult: null,
          convocationFile: null,
        },
        feasibility: {
          dematerializedFeasibilityFile: {
            blocsDeCompetences: [
              {
                certificationCompetenceBloc: {
                  id: "bloc-id-1",
                  code: "B1",
                  label: "Bloc 1",
                },
              },
              {
                certificationCompetenceBloc: {
                  id: "bloc-id-2",
                  code: "B2",
                  label: "Bloc 2",
                },
              },
            ],
          },
        },
        historyJury: [],
      },
    }),
  );
}

function createUpdateJuryResultMutationHandler() {
  return fvae.mutation(
    "jury_updateResult",
    graphQLResolver({
      jury_updateResult: {
        id: JURY_ID,
      },
    }),
  );
}

async function openResultTab(page: Page) {
  await login({ role: "certificateur", page });
  await page.goto(JURY_PAGE_PATH);
  await Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getCandidacyWithCandidateInfoForLayout"),
    waitGraphQL(page, "getJuryByCandidacyId"),
  ]);
  await page.getByRole("tab", { name: "Résultat" }).click();
}

test.describe("jury result by blocks", () => {
  const { certificateurCommonHandlers } = getCertificateurCommonHandlers({
    candidacyId: CANDIDACY_ID,
    candidateFirstname: "Camille",
    candidateLastname: "Durand",
    activeFeaturesForConnectedUser: ["JURY_RESULTS_BY_BLOCK"],
  });

  test("displays full certification options for accompagne full candidacy", async ({
    page,
    msw,
  }) => {
    msw.use(
      ...certificateurCommonHandlers,
      createGetJuryByCandidacyIdHandler({
        typeAccompagnement: "ACCOMPAGNE",
        isCertificationPartial: false,
      }),
    );

    await openResultTab(page);

    await expect(
      juryResultRadioByValue(page, "FULL_SUCCESS_OF_FULL_CERTIFICATION"),
    ).toBeVisible();
    await expect(
      juryResultRadioByValue(page, "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION"),
    ).toBeVisible();
    await expect(juryResultRadioByValue(page, "FAILURE")).toBeVisible();
    await expect(
      juryResultRadioByValue(page, "CANDIDATE_EXCUSED"),
    ).toBeVisible();
    await expect(
      juryResultRadioByValue(page, "CANDIDATE_ABSENT"),
    ).toBeVisible();
  });

  test("displays partial certification options for accompagne partial candidacy", async ({
    page,
    msw,
  }) => {
    msw.use(
      ...certificateurCommonHandlers,
      createGetJuryByCandidacyIdHandler({
        typeAccompagnement: "ACCOMPAGNE",
        isCertificationPartial: true,
      }),
    );

    await openResultTab(page);

    await expect(
      juryResultRadioByValue(page, "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION"),
    ).toBeVisible();
    await expect(
      juryResultRadioByValue(page, "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION"),
    ).toBeVisible();
    await expect(juryResultRadioByValue(page, "FAILURE")).toBeVisible();
    await expect(
      juryResultRadioByValue(page, "CANDIDATE_EXCUSED"),
    ).toBeVisible();
    await expect(
      juryResultRadioByValue(page, "CANDIDATE_ABSENT"),
    ).toBeVisible();
  });

  test("keeps submit disabled until a result is selected, then enables it", async ({
    page,
    msw,
  }) => {
    msw.use(
      ...certificateurCommonHandlers,
      createGetJuryByCandidacyIdHandler({
        typeAccompagnement: "ACCOMPAGNE",
        isCertificationPartial: false,
      }),
    );

    await openResultTab(page);

    const submitButton = page.getByRole("button", { name: "Envoyer" });
    await expect(submitButton).toBeDisabled();

    await juryResultRadioByValue(page, "FAILURE").click({ force: true });

    await expect(submitButton).toBeEnabled();
  });

  test("submits the jury result after confirmation modal", async ({
    page,
    msw,
  }) => {
    msw.use(
      ...certificateurCommonHandlers,
      createGetJuryByCandidacyIdHandler({
        typeAccompagnement: "AUTONOME",
        isCertificationPartial: false,
      }),
      createUpdateJuryResultMutationHandler(),
    );

    await openResultTab(page);

    await juryResultRadioByValue(
      page,
      "FULL_SUCCESS_OF_FULL_CERTIFICATION",
    ).click({ force: true });

    await page.getByRole("button", { name: "Envoyer" }).click();
    await expect(
      page.getByRole("dialog", { name: "Confirmer le résultat du jury" }),
    ).toBeVisible();

    const updateResultPromise = waitGraphQL(page, "jury_updateResult");
    await page.getByRole("button", { name: "Confirmer" }).click();
    await updateResultPromise;
  });
});
