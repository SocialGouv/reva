import {
  CandidaciesStatus,
  Candidacy,
  CandidacyDropOut,
  CandidacyStatus,
  CandidateTypology,
  Certification,
  Department,
  Organism,
} from "@prisma/client";
import { Either, Left, Maybe, Right } from "purify-ts";

import * as domain from "../../../domain/types/candidacy";
import { prismaClient } from "./client";
import { toDomainExperiences } from "./experiences";

export const candidacyIncludes = {
  experiences: true,
  goals: true,
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
};

type CertificationSummary = Pick<Certification, "id" | "label" | "acronym">;

const toDomainCandidacySummary = (
  candidacy: Candidacy & {
    candidacyStatuses: CandidaciesStatus[];
    certification: CertificationSummary;
    organism: Organism | null;
    firstname: string | undefined;
    lastname: string | undefined;
    department: Department | null;
    candidacyDropOut: CandidacyDropOut | null;
  }
) => {
  const statuses = candidacy.candidacyStatuses;
  const lastStatus = statuses.filter((status) => status.isActive)[0];
  const sentStatus = statuses.filter(
    (status) => status.status == "VALIDATION"
  )?.[0];
  const sentAt = sentStatus?.createdAt;

  return {
    id: candidacy.id,
    deviceId: candidacy.deviceId,
    organismId: candidacy.organismId,
    organism: candidacy.organism,
    certificationId: candidacy.certification?.id,
    certification: candidacy.certification,
    isCertificationPartial: candidacy.isCertificationPartial,
    firstname: candidacy.firstname,
    lastname: candidacy.lastname,
    email: candidacy.email,
    phone: candidacy.phone,
    isDroppedOut: candidacy.candidacyDropOut !== null,
    lastStatus,
    dropOutReason: null,
    department: candidacy.department,
    createdAt: candidacy.createdAt,
    sentAt,
  };
};

const toDomainCandidacySummaries = (
  candidacies: (Candidacy & {
    candidacyStatuses: CandidaciesStatus[];
    certification: CertificationSummary;
    organism: Organism | null;
    firstname: string | undefined;
    lastname: string | undefined;
    department: Department | null;
    candidacyDropOut: CandidacyDropOut | null;
  })[]
): domain.CandidacySummary[] => {
  return candidacies.map(toDomainCandidacySummary);
};

export const insertCandidacy = async (params: {
  deviceId: string;
  certificationId: string;
  regionId: string;
}): Promise<Either<string, domain.Candidacy>> => {
  try {
    const newCandidacy = await prismaClient.candidacy.create({
      data: {
        deviceId: params.deviceId,
        certificationsAndRegions: {
          create: {
            certificationId: params.certificationId,
            regionId: params.regionId,
            author: "candidate",
            isActive: true,
          },
        },
        candidacyStatuses: {
          create: {
            status: CandidacyStatus.PROJET,
            isActive: true,
          },
        },
        admissibility: {
          create: {},
        },
      },
      include: candidacyIncludes,
    });

    return Right({
      id: newCandidacy.id,
      deviceId: newCandidacy.deviceId,
      regionId: newCandidacy.certificationsAndRegions[0].region.id,
      region: newCandidacy.certificationsAndRegions[0].region,
      department: newCandidacy.department,
      certificationId:
        newCandidacy.certificationsAndRegions[0].certification.id,
      certification: newCandidacy.certificationsAndRegions[0].certification,
      isCertificationPartial: false,
      experiences: toDomainExperiences(newCandidacy.experiences),
      goals: newCandidacy.goals,
      phone: newCandidacy.phone,
      email: newCandidacy.email,
      candidacyStatuses: newCandidacy.candidacyStatuses,
      dropOutReason: null,
      createdAt: newCandidacy.createdAt,
    });
  } catch (e) {
    return Left("error while creating candidacy");
  }
};

export const getCandidacyFromDeviceId = async (
  deviceId: string
): Promise<Either<string, domain.Candidacy>> => {
  try {
    const candidacy = await prismaClient.candidacy.findFirst({
      where: {
        deviceId: deviceId,
        candidacyStatuses: {
          none: {
            status: "ARCHIVE",
            isActive: true,
          },
        },
      },
      include: candidacyIncludes,
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

    if (!certificationAndRegion) {
      return Left(
        `error while retrieving the certification and region the device id ${deviceId}`
      );
    }

    return Maybe.fromNullable(candidacy)
      .map((c) => ({
        ...c,
        regionId: certificationAndRegion.region.id,
        region: certificationAndRegion.region,
        certificationId: certificationAndRegion.certification.id,
        certification: {
          ...certificationAndRegion.certification,
          codeRncp: certificationAndRegion.certification.rncpId,
        },
      }))
      .toEither(`Candidacy with deviceId ${deviceId} not found`);
  } catch (e) {
    return Left(`error while retrieving the candidacy with id ${deviceId}`);
  }
};

export const getCandidacyFromId = async (
  candidacyId: string
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
        phone: c.candidate?.phone || c.phone,
        email: c.candidate?.email || c.email,
        regionId: certificationAndRegion?.region.id,
        region: certificationAndRegion?.region,
        certificationId: certificationAndRegion?.certification.id,
        certification: certificationAndRegion && {
          ...certificationAndRegion?.certification,
          codeRncp: certificationAndRegion?.certification.rncpId,
        },
      }))
      .toEither(`Candidacy ${candidacyId} not found`);
  } catch (e) {
    return Left(
      `error while retrieving the candidacy with id ${candidacyId} : ${
        (e as Error).message
      }`
    );
  }
};

export const existsCandidacyHavingHadStatus = async (params: {
  candidacyId: string;
  status: CandidacyStatus;
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
    return Left(
      `error while retrieving the candidacy with id ${params.candidacyId}`
    );
  }
};

export const existsCandidacyWithActiveStatus = async (params: {
  candidacyId: string;
  status: CandidacyStatus;
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
    return Left(
      `error while retrieving the candidacy with id ${params.candidacyId}`
    );
  }
};

export const existsCandidacyWithActiveStatuses = async (params: {
  candidacyId: string;
  statuses: CandidacyStatus[];
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

    return Right(candidaciesCount === 1);
  } catch (e) {
    return Left(
      `error while retrieving the candidacy with id ${params.candidacyId}`
    );
  }
};

// export const getCompanions = async () => {
//     try {x
//         const companions = await prismaClient.companion.findMany();

//         return Right(companions);
//     } catch (e) {
//         return Left(`error while retrieving companions`);
//     };
// };

export const updateContactOnCandidacy = async (params: {
  candidacyId: string;
  email: string;
  phone: string;
}): Promise<Either<string, domain.Candidacy>> => {
  try {
    const newCandidacy = await prismaClient.candidacy.update({
      where: {
        id: params.candidacyId,
      },
      data: {
        phone: params.phone,
        email: params.email,
      },
      include: candidacyIncludes,
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
      goals: newCandidacy.goals,
      email: newCandidacy.email,
      phone: newCandidacy.phone,
      candidacyStatuses: newCandidacy.candidacyStatuses,
      candidacyDropOut: newCandidacy.candidacyDropOut,
      createdAt: newCandidacy.createdAt,
    });
  } catch (e) {
    return Left(
      `error while updating contact on candidacy ${params.candidacyId}`
    );
  }
};

export const updateCandidacyStatus = async (params: {
  candidacyId: string;
  status: CandidacyStatus;
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
      goals: newCandidacy.goals,
      phone: newCandidacy.candidate?.phone || newCandidacy.phone,
      email: newCandidacy.candidate?.email || newCandidacy.email,
      candidacyStatuses: newCandidacy.candidacyStatuses,
      candidacyDropOut: newCandidacy.candidacyDropOut,
      createdAt: newCandidacy.createdAt,
    });
  } catch (e) {
    return Left(
      `error while updating status on candidacy ${params.candidacyId}`
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
      goals: newCandidacy.goals,
      phone: newCandidacy.candidate?.phone || newCandidacy.phone,
      email: newCandidacy.candidate?.email || newCandidacy.email,
      candidacyStatuses: newCandidacy.candidacyStatuses,
      candidacyDropOut: newCandidacy.candidacyDropOut,
      createdAt: newCandidacy.createdAt,
    });
  } catch (e) {
    return Left(
      `error while updating certification on candidacy ${params.candidacyId}`
    );
  }
};

export const deleteCandidacyFromPhone = async (phone: string) => {
  try {
    const { count } = await prismaClient.candidacy.deleteMany({
      where: {
        phone: phone,
      },
    });

    if (count === 0) {
      return Right(`Candidature non trouvée.`);
    } else {
      return Right(`Candidature supprimée `);
    }
  } catch (e) {
    return Left(`Candidature non supprimée, ${(e as any).message}`);
  }
};

export const deleteCandidacyFromEmail = async (email: string) => {
  try {
    const { count } = await prismaClient.candidacy.deleteMany({
      where: {
        email: email,
      },
    });

    if (count === 0) {
      return Right(`Candidature non trouvée.`);
    } else {
      return Right(`Candidature supprimée `);
    }
  } catch (e) {
    return Left(`Candidature non supprimée, ${(e as any).message}`);
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
    return Left(`Candidature non supprimée, ${(e as any).message}`);
  }
};

export const getCandidacies = async () => {
  try {
    const candidacies = await prismaClient.candidacy.findMany({
      orderBy: [{ updatedAt: "desc" }],
      include: {
        candidacyStatuses: true,
        certificationsAndRegions: {
          select: {
            certification: {
              select: {
                id: true,
                label: true,
                acronym: true,
              },
            },
          },
          where: {
            isActive: true,
          },
        },
        candidate: true,
        organism: true,
        department: true,
        candidacyDropOut: true,
      },
    });

    return Right(
      toDomainCandidacySummaries(
        candidacies.map((c) => ({
          ...c,
          department: c.department,
          certification: c.certificationsAndRegions[0]?.certification,
          firstname: c.candidate?.firstname,
          lastname: c.candidate?.lastname,
          phone: c.candidate?.phone || c.phone,
          email: c.candidate?.email || c.email,
        }))
      )
    );
  } catch (e) {
    return Left(
      `Erreur lors de la récupération des candidatures, ${(e as any).message}`
    );
  }
};

export const getCandidaciesForUser = async (keycloakId: string) => {
  if (!keycloakId) {
    return Left(
      `Erreur lors de la récupération des candidatures, identifiant null`
    );
  }

  try {
    const candidacies = await prismaClient.candidacy.findMany({
      orderBy: [{ updatedAt: "desc" }],
      where: {
        organism: {
          accounts: {
            some: {
              keycloakId: keycloakId,
            },
          },
        },
      },
      include: {
        candidacyStatuses: true,
        certificationsAndRegions: {
          select: {
            certification: {
              select: {
                id: true,
                label: true,
                acronym: true,
              },
            },
          },
          where: {
            isActive: true,
          },
        },
        candidate: true,
        organism: true,
        department: true,
        candidacyDropOut: true,
      },
    });

    return Right(
      toDomainCandidacySummaries(
        candidacies.map((c) => ({
          ...c,
          department: c.department,
          certification: c.certificationsAndRegions[0]?.certification,
          firstname: c.candidate?.firstname,
          lastname: c.candidate?.lastname,
          phone: c.candidate?.phone || c.phone,
          email: c.candidate?.email || c.email,
        }))
      )
    );
  } catch (e) {
    return Left(
      `Erreur lors de la récupération des candidatures, ${(e as any).message}`
    );
  }
};

export const updateAppointmentInformations = async (params: {
  candidacyId: string;
  candidateTypologyInformations: {
    typology: CandidateTypology;
    additionalInformation: string;
  };
  appointmentInformations: {
    firstAppointmentOccuredAt: Date;
    appointmentCount: number;
    wasPresentAtFirstAppointment: boolean;
  };
}) => {
  try {
    const candidacy = await prismaClient.candidacy.update({
      where: {
        id: params.candidacyId,
      },
      data: {
        typology: params.candidateTypologyInformations.typology,
        typologyAdditional:
          params.candidateTypologyInformations.additionalInformation,
        firstAppointmentOccuredAt:
          params.appointmentInformations.firstAppointmentOccuredAt,
        appointmentCount: params.appointmentInformations.appointmentCount,
        wasPresentAtFirstAppointment:
          params.appointmentInformations.wasPresentAtFirstAppointment,
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
      goals: candidacy.goals,
      phone: candidacy.candidate?.phone || candidacy.phone,
      email: candidacy.candidate?.email || candidacy.email,
      typology: candidacy.typology,
      typologyAdditional: candidacy.typologyAdditional,
      firstAppointmentOccuredAt: candidacy.firstAppointmentOccuredAt,
      appointmentCount: candidacy.appointmentCount,
      wasPresentAtFirstAppointment: candidacy.wasPresentAtFirstAppointment,
      candidacyDropOut: candidacy.candidacyDropOut,
      candidacyStatuses: candidacy.candidacyStatuses,
      createdAt: candidacy.createdAt,
    });
  } catch (e) {
    return Left(
      `Erreur lors de la mise à jour des informations de rendez de la candidature, ${
        (e as any).message
      }`
    );
  }
};

export const updateOrganism = async (params: {
  candidacyId: string;
  organismId: string;
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
      goals: newCandidacy.goals,
      phone: newCandidacy.candidate?.phone || newCandidacy.phone,
      email: newCandidacy.candidate?.email || newCandidacy.email,
      candidacyStatuses: newCandidacy.candidacyStatuses,
      candidacyDropOut: newCandidacy.candidacyDropOut,
      createdAt: newCandidacy.createdAt,
    });
  } catch (e) {
    return Left(
      `error while updating contact on candidacy ${params.candidacyId}`
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
    validatedByCandidate: boolean;
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
          validatedByCandidate: params.training.validatedByCandidate,
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
      goals: newCandidacy.goals,
      phone: newCandidacy.candidate?.phone || newCandidacy.phone,
      email: newCandidacy.candidate?.email || newCandidacy.email,
      candidacyStatuses: newCandidacy.candidacyStatuses,
      candidacyDropOut: newCandidacy.candidacyDropOut,
      createdAt: newCandidacy.createdAt,
    });
  } catch (e) {
    return Left(
      `error while updating training informations on candidacy ${params.candidacyId}`
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
  let candidacyStatus: CandidacyStatus;
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
    candidacyStatus = candidacy.candidacyStatuses[0].status;
  } catch (e) {
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
  } catch (error) {
    return Left(
      `error on drop out candidacy ${candidacyId}: ${(error as Error).message}`
    );
  }
};
