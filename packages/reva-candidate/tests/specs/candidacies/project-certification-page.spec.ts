import { expect, test } from "next/experimental/testmode/playwright/msw";
import { graphql } from "next/experimental/testmode/playwright/msw";

import {
  assertCertificationTabVisibility,
  certificationTabsVisibilityScenarios,
  createCertificationForReducedRequirementsScenario,
} from "@tests/helpers/certification-page-tabs-visibility";
import {
  CandidacyEntity,
  createCandidacyEntity,
} from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import {
  createCandidacyGuardsAndDashboardHandlers,
  createCandidaciesGuardsHandlers,
  loginAndWaitForCandidaciesInitialLoad,
} from "@tests/helpers/handlers/candidacies/candidacies-guards.handler";
import { getArticlesForCertificationPageUsefulResourcesHandler } from "@tests/helpers/handlers/certification-page/useful-resources.handler";
import { graphQLResolver } from "@tests/helpers/network/msw";

import { Certification } from "@/graphql/generated/graphql";

const fvae = graphql.link("https://reva-api/api/graphql");

const candidate = createCandidateEntity();

function createProjectCertificationPageHandlers({
  certification,
  candidacy,
}: {
  certification: Certification;
  candidacy: CandidacyEntity;
}) {
  return [
    ...createCandidaciesGuardsHandlers({
      candidate,
      candidacies: [candidacy],
    }),
    ...createCandidacyGuardsAndDashboardHandlers(candidacy),
    fvae.query(
      "candidate_getCandidacyByIdWithCertification",
      graphQLResolver({
        getCandidacyById: {
          ...candidacy,
          hasMoreThanOneCertificationAvailable: false,
        },
      }),
    ),
    fvae.query(
      "getCertificationByIdForCertificationPage",
      graphQLResolver({ getCertification: certification }),
    ),
    getArticlesForCertificationPageUsefulResourcesHandler(),
  ];
}

test.describe("project certification page tabs visibility", () => {
  certificationTabsVisibilityScenarios.forEach(
    ({
      name,
      certificationLabel,
      structureLabel,
      reducedRequirementsState,
      expectedTabVisibility,
    }) => {
      test(`shows expected tabs when ${name}`, async ({ page, msw }) => {
        const certificationForScenario =
          createCertificationForReducedRequirementsScenario({
            certificationLabel,
            structureLabel,
            reducedRequirementsState,
            idPrefix: "project-certification",
          });
        const candidacyForScenario = createCandidacyEntity({
          candidate,
          certification: certificationForScenario,
          status: "PROJET",
        });

        msw.use(
          ...createProjectCertificationPageHandlers({
            certification: certificationForScenario,
            candidacy: candidacyForScenario,
          }),
        );

        await loginAndWaitForCandidaciesInitialLoad(page);
        await page.goto(
          `candidates/${candidate.id}/candidacies/${candidacyForScenario.id}/certification/${certificationForScenario.id}/`,
        );

        await expect(
          page.getByRole("heading", {
            name: certificationForScenario.label,
            level: 1,
          }),
        ).toBeVisible();
        await assertCertificationTabVisibility(page, expectedTabVisibility);
      });
    },
  );
});

test.describe("Shows available parcours", () => {
  test("when i access the tab it shows the available parcours", async ({
    page,
    msw,
  }) => {
    const certification = createCertificationForReducedRequirementsScenario({
      certificationLabel: "Certification du SUP",
      structureLabel: "Structure SUP",
      reducedRequirementsState: true,
      idPrefix: "project-certification",
    });
    const candidacy = createCandidacyEntity({
      candidate,
      certification: certification,
      status: "PROJET",
    });

    msw.use(
      ...createProjectCertificationPageHandlers({
        certification: certification,
        candidacy: candidacy,
      }),
    );

    await loginAndWaitForCandidaciesInitialLoad(page);
    await page.goto(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/certification/${certification.id}/`,
    );

    await page.getByRole("tab", { name: "Établissements" }).click();

    await expect(
      page.getByText(
        "Établissements proposant ce diplôme sur la plateforme France VAE",
      ),
    ).toBeVisible();
    await expect(page.getByText("Certification Authority")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Certification Authority" }),
    ).toHaveAttribute("href", "https://www.certification-authority.com");
    await expect(page.getByText("Parcours 1")).toBeVisible();
  });
});
