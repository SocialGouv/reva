import { CandidacyStatusStep, Prisma } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { Candidacy } from "../../candidacy/candidacy.types";
import { candidacyIncludes } from "../../candidacy/database/candidacies";

const candidateIncludes = {
  highestDegree: true,
  vulnerabilityIndicator: true,
};

//A candidacy is considered ongoing if its active status is not ARCHIVE and it has never been in the DOSSIER_FAISABILITE_NON_RECEVABLE status
const ongoingCandidacyFilter: Prisma.CandidacyWhereInput = {
  candidacyStatuses: {
    none: {
      OR: [{ status: "ARCHIVE", isActive: true }],
    },
  },
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

  // Check if an existing candidacy is active
  const candidacy = await prismaClient.candidacy.findFirst({
    where: {
      candidateId: createdCandidate.id,
      ...ongoingCandidacyFilter,
    },
  });

  let newCandidate = null;
  if (!candidacy) {
    newCandidate = await prismaClient.candidate.update({
      data: {
        candidacies: {
          create: {
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
          where: ongoingCandidacyFilter,
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
          where: ongoingCandidacyFilter,
          include: candidacyIncludes,
        },
      },
    });
  }

  if (!newCandidate) {
    throw new Error("Candidat non trouvé");
  }

  const certificationAndRegion =
    await prismaClient.candidaciesOnRegionsAndCertifications.findFirst({
      where: {
        candidacyId: newCandidate.candidacies[0].id,
        isActive: true,
      },
      include: {
        certification: true,
        region: true,
      },
    });

  return {
    ...newCandidate,
    candidacies: newCandidate.candidacies.map((candidacy) =>
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
        }),
      ),
    ),
  };
};

export const getCandidateWithCandidacyFromKeycloakId = async (
  keycloakId: string,
) => {
  if (!keycloakId) {
    throw new Error("Identifiant utilisateur invalide");
  }
  let candidate = await prismaClient.candidate.findFirst({
    where: {
      keycloakId: keycloakId,
      candidacies: {
        some: ongoingCandidacyFilter,
      },
    },
    include: {
      candidacies: {
        where: ongoingCandidacyFilter,
        include: candidacyIncludes,
      },
      highestDegree: true,
      vulnerabilityIndicator: true,
    },
  });

  if (!candidate) {
    candidate = await prismaClient.candidate.update({
      where: {
        keycloakId: keycloakId,
      },
      data: {
        candidacies: {
          create: {
            candidacyStatuses: {
              create: {
                status: CandidacyStatusStep.PROJET,
                isActive: true,
              },
            },
            admissibility: { create: {} },
            examInfo: { create: {} },
          },
        },
      },
      include: {
        candidacies: {
          where: ongoingCandidacyFilter,
          include: candidacyIncludes,
        },
        highestDegree: true,
        vulnerabilityIndicator: true,
      },
    });
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

  return candidate
    ? {
        ...candidate,
        candidacies: candidate?.candidacies.map((candidacy) =>
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
            }),
          ),
        ),
      }
    : null;
};

export const getCandidateByCandidacyId = async (id: string) =>
  prismaClient.candidate.findFirst({
    where: {
      candidacies: {
        some: {
          id,
        },
      },
    },
    include: candidateIncludes,
  });
