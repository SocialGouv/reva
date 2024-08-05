import { CandidacyStatusStep } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import * as domain from "../candidacy.types";

export const candidacyIncludes = {
  experiences: true,
  candidacyStatuses: true,
  department: true,
  certificationsAndRegions: {
    select: {
      certification: true,
      region: true,
    },
    where: {
      isActive: true,
    },
  },
  organism: true,
  basicSkills: {
    select: {
      basicSkill: true,
    },
  },
  trainings: {
    select: {
      training: true,
    },
  },
  candidacyDropOut: {
    include: {
      dropOutReason: true,
    },
  },
  reorientationReason: true,
  ccn: true,
};

export const getCandidaciesFromIds = async (
  candidacyIds: string[],
): Promise<domain.Candidacy[]> => {
  const candidacies = await prismaClient.candidacy.findMany({
    where: {
      id: { in: candidacyIds },
    },
    include: {
      ...candidacyIncludes,
      candidate: {
        include: {
          highestDegree: true,
          vulnerabilityIndicator: true,
        },
      },
    },
  });

  return candidacies.map((c) => {
    const certificationAndRegion = c.certificationsAndRegions?.[0];
    return {
      ...c,
      firstname: c.candidate?.firstname,
      lastname: c.candidate?.lastname,
      phone: c.candidate?.phone || null,
      email: c.candidate?.email || c.email,
      regionId: certificationAndRegion?.region.id,
      region: certificationAndRegion?.region,
      certificationId: certificationAndRegion?.certification.id,
      certification: certificationAndRegion && {
        ...certificationAndRegion?.certification,
        codeRncp: certificationAndRegion?.certification.rncpId,
      },
    };
  });
};

export const existsCandidacyWithActiveStatus = async (params: {
  candidacyId: string;
  status: CandidacyStatusStep;
}) => {
  const candidaciesCount = await prismaClient.candidacy.count({
    where: {
      id: params.candidacyId,
      candidacyStatuses: {
        some: {
          status: params.status,
          isActive: true,
        },
      },
    },
  });

  return candidaciesCount === 1;
};

export const updateCandidacyStatus = async (params: {
  candidacyId: string;
  status: CandidacyStatusStep;
}) => {
  const [, newCandidacy, certificationAndRegion] =
    await prismaClient.$transaction([
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
          candidate: true,
        },
      }),
      prismaClient.candidaciesOnRegionsAndCertifications.findFirst({
        where: {
          candidacyId: params.candidacyId,
          isActive: true,
        },
        include: {
          certification: true,
          region: true,
        },
      }),
    ]);

  return {
    id: newCandidacy.id,
    regionId: certificationAndRegion?.region.id,
    region: certificationAndRegion?.region,
    department: newCandidacy.department,
    certificationId: certificationAndRegion?.certificationId,
    certification: {
      ...certificationAndRegion?.certification,
      codeRncp: certificationAndRegion?.certification.rncpId,
    },
    organismId: newCandidacy.organismId,
    experiences: newCandidacy.experiences,
    phone: newCandidacy.candidate?.phone || null,
    email: newCandidacy.candidate?.email || newCandidacy.email,
    candidacyStatuses: newCandidacy.candidacyStatuses,
    candidacyDropOut: newCandidacy.candidacyDropOut,
    createdAt: newCandidacy.createdAt,
    financeModule: newCandidacy.financeModule,
  };
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

  const [, newCandidacy, certificationAndRegion] =
    await prismaClient.$transaction([
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
          candidate: true,
        },
      }),

      prismaClient.candidaciesOnRegionsAndCertifications.findFirst({
        where: {
          candidacyId: params.candidacyId,
          isActive: true,
        },
        select: {
          certification: true,
          region: true,
        },
      }),
    ]);

  return {
    id: newCandidacy.id,
    regionId: certificationAndRegion?.region.id,
    region: certificationAndRegion?.region,
    department: newCandidacy.department,
    certificationId: certificationAndRegion?.certification.id,
    certification: certificationAndRegion?.certification,
    organismId: newCandidacy.organismId,
    experiences: newCandidacy.experiences,
    phone: newCandidacy.candidate?.phone || null,
    email: newCandidacy.candidate?.email || newCandidacy.email,
    candidacyStatuses: newCandidacy.candidacyStatuses,
    candidacyDropOut: newCandidacy.candidacyDropOut,
    createdAt: newCandidacy.createdAt,
  };
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
      candidate: true,
    },
  });

  const certificationAndRegion =
    await prismaClient.candidaciesOnRegionsAndCertifications.findFirst({
      where: {
        candidacyId: params.candidacyId,
        isActive: true,
      },
      select: {
        certification: true,
        region: true,
      },
    });

  return {
    id: newCandidacy.id,
    regionId: certificationAndRegion?.region.id,
    region: certificationAndRegion?.region,
    department: newCandidacy.department,
    certificationId: certificationAndRegion?.certification.id,
    certification: certificationAndRegion?.certification,
    organismId: newCandidacy.organismId,
    experiences: newCandidacy.experiences,
    phone: newCandidacy.candidate?.phone || null,
    email: newCandidacy.candidate?.email || newCandidacy.email,
    candidacyStatuses: newCandidacy.candidacyStatuses,
    candidacyDropOut: newCandidacy.candidacyDropOut,
    createdAt: newCandidacy.createdAt,
  };
};
