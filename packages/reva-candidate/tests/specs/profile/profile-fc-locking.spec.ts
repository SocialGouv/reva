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
  { id: FRANCE_COUNTRY_ID, label: "France", isoCode: "FR" },
  { id: "country-2", label: "Canada", isoCode: "CA" },
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

function profileHandlers(candidate: ReturnType<typeof createCandidateEntity>) {
  const candidacy = createCandidacyEntity({ candidate });
  const { handlers: guardHandlers } = dashboardHandlers({
    candidacy,
    activeFeaturesForConnectedUser: ["MIDDLE_NAMES"],
  });

  return [
    ...guardHandlers,
    fvae.query(
      "getCandidateByIdForProfilePage",
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
  gender: '[data-testid="gender-select"] select',
  birthCity: '[data-testid="birth-city-input"] input',
  birthdate: '[data-testid="birthdate-input"] input',
  birthDepartment: '[data-testid="birth-department-select"] select',
  country: '[data-testid="country-select"] select',
  nationality: '[data-testid="nationality-input"] input',
  street: '[data-testid="street-input"] input',
  city: '[data-testid="city-input"] input',
  zip: '[data-testid="zip-input"] input',
  phone: '[data-testid="phone-input"] input',
  email: '[data-testid="email-input"] input',
  addressComplement: '[data-testid="address-complement-input"] input',
};

async function visitProfile(page: Page) {
  await login(page);
  await page.goto("candidates/1/profile");
  await Promise.all([
    waitGraphQL(page, "getCandidateByIdForCandidateGuard"),
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getCandidateByIdForProfilePage"),
    waitGraphQL(page, "getCountries"),
    waitGraphQL(page, "getDepartments"),
  ]);
}

test.describe("FranceConnect linked candidate", () => {
  test.use({
    mswHandlers: [profileHandlers(fcCandidate), { scope: "test" }],
  });

  test("should disable FC-locked fields", async ({ page }) => {
    await visitProfile(page);

    await expect(page.locator(SELECTORS.lastname)).toBeDisabled();
    await expect(page.locator(SELECTORS.firstname)).toBeDisabled();
    await expect(page.locator(SELECTORS.middleNames)).toBeDisabled();
    await expect(page.locator(SELECTORS.birthdate)).toBeDisabled();
    await expect(page.locator(SELECTORS.country)).toBeDisabled();
  });

  test("should keep non-locked fields editable", async ({ page }) => {
    await visitProfile(page);

    await expect(page.locator(SELECTORS.nationality)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.gender)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.givenName)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.street)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.city)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.zip)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.phone)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.email)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.addressComplement)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.birthDepartment)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.birthCity)).not.toBeDisabled();
  });
});

test.describe("FranceConnect linked candidate with non-France country", () => {
  const fcCandidateNonFrance = createCandidateEntity({
    ...candidateFields,
    franceConnectLinked: true,
    country: countries[1],
    birthDepartment: null,
  });

  test.use({
    mswHandlers: [profileHandlers(fcCandidateNonFrance), { scope: "test" }],
  });

  test("should not disable birthCity when country is not France", async ({
    page,
  }) => {
    await visitProfile(page);

    await expect(page.locator(SELECTORS.birthCity)).not.toBeDisabled();
  });

  test("should disable birthDepartment when country is not France", async ({
    page,
  }) => {
    await visitProfile(page);

    await expect(page.locator(SELECTORS.birthDepartment)).toBeDisabled();
  });
});

test.describe("Non-FranceConnect candidate", () => {
  test.use({
    mswHandlers: [profileHandlers(nonFcCandidate), { scope: "test" }],
  });

  test("should have all fields editable", async ({ page }) => {
    await visitProfile(page);

    await expect(page.locator(SELECTORS.lastname)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.firstname)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.middleNames)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.birthdate)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.country)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.birthDepartment)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.nationality)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.email)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.gender)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.givenName)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.birthCity)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.street)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.city)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.zip)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.phone)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.addressComplement)).not.toBeDisabled();
  });
});
