import { CandidacyStatusStep } from "@prisma/client";

import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { getCertificationById } from "@/modules/referential/features/getCertificationById";
import {
  FunctionalCodeError,
  FunctionalError,
} from "@/modules/shared/error/functionalError";
import { logger } from "@/modules/shared/logger/logger";
import { prismaClient } from "@/prisma/client";

import { canCandidateUpdateCandidacy } from "../../features/canCandidateUpdateCandidacy";
import { updateCandidacyOrganism } from "../../features/updateCandidacyOrganism";
import { updateCandidacyStatus } from "../../features/updateCandidacyStatus";
import { resetTrainingInformation } from "../../training/features/resetTrainingInformation";

import { updateCertification } from "./updateCertification";

export const updateCertificationOfCandidacy = async ({
  candidacyId,
  certificationId,
  userKeycloakId,
  userEmail,
  userRoles,
}: {
  candidacyId: string;
  certificationId: string;
  userKeycloakId?: string;
  userEmail?: string;
  userRoles: KeyCloakUserRole[];
}) => {
  const candidacy = await prismaClient.candidacy.findFirst({
    where: { id: candidacyId },
    select: {
      id: true,
      status: true,
      typeAccompagnement: true,
    },
  });

  if (!candidacy) {
    throw new FunctionalError(
      FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
      `Aucune candidature n'a été trouvée`,
    );
  }

  if (
    !(await canCandidateUpdateCandidacy({
      candidacy,
      userKeycloakId,
      userRoles,
    }))
  ) {
    throw new Error(
      "Impossible de changer de certification après avoir confirmé le parcours",
    );
  }

  try {
    const newCertification = await getCertificationById({ certificationId });
    if (!newCertification) {
      throw new Error("Certification non trouvée");
    }

    await updateCertification({
      candidacyId,
      certificationId,
      author: "candidate",
      feasibilityFormat:
        candidacy.typeAccompagnement === "ACCOMPAGNE"
          ? newCertification.feasibilityFormat
          : "UPLOADED_PDF",
    });

    await updateCandidacyOrganism({
      candidacyId,
      organismId: null,
    });

    if (candidacy.status === CandidacyStatusStep.PARCOURS_ENVOYE) {
      await resetTrainingInformation({
        candidacyId,
        // We don't need to change the status, it will be done in the next step if relevant
        updateStatusToValidation: false,
        userKeycloakId,
        userEmail,
        userRoles,
      });
    }

    const hasActiveCandidacyInProject =
      candidacy.status === CandidacyStatusStep.PROJET;

    //Only update previous and create a new candidacy status if the candidacy is not already in project
    if (!hasActiveCandidacyInProject) {
      await updateCandidacyStatus({
        candidacyId,
        status: CandidacyStatusStep.PROJET,
      });
    }

    await prismaClient.candidacy.update({
      where: { id: candidacyId },
      data: {
        firstAppointmentOccuredAt: null,
      },
    });

    await logCandidacyAuditEvent({
      candidacyId: candidacyId,
      eventType: "CERTIFICATION_UPDATED",
      userKeycloakId,
      userEmail,
      userRoles,
      details: {
        certification: {
          id: certificationId,
          label: newCertification.label,
          codeRncp: newCertification.rncpId,
        },
      },
    });
  } catch (e) {
    logger.error(e);
    throw new FunctionalError(
      FunctionalCodeError.CERTIFICATION_NOT_UPDATED,
      `Erreur lors de la mise à jour de la certification`,
    );
  }
};
