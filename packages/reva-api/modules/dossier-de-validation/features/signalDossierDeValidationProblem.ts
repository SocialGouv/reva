import { updateCandidacyStatus } from "@/modules/candidacy/features/updateCandidacyStatus";
import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { prismaClient } from "@/prisma/client";

import {
  sendDVReportedToCandidateAutonomeEmail,
  sendDVReportedToOrganismEmail,
} from "../emails";

import { getDossierDeValidationById } from "./getDossierDeValidationById";

export const signalDossierDeValidationProblem = async ({
  dossierDeValidationId,
  decisionComment,
  userKeycloakId,
  userEmail,
  userRoles,
}: {
  dossierDeValidationId: string;
  decisionComment: string;
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
    throw new Error(
      "Impossible de demander une correction sur ce dossier. Il est inactif",
    );
  }

  if (dossierDeValidation.decision !== "PENDING") {
    throw new Error(
      "Impossible de demander une correction sur ce dossier. Il n'est pas en cours",
    );
  }

  const activeJury = await prismaClient.jury.findFirst({
    where: { candidacyId: dossierDeValidation.candidacyId, isActive: true },
  });

  if (activeJury) {
    throw new Error(
      "Impossible de demander une correction sur ce dossier. Un jury a déjà été planifié.",
    );
  }

  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: dossierDeValidation.candidacyId },
    include: {
      organism: true,
      candidate: true,
      certification: { select: { label: true } },
    },
  });
  if (!candidacy) {
    throw new Error("La candidature n'a pas été trouvée");
  }

  const feasibility = await prismaClient.feasibility.findFirst({
    where: { candidacyId: dossierDeValidation.candidacyId, isActive: true },
    include: { certificationAuthority: { select: { label: true } } },
  });

  const organism = candidacy?.organism;
  const updatedDossierDeValidation =
    await prismaClient.dossierDeValidation.update({
      where: { id: dossierDeValidationId },
      data: {
        decisionComment,
        decision: "INCOMPLETE",
        decisionSentAt: new Date(),
      },
    });

  await updateCandidacyStatus({
    candidacyId: dossierDeValidation.candidacyId,
    status: "DOSSIER_DE_VALIDATION_SIGNALE",
  });

  const isAutonome = candidacy?.typeAccompagnement === "AUTONOME";

  if (isAutonome) {
    const certificationName =
      candidacy?.certification?.label || "certification inconnue";
    const certificationAuthorityLabel =
      feasibility?.certificationAuthority?.label || "certificateur inconnu";
    sendDVReportedToCandidateAutonomeEmail({
      email: candidacy?.candidate?.email as string,
      decisionComment,
      certificationName,
      certificationAuthorityLabel,
    });
  } else {
    if (organism?.contactAdministrativeEmail) {
      sendDVReportedToOrganismEmail({
        email: organism?.contactAdministrativeEmail,
        candadicyId: updatedDossierDeValidation.candidacyId,
        decisionComment,
      });
    }
  }

  await logCandidacyAuditEvent({
    candidacyId: dossierDeValidation.candidacyId,
    userKeycloakId,
    userRoles,
    userEmail,
    eventType: "DOSSIER_DE_VALIDATION_PROBLEM_SIGNALED",
  });

  return updatedDossierDeValidation;
};
