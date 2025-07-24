import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { prismaClient } from "@/prisma/client";

import { ExperienceInput } from "../candidacy.types";

import { canCandidateUpdateCandidacy } from "./canCandidateUpdateCandidacy";

export const addExperienceToCandidacy = async ({
  candidacyId,
  experience,
  userRoles,
  userEmail,
  userKeycloakId,
}: {
  candidacyId: string;
  experience: ExperienceInput;
  userEmail?: string;
  userKeycloakId?: string;
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

  const result = await prismaClient.experience.create({
    data: {
      title: experience.title,
      duration: experience.duration,
      description: experience.description,
      startedAt: experience.startedAt,
      candidacy: {
        connect: {
          id: candidacyId,
        },
      },
    },
  });

  await logCandidacyAuditEvent({
    candidacyId,
    eventType: "EXPERIENCE_ADDED",
    userRoles,
    userEmail,
    userKeycloakId,
  });

  return result;
};
