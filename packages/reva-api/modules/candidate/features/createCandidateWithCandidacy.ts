import { createCandidacy } from "@/modules/candidacy/features/createCandidacy";
import { prismaClient } from "@/prisma/client";

import { TypeAccompagnement } from "../candidate.types";

interface CreateCandidateWithCandidacyInput {
  email: string;
  phone: string;
  firstname: string;
  lastname: string;
  departmentId: string;
  typeAccompagnement: TypeAccompagnement;
  cohorteVaeCollectiveId?: string;
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
      status: { not: "ARCHIVE" },
    },
  });

  if (!candidacy) {
    await createCandidacy({
      candidateId: createdCandidate.id,
      typeAccompagnement: candidateInput.typeAccompagnement,
      cohorteVaeCollectiveId: candidateInput.cohorteVaeCollectiveId,
    });
  }

  return createdCandidate;
};
