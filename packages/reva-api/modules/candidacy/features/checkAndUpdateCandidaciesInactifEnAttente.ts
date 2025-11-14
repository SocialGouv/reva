import { ActiviteStatut, CandidacyEmailType } from "@prisma/client";
import { addDays, format, subDays } from "date-fns";

import { processInBatches } from "@/modules/shared/batch/processInBatches";
import { logger } from "@/modules/shared/logger/logger";
import { prismaClient } from "@/prisma/client";

import {
  INACTIF_CONFIRME_TRIGGER_DAYS,
  INACTIF_EN_ATTENTE_TRIGGER_AFTER_FEASIBILITY_ADMISSIBLE_DAYS,
  INACTIF_EN_ATTENTE_TRIGGER_BEFORE_FEASIBILITY_ADMISSIBLE_DAYS,
  INACTIF_TRIGGER_AFTER_FEASIBILITY_CANDIDACY_STATUSES,
  INACTIF_TRIGGER_BEFORE_FEASIBILITY_CANDIDACY_STATUSES,
} from "../constants/candidacy-inactif.constant";
import { sendInactifEnAttenteAfterFeasibilityAdmissibleToCandidate } from "../emails/sendInactifEnAttenteAfterFeasibilityAdmissibleToCandidate";
import { sendInactifEnAttenteBeforeFeasibilityAdmissibleToCandidate } from "../emails/sendInactifEnAttenteBeforeFeasibilityAdmissibleToCandidate";

export const checkAndUpdateCandidaciesInactifEnAttente = async () => {
  const thresholdDateInactifConfirme = format(
    addDays(new Date(), INACTIF_CONFIRME_TRIGGER_DAYS),
    "dd/MM/yyyy",
  );

  // Candidatures inactives avant d'avoir un dossier de faisabilité admissible
  const thresholdDateBeforeFeasibilityAdmissible = new Date(
    subDays(
      new Date(),
      INACTIF_EN_ATTENTE_TRIGGER_BEFORE_FEASIBILITY_ADMISSIBLE_DAYS,
    ),
  );

  try {
    const candidaciesBeforeFeasibilityAdmissible =
      await prismaClient.candidacy.findMany({
        where: {
          activite: ActiviteStatut.ACTIF,
          status: {
            in: INACTIF_TRIGGER_BEFORE_FEASIBILITY_CANDIDACY_STATUSES,
          },
          derniereDateActivite: {
            lte: thresholdDateBeforeFeasibilityAdmissible,
          },
          candidacyDropOut: {
            is: null,
          },
        },
        select: {
          id: true,
          derniereDateActivite: true,
          candidate: {
            select: {
              email: true,
              firstname: true,
              lastname: true,
              keycloakId: true,
            },
          },
        },
      });

    if (candidaciesBeforeFeasibilityAdmissible.length) {
      await processInBatches({
        items: candidaciesBeforeFeasibilityAdmissible,
        handler: async (batch) => {
          // Batch update candidacy statuses
          const candidacyIds = batch.map((c) => c.id);
          await prismaClient.candidacy.updateMany({
            where: {
              id: {
                in: candidacyIds,
              },
            },
            data: {
              activite: ActiviteStatut.INACTIF_EN_ATTENTE,
              dateInactifEnAttente: new Date(),
            },
          });

          // Send emails one by one
          for (const candidacy of batch) {
            const candidateEmail = candidacy.candidate?.email;
            const candidateFullName = `${candidacy.candidate?.firstname} ${candidacy.candidate?.lastname}`;
            const candidateKeycloakId = candidacy.candidate?.keycloakId;

            if (candidateEmail && candidateKeycloakId) {
              await sendInactifEnAttenteBeforeFeasibilityAdmissibleToCandidate({
                candidateEmail,
                thresholdDateInactifConfirme,
                candidateFullName,
              });

              await prismaClient.candidacyEmail.create({
                data: {
                  candidacyId: candidacy.id,
                  emailType:
                    CandidacyEmailType.INACTIF_EN_ATTENTE_BEFORE_FEASIBILITY_ADMISSIBLE_TO_CANDIDATE,
                },
              });
            }
          }
        },
      });
    }

    // Candidatures inactives après avoir un dossier de faisabilité admissible
    const thresholdDateAfterFeasibilityAdmissible = new Date(
      subDays(
        new Date(),
        INACTIF_EN_ATTENTE_TRIGGER_AFTER_FEASIBILITY_ADMISSIBLE_DAYS,
      ),
    );

    const candidaciesAfterFeasibilityAdmissible =
      await prismaClient.candidacy.findMany({
        where: {
          activite: ActiviteStatut.ACTIF,
          status: {
            in: INACTIF_TRIGGER_AFTER_FEASIBILITY_CANDIDACY_STATUSES,
          },
          derniereDateActivite: {
            lte: thresholdDateAfterFeasibilityAdmissible,
          },
          candidacyDropOut: {
            is: null,
          },
        },
        select: {
          id: true,
          derniereDateActivite: true,
          candidate: {
            select: {
              email: true,
              firstname: true,
              lastname: true,
              keycloakId: true,
            },
          },
        },
      });

    if (candidaciesAfterFeasibilityAdmissible.length) {
      await processInBatches({
        items: candidaciesAfterFeasibilityAdmissible,
        handler: async (batch) => {
          // Batch update candidacy statuses
          const candidacyIds = batch.map((c) => c.id);
          await prismaClient.candidacy.updateMany({
            where: {
              id: {
                in: candidacyIds,
              },
            },
            data: {
              activite: ActiviteStatut.INACTIF_EN_ATTENTE,
              dateInactifEnAttente: new Date(),
            },
          });

          // Send emails one by one
          for (const candidacy of batch) {
            const candidateEmail = candidacy.candidate?.email;
            const candidateFullName = `${candidacy.candidate?.firstname} ${candidacy.candidate?.lastname}`;
            const candidateKeycloakId = candidacy.candidate?.keycloakId;

            if (candidateEmail && candidateKeycloakId) {
              await sendInactifEnAttenteAfterFeasibilityAdmissibleToCandidate({
                candidateEmail,
                thresholdDateInactifConfirme,
                candidateFullName,
              });

              await prismaClient.candidacyEmail.create({
                data: {
                  candidacyId: candidacy.id,
                  emailType:
                    CandidacyEmailType.INACTIF_EN_ATTENTE_AFTER_FEASIBILITY_ADMISSIBLE_TO_CANDIDATE,
                },
              });
            }
          }
        },
      });
    }
  } catch (error) {
    logger.error(error);
  }
};
