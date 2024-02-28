import { endOfDay, startOfDay, sub } from "date-fns";
import { prismaClient } from "../../../prisma/client";
import { logger } from "../../shared/logger";
import { sendAlertDeadlineExceededDVToOrganism } from "../emails";

export const sendReminderToOrganismForCandidateValidationDeadline =
  async () => {
    const today = startOfDay(new Date());
    const twoMonthsAgo = endOfDay(sub(today, { months: 2 })).toISOString();
    const dateFeatureHasBeenReleasedInProduction =
      process.env.FEATURE_RELEASED_DATE_DV ??
      new Date("2024-02-13T00:00:00.000Z").toISOString();

    const candidaciesStatus = await prismaClient.candidaciesStatus.findMany({
      where: {
        isActive: true,
        status: "DOSSIER_FAISABILITE_RECEVABLE",
        createdAt: {
          lte: twoMonthsAgo,
          gte: dateFeatureHasBeenReleasedInProduction,
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
