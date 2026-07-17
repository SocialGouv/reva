import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { DOSSIER_FAISABILITE_NON_TROUVE } from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";

import { sendDFFNotificationToCandidateEmail } from "../emails/sendDFFNotificationToCandidateEmail";

export const sendDFFToCandidate = async ({
  dematerializedFeasibilityFileId,
  context,
}: {
  dematerializedFeasibilityFileId: string;
  context: GraphqlContext;
}) => {
  const now = new Date().toISOString();
  await prismaClient.dematerializedFeasibilityFile.update({
    where: { id: dematerializedFeasibilityFileId },
    data: { sentToCandidateAt: now },
  });

  const dff = await prismaClient.dematerializedFeasibilityFile.findUnique({
    where: { id: dematerializedFeasibilityFileId },
    include: {
      feasibility: {
        include: { candidacy: { include: { candidate: true } } },
      },
    },
  });

  if (!dff) {
    throw new Error(DOSSIER_FAISABILITE_NON_TROUVE);
  }

  if (dff?.feasibility?.candidacy?.candidate?.email) {
    await sendDFFNotificationToCandidateEmail({
      email: dff.feasibility.candidacy.candidate.email,
    });
  }

  await logCandidacyAuditEvent({
    candidacyId: dff.feasibility.candidacy.id,
    eventType: "DFF_SENT_TO_CANDIDATE",
    userKeycloakId: context.auth.userInfo?.sub,
    userEmail: context.auth.userInfo?.email,
    userRoles: context.auth.userInfo?.realm_access?.roles || [],
  });

  return "Ok";
};
