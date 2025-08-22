import { subMonths } from "date-fns";

import { logger } from "@/modules/shared/logger/logger";
import { prismaClient } from "@/prisma/client";

import { sendAutoCandidacyDropOutConfirmationEmailToAap } from "../emails/sendAutoCandidacyDropOutConfirmationEmailToAap";
import { sendAutoCandidacyDropOutConfirmationEmailToCandidate } from "../emails/sendAutoCandidacyDropOutConfirmationEmailToCandidate";

export const sendAutoCandidacyDropOutConfirmationEmails = async () => {
  const candidacyDropOutsToSendEmailsFor =
    await prismaClient.candidacyDropOut.findMany({
      where: {
        dropOutConfirmedByCandidate: false,
        proofReceivedByAdmin: false,
        autoDropOutConfirmationEmailsSent: false,
        createdAt: { lt: subMonths(new Date(), 4) },
      },
      include: {
        candidacy: {
          include: {
            organism: true,
            candidate: true,
          },
        },
      },
    });

  for (const dropOut of candidacyDropOutsToSendEmailsFor) {
    try {
      const aapEmail =
        dropOut.candidacy?.organism?.emailContact ||
        dropOut.candidacy?.organism?.contactAdministrativeEmail;

      const aapLabel =
        dropOut.candidacy.organism?.nomPublic ||
        dropOut.candidacy.organism?.label;

      const candidateFullName =
        dropOut.candidacy.candidate?.firstname +
        " " +
        dropOut.candidacy.candidate?.lastname;

      if (aapEmail && aapLabel) {
        await sendAutoCandidacyDropOutConfirmationEmailToAap({
          aapEmail,
          aapLabel,
          candidateFullName,
        });
      }

      const candidateEmail = dropOut.candidacy.candidate?.email;
      if (candidateEmail) {
        await sendAutoCandidacyDropOutConfirmationEmailToCandidate({
          candidateEmail,
          candidateFullName,
        });
      }
    } catch (e) {
      logger.error(
        e,
        `Erreur pendant l'envoi des emails de confirmation d'abandon automatique pour la candidature ${dropOut.candidacyId}`,
      );
    }
  }

  await prismaClient.candidacyDropOut.updateMany({
    where: {
      candidacyId: {
        in: candidacyDropOutsToSendEmailsFor.map((c) => c.candidacyId),
      },
    },
    data: { autoDropOutConfirmationEmailsSent: true },
  });
};
