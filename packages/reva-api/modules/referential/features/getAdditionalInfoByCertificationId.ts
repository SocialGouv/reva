import { prismaClient } from "../../../prisma/client";

export const getAdditionalInfoByCertificationId = ({
  certificationId,
}: {
  certificationId: string;
}) =>
  prismaClient.certification
    .findUnique({
      where: { id: certificationId },
    })
    .additionalInfo();
