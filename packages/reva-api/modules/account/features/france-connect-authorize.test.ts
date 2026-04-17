import { Configuration } from "openid-client";

import { getFranceConnectAuthorizeRedirectUrl } from "./france-connect-authorize";
import * as fcUtils from "./france-connect.utils";

const VALID_CERTIFICATION_UUID = "a1b2c3d4-e5f6-4a7b-8c9d-e0f1a2b3c4d5";

const TEST_CONFIG = new Configuration(
  {
    issuer: "https://test.example.com",
    authorization_endpoint: "https://test.example.com/auth",
    token_endpoint: "https://test.example.com/token",
    jwks_uri: "https://test.example.com/jwks",
  },
  "test-client-id",
  "test-secret",
);

const mockReply = {
  setCookie: vi.fn(),
} as any;

describe("getFranceConnectAuthorizeRedirectUrl", () => {
  beforeEach(() => {
    vi.spyOn(fcUtils, "getOAuthConfig").mockResolvedValue(TEST_CONFIG);
    vi.spyOn(fcUtils, "getFranceConnectRedirectUri").mockReturnValue(
      "https://api.example.com/account/franceconnect/callback",
    );
    vi.spyOn(fcUtils, "setFcStateCookie").mockReturnValue(undefined);
    vi.spyOn(fcUtils, "isValidCertificationId").mockImplementation(
      (value: unknown): value is string =>
        typeof value === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          value,
        ),
    );
  });

  test("returns a URL with kc_idp_hint=franceconnect", async () => {
    const result = await getFranceConnectAuthorizeRedirectUrl(mockReply);

    const url = new URL(result);
    expect(url.searchParams.get("kc_idp_hint")).toBe("franceconnect");
  });

  test("returns a URL pointing to the authorization endpoint", async () => {
    const result = await getFranceConnectAuthorizeRedirectUrl(mockReply);

    const url = new URL(result);
    expect(url.origin + url.pathname).toBe("https://test.example.com/auth");
  });

  test("calls setFcStateCookie with state, nonce and code_verifier strings", async () => {
    await getFranceConnectAuthorizeRedirectUrl(mockReply);

    expect(fcUtils.setFcStateCookie).toHaveBeenCalledWith(
      mockReply,
      expect.objectContaining({
        state: expect.stringMatching(/.+/),
        nonce: expect.stringMatching(/.+/),
        code_verifier: expect.stringMatching(/.+/),
      }),
    );
  });

  test("state in cookie matches state in authorization URL", async () => {
    await getFranceConnectAuthorizeRedirectUrl(mockReply);

    const cookieCall = vi.mocked(fcUtils.setFcStateCookie).mock.calls[0];
    const cookieData = cookieCall?.[1] as any;
    expect(cookieData.state).toBeDefined();
  });

  test("includes a valid certificationId in the cookie data", async () => {
    await getFranceConnectAuthorizeRedirectUrl(
      mockReply,
      VALID_CERTIFICATION_UUID,
    );

    expect(fcUtils.setFcStateCookie).toHaveBeenCalledWith(
      mockReply,
      expect.objectContaining({
        certificationId: VALID_CERTIFICATION_UUID,
      }),
    );
  });

  test("sets certificationId to undefined when value is not a valid UUID", async () => {
    await getFranceConnectAuthorizeRedirectUrl(mockReply, "not-a-uuid");

    expect(fcUtils.setFcStateCookie).toHaveBeenCalledWith(
      mockReply,
      expect.objectContaining({
        certificationId: undefined,
      }),
    );
  });

  test("sets certificationId to undefined when not provided", async () => {
    await getFranceConnectAuthorizeRedirectUrl(mockReply);

    expect(fcUtils.setFcStateCookie).toHaveBeenCalledWith(
      mockReply,
      expect.objectContaining({
        certificationId: undefined,
      }),
    );
  });

  test("passes typeAccompagnement through to the cookie", async () => {
    await getFranceConnectAuthorizeRedirectUrl(
      mockReply,
      undefined,
      "accompagne",
    );

    expect(fcUtils.setFcStateCookie).toHaveBeenCalledWith(
      mockReply,
      expect.objectContaining({
        typeAccompagnement: "accompagne",
      }),
    );
  });

  test("passes typeAccompagnement as undefined when not provided", async () => {
    await getFranceConnectAuthorizeRedirectUrl(mockReply);

    expect(fcUtils.setFcStateCookie).toHaveBeenCalledWith(
      mockReply,
      expect.objectContaining({
        typeAccompagnement: undefined,
      }),
    );
  });
});
