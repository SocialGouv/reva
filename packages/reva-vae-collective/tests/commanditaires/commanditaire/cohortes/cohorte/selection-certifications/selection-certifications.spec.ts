import {
  expect,
  graphql,
  HttpResponse,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../../shared/utils/auth/login";
import { mockQueryActiveFeatures } from "../../../../../shared/utils/mockActiveFeatures";
const fvae = graphql.link("https://reva-api/api/graphql");

const createCohorteByIdForSelectionCertificationsPageHandler = (args?: {
  withOrganism?: boolean;
}) => {
  const organismId = args?.withOrganism ? "123" : null;
  return [
    fvae.query("getCohorteByIdForSelectionCertificationsPage", () =>
      HttpResponse.json({
        data: {
          vaeCollective_getCohorteVaeCollectiveById: {
            id: "0eda2cbf-78ae-47af-9f28-34d05f972712",
            nom: "macohorte",
            organismId,
            certificationCohorteVaeCollectives: [
              {
                id: "1",
                certification: {
                  id: 1,
                },
              },
            ],
          },
        },
      }),
    ),
    fvae.query("searchCertificationsForSelectionCertificationsPage", () =>
      HttpResponse.json({
        data: {
          searchCertificationsForCandidate: {
            rows: [
              {
                id: 1,
                label: "certification1",
                codeRncp: "rncp1",
                domains: [],
                certificationAuthorityStructure: {
                  label: "certificationAuthorityStructure1",
                },
              },
              {
                id: 2,
                label: "certification2",
                codeRncp: "rncp2",
                domains: [],
                certificationAuthorityStructure: {
                  label: "certificationAuthorityStructure2",
                },
              },
            ],
            info: {
              totalRows: 2,
              totalPages: 1,
              currentPage: 1,
            },
          },
        },
      }),
    ),
    fvae.query("isOrganismAttachedToCertifications", () =>
      HttpResponse.json({
        data: {
          organism_isOrganismAttachedToCertifications: false,
        },
      }),
    ),
    mockQueryActiveFeatures(),
  ];
};
test.use({
  mswHandlers: [
    createCohorteByIdForSelectionCertificationsPageHandler(),
    { scope: "test" },
  ],
});

test("when i access the page it should display the selection certifications list", async ({
  page,
}) => {
  await login({ page, role: "gestionnaireVaeCollective" });

  await page.goto(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/selection-certifications",
  );

  await expect(
    page.getByRole("heading", { name: "Certifications" }),
  ).toBeVisible();

  await expect(page.locator(".fr-card")).toHaveCount(2);
});

test("when i click on the back button it should let me go back to the cohorte page", async ({
  page,
}) => {
  await login({ page, role: "gestionnaireVaeCollective" });

  await page.goto(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/selection-certifications",
  );

  await page.getByRole("link", { name: "Retour" }).click();
  await page.waitForURL(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
  );
});

test("it should let me add the second certification", async ({ page }) => {
  await login({ page, role: "gestionnaireVaeCollective" });

  await page.goto(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/selection-certifications",
  );

  await page
    .getByTestId("multi-select-list-item-2")
    .getByRole("button", { name: "Ajouter" })
    .click();
});

test("it should let me remove the first certification", async ({ page }) => {
  await login({ page, role: "gestionnaireVaeCollective" });

  await page.goto(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/selection-certifications",
  );

  await page
    .getByTestId("multi-select-list-item-1")
    .getByRole("button", { name: "Retirer" })
    .click();
});

test("when i click on the certification card 'Voir la fiche' button it should lead to the certification page", async ({
  page,
}) => {
  await login({ page, role: "gestionnaireVaeCollective" });

  await page.goto(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/selection-certifications",
  );

  await page
    .getByTestId("multi-select-list-item-1")
    .getByRole("link", { name: "Voir la fiche" })
    .click();

  await page.waitForURL(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/certifications/1?certificationSelectionDisabled=true",
  );
});

test.describe("When an organism is set for the cohorte", async () => {
  test.use({
    mswHandlers: [
      createCohorteByIdForSelectionCertificationsPageHandler({
        withOrganism: true,
      }),

      { scope: "test" },
    ],
  });

  test("when i click on the add button and the organism is not attached to the certifications it should show the aap reset confirmation modal", async ({
    page,
  }) => {
    await login({ page, role: "gestionnaireVaeCollective" });

    await page.goto(
      "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/selection-certifications",
    );

    await page
      .getByTestId("multi-select-list-item-2")
      .getByRole("button", { name: "Ajouter" })
      .click();

    await expect(
      page.getByText(
        "Ajout d’une certification non-gérée par l’AAP sélectionné",
      ),
    ).toBeVisible();
  });
});

test.describe("breadcrumb", async () => {
  test("when i click on the cohorte name it should lead to the cohorte page", async ({
    page,
  }) => {
    await login({ page, role: "gestionnaireVaeCollective" });

    await page.goto(
      "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/selection-certifications",
    );

    await page
      .getByRole("navigation")
      .getByRole("link", { name: "macohorte" })
      .click();

    await page.waitForURL(
      "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
    );
  });

  test("when i click on the cohortes list link it should lead to the cohortes list page", async ({
    page,
  }) => {
    await login({ page, role: "gestionnaireVaeCollective" });

    await page.goto(
      "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/selection-certifications",
    );

    await page
      .getByRole("navigation")
      .getByRole("link", { name: "Cohortes" })
      .click();

    await page.waitForURL(
      "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes",
    );
  });
});
