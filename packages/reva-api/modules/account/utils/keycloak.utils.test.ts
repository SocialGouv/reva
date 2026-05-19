import * as getKeycloakAdminModule from "@/modules/shared/auth/getKeycloakAdmin";

import {
  generateIAMTokenWithPassword,
  KeycloakUnavailableError,
  validatePasswordOnly,
} from "./keycloak.utils";

const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = globalThis.fetch;

const mockKeycloakAdmin = (username: string | null) =>
  ({
    users: {
      findOne: vi
        .fn()
        .mockResolvedValue(username === null ? undefined : { username }),
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

describe("validatePasswordOnly", () => {
  beforeAll(() => {
    process.env.KEYCLOAK_ADMIN_CLIENTID_REVA_PASSWORD_CHECK = "password-check";
    process.env.KEYCLOAK_ADMIN_REALM_REVA = "reva-admin";
    process.env.KEYCLOAK_ADMIN_URL = "https://keycloak.test";
  });

  afterAll(() => {
    process.env = { ...ORIGINAL_ENV };
    globalThis.fetch = ORIGINAL_FETCH;
  });

  beforeEach(() => {
    vi.spyOn(getKeycloakAdminModule, "getKeycloakAdmin").mockResolvedValue(
      mockKeycloakAdmin("alice@example.com"),
    );
  });

  test("renvoie { ok: true } quand Keycloak répond 200", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockFetchResponse(200, {
        access_token: "a",
        refresh_token: "r",
        id_token: "i",
      }),
    );

    const result = await validatePasswordOnly("kc-id", "p@ss");
    expect(result).toEqual({ ok: true });
  });

  test("renvoie { ok: false, reason: 'invalid_credentials' } quand Keycloak répond 400 + invalid_grant", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockFetchResponse(400, {
        error: "invalid_grant",
        error_description: "Invalid user credentials",
      }),
    );

    const result = await validatePasswordOnly("kc-id", "wrong");
    expect(result).toEqual({ ok: false, reason: "invalid_credentials" });
  });

  test("lève KeycloakUnavailableError quand Keycloak répond 400 + invalid_client", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockFetchResponse(400, {
        error: "invalid_client",
        error_description: "Invalid client credentials",
      }),
    );

    await expect(validatePasswordOnly("kc-id", "p@ss")).rejects.toBeInstanceOf(
      KeycloakUnavailableError,
    );
  });

  test("lève KeycloakUnavailableError quand Keycloak répond 503", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(
        mockFetchResponse(503, { error: "service_unavailable" }),
      );

    await expect(validatePasswordOnly("kc-id", "p@ss")).rejects.toBeInstanceOf(
      KeycloakUnavailableError,
    );
  });

  test("lève KeycloakUnavailableError sur erreur réseau", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));

    await expect(validatePasswordOnly("kc-id", "p@ss")).rejects.toBeInstanceOf(
      KeycloakUnavailableError,
    );
  });
});

describe("generateIAMTokenWithPassword", () => {
  beforeAll(() => {
    process.env.KEYCLOAK_ADMIN_CLIENTID_REVA = "reva-admin";
    process.env.KEYCLOAK_ADMIN_CLIENT_SECRET = "secret";
    process.env.KEYCLOAK_ADMIN_REALM_REVA = "reva-admin";
    process.env.KEYCLOAK_ADMIN_URL = "https://keycloak.test";
  });

  afterAll(() => {
    process.env = { ...ORIGINAL_ENV };
    globalThis.fetch = ORIGINAL_FETCH;
  });

  beforeEach(() => {
    vi.spyOn(getKeycloakAdminModule, "getKeycloakAdmin").mockResolvedValue(
      mockKeycloakAdmin("alice@example.com"),
    );
  });

  test("renvoie les tokens quand Keycloak répond 200", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockFetchResponse(200, {
        access_token: "a",
        refresh_token: "r",
        id_token: "i",
      }),
    );

    const result = await generateIAMTokenWithPassword(
      "kc-id",
      "p@ss",
      "REVA_ADMIN",
    );
    expect(result).toEqual({
      accessToken: "a",
      refreshToken: "r",
      idToken: "i",
    });
  });

  test("lève 'Adresse électronique ou mot de passe incorrect' sur 400 + invalid_grant sans OTP", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockFetchResponse(400, {
        error: "invalid_grant",
        error_description: "Invalid user credentials",
      }),
    );

    const error = await generateIAMTokenWithPassword(
      "kc-id",
      "wrong",
      "REVA_ADMIN",
    ).catch((e) => e);
    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(KeycloakUnavailableError);
    expect(error.message).toBe(
      "Adresse électronique ou mot de passe incorrect",
    );
  });

  test("lève 'Code de vérification (OTP) invalide' sur 400 + invalid_grant avec OTP", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockFetchResponse(400, {
        error: "invalid_grant",
        error_description: "Invalid user credentials",
      }),
    );

    await expect(
      generateIAMTokenWithPassword("kc-id", "p@ss", "REVA_ADMIN", "000000"),
    ).rejects.toThrow("Code de vérification (OTP) invalide");
  });

  test("lève KeycloakUnavailableError quand Keycloak répond 500", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(mockFetchResponse(500, { error: "server_error" }));

    await expect(
      generateIAMTokenWithPassword("kc-id", "p@ss", "REVA_ADMIN"),
    ).rejects.toBeInstanceOf(KeycloakUnavailableError);
  });

  test("lève KeycloakUnavailableError sur erreur réseau", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));

    await expect(
      generateIAMTokenWithPassword("kc-id", "p@ss", "REVA_ADMIN"),
    ).rejects.toBeInstanceOf(KeycloakUnavailableError);
  });
});
