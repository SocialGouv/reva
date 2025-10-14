import { graphql, Page } from "next/experimental/testmode/playwright/msw";

import { graphQLResolver } from "@tests/helpers/network/msw";
import type { CandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import { waitGraphQL } from "@tests/helpers/network/requests";

import { Candidacy } from "@/graphql/generated/graphql";

interface EndAccompagnementHandlersOptions {
  candidacy: CandidacyEntity;
  activeFeaturesForConnectedUser?: string[];
}

const endAccompagnementWait = async (page: Page) => {
  await Promise.all([
    waitGraphQL(
      page,
      "candidate_getCandidateWithCandidaciesForCandidaciesGuard",
    ),
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getCandidacyByIdWithCandidateForHeader"),
    waitGraphQL(page, "getCandidacyByIdForCandidacyGuard"),
  ]);
};

export const endAccompagnementHandlers = ({
  candidacy,
  activeFeaturesForConnectedUser = [],
}: EndAccompagnementHandlersOptions) => {
  const fvae = graphql.link("https://reva-api/api/graphql");

  const candidacyInput = {
    getCandidacyById: candidacy,
  };

  return {
    handlers: [
      fvae.query(
        "candidate_getCandidateWithCandidaciesForCandidaciesGuard",
        graphQLResolver({
          candidate_getCandidateWithCandidacy: {
            candidacies: [candidacy],
          },
        }),
      ),
      fvae.query(
        "getCandidacyByIdWithCandidateForHeader",
        graphQLResolver(candidacyInput),
      ),
      fvae.query(
        "getCandidacyByIdForCandidacyGuard",
        graphQLResolver(candidacyInput),
      ),
      fvae.query(
        "getCandidacyByIdWithCandidateForEndAccompagnement",
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
      fvae.query(
        "getCandidacyByIdForDashboard",
        graphQLResolver(candidacyInput),
      ),
      fvae.query(
        "getCandidacyByIdWithCandidate",
        graphQLResolver(candidacyInput),
      ),
      fvae.mutation(
        "candidacy_updateCandidacyEndAccompagnementDecision",
        graphQLResolver({
          candidacy_updateCandidacyEndAccompagnementDecision: {
            id: candidacy.id || "1",
          },
        }),
      ),
    ],
    endAccompagnementWait,
  };
};
