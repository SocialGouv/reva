import { prismaClient } from "@/prisma/client";

export const getConventionsCollectivesByCertificationId = ({
  certificationId,
}: {
  certificationId: string;
}) =>
  prismaClient.certification
    .findUnique({ where: { id: certificationId } })
    .certificationOnConventionCollective({ include: { ccn: true } })
    .then((coccns) => coccns?.map((coccn) => coccn.ccn));
