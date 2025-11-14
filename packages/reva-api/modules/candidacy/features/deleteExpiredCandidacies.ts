import { add, startOfDay } from "date-fns";

import { processInBatches } from "@/modules/shared/batch/processInBatches";
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

  await processInBatches({
    items: candidacyIds,
    handler: async (batch) => {
      try {
        // Cascade delete will automatically remove related records:
        // admissibility, examInfo, candidacyDropOut, candidacyLog, etc.
        await prismaClient.candidacy.deleteMany({
          where: {
            id: {
              in: batch,
            },
          },
        });
      } catch (error) {
        logger.error(error, `Failed to delete candidacy batch`);
      }
    },
  });
};
