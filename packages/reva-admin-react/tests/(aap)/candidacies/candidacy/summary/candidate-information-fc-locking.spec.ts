import {
  expect,
  graphql,
  test,
  type Page,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../shared/helpers/network/requests";

const fvae = graphql.link("https://reva-api/api/graphql");

const CANDIDACY_ID = "fb451fbc-3218-416d-9ac9-65b13432469f";
const FRANCE_COUNTRY_ID = "208ef9d1-4d18-475b-9f5f-575da5f7218c";

const countries = [
  { id: FRANCE_COUNTRY_ID, label: "France", isoCode: "FRA" },
  { id: "country-2", label: "Canada", isoCode: "CAN" },
];

const departments = [
  { id: "dept-75", label: "Paris", code: "75" },
  { id: "dept-69", label: "Lyon", code: "69" },
];

function createCandidate(franceConnectLinked: boolean) {
  return {
    id: "candidate-1",
    franceConnectLinked,
    firstname: "John",
    lastname: "Doe",
    givenName: "Johnny",
    firstname2: "Paul",
    firstname3: "Max",
    middleNames: "Paul Max",
    gender: "man",
    birthCity: "Paris",
    birthdate: "1990-01-01",
    birthDepartment: departments[0],
    country: countries[0],
    nationality: "Française",
    phone: "0601020304",
    email: "john.doe@example.com",
    street: "1 rue de la Paix",
    city: "Paris",
    zip: "75001",
    addressComplement: "Apt 3",
    department: departments[0],
  };
}

function candidateInformationHandlers({
  franceConnectLinked,
}: {
  franceConnectLinked: boolean;
}) {
  const candidate = createCandidate(franceConnectLinked);
  return [
    fvae.query(
      "getCandidacyById",
      graphQLResolver({
        getCandidacyById: {
          id: CANDIDACY_ID,
          candidacyDropOut: null,
          reorientationReason: null,
          organismId: "org-1",
          status: "PRISE_EN_CHARGE",
          certification: { codeRncp: "RNCP1234", label: "Certification Label" },
          candidate,
          experiences: [],
          goals: [],
        },
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

const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers({
  activeFeaturesForConnectedUser: ["MIDDLE_NAMES", "BIRTH_PLACE"],
});

const SELECTORS = {
  firstname: 'input[name="firstname"]',
  lastname: 'input[name="lastname"]',
  givenName: 'input[name="givenName"]',
  middleNames: 'input[name="middleNames"]',
  birthdate: 'input[name="birthdate"]',
  nationality: 'input[name="nationality"]',
  street: 'input[name="street"]',
  city: 'input[name="city"]',
  zip: 'input[name="zip"]',
  addressComplement: 'input[name="addressComplement"]',
};

async function visitCandidateInformation(page: Page) {
  await login({ page, role: "aap" });
  await page.goto(
    `/admin2/candidacies/${CANDIDACY_ID}/summary/candidate-information`,
  );
  await Promise.all([
    aapCommonWait(page),
    waitGraphQL(page, "getCandidacyById"),
    waitGraphQL(page, "getCountries"),
    waitGraphQL(page, "getDepartments"),
  ]);
}

test.describe("FranceConnect linked candidate", () => {
  test.use({
    mswHandlers: [
      [
        ...candidateInformationHandlers({ franceConnectLinked: true }),
        ...aapCommonHandlers,
      ],
      { scope: "test" },
    ],
  });

  test("should disable FC-locked fields", async ({ page }) => {
    await visitCandidateInformation(page);

    await page
      .getByRole("checkbox", {
        name: "Saisir manuellement l'adresse",
      })
      .check({ force: true });

    await expect(page.locator(SELECTORS.lastname)).toBeDisabled();
    await expect(page.locator(SELECTORS.firstname)).toBeDisabled();
    await expect(page.locator(SELECTORS.middleNames)).toBeDisabled();
    await expect(page.locator(SELECTORS.birthdate)).toBeDisabled();
    await expect(
      page.locator('[data-testid="autocomplete"] input'),
    ).toBeDisabled();

    await expect(
      page.getByRole("checkbox", {
        name: "Né(e) à l’étranger",
      }),
    ).toBeDisabled();
  });

  test("should keep non-locked fields editable", async ({ page }) => {
    await visitCandidateInformation(page);

    await page
      .getByRole("checkbox", {
        name: "Saisir manuellement l'adresse",
      })
      .check({ force: true });

    await expect(page.locator(SELECTORS.nationality)).not.toBeDisabled();
    await expect(
      page.locator('input[name="gender"]').first(),
    ).not.toBeDisabled();
    await expect(page.locator(SELECTORS.givenName)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.street)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.city)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.zip)).not.toBeDisabled();
    await expect(page.locator(SELECTORS.addressComplement)).not.toBeDisabled();
  });
});

test.describe("FranceConnect linked candidate with non-France country", () => {
  function createCandidateNonFrance() {
    return {
      ...createCandidate(true),
      country: countries[1],
      birthDepartment: null,
    };
  }

  function candidateInformationHandlersNonFrance() {
    const candidate = createCandidateNonFrance();
    return [
      fvae.query(
        "getCandidacyById",
        graphQLResolver({
          getCandidacyById: {
            id: CANDIDACY_ID,
            candidacyDropOut: null,
            reorientationReason: null,
            organismId: "org-1",
            status: "PRISE_EN_CHARGE",
            certification: {
              codeRncp: "RNCP1234",
              label: "Certification Label",
            },
            candidate,
            experiences: [],
            goals: [],
          },
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

  test.use({
    mswHandlers: [
      [...candidateInformationHandlersNonFrance(), ...aapCommonHandlers],
      { scope: "test" },
    ],
  });
});

test.describe("Non-FranceConnect candidate", () => {
  test.use({
    mswHandlers: [
      [
        ...candidateInformationHandlers({ franceConnectLinked: false }),
        ...aapCommonHandlers,
      ],
      { scope: "test" },
    ],
  });

  test("should have all fields editable", async ({ page }) => {
    await visitCandidateInformation(page);

    await page
      .getByRole("checkbox", {
        name: "Saisir manuellement l'adresse",
      })
      .check({ force: true });

    for (const selector of Object.values(SELECTORS)) {
      await expect(page.locator(selector)).not.toBeDisabled();
    }

    await expect(
      page.locator('input[name="gender"]').first(),
    ).not.toBeDisabled();
  });

  test("should have all default fields editable when birth place is foreign", async ({
    page,
  }) => {
    await visitCandidateInformation(page);

    await page
      .getByRole("checkbox", {
        name: "Saisir manuellement l'adresse",
      })
      .check({ force: true });

    await expect(
      page.getByRole("checkbox", {
        name: "Né(e) à l’étranger",
      }),
    ).not.toBeDisabled();

    await page
      .getByRole("checkbox", {
        name: "Né(e) à l’étranger",
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
