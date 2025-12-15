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

const candidate = createCandidateEntity({
  firstname: "John",
  lastname: "Doe",
  givenName: "Johnny",
  firstname2: "Paul",
  firstname3: "Max",
  gender: "man",
  birthCity: "Paris",
  birthdate: "1990-01-01",
  birthDepartment: departments[0],
  country: countries[0],
  nationality: "Française",
  street: "1 rue de Paris",
  city: "Paris",
  zip: "75000",
  phone: "0601020304",
  email: "john.doe@example.com",
  addressComplement: "Appartement 1",
});
const candidacy = createCandidacyEntity({
  candidate,
});

const { handlers: guardHandlers } = dashboardHandlers({ candidacy });

function profileHandlers() {
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
    fvae.mutation(
      "updateCandidateInformationMutation",
      graphQLResolver({
        candidate_updateCandidateInformationBySelf: {
          id: candidate.id,
        },
      }),
    ),
  ];
}

test.use({
  mswHandlers: [profileHandlers(), { scope: "test" }],
});

const SELECTORS = {
  submit: '[data-testid="form-buttons"] button[type="submit"]',
  reset: '[data-testid="form-buttons"] button[type="reset"]',
  back: '[data-testid="back-button"]',
  firstname: '[data-testid="firstname-input"] input',
  lastname: '[data-testid="lastname-input"] input',
  givenName: '[data-testid="given-name-input"] input',
  firstname2: '[data-testid="firstname2-input"] input',
  firstname3: '[data-testid="firstname3-input"] input',
  gender: '[data-testid="gender-select"] select',
  birthCity: '[data-testid="birth-city-input"] input',
  birthdate: '[data-testid="birthdate-input"] input',
  birthDepartment: '[data-testid="birth-department-select"] select',
  country: '[data-testid="country-select"] select',
  street: '[data-testid="street-input"] input',
  city: '[data-testid="city-input"] input',
  zip: '[data-testid="zip-input"] input',
  phone: '[data-testid="phone-input"] input',
  email: '[data-testid="email-input"] input',
  addressComplement: '[data-testid="address-complement-input"] input',
  toastSuccess: '[data-testid="toast-success"]',
  toastError: '[data-testid="toast-error"]',
};

async function waitForProfileData(page: Page) {
  await Promise.all([
    waitGraphQL(page, "getCandidateByIdForCandidateGuard"),
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getCandidateByIdForProfilePage"),
    waitGraphQL(page, "getCountries"),
    waitGraphQL(page, "getDepartments"),
  ]);
}

async function visitProfile(
  page: Page,
  args?: { disableNavigation?: boolean },
) {
  const { disableNavigation } = args ?? {};
  await login(page);
  await page.goto(
    `candidates/${candidate.id}/profile${disableNavigation ? "?navigationDisabled=true" : ""}`,
  );
  await waitForProfileData(page);
}

test.describe("Profile Page Initial Loading", () => {
  test("should load candidate personal information correctly", async ({
    page,
  }) => {
    await visitProfile(page);

    await expect(page.locator(SELECTORS.firstname)).toHaveValue(
      candidate.firstname,
    );
    await expect(page.locator(SELECTORS.lastname)).toHaveValue(
      candidate.lastname,
    );
    await expect(page.locator(SELECTORS.givenName)).toHaveValue(
      candidate.givenName ?? "Should not be empty",
    );
    await expect(page.locator(SELECTORS.firstname2)).toHaveValue(
      candidate.firstname2 ?? "Should not be empty",
    );
    await expect(page.locator(SELECTORS.firstname3)).toHaveValue(
      candidate.firstname3 ?? "Should not be empty",
    );
    await expect(page.locator(SELECTORS.gender)).toHaveValue(
      candidate.gender ?? "Should not be empty",
    );
    await expect(page.locator(SELECTORS.birthCity)).toHaveValue(
      candidate.birthCity ?? "Should not be empty",
    );
    await expect(page.locator(SELECTORS.birthdate)).toHaveValue(
      candidate.birthdate ?? "Should not be empty",
    );
    await expect(page.locator(SELECTORS.street)).toHaveValue(
      candidate.street ?? "Should not be empty",
    );
    await expect(page.locator(SELECTORS.city)).toHaveValue(
      candidate.city ?? "Should not be empty",
    );
    await expect(page.locator(SELECTORS.zip)).toHaveValue(candidate.zip ?? "");
    await expect(page.locator(SELECTORS.phone)).toHaveValue(
      candidate.phone ?? "Should not be empty",
    );
    await expect(page.locator(SELECTORS.email)).toHaveValue(
      candidate.email ?? "Should not be empty",
    );
    await expect(page.locator(SELECTORS.addressComplement)).toHaveValue(
      candidate.addressComplement ?? "Should not be empty",
    );
  });

  test("should load countries and departments in select fields", async ({
    page,
  }) => {
    await visitProfile(page);

    await expect(page.locator(`${SELECTORS.country} option`)).toHaveCount(
      countries.length,
    );
    await expect(
      page.locator(`${SELECTORS.birthDepartment} option`),
    ).toHaveCount(departments.length + 1);
  });
});

test.describe("Form Field Validation", () => {
  test("should display validation errors for required fields when submitting empty form", async ({
    page,
  }) => {
    await visitProfile(page);

    await page.locator(SELECTORS.firstname).fill("");
    await page.locator(SELECTORS.lastname).fill("");
    await page.locator(SELECTORS.birthCity).fill("");
    await page.locator(SELECTORS.birthdate).fill("");
    await page.locator(SELECTORS.street).fill("");
    await page.locator(SELECTORS.city).fill("");
    await page.locator(SELECTORS.zip).fill("");
    await page.locator(SELECTORS.phone).fill("");
    await page.locator(SELECTORS.email).fill("");

    await page.locator(SELECTORS.submit).click();

    await expect(page.getByTestId("firstname-input")).toHaveClass(
      /fr-input-group--error/,
    );
    await expect(page.getByTestId("lastname-input")).toHaveClass(
      /fr-input-group--error/,
    );
    await expect(page.getByTestId("phone-input")).toHaveClass(
      /fr-input-group--error/,
    );
    await expect(page.getByTestId("email-input")).toHaveClass(
      /fr-input-group--error/,
    );
  });

  test("should validate email format", async ({ page }) => {
    await visitProfile(page);

    await page.locator(SELECTORS.email).fill("invalid-email");
    await page.locator(SELECTORS.submit).click();

    await expect(page.getByTestId("email-input")).toHaveClass(
      /fr-input-group--error/,
    );
  });

  test("should validate phone number format", async ({ page }) => {
    await visitProfile(page);

    await page.locator(SELECTORS.phone).fill("123");
    await page.locator(SELECTORS.submit).click();

    await expect(page.getByTestId("phone-input")).toHaveClass(
      /fr-input-group--error/,
    );
  });

  test("should validate zip code format", async ({ page }) => {
    await visitProfile(page);

    await page.locator(SELECTORS.zip).fill("123");
    await page.locator(SELECTORS.submit).click();

    await expect(page.getByTestId("zip-input")).toHaveClass(
      /fr-input-group--error/,
    );
  });

  test("should validate birthdate is not in the future", async ({ page }) => {
    await visitProfile(page);

    await page.locator(SELECTORS.birthdate).fill("2050-01-01");
    await page.locator(SELECTORS.submit).click();

    await expect(page.getByTestId("birthdate-input")).toHaveClass(
      /fr-input-group--error/,
    );
  });
});

test.describe("Form Submission Handling", () => {
  test("should successfully submit form with valid data", async ({ page }) => {
    await visitProfile(page);

    await page.locator(SELECTORS.firstname).fill("Jane");
    await page.locator(SELECTORS.lastname).fill("Smith");
    await page.locator(SELECTORS.phone).fill("0607080910");

    const mutationPromise = waitGraphQL(
      page,
      "updateCandidateInformationMutation",
    );

    await page.locator(SELECTORS.submit).click();
    await mutationPromise;

    await expect(page.locator(SELECTORS.toastSuccess)).toBeVisible();
  });

  test("should display error message when API request fails", async ({
    page,
    msw,
  }) => {
    msw.use(
      fvae.mutation("updateCandidateInformationMutation", (_, res, ctx) =>
        res(
          ctx.errors([
            { message: "Une erreur est survenue lors de la mise à jour" },
          ]),
        ),
      ),
    );

    await visitProfile(page);

    await page.locator(SELECTORS.firstname).fill("Jane");

    const mutationPromise = page.waitForResponse((response) => {
      if (!response.url().includes("api/graphql")) {
        return false;
      }
      try {
        const body = response.request().postDataJSON();
        return body.operationName === "updateCandidateInformationMutation";
      } catch {
        return false;
      }
    });

    await page.locator(SELECTORS.submit).click();
    await mutationPromise;

    await expect(page.locator(SELECTORS.toastError)).toBeVisible();
  });
});

test.describe("Form Reset Functionality", () => {
  test("should reset form to initial values when clicking reset button", async ({
    page,
  }) => {
    await visitProfile(page);

    await page.locator(SELECTORS.firstname).fill("Jane");
    await page.locator(SELECTORS.lastname).fill("Smith");
    await page.locator(SELECTORS.phone).fill("0607080910");

    await page.locator(SELECTORS.reset).click();

    await expect(page.locator(SELECTORS.firstname)).toHaveValue("John");
    await expect(page.locator(SELECTORS.lastname)).toHaveValue("Doe");
    await expect(page.locator(SELECTORS.phone)).toHaveValue("0601020304");
  });
});

test.describe("Optional Fields Handling", () => {
  test("should allow submission with empty optional fields", async ({
    page,
  }) => {
    await visitProfile(page);

    await page.locator(SELECTORS.givenName).fill("");
    await page.locator(SELECTORS.firstname2).fill("");
    await page.locator(SELECTORS.firstname3).fill("");
    await page.locator(SELECTORS.addressComplement).fill("");

    const mutationPromise = waitGraphQL(
      page,
      "updateCandidateInformationMutation",
    );

    await page.locator(SELECTORS.submit).click();
    await mutationPromise;

    await expect(page.locator(SELECTORS.toastSuccess)).toBeVisible();
  });
});

test.describe("Select Fields Interaction", () => {
  test("should allow changing gender selection", async ({ page }) => {
    await visitProfile(page);

    await page.locator(SELECTORS.gender).selectOption("woman");

    const mutationPromise = waitGraphQL(
      page,
      "updateCandidateInformationMutation",
    );

    await page.locator(SELECTORS.submit).click();
    await mutationPromise;

    await expect(page.locator(SELECTORS.toastSuccess)).toBeVisible();
  });

  test("should allow changing country selection", async ({ page }) => {
    await visitProfile(page);

    await page.locator(SELECTORS.country).selectOption(countries[1].id);

    const mutationPromise = waitGraphQL(
      page,
      "updateCandidateInformationMutation",
    );

    await page.locator(SELECTORS.submit).click();
    await mutationPromise;

    await expect(page.locator(SELECTORS.toastSuccess)).toBeVisible();
  });

  test("should allow changing birth department when country is France", async ({
    page,
  }) => {
    await visitProfile(page);

    await page.locator(SELECTORS.country).selectOption(FRANCE_COUNTRY_ID);
    await expect(page.locator(SELECTORS.birthDepartment)).not.toBeDisabled();
    await page
      .locator(SELECTORS.birthDepartment)
      .selectOption(departments[1].id);

    const mutationPromise = waitGraphQL(
      page,
      "updateCandidateInformationMutation",
    );

    await page.locator(SELECTORS.submit).click();
    await mutationPromise;

    await expect(page.locator(SELECTORS.toastSuccess)).toBeVisible();
  });

  test("should disable birth department when country is not France", async ({
    page,
  }) => {
    await visitProfile(page);

    await page.locator(SELECTORS.country).selectOption(countries[1].id);

    await expect(page.locator(SELECTORS.birthDepartment)).toBeDisabled();
    await expect(page.locator(SELECTORS.submit)).not.toBeDisabled();
  });
});

test.describe("Navigation Handling", () => {
  test("The back button and the navbar should be visible when the navigationDisabled query param is not present", async ({
    page,
  }) => {
    await visitProfile(page);

    await expect(page.locator(SELECTORS.back)).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Menu principal" }),
    ).toBeVisible();
  });

  test("The back button and the navbar should not be visible when the navigationDisabled query param is true", async ({
    page,
  }) => {
    await visitProfile(page, { disableNavigation: true });

    await expect(page.locator(SELECTORS.submit)).toBeVisible();
    await expect(page.locator(SELECTORS.back)).not.toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Menu principal" }),
    ).not.toBeVisible();
  });
});
