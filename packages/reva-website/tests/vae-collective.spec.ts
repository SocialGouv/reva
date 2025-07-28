import {
  expect,
  graphql,
  HttpResponse,
  test,
} from "next/experimental/testmode/playwright/msw";

const fvae = graphql.link("https://reva-api/api/graphql");

test.use({
  mswHandlers: [
    [
      fvae.query("activeFeaturesForConnectedUser", () => {
        return HttpResponse.json({
          data: {
            activeFeaturesForConnectedUser: ["VAE_COLLECTIVE"],
          },
        });
      }),
    ],
    { scope: "test" },
  ],
});

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
        return HttpResponse.json({
          data: {
            cohorteVaeCollective: {
              id: "bb327ffa-9efc-4f1e-a371-dc8686257d2f",
              codeInscription: "ABCD1234",
              nom: "cohorte",
              commanditaireVaeCollective: {
                raisonSociale: "commanditaire",
              },
            },
          },
        });
      }),
    );

    const codeInput = page.getByRole("textbox");

    await codeInput.click();
    await codeInput.pressSequentially("ABCD1234");

    const submitButton = page.getByRole("button", {
      name: "Valider et m'inscrire",
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
      name: "Valider et m'inscrire",
    });

    await expect(submitButton).toBeEnabled();

    await submitButton.click();

    await expect(
      page.getByText(
        "Le code ne correspond à aucune VAE collective engagée sur France VAE",
      ),
    ).toBeVisible();
  });

  test("should validate form input constraints", async ({ page, msw }) => {
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
    const submitButton = page.getByRole("button", {
      name: "Valider et m'inscrire",
    });

    await expect(submitButton).toBeDisabled();

    await codeInput.fill("ABC");
    await expect(submitButton).toBeDisabled();

    await codeInput.click();
    await codeInput.pressSequentially("ABCD1234");
    await expect(submitButton).toBeEnabled();

    await codeInput.clear();
    await codeInput.click();
    await codeInput.pressSequentially("ABCD####");

    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    await expect(
      page.getByText(
        "Le code ne doit contenir que des lettres et des chiffres",
      ),
    ).toBeVisible();
  });

  test("should handle back button navigation", async ({ page }) => {
    await page.goto("/inscription-candidat/vae-collective");

    const backButton = page.getByRole("button", { name: "Retour" });
    await backButton.click();

    await expect(page).toHaveURL("/commencer/");
  });
});
