import { startOfToday } from "date-fns";

import { prismaClient } from "@/prisma/client";

export const setCertificationsVisibleOrNotUsingStatusAndAvailabilityDate = () =>
  prismaClient.$transaction([
    prismaClient.certification.updateMany({ data: { visible: false } }),
    prismaClient.certification.updateMany({
      where: {
        status: "VALIDE_PAR_CERTIFICATEUR",
        availableAt: { lte: startOfToday() },
        rncpExpiresAt: { gt: startOfToday() },
      },
      data: { visible: true },
    }),
  ]);
