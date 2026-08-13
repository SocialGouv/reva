import { graphql, Page } from "next/experimental/testmode/playwright/msw";

import { graphQLResolver } from "../../network/msw";
import { waitGraphQL } from "../../network/requests";

import {
  CERTIFICATION_AUTHORITY_STRUCTURE_CGU_QUERY_NAMES,
  waitCertificationAuthorityStructureCGUQuery,
} from "./getCertificateurCommon.handlers";

const certificateurSettingsCommonWait = async (page: Page) => {
  await Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getMaisonMereCGUQuery"),
    Promise.race([
      waitGraphQL(page, "getCertificationAuthorityForHeader"),
      waitGraphQL(page, "getCertificationAuthorityLocalAccountForHeader"),
    ]),
    waitCertificationAuthorityStructureCGUQuery(page),
  ]);
};

const certificateurSettingsAdminCommonWait = async (page: Page) => {
  await Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getMaisonMereCGUQuery"),
  ]);
};

export const getCertificateurSettingsCommonHandlers = ({
  certificationAuthorityId,
}: {
  certificationAuthorityId: string;
}) => {
  const fvae = graphql.link("https://reva-api/api/graphql");

  return {
    certificateurSettingsCommonHandlers: [
      fvae.query(
        "activeFeaturesForConnectedUser",
        graphQLResolver({
          activeFeaturesForConnectedUser: [
            "DF_DISPLAY_LOCAL_ACCOUNTS_OF_CERTIFICATION_AUTHORITY",
            "AFFICHAGE_TYPES_FINANCEMENT_CANDIDATURE",
            "IMPERSONATE",
            "AAP_CGU",
            "AAP_SETTINGS_V3",
          ],
        }),
      ),
      fvae.query(
        "getMaisonMereCGUQuery",
        graphQLResolver({
          account_getAccountForConnectedUser: {
            maisonMereAAP: {
              id: "7b7539e7-a30c-4a6e-b13a-a82cdb6b4081",
              cgu: {
                version: 2,
                acceptedAt: 1725001318488,
                isLatestVersion: true,
              },
            },
          },
        }),
      ),
      ...CERTIFICATION_AUTHORITY_STRUCTURE_CGU_QUERY_NAMES.map(
        (operationName) =>
          fvae.query(
            operationName,
            graphQLResolver({
              account_getAccountForConnectedUser: {
                certificationRegistryManager: null,
                certificationAuthority: null,
                certificationAuthorityLocalAccount: null,
              },
            }),
          ),
      ),
      fvae.query(
        "getCertificationAuthorityForHeader",
        graphQLResolver({
          account_getAccountForConnectedUser: {
            certificationAuthority: {
              id: certificationAuthorityId,
              metabaseDashboardIframeUrl: null,
            },
          },
        }),
      ),
      fvae.query(
        "getCertificationAuthorityLocalAccountForHeader",
        graphQLResolver({
          account_getAccountForConnectedUser: {
            certificationAuthorityLocalAccount: {
              certificationAuthority: {
                id: certificationAuthorityId,
              },
            },
          },
        }),
      ),
    ],
    certificateurSettingsAdminCommonWait,
    certificateurSettingsCommonWait,
  };
};
