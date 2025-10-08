import { graphql, Page } from "next/experimental/testmode/playwright/msw";

import { Candidacy } from "@/graphql/generated/graphql";

import { graphQLResolver } from "../network/msw";
import { waitGraphQL } from "../network/requests";
interface DashboardHandlersOptions {
  candidacy: Partial<Candidacy>;
  activeFeaturesForConnectedUser?: string[];
}

const dashboardWait = async (page: Page) => {
  await Promise.all([
    waitGraphQL(
      page,
      "candidate_getCandidateWithCandidaciesForCandidaciesGuard",
    ),
    waitGraphQL(page, "getCandidacyByIdForCandidacyGuard"),
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getCandidacyByIdWithCandidate"),
    waitGraphQL(page, "getCandidacyByIdForDashboard"),
  ]);
};

export const dashboardHandlers = ({
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
        "candidate_getCandidateWithCandidaciesForCandidaciesGuard",
        graphQLResolver({
          candidate_getCandidateWithCandidacy: {
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
    ],
    dashboardWait,
  };
};
