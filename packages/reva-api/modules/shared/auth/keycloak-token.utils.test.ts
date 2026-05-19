import * as getKeycloakAdminModule from "./getKeycloakAdmin";
import {
  KeycloakUnavailableError,
  callTokenEndpoint,
  generateIAMTokenWithPasswordShared,
  userHasTotpConfigured,
  validatePasswordOnly,
} from "./keycloak-token.utils";

const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = globalThis.fetch;

const mockKeycloakAdminWithUser = (username: string | null) =>
  ({
    users: {
      findOne: vi
        .fn()
        .mockResolvedValue(username === null ? undefined : { username }),
    },
  }) as unknown as Awaited<
    ReturnType<typeof getKeycloakAdminModule.getKeycloakAdmin>
  >;

const mockKeycloakAdminWithCredentials = (
  credentials: { type: string }[] | null,
) =>
  ({
    users: {
      getCredentials: vi.fn().mockResolvedValue(credentials),
    },
  }) as unknown as Awaited<
    ReturnType<typeof getKeycloakAdminModule.getKeycloakAdmin>
  >;

const mockFetchResponse = (status: number, body: unknown = {}) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as unknown as Response;

beforeAll(() => {
  process.env.KEYCLOAK_ADMIN_URL = "https://keycloak.test";
});

afterAll(() => {
  process.env = { ...ORIGINAL_ENV };
  globalThis.fetch = ORIGINAL_FETCH;
});

describe("callTokenEndpoint", () => {
  afterEach(() => {
    globalThis.fetch = ORIGINAL_FETCH;
  });

  test("POST sur le bon URL avec realm + clientId paramétrés", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockFetchResponse(200, {
        access_token: "a",
        refresh_token: "r",
        id_token: "i",
      }),
    );
    globalThis.fetch = fetchMock;

    const result = await callTokenEndpoint({
      realm: "some-realm",
      clientId: "some-client",
      username: "alice",
      password: "p@ss",
    });

    expect(result.ok).toBe(true);
    expect(result.grant).toEqual({
      access_token: "a",
      refresh_token: "r",
      id_token: "i",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://keycloak.test/realms/some-realm/protocol/openid-connect/token",
      expect.objectContaining({ method: "POST" }),
    );
    const body = (fetchMock.mock.calls[0][1] as RequestInit).body as URLSearchParams;
    expect(body.get("client_id")).toBe("some-client");
    expect(body.get("grant_type")).toBe("password");
    expect(body.get("client_secret")).toBeNull();
    expect(body.get("totp")).toBeNull();
  });

  test("transmet client_secret si fourni (client confidentiel)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(200));
    globalThis.fetch = fetchMock;

    await callTokenEndpoint({
      realm: "r",
      clientId: "c",
      clientSecret: "super-secret",
      username: "u",
      password: "p",
    });

    const body = (fetchMock.mock.calls[0][1] as RequestInit).body as URLSearchParams;
    expect(body.get("client_secret")).toBe("super-secret");
  });

  test("transmet totp si fourni", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(200));
    globalThis.fetch = fetchMock;

    await callTokenEndpoint({
      realm: "r",
      clientId: "c",
      username: "u",
      password: "p",
      totp: "123456",
    });

    const body = (fetchMock.mock.calls[0][1] as RequestInit).body as URLSearchParams;
    expect(body.get("totp")).toBe("123456");
  });

  test("renvoie { ok: false } avec error et errorDescription quand Keycloak répond 400 + invalid_grant", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockFetchResponse(400, {
        error: "invalid_grant",
        error_description: "Invalid user credentials",
      }),
    );

    const result = await callTokenEndpoint({
      realm: "r",
      clientId: "c",
      username: "u",
      password: "bad",
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe(400);
    expect(result.error).toBe("invalid_grant");
    expect(result.errorDescription).toBe("Invalid user credentials");
  });
});

describe("userHasTotpConfigured", () => {
  test("renvoie true si un credential 'otp' est présent", async () => {
    vi.spyOn(getKeycloakAdminModule, "getKeycloakAdmin").mockResolvedValue(
      mockKeycloakAdminWithCredentials([
        { type: "password" },
        { type: "otp" },
      ]),
    );

    const result = await userHasTotpConfigured({
      realm: "reva-app",
      userId: "kc-id",
    });
    expect(result).toBe(true);
  });

  test("renvoie false si aucun credential 'otp' n'est présent", async () => {
    vi.spyOn(getKeycloakAdminModule, "getKeycloakAdmin").mockResolvedValue(
      mockKeycloakAdminWithCredentials([{ type: "password" }]),
    );

    const result = await userHasTotpConfigured({
      realm: "reva-app",
      userId: "kc-id",
    });
    expect(result).toBe(false);
  });

  test("renvoie false si keycloak-admin lève une erreur", async () => {
    vi.spyOn(getKeycloakAdminModule, "getKeycloakAdmin").mockRejectedValue(
      new Error("boom"),
    );

    const result = await userHasTotpConfigured({
      realm: "reva-app",
      userId: "kc-id",
    });
    expect(result).toBe(false);
  });
});

describe("validatePasswordOnly", () => {
  beforeEach(() => {
    vi.spyOn(getKeycloakAdminModule, "getKeycloakAdmin").mockResolvedValue(
      mockKeycloakAdminWithUser("alice@example.com"),
    );
  });

  afterEach(() => {
    globalThis.fetch = ORIGINAL_FETCH;
  });

  test("renvoie { ok: true } quand Keycloak répond 200", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockFetchResponse(200, {
        access_token: "a",
        refresh_token: "r",
        id_token: "i",
      }),
    );

    const result = await validatePasswordOnly({
      realm: "reva-app",
      clientId: "reva-app-password-check",
      userId: "kc-id",
      password: "p@ss",
    });
    expect(result).toEqual({ ok: true });
  });

  test("renvoie { ok: false, reason: 'invalid_credentials' } quand Keycloak répond 400 + invalid_grant", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockFetchResponse(400, {
        error: "invalid_grant",
        error_description: "Invalid user credentials",
      }),
    );

    const result = await validatePasswordOnly({
      realm: "reva-app",
      clientId: "reva-app-password-check",
      userId: "kc-id",
      password: "wrong",
    });
    expect(result).toEqual({ ok: false, reason: "invalid_credentials" });
  });

  test("lève KeycloakUnavailableError quand Keycloak répond 400 + invalid_client", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockFetchResponse(400, {
        error: "invalid_client",
        error_description: "Invalid client credentials",
      }),
    );

    await expect(
      validatePasswordOnly({
        realm: "reva-app",
        clientId: "reva-app-password-check",
        userId: "kc-id",
        password: "p@ss",
      }),
    ).rejects.toBeInstanceOf(KeycloakUnavailableError);
  });

  test("lève KeycloakUnavailableError quand Keycloak répond 503", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(
        mockFetchResponse(503, { error: "service_unavailable" }),
      );

    await expect(
      validatePasswordOnly({
        realm: "reva-app",
        clientId: "reva-app-password-check",
        userId: "kc-id",
        password: "p@ss",
      }),
    ).rejects.toBeInstanceOf(KeycloakUnavailableError);
  });

  test("lève KeycloakUnavailableError sur erreur réseau", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));

    await expect(
      validatePasswordOnly({
        realm: "reva-app",
        clientId: "reva-app-password-check",
        userId: "kc-id",
        password: "p@ss",
      }),
    ).rejects.toBeInstanceOf(KeycloakUnavailableError);
  });
});

describe("generateIAMTokenWithPasswordShared", () => {
  beforeEach(() => {
    vi.spyOn(getKeycloakAdminModule, "getKeycloakAdmin").mockResolvedValue(
      mockKeycloakAdminWithUser("alice@example.com"),
    );
  });

  afterEach(() => {
    globalThis.fetch = ORIGINAL_FETCH;
  });

  test("renvoie les tokens mappés quand Keycloak répond 200", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockFetchResponse(200, {
        access_token: "AT",
        refresh_token: "RT",
        id_token: "IT",
      }),
    );

    const result = await generateIAMTokenWithPasswordShared({
      realm: "reva-app",
      clientId: "reva-app",
      clientSecret: "secret",
      userId: "kc-id",
      password: "p@ss",
    });

    expect(result).toEqual({
      accessToken: "AT",
      refreshToken: "RT",
      idToken: "IT",
    });
  });

  test("lève 'Code de vérification (OTP) invalide' sur 400 + invalid_grant avec OTP", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockFetchResponse(400, {
        error: "invalid_grant",
        error_description: "Invalid user credentials",
      }),
    );

    await expect(
      generateIAMTokenWithPasswordShared({
        realm: "reva-app",
        clientId: "reva-app",
        clientSecret: "secret",
        userId: "kc-id",
        password: "p@ss",
        totp: "000000",
      }),
    ).rejects.toThrow("Code de vérification (OTP) invalide");
  });

  test("lève 'Adresse électronique ou mot de passe incorrect' sur 400 + invalid_grant sans OTP", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockFetchResponse(400, {
        error: "invalid_grant",
        error_description: "Invalid user credentials",
      }),
    );

    const error = await generateIAMTokenWithPasswordShared({
      realm: "reva-app",
      clientId: "reva-app",
      clientSecret: "secret",
      userId: "kc-id",
      password: "wrong",
    }).catch((e) => e);
    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(KeycloakUnavailableError);
    expect(error.message).toBe(
      "Adresse électronique ou mot de passe incorrect",
    );
  });

  test("lève KeycloakUnavailableError quand Keycloak répond 500", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(mockFetchResponse(500, { error: "server_error" }));

    await expect(
      generateIAMTokenWithPasswordShared({
        realm: "reva-app",
        clientId: "reva-app",
        clientSecret: "secret",
        userId: "kc-id",
        password: "p@ss",
      }),
    ).rejects.toBeInstanceOf(KeycloakUnavailableError);
  });

  test("lève KeycloakUnavailableError quand Keycloak répond 503", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(
        mockFetchResponse(503, { error: "service_unavailable" }),
      );

    await expect(
      generateIAMTokenWithPasswordShared({
        realm: "reva-app",
        clientId: "reva-app",
        clientSecret: "secret",
        userId: "kc-id",
        password: "p@ss",
        totp: "123456",
      }),
    ).rejects.toBeInstanceOf(KeycloakUnavailableError);
  });

  test("lève KeycloakUnavailableError sur erreur réseau", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));

    await expect(
      generateIAMTokenWithPasswordShared({
        realm: "reva-app",
        clientId: "reva-app",
        clientSecret: "secret",
        userId: "kc-id",
        password: "p@ss",
      }),
    ).rejects.toBeInstanceOf(KeycloakUnavailableError);
  });
});
