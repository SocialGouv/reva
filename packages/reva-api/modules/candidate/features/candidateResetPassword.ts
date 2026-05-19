import {
  getAccountInIAM,
  resetPassword,
} from "@/modules/shared/auth/auth.helper";
import { getJWTContent } from "@/modules/shared/auth/jwt.helper";
import {
  FunctionalCodeError,
  FunctionalError,
} from "@/modules/shared/error/functionalError";
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
      `Action non reconnue`,
    );
  }

  const account = await getAccountInIAM(
    candidateAuthenticationInput.email,
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

  // Si l'utilisateur a un TOTP enrollé, on skip l'auto-login: la Conditional
  // OTP sur `reva-app` ferait échouer l'appel /token (pas de `totp` fourni).
  // Le front redirige vers `/login?passwordReset=1` quand le retour est null.
  const isUserHasTotpConfigured = await candidateUserHasTotpConfigured(
    candidate.keycloakId,
  );
  if (isUserHasTotpConfigured) {
    return null;
  }

  // Auto-login standard pour les candidats sans TOTP.
  return generateCandidateIAMTokenWithPassword(candidate.keycloakId, password);
};
