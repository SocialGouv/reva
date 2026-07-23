import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../../../shared/helpers/network/msw";

const fvae = graphql.link("https://reva-api/api/graphql");
const { aapCommonHandlers } = getAAPCommonHandlers();

const PAGE_PATH = "/admin2/certifications/add-certification/description";

function createHandlers({
  certificateurs,
}: {
  certificateurs: { NOM_CERTIFICATEUR: string }[];
}) {
  return [
    fvae.query(
      "getFCCertificationForAddCertificationPage",
      graphQLResolver({
        getFCCertification: {
          ID_FICHE: "fiche-id",
          NUMERO_FICHE: "RNCP39839",
          INTITULE: "Certification test",
          ABREGE: null,
          NOMENCLATURE_EUROPE: null,
          DATE_FIN_ENREGISTREMENT: null,
          DATE_LIMITE_DELIVRANCE: null,
          FORMACODES: [],
          DOMAINS: [],
          CERTIFICATEURS: certificateurs,
        },
      }),
    ),
  ];
}

test.describe("page admin d'ajout de certification - étape descriptif", () => {
  test("affiche la ligne des certificateurs FC avec les deux noms", async ({
    page,
    msw,
  }) => {
    msw.use(
      ...createHandlers({
        certificateurs: [
          {
            NOM_CERTIFICATEUR:
              "UNION DES INDUSTRIES ET DES METIERS DE LA METALLURGIE - UIMM",
          },
          {
            NOM_CERTIFICATEUR:
              "Commission Paritaire Nationale de l'Emploi de la Métallurgie",
          },
        ],
      }),
      ...aapCommonHandlers,
    );

    await login({ role: "admin", page });
    await page.goto(PAGE_PATH);

    await page
      .getByTestId("fc-certification-description-input")
      .locator("input")
      .fill("39839");

    const row = page.getByTestId("fc-certification-certificateurs");
    await expect(row).toBeVisible();
    await expect(
      row.getByText(
        "UNION DES INDUSTRIES ET DES METIERS DE LA METALLURGIE - UIMM",
      ),
    ).toBeVisible();
    await expect(
      row.getByText(
        "Commission Paritaire Nationale de l'Emploi de la Métallurgie",
      ),
    ).toBeVisible();
  });

  test("n'affiche pas la ligne des certificateurs lorsqu'il n'y en a aucun", async ({
    page,
    msw,
  }) => {
    msw.use(...createHandlers({ certificateurs: [] }), ...aapCommonHandlers);

    await login({ role: "admin", page });
    await page.goto(PAGE_PATH);

    await page
      .getByTestId("fc-certification-description-input")
      .locator("input")
      .fill("39839");

    await expect(
      page.getByTestId("fc-certification-description-card-title"),
    ).toBeVisible();
    await expect(
      page.getByTestId("fc-certification-certificateurs"),
    ).toHaveCount(0);
  });
});
