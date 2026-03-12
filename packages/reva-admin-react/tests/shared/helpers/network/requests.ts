import { Page } from "@playwright/test";

export function waitGraphQL(page: Page, operationName: string) {
  return page.waitForResponse(async (response) => {
    if (!response.url().includes("api/graphql")) {
      return false;
    }

    if (!response.ok()) {
      console.error("error: response not ok", response.url());
      return false;
    }

    try {
      const request = response.request();

      const matchesOperationName = (() => {
        try {
          const body = request.postDataJSON();
          return body.operationName === operationName;
        } catch {
          const rawPostData = request.postData();
          return rawPostData?.includes(operationName) ?? false;
        }
      })();

      if (!matchesOperationName) {
        return false;
      }

      const responseBody = await response.json();
      const isDataValid = responseBody.data && !responseBody.errors;
      if (!isDataValid) {
        console.error("error: response body is not valid", responseBody);
        return false;
      }
      return true;
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
