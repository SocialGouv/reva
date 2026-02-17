import { FastifyReply } from "fastify";
import {
  buildAuthorizationUrl,
  calculatePKCECodeChallenge,
  randomNonce,
  randomPKCECodeVerifier,
  randomState,
} from "openid-client";

import {
  getFranceConnectRedirectUri,
  getOAuthConfig,
  isValidCertificationId,
  setFcStateCookie,
} from "./france-connect.utils";

export const getFranceConnectAuthorizeRedirectUrl = async (
  reply: FastifyReply,
  certificationId?: string,
  typeAccompagnement?: string,
): Promise<string> => {
  const config = await getOAuthConfig();
  const redirectUri = getFranceConnectRedirectUri();

  const state = randomState();
  const nonce = randomNonce();
  const code_verifier = randomPKCECodeVerifier();
  const code_challenge = await calculatePKCECodeChallenge(code_verifier);

  // Stocke les données de sécurité dans un cookie httpOnly chiffré
  setFcStateCookie(reply, {
    state,
    nonce,
    code_verifier,
    certificationId: isValidCertificationId(certificationId)
      ? certificationId
      : undefined,
    typeAccompagnement,
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
