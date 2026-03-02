import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../shared/helpers/network/requests";

import type { Page } from "next/experimental/testmode/playwright/msw";

const fvae = graphql.link("https://reva-api/api/graphql");

const CANDIDACY_ID = "fb451fbc-3218-416d-9ac9-65b13432469f";

function createContactDetailsHandlers({
  franceConnectLinked = false,
  phone = "0600000000",
  email = "jane.doe@example.com",
}: {
  franceConnectLinked?: boolean;
  phone?: string;
  email?: string;
} = {}) {
  return [
    fvae.query(
      "getCandidateContactDetails",
      graphQLResolver({
        getCandidacyById: {
          candidate: {
            id: CANDIDACY_ID,
            franceConnectLinked,
            phone,
            email,
          },
        },
      }),
    ),
  ];
}

function createMutationHandler() {
  return fvae.mutation(
    "updateCandidateContactDetailsForCandidateContactDetailsPage",
    graphQLResolver({
      candidate_updateCandidateContactDetails: {
        id: CANDIDACY_ID,
        phone: "1111111111",
        email: "mynewemail@example.com",
      },
    }),
  );
}

const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers();

const SELECTORS = {
  phone: '[data-testid="phone-input"] input',
  email: '[data-testid="email-input"] input',
  submit: 'button[type="submit"]',
  back: '[data-testid="back-button"]',
};

async function visitContactDetails(page: Page) {
  await page.goto(
    `/admin2/candidacies/${CANDIDACY_ID}/summary/candidate-contact-details`,
  );
  await Promise.all([
    aapCommonWait(page),
    waitGraphQL(page, "getCandidateContactDetails"),
  ]);
}

test.describe("Candidate contact details", () => {
  test.describe("Display and permissions", () => {
    test.use({
      mswHandlers: [
        [...createContactDetailsHandlers(), ...aapCommonHandlers],
        { scope: "test" },
      ],
    });

    test("should display the candidate contact details with phone and email", async ({
      page,
    }) => {
      await login({ page, role: "aap" });
      await visitContactDetails(page);

      await expect(
        page.getByRole("heading", {
          name: "Coordonnées du candidat",
          level: 1,
        }),
      ).toBeVisible();
      await expect(page.locator(SELECTORS.phone)).toHaveValue("0600000000");
      await expect(page.locator(SELECTORS.email)).toHaveValue(
        "jane.doe@example.com",
      );
    });

    test("should display the back button", async ({ page }) => {
      await login({ page, role: "aap" });
      await visitContactDetails(page);

      await expect(page.locator(SELECTORS.back)).toBeVisible();
    });

    test("should disable email input for non-admin users", async ({ page }) => {
      await login({ page, role: "aap" });
      await visitContactDetails(page);

      await expect(page.locator(SELECTORS.email)).toBeDisabled();
    });
  });

  test.describe("Form submission", () => {
    test.use({
      mswHandlers: [
        [
          ...createContactDetailsHandlers(),
          createMutationHandler(),
          ...aapCommonHandlers,
        ],
        { scope: "test" },
      ],
    });

    test("should submit form with updated values", async ({ page }) => {
      await login({ page, role: "admin" });
      await visitContactDetails(page);

      await page.locator(SELECTORS.phone).fill("1111111111");
      await page.locator(SELECTORS.email).fill("mynewemail@example.com");

      const mutationPromise = waitGraphQL(
        page,
        "updateCandidateContactDetailsForCandidateContactDetailsPage",
      );

      await page.locator(SELECTORS.submit).click();
      await mutationPromise;
    });
  });
});

test.describe("FranceConnect linked candidate", () => {
  test.use({
    mswHandlers: [
      [
        ...createContactDetailsHandlers({ franceConnectLinked: true }),
        ...aapCommonHandlers,
      ],
      { scope: "test" },
    ],
  });

  test("should disable email input when FC-linked", async ({ page }) => {
    await login({ page, role: "admin" });
    await visitContactDetails(page);

    // Email should be disabled even for admin when FC-linked
    await expect(page.locator(SELECTORS.email)).toBeDisabled();
  });

  test("should keep phone input editable when FC-linked", async ({ page }) => {
    await login({ page, role: "admin" });
    await visitContactDetails(page);

    await expect(page.locator(SELECTORS.phone)).not.toBeDisabled();
  });
});

test.describe("Non-FranceConnect candidate", () => {
  test.use({
    mswHandlers: [
      [
        ...createContactDetailsHandlers({ franceConnectLinked: false }),
        ...aapCommonHandlers,
      ],
      { scope: "test" },
    ],
  });

  test("should allow admin to edit email when not FC-linked", async ({
    page,
  }) => {
    await login({ page, role: "admin" });
    await visitContactDetails(page);

    await expect(page.locator(SELECTORS.email)).not.toBeDisabled();
  });
});
