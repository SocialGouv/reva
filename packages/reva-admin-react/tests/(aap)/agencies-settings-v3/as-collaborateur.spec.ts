import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../shared/helpers/network/msw";
import { waitGraphQL } from "../../shared/helpers/network/requests";

import type { Page } from "@playwright/test";

const fvae = graphql.link("https://reva-api/api/graphql");

function createSettingsHandlers(args?: {
  modaliteAccompagnement?: "A_DISTANCE" | "LIEU_ACCUEIL";
  modaliteAccompagnementRenseigneeEtValide?: boolean;
  isVisibleInCandidateSearchResults?: boolean;
}) {
  const modaliteAccompagnement = args?.modaliteAccompagnement ?? "A_DISTANCE";
  const modaliteAccompagnementRenseigneeEtValide =
    args?.modaliteAccompagnementRenseigneeEtValide ?? true;
  const isVisibleInCandidateSearchResults =
    args?.isVisibleInCandidateSearchResults ?? true;

  // Base structure from collaborateur-settings.json
  const settingsData = {
    account_getAccountForConnectedUser: {
      id: "account-1",
      firstname: "John",
      lastname: "Doe",
      email: "john.doe@example.com",
      maisonMereAAP: {
        id: "7b7539e7-a30c-4a6e-b13a-a82cdb6b4081",
      },
      organisms: [
        {
          id: "29994a9a-f166-48b9-974f-f3b3dbccda19",
          isOnSite: modaliteAccompagnement === "LIEU_ACCUEIL",
          isRemote: modaliteAccompagnement === "A_DISTANCE",
          isVisibleInCandidateSearchResults,
          remoteZones:
            modaliteAccompagnement === "A_DISTANCE"
              ? ["FRANCE_METROPOLITAINE"]
              : [],
          modaliteAccompagnement,
          modaliteAccompagnementRenseigneeEtValide,
          label: "Test Organism",
          nomPublic: "Test Organism",
          accounts: [
            {
              id: "e45b3b63-6bf4-4181-801d-51b19c722580",
              firstname: "John",
              lastname: "Doe",
              email: "joen.doe@example.com",
            },
            {
              id: "8f5fcf2d-ef76-4560-90d0-b151186b1c46",
              firstname: "Alice",
              lastname: "Doe",
              email: "alice.doe@example.com",
            },
            {
              id: "6d1ffe00-a8b5-4f4f-a5ea-d1fe71282ec5",
              firstname: "Bob",
              lastname: "Joe",
              email: "bob.joe@example.com",
            },
          ],
        },
      ],
    },
  };

  return [
    fvae.query("getCollaborateurSettingsInfo", graphQLResolver(settingsData)),
  ];
}

async function waitForPageQueries(page: Page) {
  await Promise.all([
    waitGraphQL(page, "getCollaborateurSettingsInfo"),
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getAccountInfo"),
    waitGraphQL(page, "getMaisonMereCGUQuery"),
  ]);
}

const { aapCommonHandlers } = getAAPCommonHandlers();

test.describe("Collaborateur AAP settings page", () => {
  test("do not display general information and user account list sections", async ({
    page,
    msw,
  }) => {
    msw.use(
      ...aapCommonHandlers,
      ...createSettingsHandlers({
        modaliteAccompagnement: "A_DISTANCE",
        modaliteAccompagnementRenseigneeEtValide: true,
        isVisibleInCandidateSearchResults: true,
      }),
    );

    await login({ role: "aapCollaborateur", page });

    await page.goto(`/admin2/agencies-settings-v3/`);
    await waitForPageQueries(page);

    // Make sure the page is ready before checking non-existence of the general information section
    await expect(page.getByTestId("remote-organism")).toBeVisible();
    await expect(page.getByTestId("general-information")).not.toBeVisible();
    await expect(page.getByTestId("user-accounts")).not.toBeVisible();
  });

  test.describe("for a remote organism", () => {
    test("display a remote and user accounts section, no on-site section", async ({
      page,
      msw,
    }) => {
      msw.use(
        ...aapCommonHandlers,
        ...createSettingsHandlers({
          modaliteAccompagnement: "A_DISTANCE",
          modaliteAccompagnementRenseigneeEtValide: true,
          isVisibleInCandidateSearchResults: true,
        }),
      );

      await login({ role: "aapCollaborateur", page });

      await page.goto(`/admin2/agencies-settings-v3/`);
      await waitForPageQueries(page);

      await expect(page.getByTestId("remote-organism")).toBeVisible();
      await expect(page.getByTestId("user-account")).toBeVisible();
      await expect(page.getByTestId("on-site-organism")).not.toBeVisible();
      await expect(page.getByTestId("on-site-organisms")).not.toBeVisible();
    });

    test("display a remote section with a 'visible badge' when organism is opened for new candidacies", async ({
      page,
      msw,
    }) => {
      msw.use(
        ...aapCommonHandlers,
        ...createSettingsHandlers({
          modaliteAccompagnement: "A_DISTANCE",
          modaliteAccompagnementRenseigneeEtValide: true,
          isVisibleInCandidateSearchResults: true,
        }),
      );

      await login({ role: "aapCollaborateur", page });

      await page.goto(`/admin2/agencies-settings-v3/`);
      await waitForPageQueries(page);

      await expect(
        page.getByTestId("remote-organism").getByTestId("visible-badge"),
      ).toBeVisible();
    });

    test("display a remote section with a 'invisible badge' when organism is closed for new candidacies", async ({
      page,
      msw,
    }) => {
      msw.use(
        ...aapCommonHandlers,
        ...createSettingsHandlers({
          modaliteAccompagnement: "A_DISTANCE",
          modaliteAccompagnementRenseigneeEtValide: true,
          isVisibleInCandidateSearchResults: false,
        }),
      );

      await login({ role: "aapCollaborateur", page });

      await page.goto(`/admin2/agencies-settings-v3/`);
      await waitForPageQueries(page);

      await expect(
        page.getByTestId("remote-organism").getByTestId("invisible-badge"),
      ).toBeVisible();
    });
  });

  test.describe("for an on-site organism", () => {
    test("display a on-site and user account sections and no remote section", async ({
      page,
      msw,
    }) => {
      msw.use(
        ...aapCommonHandlers,
        ...createSettingsHandlers({
          modaliteAccompagnement: "LIEU_ACCUEIL",
          modaliteAccompagnementRenseigneeEtValide: true,
          isVisibleInCandidateSearchResults: true,
        }),
      );

      await login({ role: "aapCollaborateur", page });

      await page.goto(`/admin2/agencies-settings-v3/`);
      await waitForPageQueries(page);

      await expect(page.getByTestId("on-site-organism")).toBeVisible();
      await expect(page.getByTestId("user-account")).toBeVisible();
      await expect(page.getByTestId("remote-organism")).not.toBeVisible();
      await expect(page.getByTestId("on-site-organisms")).not.toBeVisible();
    });
  });
});
