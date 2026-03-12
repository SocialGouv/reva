import {
  expect,
  graphql,
  Page,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/helpers/auth/login";
import { getCertificateurSettingsCommonHandlers } from "../../../../shared/helpers/common-handlers/certificateur/getCertificateurSettingsCommon.handlers";
import { graphQLResolver } from "../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../shared/helpers/network/requests";

const fvae = graphql.link("https://reva-api/api/graphql");

const CERTIFICATION_ID = "certification-id";
const DESCRIPTION_PAGE_PATH = `/admin2/responsable-certifications/certifications/${CERTIFICATION_ID}/description`;

const CERTIFICATION_AUTHORITY_ID = "certification-authority-id";

const { certificateurSettingsCommonHandlers, certificateurSettingsCommonWait } =
  getCertificateurSettingsCommonHandlers({
    certificationAuthorityId: CERTIFICATION_AUTHORITY_ID,
  });

function createCertificationDescriptionHandlers({
  hasReducedRequirements,
}: {
  hasReducedRequirements: boolean;
}) {
  return [
    fvae.query(
      "getCertificationForCertificationRegistryManagerUpdateCertificationDescriptionPage",
      graphQLResolver({
        getCertification: {
          id: CERTIFICATION_ID,
          label: "Certification test",
          codeRncp: "RNCP12345",
          status: "A_VALIDER_PAR_CERTIFICATEUR",
          rncpExpiresAt: 1767225600000,
          rncpPublishedAt: 1735689600000,
          rncpEffectiveAt: 1735689600000,
          rncpDeliveryDeadline: 1767225600000,
          availableAt: 1735689600000,
          typeDiplome: "BTS",
          juryTypeMiseEnSituationProfessionnelle: null,
          juryTypeSoutenanceOrale: null,
          juryFrequency: null,
          juryFrequencyOther: null,
          juryPlace: null,
          juryEstimatedCost: null,
          certificationAuthorityStructure: {
            hasReducedRequirements,
          },
          degree: {
            id: "degree-id",
            level: 5,
          },
          domains: [],
        },
      }),
    ),
  ];
}

function createUpdateDescriptionMutationHandler() {
  return fvae.mutation(
    "updateCertificationDescriptionForCertificationRegistryManagerUpdateCertificationDescriptionPage",
    graphQLResolver({
      referential_updateCertificationDescription: {
        id: CERTIFICATION_ID,
      },
    }),
  );
}

async function waitForDescriptionPageQueries(page: Page) {
  await Promise.all([
    certificateurSettingsCommonWait(page),
    waitGraphQL(
      page,
      "getCertificationForCertificationRegistryManagerUpdateCertificationDescriptionPage",
    ),
  ]);
}

test.describe("certificateur certification description page", () => {
  test("allows submitting without jury fields when reduced requirements are enabled", async ({
    page,
    msw,
  }) => {
    msw.use(
      ...createCertificationDescriptionHandlers({
        hasReducedRequirements: true,
      }),
      createUpdateDescriptionMutationHandler(),
      ...certificateurSettingsCommonHandlers,
    );

    await login({ role: "certificateur", page });
    await page.goto(DESCRIPTION_PAGE_PATH);
    await waitForDescriptionPageQueries(page);

    await expect(
      page.getByText(
        "Sauf mention contraire “(optionnel)” dans le label, tous les champs sont obligatoires.",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Types d’épreuves (optionnel)" }),
    ).toBeVisible();
    await expect(
      page.getByLabel("Fréquence des jurys (optionnel) :"),
    ).toBeVisible();

    await page.locator('input[name="startOfVisibility"]').fill("2025-01-02");

    const updateMutation = waitGraphQL(
      page,
      "updateCertificationDescriptionForCertificationRegistryManagerUpdateCertificationDescriptionPage",
    );
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await updateMutation;

    await expect(
      page.getByText(
        "Veuillez renseigner au moins un type d’épreuve pour le jury de cette certification",
      ),
    ).toHaveCount(0);
  });

  test("keeps jury fields required when reduced requirements are disabled", async ({
    page,
    msw,
  }) => {
    msw.use(
      ...createCertificationDescriptionHandlers({
        hasReducedRequirements: false,
      }),
      ...certificateurSettingsCommonHandlers,
    );

    await login({ role: "certificateur", page });
    await page.goto(DESCRIPTION_PAGE_PATH);
    await waitForDescriptionPageQueries(page);

    await expect(
      page.getByRole("heading", { name: "Types d’épreuves (optionnel)" }),
    ).toHaveCount(0);

    await page.locator('input[name="startOfVisibility"]').fill("2025-01-02");
    await page.getByRole("button", { name: "Enregistrer" }).click();

    await expect(
      page.getByText(
        "Veuillez renseigner au moins un type d’épreuve pour le jury de cette certification",
      ),
    ).toBeVisible();
  });
});
