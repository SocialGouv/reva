import { prismaClient } from "../../../prisma/client";
import { logCandidacyAuditEvent } from "../../candidacy-log/features/logCandidacyAuditEvent";
import { getOrganismById } from "../../organism/features/getOrganism";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import { logger } from "../../shared/logger";
import {
  sendNewOrganismCandidateNewCandidacyEmail,
  sendPreviousOrganismCandidateChangeOrganismEmail,
} from "../mails";
import { canCandidateUpdateCandidacy } from "./canCandidateUpdateCandidacy";
import { updateCandidacyOrganism } from "./updateCandidacyOrganism";

export const selectOrganismForCandidacy = async ({
  candidacyId,
  organismId,
  userKeycloakId,
  userEmail,
  userRoles,
}: {
  candidacyId: string;
  organismId: string;
  userKeycloakId?: string;
  userEmail?: string;
  userRoles: KeyCloakUserRole[];
}) => {
  const candidacy = await prismaClient.candidacy.findFirst({
    where: { id: candidacyId },
    select: {
      id: true,
      organism: true,
      firstAppointmentOccuredAt: true,
      candidate: true,
      candidacyStatuses: true,
      certificationId: true,
    },
  });

  if (!candidacy) {
    throw new FunctionalError(
      FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
      `Aucune candidature n'a été trouvée`,
    );
  }

  if (!(await canCandidateUpdateCandidacy({ candidacyId }))) {
    throw new Error(
      "Impossible de mettre à jour la candidature une fois le premier entretien effetué",
    );
  }

  try {
    const updatedCandidacy = await updateCandidacyOrganism({
      candidacyId,
      organismId,
    });

    await prismaClient.candidacy.update({
      where: { id: candidacyId },
      data: { firstAppointmentOccuredAt: null },
    });

    const { candidate, organism, firstAppointmentOccuredAt, certificationId } =
      candidacy;
    const certification = await prismaClient.certification.findUnique({
      where: { id: certificationId || "" },
    });

    const currentCandidacyStatus = candidacy.candidacyStatuses.find(
      (status) => status.isActive == true,
    );
    const isValidStatus =
      currentCandidacyStatus &&
      (currentCandidacyStatus?.status == "PRISE_EN_CHARGE" ||
        currentCandidacyStatus?.status == "VALIDATION");

    const newOrganism = await getOrganismById({ organismId });

    if (!newOrganism) {
      throw new Error("Organisme non trouvé");
    }

    if (
      candidate &&
      organism &&
      organism?.id != organismId &&
      certification &&
      isValidStatus
    ) {
      sendPreviousOrganismCandidateChangeOrganismEmail({
        email: organism.contactAdministrativeEmail,
        candidateFullName: `${candidate.firstname} ${candidate.lastname}`,
        certificationName: certification.label,
        date: firstAppointmentOccuredAt,
      });

      sendNewOrganismCandidateNewCandidacyEmail({
        email: newOrganism.contactAdministrativeEmail,
      });
    }

    await logCandidacyAuditEvent({
      candidacyId,
      eventType: "ORGANISM_SELECTED",
      userKeycloakId,
      userEmail,
      userRoles,
      details: { organism: { id: newOrganism.id, label: newOrganism.label } },
    });

    return updatedCandidacy;
  } catch (e) {
    logger.error(e);
    throw new FunctionalError(
      FunctionalCodeError.ORGANISM_NOT_UPDATED,
      `Erreur lors de la mise à jour de l'organisme`,
    );
  }
};
