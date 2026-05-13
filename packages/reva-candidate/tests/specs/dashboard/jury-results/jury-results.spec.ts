import { format } from "date-fns";
import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import {
  juryResultsHandlers,
  navigateToJuryResults,
} from "@tests/helpers/handlers/jury-results/jury-results.handler";
import {
  buildJuryResultsCandidacy,
  createJuryResultByCompetenceBlocs,
  CURRENT_JURY_DATE,
  PAST_JURY_DATE,
} from "@tests/helpers/jury-results/build-jury-results-candidacy";

import type { JuryResult } from "@/graphql/generated/graphql";

import type { CandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import type { MswFixture } from "next/experimental/testmode/playwright/msw";
import type { Page } from "playwright";

async function loadJuryResultsPage(
  page: Page,
  msw: MswFixture,
  candidacy: CandidacyEntity,
) {
  const { handlers, juryResultsWait } = juryResultsHandlers({ candidacy });
  msw.use(...handlers);
  await login(page);
  await navigateToJuryResults(page, candidacy.candidate!.id, candidacy.id);
  await juryResultsWait(page);
}

const juryBadgeExpectationsWithBlocks: {
  juryResult: JuryResult;
  expectedBadgeLabel: string;
}[] = [
  {
    juryResult: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
    expectedBadgeLabel: "Réussite",
  },
  {
    juryResult: "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION",
    expectedBadgeLabel: "Réussite",
  },
  {
    juryResult: "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
    expectedBadgeLabel: "Réussite partielle",
  },
  {
    juryResult: "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
    expectedBadgeLabel: "Réussite partielle",
  },
  {
    juryResult: "PARTIAL_SUCCESS_PENDING_CONFIRMATION",
    expectedBadgeLabel:
      "Réussite partielle (sous reserve de confirmation par un certificateur)",
  },
  {
    juryResult: "FAILURE",
    expectedBadgeLabel: "Non validation",
  },
  {
    juryResult: "CANDIDATE_EXCUSED",
    expectedBadgeLabel: "Excusé sur justificatif",
  },
  {
    juryResult: "CANDIDATE_ABSENT",
    expectedBadgeLabel: "Non présent le jour du jury",
  },
];

test.describe("Jury results page", () => {
  test("affiche le titre, le fil d'Ariane et les ressources utiles", async ({
    page,
    msw,
  }) => {
    const candidacy = buildJuryResultsCandidacy();
    await loadJuryResultsPage(page, msw, candidacy);

    await expect(
      page.getByRole("heading", { name: "Jury", level: 1 }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("navigation", { name: "vous êtes ici" })
        .getByRole("link", { name: "Mes candidatures" }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("navigation", { name: "vous êtes ici" })
        .getByRole("link", {
          name: `RNCP ${candidacy.certification!.codeRncp} : ${candidacy.certification!.label}`,
        }),
    ).toBeVisible();
    await expect(page.getByText("Ressources :")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Comment se déroule un jury" }),
    ).toHaveAttribute(
      "href",
      "https://vae.gouv.fr/savoir-plus/articles/comment-se-deroule-un-jury-vae/",
    );
    await expect(
      page.getByRole("link", {
        name: "Consulter la fiche de la certification",
      }),
    ).toHaveAttribute(
      "href",
      `../certification/${candidacy.certification!.id}/`,
    );
  });

  test.describe("Libellés des badges selon le résultat du jury", () => {
    for (const {
      juryResult,
      expectedBadgeLabel,
    } of juryBadgeExpectationsWithBlocks) {
      test(`affiche « ${expectedBadgeLabel} » pour ${juryResult}`, async ({
        page,
        msw,
      }) => {
        const candidacy = buildJuryResultsCandidacy({ juryResult });
        await loadJuryResultsPage(page, msw, candidacy);

        await expect(
          page.getByText(expectedBadgeLabel, { exact: true }),
        ).toBeVisible();
      });
    }
  });

  test("affiche les blocs visés avec les icônes validé / non validé", async ({
    page,
    msw,
  }) => {
    const candidacy = buildJuryResultsCandidacy({
      previouslyValidatedBlocks: [
        { id: "bloc-id-0", code: "B0", label: "Bloc déjà validé" },
      ],
      juryResultByCompetenceBlocs: createJuryResultByCompetenceBlocs([
        { id: "bloc-id-1", code: "B1", label: "Bloc 1", validated: true },
        { id: "bloc-id-2", code: "B2", label: "Bloc 2", validated: false },
      ]),
    });
    await loadJuryResultsPage(page, msw, candidacy);

    await expect(page.getByText("Blocs visés :")).toBeVisible();
    await expect(
      page.getByRole("listitem", {
        name: "B0 - Bloc déjà validé (validé)",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("listitem", { name: "B1 - Bloc 1 (validé)" }),
    ).toBeVisible();
    await expect(
      page.getByRole("listitem", { name: "B2 - Bloc 2 (non validé)" }),
    ).toBeVisible();

    const validatedIcon = page
      .getByRole("listitem", { name: "B1 - Bloc 1 (validé)" })
      .locator(".fr-icon-checkbox-fill");
    const notValidatedIcon = page
      .getByRole("listitem", { name: "B2 - Bloc 2 (non validé)" })
      .locator(".fr-icon-close-circle-fill");

    await expect(validatedIcon).toBeVisible();
    await expect(notValidatedIcon).toBeVisible();
  });

  test("affiche le commentaire du jury", async ({ page, msw }) => {
    const candidacy = buildJuryResultsCandidacy({
      informationOfResult: "Information complémentaire du jury",
    });
    await loadJuryResultsPage(page, msw, candidacy);

    await expect(page.getByText("Commentaire :")).toBeVisible();
    await expect(
      page.getByText("Information complémentaire du jury"),
    ).toBeVisible();
  });

  test("n'affiche pas d'onglets lorsqu'il n'y a pas d'historique de jury", async ({
    page,
    msw,
  }) => {
    const candidacy = buildJuryResultsCandidacy({ historyJury: [] });
    await loadJuryResultsPage(page, msw, candidacy);

    await expect(page.getByRole("tablist")).toHaveCount(0);
    await expect(
      page.getByText(format(CURRENT_JURY_DATE, "dd/MM/yyyy")),
    ).toBeVisible();
  });

  test("affiche des onglets par date de passage lorsqu'il y a un historique de jury", async ({
    page,
    msw,
  }) => {
    const candidacy = buildJuryResultsCandidacy({
      historyJury: [
        {
          id: "jury-past",
          dateOfSession: PAST_JURY_DATE,
          result: "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
          informationOfResult: "Résultat du premier passage",
          juryResultByCompetenceBlocs: createJuryResultByCompetenceBlocs([
            { id: "bloc-id-1", code: "B1", label: "Bloc 1", validated: true },
            { id: "bloc-id-2", code: "B2", label: "Bloc 2", validated: false },
          ]),
        },
      ],
    });
    await loadJuryResultsPage(page, msw, candidacy);

    await expect(page.getByRole("tablist")).toBeVisible();
    await expect(
      page.getByRole("tab", { name: format(PAST_JURY_DATE, "dd/MM/yyyy") }),
    ).toBeVisible();

    await expect(
      page.getByRole("tab", {
        name: format(CURRENT_JURY_DATE, "dd/MM/yyyy"),
        selected: true,
      }),
    ).toBeVisible();
  });

  test("affiche l'alerte de réussite partielle", async ({ page, msw }) => {
    const candidacy = buildJuryResultsCandidacy({
      juryResult: "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
    });
    await loadJuryResultsPage(page, msw, candidacy);

    await expect(page.getByTestId("partial-success-alert")).toBeVisible();
    await expect(page.getByTestId("failure-alert")).toHaveCount(0);
  });

  test("affiche l'alerte d'échec", async ({ page, msw }) => {
    const candidacy = buildJuryResultsCandidacy({ juryResult: "FAILURE" });
    await loadJuryResultsPage(page, msw, candidacy);

    await expect(page.getByTestId("failure-alert")).toBeVisible();
    await expect(page.getByTestId("partial-success-alert")).toHaveCount(0);
  });

  test("ouvre la modale de recevabilité depuis le lien dédié", async ({
    page,
    msw,
  }) => {
    const candidacy = buildJuryResultsCandidacy();
    await loadJuryResultsPage(page, msw, candidacy);

    await page
      .getByRole("link", {
        name: /Voir les détails de la recevabilité du candidat sur cette certification/,
      })
      .click();

    const modal = page.getByRole("dialog", {
      name: "Recevabilité sur cette candidature",
    });
    await expect(modal).toBeVisible();
    await expect(
      modal.getByText("Recevabilité obtenue sur les blocs :"),
    ).toBeVisible();
    await expect(modal.getByText("B1 - Bloc 1")).toBeVisible();
    await expect(modal.getByText("B2 - Bloc 2")).toBeVisible();
    await expect(
      modal.getByText("Blocs non concernés par la recevabilité :"),
    ).toBeVisible();
    await expect(modal.getByText("B4 - Bloc 4")).toBeVisible();
  });
});
