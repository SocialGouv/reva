import { prismaClient } from "@/prisma/client";

export const getCandidacyCandidateInfoByCandidacyId = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.candidacyCandidateInfo.findUnique({
    where: { candidacyId },
  });
