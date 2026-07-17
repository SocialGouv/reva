import {
  CandidacyAuditLogUserInfo,
  logCandidacyAuditEvent,
} from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import {
  CANDIDATURE_NON_TROUVEE,
  CANDIDAT_NON_TROUVE,
} from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";

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
  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
  });
  if (!candidacy) {
    throw new Error(CANDIDATURE_NON_TROUVEE);
  }

  const candidate = await prismaClient.candidate.findUnique({
    where: { id: candidateId },
  });

  if (!candidate) {
    throw new Error(CANDIDAT_NON_TROUVE);
  }

  if (candidacy.candidateId !== candidate.id) {
    throw new Error(`Le candidat n'est pas rattaché à la candidature`);
  }

  if (
    email &&
    email != candidate.email &&
    userInfo.userRoles.includes("admin")
  ) {
    await updateCandidateEmailAndSendNotifications({
      previousEmail: candidate.email,
      newEmail: email,
    });
  }

  const result = await prismaClient.candidate.update({
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
