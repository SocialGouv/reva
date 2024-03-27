import { CandidacyStatusStep } from "@prisma/client";
import { Either, Left, Maybe, Right } from "purify-ts";

import { prismaClient } from "../../../prisma/client";
import { logger } from "../../shared/logger";
import * as domain from "../candidacy.types";
import { toDomainExperiences } from "./experiences";

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

export const getCandidacyFromId = async (
  candidacyId: string,
): Promise<Either<string, domain.Candidacy>> => {
  try {
    const candidacy = await prismaClient.candidacy.findUnique({
      where: {
        id: candidacyId,
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

    const certificationAndRegion =
      await prismaClient.candidaciesOnRegionsAndCertifications.findFirst({
        where: {
          candidacyId: candidacy?.id,
          isActive: true,
        },
        include: {
          certification: true,
          region: true,
        },
      });

    return Maybe.fromNullable(candidacy)
      .map((c) => ({
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
        ccnId: c.ccnId || null,
        conventionCollective: c.ccn || null,
      }))
      .toEither(`Candidacy ${candidacyId} not found`);
  } catch (e) {
    logger.error(e);
    return Left(
      `error while retrieving the candidacy with id ${candidacyId} : ${
        (e as Error).message
      }`,
    );
  }
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

export const existsCandidacyHavingHadStatus = async (params: {
  candidacyId: string;
  status: CandidacyStatusStep;
}) => {
  try {
    const candidaciesCount = await prismaClient.candidacy.count({
      where: {
        id: params.candidacyId,
        candidacyStatuses: {
          some: {
            status: params.status,
          },
        },
      },
    });

    return Right(candidaciesCount === 1);
  } catch (e) {
    logger.error(e);
    return Left(
      `error while retrieving the candidacy with id ${params.candidacyId}`,
    );
  }
};

export const existsCandidacyWithActiveStatus = async (params: {
  candidacyId: string;
  status: CandidacyStatusStep;
}) => {
  try {
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

    return Right(candidaciesCount === 1);
  } catch (e) {
    logger.error(e);
    return Left(
      `error while retrieving the candidacy with id ${params.candidacyId}`,
    );
  }
};

export const existsCandidacyWithActiveStatuses = async (params: {
  candidacyId: string;
  statuses: CandidacyStatusStep[];
}) => {
  try {
    const candidaciesCount = await prismaClient.candidacy.count({
      where: {
        id: params.candidacyId,
        candidacyStatuses: {
          some: {
            status: {
              in: params.statuses,
            },
            isActive: true,
          },
        },
      },
    });

    return candidaciesCount === 1;
  } catch (e) {
    logger.error(e);
    throw new Error(
      `error while retrieving the candidacy with id ${params.candidacyId}`,
    );
  }
};

export const updateCandidacyStatus = async (params: {
  candidacyId: string;
  status: CandidacyStatusStep;
}): Promise<Either<string, domain.Candidacy>> => {
  try {
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

    return Right({
      id: newCandidacy.id,
      deviceId: newCandidacy.deviceId,
      regionId: certificationAndRegion?.region.id,
      region: certificationAndRegion?.region,
      department: newCandidacy.department,
      certificationId: certificationAndRegion?.certificationId,
      certification: {
        ...certificationAndRegion?.certification,
        codeRncp: certificationAndRegion?.certification.rncpId,
      },
      organismId: newCandidacy.organismId,
      experiences: toDomainExperiences(newCandidacy.experiences),
      phone: newCandidacy.candidate?.phone || null,
      email: newCandidacy.candidate?.email || newCandidacy.email,
      candidacyStatuses: newCandidacy.candidacyStatuses,
      candidacyDropOut: newCandidacy.candidacyDropOut,
      createdAt: newCandidacy.createdAt,
    });
  } catch (e) {
    logger.error(e);
    return Left(
      `error while updating status on candidacy ${params.candidacyId}`,
    );
  }
};

export const archiveCandidacy = async (params: {
  candidacyId: string;
  reorientationReasonId: string | null;
}): Promise<Either<string, domain.Candidacy>> => {
  try {
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
                status: "ARCHIVE",
                isActive: true,
              },
            },
            reorientationReasonId: params.reorientationReasonId,
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

    return Right({
      id: newCandidacy.id,
      deviceId: newCandidacy.deviceId,
      regionId: certificationAndRegion?.region.id,
      region: certificationAndRegion?.region,
      department: newCandidacy.department,
      certificationId: certificationAndRegion?.certificationId,
      certification: {
        ...certificationAndRegion?.certification,
        codeRncp: certificationAndRegion?.certification.rncpId,
      },
      organismId: newCandidacy.organismId,
      experiences: toDomainExperiences(newCandidacy.experiences),
      phone: newCandidacy.candidate?.phone || null,
      email: newCandidacy.candidate?.email || newCandidacy.email,
      candidacyStatuses: newCandidacy.candidacyStatuses,
      candidacyDropOut: newCandidacy.candidacyDropOut,
      createdAt: newCandidacy.createdAt,
    });
  } catch (e) {
    logger.error(e);
    return Left(
      `error while updating status on candidacy ${params.candidacyId}`,
    );
  }
};

export const unarchiveCandidacy = async (params: {
  candidacyId: string;
}): Promise<Either<string, domain.Candidacy>> => {
  try {
    const latestStatusBeforeArchive =
      await prismaClient.candidaciesStatus.findFirst({
        where: {
          candidacyId: params.candidacyId,
          status: { not: CandidacyStatusStep.ARCHIVE },
        },
        select: {
          status: true,
        },
        orderBy: [{ createdAt: "desc" }],
      });
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
                ...latestStatusBeforeArchive,
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

    return Right({
      id: newCandidacy.id,
      deviceId: newCandidacy.deviceId,
      regionId: certificationAndRegion?.region.id,
      region: certificationAndRegion?.region,
      department: newCandidacy.department,
      certificationId: certificationAndRegion?.certificationId,
      certification: {
        ...certificationAndRegion?.certification,
        codeRncp: certificationAndRegion?.certification.rncpId,
      },
      organismId: newCandidacy.organismId,
      experiences: toDomainExperiences(newCandidacy.experiences),
      phone: newCandidacy.candidate?.phone || null,
      email: newCandidacy.candidate?.email || newCandidacy.email,
      candidacyStatuses: newCandidacy.candidacyStatuses,
      candidacyDropOut: newCandidacy.candidacyDropOut,
      createdAt: newCandidacy.createdAt,
    });
  } catch (e) {
    logger.error(e);
    return Left(
      `error while updating status on candidacy ${params.candidacyId}`,
    );
  }
};

export const updateCertification = async (params: {
  candidacyId: string;
  certificationId: string;
  departmentId: string;
  author: string;
}) => {
  try {
    const department = await prismaClient.department.findFirst({
      where: {
        id: params.departmentId,
      },
    });

    if (!department) {
      return Left(`department not found ${params.departmentId}`);
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

    return Right({
      id: newCandidacy.id,
      deviceId: newCandidacy.deviceId,
      regionId: certificationAndRegion?.region.id,
      region: certificationAndRegion?.region,
      department: newCandidacy.department,
      certificationId: certificationAndRegion?.certification.id,
      certification: certificationAndRegion?.certification,
      organismId: newCandidacy.organismId,
      experiences: toDomainExperiences(newCandidacy.experiences),
      phone: newCandidacy.candidate?.phone || null,
      email: newCandidacy.candidate?.email || newCandidacy.email,
      candidacyStatuses: newCandidacy.candidacyStatuses,
      candidacyDropOut: newCandidacy.candidacyDropOut,
      createdAt: newCandidacy.createdAt,
    });
  } catch (e) {
    logger.error(e);
    return Left(
      `error while updating certification on candidacy ${params.candidacyId}`,
    );
  }
};

export const deleteCandidacyFromId = async (id: string) => {
  try {
    const { count } = await prismaClient.candidacy.deleteMany({
      where: {
        id: id,
        candidacyStatuses: {
          some: {
            status: "ARCHIVE",
            isActive: true,
          },
        },
      },
    });

    if (count === 0) {
      return Right(`Candidature non trouvée.`);
    } else {
      return Right(`Candidature supprimée `);
    }
  } catch (e) {
    logger.error(e);
    return Left(`Candidature non supprimée, ${(e as any).message}`);
  }
};

export const updateAppointmentInformations = async (params: {
  candidacyId: string;
  appointmentInformations: {
    firstAppointmentOccuredAt: Date;
  };
}) => {
  try {
    const candidacy = await prismaClient.candidacy.update({
      where: {
        id: params.candidacyId,
      },
      data: {
        firstAppointmentOccuredAt:
          params.appointmentInformations.firstAppointmentOccuredAt,
      },
      include: {
        ...candidacyIncludes,
        candidate: true,
      },
    });

    const candidaciesOnRegionsAndCertifications =
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

    return Right({
      id: candidacy.id,
      deviceId: candidacy.deviceId,
      regionId: candidaciesOnRegionsAndCertifications?.region.id,
      region: candidaciesOnRegionsAndCertifications?.region,
      department: candidacy.department,
      certificationId: candidaciesOnRegionsAndCertifications?.certification.id,
      certification: candidaciesOnRegionsAndCertifications?.certification,
      organismId: candidacy.organismId,
      experiences: toDomainExperiences(candidacy.experiences),
      phone: candidacy.candidate?.phone || null,
      email: candidacy.candidate?.email || candidacy.email,
      typology: candidacy.typology,
      typologyAdditional: candidacy.typologyAdditional,
      firstAppointmentOccuredAt: candidacy.firstAppointmentOccuredAt,
      appointmentCount: candidacy.appointmentCount,
      candidacyDropOut: candidacy.candidacyDropOut,
      candidacyStatuses: candidacy.candidacyStatuses,
      createdAt: candidacy.createdAt,
    });
  } catch (e) {
    logger.error(e);
    return Left(
      `Erreur lors de la mise à jour des informations de rendez de la candidature, ${
        (e as any).message
      }`,
    );
  }
};

export const updateOrganism = async (params: {
  candidacyId: string;
  organismId: string | null;
}) => {
  try {
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

    return Right({
      id: newCandidacy.id,
      deviceId: newCandidacy.deviceId,
      regionId: certificationAndRegion?.region.id,
      region: certificationAndRegion?.region,
      department: newCandidacy.department,
      certificationId: certificationAndRegion?.certification.id,
      certification: certificationAndRegion?.certification,
      organismId: newCandidacy.organismId,
      experiences: toDomainExperiences(newCandidacy.experiences),
      phone: newCandidacy.candidate?.phone || null,
      email: newCandidacy.candidate?.email || newCandidacy.email,
      candidacyStatuses: newCandidacy.candidacyStatuses,
      candidacyDropOut: newCandidacy.candidacyDropOut,
      createdAt: newCandidacy.createdAt,
    });
  } catch (e) {
    logger.error(e);
    return Left(
      `error while updating contact on candidacy ${params.candidacyId}`,
    );
  }
};

export const updateTrainingInformations = async (params: {
  candidacyId: string;
  training: {
    basicSkillIds: string[];
    mandatoryTrainingIds: string[];
    certificateSkills: string;
    otherTraining: string;
    individualHourCount: number;
    collectiveHourCount: number;
    additionalHourCount: number;
    isCertificationPartial: boolean;
  };
}) => {
  try {
    const [, , , , newCandidacy] = await prismaClient.$transaction([
      prismaClient.basicSkillOnCandidacies.deleteMany({
        where: {
          candidacyId: params.candidacyId,
        },
      }),
      prismaClient.basicSkillOnCandidacies.createMany({
        data: params.training.basicSkillIds.map((id) => ({
          candidacyId: params.candidacyId,
          basicSkillId: id,
        })),
      }),
      prismaClient.trainingOnCandidacies.deleteMany({
        where: {
          candidacyId: params.candidacyId,
        },
      }),
      prismaClient.trainingOnCandidacies.createMany({
        data: params.training.mandatoryTrainingIds.map((id) => ({
          candidacyId: params.candidacyId,
          trainingId: id,
        })),
      }),
      prismaClient.candidacy.update({
        where: {
          id: params.candidacyId,
        },
        data: {
          certificateSkills: params.training.certificateSkills,
          otherTraining: params.training.otherTraining,
          individualHourCount: params.training.individualHourCount,
          collectiveHourCount: params.training.collectiveHourCount,
          additionalHourCount: params.training.additionalHourCount,
          isCertificationPartial: params.training.isCertificationPartial,
        },
        include: {
          ...candidacyIncludes,
          candidate: true,
        },
      }),
    ]);

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

    return Right({
      id: newCandidacy.id,
      deviceId: newCandidacy.deviceId,
      regionId: certificationAndRegion?.region.id,
      region: certificationAndRegion?.region,
      department: newCandidacy.department,
      certificationId: certificationAndRegion?.certification.id,
      certification: certificationAndRegion?.certification,
      organismId: newCandidacy.organismId,
      experiences: toDomainExperiences(newCandidacy.experiences),
      phone: newCandidacy.candidate?.phone || null,
      email: newCandidacy.candidate?.email || newCandidacy.email,
      candidacyStatuses: newCandidacy.candidacyStatuses,
      candidacyDropOut: newCandidacy.candidacyDropOut,
      createdAt: newCandidacy.createdAt,
    });
  } catch (e) {
    logger.error(e);
    return Left(
      `error while updating training informations on candidacy ${params.candidacyId}`,
    );
  }
};

interface DropOutCandidacyParams {
  candidacyId: string;
  dropOutReasonId: string;
  droppedOutAt: Date;
  otherReasonContent?: string;
}

export const dropOutCandidacy = async ({
  candidacyId,
  droppedOutAt,
  dropOutReasonId,
  otherReasonContent,
}: DropOutCandidacyParams): Promise<Either<string, domain.Candidacy>> => {
  let candidacyStatus: CandidacyStatusStep;
  let candidacy;
  try {
    candidacy = await prismaClient.candidacy.findUnique({
      where: {
        id: candidacyId,
      },
      include: {
        candidate: true,
        candidacyStatuses: {
          where: {
            isActive: true,
          },
        },
        department: true,
        experiences: true,
        goals: true,
      },
    });
    if (candidacy === null) {
      return Left(`could not find candidacy ${candidacyId}`);
    }
    candidacy.email = candidacy.candidate?.email || candidacy.email;
    candidacyStatus = candidacy.candidacyStatuses[0].status;
  } catch (e) {
    logger.error(e);
    return Left(`error while getting candidacy`);
  }

  try {
    await prismaClient.candidacyDropOut.create({
      data: {
        candidacyId,
        droppedOutAt,
        status: candidacyStatus,
        dropOutReasonId,
        otherReasonContent,
      },
    });
    return Right(candidacy);
  } catch (e) {
    logger.error(e);
    return Left(
      `error on drop out candidacy ${candidacyId}: ${(e as Error).message}`,
    );
  }
};

interface CancelDropOutCandidacyParams {
  candidacyId: string;
}

export const cancelDropOutCandidacy = async ({
  candidacyId,
}: CancelDropOutCandidacyParams): Promise<Either<string, domain.Candidacy>> => {
  let candidacy;
  try {
    candidacy = await prismaClient.candidacy.findUnique({
      where: {
        id: candidacyId,
      },
      include: {
        candidacyStatuses: {
          where: {
            isActive: true,
          },
        },
        department: true,
        experiences: true,
        goals: true,
      },
    });
    if (candidacy === null) {
      return Left(`could not find candidacy ${candidacyId}`);
    }
  } catch (e) {
    logger.error(e);
    return Left(`error while getting candidacy`);
  }

  let candidacyDropOut;
  try {
    candidacyDropOut = await prismaClient.candidacyDropOut.findFirst({
      where: {
        candidacyId,
      },
      include: { dropOutReason: true },
    });

    if (!candidacyDropOut) {
      throw new Error("CandidacyDropOut not fount");
    }
  } catch (e) {
    logger.error(e);
    return Left(
      `error on drop out candidacy ${candidacyId}: ${(e as Error).message}`,
    );
  }

  try {
    await prismaClient.candidacyDropOut.delete({
      where: {
        candidacyId,
      },
    });
    return Right({ ...candidacy, candidacyDropOut });
  } catch (e) {
    logger.error(e);
    return Left(
      `error on drop out candidacy ${candidacyId}: ${(e as Error).message}`,
    );
  }
};

export const updateCandidacyGoals = async (params: {
  candidacyId: string;
  goals: { candidacyId: string; goalId: string }[];
}) => {
  try {
    const [, goals] = await prismaClient.$transaction([
      prismaClient.candicadiesOnGoals.deleteMany({
        where: {
          candidacyId: params.candidacyId,
        },
      }),
      prismaClient.candicadiesOnGoals.createMany({
        data: params.goals.map((goal) => ({
          candidacyId: params.candidacyId,
          goalId: goal.goalId,
        })),
      }),
    ]);

    return Right(goals.count);
  } catch (e) {
    logger.error(e);
    return Left(`error while retrieving goals`);
  }
};
