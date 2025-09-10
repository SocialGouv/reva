import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { prismaClient } from "@/prisma/client";

import { getDossierDeValidationById } from "./getDossierDeValidationById";

export const markDossierDeValidationAsComplete = async ({
  dossierDeValidationId,
  decisionComment,
  userKeycloakId,
  userEmail,
  userRoles,
}: {
  dossierDeValidationId: string;
  decisionComment?: string;
  userKeycloakId?: string;
  userEmail?: string;
  userRoles: KeyCloakUserRole[];
}) => {
  const dossierDeValidation = await getDossierDeValidationById({
    dossierDeValidationId,
  });

  if (!dossierDeValidation) {
    throw new Error("Le dossier de validation n'a pas été trouvé");
  }

  if (!dossierDeValidation.isActive) {
    throw new Error("Impossible de valider ce dossier. Il est inactif");
  }

  if (dossierDeValidation.decision !== "PENDING") {
    throw new Error("Impossible de valider ce dossier. Il n'est pas en cours");
  }

  const activeJury = await prismaClient.jury.findFirst({
    where: { candidacyId: dossierDeValidation.candidacyId, isActive: true },
  });

  if (activeJury) {
    throw new Error(
      "Impossible de valider ce dossier. Un jury a déjà été planifié.",
    );
  }

  const updatedDossierDeValidation =
    await prismaClient.dossierDeValidation.update({
      where: { id: dossierDeValidationId },
      data: {
        decisionComment,
        decision: "COMPLETE",
        decisionSentAt: new Date(),
      },
    });

  await logCandidacyAuditEvent({
    candidacyId: dossierDeValidation.candidacyId,
    userKeycloakId,
    userRoles,
    userEmail,
    eventType: "DOSSIER_DE_VALIDATION_VERIFIED",
  });

  return updatedDossierDeValidation;
};
