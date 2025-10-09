import { graphql, Page } from "next/experimental/testmode/playwright/msw";

import readyForJuryMutation from "@tests/fixtures/candidate/dossier-de-validation/ready-for-jury-mutation.json";
import { graphQLResolver } from "@tests/helpers/network/msw";
import { waitGraphQL } from "@tests/helpers/network/requests";

import { Candidate } from "@/graphql/generated/graphql";

export async function navigateToDossierValidation(page: Page) {
  await page.goto("dossier-de-validation/");
}

export async function clickDossierTab(page: Page) {
  await page.getByRole("tab", { name: /du dossier/ }).click();
}

interface DashboardHandlersOptions {
  candidate: Candidate;
  activeFeaturesForConnectedUser?: string[];
}

const dossierDeValidationWait = async (page: Page) => {
  const featuresQuery = waitGraphQL(page, "activeFeaturesForConnectedUser");

  const dossierDeValidationQuery = waitGraphQL(
    page,
    "getCandidateWithCandidacyForDossierDeValidationPage",
  );

  await Promise.all([featuresQuery, dossierDeValidationQuery]);
};

export const dossierDeValidationHandlers = ({
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
      fvae.query(
        "getCandidateWithCandidacyForDossierDeValidationPage",
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
      fvae.mutation(
        "updateReadyForJuryEstimatedAtForDossierDeValidationPage",
        graphQLResolver(readyForJuryMutation),
      ),
    ],
    dossierDeValidationWait,
  };
};
