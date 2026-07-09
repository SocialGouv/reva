import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/helpers/auth/login";
import { graphQLResolver } from "../../../../shared/helpers/network/msw";

const fvae = graphql.link("https://reva-api/api/graphql");

const CERTIFICATION_ID = "certification-id";
const CERTIFICATION_PATH = `/admin2/certifications/${CERTIFICATION_ID}/structure`;

function createHandlers({
  certificateurs,
}: {
  certificateurs: { NOM_CERTIFICATEUR: string }[];
}) {
  return [
    fvae.query(
      "getCertificationStructureAndGestionnairesForUpdateCertificationStructurePage",
      graphQLResolver({
        getCertification: {
          id: CERTIFICATION_ID,
          label: "Certification test",
          codeRncp: "39839",
          certificationAuthorityStructure: null,
          certificationAuthorities: [],
        },
        certification_authority_getCertificationAuthorityStructures: {
          rows: [{ id: "structure-id", label: "Structure test" }],
        },
      }),
    ),
    fvae.query(
      "getFCCertificateursForUpdateCertificationStructurePage",
      graphQLResolver({
        getFCCertification: {
          CERTIFICATEURS: certificateurs,
        },
      }),
    ),
  ];
}

test.describe("page admin de mise à jour de la structure de certification", () => {
  test("affiche le bloc des certificateurs FC avec les deux noms", async ({
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
    );

    await login({ role: "admin", page });
    await page.goto(CERTIFICATION_PATH);

    const block = page.getByTestId("fc-certificateurs");
    await expect(block).toBeVisible();
    await expect(
      block.getByText("Informations liées à la certification RNCP 39839"),
    ).toBeVisible();
    await expect(
      block.getByText(
        "UNION DES INDUSTRIES ET DES METIERS DE LA METALLURGIE - UIMM",
      ),
    ).toBeVisible();
    await expect(
      block.getByText(
        "Commission Paritaire Nationale de l'Emploi de la Métallurgie",
      ),
    ).toBeVisible();
  });

  test("n'affiche aucun bloc lorsqu'il n'y a aucun certificateur FC", async ({
    page,
    msw,
  }) => {
    msw.use(...createHandlers({ certificateurs: [] }));

    await login({ role: "admin", page });
    await page.goto(CERTIFICATION_PATH);

    await expect(
      page.getByTestId("update-certification-structure-page"),
    ).toBeVisible();
    await expect(page.getByTestId("fc-certificateurs")).toHaveCount(0);
  });
});
