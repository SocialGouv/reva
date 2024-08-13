import { CandidacyStatusStep, Prisma } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { getCertificationById } from "../../referential/features/getCertificationById";

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
        },
      },
    });
  }

  if (!newCandidate) {
    throw new Error("Candidat non trouvé");
  }

  const certification = await getCertificationById({
    certificationId: newCandidate.candidacies[0].certificationId,
  });
  return {
    ...newCandidate,
    candidacies: newCandidate.candidacies.map((candidacy) => ({
      ...candidacy,
      certificationId: certification?.id,
      certification: certification
        ? {
            ...certification,
            codeRncp: certification?.rncpId,
          }
        : undefined,
    })),
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
        include: { certification: true },
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
          include: { certification: true },
        },
        highestDegree: true,
        vulnerabilityIndicator: true,
      },
    });
  }

  return candidate
    ? {
        ...candidate,
        candidacies: candidate?.candidacies.map((candidacy) => ({
          ...candidacy,
          certification: candidacy?.certification && {
            ...candidacy?.certification,
            codeRncp: candidacy?.certification?.rncpId,
          },
        })),
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
