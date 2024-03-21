import { prismaClient } from "../../../prisma/client";
import { logCandidacyAuditEvent } from "../../candidacy-log/features/logCandidacyAuditEvent";
import { CandidateProfileUpdateInput } from "../candidate.types";

export const updateCandidateProfile = async ({
  params: {
    candidateId,
    highestDegreeId,
    highestDegreeLabel,
    niveauDeFormationLePlusEleveDegreeId,
    userKeycloakId,
    userEmail,
    userRoles,
  },
}: {
  params: CandidateProfileUpdateInput & {
    userKeycloakId?: string;
    userEmail?: string;
    userRoles: KeyCloakUserRole[];
  };
}) => {
  const result = await prismaClient.candidate.update({
    where: { id: candidateId },
    data: {
      highestDegreeId,
      highestDegreeLabel,
      niveauDeFormationLePlusEleveDegreeId,
    },
  });

  const candidacies = await prismaClient.candidacy.findMany({
    where: { candidateId },
  });

  await Promise.all(
    candidacies.map(async (c) =>
      logCandidacyAuditEvent({
        candidacyId: c.id,
        eventType: "CANDIDATE_PROFILE_UPDATED",
        userKeycloakId,
        userEmail,
        userRoles,
      }),
    ),
  );

  return result;
};
