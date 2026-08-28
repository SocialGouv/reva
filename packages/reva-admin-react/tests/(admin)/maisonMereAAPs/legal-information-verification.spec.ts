import {
  expect,
  graphql,
  HttpResponse,
  Page,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../shared/helpers/network/msw";
import { waitGraphQL } from "../../shared/helpers/network/requests";

const fvae = graphql.link("https://reva-api/api/graphql");

const { aapCommonHandlers } = getAAPCommonHandlers({
  activeFeaturesForConnectedUser: ["MAISON_MERE_GENERAL_INFORMATION_UPDATE"],
});

const MAISON_MERE_ID = "0d9a5cbe-6c1e-4c1a-9d4f-5f2a1c9b7e30";
const VERIFICATION_PAGE_PATH = `/admin2/maisonMereAAPs/${MAISON_MERE_ID}`;

const CURRENT_SIRET = "12345678900011";
const CURRENT_SIRET_FORMATTED = "123 456 789 00011";
const PENDING_SIRET = "98765432100022";
const PENDING_SIRET_FORMATTED = "987 654 321 00022";

// Messages du référentiel `nonConformityMotives.ts`, envoyés tels quels à la structure.
const SIRET_NON_CONCORDANT_MESSAGE =
  "Le numéro SIRET indiqué sur l’attestation URSSAF ne correspond pas à celui renseigné sur la plateforme France VAE.";
const PIECE_IDENTITE_INCOMPLETE_DIRIGEANT_MESSAGE =
  "Merci de fournir le recto et le verso de la pièce d’identité du dirigeant.";

type DecisionVariables = {
  data: { maisonMereAAPId: string; decision: string };
};

const createVerificationHandlers = (options?: {
  siretAlreadyUsed?: boolean;
}) => {
  const decisionVariables: DecisionVariables[] = [];

  const handlers = [
    fvae.query(
      "getMaisonMereAAPById",
      graphQLResolver({
        organism_getMaisonMereAAPById: {
          id: MAISON_MERE_ID,
          phone: "0102030405",
          siret: CURRENT_SIRET,
          raisonSociale: "Structure de test",
          createdAt: 1704067200000,
          statutValidationInformationsJuridiquesMaisonMereAAP:
            "EN_ATTENTE_DE_VERIFICATION",
          managerFirstname: "Jean",
          managerLastname: "Dupont",
          legalInformationDocuments: {
            createdAt: 1706745600000,
            managerFirstname: "Jeanne",
            managerLastname: "Dupont",
            siret: PENDING_SIRET,
            gestionnaireFirstname: "Marie",
            gestionnaireLastname: "Bernard",
            gestionnaireEmail: "marie.bernard@example.com",
            // Téléphone inchangé: la ligne ne doit porter aucun badge.
            phone: "0102030405",
            siretAlreadyUsed: options?.siretAlreadyUsed ?? false,
            gestionnaireEmailAlreadyUsed: false,
            attestationURSSAFFile: { previewUrl: "about:blank" },
            justificatifIdentiteDirigeantFile: { previewUrl: "about:blank" },
            lettreDeDelegationFile: { previewUrl: "about:blank" },
            justificatifIdentiteDelegataireFile: { previewUrl: "about:blank" },
          },
          gestionnaire: {
            firstname: "Marie",
            lastname: "Martin",
            email: "marie.martin@example.com",
          },
        },
      }),
    ),
    fvae.query(
      "getEtablissement",
      graphQLResolver({
        getEtablissementAsAdmin: {
          siret: PENDING_SIRET,
          siegeSocial: true,
          raisonSociale: "Structure de test",
          formeJuridique: {
            code: "5710",
            libelle: "SAS, société par actions simplifiée",
            legalStatus: "SAS",
          },
          kbis: null,
          dateFermeture: null,
          qualiopiStatus: true,
        },
      }),
    ),
    fvae.mutation(
      "updateLegalInformationValidationDecision",
      ({ variables }) => {
        decisionVariables.push(variables as DecisionVariables);

        return HttpResponse.json({
          data: {
            organism_updateLegalInformationValidationDecision: {
              id: MAISON_MERE_ID,
            },
          },
        });
      },
    ),
    ...aapCommonHandlers,
  ];

  return { handlers, decisionVariables };
};

const goToVerificationPage = async (page: Page) => {
  await login({ role: "admin", page });
  await page.goto(VERIFICATION_PAGE_PATH);

  await Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getMaisonMereCGUQuery"),
    waitGraphQL(page, "getMaisonMereAAPById"),
  ]);
};

const infoRow = (page: Page, label: string) =>
  page.getByTestId(`info-row-${label}`);

const generatedCommentPanel = (page: Page) =>
  page.locator('div:has(> h3:text-is("Commentaire généré :"))');

test.describe("Fiche de vérification d'une demande de mise à jour", () => {
  test("chaque information modifiée est affichée avec sa valeur actuelle et sa valeur soumise", async ({
    page,
    msw,
  }) => {
    msw.use(...createVerificationHandlers().handlers);

    await goToVerificationPage(page);

    const siretRow = infoRow(page, "Numéro de SIRET");
    await expect(siretRow.getByText("Modifié")).toBeVisible();
    await expect(siretRow).toContainText(CURRENT_SIRET_FORMATTED);
    await expect(siretRow).toContainText(PENDING_SIRET_FORMATTED);

    const managerRow = infoRow(page, "Dirigeant(e)");
    await expect(managerRow.getByText("Modifié")).toBeVisible();
    await expect(managerRow).toContainText("Jean Dupont");
    await expect(managerRow).toContainText("Jeanne Dupont");

    const gestionnaireRow = infoRow(page, "Administrateur");
    await expect(gestionnaireRow.getByText("Modifié")).toBeVisible();
    await expect(gestionnaireRow).toContainText("Marie Martin");
    await expect(gestionnaireRow).toContainText("Marie Bernard");

    const phoneRow = infoRow(page, "Téléphone");
    await expect(phoneRow).toContainText("0102030405");
    await expect(phoneRow.getByText("Modifié")).toHaveCount(0);
  });

  test("un SIRET déjà enregistré est signalé sur la fiche", async ({
    page,
    msw,
  }) => {
    msw.use(...createVerificationHandlers({ siretAlreadyUsed: true }).handlers);

    await goToVerificationPage(page);

    const siretRow = infoRow(page, "Numéro de SIRET");
    await expect(siretRow.getByText("Modifié")).toBeVisible();
    await expect(
      siretRow.getByText("Déjà enregistré sur France VAE"),
    ).toBeVisible();
  });

  test("les motifs de non-conformité cochés composent le commentaire généré", async ({
    page,
    msw,
  }) => {
    msw.use(...createVerificationHandlers().handlers);

    await goToVerificationPage(page);

    await page
      .getByRole("radio", { name: "Demander des précisions" })
      .check({ force: true });

    await page
      .getByRole("checkbox", { name: "Pièce d'identité incomplète dirigeant" })
      .check({ force: true });
    await page
      .getByRole("checkbox", { name: "SIRET non concordant" })
      .check({ force: true });

    await expect(generatedCommentPanel(page).getByRole("listitem")).toHaveText([
      SIRET_NON_CONCORDANT_MESSAGE,
      PIECE_IDENTITE_INCOMPLETE_DIRIGEANT_MESSAGE,
    ]);
  });

  test("une demande de précision sans motif ni commentaire est refusée", async ({
    page,
    msw,
  }) => {
    const { handlers, decisionVariables } = createVerificationHandlers();
    msw.use(...handlers);

    await goToVerificationPage(page);

    await page
      .getByRole("radio", { name: "Demander des précisions" })
      .check({ force: true });
    await page.getByRole("button", { name: "Envoyer" }).click();

    await expect(
      page.getByText(
        "Veuillez sélectionner au moins un motif de non-conformité ou renseigner un commentaire",
      ),
    ).toBeVisible();

    expect(decisionVariables).toHaveLength(0);
  });

  test("la validation envoie la décision VALIDE", async ({ page, msw }) => {
    const { handlers, decisionVariables } = createVerificationHandlers();
    msw.use(...handlers);

    await goToVerificationPage(page);

    await page
      .getByRole("radio", { name: "Valider la demande" })
      .check({ force: true });
    await page.getByRole("button", { name: "Envoyer" }).click();

    await expect.poll(() => decisionVariables.length).toBe(1);
    expect(decisionVariables[0].data.decision).toBe("VALIDE");
    expect(decisionVariables[0].data.maisonMereAAPId).toBe(MAISON_MERE_ID);
  });
});
