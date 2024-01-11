import { CandidacyStatusStep } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

export const existsCandidacyWithActiveStatus = async ({
  candidacyId,
  status,
}: {
  candidacyId: string;
  status?: CandidacyStatusStep;
}): Promise<boolean | string> => {
  const candidacies = await prismaClient.candidacy.count({
    where: {
      id: candidacyId,
      candidacyStatuses: {
        some: {
          status,
          isActive: true,
        },
      },
    },
  });

  return candidacies === 1;
};
