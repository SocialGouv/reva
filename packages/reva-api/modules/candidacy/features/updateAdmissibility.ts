import { isBefore } from "date-fns";

import { Admissibility } from "../candidacy.types";
import { getAdmissibilityByCandidacyId } from "./getAdmissibilityByCandidacyId";
import { prismaClient } from "../../../prisma/client";
import { logCandidacyAuditEvent } from "../../candidacy-log/features/logCandidacyAuditEvent";

const isBefore2019 = (date: Date) => isBefore(date, new Date(2019, 0));

export const updateAdmissibility = async ({
  candidacyId,
  admissibility,
  userKeycloakId,
  userEmail,
  userRoles,
}: {
  candidacyId: string;
  admissibility: Partial<Admissibility>;
  userKeycloakId?: string;
  userEmail?: string;
  userRoles: KeyCloakUserRole[];
}) => {
  if (admissibility.reportSentAt && isBefore2019(admissibility.reportSentAt)) {
    throw new Error(
      "La date d'envoi du dossier de la faisabilité doit être après 2019 ",
    );
  }
  if (
    admissibility.certifierRespondedAt &&
    isBefore2019(admissibility.certifierRespondedAt)
  ) {
    throw new Error(
      "La date du prononcé de la recevabilité doit être après 2019 ",
    );
  }
  if (
    admissibility.responseAvailableToCandidateAt &&
    isBefore2019(admissibility.responseAvailableToCandidateAt)
  ) {
    throw new Error(
      "La date de réception de l'avis de recevabilité doit être après 2019",
    );
  }

  const existingAdmissibility = await getAdmissibilityByCandidacyId({
    candidacyId,
  });

  if (!existingAdmissibility) {
    throw new Error("Erreur admissibilité non trouvé pour la candidature");
  }

  const result = await prismaClient.admissibility.update({
    where: { id: existingAdmissibility.id },
    data: {
      ...existingAdmissibility,
      certifierRespondedAt: null,
      reportSentAt: null,
      responseAvailableToCandidateAt: null,
      status: null,
      ...admissibility,
    },
  });

  await logCandidacyAuditEvent({
    candidacyId,
    eventType: "ADMISSIBILITY_UPDATED",
    userKeycloakId,
    userEmail,
    userRoles,
  });

  return result;
};
