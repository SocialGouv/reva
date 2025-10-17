import { subHours } from "date-fns";

import { prismaClient } from "@/prisma/client";

import { sendFeasibilityConfirmedByCandidateWithoutSwornAttestmentToAAP } from "../emails/sendFeasibilityConfirmedByCandidateWithoutSwornAttestmentToAAP.email";

export const sendReminderToAAPForMissingSwornStatement = async () => {
  const twentyFourHoursAgo = subHours(new Date(), 24);
  const candidacies = await prismaClient.candidacy.findMany({
    where: {
      typeAccompagnement: "ACCOMPAGNE",
      feasibilityFormat: "DEMATERIALIZED",
      Feasibility: {
        some: {
          isActive: true,
          dematerializedFeasibilityFile: {
            candidateConfirmationAt: {
              lt: twentyFourHoursAgo,
            },
            swornStatementFileId: null,
          },
        },
      },
      CandidacyEmail: {
        none: {
          emailType: "REMINDER_TO_AAP_FOR_MISSING_SWORN_STATEMENT",
        },
      },
    },
    select: {
      id: true,
      organism: {
        select: {
          emailContact: true,
          contactAdministrativeEmail: true,
          nomPublic: true,
          label: true,
        },
      },
      candidate: {
        select: {
          firstname: true,
          lastname: true,
        },
      },
    },
  });

  for (const candidacy of candidacies) {
    const candidateName = `${candidacy.candidate?.firstname} ${candidacy.candidate?.lastname}`;
    const aapEmail =
      candidacy.organism?.emailContact ||
      candidacy.organism?.contactAdministrativeEmail;
    const aapName = candidacy.organism?.nomPublic || candidacy.organism?.label;

    if (aapEmail && aapName) {
      await sendFeasibilityConfirmedByCandidateWithoutSwornAttestmentToAAP({
        aapEmail,
        aapName,
        candidateName,
      });

      await prismaClient.candidacyEmail.create({
        data: {
          candidacyId: candidacy.id,
          emailType: "REMINDER_TO_AAP_FOR_MISSING_SWORN_STATEMENT",
        },
      });
    }
  }
};
