import { graphql, Page } from "next/experimental/testmode/playwright/msw";

import { graphQLResolver } from "../../network/msw";
import { waitGraphQL } from "../../network/requests";

import type { CandidacyEntity } from "../../entities/create-candidacy.entity";

interface DossierDeFaisabiliteHandlersOptions {
  candidacy: CandidacyEntity;
}

const dossierDeFaisabiliteWait = async (page: Page) => {
  await Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getCandidacyByIdForFeasibilityPage"),
  ]);
};

export const navigateToDossierDeFaisabilite = async (
  page: Page,
  candidateId?: string,
  candidacyId?: string,
) => {
  await page.goto(
    `candidates/${candidateId}/candidacies/${candidacyId}/feasibility/`,
  );
};

export const dossierDeFaisabiliteHandlers = ({
  candidacy,
}: DossierDeFaisabiliteHandlersOptions) => {
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
        "getCandidacyByIdForFeasibilityPage",
        graphQLResolver(candidacyInput),
      ),
      fvae.mutation(
        "candidate_loginWithToken",
        graphQLResolver({ candidate_loginWithToken: null }),
      ),
      fvae.query(
        "activeFeaturesForConnectedUser",
        graphQLResolver({
          activeFeaturesForConnectedUser: [],
        }),
      ),
    ],
    dossierDeFaisabiliteWait,
  };
};
