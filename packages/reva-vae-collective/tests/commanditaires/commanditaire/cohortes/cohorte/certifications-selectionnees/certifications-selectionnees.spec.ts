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
        "getCohorteByIdForCohorteCertificationsSelectionneesPage",
        () =>
          HttpResponse.json({
            data: {
              vaeCollective_getCohorteVaeCollectiveById: {
                id: "0eda2cbf-78ae-47af-9f28-34d05f972712",
                nom: "macohorte",
                certificationCohorteVaeCollectives: [
                  {
                    id: "1",
                    certification: {
                      id: 1,
                      label: "certification1",
                      codeRncp: "rncp1",
                      domains: [],
                    },
                  },
                  {
                    id: "2",
                    certification: {
                      id: "2",
                      label: "certification2",
                      codeRncp: "rncp2",
                      domains: [],
                    },
                  },
                ],
              },
            },
          }),
      ),
      mockQueryActiveFeatures(),
    ],
    { scope: "test" },
  ],
});

test("when i access the page it should display the certifications list", async ({
  page,
}) => {
  await login({ page, role: "gestionnaireVaeCollective" });

  await page.goto(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/certifications-selectionnees",
  );

  await expect(
    page.getByRole("heading", { name: "Certifications" }),
  ).toBeVisible();

  await expect(page.getByTestId("certification-card")).toHaveCount(2);
});

test(" when i click on a certification card it should lead to the certification page", async ({
  page,
}) => {
  await login({ page, role: "gestionnaireVaeCollective" });

  await page.goto(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/certifications-selectionnees",
  );

  await page.getByTestId("certification-card").first().click();

  await page.waitForURL(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/certifications/1?certificationSelectionDisabled=true",
  );
});

test("when i click on the back button it should lead to the cohorte page", async ({
  page,
}) => {
  await login({ page, role: "gestionnaireVaeCollective" });

  await page.goto(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/certifications-selectionnees",
  );

  await page.getByRole("link", { name: "Retour" }).click();

  await page.waitForURL(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
  );
});

test.describe("breadcrumb", async () => {
  test("when i click on the cohorte name it should lead to the cohorte page", async ({
    page,
  }) => {
    await login({ page, role: "gestionnaireVaeCollective" });

    await page.goto(
      "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/certifications-selectionnees",
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
      "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/certifications-selectionnees",
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
