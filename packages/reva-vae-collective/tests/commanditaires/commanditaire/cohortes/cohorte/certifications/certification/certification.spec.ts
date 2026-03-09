import {
  expect,
  graphql,
  HttpResponse,
  test,
  type Page,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../../../shared/utils/auth/login";
import { mockQueryActiveFeatures } from "../../../../../../shared/utils/mockActiveFeatures";
const fvae = graphql.link("https://reva-api/api/graphql");
const certificationPath =
  "/vae-collective/commanditaires/115c2693-b625-491b-8b91-c7b3875d86a0/cohortes/0eda2cbf-78ae-47af-9f28-34d05f972712/certifications/b122423f-6eb6-4d80-94b2-8e57fd0e4cd7";

const certificationTabLabels = [
  "Métier",
  "Prérequis",
  "Jury",
  "Établissements",
] as const;
type CertificationTabLabel = (typeof certificationTabLabels)[number];
type ReducedRequirementsState = true | false | null;
type CertificationTabVisibility = Record<CertificationTabLabel, boolean>;

const fullCertificationTabVisibility: CertificationTabVisibility = {
  Métier: true,
  Prérequis: true,
  Jury: true,
  Établissements: false,
};

const reducedCertificationTabVisibility: CertificationTabVisibility = {
  Métier: true,
  Prérequis: false,
  Jury: false,
  Établissements: true,
};

function createCertificationResponse({
  certificationLabel,
  reducedRequirementsState,
}: {
  certificationLabel: string;
  reducedRequirementsState: ReducedRequirementsState;
}) {
  return {
    data: {
      getCertification: {
        id: "b122423f-6eb6-4d80-94b2-8e57fd0e4cd7",
        codeRncp: "40029",
        label: certificationLabel,
        isAapAvailable: true,
        level: 5,
        typeDiplome: "Brevet de technicien supérieur",
        rncpObjectifsContexte: "contexte",
        juryTypeMiseEnSituationProfessionnelle: "LES_DEUX",
        juryTypeSoutenanceOrale: "LES_DEUX",
        juryEstimatedCost: 200,
        juryPlace: "",
        parcoursByCertificationAuthorities: reducedRequirementsState
          ? [
              {
                certificationAuthority: {
                  label: "Certification Authority",
                  websiteUrl: "https://www.certification-authority.com",
                },
                parcours: [
                  {
                    id: "parcours-1",
                    label: "Parcours 1",
                  },
                ],
              },
            ]
          : [],
        certificationAuthorityStructure:
          reducedRequirementsState === null
            ? null
            : { hasReducedRequirements: reducedRequirementsState },
        prerequisites: [
          { id: "1", label: "prerequis1" },
          { id: "2", label: "prerequis2" },
        ],
      },
    },
  };
}

const certificationTabsVisibilityScenarios = [
  {
    name: "hasReducedRequirements=true",
    certificationLabel: "Certification SUP VAE collective",
    reducedRequirementsState: true,
    expectedTabVisibility: reducedCertificationTabVisibility,
  },
  {
    name: "hasReducedRequirements=false",
    certificationLabel: "Certification standard VAE collective",
    reducedRequirementsState: false,
    expectedTabVisibility: fullCertificationTabVisibility,
  },
  {
    name: "certificationAuthorityStructure=null",
    certificationLabel: "Certification sans structure VAE collective",
    reducedRequirementsState: null,
    expectedTabVisibility: fullCertificationTabVisibility,
  },
] as const;

async function assertCertificationTabVisibility(
  page: Page,
  expectedTabVisibility: CertificationTabVisibility,
) {
  for (const tabLabel of certificationTabLabels) {
    await expect(page.getByRole("tab", { name: tabLabel })).toHaveCount(
      expectedTabVisibility[tabLabel] ? 1 : 0,
    );
  }
}

test.use({
  mswHandlers: [
    [
      fvae.query("getCertificationInfoForCertificationPage", () => {
        return HttpResponse.json(
          createCertificationResponse({
            certificationLabel:
              "Brevet de technicien supérieur - Construction et aménagement de véhicules",
            reducedRequirementsState: false,
          }),
        );
      }),
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

  await page.goto(certificationPath);

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

  await page.goto(certificationPath);

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

  await page.goto(`${certificationPath}?certificationSelectionDisabled=true`);

  await expect(
    page.getByRole("heading", {
      name: "Brevet de technicien supérieur - Construction et aménagement de véhicules",
    }),
  ).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Choisir cette certification" }),
  ).not.toBeVisible();
});

certificationTabsVisibilityScenarios.forEach(
  ({
    name,
    certificationLabel,
    reducedRequirementsState,
    expectedTabVisibility,
  }) => {
    test(`it should show expected tabs when ${name}`, async ({ page, msw }) => {
      msw.use(
        fvae.query("getCertificationInfoForCertificationPage", () => {
          return HttpResponse.json(
            createCertificationResponse({
              certificationLabel,
              reducedRequirementsState,
            }),
          );
        }),
      );

      await login({ page, role: "gestionnaireVaeCollective" });
      await page.goto(certificationPath);
      await expect(
        page.getByRole("heading", { name: certificationLabel, level: 1 }),
      ).toBeVisible();

      await assertCertificationTabVisibility(page, expectedTabVisibility);
    });
  },
);

test("shows available parcours", async ({ page, msw }) => {
  msw.use(
    fvae.query("getCertificationInfoForCertificationPage", () => {
      return HttpResponse.json(
        createCertificationResponse({
          certificationLabel: "Certification SUP",
          reducedRequirementsState: true,
        }),
      );
    }),
  );

  await login({ page, role: "gestionnaireVaeCollective" });
  await page.goto(certificationPath);
  await page.getByRole("tab", { name: "Établissements" }).click();
  await expect(
    page.getByText(
      "Établissements proposant ce diplôme sur la plateforme France VAE",
    ),
  ).toBeVisible();
  await expect(page.getByText("Certification Authority")).toBeVisible();
  await expect(page.getByText("Parcours 1")).toBeVisible();
});
