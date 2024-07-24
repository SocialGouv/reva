import { ExperienceInput } from "../candidacy.types";
import { canCandidateUpdateCandidacy } from "./canCandidateUpdateCandidacy";
import { prismaClient } from "../../../prisma/client";
import { logCandidacyAuditEvent } from "../../candidacy-log/features/logCandidacyAuditEvent";

export const updateExperienceOfCandidacy = async ({
  candidacyId,
  experienceId,
  experience,
  userKeycloakId,
  userEmail,
  userRoles,
}: {
  candidacyId: string;
  experienceId: string;
  experience: ExperienceInput;
  userKeycloakId?: string;
  userEmail?: string;
  userRoles: KeyCloakUserRole[];
}) => {
  if (
    userRoles.includes("candidate") &&
    !(await canCandidateUpdateCandidacy({ candidacyId }))
  ) {
    throw new Error(
      "Impossible de mettre à jour la candidature une fois le premier entretien effectué",
    );
  }

  const result = await prismaClient.experience.update({
    where: {
      id: experienceId,
    },
    data: {
      title: experience.title,
      duration: experience.duration,
      description: experience.description,
      startedAt: experience.startedAt,
    },
  });

  await logCandidacyAuditEvent({
    candidacyId,
    eventType: "EXPERIENCE_UPDATED",
    userKeycloakId,
    userEmail,
    userRoles,
  });
  return result;
};
