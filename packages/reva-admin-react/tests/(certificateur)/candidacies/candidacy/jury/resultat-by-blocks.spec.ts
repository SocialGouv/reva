import {
  expect,
  graphql,
  Page,
  test,
} from "next/experimental/testmode/playwright/msw";

import { JuryResult } from "@/graphql/generated/graphql";

import { login } from "../../../../shared/helpers/auth/login";
import { getCertificateurCommonHandlers } from "../../../../shared/helpers/common-handlers/certificateur/getCertificateurCommon.handlers";
import { graphQLResolver } from "../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../shared/helpers/network/requests";

const fvae = graphql.link("https://reva-api/api/graphql");

const CANDIDACY_ID = "42288593-2a6b-4606-aedd-0d76348b39f4";
const JURY_ID = "jury-id";
const JURY_PAGE_PATH = `/admin2/candidacies/${CANDIDACY_ID}/jury/resultat`;
const PAST_JURY_DATE = 1711929600000;

const juryResultRadioByValue = (page: Page, value: string) =>
  page.locator(`input[type="radio"][name="result"][value="${value}"]`);

function createGetJuryByCandidacyIdHandler({
  typeAccompagnement,
  isCertificationPartial,
  historyJury = [],
}: {
  typeAccompagnement: "AUTONOME" | "ACCOMPAGNE";
  isCertificationPartial: boolean;
  historyJury?: {
    id: string;
    dateOfSession: number;
    result: JuryResult;
    informationOfResult?: string | null;
    juryResultByCompetenceBlocs?: {
      competenceBloc: {
        id: string;
        code?: string | null;
        label: string;
      };
      isCompetenceBlocValidated: boolean;
    }[];
  }[];
}) {
  return fvae.query(
    "getJuryForResultPageByCandidacyId",
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
          competenceBlocs: [
            {
              id: "bloc-id-1",
              code: "B1",
              label: "Bloc 1",
            },
            {
              id: "bloc-id-2",
              code: "B2",
              label: "Bloc 2",
            },
            {
              id: "bloc-id-3",
              code: "B3",
              label: "Bloc 3",
            },
          ],
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
        historyJury,
      },
    }),
  );
}

function createUpdateJuryResultMutationHandler() {
  return fvae.mutation(
    "jury_updateResultWithBlocks",
    graphQLResolver({
      jury_updateResult: {
        id: JURY_ID,
      },
    }),
  );
}

async function openResultPage(page: Page) {
  await login({ role: "certificateur", page });
  await page.goto(JURY_PAGE_PATH);
  await Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getCandidacyWithCandidateInfoForLayout"),
    waitGraphQL(page, "getJuryForResultPageByCandidacyId"),
  ]);
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

    await openResultPage(page);

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

    await openResultPage(page);

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

    await openResultPage(page);

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
        typeAccompagnement: "ACCOMPAGNE",
        isCertificationPartial: false,
      }),
      createUpdateJuryResultMutationHandler(),
    );

    await openResultPage(page);

    await juryResultRadioByValue(
      page,
      "FULL_SUCCESS_OF_FULL_CERTIFICATION",
    ).click({ force: true });

    await page.getByRole("button", { name: "Envoyer" }).click();
    await expect(
      page.getByRole("dialog", { name: "Confirmer le résultat du jury" }),
    ).toBeVisible();

    const updateResultPromise = waitGraphQL(
      page,
      "jury_updateResultWithBlocks",
    );
    await page.getByRole("button", { name: "Confirmer" }).click();
    await updateResultPromise;
  });

  test("Automatically checks all blocks when full success of full certification is selected", async ({
    page,
    msw,
  }) => {
    msw.use(
      ...certificateurCommonHandlers,
      createGetJuryByCandidacyIdHandler({
        typeAccompagnement: "ACCOMPAGNE",
        isCertificationPartial: false,
      }),
      createUpdateJuryResultMutationHandler(),
    );

    await openResultPage(page);

    await juryResultRadioByValue(
      page,
      "FULL_SUCCESS_OF_FULL_CERTIFICATION",
    ).click({ force: true });

    await expect(page.getByRole("checkbox", { name: "Bloc 1" })).toBeChecked();
    await expect(page.getByRole("checkbox", { name: "Bloc 2" })).toBeChecked();
  });

  test("Automatically checks all blocks when full success of partial certification is selected", async ({
    page,
    msw,
  }) => {
    msw.use(
      ...certificateurCommonHandlers,
      createGetJuryByCandidacyIdHandler({
        typeAccompagnement: "ACCOMPAGNE",
        isCertificationPartial: true,
      }),
      createUpdateJuryResultMutationHandler(),
    );

    await openResultPage(page);

    await juryResultRadioByValue(
      page,
      "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION",
    ).click({ force: true });

    await expect(page.getByRole("checkbox", { name: "Bloc 1" })).toBeChecked();
    await expect(page.getByRole("checkbox", { name: "Bloc 2" })).toBeChecked();
  });

  test("Unselects and disables all blocks when failure is selected", async ({
    page,
    msw,
  }) => {
    msw.use(
      ...certificateurCommonHandlers,
      createGetJuryByCandidacyIdHandler({
        typeAccompagnement: "ACCOMPAGNE",
        isCertificationPartial: false,
      }),
      createUpdateJuryResultMutationHandler(),
    );

    await openResultPage(page);

    await juryResultRadioByValue(page, "FAILURE").click({ force: true });

    await expect(
      page.getByRole("checkbox", { name: "Bloc 1" }),
    ).not.toBeChecked();
    await expect(
      page.getByRole("checkbox", { name: "Bloc 2" }),
    ).not.toBeChecked();
    await expect(page.getByRole("checkbox", { name: "Bloc 1" })).toBeDisabled();
    await expect(page.getByRole("checkbox", { name: "Bloc 2" })).toBeDisabled();
  });

  test("Unselects and disables all blocks when candidate excused is selected", async ({
    page,
    msw,
  }) => {
    msw.use(
      ...certificateurCommonHandlers,
      createGetJuryByCandidacyIdHandler({
        typeAccompagnement: "ACCOMPAGNE",
        isCertificationPartial: false,
      }),
      createUpdateJuryResultMutationHandler(),
    );

    await openResultPage(page);

    await juryResultRadioByValue(page, "CANDIDATE_EXCUSED").click({
      force: true,
    });
    await expect(
      page.getByRole("checkbox", { name: "Bloc 1" }),
    ).not.toBeChecked();
    await expect(
      page.getByRole("checkbox", { name: "Bloc 2" }),
    ).not.toBeChecked();
    await expect(page.getByRole("checkbox", { name: "Bloc 1" })).toBeDisabled();
    await expect(page.getByRole("checkbox", { name: "Bloc 2" })).toBeDisabled();
  });

  test("Unselects and disables all blocks when candidate absent is selected", async ({
    page,
    msw,
  }) => {
    msw.use(
      ...certificateurCommonHandlers,
      createGetJuryByCandidacyIdHandler({
        typeAccompagnement: "ACCOMPAGNE",
        isCertificationPartial: false,
      }),
      createUpdateJuryResultMutationHandler(),
    );

    await openResultPage(page);

    await juryResultRadioByValue(page, "CANDIDATE_ABSENT").click({
      force: true,
    });
    await expect(
      page.getByRole("checkbox", { name: "Bloc 1" }),
    ).not.toBeChecked();
    await expect(
      page.getByRole("checkbox", { name: "Bloc 2" }),
    ).not.toBeChecked();
    await expect(page.getByRole("checkbox", { name: "Bloc 1" })).toBeDisabled();
    await expect(page.getByRole("checkbox", { name: "Bloc 2" })).toBeDisabled();
  });

  test("Displays history jury results", async ({ page, msw }) => {
    msw.use(
      ...certificateurCommonHandlers,
      createGetJuryByCandidacyIdHandler({
        typeAccompagnement: "ACCOMPAGNE",
        isCertificationPartial: false,
        historyJury: [
          {
            id: "past-jury-id-1",
            dateOfSession: 1711929600000,
            result: "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
            informationOfResult: "Information of result 1",
            juryResultByCompetenceBlocs: [
              {
                competenceBloc: {
                  id: "bloc-id-1",
                  code: "B1",
                  label: "Bloc 1",
                },
                isCompetenceBlocValidated: true,
              },
              {
                competenceBloc: {
                  id: "bloc-id-2",
                  code: "B2",
                  label: "Bloc 2",
                },
                isCompetenceBlocValidated: false,
              },
              {
                competenceBloc: {
                  id: "bloc-id-3",
                  code: "B3",
                  label: "Bloc 3",
                },
                isCompetenceBlocValidated: true,
              },
            ],
          },
        ],
      }),
    );

    await openResultPage(page);

    await expect(page.getByText("Voir les résultats précédents")).toBeVisible();
    await page
      .getByRole("button", { name: "Voir les résultats précédents" })
      .click();
    const accordionContent = page.getByTestId("history-resultat-view");
    await expect(accordionContent).toBeVisible();
    await expect(
      accordionContent.getByRole("listitem", { name: "B1 - Bloc 1 (validé)" }),
    ).toBeVisible();
    await expect(
      accordionContent.getByRole("listitem", {
        name: "B2 - Bloc 2 (non validé)",
      }),
    ).toBeVisible();
    await expect(
      accordionContent.getByRole("listitem", { name: "B3 - Bloc 3 (validé)" }),
    ).toBeVisible();
    await expect(
      accordionContent.getByText("Information of result 1"),
    ).toBeVisible();
  });

  test("Shows modal with feasibility competence blocks when clicking on 'Voir les détails de la recevabilité du candidat sur cette certification'", async ({
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

    await openResultPage(page);

    await page
      .getByTestId("result-radio-buttons")
      .getByText(
        "Voir les détails de la recevabilité du candidat sur cette certification",
      )
      .click();
    const modal = page.getByRole("dialog", {
      name: "Recevabilité sur cette candidature",
    });
    await expect(modal).toBeVisible();
    await expect(
      modal.getByText("Recevabilité obtenue sur les blocs :"),
    ).toBeVisible();
    await expect(modal.getByText("B1 - Bloc 1")).toBeVisible();
    await expect(modal.getByText("B2 - Bloc 2")).toBeVisible();
    await expect(
      modal.getByText("Blocs non concernés par la recevabilité :"),
    ).toBeVisible();
    await expect(modal.getByText("B3 - Bloc 3")).toBeVisible();
  });
});
