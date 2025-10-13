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
      fvae.query("getCohorteByIdForSearchAAPPage", () =>
        HttpResponse.json({
          data: {
            vaeCollective_getCohorteVaeCollectiveById: {
              id: "0eda2cbf-78ae-47af-9f28-34d05f972712",
              nom: "macohorte",
              certificationCohorteVaeCollectives: [
                {
                  certification: {
                    id: "certification1",
                  },
                },
              ],
            },
          },
        }),
      ),

      fvae.query("searchOrganismsForSearchAAPPage", () =>
        HttpResponse.json({
          data: {
            organism_searchOrganisms: {
              info: {
                totalRows: 2,
                totalPages: 1,
                currentPage: 1,
              },
              rows: [
                {
                  id: "2212c9c4-049b-43e5-9b16-a6387012e8c1",
                  label: "AAP1",
                  isMaisonMereMCFCompatible: true,
                  modaliteAccompagnement: "A_DISTANCE",
                  conformeNormesAccessibilite: null,
                  adresseNumeroEtNomDeRue: null,
                  adresseInformationsComplementaires: null,
                  adresseVille: null,
                  adresseCodePostal: null,
                },
                {
                  id: "cc93cd81-10c4-46fc-aa1b-7be586579548",
                  label: "AAP2",
                  isMaisonMereMCFCompatible: null,
                  modaliteAccompagnement: "LIEU_ACCUEIL",
                  conformeNormesAccessibilite: "CONFORME",
                  adresseNumeroEtNomDeRue: "adresseNumeroEtNomDeRue",
                  adresseInformationsComplementaires:
                    "adresseInformationsComplementaires",
                  adresseVille: "adresseVille",
                  adresseCodePostal: "adresseCodePostal",
                },
              ],
            },
          },
        }),
      ),

      fvae.mutation("updateCohorteVAECollectiveOrganism", () =>
        HttpResponse.json({
          data: {
            vaeCollective_updateCohorteVAECollectiveOrganism: {
              id: "0eda2cbf-78ae-47af-9f28-34d05f972712",
            },
          },
        }),
      ),
      mockQueryActiveFeatures(),
    ],
    { scope: "test" },
  ],
});

test("it should display the aap list", async ({ page }) => {
  await login({ page, role: "gestionnaireVaeCollective" });

  await page.goto(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/aaps",
  );

  await expect(
    page.getByRole("heading", {
      name: "Architectes Accompagnateur de Parcours",
    }),
  ).toBeVisible();

  await expect(page.getByTestId("organism-card")).toHaveCount(2);
});

test("it should update the url when i search for an aap", async ({ page }) => {
  await login({ page, role: "gestionnaireVaeCollective" });

  await page.goto(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/aaps",
  );

  await page.getByRole("search").locator("input").fill("aap1");
  await page.getByRole("button", { name: "Rechercher" }).click();
  await page.waitForURL("**/aaps*searchText*");

  await expect(page.url()).toContain("searchText=aap1");
});

test("it should redirect me to the cohorte page when i click on the organism card", async ({
  page,
}) => {
  await login({ page, role: "gestionnaireVaeCollective" });

  await page.goto(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/aaps",
  );

  await page.getByRole("search").locator("input").fill("aap1");

  await page.getByTestId("organism-card").first().click();

  await expect(page.url()).toContain(
    "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/",
  );
});
