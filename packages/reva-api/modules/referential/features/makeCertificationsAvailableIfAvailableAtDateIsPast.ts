import { startOfToday } from "date-fns";

import { prismaClient } from "../../../prisma/client";

export const makeCertificationsAvailableIfAvailableAtDateIsPast = () =>
  prismaClient.certification.updateMany({
    where: {
      visible: false,
      status: "VALIDE_PAR_CERTIFICATEUR",
      availableAt: { lte: startOfToday() },
      expiresAt: { gt: startOfToday() },
    },
    data: { visible: true },
  });
