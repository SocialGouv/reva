import { graphql, Page } from "next/experimental/testmode/playwright/msw";

import { graphQLResolver } from "../../network/msw";
import { waitGraphQL } from "../../network/requests";

const aapCommonWait = async (page: Page) => {
  await Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getAccountInfo"),
    waitGraphQL(page, "getMaisonMereCGUQuery"),
    waitGraphQL(page, "getCandidacyMenuAndCandidateInfos"),
    waitGraphQL(page, "candidacy_canAccessCandidacy"),
  ]);
};

export const getAAPCommonHandlers = () => {
  const fvae = graphql.link("https://reva-api/api/graphql");

  return {
    aapCommonHandlers: [
      fvae.query(
        "activeFeaturesForConnectedUser",
        graphQLResolver({
          activeFeaturesForConnectedUser: [],
        }),
      ),
      fvae.query(
        "getAccountInfo",
        graphQLResolver({
          account_getAccountForConnectedUser: {
            maisonMereAAP: null,
          },
        }),
      ),
      fvae.query(
        "getMaisonMereCGUQuery",
        graphQLResolver({
          maisonMereAAP: {
            id: "7b7539e7-a30c-4a6e-b13a-a82cdb6b4081",
            cgu: {
              version: 2,
              acceptedAt: 1725001318488,
              isLatestVersion: true,
            },
          },
        }),
      ),
      fvae.query(
        "getCandidacyMenuAndCandidateInfos",
        graphQLResolver({
          getCandidacyMenuAndCandidateInfos: {
            candidacyMenu_getCandidacyMenu: {
              menuHeader: [],
              mainMenu: [],
              menuFooter: [],
            },
          },
        }),
      ),
      fvae.query(
        "candidacy_canAccessCandidacy",
        graphQLResolver({ candidacy_canAccessCandidacy: true }),
      ),
    ],
    aapCommonWait,
  };
};
