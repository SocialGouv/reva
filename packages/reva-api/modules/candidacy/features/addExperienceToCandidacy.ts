import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import {
  CANDIDATURE_NON_TROUVEE,
  IMPOSSIBLE_METTRE_JOUR_EXPERIENCES_APRES_CONFIRME,
  IMPOSSIBLE_MODIFIER_EXPERIENCES_APRES_ENVOI_DOSSIER,
} from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";

import { ExperienceInput } from "../candidacy.types";

import { canAAPEditExperiences } from "./canAAPEditExperiences";
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
    throw new Error(CANDIDATURE_NON_TROUVEE);
  }

  if (
    userRoles.includes("candidate") &&
    !(await canCandidateUpdateCandidacy({ candidacy }))
  ) {
    throw new Error(IMPOSSIBLE_METTRE_JOUR_EXPERIENCES_APRES_CONFIRME);
  }

  if (
    userRoles.includes("manage_candidacy") &&
    !canAAPEditExperiences(candidacy.status)
  ) {
    throw new Error(IMPOSSIBLE_MODIFIER_EXPERIENCES_APRES_ENVOI_DOSSIER);
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
