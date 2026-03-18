import { graphql, type Page } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import { graphQLResolver } from "@tests/helpers/network/msw";
import { waitGraphQL } from "@tests/helpers/network/requests";

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
  activeFeaturesForConnectedUser = ["MULTI_CANDIDACY", "MIDDLE_NAMES"],
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
      "candidate_getCandidateForUserDropdown",
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

export function createCandidacyGuardsAndDashboardHandlers(
  candidacy: CandidacyEntity | null,
) {
  const candidacyInput = {
    getCandidacyById: candidacy,
  };

  return [
    fvae.query(
      "getCandidacyByIdForCandidacyGuard",
      graphQLResolver(candidacyInput),
    ),
    fvae.query(
      "getCandidacyByIdWithCandidate",
      graphQLResolver(candidacyInput),
    ),
    fvae.query("getCandidacyByIdForDashboard", graphQLResolver(candidacyInput)),
  ];
}

export async function loginAndWaitForCandidaciesInitialLoad(page: Page) {
  await login(page);
  await Promise.all([
    waitGraphQL(page, "candidate_getCandidateForCandidatesGuard"),
    waitGraphQL(page, "getCandidateByIdForCandidateGuard"),
    waitGraphQL(
      page,
      "candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
    ),
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
  ]);
}
