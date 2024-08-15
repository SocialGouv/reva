import { CandidacyStatusStep } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
interface CreateCandidateWithCandidacyInput {
  email: string;
  phone: string;
  firstname: string;
  lastname: string;
  departmentId: string;
  keycloakId: string;
}

export const createCandidateWithCandidacy = async (
  candidateInput: CreateCandidateWithCandidacyInput,
) => {
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
