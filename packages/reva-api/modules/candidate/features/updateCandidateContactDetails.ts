import { prismaClient } from "../../../prisma/client";
import {
  CandidacyAuditLogUserInfo,
  logCandidacyAuditEvent,
} from "../../candidacy-log/features/logCandidacyAuditEvent";
import { updateCandidateEmailAndSendNotifications } from "./updateCandidateEmailAndSendNotifications";

export const updateCandidateContactDetails = async ({
  candidacyId,
  candidateId,
  phone,
  email,
  userInfo,
}: {
  candidacyId: string;
  candidateId: string;
  phone: string;
  email?: string;
  userInfo: CandidacyAuditLogUserInfo;
}) => {
  const candidate = await prismaClient.candidate.findUnique({
    where: { id: candidateId },
  });
  if (!candidate) {
    throw new Error(`Ce candidat n'existe pas`);
  }

  if (email && userInfo.userRoles.includes("admin")) {
    await updateCandidateEmailAndSendNotifications({
      previousEmail: candidate.email,
      newEmail: email,
    });
  }

  const result = prismaClient.candidate.update({
    where: { id: candidateId },
    data: { phone },
  });

  await logCandidacyAuditEvent({
    eventType: "CANDIDATE_CONTACT_DETAILS_UPDATED",
    candidacyId,
    details: { phone, email },
    ...userInfo,
  });

  return result;
};
