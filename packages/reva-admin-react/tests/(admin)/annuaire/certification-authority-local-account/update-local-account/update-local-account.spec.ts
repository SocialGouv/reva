import {
  expect,
  graphql,
  Page,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../shared/helpers/network/requests";

const { aapCommonHandlers } = getAAPCommonHandlers();
const fvae = graphql.link("https://reva-api/api/graphql");

function createUpdateLocalAccountHandlers(params?: {
  noContactDetails?: boolean;
}) {
  const localAccountData = params?.noContactDetails
    ? {
        id: "ca2905e6-7888-4fb8-b4cc-85a8b855d1fb",
        account: {
          firstname: "jane",
          lastname: "doe",
          email: "monemail@example.com",
        },
        contactFullName: null,
        contactEmail: null,
        contactPhone: null,
        certificationAuthority: {
          id: "c7399291-e79b-4e0f-b798-d3c97661e47f",
          label: "myCertificationAuthority",
          certificationAuthorityStructures: [
            {
              id: "e8f214f1-3243-4dc6-8fe0-205d4cafd9d1",
              label: "myStructure",
            },
          ],
        },
        departments: [
          {
            id: "0fd699b6-40c2-4ded-a29c-3417cded8b58",
            label: "Ain",
            code: "01",
            region: {
              id: "2946d835-f0fa-4c37-9a50-0735112395bd",
              label: "Auvergne-Rhône-Alpes",
            },
          },
          {
            id: "201a8192-50d9-42c0-9250-d98d80090c31",
            label: "Puy-de-Dôme",
            code: "63",
            region: {
              id: "2946d835-f0fa-4c37-9a50-0735112395bd",
              label: "Auvergne-Rhône-Alpes",
            },
          },
        ],
        certifications: [
          {
            id: "00fa1e5b-1535-4cb6-b542-0dad27dd6341",
            label: "CQP Animateur d'équipe autonome de production industrielle",
            conventionsCollectives: [
              {
                id: "3af3e807-9848-4e27-b71a-1fb210aac1ef",
                label: "Métallurgie",
              },
            ],
          },
          {
            id: "0236bf82-e85d-4e88-927a-c93bb6c44efb",
            label:
              "Diplôme d'Etat Conseiller en économie sociale et familiale - DEESF",
            conventionsCollectives: [],
          },
        ],
      }
    : {
        id: "ca2905e6-7888-4fb8-b4cc-85a8b855d1fb",
        account: {
          firstname: "jane",
          lastname: "doe",
          email: "monemail@example.com",
        },
        contactFullName: "contact full name",
        contactEmail: "contact.email@example.com",
        contactPhone: "0123456789",
        certificationAuthority: {
          id: "c7399291-e79b-4e0f-b798-d3c97661e47f",
          label: "myCertificationAuthority",
          certificationAuthorityStructures: [
            {
              id: "e8f214f1-3243-4dc6-8fe0-205d4cafd9d1",
              label: "myStructure",
            },
          ],
        },
        departments: [
          {
            id: "0fd699b6-40c2-4ded-a29c-3417cded8b58",
            label: "Ain",
            code: "01",
            region: {
              id: "2946d835-f0fa-4c37-9a50-0735112395bd",
              label: "Auvergne-Rhône-Alpes",
            },
          },
          {
            id: "201a8192-50d9-42c0-9250-d98d80090c31",
            label: "Puy-de-Dôme",
            code: "63",
            region: {
              id: "2946d835-f0fa-4c37-9a50-0735112395bd",
              label: "Auvergne-Rhône-Alpes",
            },
          },
        ],
        certifications: [
          {
            id: "00fa1e5b-1535-4cb6-b542-0dad27dd6341",
            label: "CQP Animateur d'équipe autonome de production industrielle",
            conventionsCollectives: [
              {
                id: "3af3e807-9848-4e27-b71a-1fb210aac1ef",
                label: "Métallurgie",
              },
            ],
          },
          {
            id: "0236bf82-e85d-4e88-927a-c93bb6c44efb",
            label:
              "Diplôme d'Etat Conseiller en économie sociale et familiale - DEESF",
            conventionsCollectives: [],
          },
        ],
      };

  return [
    fvae.query(
      "getCertificationAuthorityLocalAccountForComptesCollaborateursPage",
      graphQLResolver({
        certification_authority_getCertificationAuthorityLocalAccount:
          localAccountData,
      }),
    ),
  ];
}

async function waitForPageQueries(page: Page) {
  await Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getMaisonMereCGUQuery"),
    waitGraphQL(
      page,
      "getCertificationAuthorityLocalAccountForComptesCollaborateursPage",
    ),
  ]);
}

test.describe("main page", () => {
  test.use({
    mswHandlers: [
      [...createUpdateLocalAccountHandlers(), ...aapCommonHandlers],
      { scope: "test" },
    ],
  });

  test.describe("when i access the update local account page", () => {
    test("display the page with a correct title", async ({ page }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
      await waitForPageQueries(page);

      await expect(
        page
          .getByTestId("update-certification-authority-local-account-page")
          .locator("h1")
          .first(),
      ).toHaveText("jane doe");
    });
  });
});

test.describe("general information summary card", () => {
  test.use({
    mswHandlers: [
      [...createUpdateLocalAccountHandlers(), ...aapCommonHandlers],
      { scope: "test" },
    ],
  });

  test.describe("when i access the update local account page", () => {
    test("display the general information summary card with the correct information", async ({
      page,
    }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
      await waitForPageQueries(page);

      const card = page.getByTestId(
        "local-account-general-information-summary-card",
      );
      await expect(card).toBeVisible();
      await expect(card.locator("h2")).toHaveText("Informations générales");
      await expect(card.getByTestId("contact-full-name")).toHaveText(
        "contact full name",
      );
      await expect(card.getByTestId("contact-email")).toHaveText(
        "contact.email@example.com",
      );
    });
  });

  test.describe("when i access the update local account page with no contact details", () => {
    test.use({
      mswHandlers: [
        [
          ...createUpdateLocalAccountHandlers({ noContactDetails: true }),
          ...aapCommonHandlers,
        ],
        { scope: "test" },
      ],
    });

    test("display the general information summary card with the correct information", async ({
      page,
    }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
      await waitForPageQueries(page);

      await expect(page.getByTestId("no-contact-details-badge")).toBeVisible();
    });
  });
});

test.describe("when i click on the update button", () => {
  test.use({
    mswHandlers: [
      [...createUpdateLocalAccountHandlers(), ...aapCommonHandlers],
      { scope: "test" },
    ],
  });

  test("redirect to the update general information page", async ({ page }) => {
    await login({ role: "admin", page });

    await page.goto(
      "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869",
    );
    await waitForPageQueries(page);

    await page
      .getByTestId("local-account-general-information-summary-card")
      .getByTestId("action-button")
      .click();

    await expect(page).toHaveURL(
      "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/informations-generales/",
    );
  });
});

test.describe("intervention area summary card", () => {
  test.use({
    mswHandlers: [
      [...createUpdateLocalAccountHandlers(), ...aapCommonHandlers],
      { scope: "test" },
    ],
  });

  test.describe("when i access the update local account page", () => {
    test("display the intervention area summary card with the correct information", async ({
      page,
    }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
      await waitForPageQueries(page);

      const card = page.getByTestId("intervention-area-summary-card");
      await expect(card).toBeVisible();
      await expect(card.locator("h2")).toHaveText("Zone d'intervention");

      await page.getByText("Auvergne-Rhône-Alpes").click();
      await expect(page.getByTestId("department-tag-01")).toBeVisible();
      await expect(page.getByTestId("department-tag-63")).toBeVisible();
    });
  });

  test.describe("when i click on the update button", () => {
    test("redirect to the update intervention area page", async ({ page }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
      await waitForPageQueries(page);

      await page
        .getByTestId("intervention-area-summary-card")
        .getByTestId("action-button")
        .click();

      await expect(page).toHaveURL(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/zone-intervention/",
      );
    });
  });
});

test.describe("certifications summary card", () => {
  test.use({
    mswHandlers: [
      [...createUpdateLocalAccountHandlers(), ...aapCommonHandlers],
      { scope: "test" },
    ],
  });

  test.describe("when i access the update local account page", () => {
    test("display the certifications summary card with the correct information", async ({
      page,
    }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
      await waitForPageQueries(page);

      const card = page.getByTestId("certifications-summary-card");
      await expect(card).toBeVisible();
      await expect(card.locator("h2")).toHaveText("Certifications gérées");
      await expect(card.getByTestId("certifications-count-badge")).toHaveText(
        "2 certifications gérées",
      );
    });
  });

  test.describe("when i click on the update button", () => {
    test("redirect to the update certifications page", async ({ page }) => {
      await login({ role: "admin", page });

      await page.goto(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869",
      );
      await waitForPageQueries(page);

      await page
        .getByTestId("certifications-summary-card")
        .getByTestId("action-button")
        .click();

      await expect(page).toHaveURL(
        "/admin2/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/certificateurs-administrateurs/c7399291-e79b-4e0f-b798-d3c97661e47f/comptes-collaborateurs/4871a711-232b-4aba-aa5a-bc2adc51f869/certifications/",
      );
    });
  });
});
