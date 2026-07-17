import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { CANDIDATE_NOT_FOUND } from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";

import { CandidateProfileUpdateInput } from "../candidate.types";

import { getCandidateByCandidacyId } from "./getCandidateByCandidacyId";

export const updateCandidateProfile = async ({
  params: {
    candidacyId,
    highestDegreeId,
    highestDegreeLabel,
    niveauDeFormationLePlusEleveDegreeId,
    userKeycloakId,
    userEmail,
    userRoles,
  },
}: {
  params: CandidateProfileUpdateInput & { candidacyId: string } & {
    userKeycloakId?: string;
    userEmail?: string;
    userRoles: KeyCloakUserRole[];
  };
}) => {
  const candidate = await getCandidateByCandidacyId({ candidacyId });
  if (!candidate) {
    throw new Error(CANDIDATE_NOT_FOUND);
  }
  const result = await prismaClient.candidate.update({
    where: { id: candidate.id },
    data: {
      highestDegreeId,
      highestDegreeLabel,
      niveauDeFormationLePlusEleveDegreeId,
    },
  });

  const candidacies = await prismaClient.candidacy.findMany({
    where: { candidateId: candidate.id },
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
