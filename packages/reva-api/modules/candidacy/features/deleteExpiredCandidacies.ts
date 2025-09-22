import { add, startOfDay } from "date-fns";

import { logger } from "@/modules/shared/logger/logger";
import { prismaClient } from "@/prisma/client";

export const deleteExpiredCandidacies = async () => {
  const today = startOfDay(new Date());
  const prev2MonthesDate = add(today, { months: -2 });

  const candidacies = await prismaClient.candidacy.findMany({
    where: {
      typeAccompagnement: "ACCOMPAGNE",
      status: "PROJET",
      createdAt: { lt: prev2MonthesDate },
    },
    select: {
      id: true,
    },
  });

  const candidacyIds = candidacies.map(({ id }) => id);

  for (const candidacyId of candidacyIds) {
    try {
      await prismaClient.admissibility.delete({ where: { candidacyId } });
    } catch (error) {
      logger.error(error);
    }

    try {
      await prismaClient.examInfo.delete({ where: { candidacyId } });
    } catch (error) {
      logger.error(error);
    }

    try {
      await prismaClient.candidacyDropOut.delete({ where: { candidacyId } });
    } catch (error) {
      logger.error(error);
    }

    try {
      await prismaClient.candidacyLog.deleteMany({ where: { candidacyId } });
    } catch (error) {
      logger.error(error);
    }

    try {
      await prismaClient.candidacy.delete({ where: { id: candidacyId } });
    } catch (error) {
      logger.error(error);
    }
  }
};
