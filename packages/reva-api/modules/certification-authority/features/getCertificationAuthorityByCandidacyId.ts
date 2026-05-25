import { prismaClient } from "@/prisma/client";

export const getCertificationAuthorityByCandidacyId = async ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.candidacy
    .findUnique({
      where: { id: candidacyId },
    })
    .certificationAuthority();
