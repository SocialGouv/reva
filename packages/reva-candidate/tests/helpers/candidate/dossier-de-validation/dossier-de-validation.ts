import { graphql, Page } from "next/experimental/testmode/playwright/msw";

import dossierValidationQuery from "@tests/fixtures/candidate/dossier-de-validation/dossier-de-validation-query.json";
import readyForJuryMutation from "@tests/fixtures/candidate/dossier-de-validation/ready-for-jury-mutation.json";
import { data } from "@tests/helpers/shared/msw";

import { DossierDeValidationDecision } from "@/graphql/generated/graphql";

export interface DossierDeValidationFixture {
  id: string;
  decision: DossierDeValidationDecision;
  decisionSentAt?: number;
  decisionComment?: string;
  dossierDeValidationSentAt: number;
  dossierDeValidationFile: {
    name: string;
    previewUrl?: string | null;
  };
  dossierDeValidationOtherFiles: Array<{
    name: string;
    previewUrl?: string | null;
  }>;
  history: Array<{
    id: string;
    decisionSentAt?: number;
    decisionComment?: string;
  }>;
}

export const createDossierValidationHandlers = () => {
  const fvae = graphql.link("https://reva-api/api/graphql");

  return [
    fvae.query(
      "getCandidateWithCandidacyForDossierDeValidationPage",
      data(dossierValidationQuery),
    ),
    fvae.mutation(
      "updateReadyForJuryEstimatedAtForDossierDeValidationPage",
      data(readyForJuryMutation),
    ),
  ];
};

export async function navigateToDossierValidation(page: Page) {
  await page.goto("dossier-de-validation/");
}

export async function clickDossierTab(page: Page) {
  await page.getByRole("tab", { name: /du dossier/ }).click();
}
