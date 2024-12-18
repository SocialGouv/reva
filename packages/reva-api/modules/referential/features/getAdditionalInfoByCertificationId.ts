import { prismaClient } from "../../../prisma/client";

export const getAdditionalInfoByCertificationId = ({
  certificationId,
}: {
  certificationId: string;
}) =>
  prismaClient.certificationAdditionalInfo.findUnique({
    where: {
      certificationId,
    },
  });
