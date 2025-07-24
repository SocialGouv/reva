import { prismaClient } from "../../../prisma/client";
import { logCandidacyAuditEvent } from "../../candidacy-log/features/logCandidacyAuditEvent";
import { ExperienceInput } from "../candidacy.types";

import { canCandidateUpdateCandidacy } from "./canCandidateUpdateCandidacy";

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
  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
    select: {
      status: true,
      typeAccompagnement: true,
    },
  });

  if (!candidacy) {
    throw new Error("Aucune candidature n'a été trouvée");
  }

  if (
    userRoles.includes("candidate") &&
    !(await canCandidateUpdateCandidacy({ candidacy }))
  ) {
    throw new Error(
      "Impossible de mettre à jour les experiences après avoir confirmé le parcours",
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
