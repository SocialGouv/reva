import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
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

  if (
    userRoles.includes("manage_candidacy") &&
    !canAAPEditExperiences(candidacy.status)
  ) {
    throw new Error(
      "Impossible de modifier les expériences après l'envoi du dossier de faisabilité",
    );
  }

  const experienceToUpdate = await prismaClient.experience.findUnique({
    where: {
      id: experienceId,
      candidacyId,
    },
    select: { id: true },
  });

  if (!experienceToUpdate) {
    throw new Error("Aucune expérience n'a été trouvée");
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
