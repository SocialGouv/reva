import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { prismaClient } from "@/prisma/client";

export const deleteExperienceFromCandidacy = async ({
  candidacyId,
  experienceId,
  userKeycloakId,
  userEmail,
  userRoles,
}: {
  candidacyId: string;
  experienceId: string;
  userKeycloakId?: string;
  userEmail?: string;
  userRoles: KeyCloakUserRole[];
}) => {
  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
    select: {
      status: true,
    },
  });

  if (!candidacy) {
    throw new Error("Aucune candidature n'a été trouvée");
  }

  if (candidacy.status !== "PROJET") {
    throw new Error(
      "Impossible de supprimer les expériences après avoir envoyé la candidature à l'AAP",
    );
  }

  await prismaClient.experience.delete({
    where: { id: experienceId },
  });

  await logCandidacyAuditEvent({
    candidacyId,
    eventType: "EXPERIENCE_DELETED",
    userKeycloakId,
    userEmail,
    userRoles,
  });

  return true;
};
