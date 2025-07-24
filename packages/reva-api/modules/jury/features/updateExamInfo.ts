import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { prismaClient } from "@/prisma/client";

import { ExamInfo } from "../jury.types";

export const updateExamInfo = async ({
  candidacyId,
  examInfo,
  userKeycloakId,
  userEmail,
  userRoles,
}: {
  candidacyId: string;
  examInfo: ExamInfo;
  userKeycloakId?: string;
  userEmail?: string;
  userRoles: KeyCloakUserRole[];
}): Promise<ExamInfo> => {
  await logCandidacyAuditEvent({
    candidacyId,
    userKeycloakId,
    userEmail,
    userRoles,
    eventType: "JURY_EXAM_INFO_UPDATED",
    details: {
      actualExamDate: examInfo.actualExamDate,
      estimatedExamDate: examInfo.estimatedExamDate,
      examResult: examInfo.examResult,
    },
  });
  return prismaClient.examInfo.update({
    where: { candidacyId },
    data: examInfo,
  });
};
