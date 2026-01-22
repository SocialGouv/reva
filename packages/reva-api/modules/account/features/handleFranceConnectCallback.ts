import crypto from "node:crypto";

import { Gender } from "@prisma/client";
import {
  allowInsecureRequests,
  authorizationCodeGrant,
  discovery,
} from "openid-client";
import { z } from "zod";

import { getActiveCandidaciesByCandidateId } from "@/modules/candidacy/features/getActiveCandidaciesByCandidateId";
import { getCandidateByKeycloakId } from "@/modules/candidate/features/getCandidateByKeycloakId";
import { isFeatureActiveForUser } from "@/modules/feature-flipping/feature-flipping.features";
import { getKeycloakAdmin } from "@/modules/shared/auth/getKeycloakAdmin";
import { prismaClient } from "@/prisma/client";

import {
  sanitizedEmail,
  sanitizedOptionalText,
  sanitizedText,
} from "../utils/input-sanitization";

import {
  getAndDeleteState,
  isValidCertificationId,
  setFcCode,
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
  currentUrl: URL,
): Promise<string> => {
  const franceConnectEnabled = await isFeatureActiveForUser({
    feature: "FRANCE_CONNECT_AUTH_FOR_CANDIDATE",
  });

  if (!franceConnectEnabled) {
    throw new Error("FranceConnect authentication is not enabled");
  }

  //TODO: Supprimer cette logique lorsque la FranceConnect sera disponible en production
  if (process.env.BASE_URL?.includes(".gouv.fr")) {
    throw new Error("FranceConnect is not available in production");
  }

  const state = currentUrl.searchParams.get("state") ?? undefined;
  const stored = state ? getAndDeleteState(state) : null;
  if (!stored) {
    throw new Error("Invalid or expired state");
  }

  const issuer = `${process.env.KEYCLOAK_ADMIN_URL}/realms/${process.env.KEYCLOAK_APP_REALM}`;
  const clientId = process.env.KEYCLOAK_APP_REVA_APP || "reva-app";
  const clientSecret = process.env.KEYCLOAK_APP_ADMIN_CLIENT_SECRET || "";

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

  const tokenSet = await authorizationCodeGrant(config, currentUrl, {
    pkceCodeVerifier: stored.code_verifier,
    expectedState: state,
    expectedNonce: stored.nonce,
  });

  if (!tokenSet.access_token || !tokenSet.id_token) {
    throw new Error("Invalid token response");
  }

  const claims = tokenSet.claims();
  const idTokenResult = FranceConnectClaimsSchema.safeParse(claims);
  if (!idTokenResult.success) {
    throw new Error("Invalid ID token structure");
  }
  const idTokenPayload = idTokenResult.data;
  const keycloakId = idTokenPayload.sub;

  const candidate = await getOrCreateCandidate(keycloakId, idTokenPayload);

  const fc_code = crypto.randomBytes(32).toString("hex");
  setFcCode(fc_code, {
    accessToken: tokenSet.access_token,
    refreshToken: tokenSet.refresh_token ?? "",
    idToken: tokenSet.id_token,
  });

  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.BASE_URL
      : "http://localhost:3004";

  const certificationId = isValidCertificationId(stored.certificationId)
    ? stored.certificationId
    : undefined;

  // Si un certificationId est spécifié, on redirige toujours vers la création
  // Sinon, on vérifie si le candidat a déjà des candidatures actives
  let redirectPath: string;
  if (certificationId) {
    redirectPath = `/candidat/candidates/${candidate.id}/candidacies/create/certifications/${certificationId}/type-accompagnement`;
  } else {
    const activeCandidacies = await getActiveCandidaciesByCandidateId({
      candidateId: candidate.id,
    });
    if (activeCandidacies.length > 0) {
      // Le candidat a déjà des candidatures, on le redirige vers la liste
      redirectPath = `/candidat/candidates/${candidate.id}/candidacies`;
    } else {
      // Le candidat n'a pas de candidatures, on le redirige vers la création
      redirectPath = `/candidat/candidates/${candidate.id}/candidacies/create`;
    }
  }

  const redirectUrl = new URL(`${baseUrl}${redirectPath}`);
  redirectUrl.searchParams.set("fc_code", fc_code);
  return redirectUrl.toString();
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
    phone: "",
    departmentId: department.id,
    givenName: undefined,
    birthcountry: undefined,
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
    throw new Error("Default department not found");
  }

  return department;
};
