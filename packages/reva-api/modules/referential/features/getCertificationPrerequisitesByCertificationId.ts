import { prismaClient } from "../../../prisma/client";

export const getCertificationPrerequisitesByCertificationId = async ({
  certificationId,
}: {
  certificationId: string;
}) =>
  prismaClient.certificationPrerequisite.findMany({
    where: { certificationId },
  });
