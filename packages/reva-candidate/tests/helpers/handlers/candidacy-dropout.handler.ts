import { graphql } from "next/experimental/testmode/playwright/msw";

import { graphQLResolver } from "@tests/helpers/network/msw";

import {
  createCandidaciesGuardsHandlers,
  createCandidacyGuardsAndDashboardHandlers,
} from "./candidacies/candidacies-guards.handler";

import type { CandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";

interface CandidacyDropOutHandlersOptions {
  candidacy: CandidacyEntity;
  activeFeaturesForConnectedUser?: string[];
}

const fvae = graphql.link("https://reva-api/api/graphql");

export const candidacyDropOutHandlers = ({
  candidacy,
  activeFeaturesForConnectedUser = [],
}: CandidacyDropOutHandlersOptions) => [
  ...createCandidaciesGuardsHandlers({
    candidate: candidacy.candidate,
    candidacies: [candidacy],
    activeFeaturesForConnectedUser,
  }),
  ...createCandidacyGuardsAndDashboardHandlers(candidacy),
  fvae.query(
    "getCandidacyByIdWithCandidateForDropOutDecision",
    graphQLResolver({ getCandidacyById: candidacy }),
  ),
  fvae.mutation(
    "updateCandidateCandidacyDropoutDecision",
    graphQLResolver({
      candidacy_updateCandidateCandidacyDropoutDecision: {
        id: candidacy.id,
      },
    }),
  ),
];
