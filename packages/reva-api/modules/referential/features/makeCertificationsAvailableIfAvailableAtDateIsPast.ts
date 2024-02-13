import { startOfToday } from "date-fns";
import { prismaClient } from "../../../prisma/client";

export const makeCertificationsAvailableIfAvailableAtDateIsPast = () =>
  prismaClient.certification.updateMany({
    where: {
      status: { not: "AVAILABLE" },
      availableAt: { lte: startOfToday() },
      expiresAt: { gt: startOfToday() },
    },
    data: { status: "AVAILABLE" },
  });
