import { CandidacyEmailType } from "@prisma/client";
import { addDays, format, subDays } from "date-fns";
import { logger } from "modules/shared/logger";
import { prismaClient } from "../../../prisma/client";
import {
  ACTUALISATION_THRESHOLD_DAYS,
  CADUCITE_THRESHOLD_DAYS,
  CADUCITE_VALID_STATUSES,
} from "../../shared/candidacy/candidacyCaducite";
import { sendCandidacyCaduciteSoonWarningEmailToAap } from "../emails/sendCandidacyCaduciteSoonWarningEmailToAap";
import { sendCandidacyCaduciteSoonWarningEmailToCandidate } from "../emails/sendCandidacyCaduciteSoonWarningEmailToCandidate";
import { sendCandidacyIsCaduqueEmailToAap } from "../emails/sendCandidacyIsCaduqueEmailToAap";

const WHERE_CLAUSE_FOR_CANDIDACY_CADUQUE_AND_SOON = {
  status: { in: CADUCITE_VALID_STATUSES },
  Feasibility: {
    some: {
      isActive: true,
      decision: "ADMISSIBLE",
    },
  },
  candidacyDropOut: null,
} as const;

export const sendEmailsForAutoCandidacyCaducite = async () => {
  const dateThresholdCandidacyIsCaduque = subDays(
    new Date(),
    CADUCITE_THRESHOLD_DAYS,
  );

  const dateThresholdActualisation = subDays(
    new Date(),
    ACTUALISATION_THRESHOLD_DAYS,
  );

  const dateThresholdWillBeCaduque = format(
    addDays(new Date(), CADUCITE_THRESHOLD_DAYS - ACTUALISATION_THRESHOLD_DAYS),
    "dd/MM/yyyy",
  );

  // Send warning emails to candidates whose candidacy will soon be caduque
  try {
    const candidaciesToSendEmailIsCaduciteSoonWarningToCandidate =
      await prismaClient.candidacy.findMany({
        where: {
          ...WHERE_CLAUSE_FOR_CANDIDACY_CADUQUE_AND_SOON,
          lastActivityDate: {
            lte: dateThresholdActualisation,
            gt: dateThresholdCandidacyIsCaduque,
          },
          CandidacyEmail: {
            none: {
              emailType:
                CandidacyEmailType.CANDIDACY_IS_CADUQUE_SOON_WARNING_TO_CANDIDATE,
              sentAt: {
                lte: dateThresholdActualisation,
              },
            },
          },
        },
        select: {
          id: true,
          candidate: {
            select: {
              email: true,
              firstname: true,
              lastname: true,
            },
          },
        },
      });
    for (const candidacy of candidaciesToSendEmailIsCaduciteSoonWarningToCandidate) {
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
          ...WHERE_CLAUSE_FOR_CANDIDACY_CADUQUE_AND_SOON,
          lastActivityDate: {
            lte: dateThresholdActualisation,
            gt: dateThresholdCandidacyIsCaduque,
          },
          CandidacyEmail: {
            none: {
              emailType:
                CandidacyEmailType.CANDIDACY_IS_CADUQUE_SOON_WARNING_TO_AAP,
              sentAt: {
                lte: dateThresholdActualisation,
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
          ...WHERE_CLAUSE_FOR_CANDIDACY_CADUQUE_AND_SOON,
          lastActivityDate: {
            lte: dateThresholdCandidacyIsCaduque,
          },
          CandidacyEmail: {
            none: {
              emailType: CandidacyEmailType.CANDIDACY_IS_CADUQUE_NOTICE_TO_AAP,
              sentAt: {
                lte: dateThresholdCandidacyIsCaduque,
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
