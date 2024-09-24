import { prismaClient } from "../../../prisma/client";
import { createCandidacy } from "../../candidacy/features/createCandidacy";
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
    await createCandidacy({
      departmentId: candidateInput.departmentId,
      candidateId: createdCandidate.id,
      typeAccompagnement: "ACCOMPAGNE",
    });
  }

  return createdCandidate;
};
