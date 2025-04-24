import { prismaClient } from "../../../prisma/client";

export const getCandidacyOnCandidacyFinancingMethodsByCandidacyId = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.candidacy
    .findUnique({ where: { id: candidacyId } })
    .candidacyOnCandidacyFinancingMethod({
      orderBy: {
        candidacyFinancingMethod: { order: "asc" },
      },
    });
