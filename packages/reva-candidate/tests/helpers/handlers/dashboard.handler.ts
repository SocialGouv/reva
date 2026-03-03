import { graphql, type Page } from "next/experimental/testmode/playwright/msw";

import { graphQLResolver } from "../network/msw";
import { waitGraphQL } from "../network/requests";

import { createCandidaciesGuardsHandlers } from "./candidacies/candidacies-guards.handler";

import type { CandidacyEntity } from "../entities/create-candidacy.entity";

export interface DashboardHandlersOptions {
  candidacy: CandidacyEntity;
  activeFeaturesForConnectedUser?: string[];
}

const dashboardWait = async (page: Page) => {
  await Promise.all([
    waitGraphQL(page, "candidate_getCandidateForCandidatesGuard"),
    waitGraphQL(page, "getCandidateByIdForCandidateGuard"),
    waitGraphQL(
      page,
      "candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
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
      ...createCandidaciesGuardsHandlers({
        candidate: candidacy.candidate,
        candidacies: [candidacy],
        activeFeaturesForConnectedUser,
      }),
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
    ],
    dashboardWait,
  };
};
