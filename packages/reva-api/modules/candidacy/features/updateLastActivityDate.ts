import { isBefore } from "date-fns";
import { logCandidacyAuditEvent } from "../../../modules/candidacy-log/features/logCandidacyAuditEvent";
import { prismaClient } from "../../../prisma/client";

export const updateLastActivityDate = async ({
  input,
  context,
}: {
  input: {
    candidacyId: string;
    readyForJuryEstimatedAt: Date;
  };
  context: GraphqlContext;
}) => {
  const { candidacyId, readyForJuryEstimatedAt } = input;

  if (isBefore(readyForJuryEstimatedAt, new Date())) {
    throw new Error(
      "La date de préparation pour le jury ne peut être dans le passé",
    );
  }

  await logCandidacyAuditEvent({
    candidacyId,
    eventType: "CANDIDACY_ACTUALISATION",
    userKeycloakId: context.auth.userInfo?.sub,
    userRoles: context.auth.userInfo?.realm_access?.roles || [],
    userEmail: context.auth.userInfo?.email,
  });

  return prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: { readyForJuryEstimatedAt, lastActivityDate: new Date() },
  });
};
