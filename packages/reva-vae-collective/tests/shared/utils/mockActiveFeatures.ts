import { HttpResponse } from "next/experimental/testmode/playwright/msw";

import { baseUrlTest } from "./getBaseUrlTest";

export const mockQueryActiveFeatures = (activeFeatures?: string[]) => {
  return baseUrlTest.query("activeFeaturesForConnectedUser", () => {
    return HttpResponse.json({
      data: {
        activeFeaturesForConnectedUser: activeFeatures || [],
      },
    });
  });
};
