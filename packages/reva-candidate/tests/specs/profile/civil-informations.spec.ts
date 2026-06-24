import {
  expect,
  graphql,
  HttpResponse,
  test,
  type MswFixture,
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
  {
    id: "dept-971",
    label: "Guadeloupe",
    code: "971",
    timezone: "America/Guadeloupe",
  },
  {
    id: "dept-97150",
    label: "Saint-Martin",
    code: "97150",
    timezone: "America/Marigot",
  },
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
    fvae.mutation(
      "updateCivilInformationMutation",
      graphQLResolver({
        candidate_updateCandidateInformationBySelf: {
          id: candidate.id,
        },
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

async function mockAddressSearchResult(
  page: Page,
  result: {
    city: string;
    citycode: string;
    context: string;
    coordinates: [number, number];
    id: string;
    label: string;
    name: string;
    postcode: string;
    query: string;
    score: number;
    street: string;
    type: "municipality" | "locality";
  },
) {
  await page.route(
    `https://api-adresse.data.gouv.fr/search/?q=${result.query}&limit=10`,
    async (route) => {
      await route.fulfill({
        json: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: result.coordinates,
              },
              properties: {
                label: result.label,
                score: result.score,
                type: result.type,
                id: result.id,
                name: result.name,
                postcode: result.postcode,
                citycode: result.citycode,
                city: result.city,
                context: result.context,
                street: result.street,
              },
            },
          ],
          query: result.query,
          limit: 10,
        },
      });
    },
  );
}

function waitForUpdateCandidateInformationMutation(msw: MswFixture) {
  return new Promise<unknown>((resolve) => {
    msw.use(
      fvae.mutation("updateCandidateInformationMutation", ({ variables }) => {
        resolve(variables);

        return HttpResponse.json({
          data: {
            candidate_updateCandidateInformationBySelf: {
              id: nonFcCandidate.id,
            },
          },
        });
      }),
    );
  });
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

  test("should allow selecting a municipality birth place", async ({
    msw,
    page,
  }) => {
    await mockAddressSearchResult(page, {
      city: "Paris",
      citycode: "75056",
      context: "75, Paris, Ile-de-France",
      coordinates: [2.347, 48.859],
      id: "75056",
      label: "Paris 75001 Paris",
      name: "Paris",
      postcode: "75001",
      query: "Paris",
      score: 0.97053,
      street: "Paris",
      type: "municipality",
    });

    await visitCivilInformations(page);

    const birthPlaceInput = page.getByLabel("Lieu de naissance");
    await birthPlaceInput.fill("Paris");
    await page.getByText("Paris 75001 Paris").click();

    const submittedVariablesPromise =
      waitForUpdateCandidateInformationMutation(msw);
    await page.getByRole("button", { name: "Enregistrer" }).click();
    const submittedVariables = await submittedVariablesPromise;

    expect(submittedVariables).toMatchObject({
      candidateInformation: {
        birthCity: "Paris",
        birthDepartmentId: "dept-75",
      },
    });
  });

  test("should allow selecting Marigot Saint-Martin as a birth place", async ({
    msw,
    page,
  }) => {
    await mockAddressSearchResult(page, {
      city: "Saint-Martin",
      citycode: "97801",
      context: "978, Saint-Martin",
      coordinates: [-63.085588, 18.068788],
      id: "97801_h9y3xs",
      label: "Marigot 97150 Saint-Martin",
      name: "Marigot",
      postcode: "97150",
      query: "Marigot",
      score: 0.95428,
      street: "Marigot",
      type: "locality",
    });

    await visitCivilInformations(page);

    const birthPlaceInput = page.getByLabel("Lieu de naissance");
    await birthPlaceInput.fill("Marigot");
    await page.getByText("Marigot 97150 Saint-Martin").click();

    const submittedVariablesPromise =
      waitForUpdateCandidateInformationMutation(msw);
    await page.getByRole("button", { name: "Enregistrer" }).click();
    const submittedVariables = await submittedVariablesPromise;

    expect(submittedVariables).toMatchObject({
      candidateInformation: {
        birthCity: "Saint-Martin",
        birthDepartmentId: "dept-97150",
      },
    });
  });
});
