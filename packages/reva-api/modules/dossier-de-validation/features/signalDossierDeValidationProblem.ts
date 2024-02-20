import { prismaClient } from "../../../prisma/client";
import { logCandidacyAuditEvent } from "../../candidacy-log/features/logCandidacyAuditEvent";
import { getCandidacyActiveStatus } from "../../candidacy/features/getCandidacyActiveStatus";
import { getOrganismByCandidacyId } from "../../candidacy/features/getOrganismByCandidacyId";
import { updateCandidacyStatus } from "../../candidacy/features/updateCandidacyStatus";
import { sendDVSignalToOrganismEmail } from "../emails";
import { getDossierDeValidationById } from "./getDossierDeValidationById";

export const signalDossierDeValidationProblem = async ({
  dossierDeValidationId,
  decisionComment,
  userKeycloakId,
}: {
  dossierDeValidationId: string;
  decisionComment: string;
  userKeycloakId?: string;
}) => {
  const dossierDeValidation = await getDossierDeValidationById({
    dossierDeValidationId,
  });

  if (!dossierDeValidation) {
    throw new Error("Le dossier de validation n'a pas été trouvé");
  }

  if (!dossierDeValidation.isActive) {
    throw new Error(
      "Impossible de signaler un problème sur ce dossier. Il est inactif",
    );
  }

  if (dossierDeValidation.decision !== "PENDING") {
    throw new Error(
      "Impossible de signaler un problème sur ce dossier. Il n'est pas en cours",
    );
  }

  const candidacyStatus = await getCandidacyActiveStatus({
    candidacyId: dossierDeValidation.candidacyId,
  });

  if (candidacyStatus.status !== "DOSSIER_DE_VALIDATION_ENVOYE") {
    throw new Error(
      "Impossible de signaler un problème sur ce dossier. Le statut de la candidature est invalide",
    );
  }

  const candidacy = await getOrganismByCandidacyId({
    candidacyId: dossierDeValidation.candidacyId,
  });

  const organism = candidacy?.organism;
  const updatedDossierDeValidation =
    await prismaClient.dossierDeValidation.update({
      where: { id: dossierDeValidationId, isActive: true },
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

  if (organism?.contactAdministrativeEmail) {
    sendDVSignalToOrganismEmail({
      email: organism?.contactAdministrativeEmail,
      candadicyId: updatedDossierDeValidation.candidacyId,
      decisionComment,
    });
  }

  await logCandidacyAuditEvent({
    candidacyId: dossierDeValidation.candidacyId,
    userKeycloakId,
    eventType: "DOSSIER_DE_VALIDATION_PROBLEM_SIGNALED",
  });

  return updatedDossierDeValidation;
};
