import { FastifyReply, FastifyRequest } from "fastify";
import { allowInsecureRequests, discovery } from "openid-client";

import { getKeycloakAdmin } from "@/modules/shared/auth/getKeycloakAdmin";
import { generateJwt, getJWTContent } from "@/modules/shared/auth/jwt.helper";
import { BACKEND_BASE_URL } from "@/modules/shared/config/config";
import { logger } from "@/modules/shared/logger/logger";

import { FranceConnectSystemError } from "./france-connect.errors";

// Durées de vie des cookies
const STATE_TTL_SECONDS = 10 * 60; // 10 minutes

// Noms des cookies
const FC_STATE_COOKIE = "fc_state";

// Path restreint pour les cookies France Connect
const FC_COOKIE_PATH = "/api/account/franceconnect";

const CERTIFICATION_ID_UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isValidCertificationId = (
  value: string | undefined,
): value is string =>
  typeof value === "string" &&
  value.length > 0 &&
  CERTIFICATION_ID_UUID_REGEX.test(value);

export const getFranceConnectRedirectUri = (): string => {
  return `${BACKEND_BASE_URL}/account/franceconnect/callback`;
};

export const getOAuthConfig = async () => {
  const issuer = `${process.env.KEYCLOAK_ADMIN_URL}/realms/${process.env.KEYCLOAK_APP_REALM}`;
  const clientId = process.env.KEYCLOAK_APP_REVA_APP || "reva-app";
  const clientSecret = process.env.KEYCLOAK_APP_ADMIN_CLIENT_SECRET!;

  const discoveryOptions =
    process.env.NODE_ENV === "development"
      ? { execute: [allowInsecureRequests] }
      : undefined;

  return await discovery(
    new URL(issuer),
    clientId,
    clientSecret,
    undefined,
    discoveryOptions,
  );
};

type FcStateData = {
  state: string;
  nonce: string;
  code_verifier: string;
  certificationId?: string;
  typeAccompagnement?: string;
};

const getSecureCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: FC_COOKIE_PATH,
  maxAge,
});

export const setFcStateCookie = (
  reply: FastifyReply,
  data: FcStateData,
): void => {
  const jwtToken = generateJwt(data, STATE_TTL_SECONDS);

  reply.setCookie(
    FC_STATE_COOKIE,
    jwtToken,
    getSecureCookieOptions(STATE_TTL_SECONDS),
  );
};

export const getAndDeleteFcStateCookie = (
  request: FastifyRequest,
  reply: FastifyReply,
  expectedState: string,
): Omit<FcStateData, "state"> | null => {
  const jwtToken = request.cookies[FC_STATE_COOKIE];
  if (!jwtToken) return null;

  reply.clearCookie(FC_STATE_COOKIE, { path: FC_COOKIE_PATH });

  const data = getJWTContent(jwtToken);
  if (!data) return null;

  if (data.state !== expectedState) return null;

  return {
    nonce: data.nonce,
    code_verifier: data.code_verifier,
    certificationId: data.certificationId,
    typeAccompagnement: data.typeAccompagnement,
  };
};

const normalizeName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const parseFranceConnectDate = (dateString: string): Date | null => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

export const checkPivotFieldsMatch = ({
  candidateFirstname,
  candidateLastname,
  candidateBirthdate,
  fcGivenName,
  fcFamilyName,
  fcBirthdate,
}: {
  candidateFirstname: string | null;
  candidateLastname: string | null;
  candidateBirthdate: Date | null;
  fcGivenName: string;
  fcFamilyName: string;
  fcBirthdate: string;
}): { isMatch: boolean; mismatchedFields: string[] } => {
  const mismatchedFields: string[] = [];
  const fcFirstname = fcGivenName.split(/\s+/)[0] || "";

  if (normalizeName(candidateFirstname || "") !== normalizeName(fcFirstname)) {
    mismatchedFields.push("firstname");
  }

  if (normalizeName(candidateLastname || "") !== normalizeName(fcFamilyName)) {
    mismatchedFields.push("lastname");
  }

  const parsedFcBirthdate = parseFranceConnectDate(fcBirthdate);
  if (
    !candidateBirthdate ||
    !parsedFcBirthdate ||
    candidateBirthdate.getTime() !== parsedFcBirthdate.getTime()
  ) {
    mismatchedFields.push("birthdate");
  }

  return { isMatch: mismatchedFields.length === 0, mismatchedFields };
};

export const unlinkFranceConnectIdentity = async (
  keycloakId: string,
): Promise<void> => {
  const realm = process.env.KEYCLOAK_APP_REALM;
  if (!realm) {
    throw new FranceConnectSystemError({
      message: "Erreur de configuration du système",
    });
  }

  const keycloakAdmin = await getKeycloakAdmin();

  const federatedIdentities = await keycloakAdmin.users.listFederatedIdentities(
    {
      id: keycloakId,
      realm,
    },
  );

  const fcIdentity = federatedIdentities.find((fi) =>
    fi.identityProvider?.toLowerCase().includes("franceconnect"),
  );

  if (fcIdentity?.identityProvider) {
    await keycloakAdmin.users.delFromFederatedIdentity({
      id: keycloakId,
      federatedIdentityId: fcIdentity.identityProvider,
      realm,
    });
    logger.info(
      `[France Connect] Lien FC supprimé pour le compte Keycloak ${keycloakId} (identité non-correspondante)`,
    );
  }
};

export const splitGivenName = (
  givenName: string,
): {
  firstname: string;
  firstname2?: string;
  firstname3?: string;
} => {
  const parts = givenName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstname: "", firstname2: undefined, firstname3: undefined };
  }
  const firstname = parts[0];
  const firstname2 = parts.length > 1 ? parts[1] : undefined;
  const firstname3 = parts.length > 2 ? parts.slice(2).join(" ") : undefined;
  return { firstname, firstname2, firstname3 };
};
