import { CandidacyStatusStep, Candidate } from "@prisma/client";
import { Left, Maybe, Right } from "purify-ts";

import { Candidacy } from "../../../domain/types/candidacy";
import { logger } from "../../logger";
import { candidacyIncludes } from "./candidacies";
import { prismaClient } from "./client";

const candidateIncludes = {
  highestDegree: true,
  vulnerabilityIndicator: true,
};

const withBasicSkills = (c: Candidacy) => ({
  ...c,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  basicSkillIds: c.basicSkills.reduce((memo, bs) => {
    return [...memo, bs.basicSkill.id];
  }, []),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  basicSkills: c.basicSkills.map((bs) => bs.basicSkill),
});

const withMandatoryTrainings = (c: Candidacy) => ({
  ...c,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  mandatoryTrainingIds: c.trainings.reduce((memo, t) => {
    return [...memo, t.training.id];
  }, []),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  mandatoryTrainings: c.trainings.map((t) => t.training),
});

export const createCandidateWithCandidacy = async (candidate: any) => {
  try {
    // Create account
    const createdCandidate = await prismaClient.candidate.create({
      data: {
        email: candidate.email,
        firstname: candidate.firstname,
        lastname: candidate.lastname,
        phone: candidate.phone,
        departmentId: candidate.departmentId,
        keycloakId: candidate.keycloakId,
      },
    });

    // Update existing candidacy with this id
    const update = await prismaClient.candidacy.updateMany({
      data: {
        candidateId: createdCandidate.id,
      },
      where: {
        email: candidate.email.trim(),
      },
    });

    // Check if an existing candidacy is active
    const candidacy = await prismaClient.candidacy.findFirst({
      where: {
        candidateId: createdCandidate.id,
        candidacyStatuses: {
          none: {
            status: "ARCHIVE",
            isActive: true,
          },
        },
      },
    });

    let newCandidate = null;
    if (!candidacy) {
      newCandidate = await prismaClient.candidate.update({
        data: {
          candidacies: {
            create: {
              deviceId: candidate.email,
              candidacyStatuses: {
                create: {
                  status: CandidacyStatusStep.PROJET,
                  isActive: true,
                },
              },
              admissibility: { create: {} },
              examInfo: { create: {} },
              departmentId: candidate.departmentId,
            },
          },
        },
        where: {
          id: createdCandidate.id,
        },
        include: {
          candidacies: {
            where: {
              candidacyStatuses: {
                none: {
                  status: "ARCHIVE",
                  isActive: true,
                },
              },
            },
            include: candidacyIncludes,
          },
        },
      });
    } else {
      newCandidate = await prismaClient.candidate.findFirst({
        where: {
          id: createdCandidate.id,
        },
        include: {
          candidacies: {
            where: {
              candidacyStatuses: {
                none: {
                  status: "ARCHIVE",
                  isActive: true,
                },
              },
            },
            include: candidacyIncludes,
          },
        },
      });
    }

    const certificationAndRegion =
      await prismaClient.candidaciesOnRegionsAndCertifications.findFirst({
        where: {
          candidacyId: newCandidate?.candidacies[0].id,
          isActive: true,
        },
        include: {
          certification: true,
          region: true,
        },
      });

    return Maybe.fromNullable(newCandidate)
      .map((c) => ({
        ...c,
        candidacies: c.candidacies.map((candidacy) =>
          withBasicSkills(
            withMandatoryTrainings({
              ...candidacy,
              regionId: certificationAndRegion?.region.id,
              region: certificationAndRegion?.region,
              certificationId: certificationAndRegion?.certification.id,
              certification: certificationAndRegion?.certification && {
                ...certificationAndRegion?.certification,
                codeRncp: certificationAndRegion?.certification.rncpId,
              },
            })
          )
        ),
      }))
      .toEither(`Candidate not found`);
  } catch (e) {
    logger.error(e);
    return Left(
      `error while creating candidate ${candidate.email} with candidacy with keycloakId ${candidate.keycloakId}`
    );
  }
};

export const getCandidateWithCandidacyFromKeycloakId = async (
  keycloakId: string
) => {
  try {
    const candidate = await prismaClient.candidate.findFirst({
      where: {
        keycloakId: keycloakId,
        candidacies: {
          some: {
            candidacyStatuses: {
              none: {
                status: "ARCHIVE",
                isActive: true,
              },
            },
          },
        },
      },
      include: {
        candidacies: {
          where: {
            candidacyStatuses: {
              none: {
                status: "ARCHIVE",
                isActive: true,
              },
            },
          },
          include: candidacyIncludes,
        },
        highestDegree: true,
        vulnerabilityIndicator: true,
      },
    });

    if (!candidate) {
      // Legacy behaviour when candidacy was archived : recreate everything from scratch
      logger.info(
        `Tryed to log with an archived candidacy (keycloakId: ${keycloakId})`
      );
      return Left("Archived candidacy");
    }

    const certificationAndRegion =
      await prismaClient.candidaciesOnRegionsAndCertifications.findFirst({
        where: {
          candidacyId: candidate?.candidacies[0].id,
          isActive: true,
        },
        include: {
          certification: true,
          region: true,
        },
      });

    return Maybe.fromNullable(candidate)
      .map((c) => ({
        ...c,
        candidacies: c.candidacies.map((candidacy) =>
          withBasicSkills(
            withMandatoryTrainings({
              ...candidacy,
              regionId: certificationAndRegion?.region.id,
              region: certificationAndRegion?.region,
              certificationId: certificationAndRegion?.certification.id,
              certification: certificationAndRegion?.certification && {
                ...certificationAndRegion?.certification,
                codeRncp: certificationAndRegion?.certification.rncpId,
              },
            })
          )
        ),
      }))
      .toEither(`Candidate not found`);
  } catch (e) {
    logger.error(e);
    return Left(`error while retrieving the candidate`);
  }
};

export const getCandidateByEmail = async (email: string) => {
  try {
    const candidate = await prismaClient.candidate.findFirst({
      where: {
        email,
      },
      include: candidateIncludes,
    });
    return Maybe.fromNullable(candidate).toEither(`Candidate not found`);
  } catch (e) {
    logger.error(e);
    return Left(`error while retrieving the candidate`);
  }
};

export const getCandidateByCandidacyId = async (id: string) => {
  try {
    const candidate = await prismaClient.candidate.findFirst({
      where: {
        candidacies: {
          some: {
            id,
          },
        },
      },
      include: candidateIncludes,
    });
    return Maybe.fromNullable(candidate).toEither(`Candidate not found`);
  } catch (e) {
    logger.error(e);
    return Left(`error while retrieving the candidate`);
  }
};
export const updateCandidate = async (id: string, candidate: Candidate) => {
  try {
    const newCandidate = await prismaClient.candidate.update({
      where: {
        id,
      },
      data: candidate,
      include: candidateIncludes,
    });
    return Right(newCandidate);
  } catch (e) {
    logger.error(e);
    return Left(`error while updating candidate ${candidate.email}`);
  }
};
