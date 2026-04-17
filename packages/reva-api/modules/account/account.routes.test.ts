import * as franceConnectAuthorizeModule from "./features/france-connect-authorize";
import * as franceConnectErrorsModule from "./features/france-connect.errors";
import * as handleFranceConnectCallbackModule from "./features/handleFranceConnectCallback";

const { FranceConnectSystemError, FranceConnectUserError } =
  franceConnectErrorsModule;

describe("GET /account/franceconnect/authorize", () => {
  it("redirects to the FC authorization URL on success", async () => {
    vi.spyOn(
      franceConnectAuthorizeModule,
      "getFranceConnectAuthorizeRedirectUrl",
    ).mockResolvedValue(
      "https://keycloak.example.com/realms/reva/protocol/openid-connect/auth?kc_idp_hint=franceconnect",
    );

    const res = await global.testApp.inject({
      method: "GET",
      url: "/api/account/franceconnect/authorize",
    });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe(
      "https://keycloak.example.com/realms/reva/protocol/openid-connect/auth?kc_idp_hint=franceconnect",
    );
  });

  it("passes certificationId and typeAccompagnement query params to the feature", async () => {
    const spy = vi
      .spyOn(
        franceConnectAuthorizeModule,
        "getFranceConnectAuthorizeRedirectUrl",
      )
      .mockResolvedValue("https://keycloak.example.com/auth");

    await global.testApp.inject({
      method: "GET",
      url: "/api/account/franceconnect/authorize?certificationId=a1b2c3d4-e5f6-4a7b-8c9d-e0f1a2b3c4d5&typeAccompagnement=accompagne",
    });

    expect(spy).toHaveBeenCalledWith(
      expect.anything(),
      "a1b2c3d4-e5f6-4a7b-8c9d-e0f1a2b3c4d5",
      "accompagne",
    );
  });

  it("redirects to candidat/auth-error when the feature throws", async () => {
    vi.spyOn(
      franceConnectAuthorizeModule,
      "getFranceConnectAuthorizeRedirectUrl",
    ).mockRejectedValue(new Error("OAuth config unavailable"));

    const res = await global.testApp.inject({
      method: "GET",
      url: "/api/account/franceconnect/authorize",
    });

    expect(res.statusCode).toBe(302);
    const location = new URL(res.headers.location as string);
    expect(location.pathname).toBe("/candidat/auth-error");
    expect(location.searchParams.get("error")).toBe("server_error");
  });
});

describe("GET /account/franceconnect/callback", () => {
  it("redirects to the candidate URL on success", async () => {
    vi.spyOn(
      handleFranceConnectCallbackModule,
      "handleFranceConnectCallback",
    ).mockResolvedValue(
      "http://localhost:3004/candidat/candidates/abc/candidacies",
    );

    const res = await global.testApp.inject({
      method: "GET",
      url: "/api/account/franceconnect/callback?code=auth-code&state=state-xyz",
    });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe(
      "http://localhost:3004/candidat/candidates/abc/candidacies",
    );
  });

  it("redirects to candidat/auth-error for a generic error", async () => {
    vi.spyOn(
      handleFranceConnectCallbackModule,
      "handleFranceConnectCallback",
    ).mockRejectedValue(new Error("unexpected failure"));

    const res = await global.testApp.inject({
      method: "GET",
      url: "/api/account/franceconnect/callback?code=auth-code&state=state-xyz",
    });

    expect(res.statusCode).toBe(302);
    const location = new URL(res.headers.location as string);
    expect(location.pathname).toBe("/candidat/auth-error");
    expect(location.searchParams.get("error")).toBe("server_error");
    expect(location.searchParams.get("state")).toBe("state-xyz");
  });

  it("redirects through Keycloak logout when a FranceConnectError with idToken is thrown", async () => {
    const error = new FranceConnectSystemError({
      message: "Token exchange failed",
    });
    error.idToken = "id-token-hint-value";

    vi.spyOn(
      handleFranceConnectCallbackModule,
      "handleFranceConnectCallback",
    ).mockRejectedValue(error);

    vi.stubEnv("KEYCLOAK_ADMIN_URL", "https://keycloak.example.com");
    vi.stubEnv("KEYCLOAK_APP_REALM", "reva");

    const res = await global.testApp.inject({
      method: "GET",
      url: "/api/account/franceconnect/callback?code=auth-code&state=state-xyz",
    });

    expect(res.statusCode).toBe(302);
    const location = new URL(res.headers.location as string);
    expect(location.origin).toBe("https://keycloak.example.com");
    expect(location.pathname).toContain("/protocol/openid-connect/logout");
    expect(location.searchParams.get("id_token_hint")).toBe(
      "id-token-hint-value",
    );
    const postLogoutUri = new URL(
      location.searchParams.get("post_logout_redirect_uri") as string,
    );
    expect(postLogoutUri.pathname).toBe("/candidat/auth-error");
  });

  it("redirects to candidat/auth-error for a FranceConnectUserError without idToken, including state", async () => {
    const error = new FranceConnectUserError({
      message: "Session expirée",
      userMessage: "Votre session a expiré",
    });

    vi.spyOn(
      handleFranceConnectCallbackModule,
      "handleFranceConnectCallback",
    ).mockRejectedValue(error);

    const res = await global.testApp.inject({
      method: "GET",
      url: "/api/account/franceconnect/callback?code=auth-code&state=my-state",
    });

    expect(res.statusCode).toBe(302);
    const location = new URL(res.headers.location as string);
    expect(location.pathname).toBe("/candidat/auth-error");
    expect(location.searchParams.get("error")).toBe("invalid_request");
    expect(location.searchParams.get("state")).toBe("my-state");
  });
});
