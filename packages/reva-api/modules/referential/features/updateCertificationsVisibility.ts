import { Prisma, PrismaClient } from "@prisma/client";
import { startOfToday } from "date-fns";

type PrismaTransactionClient = PrismaClient | Prisma.TransactionClient;

export const updateCertificationsVisibility = async (
  certificationIds: string[],
  prismaTransactionClient: PrismaTransactionClient,
) => {
  if (!certificationIds.length) {
    return;
  }

  await prismaTransactionClient.certification.updateMany({
    where: { id: { in: certificationIds } },
    data: { visible: false },
  });

  await prismaTransactionClient.certification.updateMany({
    where: {
      id: { in: certificationIds },
      status: "VALIDE_PAR_CERTIFICATEUR",
      availableAt: { lte: startOfToday() },
      rncpExpiresAt: { gte: startOfToday() },
      certificationAuthorityOnCertification: { some: {} },
    },
    data: { visible: true },
  });
};
