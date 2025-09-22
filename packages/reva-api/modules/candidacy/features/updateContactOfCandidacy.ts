import { Candidate } from "@/modules/candidate/candidate.types";
import { prismaClient } from "@/prisma/client";

import { sendNewEmailCandidateEmail } from "../emails/sendNewEmailCandidateEmail";
import { sendPreviousEmailCandidateEmail } from "../emails/sendPreviousEmailCandidateEmail";

import { updateCandidateEmail } from "./updateCandidateEmail";
export const updateContactOfCandidacy = async (params: {
  candidateId: string;
  candidateData: {
    firstname: string;
    lastname: string;
    phone: string;
    email: string;
  };
}): Promise<Candidate> => {
  const { candidateId, candidateData } = params;
  const candidateToUpdate = await prismaClient.candidate.findUnique({
    where: { id: candidateId },
  });

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

    await updateCandidateEmail({ previousEmail, newEmail });
    await sendPreviousEmailCandidateEmail({ email: previousEmail });
    await sendNewEmailCandidateEmail({ email: newEmail });
  }

  return prismaClient.candidate.update({
    where: { id: candidateId },
    data: {
      firstname: candidateData.firstname,
      lastname: candidateData.lastname,
      phone: candidateData.phone,
      email: candidateData.email,
    },
  });
};
