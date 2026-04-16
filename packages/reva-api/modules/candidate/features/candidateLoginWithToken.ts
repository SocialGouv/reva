import { getAccountInIAM } from "@/modules/shared/auth/auth.helper";
import { getKeycloakAdmin } from "@/modules/shared/auth/getKeycloakAdmin";
import { getJWTContent, generateJwt } from "@/modules/shared/auth/jwt.helper";
import { BACKEND_BASE_URL } from "@/modules/shared/config/config";
import {
  FunctionalCodeError,
  FunctionalError,
} from "@/modules/shared/error/functionalError";
import { prismaClient } from "@/prisma/client";

import { CandidateAuthenticationInput } from "../candidate.types";

import { getCandidateByKeycloakId } from "./getCandidateByKeycloakId";
import { updateAllCandidaciesDerniereDateActiviteByCandidateId } from "./updateAllCandidaciesDerniereDateActiviteByCandidateId";

const CANDIDATE_IMPERSONATE_TOKEN_TTL_SECONDS = 60;

export const candidateLoginWithToken = async ({ token }: { token: string }) => {
  const candidateAuthenticationInput = (await getJWTContent(
    token,
  )) as CandidateAuthenticationInput;

  if (candidateAuthenticationInput.action === "login") {
    return loginCandidate({
      email: candidateAuthenticationInput.email,
    });
  } else {
    throw new FunctionalError(
      FunctionalCodeError.TECHNICAL_ERROR,
      `Action non reconnue`,
    );
  }
};

const loginCandidate = async ({ email }: { email: string }) => {
  const account = await getAccountInIAM(
    email,
    process.env.KEYCLOAK_APP_REALM as string,
  );

  if (!account) {
    throw new FunctionalError(
      FunctionalCodeError.ACCOUNT_IN_IAM_NOT_FOUND,
      `Candidat non trouvé`,
    );
  }

  const candidate = await getCandidateByKeycloakId({
    keycloakId: account?.id || "",
  });

  if (!candidate) {
    throw new Error("Candidat non trouvé");
  }

  // Track last login via magic link
  await prismaClient.candidate.update({
    where: { id: candidate.id },
    data: { lastLoginViaMagicLinkAt: new Date() },
  });

  await updateAllCandidaciesDerniereDateActiviteByCandidateId({
    candidateId: candidate.id,
  });

  const url = getImpersonateUrl({
    keycloakId: candidate.keycloakId,
    candidateId: candidate.id,
  });

  return url;
};

const getImpersonateUrl = async ({
  keycloakId,
  candidateId,
}: {
  keycloakId: string;
  candidateId: string;
}): Promise<string | undefined> => {
  const token = await getImpersonateTokenForCandidate({
    keycloakId,
    candidateId,
  });
  return `${BACKEND_BASE_URL}/account/impersonate?token=${token}`;
};

const getImpersonateTokenForCandidate = async ({
  keycloakId,
  candidateId,
}: {
  keycloakId: string;
  candidateId: string;
}) => {
  const keycloakAdmin = await getKeycloakAdmin();

  // Check if candidate with candidateToUpdate.keycloakId exsits
  const keycloakAccount = await keycloakAdmin.users.findOne({
    id: keycloakId,
    realm: process.env.KEYCLOAK_APP_REALM,
  });

  if (!keycloakAccount) {
    throw new Error(
      `Compte utilisateur keycloak pour l'id ${keycloakId} non trouvé`,
    );
  }

  const token = generateJwt(
    {
      keycloakId,
      candidateId,
    },
    CANDIDATE_IMPERSONATE_TOKEN_TTL_SECONDS,
  );

  return token;
};
