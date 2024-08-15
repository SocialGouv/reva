import { CandidacyStatusStep } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";

export const createCandidateWithCandidacy = async (candidateInput: any) => {
  // Create account
  const createdCandidate = await prismaClient.candidate.create({
    data: {
      email: candidateInput.email,
      firstname: candidateInput.firstname,
      lastname: candidateInput.lastname,
      phone: candidateInput.phone,
      departmentId: candidateInput.departmentId,
      keycloakId: candidateInput.keycloakId,
    },
  });

  // Check if an existing candidacy is active
  const candidacy = await prismaClient.candidacy.findFirst({
    where: {
      candidateId: createdCandidate.id,
      candidacyStatuses: {
        none: {
          OR: [{ status: "ARCHIVE", isActive: true }],
        },
      },
    },
  });

  if (!candidacy) {
    await prismaClient.candidate.update({
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
            departmentId: candidateInput.departmentId,
          },
        },
      },
      where: {
        id: createdCandidate.id,
      },
    });
  }

  return createdCandidate;
};
