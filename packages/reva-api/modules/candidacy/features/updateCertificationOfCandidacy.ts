import { CandidacyStatusStep } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import { logger } from "../../shared/logger";
import {
  existsCandidacyWithActiveStatus,
  updateCandidacyStatus,
  updateCertification,
  updateOrganism,
} from "../database/candidacies";
import { canCandidateUpdateCandidacy } from "./canCandidateUpdateCandidacy";
import { logCandidacyAuditEvent } from "../../candidacy-log/features/logCandidacyAuditEvent";
import { getCertificationById } from "../../referential/features/getCertificationById";

export const updateCertificationOfCandidacy = async ({
  candidacyId,
  certificationId,
  departmentId,
  userKeycloakId,
  userEmail,
  userRoles,
}: {
  candidacyId: string;
  certificationId: string;
  departmentId: string;
  userKeycloakId?: string;
  userEmail?: string;
  userRoles: KeyCloakUserRole[];
}) => {
  const candidacy = await prismaClient.candidacy.findFirst({
    where: { id: candidacyId },
    select: {
      id: true,
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
    const newCertification = await getCertificationById({ certificationId });

    (
      await updateCertification({
        candidacyId,
        certificationId,
        departmentId,
        author: "candidate",
      })
    ).unsafeCoerce();

    const updatedCandidacy = (
      await updateOrganism({ candidacyId, organismId: null })
    ).unsafeCoerce();

    const hasActiveCandidacyInProject = (
      await existsCandidacyWithActiveStatus({
        candidacyId,
        status: CandidacyStatusStep.PROJET,
      })
    ).unsafeCoerce();

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

    return updatedCandidacy;
  } catch (e) {
    logger.error(e);
    throw new FunctionalError(
      FunctionalCodeError.CERTIFICATION_NOT_UPDATED,
      `Erreur lors de la mise à jour de la certification`,
    );
  }
};
