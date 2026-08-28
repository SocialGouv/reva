import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";

import {
  createGeneralInformationHandlers,
  GENERAL_INFORMATION_URL,
  TARGETED_URL,
  waitForGeneralInformationQueries,
} from "./generalInformation.handlers";

const { aapCommonHandlers } = getAAPCommonHandlers({
  activeFeaturesForConnectedUser: ["MAISON_MERE_GENERAL_INFORMATION_UPDATE"],
});

// Le dépôt part d'un fetch navigateur vers l'API REST: msw ne l'intercepte pas.
const LEGAL_INFORMATION_ROUTE = "**/api/maisonMereAAP/*/legal-information";

// Playwright ne décode pas le multipart: les champs texte sont relus tels quels.
const readFormDataField = (body: string, name: string) =>
  body.match(new RegExp(`name="${name}"\\r?\\n\\r?\\n([^\\r\\n]*)`))?.[1];

test.describe("Parcours de mise à jour des informations générales - AAP", () => {
  test("la tuile d'un compte à jour ouvre l'écran de sélection des blocs", async ({
    page,
    msw,
  }) => {
    const { handlers } = createGeneralInformationHandlers();
    msw.use(...aapCommonHandlers, ...handlers);

    await login({ role: "aap", page });

    await page.goto(`${GENERAL_INFORMATION_URL}/`);
    await waitForGeneralInformationQueries(page, "aap");

    await page
      .getByRole("link", { name: "Modifier mes informations générales" })
      .click();

    await expect(page).toHaveURL(`${TARGETED_URL}/`);
    await expect(page.getByRole("checkbox")).toHaveCount(4);
  });

  test("le parcours limité aux informations de connexion n'exige aucune pièce et se termine par l'écran de confirmation", async ({
    page,
    msw,
  }) => {
    const { handlers } = createGeneralInformationHandlers();
    msw.use(...aapCommonHandlers, ...handlers);

    await login({ role: "aap", page });

    let submittedBody = "";
    await page.route(LEGAL_INFORMATION_ROUTE, async (route) => {
      submittedBody = route.request().postData() ?? "";

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "{}",
      });
    });

    await page.goto(`${TARGETED_URL}/`);
    await waitForGeneralInformationQueries(page, "aap");

    await page
      .getByRole("checkbox", {
        name: "Informations de connexion et de contact",
      })
      .check();
    await page.getByRole("button", { name: "Commencer" }).click();

    await page
      .getByLabel("Adresse électronique de connexion")
      .fill("nouvelle.adresse@example.com");
    await page.getByLabel("Téléphone").fill("0987654321");

    await expect(page.locator('input[type="file"]')).toHaveCount(0);

    await page.getByRole("button", { name: "Envoyer" }).click();

    await expect(
      page.getByRole("heading", {
        name: "Votre demande de mise à jour a bien été envoyée.",
      }),
    ).toBeVisible();

    expect(readFormDataField(submittedBody, "gestionnaireEmail")).toBe(
      "nouvelle.adresse@example.com",
    );
    expect(readFormDataField(submittedBody, "phone")).toBe("0987654321");
  });

  test("le choix de l'identité du dirigeant ajoute une étape de pièces justificatives", async ({
    page,
    msw,
  }) => {
    const { handlers } = createGeneralInformationHandlers();
    msw.use(...aapCommonHandlers, ...handlers);

    await login({ role: "aap", page });

    await page.goto(`${TARGETED_URL}/`);
    await waitForGeneralInformationQueries(page, "aap");

    await page
      .getByRole("checkbox", { name: "Identité du dirigeant", exact: true })
      .check();
    await page.getByRole("button", { name: "Commencer" }).click();

    await page.getByLabel("Nom du (de la) dirigeant(e)").fill("Martin");
    await page.getByLabel("Prénom(s) du (de la) dirigeant(e)").fill("Paul");

    await page.getByRole("button", { name: "Passer à l'étape 2" }).click();

    await expect(page.locator('input[type="file"]')).toHaveCount(2);
    await expect(
      page.getByText("Attestation URSSAF ou attestation MSA"),
    ).toBeVisible();
    await expect(
      page.getByText("Copie du justificatif d'identité du dirigeant"),
    ).toBeVisible();
    await expect(page.getByText("Lettre de délégation")).toHaveCount(0);
  });

  test("le retrait du délégataire exige le justificatif d'identité du dirigeant", async ({
    page,
    msw,
  }) => {
    const { handlers } = createGeneralInformationHandlers({
      gestionnaireFirstname: "Paul",
      gestionnaireLastname: "Martin",
    });
    msw.use(...aapCommonHandlers, ...handlers);

    await login({ role: "aap", page });

    await page.goto(`${TARGETED_URL}/`);
    await waitForGeneralInformationQueries(page, "aap");

    await page
      .getByRole("checkbox", {
        name: "Identité de l'administrateur de compte",
      })
      .check();
    await page.getByRole("button", { name: "Commencer" }).click();

    await page
      .getByRole("checkbox", { name: /deux personnes différentes/ })
      .uncheck();

    await page.getByRole("button", { name: "Passer à l'étape 2" }).click();

    await expect(page.locator('input[type="file"]')).toHaveCount(2);
    await expect(
      page.getByText("Attestation URSSAF ou attestation MSA"),
    ).toBeVisible();
    await expect(
      page.getByText("Copie du justificatif d'identité du dirigeant"),
    ).toBeVisible();
    await expect(page.getByText("Lettre de délégation")).toHaveCount(0);
    await expect(
      page.getByText("Copie du justificatif d'identité du délégataire"),
    ).toHaveCount(0);
  });

  test("un compte à mettre à jour entre directement dans les quatre étapes, sans écran de sélection", async ({
    page,
    msw,
  }) => {
    const { handlers } = createGeneralInformationHandlers({
      statut: "A_METTRE_A_JOUR",
    });
    msw.use(...aapCommonHandlers, ...handlers);

    await login({ role: "aap", page });

    await page.goto(`${GENERAL_INFORMATION_URL}/`);
    await waitForGeneralInformationQueries(page, "aap");

    await page.getByRole("link", { name: "Mise à jour du compte" }).click();

    await page.getByRole("link", { name: "Commencer la mise à jour" }).click();

    await expect(page).toHaveURL(`${TARGETED_URL}/`);
    await expect(
      page.getByText("Quelles informations souhaitez-vous mettre à jour ?"),
    ).toHaveCount(0);
    await expect(page.getByText("Étape 1 sur 4")).toBeVisible();
    await expect(page.getByLabel("Numéro SIRET du siège social")).toBeVisible();
  });
});
