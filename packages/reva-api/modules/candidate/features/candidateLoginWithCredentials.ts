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

  // Résolution candidat DB juste après IAM: évite de leak via timing qu'un
  // email IAM existe sans candidat DB associé (cf. plan §5).
  const candidate = await getCandidateByKeycloakId({
    keycloakId: account?.id || "",
  });

  if (!candidate) {
    throw new Error("Candidat non trouvé");
  }

  // Valide le mot de passe via le client `reva-app-password-check` (sans OTP)
  // pour distinguer un MDP incorrect d'un OTP incorrect. Les erreurs
  // d'indisponibilité Keycloak (KeycloakUnavailableError) sont laissées
  // remonter telles quelles: le résolveur les transformera en ErrorWithProps
  // avec le code "KEYCLOAK_UNAVAILABLE".
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
    // Le mot de passe ne transite pas en clair entre les deux étapes: il est
    // embarqué chiffré dans le challenge JWT, signé+chiffré côté serveur.
    // `lastLoginViaPasswordAt` ne sera mis à jour qu'après vérification OTP
    // réussie (cf. candidateVerifyOtpChallenge), pour refléter le moment où
    // l'utilisateur est réellement loggé end-to-end.
    const otpChallengeToken = encodeOtpChallengeToken({
      keycloakId: candidate.keycloakId,
      realm: process.env.KEYCLOAK_APP_REALM as string,
      clientId: process.env.KEYCLOAK_APP_REVA_APP as string,
      password,
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

  // Mise à jour du timestamp uniquement quand l'utilisateur est réellement
  // loggé (tokens mintés), pas en amont.
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
