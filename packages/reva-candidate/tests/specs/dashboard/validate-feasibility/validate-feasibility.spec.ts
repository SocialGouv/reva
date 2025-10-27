import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import {
  navigateToValidateFeasibility,
  validateFeasibilityHandlers,
} from "@tests/helpers/handlers/validate-feasibility/validate-feasibility.handler";

test.describe("Dematerialized feasibility résumé", () => {
  const { handlers, validateFeasibilityWait, candidateId, candidacyId } =
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
    await navigateToValidateFeasibility(page, candidateId, candidacyId);
    await validateFeasibilityWait(page);
  });

  test("displays candidate information", async ({ page }) => {
    const candidateSection = page.locator("section", {
      has: page.getByRole("heading", {
        name: /Durand Claire/,
      }),
    });

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

  test("displays candidate education levels", async ({ page }) => {
    const candidateSection = page.locator("section", {
      has: page.getByRole("heading", {
        name: /Durand Claire/,
      }),
    });

    await expect(
      candidateSection.getByLabel("Niveau de formation le plus élevé"),
    ).toHaveText("5");

    await expect(
      candidateSection.getByLabel(
        "Niveau de la certification obtenue la plus élevée",
      ),
    ).toHaveText("4");

    await expect(
      candidateSection.getByLabel(
        "Intitulé de la certification la plus élevée obtenue",
      ),
    ).toHaveText("BTS logistique");
  });

  test("displays certification information", async ({ page }) => {
    const certificationSection = page.locator("section", {
      has: page.getByRole("heading", {
        name: "Certification visée",
      }),
    });

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
      certificationSection.getByLabel("Langue vivante 1 :"),
    ).toHaveText("Anglais");
    await expect(
      certificationSection.getByLabel("Langue vivante 2 :"),
    ).toHaveText("Espagnol");
  });

  test("displays blocs de competences", async ({ page }) => {
    const experiencesSection = page.locator("section", {
      has: page.getByRole("heading", {
        name: "Expériences professionnelles",
      }),
    });

    const blocsSection = experiencesSection.locator("section", {
      has: page.getByRole("heading", {
        name: "Blocs de compétences",
      }),
    });

    const blocA = blocsSection.locator("section").filter({
      hasText: "48379857 - Organiser et piloter les activites logistiques",
    });
    await expect(
      blocA.getByText(
        "Experience significative en gestion d'equipe sur site logistique.",
      ),
    ).toBeVisible();

    const competenceA1 = blocA.locator("> div > div").nth(0);
    await expect(competenceA1).toContainText("Oui");
    await expect(competenceA1).toContainText(
      "Definir les indicateurs de performance",
    );

    const competenceA2 = blocA.locator("> div > div").nth(1);
    await expect(competenceA2).toContainText("Partiellement");
    await expect(competenceA2).toContainText("Manager les equipes logistiques");

    const blocB = blocsSection
      .locator("section")
      .filter({ hasText: "2849037 - Digitaliser les processus logistiques" });
    await expect(
      blocB.getByText(
        "Competences a confirmer sur la digitalisation des flux.",
      ),
    ).toBeVisible();

    const competenceB1 = blocB.locator("> div > div").nth(0);
    await expect(competenceB1).toContainText("Non");
    await expect(competenceB1).toContainText(
      "Mettre en place des outils de suivi en temps reel",
    );

    const competenceB2 = blocB.locator("> div > div").nth(1);
    await expect(competenceB2).toContainText("Oui");
    await expect(competenceB2).toContainText(
      "Superviser l'integration des donnees",
    );
  });

  test("displays prerequisites", async ({ page }) => {
    const certificationSection = page.locator("section", {
      has: page.getByRole("heading", {
        name: "Certification visée",
      }),
    });

    const prerequisitesSection = certificationSection.locator("section", {
      has: page.getByRole("heading", {
        name: "Prérequis obligatoires",
      }),
    });

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
    const experiencesSection = page.locator("section", {
      has: page.getByRole("heading", { name: "Expériences professionnelles" }),
    });

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
    const trainingSection = page.locator("section", {
      has: page.getByRole("heading", { name: "Parcours proposé" }),
    });

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
    const goalsSection = page.locator("section", {
      has: page.getByRole("heading", { name: "Mes objectifs" }),
    });

    await expect(
      goalsSection.getByText("Trouver plus facilement un emploi"),
    ).toBeVisible();
    await expect(
      goalsSection.getByText("Se maintenir ou évoluer dans son emploi"),
    ).toBeVisible();
  });

  test("displays AAP comment", async ({ page }) => {
    const commentSection = page.locator("section", {
      has: page.getByRole("heading", {
        name: "L'avis de mon accompagnateur",
      }),
    });

    await expect(commentSection.getByText("Favorable")).toBeVisible();
    await expect(
      commentSection.getByText("Candidat très motive et dossier solide."),
    ).toBeVisible();
  });

  test("displays eligibility information", async ({ page }) => {
    const eligibilitySection = page.locator("section", {
      has: page.getByRole("heading", { name: "Recevabilité du candidat" }),
    });

    await expect(eligibilitySection).toContainText(
      "Accès au dossier de faisabilité intégral",
    );

    await expect(
      eligibilitySection.getByLabel("Date de fin de validité"),
    ).toHaveText("31/12/2024");
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
