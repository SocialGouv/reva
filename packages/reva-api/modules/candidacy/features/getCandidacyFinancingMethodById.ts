import { prismaClient } from "@/prisma/client";

export const getCandidacyFinancingMethodById = ({
  candidacyFinancingMethodId,
}: {
  candidacyFinancingMethodId: string;
}) =>
  prismaClient.candidacyFinancingMethod.findUnique({
    where: { id: candidacyFinancingMethodId },
  });
