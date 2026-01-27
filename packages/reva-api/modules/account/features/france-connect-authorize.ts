import { FastifyReply } from "fastify";
import {
  buildAuthorizationUrl,
  calculatePKCECodeChallenge,
  randomNonce,
  randomPKCECodeVerifier,
  randomState,
} from "openid-client";

import { FranceConnectForbiddenError } from "./france-connect.errors";
import {
  getFranceConnectRedirectUri,
  getOAuthConfig,
  isValidCertificationId,
  setFcStateCookie,
} from "./france-connect.utils";

export const getFranceConnectAuthorizeRedirectUrl = async (
  reply: FastifyReply,
  certificationId?: string,
): Promise<string> => {
  //TODO: Supprimer cette logique lorsque la FranceConnect sera disponible en production
  if (process.env.BASE_URL?.includes(".gouv.fr")) {
    throw new FranceConnectForbiddenError(
      "FranceConnect is not available in production",
    );
  }

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
