import { prismaClient } from "../../../prisma/client";

export const getAdmissibilityByCandidacyId = async ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.admissibility.findUnique({
    where: {
      candidacyId,
    },
  });
