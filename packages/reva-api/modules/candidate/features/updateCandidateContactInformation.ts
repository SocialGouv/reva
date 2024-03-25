import { Candidate } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { logCandidacyAuditEvent } from "../../candidacy-log/features/logCandidacyAuditEvent";
import {
  sendNewEmailCandidateEmail,
  sendPreviousEmailCandidateEmail,
} from "../../candidacy/mails";
import { generateJwt } from "../../candidate/auth.helper";
import { CandidateContactInformationInput } from "../../candidate/candidate.types";

export const updateCandidateContactInformation = async ({
  params: { candidateContactInformation, userRoles, userKeycloakId, userEmail },
}: {
  params: { candidateContactInformation: CandidateContactInformationInput } & {
    userKeycloakId?: string;
    userEmail?: string;
    userRoles: KeyCloakUserRole[];
  };
}): Promise<Candidate> => {
  const candidateInput: Partial<CandidateContactInformationInput> = {
    ...candidateContactInformation,
  };
  const { id, email } = candidateInput;
  const candidateToUpdate = await prismaClient.candidate.findUnique({
    where: { id },
  });

  if (!candidateToUpdate) {
    throw new Error(`Ce candidat n'existe pas`);
  }

  const candidateWithEmail = await prismaClient.candidate.findUnique({
    where: { email },
  });

  if (candidateWithEmail && candidateWithEmail.id != candidateToUpdate.id) {
    throw new Error(
      `Vous ne pouvez pas utiliser ${email} comme nouvelle adresse email`,
    );
  }

  const previousEmail = candidateToUpdate.email;
  const newEmail = email;

  if (newEmail && newEmail !== previousEmail) {
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

  //We don't want to update the email in the database, it will be done after the email confirmation
  delete candidateInput.email;

  const candidacies = await prismaClient.candidacy.findMany({
    where: { candidateId: id },
  });

  await Promise.all(
    candidacies.map(async (c) =>
      logCandidacyAuditEvent({
        candidacyId: c.id,
        eventType: "CANDIDATE_CONTACT_INFORMATION_UPDATED",
        userKeycloakId,
        userEmail,
        userRoles,
      }),
    ),
  );

  return prismaClient.candidate.update({
    where: { id },
    data: candidateInput,
  });
};
