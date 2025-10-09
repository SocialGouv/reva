import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import { createCandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createCertificationEntity } from "@tests/helpers/entities/create-certification.entity";
import { createDematerializedFeasibilityFileEntity } from "@tests/helpers/entities/create-dematerialized-feasibility-file.entity";
import { createDossierDeValidationEntity } from "@tests/helpers/entities/create-dossier-de-validation.entity";
import { createFeasibilityEntity } from "@tests/helpers/entities/create-feasibility.entity";
import { createOrganismEntity } from "@tests/helpers/entities/create-organism.entity";
import { dashboardHandlers } from "@tests/helpers/handlers/dashboard.handler";

import {
  Candidacy,
  DematerializedFeasibilityFile,
  DossierDeValidation,
  Feasibility,
  JuryResult,
  Organism,
  TypeAccompagnement,
} from "@/graphql/generated/graphql";

const FEATURE_FLAG = ["CANDIDATE_NEXT_ACTIONS"];

const createCandidateWithGoals = (goalsCount: number) => {
  const certification = createCertificationEntity();
  const organism = createOrganismEntity() as Organism;
  const candidacy = createCandidacyEntity({
    status: "PROJET",
    certification,
    organism,
    goalsCount,
  }) as Candidacy;
  return createCandidateEntity({ candidacy });
};

const createCandidateWithGoalsAndExperiences = (
  goalsCount: number,
  experiencesCount: number,
) => {
  const certification = createCertificationEntity();
  const organism = createOrganismEntity() as Organism;
  const candidacy = createCandidacyEntity({
    status: "PROJET",
    certification,
    organism,
    goalsCount,
    experiencesCount,
  }) as Candidacy;
  return createCandidateEntity({ candidacy });
};

test.describe("Next actions tiles", () => {
  const typesAccompagnement: TypeAccompagnement[] = ["AUTONOME", "ACCOMPAGNE"];
  test.describe("ACCOMPAGNE", () => {
    test.describe("Remplir mes objectifs", () => {
      const candidate = createCandidateWithGoals(0);
      const { handlers, dashboardWait } = dashboardHandlers({
        candidate,
        activeFeaturesForConnectedUser: FEATURE_FLAG,
      });
      test.use({
        mswHandlers: [handlers, { scope: "test" }],
      });

      test("shows 'Remplir mes objectifs' when no goals", async ({ page }) => {
        await login(page);
        await dashboardWait(page);
        await expect(
          page.locator('[data-test="dashboard-sidebar"]'),
        ).toBeVisible();
        await expect(
          page.getByRole("button", { name: "Remplir mes objectifs" }),
        ).toBeVisible();
      });
    });

    test.describe("Remplir mes expériences", () => {
      const candidate = createCandidateWithGoalsAndExperiences(1, 0);
      const { handlers, dashboardWait } = dashboardHandlers({
        activeFeaturesForConnectedUser: FEATURE_FLAG,
        candidate,
      });
      test.use({
        mswHandlers: [handlers, { scope: "test" }],
      });

      test("shows 'Remplir mes expériences' when no experiences", async ({
        page,
      }) => {
        await login(page);
        await dashboardWait(page);
        await expect(
          page.getByRole("button", { name: "Remplir mes expériences" }),
        ).toBeVisible();
      });
    });

    test.describe("Choisir mon accompagnateur", () => {
      const candidacy = createCandidacyEntity({
        status: "PROJET",
        certification: createCertificationEntity(),
        goalsCount: 1,
        experiencesCount: 1,
        typeAccompagnement: "ACCOMPAGNE",
      }) as Candidacy;
      const candidate = createCandidateEntity({ candidacy });
      const { handlers, dashboardWait } = dashboardHandlers({
        candidate,
        activeFeaturesForConnectedUser: FEATURE_FLAG,
      });
      test.use({
        mswHandlers: [handlers, { scope: "test" }],
      });

      test("shows 'Choisir mon accompagnateur' when certification selected but no organism", async ({
        page,
      }) => {
        await login(page);
        await dashboardWait(page);
        await expect(
          page.getByRole("button", { name: "Choisir mon accompagnateur" }),
        ).toBeVisible();
      });
    });

    test.describe("Envoyer ma candidature", () => {
      const organism = createOrganismEntity() as Organism;
      const candidacy = createCandidacyEntity({
        status: "PROJET",
        certification: createCertificationEntity(),
        goalsCount: 1,
        experiencesCount: 1,
        organism,
      }) as Candidacy;
      const candidate = createCandidateEntity({ candidacy });
      const { handlers, dashboardWait } = dashboardHandlers({
        candidate,
        activeFeaturesForConnectedUser: FEATURE_FLAG,
      });
      test.use({
        mswHandlers: [handlers, { scope: "test" }],
      });

      test("shows 'Envoyer ma candidature' and routes to submit candidacy", async ({
        page,
      }) => {
        await login(page);
        await dashboardWait(page);
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
      const organism = createOrganismEntity() as Organism;
      const candidacy = createCandidacyEntity({
        status: "PARCOURS_ENVOYE",
        certification: createCertificationEntity(),
        goalsCount: 1,
        experiencesCount: 1,
        organism,
      }) as Candidacy;
      const candidate = createCandidateEntity({ candidacy });
      const { handlers, dashboardWait } = dashboardHandlers({
        candidate,
        activeFeaturesForConnectedUser: FEATURE_FLAG,
      });
      test.use({
        mswHandlers: [handlers, { scope: "test" }],
      });

      test("shows 'Valider mon parcours et financement' and routes", async ({
        page,
      }) => {
        await login(page);
        await dashboardWait(page);
        const btn = page.getByRole("button", {
          name: "Valider mon parcours et financement",
        });
        await expect(btn).toBeVisible();
        await btn.click();
        await expect(page).toHaveURL("/candidat/validate-training/");
      });
    });

    test.describe("Valider mon dossier de faisabilité", () => {
      const dematerializedFeasibilityFile =
        createDematerializedFeasibilityFileEntity({
          sentToCandidateAt: new Date().getTime(),
        });
      const feasibility = createFeasibilityEntity({
        dematerializedFeasibilityFile:
          dematerializedFeasibilityFile as DematerializedFeasibilityFile,
        feasibilityFileSentAt: new Date().getTime(),
      });
      const organism = createOrganismEntity() as Organism;
      const candidacy = createCandidacyEntity({
        status: "PARCOURS_CONFIRME",
        certification: createCertificationEntity(),
        goalsCount: 1,
        experiencesCount: 1,
        organism,
        candidacyAlreadySubmitted: true,
        feasibility: feasibility as Feasibility,
      }) as Candidacy;
      const candidate = createCandidateEntity({ candidacy });
      const { handlers, dashboardWait } = dashboardHandlers({
        candidate,
        activeFeaturesForConnectedUser: FEATURE_FLAG,
      });
      test.use({
        mswHandlers: [handlers, { scope: "test" }],
      });

      test("shows 'Valider mon dossier de faisabilité' and routes", async ({
        page,
      }) => {
        await login(page);
        await dashboardWait(page);
        const btn = page.getByRole("button", {
          name: "Valider mon dossier de faisabilité",
        });
        await expect(btn).toBeVisible();
        await btn.click();
        await expect(page).toHaveURL("/candidat/validate-feasibility/");
      });
    });

    test.describe("Envoyer votre attestation", () => {
      const dematerializedFeasibilityFile =
        createDematerializedFeasibilityFileEntity({
          sentToCandidateAt: new Date().getTime(),
          candidateConfirmationAt: new Date().getTime(),
        });
      const feasibility = createFeasibilityEntity({
        dematerializedFeasibilityFile:
          dematerializedFeasibilityFile as DematerializedFeasibilityFile,
        feasibilityFileSentAt: new Date().getTime(),
      });
      const organism = createOrganismEntity() as Organism;
      const candidacy = createCandidacyEntity({
        status: "PARCOURS_CONFIRME",
        certification: createCertificationEntity(),
        goalsCount: 1,
        experiencesCount: 1,
        organism,
        candidacyAlreadySubmitted: true,
        feasibility: feasibility as Feasibility,
      }) as Candidacy;
      const candidate = createCandidateEntity({ candidacy });
      const { handlers, dashboardWait } = dashboardHandlers({
        candidate,
        activeFeaturesForConnectedUser: FEATURE_FLAG,
      });
      test.use({
        mswHandlers: [handlers, { scope: "test" }],
      });

      test("shows 'Envoyer votre attestation' and opens modal on click", async ({
        page,
      }) => {
        await login(page);
        await dashboardWait(page);
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
      const candidacy = createCandidacyEntity({
        status: "PROJET",
        certification: createCertificationEntity(),
        feasibility: null,
      }) as Candidacy;
      const candidate = createCandidateEntity({ candidacy });
      const { handlers, dashboardWait } = dashboardHandlers({
        candidate,
        activeFeaturesForConnectedUser: FEATURE_FLAG,
      });
      test.use({
        mswHandlers: [handlers, { scope: "test" }],
      });

      test("shows 'Envoyer mon dossier de faisabilité' and routes", async ({
        page,
      }) => {
        await login(page);
        await dashboardWait(page);
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
          const feasibility = createFeasibilityEntity({
            decision: "ADMISSIBLE",
            feasibilityFileSentAt: new Date().getTime(),
          });
          const organism = createOrganismEntity() as Organism;
          const candidacy = createCandidacyEntity({
            status: "PROJET",
            certification: createCertificationEntity(),
            goalsCount: 1,
            experiencesCount: 1,
            typeAccompagnement,
            organism: typeAccompagnement === "AUTONOME" ? undefined : organism,
            feasibility: feasibility as Feasibility,
          }) as Candidacy;
          const candidate = createCandidateEntity({ candidacy });
          const { handlers, dashboardWait } = dashboardHandlers({
            candidate,
            activeFeaturesForConnectedUser: FEATURE_FLAG,
          });
          test.use({
            mswHandlers: [handlers, { scope: "test" }],
          });

          test("shows 'Renseigner une date prévisionnelle ...' and routes", async ({
            page,
          }) => {
            await login(page);
            await dashboardWait(page);
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
          let activeDossierDeValidation;
          if (scenario.label === "incomplete") {
            activeDossierDeValidation = createDossierDeValidationEntity({
              decision: "INCOMPLETE",
            });
          }
          const feasibility = createFeasibilityEntity({
            decision: "ADMISSIBLE",
            feasibilityFileSentAt: new Date().getTime(),
          });
          const candidacy = createCandidacyEntity({
            feasibility: feasibility as Feasibility,
            activeDossierDeValidation:
              activeDossierDeValidation as DossierDeValidation,
            juryResult:
              scenario.label === "after failed jury"
                ? scenario.juryResult
                : undefined,
          }) as Candidacy;
          const candidate = createCandidateEntity({ candidacy });
          const { handlers, dashboardWait } = dashboardHandlers({
            candidate,
            activeFeaturesForConnectedUser: FEATURE_FLAG,
          });
          test.use({
            mswHandlers: [handlers, { scope: "test" }],
          });

          test("shows 'Envoyer mon dossier de validation' and routes", async ({
            page,
          }) => {
            await login(page);
            await dashboardWait(page);
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
      const feasibility = createFeasibilityEntity({
        decision: "PENDING",
        feasibilityFileSentAt: new Date().getTime(),
      });
      const candidacy = createCandidacyEntity({
        feasibility: feasibility as Feasibility,
      }) as Candidacy;
      const candidate = createCandidateEntity({ candidacy });
      const { handlers, dashboardWait } = dashboardHandlers({
        candidate,
        activeFeaturesForConnectedUser: FEATURE_FLAG,
      });
      test.use({
        mswHandlers: [handlers, { scope: "test" }],
      });

      test("shows 'Aucune action attendue de votre part.' tile", async ({
        page,
      }) => {
        await login(page);
        await dashboardWait(page);
        await expect(
          page.locator('[data-test="no-action-tile"]'),
        ).toBeVisible();
      });
    });
  });
});
