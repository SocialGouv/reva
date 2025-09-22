import { add, endOfDay, startOfDay } from "date-fns";

import { logger } from "@/modules/shared/logger/logger";
import { prismaClient } from "@/prisma/client";

import { sendJuryScheduledReminderCandidateEmail } from "../emails/sendJuryScheduledReminderCandidateEmail";

export const sendReminderToCandidateWithScheduledJury = async () => {
  const today = startOfDay(new Date());
  const nextTwoWeeks = endOfDay(add(today, { days: 14 }));

  const juries = await prismaClient.jury.findMany({
    where: {
      isActive: true,
      reminderToCandidateWithScheduledJurySendAt: null,
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
        });

        await prismaClient.jury.update({
          where: { id: jury.id },
          data: {
            reminderToCandidateWithScheduledJurySendAt: new Date(),
          },
        });
      }
    } catch (error) {
      logger.error(error);
    }
  }
};
