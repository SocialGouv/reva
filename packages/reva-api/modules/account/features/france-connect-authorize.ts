import {
  allowInsecureRequests,
  buildAuthorizationUrl,
  calculatePKCECodeChallenge,
  discovery,
  randomNonce,
  randomPKCECodeVerifier,
  randomState,
} from "openid-client";

import {
  getFranceConnectRedirectUri,
  isValidCertificationId,
  setState,
} from "./france-connect.utils";

export const getFranceConnectAuthorizeRedirectUrl = async (
  certificationId?: string,
): Promise<string> => {
  //TODO: Supprimer cette logique lorsque la FranceConnect sera disponible en production
  if (process.env.BASE_URL?.includes(".gouv.fr")) {
    throw new Error("FranceConnect is not available in production");
  }

  const issuer = `${process.env.KEYCLOAK_ADMIN_URL}/realms/${process.env.KEYCLOAK_APP_REALM}`;
  const clientId = process.env.KEYCLOAK_APP_REVA_APP || "reva-app";
  const clientSecret = process.env.KEYCLOAK_APP_ADMIN_CLIENT_SECRET || "";
  const redirectUri = getFranceConnectRedirectUri();

  const discoveryOptions =
    process.env.NODE_ENV === "development"
      ? { execute: [allowInsecureRequests] }
      : undefined;
  const config = await discovery(
    new URL(issuer),
    clientId,
    clientSecret,
    undefined,
    discoveryOptions,
  );

  const state = randomState();
  const nonce = randomNonce();
  const code_verifier = randomPKCECodeVerifier();
  const code_challenge = await calculatePKCECodeChallenge(code_verifier);

  setState(state, {
    nonce,
    code_verifier,
    certificationId: isValidCertificationId(certificationId)
      ? certificationId
      : undefined,
  });

  const authUrl = buildAuthorizationUrl(config, {
    redirect_uri: redirectUri,
    scope: "openid",
    state,
    nonce,
    code_challenge,
    code_challenge_method: "S256",
  });

  authUrl.searchParams.set("kc_idp_hint", "franceconnect");
  return authUrl.href;
};
