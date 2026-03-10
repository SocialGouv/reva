import { prismaClient } from "@/prisma/client";

export const getCertificationWithReducedRequirementsById = ({
  certificationId,
}: {
  certificationId: string | null;
}) =>
  certificationId
    ? prismaClient.certification.findUnique({
        where: { id: certificationId },
        include: {
          certificationAuthorityStructure: {
            select: {
              hasReducedRequirements: true,
            },
          },
        },
      })
    : null;
