import { startOfToday } from "date-fns";
import { prismaClient } from "../../../prisma/client";

export const deactivateCertificationsIfExpiresAtDateIsPast = () =>
  prismaClient.certification.updateMany({
    where: {
      status: "AVAILABLE",
      expiresAt: { lte: startOfToday() },
    },
    data: { status: "INACTIVE" },
  });
