import {
  graphql,
  HttpResponse,
  Page,
} from "next/experimental/testmode/playwright/msw";

import { StatutValidationInformationsJuridiquesMaisonMereAap } from "@/graphql/generated/graphql";

import { graphQLResolver } from "../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../shared/helpers/network/requests";

const fvae = graphql.link("https://reva-api/api/graphql");

export const MAISON_MERE_ID = "f2f30d4f-2f6e-4d4c-b2d3-9c0c0a5b6e10";
// basePath compris: `page.goto` et `toHaveURL` résolvent depuis la racine du domaine.
export const GENERAL_INFORMATION_URL = `/admin2/agencies-settings-v3/${MAISON_MERE_ID}/general-information`;
export const LEGAL_INFORMATION_URL = `${GENERAL_INFORMATION_URL}/legal-information`;
export const TARGETED_URL = `${LEGAL_INFORMATION_URL}/targeted`;

export const CURRENT_SIRET = "12345678900011";
export const CURRENT_SIRET_FORMATTED = "123 456 789 00011";

type PendingValues = {
  createdAt: number;
  siret: string;
  raisonSociale: string;
  statutJuridique: string;
  managerFirstname: string;
  managerLastname: string;
  gestionnaireFirstname: string;
  gestionnaireLastname: string;
  gestionnaireEmail: string;
  phone: string;
};

const ETABLISSEMENT = {
  siret: CURRENT_SIRET,
  raisonSociale: "Structure de test",
  formeJuridique: {
    code: "5710",
    libelle: "SAS, société par actions simplifiée",
    legalStatus: "SAS",
  },
  siegeSocial: true,
  dateFermeture: null,
  qualiopiStatus: true,
};

export const createGeneralInformationHandlers = ({
  statut = "A_JOUR",
  managerFirstname = "Jeanne",
  managerLastname = "Dupont",
  gestionnaireFirstname = "Jeanne",
  gestionnaireLastname = "Dupont",
  gestionnaireEmail = "jeanne.dupont@example.com",
  phone = "0123456789",
  legalInformationDocuments = null,
}: {
  statut?: StatutValidationInformationsJuridiquesMaisonMereAap;
  managerFirstname?: string;
  managerLastname?: string;
  gestionnaireFirstname?: string;
  gestionnaireLastname?: string;
  gestionnaireEmail?: string;
  phone?: string;
  legalInformationDocuments?: PendingValues | null;
} = {}) => {
  const maisonMereAAP = {
    id: MAISON_MERE_ID,
    siret: CURRENT_SIRET,
    raisonSociale: "Structure de test",
    phone,
    managerFirstname,
    managerLastname,
    statutValidationInformationsJuridiquesMaisonMereAAP: statut,
    typologie: "generaliste",
    legalInformationDocumentsDecisions: [],
    legalInformationDocuments,
    gestionnaire: {
      firstname: gestionnaireFirstname,
      lastname: gestionnaireLastname,
      email: gestionnaireEmail,
    },
    organisms: [],
  };

  // Les deux mutations du parcours renvoient leurs variables aux tests: c'est la
  // charge utile envoyée à l'API qui est vérifiée, pas le rendu qui la suit.
  const capturedVariables: {
    updateMaisonMereLegalInformation?: Record<string, unknown>;
    updateLegalInformationValidationDecision?: Record<string, unknown>;
  } = {};

  const handlers = [
    fvae.query(
      "getAccountMaisonMereGeneralInformation",
      graphQLResolver({
        account_getAccountForConnectedUser: { maisonMereAAP },
      }),
    ),
    fvae.query(
      "getMaisonMereAAPGeneralInformationAdmin",
      graphQLResolver({ organism_getMaisonMereAAPById: maisonMereAAP }),
    ),
    fvae.query(
      "getEtablissementForAgenciesSettings",
      graphQLResolver({ getEtablissement: ETABLISSEMENT }),
    ),
    fvae.mutation("updateMaisonMereLegalInformation", ({ variables }) => {
      capturedVariables.updateMaisonMereLegalInformation = variables.data;

      return HttpResponse.json({
        data: { organism_updateMaisonMereLegalInformation: null },
      });
    }),
    fvae.mutation(
      "updateLegalInformationValidationDecision",
      ({ variables }) => {
        capturedVariables.updateLegalInformationValidationDecision =
          variables.data;

        return HttpResponse.json({
          data: {
            organism_updateLegalInformationValidationDecision: {
              id: MAISON_MERE_ID,
            },
          },
        });
      },
    ),
  ];

  return { handlers, capturedVariables };
};

export const waitForGeneralInformationQueries = (
  page: Page,
  role: "aap" | "admin",
) =>
  Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getAccountInfo"),
    waitGraphQL(page, "getMaisonMereCGUQuery"),
    waitGraphQL(
      page,
      role === "admin"
        ? "getMaisonMereAAPGeneralInformationAdmin"
        : "getAccountMaisonMereGeneralInformation",
    ),
    waitGraphQL(page, "getEtablissementForAgenciesSettings"),
  ]);
