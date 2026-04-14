import {
  CandidacyTypeAccompagnement,
  Country,
  Department,
} from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { authorizationCodeGrant } from "openid-client";
import { z } from "zod";

import { createCandidacy } from "@/modules/candidacy/features/createCandidacy";
import { getActiveCandidaciesByCandidateId } from "@/modules/candidacy/features/getActiveCandidaciesByCandidateId";
import { getCandidateByKeycloakId } from "@/modules/candidate/features/getCandidateByKeycloakId";
import { updateAllCandidaciesDerniereDateActiviteByCandidateId } from "@/modules/candidate/features/updateAllCandidaciesDerniereDateActiviteByCandidateId";
import { isFeatureActiveForUser } from "@/modules/feature-flipping/feature-flipping.features";
import { getKeycloakAdmin } from "@/modules/shared/auth/getKeycloakAdmin";
import { CANDIDATE_BASE_URL } from "@/modules/shared/config/config";
import { logger } from "@/modules/shared/logger/logger";
import { prismaClient } from "@/prisma/client";

import {
  sanitizedEmail,
  sanitizedOptionalPhone,
  sanitizedOptionalText,
  sanitizedOptionalZipCode,
  sanitizedText,
} from "../utils/input-sanitization";

import { resolveBirthplaceFromInseeCode } from "./france-connect-birthplace";
import {
  FranceConnectError,
  FranceConnectForbiddenError,
  FranceConnectReconciliationError,
  FranceConnectSystemError,
  FranceConnectUserError,
} from "./france-connect.errors";
import {
  checkPivotFieldsMatch,
  getAndDeleteFcStateCookie,
  getOAuthConfig,
  isValidCertificationId,
  parseFranceConnectDate,
  splitGivenName,
  unlinkFranceConnectIdentity,
} from "./france-connect.utils";

const FranceConnectClaimsSchema = z.object({
  sub: z.string(),
  email: sanitizedEmail(),
  given_name: sanitizedText(),
  family_name: sanitizedText(),
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
    throw new FranceConnectForbiddenError({
      message: "L'authentification FranceConnect n'est pas activée",
    });
  }

  const code = currentUrl.searchParams.get("code") ?? undefined;
  if (!code) {
    const error = currentUrl.searchParams.get("error");
    const errorDescription =
      currentUrl.searchParams.get("error_description") ?? undefined;

    const message = errorDescription ?? "Connexion annulée ou refusée";

    // Préserver le code d'erreur FC d'origine en utilisant la classe d'erreur correspondante
    switch (error) {
      case "access_denied":
        throw new FranceConnectForbiddenError({ message });
      case "server_error":
      case "temporarily_unavailable":
        throw new FranceConnectSystemError({ message });
      default:
        // Couvre : null (pas de paramètre error), invalid_request, invalid_scope, login_required, etc.
        throw new FranceConnectUserError({ message, statusCode: 400 });
    }
  }

  const state = currentUrl.searchParams.get("state") ?? undefined;
  if (!state) {
    throw new FranceConnectUserError({
      message: "Paramètre state manquant",
      statusCode: 400,
    });
  }

  const stored = getAndDeleteFcStateCookie(request, reply, state);
  if (!stored) {
    throw new FranceConnectUserError({
      message: "La session d'authentification a expiré",
    });
  }

  const config = await getOAuthConfig();

  const tokenSet = await authorizationCodeGrant(config, currentUrl, {
    pkceCodeVerifier: stored.code_verifier,
    expectedState: state,
    expectedNonce: stored.nonce,
  });

  if (!tokenSet.access_token || !tokenSet.id_token) {
    throw new FranceConnectSystemError({
      message: "Erreur lors de l'authentification",
    });
  }

  try {
    const claims = tokenSet.claims();
    const idTokenResult = FranceConnectClaimsSchema.safeParse(claims);
    if (!idTokenResult.success) {
      throw new FranceConnectUserError({
        message: "Une erreur est survenue lors de l'authentification",
        statusCode: 400,
      });
    }
    const idTokenPayload = idTokenResult.data;

    const keycloakId = idTokenPayload.sub;

    const { candidate, isNewAccount } = await getOrCreateCandidate(
      keycloakId,
      idTokenPayload,
    );

    const certificationId = isValidCertificationId(stored.certificationId)
      ? stored.certificationId
      : undefined;

    const typeAccompagnement =
      stored.typeAccompagnement as CandidacyTypeAccompagnement;

    if (certificationId && typeAccompagnement) {
      try {
        await createCandidacy({
          candidateId: candidate.id,
          certificationId,
          typeAccompagnement,
        });
        logger.info(
          `[France Connect] Candidature créée automatiquement pour le candidat ${candidate.id}`,
        );
      } catch (error) {
        logger.error(
          `[France Connect] Erreur lors de la création automatique de candidature pour le candidat ${candidate.id}: ${error}`,
        );
      }
    }

    let redirectPath: string = `${CANDIDATE_BASE_URL}/candidates/${candidate.id}`;
    if (isNewAccount) {
      redirectPath = `${redirectPath}/first-connexion`;
    } else {
      const activeCandidacies = await getActiveCandidaciesByCandidateId({
        candidateId: candidate.id,
      });
      if (activeCandidacies.length > 0) {
        redirectPath = `${redirectPath}/candidacies`;
      } else {
        redirectPath = `${redirectPath}/candidacies/create`;
      }
    }

    await updateAllCandidaciesDerniereDateActiviteByCandidateId({
      candidateId: candidate.id,
    });

    return redirectPath;
  } catch (error) {
    if (error instanceof FranceConnectError && tokenSet.id_token) {
      error.idToken = tokenSet.id_token;
    }
    throw error;
  }
};

const logAnonymizedFcUserInfo = ({
  candidateId,
  userInfo,
}: {
  candidateId?: string;
  userInfo: FranceConnectClaims;
}) => {
  const { family_name, given_name, ...anonymizedUserInfo } = userInfo;
  logger.warn(
    `[France Connect] userInfo pour le candidat ${candidateId}: ${JSON.stringify(anonymizedUserInfo, null, 2)}`,
  );
};

const buildCandidateDataFromFCClaims = async ({
  candidateId,
  userInfo,
  existingNationality,
}: {
  candidateId?: string;
  userInfo: FranceConnectClaims;
  existingNationality?: string | null;
}) => {
  const { firstname, firstname2, firstname3 } = splitGivenName(
    userInfo.given_name ?? "",
  );
  const country = await getCountry(userInfo.birthcountry);
  let birthDepartmentId: string | null = null;
  let birthCity: string | null = null;

  if (!userInfo.birthplace) {
    const displayCandidateId = candidateId ?? "inconnu";
    logger.warn(
      `[France Connect] Lieu de naissance (champ fc birthplace) manquant pour le candidat ${displayCandidateId}`,
    );
    logAnonymizedFcUserInfo({ candidateId, userInfo });
  }

  if (country?.label === "France" && userInfo.birthplace) {
    const resolution = await resolveBirthplaceFromInseeCode(
      userInfo.birthplace,
    );
    if (resolution) {
      birthCity = resolution.cityName;
      const department = await prismaClient.department.findUnique({
        where: { code: resolution.departmentCode },
      });
      if (department) {
        birthDepartmentId = department.id;
      } else {
        logger.warn(
          `[France Connect] Code département "${resolution.departmentCode}" retourné par l'API Geo introuvable en base pour le code INSEE "${userInfo.birthplace}"`,
        );
        birthDepartmentId = (await getDepartment(userInfo.birthplace)).id;
      }
    } else {
      // Fallback : API indisponible, on conserve le comportement actuel
      birthDepartmentId = (await getDepartment(userInfo.birthplace)).id;
    }
  } else if (country?.label === "France") {
    birthDepartmentId = (await getDefaultDepartment()).id;
  }

  const nationality = existingNationality ?? country?.nationality ?? null;

  const middleNames = [firstname2, firstname3].filter(Boolean).join(" ");

  const countryIsFrance = country?.label === "France";

  return {
    firstname,
    firstname2,
    firstname3,
    middleNames,
    lastname: userInfo.family_name,
    birthdate: parseFranceConnectDate(userInfo.birthdate),
    countryId: country?.id ?? null,
    nationality,
    franceConnectLinked: true,
    birthDepartmentId,
    ...(countryIsFrance ? { birthCity } : {}),
  };
};

const updateCandidateFromFCClaims = async ({
  candidateId,
  userInfo,
}: {
  candidateId: string;
  userInfo: FranceConnectClaims;
}) => {
  const existingCandidate = await prismaClient.candidate.findUnique({
    where: { id: candidateId },
    select: { nationality: true },
  });
  const existingNationality = existingCandidate?.nationality;

  const fcData = await buildCandidateDataFromFCClaims({
    candidateId,
    userInfo,
    existingNationality,
  });

  const candidate = await prismaClient.candidate.update({
    where: { id: candidateId },
    data: fcData,
  });

  return candidate;
};

const getOrCreateCandidate = async (
  keycloakId: string,
  userInfo: FranceConnectClaims,
): Promise<{ candidate: { id: string }; isNewAccount: boolean }> => {
  let candidate = await getCandidateByKeycloakId({ keycloakId });

  if (candidate) {
    // Keycloak auto-link le compte FC par email sans vérifier l'identité.
    // On vérifie que les données pivots (nom, prénom, date de naissance)
    // correspondent pour éviter qu'un utilisateur FC récupère le compte
    // d'une autre personne ayant la même adresse email.
    //
    // La birthdate est récupérée via TO_CHAR côté Postgres pour garantir
    // un format "YYYY-MM-DD" indépendant de la timezone du process Node et
    // du driver pg (cf. colonne DATE).
    const candidateBirthdate = await getCandidateBirthdateAsYMD(candidate.id);

    const { isMatch, mismatchedFields } = checkPivotFieldsMatch({
      candidateFirstname: candidate.firstname,
      candidateLastname: candidate.lastname,
      candidateBirthdate,
      fcGivenName: userInfo.given_name,
      fcFamilyName: userInfo.family_name,
      fcBirthdate: userInfo.birthdate,
    });

    if (!isMatch) {
      await unlinkFranceConnectIdentity(keycloakId);
      throw new FranceConnectReconciliationError({
        candidateId: candidate.id,
        mismatchedFields,
      });
    }
    const updated = await updateCandidateFromFCClaims({
      candidateId: candidate.id,
      userInfo,
    });
    return { candidate: updated, isNewAccount: false };
  }

  candidate = await prismaClient.candidate.findUnique({
    where: { email: userInfo.email },
  });

  if (candidate) {
    if (candidate.keycloakId && candidate.keycloakId !== keycloakId) {
      throw new FranceConnectForbiddenError({
        message: `Conflit de keycloakId pour le candidat ${candidate.id} : le compte est déjà lié à un autre identifiant FranceConnect`,
        userMessage:
          "Un compte existe déjà avec cette adresse email. Veuillez vous connecter avec vos identifiants habituels.",
      });
    }

    logger.info(
      `[France Connect] Association du keycloakId FranceConnect ${keycloakId} au candidat existant ${candidate.id}`,
    );
    const linked = await updateCandidateFromFCClaims({
      candidateId: candidate.id,
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

const createCandidateFromFranceConnect = async ({
  keycloakId,
  userInfo,
}: {
  keycloakId: string;
  userInfo: FranceConnectClaims;
}) => {
  const fcData = await buildCandidateDataFromFCClaims({
    userInfo,
  });

  const currentDepartment = await getDefaultDepartment();

  const candidate = await prismaClient.candidate.create({
    data: {
      ...fcData,
      email: userInfo.email,
      keycloakId,
      phone: "",
      city: "",
      zip: "",
      street: "",
      departmentId: currentDepartment.id,
    },
  });

  await assignCandidateRole(keycloakId);
  logger.info(
    `[France Connect] Nouveau compte candidat créé avec succès : ${candidate.id}`,
  );
  return candidate;
};

const getCandidateBirthdateAsYMD = async (
  candidateId: string,
): Promise<string | null> => {
  const rows = await prismaClient.$queryRaw<
    Array<{ birthdate: string | null }>
  >`SELECT TO_CHAR(birthdate, 'YYYY-MM-DD') AS birthdate FROM candidate WHERE id = ${candidateId}::uuid`;
  return rows[0]?.birthdate ?? null;
};

const getDefaultDepartment = async () => {
  const department = await prismaClient.department.findFirst({
    where: { code: "75" },
  });

  if (!department) {
    throw new FranceConnectSystemError({
      message: "Erreur de configuration du système",
    });
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
    throw new FranceConnectUserError({
      message: `Code pays INSEE "${countryCode}" introuvable en base`,
      statusCode: 400,
      userMessage: "Les informations de pays sont invalides",
    });
  }
  return country;
};

const assignCandidateRole = async (keycloakId: string): Promise<void> => {
  const realm = process.env.KEYCLOAK_APP_REALM;
  if (!realm) {
    throw new FranceConnectSystemError({
      message: "Erreur de configuration du système",
    });
  }

  const keycloakAdmin = await getKeycloakAdmin();
  const role = await keycloakAdmin.roles.findOneByName({
    name: "candidate",
    realm,
  });

  if (!role?.id) {
    throw new FranceConnectSystemError({
      message: "Erreur de configuration du système",
    });
  }

  await keycloakAdmin.users.addRealmRoleMappings({
    id: keycloakId,
    realm,
    roles: [{ id: role.id, name: role.name ?? "candidate" }],
  });
};
