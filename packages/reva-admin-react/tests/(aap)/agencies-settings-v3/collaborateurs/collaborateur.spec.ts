import {
  expect,
  graphql,
  Page,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../shared/helpers/network/requests";

const { aapCommonHandlers } = getAAPCommonHandlers();
const fvae = graphql.link("https://reva-api/api/graphql");

const collaborateurHandlers = () => {
  const getCollaborateurSettingsInfoPageHandler = fvae.query(
    "getCollaborateurSettingsInfoForCollaborateurSettingsPage",
    graphQLResolver({
      organism_getCompteCollaborateurById: {
        id: "account-1",
        maisonMereAAP: {
          id: "1",
        },
        organisms: [
          {
            id: "1",
            modaliteAccompagnement: "A_DISTANCE",
            modaliteAccompagnementRenseigneeEtValide: true,
            isVisibleInCandidateSearchResults: true,
            remoteZones: ["FRANCE_METROPOLITAINE", "GUADELOUPE"],
            nomPublic: "AAP Exemple",
          },
          {
            id: "2",
            modaliteAccompagnement: "LIEU_ACCUEIL",
            modaliteAccompagnementRenseigneeEtValide: true,
            isVisibleInCandidateSearchResults: true,
            nomPublic: "Lieu d'accueil 1",
          },
          {
            id: "3",
            modaliteAccompagnement: "LIEU_ACCUEIL",
            modaliteAccompagnementRenseigneeEtValide: true,
            isVisibleInCandidateSearchResults: true,
            nomPublic: "Lieu d'accueil 2",
          },
        ],
      },
    }),
  );

  return [getCollaborateurSettingsInfoPageHandler];
};

async function waitForPageQueries(page: Page) {
  await Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(
      page,
      "getCollaborateurSettingsInfoForCollaborateurSettingsPage",
    ),
  ]);
}

test.describe("Collaborateur settings page", () => {
  test.use({
    mswHandlers: [
      [...aapCommonHandlers, ...collaborateurHandlers()],
      { scope: "test" },
    ],
  });
  test.describe("as an AAP collaborateur", () => {
    test.describe("when I access i access the collaborateur settings page", () => {
      test("it shows the correct title", async ({ page }) => {
        await login({ role: "aapCollaborateur", page });
        await page.goto(
          "/admin2/agencies-settings-v3/collaborateurs/account-1/",
        );
        await waitForPageQueries(page);
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
          "Paramètres",
        );
      });
    });
    test.describe("Informations de connexion summary card", () => {
      test("it let me go to the informations de connexion page when I click on the 'Visualiser' button", async ({
        page,
      }) => {
        await login({ role: "aapCollaborateur", page });
        await page.goto(
          "/admin2/agencies-settings-v3/collaborateurs/account-1/",
        );
        await waitForPageQueries(page);

        page
          .getByTestId("informations-connexion-summary-card")
          .getByRole("button", { name: "Visualiser" })
          .click();

        await expect(page).toHaveURL(
          "/admin2/agencies-settings-v3/collaborateurs/account-1/informations-connexion/",
        );
      });
    });
    test.describe("Accompagnement à distance summary card", () => {
      test("it displays the correct information", async ({ page }) => {
        await login({ role: "aapCollaborateur", page });
        await page.goto(
          "/admin2/agencies-settings-v3/collaborateurs/account-1/",
        );
        await waitForPageQueries(page);

        await expect(
          page.getByTestId("remote-organism").getByText("AAP Exemple"),
        ).toBeVisible();
        await expect(
          page
            .getByTestId("remote-organism")
            .getByText("France métropolitaine (UTC+2)"),
        ).toBeVisible();
        await expect(
          page.getByTestId("remote-organism").getByText("Guadeloupe (UTC-4)"),
        ).toBeVisible();
      });

      test("it let me go to the accompagnement à distance page when I click on the 'Visualiser' button", async ({
        page,
      }) => {
        await login({ role: "aapCollaborateur", page });
        await page.goto(
          "/admin2/agencies-settings-v3/collaborateurs/account-1/",
        );
        await waitForPageQueries(page);

        page
          .getByTestId("remote-organism")
          .getByRole("button", { name: "Modifier" })
          .click();

        await expect(page).toHaveURL(
          "/admin2/agencies-settings-v3/1/organisms/1/remote/",
        );
      });
    });

    test.describe("Accompagnement en présentiel summary card", () => {
      test("it displays the correct information", async ({ page }) => {
        await login({ role: "aapCollaborateur", page });
        await page.goto(
          "/admin2/agencies-settings-v3/collaborateurs/account-1/",
        );
        await waitForPageQueries(page);

        await expect(
          page.getByTestId("onsite-organisms").getByText("Lieu d'accueil 1"),
        ).toBeVisible();
        await expect(
          page.getByTestId("onsite-organisms").getByText("Lieu d'accueil 1"),
        ).toBeVisible();
      });

      test("it let me go to the accompagnement en présentiel page when I click on the 'Modifier' button", async ({
        page,
      }) => {
        await login({ role: "aapCollaborateur", page });
        await page.goto(
          "/admin2/agencies-settings-v3/collaborateurs/account-1/",
        );
        await waitForPageQueries(page);

        page
          .getByTestId("onsite-organisms")
          .getByRole("link", { name: "Modifier" })
          .first()
          .click();

        await expect(page).toHaveURL(
          "/admin2/agencies-settings-v3/1/organisms/2/on-site/",
        );
      });
    });
  });
});
