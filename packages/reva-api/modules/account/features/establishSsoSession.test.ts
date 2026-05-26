import jwt from "jsonwebtoken";

import { logger } from "@/modules/shared/logger/logger";

import * as keycloakUtils from "../utils/keycloak.utils";

import { establishSsoSession } from "./establishSsoSession";

const buildAccessToken = (payload: Record<string, unknown>): string =>
  jwt.sign(payload, "test-secret");

const buildPostLoginCookie = (accessToken: string): string =>
  JSON.stringify({ accessToken, refreshToken: "r", idToken: "i" });

describe("establishSsoSession", () => {
  beforeEach(() => {
    vi.stubEnv("KEYCLOAK_ADMIN_REALM_REVA", "reva-admin");
    vi.stubEnv("KEYCLOAK_ADMIN_CLIENTID_REVA", "reva-admin");
  });

  test("admin happy path : renvoie les Set-Cookie bruts de Keycloak", async () => {
    const impersonateSpy = vi
      .spyOn(keycloakUtils, "impersonate")
      .mockResolvedValue({
        headers: [
          [
            "set-cookie",
            "KEYCLOAK_IDENTITY=abc.def; Path=/realms/reva/; HttpOnly; Secure; SameSite=None; Domain=gouv.fr",
          ],
        ],
        redirect: "https://kc.example/realms/reva/account",
      });

    const accessToken = buildAccessToken({
      sub: "kc-admin-id",
      resource_access: { "reva-admin": { roles: ["admin"] } },
    });

    const result = await establishSsoSession({
      postLoginTokensCookie: buildPostLoginCookie(accessToken),
    });

    expect(impersonateSpy).toHaveBeenCalledWith("kc-admin-id", "reva-admin");
    expect(result).toEqual([
      "KEYCLOAK_IDENTITY=abc.def; Path=/realms/reva/; HttpOnly; Secure; SameSite=None; Domain=gouv.fr",
    ]);
  });

  test("cookie absent : renvoie []", async () => {
    const impersonateSpy = vi.spyOn(keycloakUtils, "impersonate");
    const result = await establishSsoSession({
      postLoginTokensCookie: undefined,
    });
    expect(impersonateSpy).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  test("cookie sans accessToken : renvoie []", async () => {
    const impersonateSpy = vi.spyOn(keycloakUtils, "impersonate");
    const result = await establishSsoSession({
      postLoginTokensCookie: JSON.stringify({ refreshToken: "r" }),
    });
    expect(impersonateSpy).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  test("non-admin (rôle absent) : renvoie []", async () => {
    const impersonateSpy = vi.spyOn(keycloakUtils, "impersonate");
    const accessToken = buildAccessToken({
      sub: "kc-id",
      resource_access: { "reva-admin": { roles: ["organism"] } },
    });

    const result = await establishSsoSession({
      postLoginTokensCookie: buildPostLoginCookie(accessToken),
    });

    expect(impersonateSpy).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  test("login vae-collective (clé reva-admin absente) : renvoie []", async () => {
    const impersonateSpy = vi.spyOn(keycloakUtils, "impersonate");
    const accessToken = buildAccessToken({
      sub: "kc-id",
      resource_access: { "reva-vae-collective": { roles: ["admin"] } },
    });

    const result = await establishSsoSession({
      postLoginTokensCookie: buildPostLoginCookie(accessToken),
    });

    expect(impersonateSpy).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  test("impersonate KO (undefined) : renvoie [] et log warn", async () => {
    vi.spyOn(keycloakUtils, "impersonate").mockResolvedValue(undefined);
    const warnSpy = vi.spyOn(logger, "warn");

    const accessToken = buildAccessToken({
      sub: "kc-admin-id",
      resource_access: { "reva-admin": { roles: ["admin"] } },
    });

    const result = await establishSsoSession({
      postLoginTokensCookie: buildPostLoginCookie(accessToken),
    });

    expect(result).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("impersonate"),
    );
  });

  test("impersonate throw : renvoie [] et log error", async () => {
    vi.spyOn(keycloakUtils, "impersonate").mockRejectedValue(
      new Error("KC down"),
    );
    const errorSpy = vi.spyOn(logger, "error");

    const accessToken = buildAccessToken({
      sub: "kc-admin-id",
      resource_access: { "reva-admin": { roles: ["admin"] } },
    });

    const result = await establishSsoSession({
      postLoginTokensCookie: buildPostLoginCookie(accessToken),
    });

    expect(result).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
  });

  test("cookie malformé (JSON invalide) : renvoie []", async () => {
    const impersonateSpy = vi.spyOn(keycloakUtils, "impersonate");
    const result = await establishSsoSession({
      postLoginTokensCookie: "not-json",
    });
    expect(impersonateSpy).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  test("access token malformé : renvoie []", async () => {
    const impersonateSpy = vi.spyOn(keycloakUtils, "impersonate");
    const result = await establishSsoSession({
      postLoginTokensCookie: buildPostLoginCookie("not-a-jwt"),
    });
    expect(impersonateSpy).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  test("filtre les non set-cookie headers", async () => {
    vi.spyOn(keycloakUtils, "impersonate").mockResolvedValue({
      headers: [
        ["content-type", "text/html"],
        ["set-cookie", "KEYCLOAK_IDENTITY=v; Path=/"],
      ],
      redirect: "x",
    });
    const accessToken = buildAccessToken({
      sub: "kc-id",
      resource_access: { "reva-admin": { roles: ["admin"] } },
    });

    const result = await establishSsoSession({
      postLoginTokensCookie: buildPostLoginCookie(accessToken),
    });

    expect(result).toEqual(["KEYCLOAK_IDENTITY=v; Path=/"]);
  });
});
