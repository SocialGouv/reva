import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import { createCandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createCertificationEntity } from "@tests/helpers/entities/create-certification.entity";
import { createJuryEntity } from "@tests/helpers/entities/create-jury.entity";
import { createOrganismEntity } from "@tests/helpers/entities/create-organism.entity";
import { dashboardHandlers } from "@tests/helpers/handlers/dashboard.handler";

import type { JuryResult } from "@/graphql/generated/graphql";

import type { CandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import type { MswFixture } from "next/experimental/testmode/playwright/msw";
import type { Page } from "playwright";

const PAST_SESSION = Date.now() - 86_400_000;

const juryResultByCompetenceBlocs = [{ id: "bloc-1" }];

function buildAccompagneCandidacyWithJuryBlocks(
  juryResult: JuryResult,
  dateOfSession: number = PAST_SESSION,
): CandidacyEntity {
  return createCandidacyEntity({
    candidate: createCandidateEntity(),
    organism: createOrganismEntity(),
    certification: createCertificationEntity(),
    jury: {
      ...createJuryEntity({ result: juryResult, dateOfSession }),
      juryResultByCompetenceBlocs,
    },
  });
}

async function loadJuryWithBlocksDashboard(
  page: Page,
  msw: MswFixture,
  candidacy: CandidacyEntity,
) {
  const { handlers, dashboardWait } = dashboardHandlers({
    candidacy,
    activeFeaturesForConnectedUser: ["JURY_RESULTS_BY_BLOCK"],
  });
  msw.use(...handlers);
  await login(page);
  await dashboardWait(page);
}

const juryBadgeExpectations: {
  juryResult: JuryResult;
  expectedBadgeLabel: string;
  bannerTestId: string;
}[] = [
  {
    juryResult: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
    expectedBadgeLabel: "Réussite",
    bannerTestId: "jury-banner-success",
  },
  {
    juryResult: "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION",
    expectedBadgeLabel: "Réussite",
    bannerTestId: "jury-banner-success",
  },
  {
    juryResult: "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
    expectedBadgeLabel: "Réussite partielle",
    bannerTestId: "jury-banner-partial-success",
  },
  {
    juryResult: "PARTIAL_SUCCESS_PENDING_CONFIRMATION",
    expectedBadgeLabel: "Réussite partielle",
    bannerTestId: "jury-banner-partial-success",
  },
  {
    juryResult: "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
    expectedBadgeLabel: "Réussite partielle",
    bannerTestId: "jury-banner-partial-success",
  },
  {
    juryResult: "CANDIDATE_ABSENT",
    expectedBadgeLabel: "Non présent le jour du jury",
    bannerTestId: "jury-banner-absent-or-excused",
  },
  {
    juryResult: "CANDIDATE_EXCUSED",
    expectedBadgeLabel: "Non présent le jour du jury",
    bannerTestId: "jury-banner-absent-or-excused",
  },
  {
    juryResult: "FAILURE",
    expectedBadgeLabel: "DIPLÔME NON OBTENU",
    bannerTestId: "jury-banner-failure",
  },
];

test.describe("Jury with blocks banner (DashboardBanner)", () => {
  test("affiche le lien vers les détails des résultats du jury (parcours accompagné, résultats par blocs, feature JURY_RESULTS_BY_BLOCK)", async ({
    page,
    msw,
  }) => {
    const candidacy =
      buildAccompagneCandidacyWithJuryBlocks("CANDIDATE_ABSENT");
    expect(candidacy.typeAccompagnement).toBe("ACCOMPAGNE");

    await loadJuryWithBlocksDashboard(page, msw, candidacy);

    await expect(
      page.getByTestId("jury-banner-absent-or-excused"),
    ).toBeVisible();

    const detailsLink = page.getByRole("link", {
      name: "les détails des résultats de votre jury",
    });
    await expect(detailsLink).toBeVisible();
    await expect(detailsLink).toHaveAttribute("href", "./jury-results");
  });

  test.describe("Libellés des badges selon le résultat du jury", () => {
    for (const {
      juryResult,
      expectedBadgeLabel,
      bannerTestId,
    } of juryBadgeExpectations) {
      test(`affiche « ${expectedBadgeLabel} » pour ${juryResult}`, async ({
        page,
        msw,
      }) => {
        const candidacy = buildAccompagneCandidacyWithJuryBlocks(juryResult);
        expect(candidacy.typeAccompagnement).toBe("ACCOMPAGNE");

        await loadJuryWithBlocksDashboard(page, msw, candidacy);

        const banner = page.getByTestId(bannerTestId);
        await expect(banner).toBeVisible();
        await expect(page.getByTestId("result-badge")).toHaveText(
          expectedBadgeLabel,
        );
      });
    }
  });
});
