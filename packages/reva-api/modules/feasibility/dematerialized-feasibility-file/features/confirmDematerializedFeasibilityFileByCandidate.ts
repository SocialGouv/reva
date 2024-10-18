import { prismaClient } from "../../../../prisma/client";

import { DematerializedFeasibilityFileCreateOrUpdateCandidateDecisionInput } from "../dematerialized-feasibility-file.types";
import {
  sendFeasibilityConfirmedByCandidateWithSwornAttestmentToAAP,
  sendFeasibilityConfirmedByCandidateWithoutSwornAttestmentToAAP,
} from "../emails";

export const confirmDematerializedFeasibilityFileByCandidate = async ({
  dematerializedFeasibilityFileId,
  input,
}: {
  dematerializedFeasibilityFileId: string;
  input: DematerializedFeasibilityFileCreateOrUpdateCandidateDecisionInput;
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
              organism: {
                select: {
                  organismInformationsCommerciales: {
                    select: {
                      nom: true,
                    },
                  },
                  contactAdministrativeEmail: true,
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

  const aapName =
    dff.feasibility.candidacy?.organism?.organismInformationsCommerciales?.nom;
  const candidateName = `${dff.feasibility.candidacy?.candidate?.firstname} ${dff.feasibility.candidacy?.candidate?.lastname}`;
  const aapEmail =
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

  return dff;
};
