import { prismaClient } from "../../../prisma/client";
import { CandidacyEventType } from "../candidacy-log.types";

export const logCandidacyAuditEvent = ({
  candidacyId,
  userKeycloakId,
  eventType,
}: {
  candidacyId: string;
  userKeycloakId?: string;
  eventType: CandidacyEventType;
}) => {
  if (!userKeycloakId) {
    throw new Error("utilisateur inconnu");
  }

  return prismaClient.candidacyLog.create({
    data: { candidacyId, userKeycloakId, eventType },
  });
};
