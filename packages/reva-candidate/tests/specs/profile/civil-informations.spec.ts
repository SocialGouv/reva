import {
  expect,
  graphql,
  test,
  type Page,
} from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import { createCandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { dashboardHandlers } from "@tests/helpers/handlers/dashboard.handler";
import { graphQLResolver } from "@tests/helpers/network/msw";
import { waitGraphQL } from "@tests/helpers/network/requests";

const fvae = graphql.link("https://reva-api/api/graphql");

const FRANCE_COUNTRY_ID = "208ef9d1-4d18-475b-9f5f-575da5f7218c";

const countries = [
  { id: FRANCE_COUNTRY_ID, label: "France", isoCode: "FRA" },
  { id: "country-2", label: "Canada", isoCode: "CAN" },
];

const departments = [
  { id: "dept-75", label: "Paris", code: "75", timezone: "Europe/Paris" },
  { id: "dept-69", label: "Lyon", code: "69", timezone: "Europe/Paris" },
];

const candidateFields = {
  firstname: "Marie",
  lastname: "Dupont",
  givenName: "Mary",
  firstname2: "Anne",
  firstname3: "Claire",
  middleNames: "Anne Claire",
  gender: "woman",
  birthCity: "Lyon",
  birthdate: "1985-06-15",
  birthDepartment: departments[0],
  country: countries[0],
  nationality: "Française",
  street: "10 rue Victor Hugo",
  city: "Lyon",
  zip: "69001",
  phone: "0612345678",
  email: "marie.dupont@example.com",
  addressComplement: "Bâtiment A",
} as const;

const fcCandidate = createCandidateEntity({
  ...candidateFields,
  franceConnectLinked: true,
});

const nonFcCandidate = createCandidateEntity({
  ...candidateFields,
  franceConnectLinked: false,
});

function civilInformationHandlers(
  candidate: ReturnType<typeof createCandidateEntity>,
) {
  const candidacy = createCandidacyEntity({ candidate });
  const { handlers: guardHandlers } = dashboardHandlers({
    candidacy,
    activeFeaturesForConnectedUser: ["MIDDLE_NAMES", "BIRTH_PLACE"],
  });

  return [
    ...guardHandlers,
    fvae.query(
      "getCandidateByIdForCivilInformationPage",
      graphQLResolver({
        candidate_getCandidateById: candidate,
      }),
    ),
    fvae.query(
      "getCountries",
      graphQLResolver({
        getCountries: countries,
      }),
    ),
    fvae.query(
      "getDepartments",
      graphQLResolver({
        getDepartments: departments,
      }),
    ),
  ];
}

const SELECTORS = {
  firstname: '[data-testid="firstname-input"] input',
  lastname: '[data-testid="lastname-input"] input',
  givenName: '[data-testid="given-name-input"] input',
  middleNames: '[data-testid="middle-names-input"] input',
  birthdate: '[data-testid="birthdate-input"] input',
  nationality: '[data-testid="nationality-input"] input',
};

async function visitCivilInformations(page: Page) {
  await login(page);
  await page.goto("candidates/1/profile/civil-informations");
  await Promise.all([
    waitGraphQL(page, "getCandidateByIdForCandidateGuard"),
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getCandidateByIdForCivilInformationPage"),
    waitGraphQL(page, "getCountries"),
    waitGraphQL(page, "getDepartments"),
  ]);
}

test.describe("FranceConnect linked candidate", () => {
  test.use({
    mswHandlers: [civilInformationHandlers(fcCandidate), { scope: "test" }],
  });

  test("should disable FC-locked fields", async ({ page }) => {
    await visitCivilInformations(page);

    for (const field of ["lastname", "firstname", "middleNames", "birthdate"]) {
      await expect(
        page.locator(SELECTORS[field as keyof typeof SELECTORS]),
      ).toBeDisabled();
    }

    await expect(
      page.getByRole("checkbox", {
        name: "Je suis né(e) à l’étranger",
      }),
    ).toBeDisabled();
  });

  test("should keep non-locked fields editable", async ({ page }) => {
    await visitCivilInformations(page);

    await expect(page.locator(SELECTORS.givenName)).not.toBeDisabled();
    await expect(
      page.locator('input[name="gender"]').first(),
    ).not.toBeDisabled();
    await expect(
      page.locator('[data-testid="autocomplete"] input'),
    ).not.toBeDisabled();
  });
});

test.describe("Non-FranceConnect candidate", () => {
  test.use({
    mswHandlers: [civilInformationHandlers(nonFcCandidate), { scope: "test" }],
  });

  test("should have all default fields editable", async ({ page }) => {
    await visitCivilInformations(page);

    const DEFAULT_SELECTORS = {
      ...SELECTORS,
      birthPlace: '[data-testid="autocomplete"] input',
    };

    for (const selector of Object.values(DEFAULT_SELECTORS)) {
      await expect(page.locator(selector)).not.toBeDisabled();
    }

    await expect(
      page.locator('input[name="gender"]').first(),
    ).not.toBeDisabled();

    await expect(
      page.getByRole("checkbox", {
        name: "Je suis né(e) à l’étranger",
      }),
    ).not.toBeDisabled();
  });

  test("should have all default fields editable when birth place is foreign", async ({
    page,
  }) => {
    await visitCivilInformations(page);

    await expect(
      page.getByRole("checkbox", {
        name: "Je suis né(e) à l’étranger",
      }),
    ).not.toBeDisabled();

    await page
      .getByRole("checkbox", {
        name: "Je suis né(e) à l’étranger",
      })
      .check({ force: true });

    const DEFAULT_SELECTORS = {
      ...SELECTORS,
      country: '[data-testid="country-select"] select',
    };

    for (const selector of Object.values(DEFAULT_SELECTORS)) {
      await expect(page.locator(selector)).not.toBeDisabled();
    }

    await expect(
      page.locator('input[name="gender"]').first(),
    ).not.toBeDisabled();
  });
});
