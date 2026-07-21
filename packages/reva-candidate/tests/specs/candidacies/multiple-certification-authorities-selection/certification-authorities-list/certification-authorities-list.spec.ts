import { expect, test } from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import { createCandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createCertificationAuthorityEntity } from "@tests/helpers/entities/create-certification-authority.entity";
import { createCertificationEntity } from "@tests/helpers/entities/create-certification.entity";
import {
  certificationAuthoritiesListHandlers,
  navigateToCertificationAuthoritiesList,
} from "@tests/helpers/handlers/multiple-certification-authorities-selection/certification-authorities-list.handler";
import { waitGraphQL } from "@tests/helpers/network/requests";

import type { Page } from "@playwright/test";
import type { MswFixture } from "next/experimental/testmode/playwright/msw";

const candidate = createCandidateEntity();
const certification = createCertificationEntity();

const firstCertificationAuthority = createCertificationAuthorityEntity({
  id: "cert-authority-1",
  label: "UIMM - Île-de-France",
  contactEmail: "uimm-idf@example.com",
});
const secondCertificationAuthority = createCertificationAuthorityEntity({
  id: "cert-authority-2",
  label: "UIMM - Occitanie",
  contactEmail: "uimm-occitanie@example.com",
});

async function setupAndNavigate(
  page: Page,
  msw: MswFixture,
  {
    currentCertificationAuthority,
  }: {
    currentCertificationAuthority?: typeof firstCertificationAuthority;
  } = {},
) {
  const candidacy = createCandidacyEntity({
    candidate,
    certification,
    certificationAuthority: currentCertificationAuthority ?? null,
    certificationAuthorities: [
      firstCertificationAuthority,
      secondCertificationAuthority,
    ],
  });
  const { handlers } = certificationAuthoritiesListHandlers(candidacy);

  msw.use(...handlers);
  await login(page);
  await navigateToCertificationAuthoritiesList(
    page,
    candidate.id,
    candidacy.id,
  );

  return { candidacy };
}

test.describe("certification authorities list page", () => {
  test("lists the certification authorities available for the candidacy", async ({
    page,
    msw,
  }) => {
    await setupAndNavigate(page, msw);

    await expect(
      page.getByRole("heading", { name: "Certificateur", level: 1 }),
    ).toBeVisible();

    await expect(page.getByText("UIMM - Île-de-France")).toBeVisible();
    await expect(page.getByText("UIMM - Occitanie")).toBeVisible();
  });

  test("filters the list when searching", async ({ page, msw }) => {
    await setupAndNavigate(page, msw);

    await page.locator('[data-testid="search-bar-input"]').fill("Occitanie");
    await page.getByRole("button", { name: "Rechercher" }).click();

    await expect(page.getByText("UIMM - Occitanie")).toBeVisible();
    await expect(page.getByText("UIMM - Île-de-France")).not.toBeVisible();
  });

  test("selects a certification authority directly when none is set yet", async ({
    page,
    msw,
  }) => {
    const { candidacy } = await setupAndNavigate(page, msw);

    const mutationPromise = waitGraphQL(
      page,
      "updateCertificationAuthorityForMultipleCertificationAuthoritiesListPage",
    );

    await page.getByText("UIMM - Île-de-France").click();

    await mutationPromise;

    await expect(page).toHaveURL(
      `/candidat/candidates/${candidate.id}/candidacies/${candidacy.id}/certification-authority-details/`,
    );
  });

  test("asks for confirmation before switching to another certification authority", async ({
    page,
    msw,
  }) => {
    const { candidacy } = await setupAndNavigate(page, msw, {
      currentCertificationAuthority: firstCertificationAuthority,
    });

    await page.getByText("UIMM - Occitanie").click();

    await expect(
      page.getByText("Confirmation du choix du certificateur"),
    ).toBeVisible();

    const mutationPromise = waitGraphQL(
      page,
      "updateCertificationAuthorityForMultipleCertificationAuthoritiesListPage",
    );

    await page.getByRole("button", { name: "Confirmer" }).click();

    await mutationPromise;

    await expect(page).toHaveURL(
      `/candidat/candidates/${candidate.id}/candidacies/${candidacy.id}/certification-authority-details/`,
    );
  });

  test("links back to the candidacy page", async ({ page, msw }) => {
    const { candidacy } = await setupAndNavigate(page, msw);

    await page.locator('[data-testid="back-button"]').click();

    await expect(page).toHaveURL(
      `/candidat/candidates/${candidate.id}/candidacies/${candidacy.id}/`,
    );
  });
});
