import { afterEach, describe, expect, test } from "vitest";

import { secureApiKeyCheck } from "./secureApiKeyCheck.js";

describe("secureApiKeyCheck", () => {
  const originalAuthApiKey = process.env.AUTH_API_KEY;

  // Needed to reset the AUTH_API_KEY environment variable after each test
  // because one test will delete it to test the error case
  afterEach(() => {
    process.env.AUTH_API_KEY = originalAuthApiKey;
  });

  test("returns true for the correct API key", () => {
    expect(secureApiKeyCheck("super-secret-api-key")).toBe(true);
  });

  test("returns false for an incorrect API key with the same length", () => {
    expect(secureApiKeyCheck("super-secret-api-kex")).toBe(false);
  });

  test("returns false for an API key with a different length without throwing", () => {
    expect(secureApiKeyCheck("short")).toBe(false);
  });

  test("throws when AUTH_API_KEY is not set", () => {
    delete process.env.AUTH_API_KEY;

    expect(() => secureApiKeyCheck("any-key")).toThrow(
      "AUTH_API_KEY is not set",
    );
  });
});
