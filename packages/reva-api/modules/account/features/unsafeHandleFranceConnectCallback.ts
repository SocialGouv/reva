import { Gender } from "@prisma/client";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { getCandidateByKeycloakId } from "@/modules/candidate/features/getCandidateByKeycloakId";
import { isFeatureActiveForUser } from "@/modules/feature-flipping/feature-flipping.features";
import { prismaClient } from "@/prisma/client";

import {
  sanitizedEmail,
  sanitizedOptionalText,
  sanitizedText,
} from "../utils/input-sanitization";

const preferredUsernameSchema = z
  .union([sanitizedEmail(), sanitizedText({ minLength: 0 })])
  .optional()
  .transform((val) => val ?? "");

const FranceConnectClaimsSchema = z.object({
  sub: z.string(),
  email: sanitizedEmail(),
  given_name: sanitizedText(),
  family_name: sanitizedText(),
  preferred_username: preferredUsernameSchema,
  gender: z.enum(["male", "female"]),
  birthdate: sanitizedText(),
  birthplace: sanitizedOptionalText(),
  birthcountry: sanitizedOptionalText(),
});

type FranceConnectClaims = z.infer<typeof FranceConnectClaimsSchema>;

const TokenResponseSchema = z.object({
  access_token: z.string(),
  id_token: z.string(),
  refresh_token: z.string(),
  session_state: z.string(),
});

type TokenResponse = z.infer<typeof TokenResponseSchema>;

const AccessTokenPayloadSchema = z.object({
  sub: z.string(),
  email: sanitizedEmail(),
});

/**
 * Do not use this function in production.
 * This code test data retrieval from France Connect sandbox.
 * TODO: add production-ready handler with:
 * - token signature verification
 * - state verification (CSRF protection)
 * - nonce verification
 * - claims verification (iss, aud, exp, iat...)
 * - PKCE
 * - error handling and logging
 *
 * => Explore the opportunity to use standard libraries like openid-client
 **/

// TODO: use an encrypted JWT and verify (server secret + expiration)
const unsafeDecodeCertificationIdFromState = (
  state?: string,
): string | null => {
  if (!state) return null;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64").toString());
    return decoded.certificationId ?? null;
  } catch {
    // Invalid state
  }
  return null;
};

export const unsafeHandleFranceConnectCallback = async (
  code: string,
  state?: string,
): Promise<string> => {
  const franceConnectEnabled = await isFeatureActiveForUser({
    feature: "FRANCE_CONNECT_AUTH_FOR_CANDIDATE",
  });

  if (!franceConnectEnabled) {
    throw new Error("FranceConnect authentication is not enabled");
  }

  // For extra safety (in case the feature flag is set by mistake on production):
  if (process.env.BASE_URL?.includes(".gouv.fr")) {
    throw new Error("FranceConnect is not available in production");
  }
  const tokens = await unsafeExchangeAuthorizationCode(code);

  const decodedIdToken = jwt.decode(tokens.id_token);
  const idTokenResult = FranceConnectClaimsSchema.safeParse(decodedIdToken);

  if (!idTokenResult.success) {
    console.error(idTokenResult.error.message);
    throw new Error("Invalid ID token structure");
  }

  const idTokenPayload = idTokenResult.data;

  const decodedAccessToken = jwt.decode(tokens.access_token);
  const accessTokenResult =
    AccessTokenPayloadSchema.safeParse(decodedAccessToken);

  if (!accessTokenResult.success) {
    console.error(accessTokenResult.error.message);
    throw new Error("Invalid access token structure");
  }

  const accessTokenPayload = accessTokenResult.data;

  const keycloakId = accessTokenPayload.sub;

  const candidate = await getOrCreateCandidate(keycloakId, idTokenPayload);

  // TODO: add support for candidate app env var
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.BASE_URL
      : "http://localhost:3004";

  const certificationId = unsafeDecodeCertificationIdFromState(state);

  const redirectPath = certificationId
    ? `/candidat/candidates/${candidate.id}/candidacies/create/certifications/${certificationId}/type-accompagnement`
    : "/candidat";

  const redirectUrl = new URL(`${baseUrl}${redirectPath}`);

  if (tokens.session_state) {
    redirectUrl.searchParams.set("session_state", tokens.session_state);
  }

  return redirectUrl.toString();
};

// Read the comment above about unsafe usage of this function
const unsafeExchangeAuthorizationCode = async (
  code: string,
): Promise<TokenResponse> => {
  const tokenEndpoint = `${process.env.KEYCLOAK_ADMIN_URL}/realms/${process.env.KEYCLOAK_APP_REALM}/protocol/openid-connect/token`;

  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.BASE_URL
      : "http://localhost:8080";

  const redirectUri = new URL(
    `/api/account/franceconnect/callback`,
    baseUrl,
  ).toString();

  const params = {
    grant_type: "authorization_code",
    code: code,
    client_id: process.env.KEYCLOAK_APP_REVA_APP || "reva-app",
    client_secret: process.env.KEYCLOAK_APP_ADMIN_CLIENT_SECRET || "",
    redirect_uri: redirectUri,
  };

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Token exchange failed", errorText);
    throw new Error("Failed to exchange authorization code");
  }

  const responseData = await response.json();

  const result = TokenResponseSchema.safeParse(responseData);
  if (!result.success) {
    console.error("Invalid token response structure:", result.error.message);
    throw new Error("Invalid token response from Keycloak");
  }

  return result.data;
};

const getOrCreateCandidate = async (
  keycloakId: string,
  userInfo: FranceConnectClaims,
) => {
  const candidate = await getCandidateByKeycloakId({ keycloakId });

  if (candidate) {
    return await updateCandidateWithFranceConnectInfo(candidate.id, userInfo);
  }

  return await createCandidateFromFranceConnect(keycloakId, userInfo);
};

const updateCandidateWithFranceConnectInfo = async (
  candidateId: string,
  userInfo: FranceConnectClaims,
) => {
  const { given_name, family_name, gender, birthdate } = userInfo;

  const updateData = {
    updatedAt: new Date(),
    ...(given_name && { firstname: given_name }),
    ...(family_name && { lastname: family_name }),
    ...(gender && { gender: mapGender(gender) }),
    ...(birthdate && { birthdate: parseFranceConnectDate(birthdate) }),
  };

  return prismaClient.candidate.update({
    where: { id: candidateId },
    data: updateData,
  });
};

const createCandidateFromFranceConnect = async (
  keycloakId: string,
  userInfo: FranceConnectClaims,
) => {
  const department = await getDefaultDepartment();

  const candidateData = {
    keycloakId,
    email: userInfo.email,
    firstname: userInfo.given_name,
    lastname: userInfo.family_name,
    gender: mapGender(userInfo.gender),
    birthdate: parseFranceConnectDate(userInfo.birthdate),
    // TODO: replace with actual candidate phone and department (or make these fields optional):
    phone: "",
    departmentId: department.id,
    // TODO: fill this from France Connect if available:
    givenName: undefined,
    // TODO: handle empty birthplace (foreign country)
    // TODO: fill these fields from France Connect birthplace INSEE code:
    birthcountry: undefined,
    birthDepartmentId: undefined,
    birthCity: undefined,
  };

  return prismaClient.candidate.create({
    data: candidateData,
  });
};

const mapGender = (franceConnectGender: string): Gender | null => {
  switch (franceConnectGender) {
    case "male":
      return Gender.man;
    case "female":
      return Gender.woman;
    default:
      return null;
  }
};

const parseFranceConnectDate = (dateString: string): Date | null => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

const getDefaultDepartment = async () => {
  const department = await prismaClient.department.findFirst({
    where: { code: "75" },
  });

  if (!department) {
    throw new Error("Default department not found");
  }

  return department;
};
