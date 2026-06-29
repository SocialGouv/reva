import {
  CandidacyAuditLogUserInfo,
  logCandidacyAuditEvent,
} from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { prismaClient } from "@/prisma/client";

import { updateCandidacyCertificationAuthority } from "./updateCandidacyCertificationAuthority";

export const manuallyUpdateCandidacyCertificationAuthority = async ({
  candidacyId,
  certificationAuthorityId,
  userInfo,
}: {
  candidacyId: string;
  certificationAuthorityId: string;
  userInfo: CandidacyAuditLogUserInfo;
}) => {
  const certificationAuthority =
    await prismaClient.certificationAuthority.findUnique({
      where: { id: certificationAuthorityId },
    });
  if (!certificationAuthority) {
    throw new Error("Certificateur non trouvé");
  }

  const updatedCandidacy = await prismaClient.$transaction(async (tx) => {
    await logCandidacyAuditEvent({
      candidacyId,
      eventType: "CANDIDACY_CERTIFICATION_AUTHORITY_UPDATED",
      details: {
        certificationAuthorityId,
        certificationAuthorityLabel: certificationAuthority?.label,
      },
      ...userInfo,
      tx,
    });

    return updateCandidacyCertificationAuthority({
      candidacyId,
      certificationAuthorityId,
      tx,
    });
  });

  return updatedCandidacy;
};
