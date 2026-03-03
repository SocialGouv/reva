import { graphql, type Page } from "next/experimental/testmode/playwright/msw";

import { graphQLResolver } from "@tests/helpers/network/msw";
import { waitGraphQL } from "@tests/helpers/network/requests";

import {
  createCandidaciesGuardsHandlers,
  createCandidacyGuardsAndDashboardHandlers,
} from "../candidacies/candidacies-guards.handler";

import type { CandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";

export async function navigateToValidateTraining(
  page: Page,
  candidateId: string,
  candidacyId: string,
) {
  await page.goto(
    `candidates/${candidateId}/candidacies/${candidacyId}/validate-training/`,
  );
}

const validateTrainingWait = async (page: Page) => {
  await Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getCandidacyByIdForValidateTraining"),
  ]);
};

export const validateTrainingHandlers = (candidacy: CandidacyEntity) => {
  const fvae = graphql.link("https://reva-api/api/graphql");

  const candidacyInput = {
    getCandidacyById: candidacy,
  };

  return {
    handlers: [
      ...createCandidaciesGuardsHandlers({
        candidate: candidacy.candidate,
        candidacies: [candidacy],
        activeFeaturesForConnectedUser: [],
      }),
      ...createCandidacyGuardsAndDashboardHandlers(candidacy),
      fvae.query(
        "getCandidacyByIdForValidateTraining",
        graphQLResolver(candidacyInput),
      ),
      fvae.mutation(
        "training_confirmTrainingForm",
        graphQLResolver({
          training_confirmTrainingForm: {
            id: candidacy.id,
            createdAt: Date.now(),
          },
        }),
      ),
    ],
    validateTrainingWait,
  };
};
