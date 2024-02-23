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
  if (!userKeycloakId) {
    logger.error(`No userKeycloakId when logging candidacy event ${eventType}`);
    return null;
  }

  return prismaClient.candidacyLog.create({
    data: { candidacyId, userKeycloakId, eventType },
  });
};
