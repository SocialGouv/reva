import { prismaClient } from "../../../prisma/client";

export const getDomainesByCertificationId = async ({
  certificationId,
}: {
  certificationId: string;
}) =>
  prismaClient.certification
    .findUnique({ where: { id: certificationId } })
    .certificationOnDomaine({ include: { domaine: true } })
    .then((cods) => cods?.map((cod) => cod.domaine));
