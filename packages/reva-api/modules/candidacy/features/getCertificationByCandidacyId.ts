import { prismaClient } from "../../../prisma/client";

export const getCertificationByCandidacyId = async ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.candidaciesOnRegionsAndCertifications
    .findFirst({
      where: { candidacyId, isActive: true },
    })
    .certification();
