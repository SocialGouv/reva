import { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { buildApp } from "../../../app.js";

const PROXY_SECRET = process.env.INTEROP_PROXY_SECRET as string;

describe("smoke test de l'API REST interop", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("l'application démarre et ready() résout", () => {
    expect(app).toBeDefined();
  });

  test("répond 403 quand le header x-interop-secret est absent", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/interop/v1/documentation/json",
    });

    expect(response.statusCode).toBe(403);
  });

  test("répond 200 sur la spec OpenAPI avec un secret proxy valide", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/interop/v1/documentation/json",
      headers: { "x-interop-secret": PROXY_SECRET },
    });

    expect(response.statusCode).toBe(200);
    expect(() => response.json()).not.toThrow();
  });

  test("répond 401 sur une route sécurisée sans header Authorization", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/interop/v1/candidatures/3fa85f64-5717-4562-b3fc-2c963f66afa6",
      headers: { "x-interop-secret": PROXY_SECRET },
    });

    expect(response.statusCode).toBe(401);
  });
});
