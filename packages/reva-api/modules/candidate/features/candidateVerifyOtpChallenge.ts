import { decodeOtpChallengeToken } from "@/modules/shared/auth/otp-challenge.utils";
import {
  CANDIDAT_NON_TROUVE,
  SESSION_VERIFICATION_EXPIREE_VEUILLEZ_VOUS_RECONNECTER,
} from "@/modules/shared/errors/messages";
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
    throw new Error(SESSION_VERIFICATION_EXPIREE_VEUILLEZ_VOUS_RECONNECTER);
  }

  const tokens = await generateCandidateIAMTokenWithPassword(
    payload.keycloakId,
    payload.password,
    totp,
  );

  const candidate = await getCandidateByKeycloakId({
    keycloakId: payload.keycloakId,
  });
  if (!candidate) {
    throw new Error(CANDIDAT_NON_TROUVE);
  }

  // Timestamp mis à jour ici (pas à l'étape credentials): reflète le login end-to-end.
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
