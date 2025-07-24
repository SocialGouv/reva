import { prismaClient } from "@/prisma/client";

export const getCertificationById = ({
  certificationId,
}: {
  certificationId: string | null;
}) =>
  certificationId
    ? prismaClient.certification.findUnique({
        where: { id: certificationId },
      })
    : null;
