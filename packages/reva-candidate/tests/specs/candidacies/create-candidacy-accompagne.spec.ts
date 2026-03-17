import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { createCandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createCertificationEntity } from "@tests/helpers/entities/create-certification.entity";
import {
  createCandidacyGuardsAndDashboardHandlers,
  createCandidaciesGuardsHandlers,
  loginAndWaitForCandidaciesInitialLoad,
} from "@tests/helpers/handlers/candidacies/candidacies-guards.handler";
import { getArticlesForCertificationPageUsefulResourcesHandler } from "@tests/helpers/handlers/certification-page/useful-resources.handler";
import { graphQLResolver } from "@tests/helpers/network/msw";
import { waitGraphQL } from "@tests/helpers/network/requests";

const fvae = graphql.link("https://reva-api/api/graphql");

const candidate = createCandidateEntity();
const certification = createCertificationEntity({
  label: "Certification 1",
  codeRncp: "RNCP0001",
});
const candidacy = createCandidacyEntity({
  candidate,
  certification,
  status: "PROJET",
  typeAccompagnement: "ACCOMPAGNE",
});

function createCandidaciesHandlers() {
  return [
    ...createCandidaciesGuardsHandlers({ candidate }),
    fvae.query(
      "certifications",
      graphQLResolver({
        searchCertificationsForCandidate: {
          rows: [certification],
          info: {
            totalRows: 1,
            currentPage: 1,
            totalPages: 1,
            pageLength: 10,
          },
        },
      }),
    ),
    fvae.query(
      "getCertificationById",
      graphQLResolver({ getCertification: certification }),
    ),
    getArticlesForCertificationPageUsefulResourcesHandler(),
    fvae.query(
      "getCertificationByIdForCreateCandidacy",
      graphQLResolver({
        getCertification: {
          id: certification.id,
          label: certification.label,
          codeRncp: certification.codeRncp,
          isAapAvailable: true,
        },
      }),
    ),
    fvae.mutation(
      "createCandidacy",
      graphQLResolver({
        candidacy_createCandidacy: {
          id: candidacy.id,
        },
      }),
    ),
    ...createCandidacyGuardsAndDashboardHandlers(candidacy),
  ];
}

test.describe("create candidacy accompagnée from candidacies page", () => {
  test.use({
    mswHandlers: [createCandidaciesHandlers(), { scope: "test" }],
  });

  test("create candidacy", async ({ page }) => {
    await loginAndWaitForCandidaciesInitialLoad(page);

    await page.goto(`candidates/${candidate.id}/candidacies/`);

    await expect(
      page.getByText(
        "Valorisez votre expérience professionnelle en commençant une candidature dès maintenant.",
      ),
    ).toBeVisible();

    const createCandidacyLink = page.getByRole("link", {
      name: "Commencer une VAE",
    });
    await createCandidacyLink.click();

    await expect(page).toHaveURL(
      `candidates/${candidate.id}/candidacies/create/`,
    );

    await expect(
      page.getByRole("heading", { name: "Commencer une VAE" }),
    ).toBeVisible();

    const maDemarcheEstPersonnelleCard = page.getByRole("link", {
      name: "Ma démarche est personnelle",
    });
    await expect(maDemarcheEstPersonnelleCard).toBeVisible();
    await maDemarcheEstPersonnelleCard.click();

    await expect(page).toHaveURL(
      `candidates/${candidate.id}/candidacies/create/certifications/`,
    );

    await waitGraphQL(page, "certifications");

    const certificationCard = page.getByRole("link", {
      name: certification.label,
    });
    await expect(certificationCard).toBeVisible();
    await certificationCard.click();

    await expect(page).toHaveURL(
      `candidates/${candidate.id}/candidacies/create/certifications/${certification.id}/`,
    );

    const selectCertificationButton = page.getByRole("button", {
      name: "Choisir ce diplôme",
    });
    await selectCertificationButton.click();

    await expect(page).toHaveURL(
      `candidates/${candidate.id}/candidacies/create/certifications/${certification.id}/type-accompagnement/`,
    );

    const accompagnementButton = page.getByRole("button", {
      name: "Avec un accompagnateur",
    });
    await expect(accompagnementButton).toBeVisible();
    await accompagnementButton.click();

    await expect(page).toHaveURL(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/`,
    );
  });
});
