import { Gender } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { authorizationCodeGrant } from "openid-client";
import { z } from "zod";

import { getActiveCandidaciesByCandidateId } from "@/modules/candidacy/features/getActiveCandidaciesByCandidateId";
import { getCandidateByKeycloakId } from "@/modules/candidate/features/getCandidateByKeycloakId";
import { updateAllCandidaciesDerniereDateActiviteByCandidateId } from "@/modules/candidate/features/updateAllCandidaciesDerniereDateActiviteByCandidateId";
import { isFeatureActiveForUser } from "@/modules/feature-flipping/feature-flipping.features";
import { getKeycloakAdmin } from "@/modules/shared/auth/getKeycloakAdmin";
import { prismaClient } from "@/prisma/client";

import {
  sanitizedEmail,
  sanitizedOptionalText,
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

  //TODO: Supprimer cette logique lorsque la FranceConnect sera disponible en production
  if (process.env.BASE_URL?.includes(".gouv.fr")) {
    throw new FranceConnectForbiddenError(
      "FranceConnect is not available in production",
    );
  }

  const state = currentUrl.searchParams.get("state") ?? undefined;
  if (!state) {
    throw new FranceConnectUserError("Missing state parameter", 400);
  }

  // Récupère et supprime le cookie fc_state (usage unique)
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

const getOrCreateCandidate = async (
  keycloakId: string,
  userInfo: FranceConnectClaims,
) => {
  const candidate = await getCandidateByKeycloakId({ keycloakId });

  let countryId: string | undefined;

  if (userInfo.birthcountry) {
    const country = await prismaClient.country.findUnique({
      where: { inseeCode: userInfo.birthcountry },
    });
    if (!country) {
      throw new FranceConnectUserError("Country not found", 400);
    }
    countryId = country.id;
  }

  if (candidate) {
    return await updateCandidateWithFranceConnectInfo({
      candidateId: candidate.id,
      userInfo,
      countryId,
    });
  }

  return await createCandidateFromFranceConnect({
    keycloakId,
    userInfo,
    countryId,
  });
};

const updateCandidateWithFranceConnectInfo = async ({
  candidateId,
  userInfo,
  countryId,
}: {
  candidateId: string;
  userInfo: FranceConnectClaims;
  countryId: string | undefined;
}) => {
  const { given_name, family_name, gender, birthdate } = userInfo;

  const updateData = {
    updatedAt: new Date(),
    ...(given_name && { firstname: given_name }),
    ...(family_name && { lastname: family_name }),
    ...(gender && { gender: mapGender(gender) }),
    ...(birthdate && { birthdate: parseFranceConnectDate(birthdate) }),
    ...(countryId && { countryId }),
  };

  return prismaClient.candidate.update({
    where: { id: candidateId },
    data: updateData,
  });
};

const createCandidateFromFranceConnect = async ({
  keycloakId,
  userInfo,
  countryId,
}: {
  keycloakId: string;
  userInfo: FranceConnectClaims;
  countryId: string | undefined;
}) => {
  const department = await getDefaultDepartment();

  const candidateData = {
    keycloakId,
    email: userInfo.email,
    firstname: userInfo.given_name,
    lastname: userInfo.family_name,
    gender: mapGender(userInfo.gender),
    birthdate: parseFranceConnectDate(userInfo.birthdate),
    phone: "",
    departmentId: department.id,
    givenName: undefined,
    countryId,
    birthDepartmentId: undefined,
    birthCity: userInfo.birthplace,
  };

  const candidate = await prismaClient.candidate.create({
    data: candidateData,
  });

  const realm = process.env.KEYCLOAK_APP_REALM;
  if (realm) {
    try {
      const keycloakAdmin = await getKeycloakAdmin();
      const role = await keycloakAdmin.roles.findOneByName({
        name: "candidate",
        realm,
      });
      if (role?.id) {
        await keycloakAdmin.users.addRealmRoleMappings({
          id: keycloakId,
          realm,
          roles: [{ id: role.id, name: role.name ?? "candidate" }],
        });
      }
    } catch {
      // Le rôle ou les permissions peuvent être manquants ; ne pas échouer la création du candidat
    }
  }

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

const getDefaultDepartment = async () => {
  const department = await prismaClient.department.findFirst({
    where: { code: "75" },
  });

  if (!department) {
    throw new FranceConnectSystemError("Default department not found");
  }

  return department;
};
