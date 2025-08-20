import { ActiviteStatut } from "@prisma/client";
import { subDays } from "date-fns";

import { logger } from "@/modules/shared/logger";
import { prismaClient } from "@/prisma/client";

import {
  INACTIF_CONFIRME_TRIGGER_DAYS,
  INACTIF_TRIGGER_AFTER_FEASIBILITY_CANDIDACY_STATUSES,
  INACTIF_TRIGGER_BEFORE_FEASIBILITY_CANDIDACY_STATUSES,
} from "../constants/candidacy-inactif.constant";

import { archiveCandidacies } from "./archiveCandidacies";
import { dropOutCandidacies } from "./dropOutCandidacies";

export const checkAndUpdateCandidaciesInactifConfirme = async () => {
  const thresholdDateInactifConfirme = subDays(
    new Date(),
    INACTIF_CONFIRME_TRIGGER_DAYS,
  );

  try {
    // Candidatures inactives en attente avant d'avoir un dossier de faisabilité admissible
    const candidaciesInactifEnAttenteBeforeFeasibilityAdmissibleToArchive =
      await prismaClient.candidacy.findMany({
        where: {
          activite: ActiviteStatut.INACTIF_EN_ATTENTE,
          status: {
            in: INACTIF_TRIGGER_BEFORE_FEASIBILITY_CANDIDACY_STATUSES,
          },
          dateInactifEnAttente: {
            lte: thresholdDateInactifConfirme,
          },
          candidacyDropOut: {
            is: null,
          },
        },
        select: {
          id: true,
        },
      });

    const candidaciesToArchiveIds =
      candidaciesInactifEnAttenteBeforeFeasibilityAdmissibleToArchive.map(
        ({ id }) => id,
      );
    if (candidaciesToArchiveIds.length) {
      await archiveCandidacies({
        candidacyIds: candidaciesToArchiveIds,
        archivingReason: "INACTIVITE_CANDIDAT",
      });
      await prismaClient.candidacy.updateMany({
        where: {
          id: {
            in: candidaciesToArchiveIds,
          },
        },
        data: {
          activite: ActiviteStatut.INACTIF_CONFIRME,
        },
      });
    }

    // Candidatures inactives en attente après avoir un dossier de faisabilité admissible
    const candidaciesInactifEnAttenteAfterFeasibilityAdmissibleToDropOut =
      await prismaClient.candidacy.findMany({
        where: {
          activite: ActiviteStatut.INACTIF_EN_ATTENTE,
          status: {
            in: INACTIF_TRIGGER_AFTER_FEASIBILITY_CANDIDACY_STATUSES,
          },
          dateInactifEnAttente: {
            lte: thresholdDateInactifConfirme,
          },
          candidacyDropOut: {
            is: null,
          },
        },
        select: {
          id: true,
        },
      });

    const candidacyToDropOutIds =
      candidaciesInactifEnAttenteAfterFeasibilityAdmissibleToDropOut.map(
        ({ id }) => id,
      );

    if (candidacyToDropOutIds.length) {
      const dropOutReasonId = await prismaClient.dropOutReason.findFirst({
        where: {
          label: "Inactivité depuis 6 mois",
        },
      });
      await dropOutCandidacies({
        candidacyIds: candidacyToDropOutIds,
        dropOutReasonId: dropOutReasonId?.id || "",
        proofReceivedByAdmin: true,
      });

      await prismaClient.candidacy.updateMany({
        where: {
          id: {
            in: candidacyToDropOutIds,
          },
        },
        data: {
          activite: ActiviteStatut.INACTIF_CONFIRME,
        },
      });
    }
  } catch (error) {
    logger.error(error);
  }
};
