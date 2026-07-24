import { FastifyInstance } from "fastify";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import { buildApp } from "../../../app.js";
import { getGraphQlClient } from "../../../utils/graphqlClient.js";
import { getUserAccessToken } from "../../../utils/keycloak.js";
import {
  activeSession,
  AUTH_API_KEY,
  KEYCLOAK_JWT,
  proxyHeaders,
  securedHeaders,
  signSessionJwt,
} from "../__tests__/httpTestHarness.js";
import { createAccount } from "../features/accounts/createAccount.js";
import { generateJwt } from "../features/auth/generateJwt.js";
import { invalidJwt } from "../features/auth/invalideJwt.js";
import { findSessionById } from "../features/session/findSessionById.js";

vi.mock("../features/accounts/createAccount.js", () => ({
  createAccount: vi.fn(),
}));
vi.mock("../features/auth/generateJwt.js", () => ({ generateJwt: vi.fn() }));
vi.mock("../features/auth/invalideJwt.js", () => ({ invalidJwt: vi.fn() }));
vi.mock("../features/session/findSessionById.js", () => ({
  findSessionById: vi.fn(),
}));
vi.mock("../../../utils/keycloak.js", () => ({ getUserAccessToken: vi.fn() }));
vi.mock("../../../utils/graphqlClient.js", () => ({
  getGraphQlClient: vi.fn(),
}));

let app: FastifyInstance;
let jwt: string;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
  jwt = await signSessionJwt();
});

afterAll(async () => {
  await app.close();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(findSessionById).mockResolvedValue(activeSession());
  vi.mocked(getUserAccessToken).mockResolvedValue(KEYCLOAK_JWT);
  vi.mocked(getGraphQlClient).mockReturnValue({
    query: vi.fn(),
    mutation: vi.fn(),
  } as unknown as ReturnType<typeof getGraphQlClient>);
});

describe("POST /interop/v1/auth/createAccount", () => {
  const validBody = {
    certificationAuthorityId: "authority-1",
    email: "compte@example.com",
    username: "compte",
  };

  test("répond 401 quand la clé API est invalide", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/interop/v1/auth/createAccount",
      headers: { ...securedHeaders(jwt), "auth-api-key": "wrong" },
      payload: validBody,
    });

    expect(response.statusCode).toBe(401);
    expect(createAccount).not.toHaveBeenCalled();
  });

  test("répond 200 avec le keycloakId du compte créé", async () => {
    vi.mocked(createAccount).mockResolvedValue({
      id: "acc-1",
      keycloakId: "kc-1",
    });

    const response = await app.inject({
      method: "POST",
      url: "/interop/v1/auth/createAccount",
      headers: { ...securedHeaders(jwt), "auth-api-key": AUTH_API_KEY },
      payload: validBody,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().keycloakId).toBe("kc-1");
  });

  test("répond 400 quand un champ requis est absent", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/interop/v1/auth/createAccount",
      headers: { ...securedHeaders(jwt), "auth-api-key": AUTH_API_KEY },
      payload: { certificationAuthorityId: "authority-1", username: "compte" },
    });

    expect(response.statusCode).toBe(400);
    expect(createAccount).not.toHaveBeenCalled();
  });
});

describe("POST /interop/v1/auth/generateJwt", () => {
  const validBody = { userId: "3fa85f64-5717-4562-b3fc-2c963f66afa6" };

  test("répond 401 quand la clé API est invalide", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/interop/v1/auth/generateJwt",
      headers: { ...proxyHeaders(), "auth-api-key": "wrong" },
      payload: validBody,
    });

    expect(response.statusCode).toBe(401);
    expect(generateJwt).not.toHaveBeenCalled();
  });

  test("répond 200 avec le token généré", async () => {
    vi.mocked(generateJwt).mockResolvedValue("signed.jwt.value");

    const response = await app.inject({
      method: "POST",
      url: "/interop/v1/auth/generateJwt",
      headers: { ...proxyHeaders(), "auth-api-key": AUTH_API_KEY },
      payload: validBody,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().token).toBe("signed.jwt.value");
  });
});

describe("POST /interop/v1/auth/invalidJwt", () => {
  const validBody = { token: "x" };

  test("répond 401 quand la clé API est invalide", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/interop/v1/auth/invalidJwt",
      headers: { ...proxyHeaders(), "auth-api-key": "wrong" },
      payload: validBody,
    });

    expect(response.statusCode).toBe(401);
    expect(invalidJwt).not.toHaveBeenCalled();
  });

  test("répond 204 quand le jeton est invalidé", async () => {
    vi.mocked(invalidJwt).mockResolvedValue(undefined);

    const response = await app.inject({
      method: "POST",
      url: "/interop/v1/auth/invalidJwt",
      headers: { ...proxyHeaders(), "auth-api-key": AUTH_API_KEY },
      payload: validBody,
    });

    expect(response.statusCode).toBe(204);
    expect(invalidJwt).toHaveBeenCalledWith({ token: "x" });
  });
});
