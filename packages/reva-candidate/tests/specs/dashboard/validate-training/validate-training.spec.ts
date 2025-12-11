import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import {
  createCandidacyEntity,
  createCandidacyStatuses,
  type CandidacyEntity,
} from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createOrganismEntity } from "@tests/helpers/entities/create-organism.entity";
import {
  navigateToValidateTraining,
  validateTrainingHandlers,
} from "@tests/helpers/handlers/validate-training/validate-training.handler";
import { waitGraphQL } from "@tests/helpers/network/requests";

import type { Page } from "@playwright/test";
import type { MswFixture } from "next/experimental/testmode/playwright/msw";

function createTrainingCandidacy(
  overrides: Partial<CandidacyEntity> = {},
): CandidacyEntity {
  const candidate = createCandidateEntity();
  const organism = createOrganismEntity();

  return createCandidacyEntity({
    candidate,
    organism,
    typeAccompagnement: "ACCOMPAGNE",
    status: "PARCOURS_CONFIRME",
    candidacyStatuses: createCandidacyStatuses([
      "PROJET",
      "PRISE_EN_CHARGE",
      "PARCOURS_ENVOYE",
      "PARCOURS_CONFIRME",
    ]),
    certificateSkills: "Blocs de compétences métier",
    otherTraining: "Autres actions de formations complémentaires",
    individualHourCount: 1,
    collectiveHourCount: 2,
    additionalHourCount: 3,
    basicSkills: [
      { id: "bs1", label: "Base 1" },
      { id: "bs2", label: "Base 2" },
    ],
    mandatoryTrainings: [
      { id: "mt1", label: "Obligatoire 1" },
      { id: "mt2", label: "Obligatoire 2" },
      { id: "mt3", label: "Obligatoire 3" },
    ],
    ...overrides,
  });
}

async function setupAndNavigateToValidateTraining(
  page: Page,
  msw: MswFixture,
  candidacy: CandidacyEntity,
) {
  const { handlers, validateTrainingWait } =
    validateTrainingHandlers(candidacy);
  msw.use(...handlers);

  await login(page);
  await navigateToValidateTraining(page, candidacy.candidate!.id, candidacy.id);
  await validateTrainingWait(page);
}

test.describe("display training fields", () => {
  test("should display all fields", async ({ page, msw }) => {
    const candidacy = createTrainingCandidacy();
    await setupAndNavigateToValidateTraining(page, msw, candidacy);

    const generalInformations = page.locator(
      '[data-testid="general-informations"]',
    );
    await expect(generalInformations.locator("> li")).toHaveCount(3);

    const mandatoryTrainingSection = page.locator(
      '[data-testid="mandatory-training-section"]',
    );
    await expect(mandatoryTrainingSection.locator("ul > li")).toHaveCount(3);

    const basicSkillsSection = page.locator(
      '[data-testid="basic-skills-section"]',
    );
    await expect(basicSkillsSection.locator("ul > li")).toHaveCount(2);

    const certificateSkillsSection = page.locator(
      '[data-testid="certificate-skills-section"]',
    );
    await expect(certificateSkillsSection.locator("p")).toHaveText(
      "Blocs de compétences métier",
    );

    const otherTrainingSection = page.locator(
      '[data-testid="other-training-section"]',
    );
    await expect(otherTrainingSection.locator("p")).toHaveText(
      "Autres actions de formations complémentaires",
    );
  });

  test("should not display missing fields", async ({ page, msw }) => {
    const candidacy = createTrainingCandidacy({
      collectiveHourCount: null,
      additionalHourCount: null,
      basicSkills: [],
      mandatoryTrainings: [],
    });
    await setupAndNavigateToValidateTraining(page, msw, candidacy);

    const generalInformations = page.locator(
      '[data-testid="general-informations"]',
    );
    await expect(generalInformations.locator("> li")).toHaveCount(3);

    await expect(
      page.locator('[data-testid="mandatory-training-section"]'),
    ).not.toBeVisible();

    await expect(
      page.locator('[data-testid="basic-skills-section"]'),
    ).not.toBeVisible();

    const certificateSkillsSection = page.locator(
      '[data-testid="certificate-skills-section"]',
    );
    await expect(certificateSkillsSection.locator("p")).toHaveText(
      "Blocs de compétences métier",
    );

    const otherTrainingSection = page.locator(
      '[data-testid="other-training-section"]',
    );
    await expect(otherTrainingSection.locator("p")).toHaveText(
      "Autres actions de formations complémentaires",
    );
  });
});

test.describe("submit training", () => {
  async function expectCanCheckAndSubmitTraining(page: Page) {
    const checkboxGroup = page.locator(
      '[data-testid="accept-conditions-checkbox-group"]',
    );
    for (const input of await checkboxGroup.locator("input").all()) {
      await expect(input).not.toBeChecked();
    }

    const submitButton = page.locator(
      '[data-testid="submit-training-program-button"]',
    );
    await expect(submitButton).toBeDisabled();

    for (const label of await checkboxGroup.locator("label").all()) {
      await label.click();
    }

    await expect(submitButton).not.toBeDisabled();

    const mutationPromise = waitGraphQL(page, "training_confirmTrainingForm");
    await submitButton.click();
    await mutationPromise;
  }

  test("should validate checkbox conditions and submit", async ({
    page,
    msw,
  }) => {
    const candidacy = createTrainingCandidacy({
      status: "PARCOURS_ENVOYE",
      candidacyStatuses: createCandidacyStatuses([
        "PROJET",
        "PRISE_EN_CHARGE",
        "PARCOURS_ENVOYE",
      ]),
    });
    await setupAndNavigateToValidateTraining(page, msw, candidacy);
    await expectCanCheckAndSubmitTraining(page);
  });

  test("should allow resubmitting after confirmation", async ({
    page,
    msw,
  }) => {
    const candidacy = createTrainingCandidacy({
      status: "PARCOURS_ENVOYE",
      candidacyStatuses: createCandidacyStatuses([
        "PROJET",
        "PRISE_EN_CHARGE",
        "PARCOURS_ENVOYE",
        "PARCOURS_CONFIRME",
        "PARCOURS_ENVOYE",
      ]),
    });
    await setupAndNavigateToValidateTraining(page, msw, candidacy);
    await expectCanCheckAndSubmitTraining(page);
  });
});
