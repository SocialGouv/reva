import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import {
  navigateToValidateFeasibility,
  validateFeasibilityHandlers,
} from "@tests/helpers/handlers/validate-feasibility/validate-feasibility.handler";

test.describe("Dematerialized feasibility résumé", () => {
  const { handlers, validateFeasibilityWait, candidacyId } =
    validateFeasibilityHandlers();

  test.use({
    mswHandlers: [handlers, { scope: "test" }],
  });

  test.beforeEach(async ({ page }) => {
    await page.route("https://files.example.com/**", async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          "content-type": "application/pdf",
        },
        body: "fake-pdf-content",
      });
    });

    await login(page);
    await navigateToValidateFeasibility(page, candidacyId);
    await validateFeasibilityWait(page);
  });

  test("displays candidate information", async ({ page }) => {
    const candidateSection = page
      .locator("div")
      .filter({ hasText: /Durand Claire/ })
      .first();

    await expect(
      candidateSection.getByRole("heading", {
        name: "Mme Durand Claire, Marie",
      }),
    ).toBeVisible();
    await expect(
      candidateSection.getByText(
        "Née Dupont, le 12/04/1988 à Lyon, Rhone (69)",
      ),
    ).toBeVisible();
    await expect(candidateSection.getByText("Francaise")).toBeVisible();
    await expect(
      candidateSection.getByText("claire.dupont@example.com"),
    ).toBeVisible();
    await expect(candidateSection.getByText("0601020304")).toBeVisible();
    await expect(
      candidateSection.getByText("12 rue du Port 13002 Marseille"),
    ).toBeVisible();
  });

  test("displays certification information", async ({ page }) => {
    const certificationSection = page
      .locator("div")
      .filter({ hasText: /Certification visée/ })
      .first();

    await expect(
      certificationSection.getByRole("heading", {
        name: "Titre professionnel Responsable logistique",
      }),
    ).toBeVisible();
    await expect(certificationSection.getByText("RNCP 9083904")).toBeVisible();
    await expect(
      certificationSection.getByText("Option pilotage d'activite"),
    ).toBeVisible();

    await expect(
      certificationSection.getByText("Langue vivante 1 :Anglais"),
    ).toBeVisible();
    await expect(
      certificationSection.getByText("Langue vivante 2 :Espagnol"),
    ).toBeVisible();
  });

  test("displays blocs de competences", async ({ page }) => {
    const blocsSection = page
      .locator("div")
      .filter({ hasText: /Blocs de compétences/ })
      .first();

    await expect(
      blocsSection.getByText("Organiser et piloter les activites logistiques"),
    ).toBeVisible();
    await expect(
      blocsSection.getByText(
        "Experience significative en gestion d'equipe sur site logistique.",
      ),
    ).toBeVisible();

    await expect(
      blocsSection.getByText("Digitaliser les processus logistiques"),
    ).toBeVisible();
    await expect(
      blocsSection.getByText(
        "Competences a confirmer sur la digitalisation des flux.",
      ),
    ).toBeVisible();

    await expect(
      blocsSection.getByText("Definir les indicateurs de performance"),
    ).toBeVisible();
    await expect(
      blocsSection.getByText("Manager les equipes logistiques"),
    ).toBeVisible();
    await expect(
      blocsSection.getByText(
        "Mettre en place des outils de suivi en temps reel",
      ),
    ).toBeVisible();
  });

  test("displays prerequisites", async ({ page }) => {
    const prerequisitesSection = page
      .locator("div")
      .filter({ hasText: /Prérequis obligatoires/ })
      .first();

    await expect(
      prerequisitesSection.getByText(
        "Justifier de 2 ans d'experience en logistique",
      ),
    ).toBeVisible();
    await expect(
      prerequisitesSection.getByText("Avoir suivi une formation securite"),
    ).toBeVisible();
    await expect(
      prerequisitesSection.getByText("Detenir un permis cariste a jour"),
    ).toBeVisible();
  });

  test("displays professional experiences", async ({ page }) => {
    const experiencesSection = page
      .locator("div")
      .filter({ hasText: /Expériences professionnelles/ })
      .first();

    await expect(
      experiencesSection.getByText("Cheffe d'equipe logistique"),
    ).toBeVisible();
    await expect(
      experiencesSection.getByText(
        "Pilotage d'une equipe de 8 personnes sur une plateforme multi-sites.",
      ),
    ).toBeVisible();
    await expect(
      experiencesSection.getByText("Coordinatrice supply chain"),
    ).toBeVisible();
    await expect(
      experiencesSection.getByText(
        "Supervision des flux entrants et sortants avec optimisation des stocks.",
      ),
    ).toBeVisible();
  });

  test("displays training hours", async ({ page }) => {
    const trainingSection = page
      .locator("div")
      .filter({ hasText: /Parcours proposé/ })
      .first();

    await expect(
      trainingSection.getByText("Accompagnement individuel : 42h"),
    ).toBeVisible();
    await expect(
      trainingSection.getByText("Accompagnement collectif : 18h"),
    ).toBeVisible();
    await expect(trainingSection.getByText("Formation : 9h")).toBeVisible();
    await expect(
      trainingSection.getByText("Prevention des risques professionnels"),
    ).toBeVisible();
    await expect(trainingSection.getByText("Analyse de donnees")).toBeVisible();
    await expect(trainingSection.getByText("Gestion de projet")).toBeVisible();
  });

  test("displays goals", async ({ page }) => {
    const goalsSection = page
      .locator("div")
      .filter({ hasText: /Mes objectifs/ })
      .first();

    await expect(
      goalsSection.getByText("Trouver plus facilement un emploi"),
    ).toBeVisible();
    await expect(
      goalsSection.getByText("Se maintenir ou évoluer dans son emploi"),
    ).toBeVisible();
  });

  test("displays AAP comment", async ({ page }) => {
    const commentSection = page
      .locator("div")
      .filter({ hasText: /L'avis de mon accompagnateur/ })
      .first();

    await expect(commentSection.getByText("Favorable")).toBeVisible();
    await expect(
      commentSection.getByText("Candidat très motive et dossier solide."),
    ).toBeVisible();
  });

  test("displays validation form and enables submit button", async ({
    page,
  }) => {
    await expect(
      page.locator(
        'iframe[title="Joindre l’attestation sur l’honneur complétée et signée"]',
      ),
    ).toBeVisible();

    const submitButton = page.getByRole("button", { name: "Envoyer" });
    await expect(submitButton).toBeDisabled();

    await page
      .getByText("J'ai lu et accepte cette version du dossier.")
      .click();

    await expect(submitButton).toBeEnabled();
  });
});
