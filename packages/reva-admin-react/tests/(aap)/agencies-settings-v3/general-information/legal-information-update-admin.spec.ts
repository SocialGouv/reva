import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { waitGraphQL } from "../../../shared/helpers/network/requests";

import {
  createGeneralInformationHandlers,
  CURRENT_SIRET,
  LEGAL_INFORMATION_URL,
  MAISON_MERE_ID,
  waitForGeneralInformationQueries,
} from "./generalInformation.handlers";

const { aapCommonHandlers } = getAAPCommonHandlers({
  activeFeaturesForConnectedUser: ["MAISON_MERE_GENERAL_INFORMATION_UPDATE"],
});

let capturedVariables: ReturnType<
  typeof createGeneralInformationHandlers
>["capturedVariables"];

test.beforeEach(async ({ page, msw }) => {
  const generalInformationHandlers = createGeneralInformationHandlers();
  capturedVariables = generalInformationHandlers.capturedVariables;
  msw.use(...aapCommonHandlers, ...generalInformationHandlers.handlers);

  await login({ role: "admin", page });

  await page.goto(`${LEGAL_INFORMATION_URL}/`);
  await waitForGeneralInformationQueries(page, "admin");
});

test.describe("Parcours de mise à jour des informations générales - administrateur", () => {
  test("l'invisibilisation envoie la demande de mise à jour totale et rend la structure invisible", async ({
    page,
  }) => {
    await page
      .getByRole("button", { name: "Faire une demande de mise à jour totale" })
      .click();

    const decisionSent = waitGraphQL(
      page,
      "updateLegalInformationValidationDecision",
    );
    await page.getByRole("button", { name: "Invisibiliser" }).click();
    await decisionSent;

    expect(
      capturedVariables.updateLegalInformationValidationDecision,
    ).toMatchObject({
      maisonMereAAPId: MAISON_MERE_ID,
      decision: "DEMANDE_DE_MISE_A_JOUR_TOTALE",
      makeInvisible: true,
    });
  });

  test("laisser la structure visible envoie la même demande sans invisibilisation", async ({
    page,
  }) => {
    await page
      .getByRole("button", { name: "Faire une demande de mise à jour totale" })
      .click();

    const decisionSent = waitGraphQL(
      page,
      "updateLegalInformationValidationDecision",
    );
    await page.getByRole("button", { name: "Laisser visible" }).click();
    await decisionSent;

    expect(
      capturedVariables.updateLegalInformationValidationDecision,
    ).toMatchObject({
      decision: "DEMANDE_DE_MISE_A_JOUR_TOTALE",
      makeInvisible: false,
    });
  });

  test("la modification partielle enregistre l'ensemble des informations sans étape de pièces justificatives", async ({
    page,
  }) => {
    await page
      .getByRole("link", { name: "Faire une mise à jour partielle" })
      .click();

    await page
      .getByRole("checkbox", { name: "Identité du dirigeant", exact: true })
      .check();
    await page
      .getByRole("checkbox", {
        name: "Informations de connexion et de contact",
      })
      .check();
    await page.getByRole("button", { name: "Commencer" }).click();

    await page.getByLabel("Nom du (de la) dirigeant(e)").fill("Martin");
    await page.getByLabel("Prénom(s) du (de la) dirigeant(e)").fill("Paul");
    await page.getByRole("button", { name: "Passer à l'étape 2" }).click();

    await expect(page.getByText("Étape 2 sur 2")).toBeVisible();
    await expect(page.locator('input[type="file"]')).toHaveCount(0);

    const updateSent = waitGraphQL(page, "updateMaisonMereLegalInformation");
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await updateSent;

    await expect(
      page.getByRole("heading", {
        name: "Votre demande de mise à jour a bien été enregistrée.",
      }),
    ).toBeVisible();

    expect(capturedVariables.updateMaisonMereLegalInformation).toEqual({
      maisonMereAAPId: MAISON_MERE_ID,
      siret: CURRENT_SIRET,
      raisonSociale: "Structure de test",
      statutJuridique: "SAS",
      managerFirstname: "Paul",
      managerLastname: "Martin",
      gestionnaireFirstname: "Jeanne",
      gestionnaireLastname: "Dupont",
      gestionnaireEmail: "jeanne.dupont@example.com",
      phone: "0123456789",
      gestionBranch: false,
    });
  });
});
