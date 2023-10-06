import { prismaClient } from "../../../prisma/client";

export const getCertificationById = ({
  certificationId,
}: {
  certificationId: string;
}) =>
  prismaClient.certification.findFirstOrThrow({
    where: { id: certificationId },
  });
