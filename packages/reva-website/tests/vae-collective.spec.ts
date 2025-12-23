import {
  expect,
  graphql,
  HttpResponse,
  test,
} from "next/experimental/testmode/playwright/msw";

import validCohorte from "./fixtures/inscription-candidat/vae-collective/validCohort.json";

const fvae = graphql.link("https://reva-api/api/graphql");

test.describe("VAE Collective Code Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/inscription-candidat/vae-collective");
  });

  test("should validate and submit a valid VAE collective code", async ({
    page,
    msw,
  }) => {
    msw.use(
      fvae.query("getVaeCollectiveCohort", () => {
        return HttpResponse.json(validCohorte);
      }),
      fvae.query("getVaeCollectiveCohortForRegistrationPage", () => {
        return HttpResponse.json(validCohorte);
      }),
    );

    const codeInput = page.getByRole("textbox");

    await codeInput.click();
    await codeInput.pressSequentially("ABCD1234");

    const submitButton = page.getByRole("button", {
      name: "Accéder à cette VAE collective",
    });
    await expect(submitButton).toBeEnabled();

    await submitButton.click();

    await expect(page).toHaveURL(
      "/inscription-candidat/vae-collective/ABCD1234/",
    );
  });

  test("should show error for invalid VAE collective code", async ({
    page,
    msw,
  }) => {
    msw.use(
      fvae.query("getVaeCollectiveCohort", () => {
        return HttpResponse.json({
          data: {
            cohorteVaeCollective: null,
          },
        });
      }),
    );

    const codeInput = page.getByRole("textbox");
    await expect(codeInput).toBeVisible();
    await expect(codeInput).toBeEnabled();

    await codeInput.click();
    await codeInput.pressSequentially("INVALID1");

    const submitButton = page.getByRole("button", {
      name: "Accéder à cette VAE collective",
    });

    await expect(submitButton).toBeEnabled();

    await submitButton.click();

    await expect(
      page.getByText(
        "Le code ne correspond à aucune VAE collective engagée sur France VAE",
      ),
    ).toBeVisible();
  });

  test("should show an error when the code is less than 8 characters", async ({
    page,
  }) => {
    const codeInput = page.getByRole("textbox");

    await codeInput.fill("ABC");

    const submitButton = page.getByRole("button", {
      name: "Accéder à cette VAE collective",
    });

    await submitButton.click();

    await expect(
      page.getByText("Le code doit contenir exactement 8 caractères"),
    ).toBeVisible();
  });

  test("should show an error when the code contains invalid characters", async ({
    page,
  }) => {
    const codeInput = page.getByRole("textbox");

    await codeInput.fill("ABCD####");

    const submitButton = page.getByRole("button", {
      name: "Accéder à cette VAE collective",
    });

    await submitButton.click();

    await expect(
      page.getByText(
        "Le code ne doit contenir que des lettres et des chiffres",
      ),
    ).toBeVisible();
  });

  test("should prefill the code input when a code is provided in the url", async ({
    page,
  }) => {
    await page.goto(
      "/inscription-candidat/vae-collective?codeInscription=ABCD1234",
    );

    const codeInput = page.getByRole("textbox");

    await expect(codeInput).toHaveValue("ABCD1234");
  });
});
