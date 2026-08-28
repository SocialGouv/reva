import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";

import {
  createGeneralInformationHandlers,
  CURRENT_SIRET_FORMATTED,
  GENERAL_INFORMATION_URL,
  MAISON_MERE_ID,
  waitForGeneralInformationQueries,
} from "./generalInformation.handlers";

const { aapCommonHandlers } = getAAPCommonHandlers({
  activeFeaturesForConnectedUser: ["MAISON_MERE_GENERAL_INFORMATION_UPDATE"],
});

const PENDING_SIRET_FORMATTED = "987 654 321 00022";
const PENDING_EMAIL = "nouvelle.adresse@example.com";

// Demande déposée: seuls le SIRET et l'adresse de connexion changent.
test.beforeEach(({ msw }) => {
  const { handlers } = createGeneralInformationHandlers({
    statut: "EN_ATTENTE_DE_VERIFICATION",
    legalInformationDocuments: {
      createdAt: 1735686000000,
      siret: "98765432100022",
      raisonSociale: "Structure de test",
      statutJuridique: "SAS",
      managerFirstname: "Jeanne",
      managerLastname: "Dupont",
      gestionnaireFirstname: "Jeanne",
      gestionnaireLastname: "Dupont",
      gestionnaireEmail: PENDING_EMAIL,
      phone: "0123456789",
    },
  });

  msw.use(...aapCommonHandlers, ...handlers);
});

test.describe("Page informations générales", () => {
  test("une demande en attente affiche la valeur soumise à côté de la valeur actuelle", async ({
    page,
  }) => {
    await login({ role: "aap", page });

    await page.goto(`${GENERAL_INFORMATION_URL}/`);
    await waitForGeneralInformationQueries(page, "aap");

    const siretRow = page.getByTestId("info-row-Numéro de SIRET");
    await expect(siretRow).toContainText(CURRENT_SIRET_FORMATTED);
    await expect(siretRow).toContainText(PENDING_SIRET_FORMATTED);
    await expect(siretRow.getByText("Traitement en cours")).toBeVisible();

    const emailRow = page.getByTestId(
      "info-row-Adresse électronique de connexion",
    );
    await expect(emailRow).toContainText("jeanne.dupont@example.com");
    await expect(emailRow).toContainText(PENDING_EMAIL);
  });

  test("la tuile n'est pas cliquable pendant la vérification", async ({
    page,
  }) => {
    await login({ role: "aap", page });

    await page.goto(`${GENERAL_INFORMATION_URL}/`);
    await waitForGeneralInformationQueries(page, "aap");

    await expect(
      page.getByRole("heading", { name: /Demande de modification envoyée/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Demande de modification envoyée/ }),
    ).toHaveCount(0);
  });

  test("l'administrateur voit les mêmes lignes en lecture seule avec le badge Modifié", async ({
    page,
  }) => {
    await login({ role: "admin", page });

    await page.goto(`${GENERAL_INFORMATION_URL}/`);
    await waitForGeneralInformationQueries(page, "admin");

    const siretRow = page.getByTestId("info-row-Numéro de SIRET");
    await expect(siretRow).toContainText(PENDING_SIRET_FORMATTED);
    await expect(siretRow.getByText("Modifié")).toBeVisible();

    await expect(
      page
        .getByTestId("info-row-Adresse électronique de connexion")
        .getByText("Modifié"),
    ).toBeVisible();

    // Le parcours de modification est réservé à l'AAP : l'administrateur ne voit
    // que la tuile menant à la fiche de vérification.
    await expect(
      page.getByRole("link", { name: "Modifier mes informations générales" }),
    ).toHaveCount(0);

    await expect(
      page.getByRole("link", { name: "Mise à jour du compte" }),
    ).toHaveAttribute(
      "href",
      new RegExp(`/admin2/maisonMereAAPs/${MAISON_MERE_ID}`),
    );
  });
});
