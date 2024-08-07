import { prismaClient } from "../../../prisma/client";

export const getRegionByCandidacyId = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.candidaciesOnRegionsAndCertifications
    .findUnique({
      where: { id: candidacyId, isActive: true },
    })
    .region();
