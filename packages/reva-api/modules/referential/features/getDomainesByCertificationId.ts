import { prismaClient } from "../../../prisma/client";

export const getDomainesByCertificationId = ({
  certificationId,
}: {
  certificationId: string;
}) =>
  prismaClient.domaine.findMany({
    where: { certificationOnDomaine: { some: { certificationId } } },
  });
