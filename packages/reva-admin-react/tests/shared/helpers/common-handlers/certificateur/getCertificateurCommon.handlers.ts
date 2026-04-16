import { graphql, Page } from "next/experimental/testmode/playwright/msw";

import { graphQLResolver } from "../../network/msw";
import { waitGraphQL } from "../../network/requests";

const certificateurCommonWait = async (page: Page) => {
  await Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getMaisonMereCGUQuery"),
    waitGraphQL(page, "getCandidacyWithCandidateInfoForLayout"),
    waitGraphQL(page, "getCertificationAuthorityStructureCGUQuery"),
  ]);
};

export const getCertificateurCommonHandlers = ({
  candidacyId = "42288593-2a6b-4606-aedd-0d76348b39f4",
  candidateFirstname = "Alice",
  candidateLastname = "Doe",
  activeFeaturesForConnectedUser = [],
}: {
  candidacyId?: string;
  candidateFirstname?: string;
  candidateLastname?: string;
  /** Feature flags returned by `activeFeaturesForConnectedUser` (default: none). */
  activeFeaturesForConnectedUser?: string[];
} = {}) => {
  const fvae = graphql.link("https://reva-api/api/graphql");

  return {
    certificateurCommonHandlers: [
      fvae.query(
        "activeFeaturesForConnectedUser",
        graphQLResolver({
          activeFeaturesForConnectedUser,
        }),
      ),
      fvae.query(
        "getMaisonMereCGUQuery",
        graphQLResolver({
          account_getAccountForConnectedUser: {
            maisonMereAAP: null,
          },
        }),
      ),
      fvae.query(
        "getCandidacyWithCandidateInfoForLayout",
        graphQLResolver({
          getCandidacyById: {
            id: candidacyId,
            typeAccompagnement: "ACCOMPAGNE",
            candidate: {
              firstname: candidateFirstname,
              lastname: candidateLastname,
            },
            jury: null,
          },
        }),
      ),
      fvae.query(
        "getCertificationAuthorityStructureCGUQuery",
        graphQLResolver({
          account_getAccountForConnectedUser: {
            certificationRegistryManager: null,
            certificationAuthority: null,
            certificationAuthorityLocalAccount: null,
          },
        }),
      ),
      fvae.query(
        "candidacy_canAccessCandidacy",
        graphQLResolver({ candidacy_canAccessCandidacy: true }),
      ),
    ],
    certificateurCommonWait,
  };
};
