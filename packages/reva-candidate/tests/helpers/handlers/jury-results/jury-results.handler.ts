import { graphql, type Page } from "next/experimental/testmode/playwright/msw";

import { graphQLResolver } from "@tests/helpers/network/msw";
import { waitGraphQL } from "@tests/helpers/network/requests";

import {
  createCandidaciesGuardsHandlers,
  createCandidacyGuardsAndDashboardHandlers,
} from "../candidacies/candidacies-guards.handler";

import type { CandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";

export async function navigateToJuryResults(
  page: Page,
  candidateId: string,
  candidacyId: string,
) {
  await page.goto(
    `candidates/${candidateId}/candidacies/${candidacyId}/jury-results/`,
  );
}

interface JuryResultsHandlersOptions {
  candidacy: CandidacyEntity;
  activeFeaturesForConnectedUser?: string[];
}

const juryResultsWait = async (page: Page) => {
  await Promise.all([
    waitGraphQL(page, "getCandidacyByIdForCandidacyGuard"),
    waitGraphQL(page, "getCandidacyByIdForJuryResult"),
  ]);
};

export const juryResultsHandlers = ({
  candidacy,
  activeFeaturesForConnectedUser = ["JURY_RESULTS_BY_BLOCK"],
}: JuryResultsHandlersOptions) => {
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
      ...createCandidacyGuardsAndDashboardHandlers(candidacy),
      fvae.query(
        "getCandidacyByIdForJuryResult",
        graphQLResolver(candidacyInput),
      ),
    ],
    juryResultsWait,
  };
};
