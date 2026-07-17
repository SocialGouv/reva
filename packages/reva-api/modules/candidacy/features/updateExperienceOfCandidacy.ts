import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import {
  AUCUNE_CANDIDATURE_ETE_TROUVEE,
  AUCUNE_EXPERIENCE_ETE_TROUVEE,
  IMPOSSIBLE_METTRE_JOUR_EXPERIENCES_APRES_CONFIRME,
  IMPOSSIBLE_MODIFIER_EXPERIENCES_APRES_ENVOI_DOSSIER,
} from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";

import { ExperienceInput } from "../candidacy.types";

import { canAAPEditExperiences } from "./canAAPEditExperiences";
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
    throw new Error(AUCUNE_CANDIDATURE_ETE_TROUVEE);
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

  const experienceToUpdate = await prismaClient.experience.findUnique({
    where: {
      id: experienceId,
      candidacyId,
    },
    select: { id: true },
  });

  if (!experienceToUpdate) {
    throw new Error(AUCUNE_EXPERIENCE_ETE_TROUVEE);
  }

  const result = await prismaClient.experience.update({
    where: {
      id: experienceId,
      candidacyId,
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
