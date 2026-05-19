import { decodeOtpChallengeToken } from "@/modules/shared/auth/otp-challenge.utils";
import { prismaClient } from "@/prisma/client";

import { generateCandidateIAMTokenWithPassword } from "../utils/keycloak.utils";

import { getCandidateByKeycloakId } from "./getCandidateByKeycloakId";

export const candidateVerifyOtpChallenge = async ({
  challengeToken,
  totp,
}: {
  challengeToken: string;
  totp: string;
}) => {
  const payload = decodeOtpChallengeToken(challengeToken);
  if (!payload) {
    throw new Error(
      "Session de vérification expirée, veuillez vous reconnecter",
    );
  }

  // Le challenge porte (realm, clientId) côté candidat: realm = KEYCLOAK_APP_REALM,
  // clientId = `reva-app`. On passe directement par le wrapper candidat pour
  // récupérer le clientSecret et la cohérence env.
  const tokens = await generateCandidateIAMTokenWithPassword(
    payload.keycloakId,
    payload.password,
    totp,
  );

  const candidate = await getCandidateByKeycloakId({
    keycloakId: payload.keycloakId,
  });
  if (!candidate) {
    throw new Error("Candidat non trouvé");
  }

  // `lastLoginViaPasswordAt` est mis à jour ici (et non à l'étape credentials)
  // pour refléter le moment où l'utilisateur est réellement loggé end-to-end.
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
