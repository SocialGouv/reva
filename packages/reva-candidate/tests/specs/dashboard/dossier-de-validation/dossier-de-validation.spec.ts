import { addDays, addMonths, format } from "date-fns";
import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import {
  createCandidacyEntity,
  type CandidacyEntity,
  type CreateCandidacyEntityOptions,
} from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createCertificationEntity } from "@tests/helpers/entities/create-certification.entity";
import { createFeasibilityEntity } from "@tests/helpers/entities/create-feasibility.entity";
import { createJuryEntity } from "@tests/helpers/entities/create-jury.entity";
import { createOrganismEntity } from "@tests/helpers/entities/create-organism.entity";
import { dashboardHandlers } from "@tests/helpers/handlers/dashboard.handler";
import {
  clickDossierTab,
  dossierDeValidationHandlers,
  navigateToDossierValidation,
} from "@tests/helpers/handlers/dossier-de-validation/dossier-de-validation.handler";
import {
  mockDossierValidationUpload,
  uploadFile,
} from "@tests/helpers/handlers/dossier-de-validation/upload";
import { waitGraphQL, waitRest } from "@tests/helpers/network/requests";

import { JuryResult, TypeAccompagnement } from "@/graphql/generated/graphql";

import type { MswFixture } from "next/experimental/testmode/playwright/msw";

const DATE_NOW = new Date();
const ESTIMATED_DATE = addMonths(DATE_NOW, 10);
const typesAccompagnement: TypeAccompagnement[] = ["AUTONOME", "ACCOMPAGNE"];

function createCommonEntities(typeAccompagnement: TypeAccompagnement) {
  const certification = createCertificationEntity();
  const candidate = createCandidateEntity();
  const organism =
    typeAccompagnement === "ACCOMPAGNE" ? createOrganismEntity() : undefined;

  return { certification, candidate, organism };
}

function createCandidacyFor(
  typeAccompagnement: TypeAccompagnement,
  overrides: CreateCandidacyEntityOptions = {},
): CandidacyEntity {
  const { certification, candidate, organism } =
    createCommonEntities(typeAccompagnement);

  return createCandidacyEntity({
    certification,
    candidate,
    organism,
    typeAccompagnement,
    ...overrides,
  });
}

function createAdmissibleFeasibility() {
  return createFeasibilityEntity({
    decision: "ADMISSIBLE",
    feasibilityFileSentAt: Date.now(),
  });
}

function useDashboardScenario(msw: MswFixture, candidacy: CandidacyEntity) {
  const { handlers, dashboardWait } = dashboardHandlers({ candidacy });
  msw.use(...handlers);

  return { dashboardWait };
}

function useDossierScenario(msw: MswFixture, candidacy: CandidacyEntity) {
  const { handlers, dossierDeValidationWait } = dossierDeValidationHandlers({
    candidacy,
  });
  msw.use(...handlers);

  return { dossierDeValidationWait };
}

typesAccompagnement.forEach((typeAccompagnement) => {
  test.describe(`${typeAccompagnement} - Dossier de validation`, () => {
    test("should show an inactive dossier de validation element in the dashboard when the candidacy status is 'PROJET'", async ({
      page,
      msw,
    }) => {
      const candidacy = createCandidacyFor(typeAccompagnement, {
        status: "PROJET",
      });
      const { dashboardWait } = useDashboardScenario(msw, candidacy);

      await login(page);
      await dashboardWait(page);

      const dossierValidationButton = page
        .locator('[data-testid="dossier-validation-tile"]')
        .getByRole("button");

      await expect(dossierValidationButton).toBeVisible();
      await expect(dossierValidationButton).toBeDisabled();
    });

    test("should show an active dossier de validation element in the dashboard when the candidacy status is 'DOSSIER_FAISABILITE_RECEVABLE' and route to the dossier de validation page when clicked on", async ({
      page,
      msw,
    }) => {
      const candidacy = createCandidacyFor(typeAccompagnement, {
        status: "DOSSIER_FAISABILITE_RECEVABLE",
        feasibility: createAdmissibleFeasibility(),
      });
      const { dashboardWait } = useDashboardScenario(msw, candidacy);

      await login(page);
      await dashboardWait(page);

      const dossierValidationButton = page
        .locator('[data-testid="dossier-validation-tile"]')
        .getByRole("button");
      await expect(dossierValidationButton).not.toBeDisabled();

      await dossierValidationButton.click();
      await expect(page).toHaveURL(
        `/candidat/candidates/${candidacy.candidate?.id}/candidacies/${candidacy.id}/dossier-de-validation/`,
      );
    });

    test("should let me change the readyForJuryEstimatedAt date", async ({
      page,
      msw,
    }) => {
      const candidacy = createCandidacyFor(typeAccompagnement, {
        status: "DOSSIER_FAISABILITE_RECEVABLE",
        feasibility: createAdmissibleFeasibility(),
      });
      const { dossierDeValidationWait } = useDossierScenario(msw, candidacy);

      await login(page);
      await navigateToDossierValidation(
        page,
        candidacy.candidate?.id,
        candidacy.id,
      );
      await dossierDeValidationWait(page);

      const dateInput = page.locator(
        '[data-testid="ready-for-jury-estimated-date-input"]',
      );
      await dateInput
        .getByRole("textbox")
        .fill(format(ESTIMATED_DATE, "yyyy-MM-dd"));

      const submitButton = page.locator(
        '[data-testid="submit-ready-for-jury-estimated-date-form-button"]',
      );

      const updateJuryDateMutation = waitGraphQL(
        page,
        "updateReadyForJuryEstimatedAtForDossierDeValidationPage",
      );
      await submitButton.click();
      await updateJuryDateMutation;
    });

    test("should display error message on first click when trying to submit without file", async ({
      page,
      msw,
    }) => {
      const candidacy = createCandidacyFor(typeAccompagnement, {
        status: "DOSSIER_FAISABILITE_RECEVABLE",
        feasibility: createAdmissibleFeasibility(),
      });
      const { dossierDeValidationWait } = useDossierScenario(msw, candidacy);

      await login(page);
      await navigateToDossierValidation(
        page,
        candidacy.candidate?.id,
        candidacy.id,
      );
      await dossierDeValidationWait(page);
      await clickDossierTab(page);

      const checkboxGroup = page.locator(
        '[data-testid="dossier-de-validation-checkbox-group"]',
      );
      const labels = checkboxGroup.locator("label");
      const count = await labels.count();
      for (let i = 0; i < count; i++) {
        const label = labels.nth(i);
        await label.scrollIntoViewIfNeeded();
        await expect(label).toBeVisible();
        await label.click();
      }
      await page
        .locator('[data-testid="submit-dossier-de-validation-form-button"]')
        .click();

      const errorText = page.locator(
        ".dossier-de-validation-file-upload .fr-error-text",
      );
      await expect(errorText).toBeVisible();
      await expect(errorText).toContainText(
        "Vous devez sélectionner un fichier à transmettre.",
      );

      const errorGroup = page.locator(
        ".dossier-de-validation-file-upload .fr-input-group--error",
      );
      await expect(errorGroup).toBeVisible();
    });

    test("should let me send a dossier de validation", async ({
      page,
      msw,
    }) => {
      const candidacy = createCandidacyFor(typeAccompagnement, {
        status: "DOSSIER_FAISABILITE_RECEVABLE",
        feasibility: createAdmissibleFeasibility(),
      });
      const { dossierDeValidationWait } = useDossierScenario(msw, candidacy);

      await mockDossierValidationUpload(page);

      await login(page);
      await navigateToDossierValidation(
        page,
        candidacy.candidate?.id,
        candidacy.id,
      );
      await dossierDeValidationWait(page);
      await clickDossierTab(page);

      await uploadFile(
        page,
        ".dossier-de-validation-file-upload > .fr-upload-group > input",
        "file.pdf",
        "file contents",
      );

      const checkboxGroup = page.locator(
        '[data-testid="dossier-de-validation-checkbox-group"]',
      );
      const labels = checkboxGroup.locator("label");
      const count = await labels.count();
      for (let i = 0; i < count; i++) {
        await labels.nth(i).click();
      }

      const uploadRequest = waitRest(page, "upload-dossier-de-validation");
      await page
        .locator('[data-testid="submit-dossier-de-validation-form-button"]')
        .click();
      await uploadRequest;

      await expect(page).toHaveURL(
        `/candidat/candidates/${candidacy.candidate?.id}/candidacies/${candidacy.id}/`,
      );
    });

    test("should let me add and remove additional attachments", async ({
      page,
      msw,
    }) => {
      const candidacy = createCandidacyFor(typeAccompagnement, {
        status: "DOSSIER_FAISABILITE_RECEVABLE",
        feasibility: createAdmissibleFeasibility(),
      });
      const { dossierDeValidationWait } = useDossierScenario(msw, candidacy);

      await login(page);
      await navigateToDossierValidation(
        page,
        candidacy.candidate?.id,
        candidacy.id,
      );
      await dossierDeValidationWait(page);
      await clickDossierTab(page);

      await expect(
        page.locator('input[name^="dossierDeValidationOtherFiles"]'),
      ).toHaveCount(0);

      await page
        .getByRole("button", {
          name: "Ajouter une pièce jointe supplémentaire",
        })
        .click();
      await expect(
        page.locator('input[name="dossierDeValidationOtherFiles.0"]'),
      ).toBeVisible();

      await uploadFile(
        page,
        'input[name="dossierDeValidationOtherFiles.0"]',
        "additional1.pdf",
        "additional file 1",
      );

      await page
        .getByRole("button", {
          name: "Ajouter une pièce jointe supplémentaire",
        })
        .click();
      await expect(
        page.locator('input[name="dossierDeValidationOtherFiles.1"]'),
      ).toBeVisible();

      await uploadFile(
        page,
        'input[name="dossierDeValidationOtherFiles.1"]',
        "additional2.jpg",
        "additional file 2",
      );

      await expect(
        page.locator('input[name="dossierDeValidationOtherFiles.0"]'),
      ).toBeVisible();
      await expect(
        page.locator('input[name="dossierDeValidationOtherFiles.1"]'),
      ).toBeVisible();

      await page
        .locator('input[name="dossierDeValidationOtherFiles.0"]')
        .locator("..")
        .getByRole("button", { name: "Supprimer" })
        .click();

      await expect(
        page.locator('input[name="dossierDeValidationOtherFiles.0"]'),
      ).toBeVisible();
      await expect(
        page.locator('input[name="dossierDeValidationOtherFiles.1"]'),
      ).toHaveCount(0);

      await page
        .locator('input[name="dossierDeValidationOtherFiles.0"]')
        .locator("..")
        .getByRole("button", { name: "Supprimer" })
        .click();

      await expect(
        page.locator('input[name^="dossierDeValidationOtherFiles"]'),
      ).toHaveCount(0);
    });

    test.describe("Incomplete dossier de validation", () => {
      test(`should show a 'to complete' badge and a warning in the dashboard for ${typeAccompagnement}`, async ({
        page,
        msw,
      }) => {
        const candidacy = createCandidacyFor(typeAccompagnement, {
          status: "DOSSIER_DE_VALIDATION_SIGNALE",
          activeDossierDeValidation: {
            dossierDeValidationOtherFiles: [],
            decision: "INCOMPLETE",
          },
        });
        const { dashboardWait } = useDashboardScenario(msw, candidacy);

        await login(page);
        await dashboardWait(page);

        await expect(
          page
            .locator('[data-testid="dossier-validation-tile"]')
            .getByRole("button"),
        ).toBeVisible();
        await expect(
          page.locator('[data-testid="incomplete-dv-banner"]'),
        ).toBeVisible();
      });

      test(`should show a 'dossier de validation signalé' alert with date and reason if i open a signaled dossier de validation for ${typeAccompagnement}`, async ({
        page,
        msw,
      }) => {
        const signalDate = new Date("2025-09-01");
        const signalReason = "Le dossier de validation est illisible.";

        const candidacy = createCandidacyFor(typeAccompagnement, {
          status: "DOSSIER_DE_VALIDATION_SIGNALE",
          feasibility: createAdmissibleFeasibility(),
          activeDossierDeValidation: {
            dossierDeValidationOtherFiles: [],
            decision: "INCOMPLETE",
            decisionSentAt: signalDate.getTime(),
            decisionComment: signalReason,
          },
        });
        const { dossierDeValidationWait } = useDossierScenario(msw, candidacy);

        await login(page);
        await navigateToDossierValidation(
          page,
          candidacy.candidate?.id,
          candidacy.id,
        );
        await dossierDeValidationWait(page);
        await clickDossierTab(page);

        const alert = page.locator(
          '[data-testid="dossier-de-validation-signale-alert"]',
        );
        await expect(alert).toBeVisible();
        await expect(alert.locator(".fr-alert__title")).toContainText(
          "Dossier de validation signalé par le certificateur le 01/09/2025",
        );
        await expect(alert).toContainText("Motif du signalement :");
        await expect(alert).toContainText(signalReason);
      });

      test(`should show accordion with previous dossiers when there are multiple signalements for ${typeAccompagnement}`, async ({
        page,
        msw,
      }) => {
        const currentSignalDate = new Date("2024-03-20");
        const currentSignalReason = "Dernier commentaire";
        const previousSignalDate1 = new Date("2024-02-10");
        const previousSignalReason1 = "Premier commentaire";
        const previousSignalDate2 = new Date("2024-01-05");
        const previousSignalReason2 = "Deuxième commentaire";

        const candidacy = createCandidacyFor(typeAccompagnement, {
          status: "DOSSIER_DE_VALIDATION_SIGNALE",
          feasibility: createAdmissibleFeasibility(),
          activeDossierDeValidation: {
            dossierDeValidationOtherFiles: [],
            decision: "INCOMPLETE",
            decisionSentAt: currentSignalDate.getTime(),
            decisionComment: currentSignalReason,
            history: [
              {
                id: "history-1",
                decisionSentAt: previousSignalDate1.getTime(),
                decisionComment: previousSignalReason1,
              },
              {
                id: "history-2",
                decisionSentAt: previousSignalDate2.getTime(),
                decisionComment: previousSignalReason2,
              },
            ],
          },
        });
        const { dossierDeValidationWait } = useDossierScenario(msw, candidacy);

        await login(page);
        await navigateToDossierValidation(
          page,
          candidacy.candidate?.id,
          candidacy.id,
        );
        await dossierDeValidationWait(page);
        await clickDossierTab(page);

        await expect(
          page.locator('[data-testid="dossier-de-validation-signale-alert"]'),
        ).toBeVisible();

        const accordion = page.locator(".fr-accordion");
        await expect(accordion).toContainText(
          "Voir les anciens dossiers de validation",
        );
        await accordion.locator(".fr-accordion__btn").click();

        const collapse = page.locator(".fr-accordion .fr-collapse");
        await expect(collapse).toContainText("Dossier signalé le 10/02/2024");
        await expect(collapse).toContainText(previousSignalReason1);
        await expect(collapse).toContainText("Dossier signalé le 05/01/2024");
        await expect(collapse).toContainText(previousSignalReason2);
      });
    });

    test.describe("Failed jury result", () => {
      const failedJuryResults: JuryResult[] = [
        "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
        "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
        "PARTIAL_SUCCESS_PENDING_CONFIRMATION",
        "FAILURE",
        "CANDIDATE_EXCUSED",
        "CANDIDATE_ABSENT",
      ];

      failedJuryResults.forEach((result) => {
        test(`should display certificateur comment and date when jury has a ${result} for ${typeAccompagnement}`, async ({
          page,
          msw,
        }) => {
          const informationOfResult = "Lorem ipsum failorum";
          const dateOfSession = addDays(DATE_NOW, -30);
          const dateOfResult = addDays(DATE_NOW, -30);

          const candidacy = createCandidacyFor(typeAccompagnement, {
            status: "DOSSIER_DE_VALIDATION_ENVOYE",
            jury: createJuryEntity({
              result,
              informationOfResult,
              dateOfResult: dateOfResult.getTime(),
              dateOfSession: dateOfSession.getTime(),
            }),
            activeDossierDeValidation: {
              dossierDeValidationOtherFiles: [],
            },
          });
          const { dossierDeValidationWait } = useDossierScenario(
            msw,
            candidacy,
          );

          await login(page);
          await navigateToDossierValidation(
            page,
            candidacy.candidate?.id,
            candidacy.id,
          );
          await dossierDeValidationWait(page);
          await clickDossierTab(page);

          const alertTitle = page.locator(".fr-alert--info .fr-alert__title");
          await expect(alertTitle).toContainText(
            format(dateOfResult, "dd/MM/yyyy"),
          );

          const alert = page.locator(".fr-alert--info");
          await expect(alert).toContainText(informationOfResult);
        });
      });

      test(`should not display certificateur info when jury is FULL_SUCCESS_OF_FULL_CERTIFICATION for ${typeAccompagnement}`, async ({
        page,
        msw,
      }) => {
        const informationOfResult = "Lorem ipsum";
        const dateOfSession = addDays(DATE_NOW, -30);
        const dateOfResult = addDays(DATE_NOW, -30);

        const candidacy = createCandidacyFor(typeAccompagnement, {
          status: "DOSSIER_DE_VALIDATION_ENVOYE",
          jury: createJuryEntity({
            result: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
            informationOfResult,
            dateOfResult: dateOfResult.getTime(),
            dateOfSession: dateOfSession.getTime(),
          }),
          activeDossierDeValidation: {
            dossierDeValidationOtherFiles: [],
          },
        });
        const { dossierDeValidationWait } = useDossierScenario(msw, candidacy);

        await login(page);
        await navigateToDossierValidation(
          page,
          candidacy.candidate?.id,
          candidacy.id,
        );
        await dossierDeValidationWait(page);
        await clickDossierTab(page);

        const alert = page.locator(".fr-alert--info");
        await expect(alert).not.toBeVisible();
      });

      failedJuryResults.forEach((juryResult) => {
        test(`should show active dossier de validation when jury result is ${juryResult} for ${typeAccompagnement}`, async ({
          page,
          msw,
        }) => {
          const candidacy = createCandidacyFor(typeAccompagnement, {
            jury: createJuryEntity({ result: juryResult }),
          });
          const { dashboardWait } = useDashboardScenario(msw, candidacy);

          await login(page);
          await dashboardWait(page);

          const dossierValidationButton = page
            .locator('[data-testid="dossier-validation-tile"]')
            .getByRole("button");
          await expect(dossierValidationButton).not.toBeDisabled();

          const badge = page.locator(
            '[data-testid="dossier-validation-badge-to-send"]',
          );
          await expect(badge).toBeVisible();
        });
      });

      test(`should display accordion with the last submitted dossier when jury has failed and only the last one for ${typeAccompagnement}`, async ({
        page,
        msw,
      }) => {
        const dateOfSession = addDays(DATE_NOW, -30);
        const dateOfResult = addDays(DATE_NOW, -30);
        const dossierSentDate = addDays(DATE_NOW, -45);
        const informationOfResult = "Lorem ipsum failorum";

        const incompleteDV1Date = addDays(DATE_NOW, -120);
        const incompleteDV2Date = addDays(DATE_NOW, -90);

        const candidacy = createCandidacyFor(typeAccompagnement, {
          status: "DOSSIER_DE_VALIDATION_ENVOYE",
          jury: createJuryEntity({
            result: "FAILURE",
            informationOfResult,
            dateOfResult: dateOfResult.getTime(),
            dateOfSession: dateOfSession.getTime(),
          }),
          activeDossierDeValidation: {
            dossierDeValidationSentAt: dossierSentDate.getTime(),
            dossierDeValidationFile: {
              name: "dossier-validation-final.pdf",
              previewUrl: "https://example.com/dossier-final.pdf",
              mimeType: "application/pdf",
              url: "https://example.com/dossier-final.pdf",
            },
            dossierDeValidationOtherFiles: [
              {
                name: "annexe1.pdf",
                previewUrl: "https://example.com/annexe1.pdf",
              },
              {
                name: "annexe2.jpg",
                previewUrl: "https://example.com/annexe2.jpg",
              },
            ],
            history: [
              {
                id: "dossier-incomplete-1",
                decisionSentAt: incompleteDV1Date.getTime(),
                decisionComment: "comment 1",
              },
              {
                id: "dossier-incomplete-2",
                decisionSentAt: incompleteDV2Date.getTime(),
                decisionComment: "comment 2",
              },
            ],
          },
        });
        const { dossierDeValidationWait } = useDossierScenario(msw, candidacy);

        await login(page);
        await navigateToDossierValidation(
          page,
          candidacy.candidate?.id,
          candidacy.id,
        );
        await dossierDeValidationWait(page);
        await clickDossierTab(page);

        const accordion = page.locator(".fr-accordion");
        await expect(accordion).toContainText(
          "Voir le dernier dossier soutenu devant le jury",
        );

        await accordion.locator(".fr-accordion__btn").click();

        const collapse = page.locator(".fr-accordion .fr-collapse");
        await expect(collapse).toContainText(
          `Dossier déposé le ${format(dossierSentDate, "dd/MM/yyyy")}`,
        );
        await expect(collapse).toContainText("Soutenu devant le jury le :");
        await expect(collapse).toContainText(
          format(dateOfResult, "dd/MM/yyyy"),
        );
        await expect(collapse).toContainText("Contenu du dossier :");
        await expect(collapse).toContainText("dossier-validation-final.pdf");
        await expect(collapse).toContainText("annexe1.pdf");
        await expect(collapse).toContainText("annexe2.jpg");

        const collapses = page.locator(".fr-accordion .fr-collapse");
        await expect(collapses).toHaveCount(1);
      });

      test(`should not display accordion when jury has failed result but no dossier was sent for ${typeAccompagnement}`, async ({
        page,
        msw,
      }) => {
        const dateOfSession = addDays(DATE_NOW, -30);
        const dateOfResult = addDays(DATE_NOW, -30);

        const candidacy = createCandidacyFor(typeAccompagnement, {
          status: "DOSSIER_DE_VALIDATION_ENVOYE",
          jury: createJuryEntity({
            result: "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
            informationOfResult: "Partial success",
            dateOfResult: dateOfResult.getTime(),
            dateOfSession: dateOfSession.getTime(),
          }),
          activeDossierDeValidation: {
            dossierDeValidationOtherFiles: [],
          },
        });
        const { dossierDeValidationWait } = useDossierScenario(msw, candidacy);

        await login(page);
        await navigateToDossierValidation(
          page,
          candidacy.candidate?.id,
          candidacy.id,
        );
        await dossierDeValidationWait(page);
        await clickDossierTab(page);

        const alert = page.locator(".fr-alert--info");
        await expect(alert).toBeVisible();

        const accordionsGroup = page.locator(".fr-accordions-group");
        await expect(accordionsGroup).not.toBeVisible();

        const accordion = page.locator(".fr-accordion");
        await expect(accordion).not.toBeVisible();
      });
    });

    test.describe("Read only views", () => {
      test("should let me view a read only version of the ready for jury date tab when dossier de validation is sent and no failed jury result", async ({
        page,
        msw,
      }) => {
        const candidacy = createCandidacyFor(typeAccompagnement, {
          status: "DOSSIER_DE_VALIDATION_ENVOYE",
          feasibility: createAdmissibleFeasibility(),
          readyForJuryEstimatedAt: format(ESTIMATED_DATE, "yyyy-MM-dd"),
          activeDossierDeValidation: {
            dossierDeValidationOtherFiles: [],
          },
          jury: createJuryEntity({
            result: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
          }),
        });
        const { dossierDeValidationWait } = useDossierScenario(msw, candidacy);

        await login(page);
        await navigateToDossierValidation(
          page,
          candidacy.candidate?.id,
          candidacy.id,
        );
        await dossierDeValidationWait(page);

        await page.getByRole("tab", { name: "Date" }).click();

        const readyForJuryText = page.locator(
          ".ready-for-jury-estimated-date-text",
        );
        await expect(readyForJuryText).toBeVisible();
        await expect(readyForJuryText).toContainText(
          format(ESTIMATED_DATE, "dd/MM/yyyy"),
        );
      });

      test("should let me view a read only version of the dossier de validation tab when dossier is sent and no failed jury result", async ({
        page,
        msw,
      }) => {
        const sentDate = addDays(DATE_NOW, 15);
        const candidacy = createCandidacyFor(typeAccompagnement, {
          status: "DOSSIER_DE_VALIDATION_ENVOYE",
          feasibility: createAdmissibleFeasibility(),
          readyForJuryEstimatedAt: format(ESTIMATED_DATE, "yyyy-MM-dd"),
          activeDossierDeValidation: {
            dossierDeValidationOtherFiles: [],
            dossierDeValidationSentAt: sentDate.getTime(),
          },
          jury: createJuryEntity({
            result: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
          }),
        });

        const { dossierDeValidationWait } = useDossierScenario(msw, candidacy);

        await login(page);
        await navigateToDossierValidation(
          page,
          candidacy.candidate?.id,
          candidacy.id,
        );
        await dossierDeValidationWait(page);

        const sentAlert = page.locator(
          '[data-testid="dossier-de-validation-sent-alert"]',
        );
        await expect(sentAlert).toBeVisible();
      });

      test("should not be read only when dossier is sent but has failed jury result", async ({
        page,
        msw,
      }) => {
        const sentDate = addDays(DATE_NOW, 15);
        const candidacy = createCandidacyFor(typeAccompagnement, {
          status: "DOSSIER_DE_VALIDATION_ENVOYE",
          feasibility: createAdmissibleFeasibility(),
          activeDossierDeValidation: {
            dossierDeValidationOtherFiles: [],
            dossierDeValidationSentAt: sentDate.getTime(),
          },
          jury: createJuryEntity({ result: "FAILURE" }),
        });

        const { dashboardWait } = useDashboardScenario(msw, candidacy);

        await login(page);
        await dashboardWait(page);

        const dossierValidationButton = page
          .locator('[data-testid="dossier-validation-tile"]')
          .getByRole("button");

        await expect(dossierValidationButton).toBeVisible();
        await expect(dossierValidationButton).not.toBeDisabled();
      });
    });
  });
});
