import { prismaClient } from "../../../prisma/client";

export const getAdmissibilityFvae = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.admissibilityFvae.findUnique({
    where: {
      candidacyId,
    },
  });
