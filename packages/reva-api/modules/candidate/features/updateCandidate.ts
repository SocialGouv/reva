import { Candidate } from "@prisma/client";
import { isBefore, sub } from "date-fns";

import { prismaClient } from "../../../prisma/client";
import { logCandidacyAuditEvent } from "../../candidacy-log/features/logCandidacyAuditEvent";
import {
  sendNewEmailCandidateEmail,
  sendPreviousEmailCandidateEmail,
} from "../../candidacy/mails";
import { generateJwt } from "../../candidate/auth.helper";
import { CandidateUpdateInput } from "../../candidate/candidate.types";

export const updateCandidate = async ({
  params: { candidate, userRoles, userKeycloakId, userEmail },
}: {
  params: { candidate: CandidateUpdateInput } & {
    userKeycloakId?: string;
    userEmail?: string;
    userRoles: KeyCloakUserRole[];
  };
}): Promise<Candidate> => {
  const candidateInput: Partial<CandidateUpdateInput> = { ...candidate };
  const { id, email, birthDepartmentId, countryId } = candidateInput;
  const candidateToUpdate = await prismaClient.candidate.findUnique({
    where: { id },
    include: { department: true },
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

  if (birthDepartmentId) {
    const birthDepartmentSelected = await prismaClient.department.findUnique({
      where: { id: birthDepartmentId },
    });

    if (!birthDepartmentSelected) {
      throw new Error(`Le département de naissance n'existe pas`);
    }
  } else {
    delete candidateInput.birthDepartmentId;
  }

  const countrySelected = await prismaClient.country.findUnique({
    where: { id: countryId },
  });

  if (!countrySelected) {
    throw new Error(`Le pays n'existe pas`);
  }

  const isDifferentZipCode =
    candidateToUpdate.zip &&
    candidateToUpdate.zip !== candidateInput.zip &&
    candidateToUpdate.zip?.match(/^(\d{5}|)$/);

  if (isDifferentZipCode) {
    const departmentCode = candidateInput.zip?.slice(0, 2);

    const department = await prismaClient.department.findUnique({
      where: { code: departmentCode },
    });

    if (!department) {
      throw new Error(`Le département n'existe pas`);
    }
    candidateInput.departmentId = department.id;
  }

  const today = new Date();

  const dateSelected = new Date(Number(candidate.birthdate));
  console.log("dateSelected", dateSelected);
  const sixteenYearsAgo = sub(today, { years: 16 });
  const candidateBirthdayIsOlderThan16YearsAgo = isBefore(
    dateSelected,
    sixteenYearsAgo,
  );
  if (!candidateBirthdayIsOlderThan16YearsAgo) {
    throw new Error(`Le candidat doit avoir plus de 16 ans`);
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
        eventType: "CANDIDATE_UPDATED",
        userKeycloakId,
        userEmail,
        userRoles,
      }),
    ),
  );

  return prismaClient.candidate.update({
    where: { id },
    data: {
      ...candidateInput,
      birthDepartmentId:
        countrySelected.label == "France" ? birthDepartmentId : undefined,
    },
  });
};
