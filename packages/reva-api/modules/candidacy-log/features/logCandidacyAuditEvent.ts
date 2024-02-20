import { prismaClient } from "../../../prisma/client";
import { logger } from "../../shared/logger";
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
  logger.info({ userKeycloakId });
  if (!userKeycloakId) {
    throw new Error("utilisateur inconnu");
  }

  return prismaClient.candidacyLog.create({
    data: { candidacyId, userKeycloakId, eventType },
  });
};
