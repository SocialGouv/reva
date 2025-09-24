import { Page } from "@playwright/test";

export function waitGraphQL(page: Page, operationName: string) {
  return page.waitForResponse(async (response) => {
    if (!response.url().includes("api/graphql")) {
      return false;
    }

    try {
      const body = response.request().postDataJSON();
      return body.operationName === operationName;
    } catch {
      return false;
    }
  });
}

export function waitRest(page: Page, urlPattern: string) {
  return page.waitForResponse((response) => response.url().includes(urlPattern));
}