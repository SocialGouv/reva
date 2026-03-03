import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import {
  assertCertificationTabVisibility,
  certificationTabsVisibilityScenarios,
  createCertificationForReducedRequirementsScenario,
} from "@tests/helpers/certification-page-tabs-visibility";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import {
  createCandidaciesGuardsHandlers,
  loginAndWaitForCandidaciesInitialLoad,
} from "@tests/helpers/handlers/candidacies/candidacies-guards.handler";
import { getArticlesForCertificationPageUsefulResourcesHandler } from "@tests/helpers/handlers/certification-page/useful-resources.handler";
import { graphQLResolver } from "@tests/helpers/network/msw";

import { Certification } from "@/graphql/generated/graphql";

const fvae = graphql.link("https://reva-api/api/graphql");

const candidate = createCandidateEntity();

function createCreateCertificationPageHandlers({
  certification,
}: {
  certification: Certification;
}) {
  return [
    ...createCandidaciesGuardsHandlers({ candidate }),
    fvae.query(
      "getCertificationById",
      graphQLResolver({ getCertification: certification }),
    ),
    getArticlesForCertificationPageUsefulResourcesHandler(),
  ];
}

test.describe("create certification page tabs visibility", () => {
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
            idPrefix: "create-certification",
          });

        msw.use(
          ...createCreateCertificationPageHandlers({
            certification: certificationForScenario,
          }),
        );

        await loginAndWaitForCandidaciesInitialLoad(page);
        await page.goto(
          `candidates/${candidate.id}/candidacies/create/certifications/${certificationForScenario.id}/`,
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
