import { CandidacyStatusStep } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

export const candidacyIncludes = {
  candidacyDropOut: {
    include: {
      dropOutReason: true,
    },
  },
  reorientationReason: true,
  ccn: true,
};

export const getCandidaciesFromIds = async (candidacyIds: string[]) => {
  const candidacies = await prismaClient.candidacy.findMany({
    where: {
      id: { in: candidacyIds },
    },
    include: {
      ...candidacyIncludes,
    },
  });

  return candidacies;
};

export const updateCandidacyStatus = async (params: {
  candidacyId: string;
  status: CandidacyStatusStep;
}) => {
  const [, newCandidacy] = await prismaClient.$transaction([
    prismaClient.candidaciesStatus.updateMany({
      where: {
        candidacyId: params.candidacyId,
      },
      data: {
        isActive: false,
      },
    }),
    prismaClient.candidacy.update({
      where: {
        id: params.candidacyId,
      },
      data: {
        candidacyStatuses: {
          create: {
            status: params.status,
            isActive: true,
          },
        },
      },
      include: {
        ...candidacyIncludes,
        certificationsAndRegions: { include: { certification: true } },
      },
    }),
  ]);

  return newCandidacy;
};

export const updateOrganism = async (params: {
  candidacyId: string;
  organismId: string | null;
}) => {
  const newCandidacy = await prismaClient.candidacy.update({
    where: {
      id: params.candidacyId,
    },
    data: {
      organismId: params.organismId,
    },
    include: {
      ...candidacyIncludes,
    },
  });

  return newCandidacy;
};
