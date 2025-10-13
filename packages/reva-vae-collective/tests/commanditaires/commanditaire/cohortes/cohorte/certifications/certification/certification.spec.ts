import {
  expect,
  graphql,
  HttpResponse,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../../../shared/utils/auth/login";
import { mockQueryActiveFeatures } from "../../../../../../shared/utils/mockActiveFeatures";
const fvae = graphql.link("https://reva-api/api/graphql");

test.use({
  mswHandlers: [
    [
      fvae.query("getCertificationInfoForCertificationPage", () =>
        HttpResponse.json({
          data: {
            getCertification: {
              id: "b122423f-6eb6-4d80-94b2-8e57fd0e4cd7",
              codeRncp: "40029",
              label:
                "Brevet de technicien supérieur - Construction et aménagement de véhicules",
              isAapAvailable: true,
              level: 5,
              typeDiplome: "Brevet de technicien supérieur",
              rncpObjectifsContexte: "contexte",
              juryTypeMiseEnSituationProfessionnelle: "LES_DEUX",
              juryTypeSoutenanceOrale: "LES_DEUX",
              juryEstimatedCost: 200,
              juryPlace: "",
              certificationAuthorityStructure: { label: "UIMM" },
              prerequisites: [
                { id: "1", label: "prerequis1" },
                { id: "2", label: "prerequis2" },
              ],
            },
          },
        }),
      ),
      fvae.mutation("updateCertificationMutation", () => {
        return HttpResponse.json({
          data: {
            vaeCollective_updateCohorteVAECollectiveCertification: {
              id: "0eda2cbf-78ae-47af-9f28-34d05f972712",
            },
          },
        });
      }),
      mockQueryActiveFeatures(),
    ],
    { scope: "test" },
  ],
});

test("it should display the certification details page", async ({ page }) => {
  await login({ page, role: "gestionnaireVaeCollective" });

  await page.goto(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/certifications/b122423f-6eb6-4d80-94b2-8e57fd0e4cd7",
  );

  await expect(
    page.getByRole("heading", {
      name: "Brevet de technicien supérieur - Construction et aménagement de véhicules",
    }),
  ).toBeVisible();
});

test("it should let me select a certification and redirect me to the cohorte details page", async ({
  page,
}) => {
  await login({ page, role: "gestionnaireVaeCollective" });

  await page.goto(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/certifications/b122423f-6eb6-4d80-94b2-8e57fd0e4cd7",
  );

  await page
    .getByRole("button", { name: "Choisir cette certification" })
    .first()
    .click();

  await page.waitForURL(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712",
  );
});

test("it should not display the select certification button when the certification selection is disabled", async ({
  page,
}) => {
  await login({ page, role: "gestionnaireVaeCollective" });

  await page.goto(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/certifications/b122423f-6eb6-4d80-94b2-8e57fd0e4cd7?certificationSelectionDisabled=true",
  );

  await expect(
    page.getByRole("heading", {
      name: "Brevet de technicien supérieur - Construction et aménagement de véhicules",
    }),
  ).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Choisir cette certification" }),
  ).not.toBeVisible();
});
