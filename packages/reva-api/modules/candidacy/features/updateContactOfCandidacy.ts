import { prismaClient } from "../../../prisma/client";
import { Candidate } from "../../candidate/candidate.types";

export const updateContactOfCandidacy = async (
  context: {
    hasRole: (role: string) => boolean;
    keycloakId: string;
  },
  params: {
    candidateId: string;
    candidateData: {
      firstname: string;
      lastname: string;
      phone: string;
    };
  }
): Promise<Candidate> => {
  const candidateToUpdate = await prismaClient.candidate.findUnique({
    where: { id: params.candidateId },
  });

  if (!candidateToUpdate) {
    throw new Error(`Compte candidat ${params.candidateId} non trouvé`);
  }

  if (
    context.hasRole("admin") ||
    context.keycloakId == candidateToUpdate.keycloakId
  ) {
    return prismaClient.candidate.update({
      where: { id: params.candidateId },
      data: {
        firstname: params.candidateData.firstname,
        lastname: params.candidateData.lastname,
        phone: params.candidateData.phone,
      },
    });
  } else {
    throw new Error("Utilisateur non autorisé");
  }
};
