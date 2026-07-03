import { beforeAll, describe, expect, test } from "vitest";

import { createJwt, parseJwt } from "./jwt.js";

describe("jwt", () => {
  beforeAll(() => {
    process.env.SECRET_KEY = "test-secret-key";
    process.env.ENVIRONMENT = "test";
  });

  test("round-trips a signed token back to its payload", async () => {
    const sub = "candidacy-123";
    const token = await createJwt({ sub, createdAt: new Date() });

    const payload = await parseJwt({ token });

    expect(payload.sub).toBe(sub);
    expect(payload.iat).toBeDefined();
  });

  test("rejects a tampered token", async () => {
    await expect(parseJwt({ token: "not.a.jwt" })).rejects.toThrow();
  });
});
