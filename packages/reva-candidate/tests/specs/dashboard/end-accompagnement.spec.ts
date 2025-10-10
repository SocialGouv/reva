import { format } from "date-fns";
import { expect, Page, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import { createCandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createCertificationEntity } from "@tests/helpers/entities/create-certification.entity";
import { createFeasibilityEntity } from "@tests/helpers/entities/create-feasibility.entity";
import { createOrganismEntity } from "@tests/helpers/entities/create-organism.entity";
import { endAccompagnementHandlers } from "@tests/helpers/handlers/end-accompagnement.handler";
import { waitGraphQL } from "@tests/helpers/network/requests";

import {
  Candidacy,
  Candidate,
  Feasibility,
  Organism,
} from "@/graphql/generated/graphql";

const loginAndWait = async ({
  page,
  candidacy,
  endAccompagnementWait,
}: {
  page: Page;
  candidacy: Candidacy;
  endAccompagnementWait: (page: Page) => Promise<void>;
}) => {
  await login(page);
  await endAccompagnementWait(page);
  await page.waitForURL(`/candidat/${candidacy.id}/end-accompagnement/`);
  await waitGraphQL(page, "getCandidacyByIdWithCandidateForEndAccompagnement");
};

test.describe("End Accompagnement Page", () => {
  test.describe("Page Display", () => {
    const decisionSentAt = new Date("2024-06-15").getTime();
    const feasibility = createFeasibilityEntity({
      decision: "ADMISSIBLE",
      decisionSentAt,
      feasibilityFileSentAt: new Date().getTime(),
    });
    const organism = createOrganismEntity({
      modaliteAccompagnement: "LIEU_ACCUEIL",
      label: "Mon Organisme Test",
    }) as Organism;
    const candidate = createCandidateEntity() as Candidate;
    const certification = createCertificationEntity({
      codeRncp: "RNCP1234",
      label: "Test Certification Label",
    });
    const candidacy = createCandidacyEntity({
      candidate,
      status: "PARCOURS_CONFIRME",
      certification,
      organism,
      typeAccompagnement: "ACCOMPAGNE",
      feasibility: feasibility as Feasibility,
      endAccompagnementStatus: "PENDING",
    }) as Candidacy;

    const { handlers, endAccompagnementWait } = endAccompagnementHandlers({
      candidacy,
    });

    test.use({
      mswHandlers: [handlers, { scope: "test" }],
    });

    test("should display candidate information correctly", async ({ page }) => {
      await loginAndWait({ page, candidacy, endAccompagnementWait });

      await expect(
        page.getByRole("heading", { name: "Fin d'accompagnement" }),
      ).toBeVisible();

      const candidateFullName = `${candidate.lastname} ${candidate.firstname}`;
      await expect(page.getByText(candidateFullName)).toBeVisible();

      await expect(
        page.getByText(
          `RNCP ${certification.codeRncp} : ${certification.label}`,
        ),
      ).toBeVisible();

      await expect(page.getByText(organism.label)).toBeVisible();

      await expect(
        page.getByText(
          `${candidate.department?.label} (${candidate.department?.code})`,
        ),
      ).toBeVisible();

      const formattedDate = format(new Date(decisionSentAt), "dd/MM/yyyy");
      await expect(
        page.getByText(`Recevable le ${formattedDate}`),
      ).toBeVisible();

      await expect(page.getByText("Sur site")).toBeVisible();
    });

    test("should display radio buttons with correct labels and hints", async ({
      page,
    }) => {
      await loginAndWait({ page, candidacy, endAccompagnementWait });

      await expect(
        page.getByText(
          "Voulez-vous accepter la fin de votre accompagnement pour ce parcours de VAE ?",
        ),
      ).toBeVisible();

      await expect(
        page.getByRole("radio", {
          name: /Oui, mon accompagnement est terminé/,
        }),
      ).toBeVisible();

      await expect(
        page.getByRole("radio", {
          name: /Non, je souhaite continuer mon accompagnement/,
        }),
      ).toBeVisible();

      await expect(
        page.locator(
          '[data-test="candidacy-end-accompagnement-confirm-button"]',
        ),
      ).toBeVisible();
    });
  });

  test.describe("Page Display with A_DISTANCE badge", () => {
    const organism = createOrganismEntity({
      modaliteAccompagnement: "A_DISTANCE",
    }) as Organism;
    const candidate = createCandidateEntity() as Candidate;
    const candidacy = createCandidacyEntity({
      candidate,
      organism,
      typeAccompagnement: "ACCOMPAGNE",
      endAccompagnementStatus: "PENDING",
    }) as Candidacy;

    const { handlers, endAccompagnementWait } = endAccompagnementHandlers({
      candidacy,
    });

    test.use({
      mswHandlers: [handlers, { scope: "test" }],
    });

    test("should display 'À distance' badge for A_DISTANCE modalite", async ({
      page,
    }) => {
      await loginAndWait({ page, candidacy, endAccompagnementWait });

      await expect(page.getByText("À distance")).toBeVisible();
    });
  });

  test.describe("Form Validation", () => {
    const organism = createOrganismEntity() as Organism;
    const candidate = createCandidateEntity() as Candidate;
    const candidacy = createCandidacyEntity({
      candidate,
      organism,
      typeAccompagnement: "ACCOMPAGNE",
      endAccompagnementStatus: "PENDING",
    }) as Candidacy;

    const { handlers, endAccompagnementWait } = endAccompagnementHandlers({
      candidacy,
    });

    test.use({
      mswHandlers: [handlers, { scope: "test" }],
    });

    test("should show validation error when submitting without selection", async ({
      page,
    }) => {
      await loginAndWait({ page, candidacy, endAccompagnementWait });

      const submitButton = page.locator(
        '[data-test="candidacy-end-accompagnement-confirm-button"]',
      );
      const radioGroup = page.locator(
        '[data-test="candidacy-end-accompagnement-radio-buttons"]',
      );
      await expect(radioGroup).not.toHaveAttribute(
        "class",
        /fr-fieldset--error/,
      );
      await expect(radioGroup).not.toContainText(
        "Veuillez sélectionner une option",
      );
      await submitButton.click();

      await expect(radioGroup).toHaveAttribute("class", /fr-fieldset--error/);
      await expect(radioGroup).toContainText(
        "Veuillez sélectionner une option",
      );
    });
  });

  test.describe("Form Submission - CONFIRMED", () => {
    const organism = createOrganismEntity() as Organism;
    const candidate = createCandidateEntity() as Candidate;
    const candidacy = createCandidacyEntity({
      candidate,
      organism,
      typeAccompagnement: "ACCOMPAGNE",
      endAccompagnementStatus: "PENDING",
    }) as Candidacy;

    const { handlers, endAccompagnementWait } = endAccompagnementHandlers({
      candidacy,
    });

    test.use({
      mswHandlers: [handlers, { scope: "test" }],
    });

    test("should submit successfully with CONFIRMED option", async ({
      page,
    }) => {
      await loginAndWait({ page, candidacy, endAccompagnementWait });

      const confirmedRadio = page.locator("input[value='CONFIRMED']");
      await expect(confirmedRadio).toBeVisible();
      await confirmedRadio.click({ force: true });

      const submitButton = page.locator(
        '[data-test="candidacy-end-accompagnement-confirm-button"]',
      );

      const mutationPromise = waitGraphQL(
        page,
        "candidacy_updateCandidacyEndAccompagnementDecision",
      );

      await submitButton.click();
      await mutationPromise;
      await expect(page.getByText("Décision enregistrée")).toBeVisible();
    });
  });

  test.describe("Form Submission - REFUSED", () => {
    const organism = createOrganismEntity() as Organism;
    const candidate = createCandidateEntity() as Candidate;
    const candidacy = createCandidacyEntity({
      candidate,
      organism,
      typeAccompagnement: "ACCOMPAGNE",
      endAccompagnementStatus: "PENDING",
    }) as Candidacy;

    const { handlers, endAccompagnementWait } = endAccompagnementHandlers({
      candidacy,
    });

    test.use({
      mswHandlers: [handlers, { scope: "test" }],
    });

    test("should submit successfully with REFUSED option", async ({ page }) => {
      await loginAndWait({ page, candidacy, endAccompagnementWait });

      const refusedRadio = page.locator("input[value='REFUSED']");
      await expect(refusedRadio).toBeVisible();
      await refusedRadio.click({ force: true });
      await expect(refusedRadio).toBeChecked();

      const submitButton = page.locator(
        '[data-test="candidacy-end-accompagnement-confirm-button"]',
      );

      const mutationPromise = waitGraphQL(
        page,
        "candidacy_updateCandidacyEndAccompagnementDecision",
      );

      await submitButton.click();
      await mutationPromise;

      await expect(page.getByText("Décision enregistrée")).toBeVisible();
    });
  });
});
