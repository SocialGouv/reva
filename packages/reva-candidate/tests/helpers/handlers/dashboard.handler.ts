import { graphql, Page } from "next/experimental/testmode/playwright/msw";

import { Candidate } from "@/graphql/generated/graphql";

import { graphQLResolver } from "../network/msw";
import { waitGraphQL } from "../network/requests";
interface DashboardHandlersOptions {
  candidate: Candidate;
  activeFeaturesForConnectedUser?: string[];
}

const dashboardWait = async (page: Page) => {
  const dashboardMutation = waitGraphQL(
    page,
    "candidate_getCandidateWithCandidacyForDashboard",
  );
  const featuresMutation = waitGraphQL(page, "activeFeaturesForConnectedUser");
  const layoutMutation = waitGraphQL(
    page,
    "candidate_getCandidateWithCandidacyForLayout",
  );
  const homeMutation = waitGraphQL(
    page,
    "candidate_getCandidateWithCandidacyForHome",
  );

  await Promise.all([
    dashboardMutation,
    featuresMutation,
    layoutMutation,
    homeMutation,
  ]);
};

export const dashboardHandlers = ({
  candidate,
  activeFeaturesForConnectedUser = [],
}: DashboardHandlersOptions) => {
  const fvae = graphql.link("https://reva-api/api/graphql");

  const candidacyInput = {
    candidate_getCandidateWithCandidacy: candidate,
  };

  return {
    handlers: [
      fvae.query(
        "candidate_getCandidateWithCandidacyForLayout",
        graphQLResolver(candidacyInput),
      ),
      fvae.query(
        "candidate_getCandidateWithCandidacyForDashboard",
        graphQLResolver(candidacyInput),
      ),
      fvae.query(
        "candidate_getCandidateWithCandidacyForHome",
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
