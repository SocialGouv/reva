import { add, startOfDay } from "date-fns";

import { prismaClient } from "../../../prisma/client";
import { logger } from "../../shared/logger";

export const deleteExpiredCandidacies = async () => {
  const today = startOfDay(new Date());
  const prev2MonthesDate = add(today, { months: -2 });

  const candidacyStatuses = await prismaClient.candidaciesStatus.findMany({
    where: {
      isActive: true,
      status: "PROJET",
      createdAt: { lt: prev2MonthesDate },
      candidacy: { typeAccompagnement: "ACCOMPAGNE" },
    },
  });

  const candidacyIds = candidacyStatuses.map(({ candidacyId }) => candidacyId);

  for (const candidacyId of candidacyIds) {
    try {
      await prismaClient.admissibility.delete({ where: { candidacyId } });
    } catch (_error) {}

    try {
      await prismaClient.examInfo.delete({ where: { candidacyId } });
    } catch (_error) {}

    try {
      await prismaClient.candidacyDropOut.delete({ where: { candidacyId } });
    } catch (_error) {}

    try {
      await prismaClient.candidacyLog.deleteMany({ where: { candidacyId } });
    } catch (_error) {}

    try {
      await prismaClient.candidacy.delete({ where: { id: candidacyId } });
    } catch (error) {
      logger.error(error);
    }
  }
};
