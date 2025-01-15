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

const _sendEmailsForAutoCandidacyCaducite = async () => {
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

  const [
    candidaciesToSendEmailIsCaduqueToAap,
    candidaciesToSendEmailIsCaduciteSoonWarningToAap,
    candidaciesToSendEmailIsCaduciteSoonWarningToCandidate,
  ] = await prismaClient.$transaction([
    prismaClient.candidacy.findMany({
      where: {
        lastActivityDate: {
          lte: dateThresholdCandidacyIsCaduque,
        },
        status: { in: CADUCITE_VALID_STATUSES },
        Feasibility: {
          some: {
            isActive: true,
            decision: "ADMISSIBLE",
          },
        },
        CandidacyEmail: {
          none: {
            emailType: CandidacyEmailType.CANDIDACY_IS_CADUQUE_NOTICE_TO_AAP,
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
    }),
    prismaClient.candidacy.findMany({
      where: {
        lastActivityDate: {
          lte: dateThresholdActualisation,
          gt: dateThresholdCandidacyIsCaduque,
        },
        status: { in: CADUCITE_VALID_STATUSES },
        Feasibility: {
          some: {
            isActive: true,
            decision: "ADMISSIBLE",
          },
        },
        CandidacyEmail: {
          none: {
            emailType:
              CandidacyEmailType.CANDIDACY_IS_CADUQUE_SOON_WARNING_TO_AAP,
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
    }),
    prismaClient.candidacy.findMany({
      where: {
        lastActivityDate: {
          lte: dateThresholdActualisation,
          gt: dateThresholdCandidacyIsCaduque,
        },
        status: { in: CADUCITE_VALID_STATUSES },
        Feasibility: {
          some: {
            isActive: true,
            decision: "ADMISSIBLE",
          },
        },
        CandidacyEmail: {
          none: {
            emailType:
              CandidacyEmailType.CANDIDACY_IS_CADUQUE_SOON_WARNING_TO_CANDIDATE,
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
    }),
  ]);

  // Send emails to candidate caducite soon warning
  try {
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

    // Send emails to AAP caducite soon warning
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
      data: candidaciesToSendEmailIsCaduciteSoonWarningToCandidate.map((c) => ({
        candidacyId: c.id,
        emailType: CandidacyEmailType.CANDIDACY_IS_CADUQUE_SOON_WARNING_TO_AAP,
      })),
    });

    // Send emails to aap candidacy is caduque
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
      `Erreur pendant l'envoi des emails de candidature caducite proche`,
      e,
    );
  }
};
