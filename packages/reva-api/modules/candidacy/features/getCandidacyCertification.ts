import { prismaClient } from "../../../prisma/client";

export const getCandidacyCertification = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.certification.findFirst({
    where: {
      candidaciesAndRegions: {
        some: {
          isActive: true,
          candidacyId,
        },
      },
    },
  });
