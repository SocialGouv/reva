import {
  expect,
  graphql,
  HttpResponse,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../../shared/utils/auth/login";
import { mockQueryActiveFeatures } from "../../../../../shared/utils/mockActiveFeatures";
const fvae = graphql.link("https://reva-api/api/graphql");

test.use({
  mswHandlers: [
    [
      fvae.query(
        "searchCertificationsAndGetCohorteInfoForCertificationsPage",
        () =>
          HttpResponse.json({
            data: {
              vaeCollective_getCohorteVaeCollectiveById: {
                id: "0eda2cbf-78ae-47af-9f28-34d05f972712",
                nom: "macohorte",
              },
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
      mockQueryActiveFeatures(),
    ],
    { scope: "test" },
  ],
});

test("it should display the certifications list", async ({ page }) => {
  await login({ page, role: "gestionnaireVaeCollective" });

  await page.goto(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/certifications",
  );

  await expect(
    page.getByRole("heading", { name: "Certifications" }),
  ).toBeVisible();

  await expect(page.getByTestId("certification-card")).toHaveCount(2);
});

test("it should update the url when i search for a certification", async ({
  page,
}) => {
  await login({ page, role: "gestionnaireVaeCollective" });

  await page.goto(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/certifications",
  );

  await page.getByRole("search").locator("input").fill("certification1");
  await page.getByRole("button", { name: "Rechercher" }).click();
  await page.waitForURL("**/certifications*searchText*");

  await expect(page.url()).toContain("searchText=certification1");
});

test("it should lead to the certification page when i click on a certification card", async ({
  page,
}) => {
  await login({ page, role: "gestionnaireVaeCollective" });

  await page.goto(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/certifications",
  );

  await page.getByTestId("certification-card").first().click();

  await page.waitForURL(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/certifications/1",
  );
});
