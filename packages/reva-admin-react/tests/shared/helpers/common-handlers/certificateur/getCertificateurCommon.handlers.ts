import { graphql, Page } from "next/experimental/testmode/playwright/msw";

import { graphQLResolver } from "../../network/msw";
import { waitGraphQL } from "../../network/requests";

const certificateurCommonWait = async (page: Page) => {
  await Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getMaisonMereCGUQuery"),
    waitGraphQL(page, "getCandidacyWithCandidateInfoForLayout"),
    waitGraphQL(page, "getFeasibilityCountByCategory"),
    waitGraphQL(page, "getDossierDeValidationCountByCategory"),
    waitGraphQL(page, "getJuryCountByCategory"),
  ]);
};

export const getCertificateurCommonHandlers = ({
  candidacyId = "42288593-2a6b-4606-aedd-0d76348b39f4",
  candidateFirstname = "Alice",
  candidateLastname = "Doe",
}: {
  candidacyId?: string;
  candidateFirstname?: string;
  candidateLastname?: string;
} = {}) => {
  const fvae = graphql.link("https://reva-api/api/graphql");

  return {
    certificateurCommonHandlers: [
      fvae.query(
        "activeFeaturesForConnectedUser",
        graphQLResolver({
          activeFeaturesForConnectedUser: [],
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
        "getFeasibilityCountByCategory",
        graphQLResolver({
          feasibilityCountByCategory: {
            ALL: 151,
            PENDING: 28,
            REJECTED: 20,
            ADMISSIBLE: 99,
            COMPLETE: 9,
            INCOMPLETE: 15,
            ARCHIVED: 16,
            DROPPED_OUT: 66,
            VAE_COLLECTIVE: 1,
          },
          cohortesVaeCollectivesForConnectedCertificationAuthorityOrLocalAccount:
            [],
        }),
      ),
      fvae.query(
        "getDossierDeValidationCountByCategory",
        graphQLResolver({
          dossierDeValidation_dossierDeValidationCountByCategory: {
            ALL: 28,
            PENDING: 18,
            INCOMPLETE: 10,
          },
        }),
      ),
      fvae.query(
        "getJuryCountByCategory",
        graphQLResolver({
          jury_juryCountByCategory: {
            SCHEDULED: 3,
            PASSED: 118,
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
