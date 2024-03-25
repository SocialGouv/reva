import { Candidate } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { logCandidacyAuditEvent } from "../../candidacy-log/features/logCandidacyAuditEvent";
import { CandidateCivilInformationInput } from "../candidate.types";

export const updateCandidateCivilInformation = async ({
  params: { candidateCivilInformation, userRoles, userKeycloakId, userEmail },
}: {
  params: { candidateCivilInformation: CandidateCivilInformationInput } & {
    userKeycloakId?: string;
    userEmail?: string;
    userRoles: KeyCloakUserRole[];
  };
}): Promise<Candidate> => {
  const candidateInput: Partial<CandidateCivilInformationInput> = {
    ...candidateCivilInformation,
  };
  const { id, birthDepartmentId, countryId } = candidateInput;
  const candidateToUpdate = await prismaClient.candidate.findUnique({
    where: { id },
  });

  if (!candidateToUpdate) {
    throw new Error(`Ce candidat n'existe pas`);
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

  const candidacies = await prismaClient.candidacy.findMany({
    where: { candidateId: id },
  });

  await Promise.all(
    candidacies.map(async (c) =>
      logCandidacyAuditEvent({
        candidacyId: c.id,
        eventType: "CANDIDATE_CIVIL_INFORMATION_UPDATED",
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
