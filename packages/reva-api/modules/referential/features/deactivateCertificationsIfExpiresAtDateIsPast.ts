import { startOfToday } from "date-fns";

import { prismaClient } from "../../../prisma/client";

export const deactivateCertificationsIfExpiresAtDateIsPast = () =>
  prismaClient.certification.updateMany({
    where: {
      visible: true,
      expiresAt: { lte: startOfToday() },
    },
    data: { status: "INACTIVE", visible: false },
  });
