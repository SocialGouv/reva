import { prismaClient } from "../../../prisma/client";
import { startOfDay, endOfDay, add } from "date-fns";
import { sendJuryScheduledReminderCandidateEmail } from "../emails/sendJuryScheduledReminderCandidateEmail";
import { logger } from "../../shared/logger";

export const sendReminderToCandidateWithScheduledJury = async () => {
  const today = startOfDay(new Date());
  const nextTwoWeeks = endOfDay(add(today, { days: 14 }));

  const juries = await prismaClient.jury.findMany({
    where: {
      isActive: true,
      reminderSendAt: null,
      result: null,
      dateOfSession: { gte: today, lte: nextTwoWeeks },
    },
    include: {
      candidacy: {
        include: {
          candidate: true,
        },
      },
    },
  });

  for (const jury of juries) {
    try {
      if (jury.candidacy.candidate?.email) {
        await sendJuryScheduledReminderCandidateEmail({
          email: jury.candidacy.candidate?.email,
          dateOfSession: jury.dateOfSession,
          timeOfSession: jury.timeOfSession || undefined,
          addressOfSession: jury.addressOfSession || undefined,
        });

        await prismaClient.jury.update({
          where: { id: jury.id },
          data: {
            reminderSendAt: new Date(),
          },
        });
      }
    } catch (error) {
      logger.error(error);
    }
  }
};
