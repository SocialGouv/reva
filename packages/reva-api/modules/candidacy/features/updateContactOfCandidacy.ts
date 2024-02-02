import { prismaClient } from "../../../prisma/client";
import { generateJwt } from "../../candidate/auth.helper";
import { Candidate } from "../../candidate/candidate.types";
import {
  sendNewEmailCandidateEmail,
  sendPreviousEmailCandidateEmail,
} from "../mails";
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
      email: string;
    };
  },
): Promise<Candidate> => {
  const { candidateId, candidateData } = params;
  const candidateToUpdate = await prismaClient.candidate.findUnique({
    where: { id: candidateId },
  });

  if (context.keycloakId != candidateToUpdate?.keycloakId) {
    throw new Error("Utilisateur non autorisé");
  }

  if (!candidateToUpdate) {
    throw new Error(`Ce candidat n'existe pas`);
  }

  const candidateWithEmail = await prismaClient.candidate.findUnique({
    where: { email: candidateData.email },
  });

  if (candidateWithEmail && candidateWithEmail.id != candidateToUpdate.id) {
    throw new Error(
      `Vous ne pouvez pas utiliser ${candidateData.email} comme nouvelle adresse email`,
    );
  }

  if (candidateData.email !== candidateToUpdate.email) {
    const previousEmail = candidateToUpdate.email;
    const newEmail = candidateData.email;

    const token = generateJwt(
      {
        previousEmail,
        newEmail,
        action: "confirmEmail",
      },
      1 * 60 * 60 * 24 * 4,
    );

    await sendPreviousEmailCandidateEmail({ email: previousEmail });
    await sendNewEmailCandidateEmail({ email: newEmail, token });
  }

  return prismaClient.candidate.update({
    where: { id: candidateId },
    data: {
      firstname: candidateData.firstname,
      lastname: candidateData.lastname,
      phone: candidateData.phone,
    },
  });
};
