import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { StatutValidationInformationsJuridiquesMaisonMereAap } from "@/graphql/generated/graphql";

import { login } from "../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../shared/helpers/network/msw";
import { waitGraphQL } from "../../shared/helpers/network/requests";

import type { Page } from "@playwright/test";

const fvae = graphql.link("https://reva-api/api/graphql");

const MAISON_MERE_ID = "733540e0-1bb1-4b8d-a66d-97fc992ff522";

function createSettingsHandlers(args?: {
  informationsJuridiques?: StatutValidationInformationsJuridiquesMaisonMereAap;
  isMCFCompatible?: boolean | null;
}) {
  const informationsJuridiques = args?.informationsJuridiques ?? "A_JOUR";
  const isMCFCompatible = args?.isMCFCompatible ?? null;

  // Base structure from gestionnaire-settings.json
  const settingsData = {
    account_getAccountForConnectedUser: {
      id: "account-1",
      organisms: [
        {
          id: "29994a9a-f166-48b9-974f-f3b3dbccda19",
          modaliteAccompagnement: "A_DISTANCE",
          modaliteAccompagnementRenseigneeEtValide: true,
          isVisibleInCandidateSearchResults: false,
          remoteZones: ["FRANCE_METROPOLITAINE"],
          accounts: [
            {
              id: "8f5fcf2d-ef76-4560-90d0-b151186b1c46",
              firstname: "Alice",
              lastname: "Doe",
              email: "alice.doe@example.com",
            },
          ],
          maisonMereAAP: {
            id: MAISON_MERE_ID,
            statutValidationInformationsJuridiquesMaisonMereAAP:
              informationsJuridiques,
            isMCFCompatible,
            comptesCollaborateurs: [
              {
                id: "account-1",
                firstname: "John",
                lastname: "Doe",
                email: "joen.doe@example.com",
                disabledAt: null,
              },
              {
                id: "account-2",
                firstname: "Alice",
                lastname: "Doe",
                email: "alice.doe@example.com",
                disabledAt: null,
              },
              {
                id: "account-3",
                firstname: "Catherine",
                lastname: "Doe",
                email: "catherine.doe@example.com",
                disabledAt: null,
              },
              {
                id: "account-4",
                firstname: "Bob",
                lastname: "Doe",
                email: "bob.doe@example.com",
                disabledAt: null,
              },
            ],
            organisms: [
              {
                id: "2be04b85-ed75-41fb-9248-97fc178ba664",
                isRemote: true,
                isOnSite: false,
                isVisibleInCandidateSearchResults: false,
                remoteZones: [],
                nomPublic: "Remote Organism",
                label: "Remote Organism",
                modaliteAccompagnement: "A_DISTANCE",
                modaliteAccompagnementRenseigneeEtValide: true,
              },
              {
                id: "29994a9a-f166-48b9-974f-f3b3dbccda19",
                modaliteAccompagnement: "LIEU_ACCUEIL",
                modaliteAccompagnementRenseigneeEtValide: true,
                remoteZones: ["FRANCE_METROPOLITAINE"],
                nomPublic: "On-site Organism",
                label: "On-site Organism",
                isVisibleInCandidateSearchResults: false,
                isRemote: false,
                isOnSite: true,
              },
              {
                id: "fb10a5d2-c081-418b-ab92-5a11314ada84",
                modaliteAccompagnement: "LIEU_ACCUEIL",
                modaliteAccompagnementRenseigneeEtValide: true,
                isVisibleInCandidateSearchResults: false,
                remoteZones: [],
                nomPublic: "Another On-site Organism",
                label: "Another On-site Organism",
                isRemote: false,
                isOnSite: true,
              },
              {
                id: "513be886-4f99-44d3-8edd-6ba2987dccd0",
                modaliteAccompagnement: "LIEU_ACCUEIL",
                modaliteAccompagnementRenseigneeEtValide: true,
                isVisibleInCandidateSearchResults: true,
                remoteZones: [],
                nomPublic: "Visible Organism",
                label: "Visible Organism",
                isRemote: false,
                isOnSite: true,
              },
            ],
          },
        },
      ],
    },
  };

  return [
    fvae.query(
      "getGestionnaireMaisonMereAAPSettingsInfo",
      graphQLResolver(settingsData),
    ),
  ];
}

async function waitForPageQueries(page: Page) {
  await Promise.all([
    waitGraphQL(page, "getGestionnaireMaisonMereAAPSettingsInfo"),
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getAccountInfo"),
    waitGraphQL(page, "getMaisonMereCGUQuery"),
  ]);
}

const { aapCommonHandlers } = getAAPCommonHandlers();

test.describe("Gestionnaire AAP settings page", () => {
  test.describe("on the general information section", () => {
    test("display a 'to complete badge' when account not verified", async ({
      page,
      msw,
    }) => {
      msw.use(
        ...aapCommonHandlers,
        ...createSettingsHandlers({
          informationsJuridiques: "A_METTRE_A_JOUR",
        }),
      );

      await login({ role: "aap", page });

      await page.goto(`/admin2/agencies-settings-v3/`);
      await waitForPageQueries(page);

      await expect(
        page
          .getByTestId("general-information")
          .getByTestId("to-complete-badge"),
      ).toBeVisible();
    });

    test("display a 'completed badge' when account verification is pending", async ({
      page,
      msw,
    }) => {
      msw.use(
        ...aapCommonHandlers,
        ...createSettingsHandlers({
          informationsJuridiques: "EN_ATTENTE_DE_VERIFICATION",
        }),
      );

      await login({ role: "aap", page });

      await page.goto(`/admin2/agencies-settings-v3/`);
      await waitForPageQueries(page);

      await expect(
        page.getByTestId("general-information").getByTestId("completed-badge"),
      ).toBeVisible();
    });

    test("display a 'completed badge' when account is up to date", async ({
      page,
      msw,
    }) => {
      msw.use(
        ...aapCommonHandlers,
        ...createSettingsHandlers({
          informationsJuridiques: "A_JOUR",
        }),
      );

      await login({ role: "aap", page });

      await page.goto(`/admin2/agencies-settings-v3/`);
      await waitForPageQueries(page);

      await expect(
        page.getByTestId("general-information").getByTestId("completed-badge"),
      ).toBeVisible();
    });
  });

  test("should display remote and user account list section and no on-site section", async ({
    page,
    msw,
  }) => {
    msw.use(
      ...aapCommonHandlers,
      ...createSettingsHandlers({ informationsJuridiques: "A_JOUR" }),
    );

    await login({ role: "aap", page });

    await page.goto(`/admin2/agencies-settings-v3/`);
    await waitForPageQueries(page);

    await expect(page.getByTestId("remote-organism")).toBeVisible();
    await expect(page.getByTestId("on-site-organisms")).toBeVisible();
    await expect(page.getByTestId("on-site-organism")).not.toBeVisible();
  });

  test.describe("on the account list section", () => {
    test("the add button should be disabled when the gestionnaire aap account is not verified", async ({
      page,
      msw,
    }) => {
      msw.use(
        ...aapCommonHandlers,
        ...createSettingsHandlers({
          informationsJuridiques: "A_METTRE_A_JOUR",
        }),
      );

      await login({ role: "aap", page });

      await page.goto(`/admin2/agencies-settings-v3/`);
      await waitForPageQueries(page);

      await expect(
        page.getByTestId("user-accounts").getByTestId("action-button"),
      ).toBeDisabled();
    });

    test("the add button should be enabled when the gestionnaire aap account is up to date", async ({
      page,
      msw,
    }) => {
      msw.use(
        ...aapCommonHandlers,
        ...createSettingsHandlers({ informationsJuridiques: "A_JOUR" }),
      );

      await login({ role: "aap", page });

      await page.goto(`/admin2/agencies-settings-v3/`);
      await waitForPageQueries(page);

      await expect(
        page.getByTestId("user-accounts").getByTestId("action-button"),
      ).toBeEnabled();
    });

    test("display all accounts, except the gestionnaire aap account, with info details", async ({
      page,
      msw,
    }) => {
      msw.use(
        ...aapCommonHandlers,
        ...createSettingsHandlers({ informationsJuridiques: "A_JOUR" }),
      );

      await login({ role: "aap", page });

      await page.goto(`/admin2/agencies-settings-v3/`);
      await waitForPageQueries(page);

      const userAccounts = page.getByTestId("user-accounts");
      await expect(userAccounts.locator("li")).toHaveCount(3);

      await expect(userAccounts.getByTestId("account-3")).toContainText(
        "Catherine Doe",
      );
      await expect(userAccounts.getByTestId("account-4")).toContainText(
        "bob.doe@example.com",
      );
    });

    test.describe("when the AAP_USER_ACCOUNT_V2 feature is active", () => {
      test.use({
        mswHandlers: [
          [
            fvae.query(
              "activeFeaturesForConnectedUser",
              graphQLResolver({
                activeFeaturesForConnectedUser: ["AAP_USER_ACCOUNT_V2"],
              }),
            ),
            ...aapCommonHandlers,
          ],
          { scope: "test" },
        ],
      });

      test("leads me to the user account v2 page when I click on the 'Modifier' button of a user account card", async ({
        page,
        msw,
      }) => {
        msw.use(
          ...createSettingsHandlers({ informationsJuridiques: "A_JOUR" }),
        );

        await login({ role: "aap", page });

        await page.goto(`/admin2/agencies-settings-v3/`);
        await waitForPageQueries(page);
        const userAccounts = page.getByTestId("user-accounts");
        userAccounts
          .locator("li")
          .first()
          .getByRole("link", { name: "Modifier" })
          .click();

        await expect(page).toHaveURL(
          `/admin2/agencies-settings-v3/${MAISON_MERE_ID}/user-accounts-v2/account-2/`,
        );
      });

      test("leads me to the create user account v2 page when I click on the 'Créer un compte' button of the user accounts section", async ({
        page,
        msw,
      }) => {
        msw.use(
          ...createSettingsHandlers({ informationsJuridiques: "A_JOUR" }),
        );

        await login({ role: "aap", page });

        await page.goto(`/admin2/agencies-settings-v3/`);
        await waitForPageQueries(page);
        await page
          .getByTestId("user-accounts")
          .getByRole("button", { name: "Créer un compte" })
          .click();

        await expect(page).toHaveURL(
          `/admin2/agencies-settings-v3/${MAISON_MERE_ID}/user-accounts-v2/add-user-account/`,
        );
      });
    });
  });

  test.describe("on the financing methods section", () => {
    test("display a 'to complete badge' when we don't know if the AAP is MCP compatible or not", async ({
      page,
      msw,
    }) => {
      msw.use(
        ...aapCommonHandlers,
        ...createSettingsHandlers({ isMCFCompatible: null }),
      );

      await login({ role: "aap", page });

      await page.goto(`/admin2/agencies-settings-v3/`);
      await waitForPageQueries(page);

      await expect(
        page.getByTestId("financing-methods").getByTestId("to-complete-badge"),
      ).toBeVisible();
      await expect(
        page
          .getByTestId("financing-methods")
          .getByTestId("no-financing-method-text"),
      ).toContainText(
        "Vous êtes référencé sur la plateforme Mon Compte Formation ? Faites-le faire savoir aux candidats afin qu’ils puissent financer l’accompagnement via ce dispositif.",
      );
    });

    test("display a 'completed badge' when the AAP is MCP compatible", async ({
      page,
      msw,
    }) => {
      msw.use(
        ...aapCommonHandlers,
        ...createSettingsHandlers({ isMCFCompatible: true }),
      );

      await login({ role: "aap", page });

      await page.goto(`/admin2/agencies-settings-v3/`);
      await waitForPageQueries(page);

      await expect(
        page.getByTestId("financing-methods").getByTestId("completed-badge"),
      ).toBeVisible();
      await expect(
        page
          .getByTestId("financing-methods")
          .getByTestId("financing-methods-text"),
      ).toContainText("Référencé Mon Compte Formation");
    });

    test("display a 'completed badge' when the AAP is not MCP compatible", async ({
      page,
      msw,
    }) => {
      msw.use(
        ...aapCommonHandlers,
        ...createSettingsHandlers({ isMCFCompatible: false }),
      );

      await login({ role: "aap", page });

      await page.goto(`/admin2/agencies-settings-v3/`);
      await waitForPageQueries(page);

      await expect(
        page.getByTestId("financing-methods").getByTestId("completed-badge"),
      ).toBeVisible();
      await expect(
        page
          .getByTestId("financing-methods")
          .getByTestId("financing-methods-text"),
      ).toContainText("Non-référencé Mon Compte Formation");
    });
  });
});
