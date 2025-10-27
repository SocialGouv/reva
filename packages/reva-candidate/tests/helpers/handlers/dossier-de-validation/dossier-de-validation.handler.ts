import { graphql, Page } from "next/experimental/testmode/playwright/msw";

import readyForJuryMutation from "@tests/fixtures/candidate/dossier-de-validation/ready-for-jury-mutation.json";
import { graphQLResolver } from "@tests/helpers/network/msw";
import { waitGraphQL } from "@tests/helpers/network/requests";

import type { CandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";

export async function navigateToDossierValidation(
  page: Page,
  candidateId: string,
  candidacyId: string,
) {
  await page.goto(
    `candidates/${candidateId}/candidacies/${candidacyId}/dossier-de-validation/`,
  );
}

export async function clickDossierTab(page: Page) {
  await page.getByRole("tab", { name: /du dossier/ }).click();
}

interface DashboardHandlersOptions {
  candidacy: CandidacyEntity;
  activeFeaturesForConnectedUser?: string[];
}

const dossierDeValidationWait = async (page: Page) => {
  await Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getCandidacyByIdForDossierDeValidationPage"),
  ]);
};

export const dossierDeValidationHandlers = ({
  candidacy,
  activeFeaturesForConnectedUser = [],
}: DashboardHandlersOptions) => {
  const fvae = graphql.link("https://reva-api/api/graphql");

  const candidacyInput = {
    getCandidacyById: candidacy,
  };

  return {
    handlers: [
      fvae.query(
        "candidate_getCandidateForCandidatesGuard",
        graphQLResolver({
          candidate_getCandidateWithCandidacy: {
            ...candidacy.candidate,
          },
        }),
      ),
      fvae.query(
        "getCandidateByIdForCandidateGuard",
        graphQLResolver({
          candidate_getCandidateById: {
            ...candidacy.candidate,
          },
        }),
      ),
      fvae.query(
        "candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
        graphQLResolver({
          candidate_getCandidateById: {
            candidacies: [candidacy],
          },
        }),
      ),
      fvae.query(
        "getCandidacyByIdForCandidacyGuard",
        graphQLResolver(candidacyInput),
      ),
      fvae.query(
        "getCandidacyByIdWithCandidate",
        graphQLResolver(candidacyInput),
      ),
      fvae.query(
        "getCandidacyByIdForDashboard",
        graphQLResolver(candidacyInput),
      ),
      fvae.query(
        "getCandidacyByIdForDossierDeValidationPage",
        graphQLResolver(candidacyInput),
      ),
      fvae.mutation(
        "candidate_loginWithToken",
        graphQLResolver({ candidate_loginWithToken: null }),
      ),
      fvae.query(
        "activeFeaturesForConnectedUser",
        graphQLResolver({
          activeFeaturesForConnectedUser,
        }),
      ),
      fvae.mutation(
        "updateReadyForJuryEstimatedAtForDossierDeValidationPage",
        graphQLResolver(readyForJuryMutation),
      ),
    ],
    dossierDeValidationWait,
  };
};
