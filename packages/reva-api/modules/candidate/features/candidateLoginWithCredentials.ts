import { getAccountInIAM } from "@/modules/shared/auth/auth.helper";
import { encodeOtpChallengeToken } from "@/modules/shared/auth/otp-challenge.utils";
import {
  FunctionalCodeError,
  FunctionalError,
} from "@/modules/shared/error/functionalError";
import { prismaClient } from "@/prisma/client";

import {
  candidateUserHasTotpConfigured,
  generateCandidateIAMTokenWithPassword,
  validateCandidatePasswordOnly,
} from "../utils/keycloak.utils";

import { getCandidateByKeycloakId } from "./getCandidateByKeycloakId";

export const candidateLoginWithCredentials = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
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

  // Résolution candidat DB juste après IAM: évite de leak via timing
  // qu'un email IAM existe sans candidat DB associé.
  const candidate = await getCandidateByKeycloakId({
    keycloakId: account?.id || "",
  });

  if (!candidate) {
    throw new Error("Candidat non trouvé");
  }

  // Valide le MDP d'abord pour distinguer un MDP incorrect d'un OTP incorrect.
  const passwordResult = await validateCandidatePasswordOnly(
    candidate.keycloakId,
    password,
  );
  if (!passwordResult.ok) {
    throw new Error("Adresse électronique ou mot de passe incorrect");
  }

  const isUserHasTotpConfigured = await candidateUserHasTotpConfigured(
    candidate.keycloakId,
  );

  if (isUserHasTotpConfigured) {
    // MDP embarqué chiffré dans le challenge JWT: jamais en clair côté front.
    const otpChallengeToken = encodeOtpChallengeToken({
      payload: {
        keycloakId: candidate.keycloakId,
        realm: process.env.KEYCLOAK_APP_REALM as string,
        clientId: process.env.KEYCLOAK_APP_REVA_APP as string,
        password,
      },
      otpType: "authenticator",
    });
    return {
      tokens: null,
      candidate,
      requiresOtp: true,
      otpChallengeToken,
    };
  }

  const tokens = await generateCandidateIAMTokenWithPassword(
    candidate.keycloakId,
    password,
  );

  // Timestamp mis à jour seulement après mint des tokens (login end-to-end).
  await prismaClient.candidate.update({
    where: { id: candidate.id },
    data: { lastLoginViaPasswordAt: new Date() },
  });

  return {
    tokens,
    candidate,
    requiresOtp: false,
    otpChallengeToken: null,
  };
};
