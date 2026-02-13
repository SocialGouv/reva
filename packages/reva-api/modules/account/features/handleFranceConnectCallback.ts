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
      "L'authentification FranceConnect n'est pas activée",
    );
  }

  const code = currentUrl.searchParams.get("code") ?? undefined;
  if (!code) {
    const error = currentUrl.searchParams.get("error");
    const errorDescription =
      currentUrl.searchParams.get("error_description") ?? undefined;
    const message =
      error && errorDescription
        ? `${error}: ${errorDescription}`
        : (error ??
          "Code d'autorisation manquant (connexion annulée ou refusée)");
    throw new FranceConnectUserError(message, 400);
  }

  const state = currentUrl.searchParams.get("state") ?? undefined;
  if (!state) {
    throw new FranceConnectUserError("Paramètre state manquant", 400);
  }

  const stored = getAndDeleteFcStateCookie(request, reply, state);
  if (!stored) {
    throw new FranceConnectUserError("La session d'authentification a expiré");
  }

  const config = await getOAuthConfig();

  const tokenSet = await authorizationCodeGrant(config, currentUrl, {
    pkceCodeVerifier: stored.code_verifier,
    expectedState: state,
    expectedNonce: stored.nonce,
  });

  if (!tokenSet.access_token || !tokenSet.id_token) {
    throw new FranceConnectSystemError("Erreur lors de l'authentification");
  }

  const claims = tokenSet.claims();
  const idTokenResult = FranceConnectClaimsSchema.safeParse(claims);
  if (!idTokenResult.success) {
    throw new FranceConnectUserError(
      "Une erreur est survenue lors de l'authentification",
      400,
    );
  }
  const idTokenPayload = idTokenResult.data;
  const keycloakId = idTokenPayload.sub;

  const { candidate, isNewAccount } = await getOrCreateCandidate(
    keycloakId,
    idTokenPayload,
  );

  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.BASE_URL
      : "http://localhost:3004";

  const certificationId = isValidCertificationId(stored.certificationId)
    ? stored.certificationId
    : undefined;

  let redirectPath: string;
  if (isNewAccount) {
    redirectPath = `/candidat/candidates/${candidate.id}/first-connexion`;
  } else if (certificationId) {
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

const upsertCandidateInfoFranceConnect = async ({
  candidateId,
  userInfo,
}: {
  candidateId: string;
  userInfo: FranceConnectClaims;
}) => {
  const { firstname, firstname2, firstname3 } = splitGivenName(
    userInfo.given_name ?? "",
  );
  const countryId = (await getCountry(userInfo.birthcountry))?.id;
  const data = {
    countryId,
    birthdate: parseFranceConnectDate(userInfo.birthdate),
    gender: mapGender(userInfo.gender),
    givenName: userInfo.given_name,
    firstname,
    firstname2,
    firstname3,
    lastname: userInfo.family_name,
    email: userInfo.email,
  };

  await prismaClient.candidateInfoFranceConnect.upsert({
    where: { candidateId },
    create: { candidateId, ...data },
    update: { ...data, updatedAt: new Date() },
  });
};

const getOrCreateCandidate = async (
  keycloakId: string,
  userInfo: FranceConnectClaims,
): Promise<{ candidate: { id: string }; isNewAccount: boolean }> => {
  let candidate = await getCandidateByKeycloakId({ keycloakId });

  if (candidate) {
    await upsertCandidateInfoFranceConnect({
      candidateId: candidate.id,
      userInfo,
    });
    return { candidate, isNewAccount: false };
  }

  candidate = await prismaClient.candidate.findUnique({
    where: { email: userInfo.email },
  });

  if (candidate) {
    if (candidate.keycloakId && candidate.keycloakId !== keycloakId) {
      // Le candidat possède déjà un keycloakId différent (ex. compte par mot de passe).
      // Ne pas l'écraser pour ne pas casser sa connexion existante.
      logger.warn(
        `[France Connect] Tentative de liaison FranceConnect pour le candidat ${candidate.id} qui possède déjà un keycloakId différent`,
      );
      await upsertCandidateInfoFranceConnect({
        candidateId: candidate.id,
        userInfo,
      });
      return { candidate, isNewAccount: false };
    }
    // keycloakId null ou identique — on lie/confirme le keycloakId FranceConnect
    const linked = await linkKeycloakIdToCandidate({
      candidateId: candidate.id,
      keycloakId,
      userInfo,
    });
    return { candidate: linked, isNewAccount: false };
  }

  const created = await createCandidateFromFranceConnect({
    keycloakId,
    userInfo,
  });
  return { candidate: created, isNewAccount: true };
};

const linkKeycloakIdToCandidate = async ({
  candidateId,
  keycloakId,
  userInfo,
}: {
  candidateId: string;
  keycloakId: string;
  userInfo: FranceConnectClaims;
}) => {
  logger.info(
    `[France Connect] Association du keycloakId FranceConnect ${keycloakId} au candidat existant ${candidateId}`,
  );

  const candidate = await prismaClient.candidate.update({
    where: { id: candidateId },
    data: {
      keycloakId,
      updatedAt: new Date(),
    },
  });

  await assignCandidateRole(keycloakId);
  await upsertCandidateInfoFranceConnect({ candidateId, userInfo });
  return candidate;
};

const createCandidateFromFranceConnect = async ({
  keycloakId,
  userInfo,
}: {
  keycloakId: string;
  userInfo: FranceConnectClaims;
}) => {
  const { firstname, firstname2, firstname3 } = splitGivenName(
    userInfo.given_name ?? "",
  );
  const birthDepartment = await getDepartment(userInfo.birthplace);
  const currentDepartment = await getDepartment(userInfo.locality);
  const countryId = (await getCountry(userInfo.birthcountry))?.id;

  const candidate = await prismaClient.candidate.create({
    data: {
      keycloakId,
      email: userInfo.email,
      firstname,
      firstname2,
      firstname3,
      lastname: userInfo.family_name,
      gender: mapGender(userInfo.gender),
      birthdate: parseFranceConnectDate(userInfo.birthdate),
      countryId,
      phone: userInfo.phone_number ?? "",
      city: userInfo.locality ?? "",
      zip: userInfo.postal_code ?? "",
      street: userInfo.street_address ?? "",
      givenName: userInfo.preferred_username ?? undefined,
      departmentId: currentDepartment.id,
      birthDepartmentId: birthDepartment.id,
    },
  });

  await assignCandidateRole(keycloakId);
  await upsertCandidateInfoFranceConnect({
    candidateId: candidate.id,
    userInfo,
  });
  logger.info(
    `[France Connect] Nouveau compte candidat créé avec succès : ${candidate.id}`,
  );
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

const getDefaultDepartment = async () => {
  const department = await prismaClient.department.findFirst({
    where: { code: "75" },
  });

  if (!department) {
    throw new FranceConnectSystemError("Erreur de configuration du système");
  }

  return department;
};

const getDepartment = async (birthplace?: string): Promise<Department> => {
  if (birthplace) {
    const department = await prismaClient.department.findUnique({
      where: { code: birthplace.slice(0, 2) },
    });
    if (department) return department;
  }
  return getDefaultDepartment();
};

const getCountry = async (
  countryCode?: string,
): Promise<Country | undefined> => {
  if (!countryCode) return undefined;

  const country = await prismaClient.country.findUnique({
    where: { inseeCode: countryCode },
  });
  if (!country) {
    throw new FranceConnectUserError(
      "Les informations de pays sont invalides",
      400,
    );
  }
  return country;
};

const assignCandidateRole = async (keycloakId: string): Promise<void> => {
  const realm = process.env.KEYCLOAK_APP_REALM;
  if (!realm) {
    throw new FranceConnectSystemError("Erreur de configuration du système");
  }

  const keycloakAdmin = await getKeycloakAdmin();
  const role = await keycloakAdmin.roles.findOneByName({
    name: "candidate",
    realm,
  });

  if (!role?.id) {
    throw new FranceConnectSystemError("Erreur de configuration du système");
  }

  await keycloakAdmin.users.addRealmRoleMappings({
    id: keycloakId,
    realm,
    roles: [{ id: role.id, name: role.name ?? "candidate" }],
  });
};
