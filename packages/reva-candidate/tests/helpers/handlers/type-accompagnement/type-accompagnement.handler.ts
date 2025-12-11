import { graphql, Page } from "next/experimental/testmode/playwright/msw";

import { graphQLResolver } from "@tests/helpers/network/msw";
import { waitGraphQL } from "@tests/helpers/network/requests";

import type { CandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";

export async function navigateToTypeAccompagnement(
  page: Page,
  candidateId: string,
  candidacyId: string,
) {
  const waitPromise = Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getCandidacyByIdForTypeAccompagnementPage"),
  ]);
  await page.goto(
    `candidates/${candidateId}/candidacies/${candidacyId}/type-accompagnement/`,
  );
  await waitPromise;
}

export const typeAccompagnementHandlers = (candidacy: CandidacyEntity) => {
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
        "getCandidacyByIdForTypeAccompagnementPage",
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
        "updateTypeAccompagnementForTypeAccompagnementPage",
        graphQLResolver({
          candidacy_updateTypeAccompagnement: {
            id: candidacy.id,
            typeAccompagnement: candidacy.typeAccompagnement || "AUTONOME",
          },
        }),
      ),
      fvae.query(
        "getCandidacyByIdForDashboard",
        graphQLResolver(candidacyInput),
      ),
    ],
  };
};
