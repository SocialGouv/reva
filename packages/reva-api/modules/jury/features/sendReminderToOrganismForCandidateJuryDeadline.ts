import { endOfDay, startOfDay, sub } from "date-fns";
import { prismaClient } from "../../../prisma/client";
import { sendAlertDeadlineExceededDVToOrganism } from "../../dossier-de-validation/emails";
import { logger } from "../../shared/logger";

export const sendReminderToOrganismForCandidateJuryDeadline = async () => {
  const today = startOfDay(new Date());
  const twoMonthsAgo = endOfDay(sub(today, { months: 2 })).toISOString();
  const dateFeatureHasBeenReleasedInProduction = new Date(
    "2024-02-13T00:00:00.000Z",
  ).toISOString();

  const candidaciesStatus = await prismaClient.candidaciesStatus.findMany({
    where: {
      isActive: true,
      status: "DOSSIER_FAISABILITE_RECEVABLE",
      createdAt: {
        gte: twoMonthsAgo,
        lt: dateFeatureHasBeenReleasedInProduction,
      },
      candidacy: {
        reminderToOrganismDVDeadlineExceededSentAt: null,
        readyForJuryEstimatedAt: null,
      },
    },
    include: {
      candidacy: {
        include: {
          organism: { include: { organismInformationsCommerciales: true } },
        },
      },
    },
  });

  const candidacyIdsToUpdate = [];
  try {
    for (const candidacyStatus of candidaciesStatus) {
      const email =
        candidacyStatus.candidacy.organism?.organismInformationsCommerciales
          ?.emailContact ??
        candidacyStatus.candidacy.organism?.contactAdministrativeEmail;

      if (email) {
        await sendAlertDeadlineExceededDVToOrganism({
          candadicyId: candidacyStatus.candidacyId,
          email,
        });
        candidacyIdsToUpdate.push(candidacyStatus.candidacy.id);
      }
    }
    await prismaClient.candidacy.updateMany({
      where: {
        id: { in: candidacyIdsToUpdate },
      },
      data: {
        reminderToOrganismDVDeadlineExceededSentAt: new Date(),
      },
    });
  } catch (error) {
    logger.error(error);
  }
};
