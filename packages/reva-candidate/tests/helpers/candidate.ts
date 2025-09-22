import { graphql } from "next/experimental/testmode/playwright/msw";

import dashboardQuery from "../fixtures/candidate/dashboard-query.json";
import homeQuery from "../fixtures/candidate/home-query.json";
import layoutQuery from "../fixtures/candidate/layout-query.json";

import { data } from "./msw";

const fvae = graphql.link("https://reva-api/api/graphql");

interface CreateCandidateHandlersOptions {
  activeFeaturesForConnectedUser?: string[];
}

export const createCandidateHandlers = (
  options: CreateCandidateHandlersOptions = {},
) => {
  const { activeFeaturesForConnectedUser = [] } = options;

  return [
    fvae.query(
      "candidate_getCandidateWithCandidacyForLayout",
      data(layoutQuery),
    ),

    fvae.query(
      "candidate_getCandidateWithCandidacyForDashboard",
      data(dashboardQuery),
    ),

    fvae.query("candidate_getCandidateWithCandidacyForHome", data(homeQuery)),

    fvae.mutation(
      "candidate_loginWithToken",
      data({ candidate_loginWithToken: null }),
    ),

    fvae.query(
      "activeFeaturesForConnectedUser",
      data({
        data: {
          activeFeaturesForConnectedUser,
        },
      }),
    ),
  ];
};
