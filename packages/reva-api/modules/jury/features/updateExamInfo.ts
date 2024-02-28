import { prismaClient } from "../../../prisma/client";
import { logCandidacyAuditEvent } from "../../candidacy-log/features/logCandidacyAuditEvent";
import { ExamInfo } from "../jury.types";

export const updateExamInfo = async ({
  candidacyId,
  examInfo,
  userKeycloakId,
  userRoles,
}: {
  candidacyId: string;
  examInfo: ExamInfo;
  userKeycloakId?: string;
  userRoles: KeyCloakUserRole[];
}): Promise<ExamInfo> => {
  await logCandidacyAuditEvent({
    candidacyId,
    userKeycloakId,
    userRoles,
    eventType: "JURY_EXAM_INFO_UPDATED",
  });
  return prismaClient.examInfo.update({
    where: { candidacyId },
    data: examInfo,
  });
};
