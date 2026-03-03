import { graphql } from "next/experimental/testmode/playwright/msw";

import { graphQLResolver } from "@tests/helpers/network/msw";

import type { CandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import type { CandidateEntity } from "@tests/helpers/entities/create-candidate.entity";

const fvae = graphql.link("https://reva-api/api/graphql");

interface CandidaciesGuardsHandlersOptions {
  candidate?: CandidateEntity | null;
  candidacies?: CandidacyEntity[];
  activeFeaturesForConnectedUser?: string[];
}

export function createCandidaciesGuardsHandlers({
  candidate,
  candidacies = [],
  activeFeaturesForConnectedUser = ["MULTI_CANDIDACY"],
}: CandidaciesGuardsHandlersOptions) {
  return [
    fvae.query(
      "candidate_getCandidateForCandidatesGuard",
      graphQLResolver({
        candidate_getCandidateWithCandidacy: {
          ...candidate,
        },
      }),
    ),
    fvae.query(
      "getCandidateByIdForCandidateGuard",
      graphQLResolver({
        candidate_getCandidateById: {
          ...candidate,
        },
      }),
    ),
    fvae.query(
      "candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
      graphQLResolver({
        candidate_getCandidateById: {
          candidacies,
        },
      }),
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
  ];
}
