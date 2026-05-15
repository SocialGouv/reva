import { expect, test } from "next/experimental/testmode/playwright/msw";
import { graphql } from "next/experimental/testmode/playwright/msw";

import {
  createCandidacyEntity,
  CandidacyEntity,
} from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createCertificationEntity } from "@tests/helpers/entities/create-certification.entity";
import {
  createCandidaciesGuardsHandlers,
  createCandidacyGuardsAndDashboardHandlers,
  loginAndWaitForCandidaciesInitialLoad,
} from "@tests/helpers/handlers/candidacies/candidacies-guards.handler";
import { graphQLResolver } from "@tests/helpers/network/msw";

import { Certification } from "@/graphql/generated/graphql";

const fvae = graphql.link("https://reva-api/api/graphql");

const candidate = createCandidateEntity();

const certification = createCertificationEntity({
  label: "Titre Professionnel Développeur Web",
  codeRncp: "RNCP1234",
}) as Certification;

function createCertificationAuthorityContactInfoHandlers(
  candidacy: CandidacyEntity,
) {
  return [
    ...createCandidaciesGuardsHandlers({
      candidate,
      candidacies: [candidacy],
    }),
    ...createCandidacyGuardsAndDashboardHandlers(candidacy),
    fvae.query(
      "getCandidacyByIdForCertificationAuthorityContactInfoPage",
      graphQLResolver({
        getCandidacyById: {
          certification: {
            id: certification.id,
            codeRncp: certification.codeRncp,
            label: certification.label,
          },
        },
      }),
    ),
  ];
}

test.describe("certification authority contact info page", () => {
  const candidacy = createCandidacyEntity({
    candidate,
    certification,
    status: "PARCOURS_CONFIRME",
  });

  test.use({
    mswHandlers: [
      createCertificationAuthorityContactInfoHandlers(candidacy),
      { scope: "test" },
    ],
  });

  test("shows the page title and description", async ({ page }) => {
    await loginAndWaitForCandidaciesInitialLoad(page);
    await page.goto(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/certification-authority-contact-info/`,
    );

    await expect(
      page.getByRole("heading", { name: "Certificateur", level: 1 }),
    ).toBeVisible();

    await expect(
      page.getByText(
        "Le certificateur étudiera les dossiers de faisabilité et de validation de cette candidature.",
      ),
    ).toBeVisible();
  });

  test("shows the breadcrumb with certification details", async ({ page }) => {
    await loginAndWaitForCandidaciesInitialLoad(page);
    await page.goto(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/certification-authority-contact-info/`,
    );

    const breadcrumb = page.getByLabel("vous êtes ici :");

    await expect(
      breadcrumb.getByRole("link", { name: "Mes candidatures" }),
    ).toBeVisible();

    await expect(
      breadcrumb.getByRole("link", {
        name: `RNCP ${certification.codeRncp} : ${certification.label}`,
      }),
    ).toBeVisible();

    await expect(breadcrumb.getByText("Certificateur")).toBeVisible();
  });

  test("shows a back button", async ({ page }) => {
    await loginAndWaitForCandidaciesInitialLoad(page);
    await page.goto(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/certification-authority-contact-info/`,
    );

    await expect(page.getByRole("button", { name: "Retour" })).toBeVisible();
  });
});
