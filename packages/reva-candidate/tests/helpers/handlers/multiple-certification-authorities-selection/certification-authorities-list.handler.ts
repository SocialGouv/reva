import { graphql, Page } from "next/experimental/testmode/playwright/msw";

import { graphQLResolver } from "@tests/helpers/network/msw";
import { waitGraphQL } from "@tests/helpers/network/requests";

import type { CandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";

export async function navigateToCertificationAuthoritiesList(
  page: Page,
  candidateId: string,
  candidacyId: string,
) {
  const waitPromise = Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(
      page,
      "getCandidacyByIdForMultipleCertificationAuthoritiesListPage",
    ),
  ]);
  await page.goto(
    `candidates/${candidateId}/candidacies/${candidacyId}/multiple-certification-authorities-selection/certification-authorities-list/`,
  );
  await waitPromise;
}

export const certificationAuthoritiesListHandlers = (
  candidacy: CandidacyEntity,
) => {
  const fvae = graphql.link("https://reva-api/api/graphql");

  const candidacyInput = {
    getCandidacyById: candidacy,
  };

  return {
    handlers: [
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
        "getCandidacyByIdForMultipleCertificationAuthoritiesListPage",
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
      fvae.mutation(
        "updateCertificationAuthorityForMultipleCertificationAuthoritiesListPage",
        graphQLResolver({
          candidacy_updateCertificationAuthority: {
            id: candidacy.id,
          },
        }),
      ),
      fvae.query(
        "getCandidacyByIdForDashboard",
        graphQLResolver(candidacyInput),
      ),
      fvae.query(
        "getCandidacyByIdForCertificationAuthorityDetailsPage",
        graphQLResolver(candidacyInput),
      ),
    ],
  };
};
