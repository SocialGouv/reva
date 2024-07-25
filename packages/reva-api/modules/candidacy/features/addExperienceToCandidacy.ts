import { ExperienceInput } from "../candidacy.types";
import { canCandidateUpdateCandidacy } from "./canCandidateUpdateCandidacy";
import { logCandidacyAuditEvent } from "../../candidacy-log/features/logCandidacyAuditEvent";
import { getCandidacyById } from "./getCandidacyById";
import { prismaClient } from "../../../prisma/client";

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
  const candidacy = getCandidacyById({ candidacyId });

  if (!candidacy) {
    throw new Error("Aucune candidature n'a été trouvée");
  }

  if (
    userRoles.includes("candidate") &&
    !(await canCandidateUpdateCandidacy({ candidacyId }))
  ) {
    throw new Error(
      "Impossible de mettre à jour la candidature une fois le premier entretien effectué",
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
