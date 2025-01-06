import { subMonths } from "date-fns";
import { prismaClient } from "../../../prisma/client";
import { sendAutoCandidacyDropOutConfirmationEmailToAap } from "../mails/sendAutoCandidacyDropOutConfirmationEmailToAap";
import { logger } from "../../shared/logger/logger";

export const sendAutoCandidacyDropOutConfirmationEmails = async () => {
  const candidacyDropOutsToSendEmailsFor =
    await prismaClient.candidacyDropOut.findMany({
      where: {
        dropOutConfirmedByCandidate: false,
        proofReceivedByAdmin: false,
        autoDropOutConfirmationEmailsSent: false,
        createdAt: { lt: subMonths(new Date(), 6) },
      },
      include: {
        candidacy: {
          include: {
            organism: { include: { organismInformationsCommerciales: true } },
            candidate: true,
          },
        },
      },
    });

  for (const dropOut of candidacyDropOutsToSendEmailsFor) {
    try {
      const aapEmail =
        dropOut.candidacy?.organism?.organismInformationsCommerciales
          ?.emailContact ||
        dropOut.candidacy?.organism?.contactAdministrativeEmail;

      const aapLabel =
        dropOut.candidacy.organism?.organismInformationsCommerciales?.nom ||
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
    } catch (e) {
      logger.error(
        `Erreur pendant l'envoi des emails de confirmation d'abandon automatique pour la candidature ${dropOut.candidacyId}`,
        e,
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
