import { Page } from "@playwright/test";

export function waitGraphQL(page: Page, operationName: string) {
  return page.waitForResponse(async (response) => {
    if (!response.url().includes("api/graphql")) {
      return false;
    }

    if (!response.ok()) {
      return false;
    }

    try {
      const body = response.request().postDataJSON();
      if (body.operationName !== operationName) {
        return false;
      }

      const responseBody = await response.json();
      return responseBody.data && !responseBody.errors;
    } catch {
      return false;
    }
  });
}

export function waitRest(page: Page, urlPattern: string) {
  return page.waitForResponse((response) =>
    response.url().includes(urlPattern),
  );
}
