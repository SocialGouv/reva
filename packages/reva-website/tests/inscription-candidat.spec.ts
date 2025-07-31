import { expect, test } from "next/experimental/testmode/playwright/msw";

test("should redirect to /espace-candidat/ when no certificationId is provided", async ({
  page,
}) => {
  await page.goto("/inscription-candidat/");
  await expect(page).toHaveURL("/espace-candidat/");
});
