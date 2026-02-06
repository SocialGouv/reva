import { Country, Department, Gender } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { authorizationCodeGrant } from "openid-client";
import { z } from "zod";

import { getActiveCandidaciesByCandidateId } from "@/modules/candidacy/features/getActiveCandidaciesByCandidateId";
import { getCandidateByKeycloakId } from "@/modules/candidate/features/getCandidateByKeycloakId";
import { updateAllCandidaciesDerniereDateActiviteByCandidateId } from "@/modules/candidate/features/updateAllCandidaciesDerniereDateActiviteByCandidateId";
import { isFeatureActiveForUser } from "@/modules/feature-flipping/feature-flipping.features";
import { getKeycloakAdmin } from "@/modules/shared/auth/getKeycloakAdmin";
import { logger } from "@/modules/shared/logger/logger";
import { prismaClient } from "@/prisma/client";

import {
  sanitizedEmail,
  sanitizedOptionalPhone,
  sanitizedOptionalText,
  sanitizedOptionalZipCode,
  sanitizedText,
} from "../utils/input-sanitization";

import {
  FranceConnectForbiddenError,
  FranceConnectSystemError,
  FranceConnectUserError,
} from "./france-connect.errors";
import {
  getAndDeleteFcStateCookie,
  getOAuthConfig,
  isValidCertificationId,
} from "./france-connect.utils";

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
  phone_number: sanitizedOptionalPhone(),
  locality: sanitizedOptionalText(),
  postal_code: sanitizedOptionalZipCode(),
  street_address: sanitizedOptionalText(),
});

type FranceConnectClaims = z.infer<typeof FranceConnectClaimsSchema>;

export const handleFranceConnectCallback = async (
  request: FastifyRequest,
  reply: FastifyReply,
  currentUrl: URL,
): Promise<string> => {
  const franceConnectEnabled = await isFeatureActiveForUser({
    feature: "FRANCE_CONNECT_AUTH_FOR_CANDIDATE",
  });

  if (!franceConnectEnabled) {
    throw new FranceConnectForbiddenError(
      "FranceConnect authentication is not enabled",
    );
  }

  const state = currentUrl.searchParams.get("state") ?? undefined;
  if (!state) {
    throw new FranceConnectUserError("Missing state parameter", 400);
  }

  const stored = getAndDeleteFcStateCookie(request, reply, state);
  if (!stored) {
    throw new FranceConnectUserError("Invalid or expired state");
  }

  const config = await getOAuthConfig();

  const tokenSet = await authorizationCodeGrant(config, currentUrl, {
    pkceCodeVerifier: stored.code_verifier,
    expectedState: state,
    expectedNonce: stored.nonce,
  });

  if (!tokenSet.access_token || !tokenSet.id_token) {
    throw new FranceConnectSystemError("Invalid token response");
  }

  const claims = tokenSet.claims();
  const idTokenResult = FranceConnectClaimsSchema.safeParse(claims);
  if (!idTokenResult.success) {
    throw new FranceConnectUserError("Invalid ID token structure", 400);
  }
  const idTokenPayload = idTokenResult.data;
  const keycloakId = idTokenPayload.sub;

  const candidate = await getOrCreateCandidate(keycloakId, idTokenPayload);

  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.BASE_URL
      : "http://localhost:3004";

  const certificationId = isValidCertificationId(stored.certificationId)
    ? stored.certificationId
    : undefined;

  let redirectPath: string;
  if (certificationId) {
    redirectPath = `/candidat/candidates/${candidate.id}/candidacies/create/certifications/${certificationId}/type-accompagnement`;
  } else {
    const activeCandidacies = await getActiveCandidaciesByCandidateId({
      candidateId: candidate.id,
    });
    if (activeCandidacies.length > 0) {
      redirectPath = `/candidat/candidates/${candidate.id}/candidacies`;
    } else {
      redirectPath = `/candidat/candidates/${candidate.id}/candidacies/create`;
    }
  }

  await updateAllCandidaciesDerniereDateActiviteByCandidateId({
    candidateId: candidate.id,
  });

  const redirectUrl = new URL(`${baseUrl}${redirectPath}`);
  return redirectUrl.toString();
};

const buildFranceConnectCandidateFields = async (
  userInfo: FranceConnectClaims,
) => {
  const { firstname, firstname2, firstname3 } = splitGivenName(
    userInfo.given_name ?? "",
  );
  const country = await getCountry(userInfo.birthcountry);
  return {
    firstname,
    firstname2: firstname2 ?? undefined,
    firstname3: firstname3 ?? undefined,
    lastname: userInfo.family_name,
    gender: mapGender(userInfo.gender),
    birthdate: parseFranceConnectDate(userInfo.birthdate),
    phone: userInfo.phone_number ?? "",
    city: userInfo.locality ?? "",
    zip: userInfo.postal_code ?? "",
    street: userInfo.street_address ?? "",
    countryId: country?.id,
    givenName: userInfo.preferred_username ?? undefined,
  };
};

const getOrCreateCandidate = async (
  keycloakId: string,
  userInfo: FranceConnectClaims,
) => {
  let candidate = await getCandidateByKeycloakId({ keycloakId });

  const fcFields = await buildFranceConnectCandidateFields(userInfo);

  if (candidate) {
    return await updateCandidateWithFranceConnectInfo({
      candidateId: candidate.id,
      fcFields,
    });
  }

  candidate = await prismaClient.candidate.findUnique({
    where: { email: userInfo.email },
  });

  if (candidate) {
    return await linkKeycloakIdToCandidate({
      candidateId: candidate.id,
      keycloakId,
      fcFields,
    });
  }

  return await createCandidateFromFranceConnect({
    keycloakId,
    userInfo,
    fcFields,
  });
};

type FranceConnectCandidateFields = Awaited<
  ReturnType<typeof buildFranceConnectCandidateFields>
>;

const updateCandidateWithFranceConnectInfo = async ({
  candidateId,
  fcFields,
}: {
  candidateId: string;
  fcFields: FranceConnectCandidateFields;
}) => {
  const { gender, birthdate, countryId, ...rest } = fcFields;
  return prismaClient.candidate.update({
    where: { id: candidateId },
    data: {
      updatedAt: new Date(),
      ...rest,
      ...(gender != null && { gender }),
      ...(birthdate != null && { birthdate }),
      ...(countryId !== undefined && { countryId }),
    },
  });
};

const linkKeycloakIdToCandidate = async ({
  candidateId,
  keycloakId,
  fcFields,
}: {
  candidateId: string;
  keycloakId: string;
  fcFields: FranceConnectCandidateFields;
}) => {
  const { gender, birthdate, countryId, ...rest } = fcFields;

  logger.info(
    `[France Connect] Association du keycloakId FranceConnect ${keycloakId} au candidat existant ${candidateId}`,
  );

  const candidate = await prismaClient.candidate.update({
    where: { id: candidateId },
    data: {
      keycloakId,
      updatedAt: new Date(),
      ...rest,
      ...(gender != null && { gender }),
      ...(birthdate != null && { birthdate }),
      ...(countryId !== undefined && { countryId }),
    },
  });

  await assignCandidateRole(keycloakId);
  return candidate;
};

const createCandidateFromFranceConnect = async ({
  keycloakId,
  userInfo,
  fcFields,
}: {
  keycloakId: string;
  userInfo: FranceConnectClaims;
  fcFields: FranceConnectCandidateFields;
}) => {
  const birthDepartment = await getDepartment(userInfo.birthplace);
  const currentDepartment = await getDepartment(userInfo.locality);

  const candidate = await prismaClient.candidate.create({
    data: {
      ...fcFields,
      keycloakId,
      email: userInfo.email,
      departmentId: currentDepartment.id,
      birthDepartmentId: birthDepartment.id,
    },
  });

  await assignCandidateRole(keycloakId);
  return candidate;
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

const splitGivenName = (
  givenName: string,
): {
  firstname: string;
  firstname2: string | null;
  firstname3: string | null;
} => {
  const parts = givenName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstname: "", firstname2: null, firstname3: null };
  }
  const firstname = parts[0];
  const firstname2 = parts.length > 1 ? parts[1] : null;
  const firstname3 = parts.length > 2 ? parts.slice(2).join(" ") : null;
  return { firstname, firstname2, firstname3 };
};

const getDefaultDepartment = async () => {
  const department = await prismaClient.department.findFirst({
    where: { code: "75" },
  });

  if (!department) {
    throw new FranceConnectSystemError("Default department not found");
  }

  return department;
};

const getDepartment = async (birthplace: string): Promise<Department> => {
  if (!birthplace) {
    const defaultDepartment = await getDefaultDepartment();
    return defaultDepartment;
  }
  const department = await prismaClient.department.findUnique({
    where: { code: birthplace.slice(0, 2) },
  });
  if (department) {
    return department;
  }
  const defaultDepartment = await getDefaultDepartment();
  return defaultDepartment;
};

const getCountry = async (
  countryCode: string,
): Promise<Country | undefined> => {
  let country: Country | undefined;

  if (countryCode) {
    const countryFound = await prismaClient.country.findUnique({
      where: { inseeCode: countryCode },
    });
    if (!countryFound) {
      throw new FranceConnectUserError("Country not found", 400);
    }
    country = countryFound;
  }
  return country;
};

const assignCandidateRole = async (keycloakId: string): Promise<void> => {
  const realm = process.env.KEYCLOAK_APP_REALM;
  if (!realm) {
    throw new FranceConnectSystemError("KEYCLOAK_APP_REALM not configured");
  }

  const keycloakAdmin = await getKeycloakAdmin();
  const role = await keycloakAdmin.roles.findOneByName({
    name: "candidate",
    realm,
  });

  if (!role?.id) {
    throw new FranceConnectSystemError("Candidate role not found in Keycloak");
  }

  await keycloakAdmin.users.addRealmRoleMappings({
    id: keycloakId,
    realm,
    roles: [{ id: role.id, name: role.name ?? "candidate" }],
  });
};
