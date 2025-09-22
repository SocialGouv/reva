import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { prismaClient } from "@/prisma/client";

import { DematerializedFeasibilityFileCreateOrUpdateCandidateDecisionInput } from "../dematerialized-feasibility-file.types";
import { sendFeasibilityConfirmedByCandidateWithoutSwornAttestmentToAAP } from "../emails/sendFeasibilityConfirmedByCandidateWithoutSwornAttestmentToAAP.email";
import { sendFeasibilityConfirmedByCandidateWithSwornAttestmentToAAP } from "../emails/sendFeasibilityConfirmedByCandidateWithSwornAttestmentToAAP.email";

export const confirmDematerializedFeasibilityFileByCandidate = async ({
  dematerializedFeasibilityFileId,
  input,
  context,
}: {
  dematerializedFeasibilityFileId: string;
  input: DematerializedFeasibilityFileCreateOrUpdateCandidateDecisionInput;
  context: GraphqlContext;
}) => {
  const dff = await prismaClient.dematerializedFeasibilityFile.update({
    where: { id: dematerializedFeasibilityFileId },
    data: {
      candidateConfirmationAt: new Date().toISOString(),
      candidateDecisionComment: input.candidateDecisionComment,
    },
    include: {
      feasibility: {
        select: {
          candidacy: {
            select: {
              id: true,
              organism: {
                select: {
                  emailContact: true,
                  contactAdministrativeEmail: true,
                  nomPublic: true,
                },
              },
              candidate: {
                select: {
                  firstname: true,
                  lastname: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const aapName = dff.feasibility.candidacy?.organism?.nomPublic;
  const candidateName = `${dff.feasibility.candidacy?.candidate?.firstname} ${dff.feasibility.candidacy?.candidate?.lastname}`;
  const aapEmail =
    dff.feasibility.candidacy?.organism?.emailContact ??
    dff.feasibility.candidacy?.organism?.contactAdministrativeEmail;

  if (aapName && candidateName && aapEmail) {
    if (dff.swornStatementFileId) {
      await sendFeasibilityConfirmedByCandidateWithSwornAttestmentToAAP({
        aapEmail,
        aapName,
        candidateName,
      });
    } else {
      await sendFeasibilityConfirmedByCandidateWithoutSwornAttestmentToAAP({
        aapEmail,
        aapName,
        candidateName,
      });
    }
  }

  await logCandidacyAuditEvent({
    candidacyId: dff.feasibility.candidacy.id,
    eventType: "DFF_VALIDATED_BY_CANDIDATE",
    userKeycloakId: context.auth.userInfo?.sub,
    userEmail: context.auth.userInfo?.email,
    userRoles: context.auth.userInfo?.realm_access?.roles || [],
  });

  return dff;
};
