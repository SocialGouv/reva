import { prismaClient } from "../../../prisma/client";

export const getCertificationByCandidacyId = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.candidaciesOnRegionsAndCertifications
    .findUnique({
      where: { id: candidacyId, isActive: true },
    })
    .certification();
