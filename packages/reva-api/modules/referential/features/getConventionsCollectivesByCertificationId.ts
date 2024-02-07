import { prismaClient } from "../../../prisma/client";

export const getConventionsCollectivesByCertificationId = ({
  certificationId,
}: {
  certificationId: string;
}) =>
  prismaClient.conventionCollective.findMany({
    where: {
      certificationOnConventionCollective: { some: { certificationId } },
    },
  });
