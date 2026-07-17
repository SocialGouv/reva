import {
  getAccountInIAM,
  resetPassword,
} from "@/modules/shared/auth/auth.helper";
import { getJWTContent } from "@/modules/shared/auth/jwt.helper";
import {
  FunctionalCodeError,
  FunctionalError,
} from "@/modules/shared/error/functionalError";
import {
  ACTION_NON_RECONNUE,
  CANDIDAT_NON_TROUVE,
} from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";

import { CandidateResetPasswordInput } from "../candidate.types";
import {
  candidateUserHasTotpConfigured,
  generateCandidateIAMTokenWithPassword,
} from "../utils/keycloak.utils";

import { candidateFinalizeRegistrationWithPassword } from "./candidateFinalizeRegistrationWithPassword";
import { getCandidateByKeycloakId } from "./getCandidateByKeycloakId";

export const candidateResetPassword = async ({
  token,
  password,
}: {
  token: string;
  password: string;
}) => {
  const candidateAuthenticationInput = (await getJWTContent(
    token,
  )) as CandidateResetPasswordInput;

  if (candidateAuthenticationInput.action === "finalize-registration") {
    return candidateFinalizeRegistrationWithPassword({ token, password });
  }

  if (candidateAuthenticationInput.action !== "reset-password") {
    throw new FunctionalError(
      FunctionalCodeError.TECHNICAL_ERROR,
      ACTION_NON_RECONNUE,
    );
  }

  const account = await getAccountInIAM(
    candidateAuthenticationInput.email,
    process.env.KEYCLOAK_APP_REALM as string,
  );

  if (!account) {
    throw new FunctionalError(
      FunctionalCodeError.ACCOUNT_IN_IAM_NOT_FOUND,
      CANDIDAT_NON_TROUVE,
    );
  }

  const candidate = await getCandidateByKeycloakId({
    keycloakId: account?.id || "",
  });

  if (!candidate) {
    throw new Error(CANDIDAT_NON_TROUVE);
  }

  await resetPassword(
    candidate.keycloakId,
    password,
    process.env.KEYCLOAK_APP_REALM as string,
  );

  // Track password update
  await prismaClient.candidate.update({
    where: { id: candidate.id },
    data: { passwordUpdatedAt: new Date() },
  });

  // Si TOTP enrollé, on skip l'auto-login: la Conditional OTP sur `reva-app`
  // ferait échouer /token (pas de `totp` fourni). Front redirige vers /login.
  const isUserHasTotpConfigured = await candidateUserHasTotpConfigured(
    candidate.keycloakId,
  );
  if (isUserHasTotpConfigured) {
    return null;
  }

  return generateCandidateIAMTokenWithPassword(candidate.keycloakId, password);
};
