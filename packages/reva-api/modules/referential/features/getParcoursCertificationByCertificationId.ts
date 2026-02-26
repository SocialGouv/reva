import { processPaginationInfo } from "@/modules/shared/list/pagination";
import { prismaClient } from "@/prisma/client";

export const getParcoursCertificationByCertificationId = async ({
  certificationId,
  offset,
  limit,
}: {
  certificationId: string;
  offset?: number;
  limit?: number;
}) => {
  const certification = await prismaClient.certification.findUnique({
    where: { id: certificationId },
    include: {
      parcours: {
        skip: offset,
        take: limit,
      },
    },
  });

  const parcours = certification?.parcours || [];

  return {
    rows: parcours,
    info: processPaginationInfo({
      totalRows: parcours.length,
      limit: limit ?? 10,
      offset: offset ?? 0,
    }),
  };
};
