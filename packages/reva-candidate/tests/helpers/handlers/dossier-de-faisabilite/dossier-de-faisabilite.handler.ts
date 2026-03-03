import { graphql, type Page } from "next/experimental/testmode/playwright/msw";

import { graphQLResolver } from "../../network/msw";
import { waitGraphQL } from "../../network/requests";
import {
  createCandidaciesGuardsHandlers,
  createCandidacyGuardsAndDashboardHandlers,
} from "../candidacies/candidacies-guards.handler";

import type { CandidacyEntity } from "../../entities/create-candidacy.entity";

interface DossierDeFaisabiliteHandlersOptions {
  candidacy: CandidacyEntity;
}

const dossierDeFaisabiliteWait = async (page: Page) => {
  await Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getCandidacyByIdForFeasibilityPage"),
  ]);
};

export const navigateToDossierDeFaisabilite = async (
  page: Page,
  candidateId?: string,
  candidacyId?: string,
) => {
  await page.goto(
    `candidates/${candidateId}/candidacies/${candidacyId}/feasibility/`,
  );
};

export const dossierDeFaisabiliteHandlers = ({
  candidacy,
}: DossierDeFaisabiliteHandlersOptions) => {
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
        "getCandidacyByIdForFeasibilityPage",
        graphQLResolver(candidacyInput),
      ),
    ],
    dossierDeFaisabiliteWait,
  };
};
