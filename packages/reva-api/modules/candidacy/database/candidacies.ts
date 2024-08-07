import { CandidacyStatusStep } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

export const candidacyIncludes = {
  candidacyStatuses: true,
  organism: true,
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
      },
    }),
  ]);

  return newCandidacy;
};

export const updateCertification = async (params: {
  candidacyId: string;
  certificationId: string;
  departmentId: string;
  author: string;
  feasibilityFormat: "UPLOADED_PDF" | "DEMATERIALIZED";
}) => {
  const department = await prismaClient.department.findFirst({
    where: {
      id: params.departmentId,
    },
  });

  if (!department) {
    throw new Error(`department not found ${params.departmentId}`);
  }

  const [, newCandidacy] = await prismaClient.$transaction([
    prismaClient.candidaciesOnRegionsAndCertifications.updateMany({
      data: {
        isActive: false,
      },
      where: {
        candidacyId: params.candidacyId,
        isActive: true,
      },
    }),
    prismaClient.candidacy.update({
      where: {
        id: params.candidacyId,
      },
      data: {
        department: {
          connect: {
            id: department.id,
          },
        },
        feasibilityFormat: params.feasibilityFormat,
        certificationsAndRegions: {
          create: {
            certificationId: params.certificationId,
            regionId: department.regionId,
            author: params.author,
            isActive: true,
          },
        },
      },
      include: {
        ...candidacyIncludes,
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
