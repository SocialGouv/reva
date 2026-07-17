import { Client } from "@urql/core";
import { FastifyRequest } from "fastify";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { ERROR_UNAUTHORIZED } from "../../utils/errors.js";
import { getGraphQlClient } from "../../utils/graphqlClient.js";
import * as jwtModule from "../../utils/jwt.js";
import { getUserAccessToken } from "../../utils/keycloak.js";

import { validateJwt } from "./authMiddleware.js";
import { findSessionById } from "./features/session/findSessionById.js";

vi.mock("./features/session/findSessionById.js", () => ({
  findSessionById: vi.fn(),
}));

vi.mock("../../utils/keycloak.js", () => ({
  getUserAccessToken: vi.fn(),
}));

vi.mock("../../utils/graphqlClient.js", () => ({
  getGraphQlClient: vi.fn(),
}));

const securePathes = [
  "candidatures",
  "dossiersDeFaisabilite",
  "dossiersDeValidation",
  "informationsJury",
  "auth/createAccount",
];

const SESSION_ID = "session-123";
const KEYCLOAK_ID = "keycloak-456";
const KEYCLOAK_JWT = "keycloak-access-token";

const buildRequest = (url: string, authorization?: string): FastifyRequest =>
  ({
    url,
    headers: { authorization },
  }) as FastifyRequest;

const mockGraphqlClient = { query: vi.fn() } as unknown as Client;

describe("validateJwt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    process.env.SECRET_KEY = "test-secret-key";
    process.env.ENVIRONMENT = "test";

    vi.mocked(getGraphQlClient).mockReturnValue(mockGraphqlClient);
    vi.mocked(getUserAccessToken).mockResolvedValue(KEYCLOAK_JWT);
    vi.mocked(findSessionById).mockResolvedValue({
      id: SESSION_ID,
      keycloakId: KEYCLOAK_ID,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      endedAt: null,
    });
  });

  test("does nothing for non-secure paths", async () => {
    const request = buildRequest("/interop/v1/documentation/json");

    await expect(validateJwt(securePathes, request)).resolves.toBeUndefined();

    expect(findSessionById).not.toHaveBeenCalled();
    expect(getUserAccessToken).not.toHaveBeenCalled();
    expect(getGraphQlClient).not.toHaveBeenCalled();
  });

  test("throws when ENVIRONMENT is missing on a secure path", async () => {
    delete process.env.ENVIRONMENT;

    const request = buildRequest(
      "/interop/v1/candidatures/00a9fc60-bd2d-434e-9e97-97e029cbcd74",
      "Bearer token",
    );

    await expect(validateJwt(securePathes, request)).rejects.toThrow(
      "ENVIRONMENT env var is missing",
    );
  });

  test("throws unauthorized when Authorization header is missing", async () => {
    const request = buildRequest(
      "/interop/v1/candidatures/00a9fc60-bd2d-434e-9e97-97e029cbcd74",
    );

    await expect(validateJwt(securePathes, request)).rejects.toThrow(
      ERROR_UNAUTHORIZED,
    );
    expect(findSessionById).not.toHaveBeenCalled();
  });

  test("throws unauthorized when Authorization header has no bearer token", async () => {
    const request = buildRequest(
      "/interop/v1/candidatures/00a9fc60-bd2d-434e-9e97-97e029cbcd74",
      "Token abc",
    );

    await expect(validateJwt(securePathes, request)).rejects.toThrow(
      ERROR_UNAUTHORIZED,
    );
    expect(findSessionById).not.toHaveBeenCalled();
  });

  test("rejects an invalid JWT before looking up the session", async () => {
    const request = buildRequest(
      "/interop/v1/candidatures/00a9fc60-bd2d-434e-9e97-97e029cbcd74",
      "Bearer not.a.jwt",
    );

    await expect(validateJwt(securePathes, request)).rejects.toThrow();
    expect(findSessionById).not.toHaveBeenCalled();
  });

  test("throws unauthorized when JWT payload has no sub", async () => {
    vi.spyOn(jwtModule, "parseJwt").mockResolvedValue({
      sub: undefined,
      iat: 1_700_000_000,
    });

    const request = buildRequest(
      "/interop/v1/candidatures/00a9fc60-bd2d-434e-9e97-97e029cbcd74",
      "Bearer signed-token",
    );

    await expect(validateJwt(securePathes, request)).rejects.toThrow(
      ERROR_UNAUTHORIZED,
    );
    expect(findSessionById).not.toHaveBeenCalled();
  });

  test("throws unauthorized when session is not found", async () => {
    vi.mocked(findSessionById).mockResolvedValue(null);

    const token = await jwtModule.createJwt({
      sub: SESSION_ID,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    const request = buildRequest(
      "/interop/v1/candidatures/00a9fc60-bd2d-434e-9e97-97e029cbcd74",
      `Bearer ${token}`,
    );

    await expect(validateJwt(securePathes, request)).rejects.toThrow(
      ERROR_UNAUTHORIZED,
    );
    expect(findSessionById).toHaveBeenCalledWith(SESSION_ID);
    expect(getUserAccessToken).not.toHaveBeenCalled();
  });

  test("throws unauthorized when session has ended", async () => {
    vi.mocked(findSessionById).mockResolvedValue({
      id: SESSION_ID,
      keycloakId: KEYCLOAK_ID,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      endedAt: new Date("2026-01-02T00:00:00.000Z"),
    });

    const token = await jwtModule.createJwt({
      sub: SESSION_ID,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    const request = buildRequest(
      "/interop/v1/dossiersDeValidation",
      `Bearer ${token}`,
    );

    await expect(validateJwt(securePathes, request)).rejects.toThrow(
      ERROR_UNAUTHORIZED,
    );
    expect(getUserAccessToken).not.toHaveBeenCalled();
  });

  test("throws unauthorized when Keycloak token retrieval fails", async () => {
    vi.mocked(getUserAccessToken).mockResolvedValue(undefined);

    const token = await jwtModule.createJwt({
      sub: SESSION_ID,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    const request = buildRequest(
      "/interop/v1/informationsJury/00a9fc60-bd2d-434e-9e97-97e029cbcd74",
      `Bearer ${token}`,
    );

    await expect(validateJwt(securePathes, request)).rejects.toThrow(
      ERROR_UNAUTHORIZED,
    );
    expect(getUserAccessToken).toHaveBeenCalledWith({
      keycloakId: KEYCLOAK_ID,
    });
    expect(getGraphQlClient).not.toHaveBeenCalled();
  });

  test("attaches graphql client and keycloak context for a valid session", async () => {
    const token = await jwtModule.createJwt({
      sub: SESSION_ID,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    const request = buildRequest(
      "/interop/v1/auth/createAccount",
      `Bearer ${token}`,
    );

    await validateJwt(securePathes, request);

    expect(findSessionById).toHaveBeenCalledWith(SESSION_ID);
    expect(getUserAccessToken).toHaveBeenCalledWith({
      keycloakId: KEYCLOAK_ID,
    });
    expect(getGraphQlClient).toHaveBeenCalledWith(KEYCLOAK_JWT);
    expect(request.graphqlClient).toBe(mockGraphqlClient);
    expect(request.keycloakId).toBe(KEYCLOAK_ID);
    expect(request.keycloakJwt).toBe(KEYCLOAK_JWT);
  });
});
