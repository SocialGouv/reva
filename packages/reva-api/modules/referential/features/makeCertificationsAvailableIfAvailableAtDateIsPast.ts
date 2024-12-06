import { startOfToday } from "date-fns";

import { prismaClient } from "../../../prisma/client";

export const makeCertificationsAvailableIfAvailableAtDateIsPast = () =>
  prismaClient.certification.updateMany({
    where: {
      visible: false,
      statusV2: "VALIDE_PAR_CERTIFICATEUR",
      availableAt: { lte: startOfToday() },
      expiresAt: { gt: startOfToday() },
    },
    data: { status: "AVAILABLE", visible: true },
  });
