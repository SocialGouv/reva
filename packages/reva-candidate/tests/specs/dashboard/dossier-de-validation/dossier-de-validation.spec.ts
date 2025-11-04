import { addDays, addMonths, format } from "date-fns";
import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import { createCandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createCertificationEntity } from "@tests/helpers/entities/create-certification.entity";
import { createFeasibilityEntity } from "@tests/helpers/entities/create-feasibility.entity";
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

import { TypeAccompagnement } from "@/graphql/generated/graphql";

const DATE_NOW = new Date();
const ESTIMATED_DATE = addMonths(DATE_NOW, 10);
const typesAccompagnement: TypeAccompagnement[] = ["AUTONOME", "ACCOMPAGNE"];

typesAccompagnement.forEach((typeAccompagnement) => {
  test.describe(`${typeAccompagnement} - Dossier de validation`, () => {
    test("should show an inactive dossier de validation element in the dashboard when the candidacy status is 'PROJET'", async ({
      page,
      msw,
    }) => {
      const certification = createCertificationEntity();
      const organism =
        typeAccompagnement === "ACCOMPAGNE"
          ? createOrganismEntity()
          : undefined;
      const candidate = createCandidateEntity();
      const candidacy = createCandidacyEntity({
        candidate,
        status: "PROJET",
        certification,
        organism,
        typeAccompagnement,
      });

      const { handlers, dashboardWait } = dashboardHandlers({
        candidacy,
      });

      msw.use(...handlers);

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
      const certification = createCertificationEntity();
      const organism =
        typeAccompagnement === "ACCOMPAGNE"
          ? createOrganismEntity()
          : undefined;
      const feasibility = createFeasibilityEntity({
        decision: "ADMISSIBLE",
        feasibilityFileSentAt: new Date().getTime(),
      });
      const candidate = createCandidateEntity();
      const candidacy = createCandidacyEntity({
        candidate,
        status: "DOSSIER_FAISABILITE_RECEVABLE",
        certification,
        organism,
        typeAccompagnement,
        feasibility,
      });
      const { handlers, dashboardWait } = dashboardHandlers({
        candidacy,
      });

      msw.use(...handlers);

      await login(page);
      await dashboardWait(page);

      const dossierValidationButton = page
        .locator('[data-testid="dossier-validation-tile"]')
        .getByRole("button");
      await expect(dossierValidationButton).not.toBeDisabled();

      await dossierValidationButton.click();
      await expect(page).toHaveURL(
        `/candidat/${candidacy.id}/dossier-de-validation/`,
      );
    });

    test("should let me change the readyForJuryEstimatedAt date", async ({
      page,
      msw,
    }) => {
      const certification = createCertificationEntity();
      const organism =
        typeAccompagnement === "ACCOMPAGNE"
          ? createOrganismEntity()
          : undefined;
      const feasibility = createFeasibilityEntity({
        decision: "ADMISSIBLE",
        feasibilityFileSentAt: new Date().getTime(),
      });

      const candidate = createCandidateEntity();
      const candidacy = createCandidacyEntity({
        candidate,
        status: "DOSSIER_FAISABILITE_RECEVABLE",
        certification,
        organism,
        typeAccompagnement,
        feasibility,
      });
      const { handlers, dossierDeValidationWait } =
        dossierDeValidationHandlers({
          candidacy,
        });

      msw.use(...handlers);

      await login(page);
      await navigateToDossierValidation(page, candidacy.id);
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
      const certification = createCertificationEntity();
      const organism =
        typeAccompagnement === "ACCOMPAGNE"
          ? createOrganismEntity()
          : undefined;
      const feasibility = createFeasibilityEntity({
        decision: "ADMISSIBLE",
        feasibilityFileSentAt: new Date().getTime(),
      });
      const candidate = createCandidateEntity();
      const candidacy = createCandidacyEntity({
        candidate,
        status: "DOSSIER_FAISABILITE_RECEVABLE",
        certification,
        organism,
        typeAccompagnement,
        feasibility,
      });
      const { handlers, dossierDeValidationWait } =
        dossierDeValidationHandlers({
          candidacy,
        });

      msw.use(...handlers);

      await login(page);
      await navigateToDossierValidation(page, candidacy.id);
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
      const certification = createCertificationEntity();
      const organism =
        typeAccompagnement === "ACCOMPAGNE"
          ? createOrganismEntity()
          : undefined;
      const feasibility = createFeasibilityEntity({
        decision: "ADMISSIBLE",
        feasibilityFileSentAt: new Date().getTime(),
      });
      const candidate = createCandidateEntity();
      const candidacy = createCandidacyEntity({
        candidate,
        status: "DOSSIER_FAISABILITE_RECEVABLE",
        certification,
        organism,
        typeAccompagnement,
        feasibility,
      });
      const { handlers, dossierDeValidationWait } =
        dossierDeValidationHandlers({
          candidacy,
        });

      msw.use(...handlers);

      await mockDossierValidationUpload(page);

      await login(page);
      await navigateToDossierValidation(page, candidacy.id);
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

      await expect(page).toHaveURL(`/candidat/${candidacy.id}/`);
    });

    test("should let me add and remove additional attachments", async ({
      page,
      msw,
    }) => {
      const certification = createCertificationEntity();
      const organism =
        typeAccompagnement === "ACCOMPAGNE"
          ? createOrganismEntity()
          : undefined;
      const feasibility = createFeasibilityEntity({
        decision: "ADMISSIBLE",
        feasibilityFileSentAt: new Date().getTime(),
      });
      const candidate = createCandidateEntity();
      const candidacy = createCandidacyEntity({
        candidate,
        status: "DOSSIER_FAISABILITE_RECEVABLE",
        certification,
        organism,
        typeAccompagnement,
        feasibility,
      });
      const { handlers, dossierDeValidationWait } =
        dossierDeValidationHandlers({
          candidacy,
        });

      msw.use(...handlers);

      await login(page);
      await navigateToDossierValidation(page, candidacy.id);
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

    test.describe("Read only views", () => {
      test("should let me view a read only version of the ready for jury date tab when dossier de validation is sent and no failed jury result", async ({
        page,
        msw,
      }) => {
        const certification = createCertificationEntity();
        const organism =
          typeAccompagnement === "ACCOMPAGNE"
            ? createOrganismEntity()
            : undefined;
        const feasibility = createFeasibilityEntity({
          decision: "ADMISSIBLE",
          feasibilityFileSentAt: new Date().getTime(),
        });
        const candidate = createCandidateEntity();
        const candidacy = createCandidacyEntity({
          candidate,
          status: "DOSSIER_DE_VALIDATION_ENVOYE",
          certification,
          organism,
          typeAccompagnement,
          feasibility,
          readyForJuryEstimatedAt: format(ESTIMATED_DATE, "yyyy-MM-dd"),
          activeDossierDeValidation: {
            dossierDeValidationOtherFiles: [],
          },
          juryResult: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
        });

        const { handlers, dossierDeValidationWait } =
          dossierDeValidationHandlers({ candidacy });

        msw.use(...handlers);

        await login(page);
        await navigateToDossierValidation(page, candidacy.id);
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
        const certification = createCertificationEntity();
        const organism =
          typeAccompagnement === "ACCOMPAGNE"
            ? createOrganismEntity()
            : undefined;
        const feasibility = createFeasibilityEntity({
          decision: "ADMISSIBLE",
          feasibilityFileSentAt: new Date().getTime(),
        });
        const candidate = createCandidateEntity();
        const candidacy = createCandidacyEntity({
          candidate,
          status: "DOSSIER_DE_VALIDATION_ENVOYE",
          certification,
          organism,
          typeAccompagnement,
          feasibility,
          readyForJuryEstimatedAt: format(ESTIMATED_DATE, "yyyy-MM-dd"),
          activeDossierDeValidation: {
            dossierDeValidationOtherFiles: [],
            dossierDeValidationSentAt: sentDate.getTime(),
          },
          juryResult: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
        });

        const { handlers, dossierDeValidationWait } =
          dossierDeValidationHandlers({ candidacy });

        msw.use(...handlers);

        await login(page);
        await navigateToDossierValidation(page, candidacy.id);
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
        const certification = createCertificationEntity();
        const organism =
          typeAccompagnement === "ACCOMPAGNE"
            ? createOrganismEntity()
            : undefined;
        const feasibility = createFeasibilityEntity({
          decision: "ADMISSIBLE",
          feasibilityFileSentAt: new Date().getTime(),
        });
        const candidate = createCandidateEntity();
        const candidacy = createCandidacyEntity({
          candidate,
          status: "DOSSIER_DE_VALIDATION_ENVOYE",
          certification,
          organism,
          typeAccompagnement,
          feasibility,
          activeDossierDeValidation: {
            dossierDeValidationOtherFiles: [],
            dossierDeValidationSentAt: sentDate.getTime(),
          },
          juryResult: "FAILURE",
        });

        const { handlers, dashboardWait } = dashboardHandlers({ candidacy });

        msw.use(...handlers);

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
