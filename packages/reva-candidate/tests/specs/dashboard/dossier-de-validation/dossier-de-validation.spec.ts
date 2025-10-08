import { addMonths, format } from "date-fns";
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

import {
  Candidacy,
  Candidate,
  Feasibility,
  Organism,
  TypeAccompagnement,
} from "@/graphql/generated/graphql";

const DATE_NOW = new Date();
const ESTIMATED_DATE = addMonths(DATE_NOW, 10);
const typesAccompagnement: TypeAccompagnement[] = ["AUTONOME", "ACCOMPAGNE"];

typesAccompagnement.forEach((typeAccompagnement) => {
  test.describe(`${typeAccompagnement} - Dossier de validation`, () => {
    test.describe("Inactive dossier de validation", () => {
      const certification = createCertificationEntity();
      const organism =
        typeAccompagnement === "ACCOMPAGNE"
          ? (createOrganismEntity() as Organism)
          : undefined;
      const candidate = createCandidateEntity() as Candidate;
      const candidacy = createCandidacyEntity({
        candidate,
        status: "PROJET",
        certification,
        organism,
        typeAccompagnement,
      }) as Candidacy;

      const { handlers, dashboardWait } = dashboardHandlers({
        candidacy,
      });

      test.use({
        mswHandlers: [handlers, { scope: "test" }],
      });

      test("should show an inactive dossier de validation element in the dashboard when the candidacy status is 'PROJET'", async ({
        page,
      }) => {
        await login(page);
        await dashboardWait(page);

        const dossierValidationButton = page
          .locator('[data-test="dossier-validation-tile"]')
          .getByRole("button");

        await expect(dossierValidationButton).toBeVisible();
        await expect(dossierValidationButton).toBeDisabled();
      });
    });

    test.describe("Update views", () => {
      test.describe("Active dashboard navigation", () => {
        const certification = createCertificationEntity();
        const organism =
          typeAccompagnement === "ACCOMPAGNE"
            ? (createOrganismEntity() as Organism)
            : undefined;
        const feasibility = createFeasibilityEntity({
          decision: "ADMISSIBLE",
          feasibilityFileSentAt: new Date().getTime(),
        });
        const candidate = createCandidateEntity() as Candidate;
        const candidacy = createCandidacyEntity({
          candidate,
          status: "DOSSIER_FAISABILITE_RECEVABLE",
          certification,
          organism,
          typeAccompagnement,
          feasibility: feasibility as Feasibility,
        }) as Candidacy;
        const { handlers, dashboardWait } = dashboardHandlers({
          candidacy,
        });

        test.use({
          mswHandlers: [handlers, { scope: "test" }],
        });

        test("should show an active dossier de validation element in the dashboard when the candidacy status is 'DOSSIER_FAISABILITE_RECEVABLE' and route to the dossier de validation page when clicked on", async ({
          page,
        }) => {
          await login(page);
          await dashboardWait(page);

          const dossierValidationButton = page
            .locator('[data-test="dossier-validation-tile"]')
            .getByRole("button");
          await expect(dossierValidationButton).not.toBeDisabled();

          await dossierValidationButton.click();
          await expect(page).toHaveURL(
            `/candidat/${candidacy.id}/dossier-de-validation/`,
          );
        });
      });

      test.describe("Date updates", () => {
        const certification = createCertificationEntity();
        const organism =
          typeAccompagnement === "ACCOMPAGNE"
            ? (createOrganismEntity() as Organism)
            : undefined;
        const feasibility = createFeasibilityEntity({
          decision: "ADMISSIBLE",
          feasibilityFileSentAt: new Date().getTime(),
        });

        const candidate = createCandidateEntity() as Candidate;
        const candidacy = createCandidacyEntity({
          candidate,
          status: "DOSSIER_FAISABILITE_RECEVABLE",
          certification,
          organism,
          typeAccompagnement,
          feasibility: feasibility as Feasibility,
        }) as Candidacy;
        const { handlers, dossierDeValidationWait } =
          dossierDeValidationHandlers({
            candidacy,
          });

        test.use({
          mswHandlers: [handlers, { scope: "test" }],
        });

        test("should let me change the readyForJuryEstimatedAt date", async ({
          page,
        }) => {
          await login(page);
          await navigateToDossierValidation(page, candidacy.id);
          await dossierDeValidationWait(page);

          const dateInput = page.locator(
            '[data-test="ready-for-jury-estimated-date-input"]',
          );
          await dateInput
            .getByRole("textbox")
            .fill(format(ESTIMATED_DATE, "yyyy-MM-dd"));

          const submitButton = page.locator(
            '[data-test="submit-ready-for-jury-estimated-date-form-button"]',
          );

          const updateJuryDateMutation = waitGraphQL(
            page,
            "updateReadyForJuryEstimatedAtForDossierDeValidationPage",
          );
          await submitButton.click();
          await updateJuryDateMutation;
        });
      });

      test.describe("Form validation", () => {
        const certification = createCertificationEntity();
        const organism =
          typeAccompagnement === "ACCOMPAGNE"
            ? (createOrganismEntity() as Organism)
            : undefined;
        const feasibility = createFeasibilityEntity({
          decision: "ADMISSIBLE",
          feasibilityFileSentAt: new Date().getTime(),
        });
        const candidate = createCandidateEntity() as Candidate;
        const candidacy = createCandidacyEntity({
          candidate,
          status: "DOSSIER_FAISABILITE_RECEVABLE",
          certification,
          organism,
          typeAccompagnement,
          feasibility: feasibility as Feasibility,
        }) as Candidacy;
        const { handlers, dossierDeValidationWait } =
          dossierDeValidationHandlers({
            candidacy,
          });

        test.use({
          mswHandlers: [handlers, { scope: "test" }],
        });

        test("should display error message on first click when trying to submit without file", async ({
          page,
        }) => {
          await login(page);
          await navigateToDossierValidation(page, candidacy.id);
          await dossierDeValidationWait(page);
          await clickDossierTab(page);

          const checkboxGroup = page.locator(
            '[data-test="dossier-de-validation-checkbox-group"]',
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
            .locator('[data-test="submit-dossier-de-validation-form-button"]')
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
      });

      test.describe("File upload and submission", () => {
        const certification = createCertificationEntity();
        const organism =
          typeAccompagnement === "ACCOMPAGNE"
            ? (createOrganismEntity() as Organism)
            : undefined;
        const feasibility = createFeasibilityEntity({
          decision: "ADMISSIBLE",
          feasibilityFileSentAt: new Date().getTime(),
        });
        const candidate = createCandidateEntity() as Candidate;
        const candidacy = createCandidacyEntity({
          candidate,
          status: "DOSSIER_FAISABILITE_RECEVABLE",
          certification,
          organism,
          typeAccompagnement,
          feasibility: feasibility as Feasibility,
        }) as Candidacy;
        const { handlers, dossierDeValidationWait } =
          dossierDeValidationHandlers({
            candidacy,
          });

        test.use({
          mswHandlers: [handlers, { scope: "test" }],
        });

        test("should let me send a dossier de validation", async ({ page }) => {
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
            '[data-test="dossier-de-validation-checkbox-group"]',
          );
          const labels = checkboxGroup.locator("label");
          const count = await labels.count();
          for (let i = 0; i < count; i++) {
            await labels.nth(i).click();
          }

          const uploadRequest = waitRest(page, "upload-dossier-de-validation");
          await page
            .locator('[data-test="submit-dossier-de-validation-form-button"]')
            .click();
          await uploadRequest;

          await expect(page).toHaveURL(`/candidat/${candidacy.id}/`);
        });
      });

      test.describe("Additional attachments", () => {
        const certification = createCertificationEntity();
        const organism =
          typeAccompagnement === "ACCOMPAGNE"
            ? (createOrganismEntity() as Organism)
            : undefined;
        const feasibility = createFeasibilityEntity({
          decision: "ADMISSIBLE",
          feasibilityFileSentAt: new Date().getTime(),
        });
        const candidate = createCandidateEntity() as Candidate;
        const candidacy = createCandidacyEntity({
          candidate,
          status: "DOSSIER_FAISABILITE_RECEVABLE",
          certification,
          organism,
          typeAccompagnement,
          feasibility: feasibility as Feasibility,
        }) as Candidacy;
        const { handlers, dossierDeValidationWait } =
          dossierDeValidationHandlers({
            candidacy,
          });

        test.use({
          mswHandlers: [handlers, { scope: "test" }],
        });

        test("should let me add and remove additional attachments", async ({
          page,
        }) => {
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
      });
    });
  });
});
