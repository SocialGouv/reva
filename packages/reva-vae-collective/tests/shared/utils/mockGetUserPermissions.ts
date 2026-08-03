import { HttpResponse } from "next/experimental/testmode/playwright/msw";

import { baseUrlTest } from "./getBaseUrlTest";

export const mockQueryGetUserPermissions = (permissions: string[] = []) => {
  return baseUrlTest.query("vaeCollective_getUserPermissions", () => {
    return HttpResponse.json({
      data: {
        vaeCollective_getUserPermissions: permissions,
      },
    });
  });
};
