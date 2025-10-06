import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import { createCandidateHandlers } from "@tests/helpers/candidate/candidate";

import { JuryResult, TypeAccompagnement } from "@/graphql/generated/graphql";

const FEATURE_FLAG = ["CANDIDATE_NEXT_ACTIONS"];

test.describe("Next actions tiles", () => {
  const typesAccompagnement: TypeAccompagnement[] = ["AUTONOME", "ACCOMPAGNE"];
  test.describe("ACCOMPAGNE", () => {
    test.describe("Remplir mes objectifs", () => {
      test.use({
        mswHandlers: [
          [
            ...createCandidateHandlers({
              activeFeaturesForConnectedUser: FEATURE_FLAG,
              typeAccompagnement: "ACCOMPAGNE",
              status: "PROJET",
              goalsCount: 0,
            }),
          ],
          { scope: "test" },
        ],
      });

      test("shows 'Remplir mes objectifs' when no goals", async ({ page }) => {
        await login(page);
        await expect(
          page.locator('[data-test="dashboard-sidebar"]'),
        ).toBeVisible();
        await expect(
          page.getByRole("button", { name: "Remplir mes objectifs" }),
        ).toBeVisible();
      });
    });

    test.describe("Remplir mes expériences", () => {
      test.use({
        mswHandlers: [
          [
            ...createCandidateHandlers({
              activeFeaturesForConnectedUser: FEATURE_FLAG,
              typeAccompagnement: "ACCOMPAGNE",
              status: "PROJET",
              goalsCount: 1,
              experiencesCount: 0,
            }),
          ],
          { scope: "test" },
        ],
      });

      test("shows 'Remplir mes expériences' when no experiences", async ({
        page,
      }) => {
        await login(page);
        await expect(
          page.getByRole("button", { name: "Remplir mes expériences" }),
        ).toBeVisible();
      });
    });

    test.describe("Choisir mon accompagnateur", () => {
      test.use({
        mswHandlers: [
          [
            ...createCandidateHandlers({
              activeFeaturesForConnectedUser: FEATURE_FLAG,
              typeAccompagnement: "ACCOMPAGNE",
              status: "PROJET",
              hasSelectedCertification: true,
              hasOrganism: false,
            }),
          ],
          { scope: "test" },
        ],
      });

      test("shows 'Choisir mon accompagnateur' when certification selected but no organism", async ({
        page,
      }) => {
        await login(page);
        await expect(
          page.getByRole("button", { name: "Choisir mon accompagnateur" }),
        ).toBeVisible();
      });
    });

    test.describe("Envoyer ma candidature", () => {
      test.use({
        mswHandlers: [
          [
            ...createCandidateHandlers({
              activeFeaturesForConnectedUser: FEATURE_FLAG,
              typeAccompagnement: "ACCOMPAGNE",
              status: "PROJET",
              goalsCount: 1,
              experiencesCount: 1,
              hasOrganism: true,
              hasSelectedCertification: true,
              candidacyAlreadySubmitted: false,
            }),
          ],
          { scope: "test" },
        ],
      });

      test("shows 'Envoyer ma candidature' and routes to submit candidacy", async ({
        page,
      }) => {
        await login(page);
        const btn = page.getByRole("button", {
          name: "Envoyer ma candidature",
        });
        await expect(btn).toBeVisible();
        await btn.scrollIntoViewIfNeeded();
        await Promise.all([
          page.waitForURL("/candidat/submit-candidacy/"),
          btn.click(),
        ]);
        await expect(page).toHaveURL("/candidat/submit-candidacy/");
      });
    });

    test.describe("Valider mon parcours et financement", () => {
      test.use({
        mswHandlers: [
          [
            ...createCandidateHandlers({
              activeFeaturesForConnectedUser: FEATURE_FLAG,
              typeAccompagnement: "ACCOMPAGNE",
              status: "PARCOURS_ENVOYE",
            }),
          ],
          { scope: "test" },
        ],
      });

      test("shows 'Valider mon parcours et financement' and routes", async ({
        page,
      }) => {
        await login(page);
        const btn = page.getByRole("button", {
          name: "Valider mon parcours et financement",
        });
        await expect(btn).toBeVisible();
        await btn.click();
        await expect(page).toHaveURL("/candidat/validate-training/");
      });
    });

    test.describe("Valider mon dossier de faisabilité", () => {
      test.use({
        mswHandlers: [
          [
            ...createCandidateHandlers({
              activeFeaturesForConnectedUser: FEATURE_FLAG,
              typeAccompagnement: "ACCOMPAGNE",
              status: "PROJET",
              feasibility: {
                dematerializedFeasibilityFile: {
                  sentToCandidateAt: Date.now(),
                  candidateConfirmationAt: null,
                  swornStatementFileId: null,
                },
              },
            }),
          ],
          { scope: "test" },
        ],
      });

      test("shows 'Valider mon dossier de faisabilité' and routes", async ({
        page,
      }) => {
        await login(page);
        const btn = page.getByRole("button", {
          name: "Valider mon dossier de faisabilité",
        });
        await expect(btn).toBeVisible();
        await btn.click();
        await expect(page).toHaveURL("/candidat/validate-feasibility/");
      });
    });

    test.describe("Envoyer votre attestation", () => {
      test.use({
        mswHandlers: [
          [
            ...createCandidateHandlers({
              activeFeaturesForConnectedUser: FEATURE_FLAG,
              typeAccompagnement: "ACCOMPAGNE",
              status: "PROJET",
              feasibility: {
                feasibilityFormat: "DEMATERIALIZED",
                dematerializedFeasibilityFile: {
                  sentToCandidateAt: null,
                  candidateConfirmationAt: Date.now(),
                  swornStatementFileId: null,
                },
              },
            }),
          ],
          { scope: "test" },
        ],
      });

      test("shows 'Envoyer votre attestation' and opens modal on click", async ({
        page,
      }) => {
        await login(page);
        const btn = page.getByRole("button", {
          name: "Envoyer votre attestation",
        });
        await expect(btn).toBeVisible();
        await btn.click();
        await expect(
          page.getByRole("heading", {
            name: "Envoi de l'attestation sur l'honneur",
          }),
        ).toBeVisible();
      });
    });
  });

  test.describe("AUTONOME", () => {
    test.describe("Envoyer mon dossier de faisabilité", () => {
      test.use({
        mswHandlers: [
          [
            ...createCandidateHandlers({
              activeFeaturesForConnectedUser: FEATURE_FLAG,
              typeAccompagnement: "AUTONOME",
              status: "PROJET",
              feasibility: { feasibilityFileSentAt: null },
            }),
          ],
          { scope: "test" },
        ],
      });

      test("shows 'Envoyer mon dossier de faisabilité' and routes", async ({
        page,
      }) => {
        await login(page);
        const btn = page.getByRole("button", {
          name: "Envoyer mon dossier de faisabilité",
        });
        await expect(btn).toBeVisible();
        await Promise.all([
          page.waitForURL("/candidat/feasibility/"),
          btn.click(),
        ]);
        await expect(page).toHaveURL("/candidat/feasibility/");
      });
    });
  });

  test.describe("SHARED", () => {
    test.describe("Renseigner une date prévisionnelle de dépot de dossier de validation", () => {
      typesAccompagnement.forEach((typeAccompagnement) => {
        test.describe(`${typeAccompagnement}`, () => {
          test.use({
            mswHandlers: [
              [
                ...createCandidateHandlers({
                  activeFeaturesForConnectedUser: FEATURE_FLAG,
                  typeAccompagnement,
                  status: "PROJET",
                  feasibilityDecision: "ADMISSIBLE",
                  activeDossierDeValidationDecision: null,
                }),
              ],
              { scope: "test" },
            ],
          });

          test("shows 'Renseigner une date prévisionnelle ...' and routes", async ({
            page,
          }) => {
            await login(page);
            const btn = page.getByRole("button", {
              name: /Renseigner une date prévisionnelle/,
            });
            await expect(btn).toBeVisible();
            await btn.click();
            await expect(page).toHaveURL("/candidat/dossier-de-validation/");
          });
        });
      });
    });

    test.describe("Envoyer mon dossier de validation", () => {
      type ValidationScenario =
        | { label: "no decision"; activeDossierDeValidationDecision: null }
        | {
            label: "incomplete";
            activeDossierDeValidationDecision: "INCOMPLETE";
          }
        | { label: "after failed jury"; juryResult: JuryResult };

      const scenarios: ValidationScenario[] = [
        { label: "no decision", activeDossierDeValidationDecision: null },
        {
          label: "incomplete",
          activeDossierDeValidationDecision: "INCOMPLETE",
        },
        { label: "after failed jury", juryResult: "FAILURE" },
      ];

      scenarios.forEach((scenario) => {
        test.describe(scenario.label, () => {
          test.use({
            mswHandlers: [
              [
                ...createCandidateHandlers({
                  activeFeaturesForConnectedUser: FEATURE_FLAG,
                  typeAccompagnement: "ACCOMPAGNE",
                  status: "PROJET",
                  feasibilityDecision: "ADMISSIBLE",
                  activeDossierDeValidationDecision:
                    "activeDossierDeValidationDecision" in scenario
                      ? scenario.activeDossierDeValidationDecision
                      : undefined,
                  juryResult:
                    "juryResult" in scenario ? scenario.juryResult : undefined,
                }),
              ],
              { scope: "test" },
            ],
          });

          test("shows 'Envoyer mon dossier de validation' and routes", async ({
            page,
          }) => {
            await login(page);
            const btn = page.getByRole("button", {
              name: "Envoyer mon dossier de validation",
            });
            await expect(btn).toBeVisible();
            await btn.click();
            await expect(page).toHaveURL("/candidat/dossier-de-validation/");
          });
        });
      });
    });

    test.describe("Aucune action attendue de votre part.", () => {
      test.use({
        mswHandlers: [
          [
            ...createCandidateHandlers({
              activeFeaturesForConnectedUser: FEATURE_FLAG,
              typeAccompagnement: "ACCOMPAGNE",
              status: "PROJET",
              goalsCount: 1,
              experiencesCount: 1,
              hasOrganism: true,
              hasSelectedCertification: true,
              candidacyAlreadySubmitted: true,
              feasibility: {
                dematerializedFeasibilityFile: {
                  sentToCandidateAt: null,
                  candidateConfirmationAt: null,
                  swornStatementFileId: "file-1",
                },
              },
              activeDossierDeValidationDecision: "COMPLETE",
            }),
          ],
          { scope: "test" },
        ],
      });

      test("shows 'Aucune action attendue de votre part.' tile", async ({
        page,
      }) => {
        await login(page);
        await expect(
          page.locator('[data-test="no-action-tile"]'),
        ).toBeVisible();
      });
    });
  });
});
