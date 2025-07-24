import { CandidacyEmailType } from "@prisma/client";
import { addDays, format, subDays } from "date-fns";

import {
  ACTUALISATION_THRESHOLD_DAYS,
  CADUCITE_THRESHOLD_DAYS,
  WHERE_CLAUSE_CANDIDACY_CADUQUE_AND_ACTUALISATION,
} from "@/modules/shared/candidacy/candidacyCaducite";
import { logger } from "@/modules/shared/logger";
import { prismaClient } from "@/prisma/client";

import { sendCandidacyCaduciteSoonWarningEmailToAap } from "../emails/sendCandidacyCaduciteSoonWarningEmailToAap";
import { sendCandidacyCaduciteSoonWarningEmailToCandidate } from "../emails/sendCandidacyCaduciteSoonWarningEmailToCandidate";
import { sendCandidacyIsCaduqueEmailToAap } from "../emails/sendCandidacyIsCaduqueEmailToAap";

export const sendEmailsForAutoCandidacyCaducite = async () => {
  const today = new Date();

  // Date à partir de laquelle la candidature sera considérée comme caduque
  const dateThresholdCandidacyIsCaduque = subDays(
    today,
    CADUCITE_THRESHOLD_DAYS,
  );

  // Date à partir de laquelle le candidat devra actualiser sa candidature
  const dateThresholdActualisation = subDays(
    today,
    ACTUALISATION_THRESHOLD_DAYS,
  );

  // Send warning emails to candidates whose candidacy will soon be caduque
  try {
    const candidaciesToSendEmailIsCaduciteSoonWarningToCandidate =
      await prismaClient.candidacy.findMany({
        where: {
          ...WHERE_CLAUSE_CANDIDACY_CADUQUE_AND_ACTUALISATION,
          lastActivityDate: {
            lte: dateThresholdActualisation,
            gt: dateThresholdCandidacyIsCaduque,
          },
          CandidacyEmail: {
            none: {
              emailType:
                CandidacyEmailType.CANDIDACY_IS_CADUQUE_SOON_WARNING_TO_CANDIDATE,
              sentAt: {
                gte: dateThresholdActualisation,
              },
            },
          },
        },
        select: {
          id: true,
          lastActivityDate: true,
          candidate: {
            select: {
              email: true,
              firstname: true,
              lastname: true,
            },
          },
        },
        take: 100,
      });
    for (const candidacy of candidaciesToSendEmailIsCaduciteSoonWarningToCandidate) {
      if (!candidacy.lastActivityDate) {
        logger.error(
          `La candidature ${candidacy.id} n'a pas de date de dernière activité`,
          candidacy,
        );
        continue;
      }
      // Calculer la date exacte à laquelle cette candidature deviendra caduque
      const exactCaduciteDate = addDays(
        candidacy.lastActivityDate,
        CADUCITE_THRESHOLD_DAYS,
      );
      const dateThresholdWillBeCaduque = format(
        exactCaduciteDate,
        "dd/MM/yyyy",
      );

      await sendCandidacyCaduciteSoonWarningEmailToCandidate({
        candidateEmail: candidacy.candidate?.email || "",
        candidateFullName: `${candidacy.candidate?.firstname} ${candidacy.candidate?.lastname}`,
        dateThresholdWillBeCaduque,
      });
    }

    await prismaClient.candidacyEmail.createMany({
      data: candidaciesToSendEmailIsCaduciteSoonWarningToCandidate.map((c) => ({
        candidacyId: c.id,
        emailType:
          CandidacyEmailType.CANDIDACY_IS_CADUQUE_SOON_WARNING_TO_CANDIDATE,
      })),
    });
  } catch (e) {
    logger.error(
      `Erreur pendant l'envoi des emails d'avertissement de caducité aux candidats`,
      e,
    );
  }

  // Send warning emails to AAPs about candidacies that will soon be caduque
  try {
    const candidaciesToSendEmailIsCaduciteSoonWarningToAap =
      await prismaClient.candidacy.findMany({
        where: {
          ...WHERE_CLAUSE_CANDIDACY_CADUQUE_AND_ACTUALISATION,
          lastActivityDate: {
            lte: dateThresholdActualisation,
            gt: dateThresholdCandidacyIsCaduque,
          },
          CandidacyEmail: {
            none: {
              emailType:
                CandidacyEmailType.CANDIDACY_IS_CADUQUE_SOON_WARNING_TO_AAP,
              sentAt: {
                gte: dateThresholdActualisation,
              },
            },
          },
        },
        select: {
          id: true,
          organism: {
            select: {
              emailContact: true,
              contactAdministrativeEmail: true,
              nomPublic: true,
              label: true,
            },
          },
          candidate: {
            select: {
              firstname: true,
              lastname: true,
            },
          },
        },
        take: 100,
      });
    for (const candidacy of candidaciesToSendEmailIsCaduciteSoonWarningToAap) {
      const aapEmail =
        candidacy.organism?.emailContact ||
        candidacy.organism?.contactAdministrativeEmail ||
        "";
      const aapLabel =
        candidacy.organism?.nomPublic || candidacy.organism?.label || "";
      const candidateFullName = `${candidacy.candidate?.firstname} ${candidacy.candidate?.lastname}`;
      await sendCandidacyCaduciteSoonWarningEmailToAap({
        aapEmail,
        aapLabel,
        candidateFullName,
      });
    }

    await prismaClient.candidacyEmail.createMany({
      data: candidaciesToSendEmailIsCaduciteSoonWarningToAap.map((c) => ({
        candidacyId: c.id,
        emailType: CandidacyEmailType.CANDIDACY_IS_CADUQUE_SOON_WARNING_TO_AAP,
      })),
    });
  } catch (e) {
    logger.error(
      `Erreur pendant l'envoi des emails d'avertissement de caducité aux AAP`,
      e,
    );
  }

  // Send notification emails to AAPs about candidacies that are now caduque
  try {
    const candidaciesToSendEmailIsCaduqueToAap =
      await prismaClient.candidacy.findMany({
        where: {
          ...WHERE_CLAUSE_CANDIDACY_CADUQUE_AND_ACTUALISATION,
          lastActivityDate: {
            lte: dateThresholdCandidacyIsCaduque,
          },
          CandidacyEmail: {
            none: {
              emailType: CandidacyEmailType.CANDIDACY_IS_CADUQUE_NOTICE_TO_AAP,
              sentAt: {
                gte: dateThresholdCandidacyIsCaduque,
              },
            },
          },
        },
        select: {
          id: true,
          organism: {
            select: {
              emailContact: true,
              contactAdministrativeEmail: true,
              nomPublic: true,
              label: true,
            },
          },
          candidate: {
            select: {
              firstname: true,
              lastname: true,
            },
          },
        },
        take: 100,
      });

    for (const candidacy of candidaciesToSendEmailIsCaduqueToAap) {
      const aapEmail =
        candidacy.organism?.emailContact ||
        candidacy.organism?.contactAdministrativeEmail ||
        "";
      const aapLabel =
        candidacy.organism?.nomPublic || candidacy.organism?.label || "";
      const candidateFullName = `${candidacy.candidate?.firstname} ${candidacy.candidate?.lastname}`;
      await sendCandidacyIsCaduqueEmailToAap({
        aapEmail,
        aapLabel,
        candidateFullName,
      });
    }

    await prismaClient.candidacyEmail.createMany({
      data: candidaciesToSendEmailIsCaduqueToAap.map((c) => ({
        candidacyId: c.id,
        emailType: CandidacyEmailType.CANDIDACY_IS_CADUQUE_NOTICE_TO_AAP,
      })),
    });
  } catch (e) {
    logger.error(
      `Erreur pendant l'envoi des emails de notification de caducité aux AAP`,
      e,
    );
  }
};
