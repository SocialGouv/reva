import { format } from "date-fns";

import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { getBackofficeUrl } from "@/modules/shared/email/backoffice.url.helpers";
import { prismaClient } from "@/prisma/client";

import { sendEndAccompagnementConfirmedToAap } from "../emails/sendEndAccompagnementConfirmedToAap";
import { sendEndAccompagnementRefusedToAap } from "../emails/sendEndAccompagnementRefusedToAap";

export const updateCandidacyEndAccompagnementDecision = async ({
  endAccompagnement,
  candidacyId,
  userKeycloakId,
  userEmail,
  userRoles,
}: {
  endAccompagnement: boolean;
  candidacyId: string;
  userKeycloakId: string;
  userEmail: string;
  userRoles: KeyCloakUserRole[];
}) => {
  const candidacy = await prismaClient.candidacy.findFirst({
    where: { id: candidacyId },
    include: {
      candidate: true,
      organism: true,
      Feasibility: { where: { isActive: true } },
    },
  });

  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  const endAccompagnementDate = candidacy.endAccompagnementDate!;
  if (!endAccompagnementDate) {
    throw new Error("Date de fin d'accompagnement non trouvée");
  }

  if (candidacy.endAccompagnementStatus !== "PENDING") {
    throw new Error("Aucune fin d'accompagnement en attente de confirmation");
  }

  const feasibility = candidacy.Feasibility[0];

  if (endAccompagnement) {
    if (!feasibility || feasibility?.decision === "DRAFT") {
      await prismaClient.candidacy.update({
        where: { id: candidacyId },
        data: {
          endAccompagnementStatus: "NOT_REQUESTED",
          endAccompagnementDate: null,
          endAccompagnementReason: null,
          endAccompagnementCandidateDropOutReasonId: null,
          organismId: null,
          sentAt: null,
          status: "PROJET",
        },
      });

      await prismaClient.candidaciesStatus.deleteMany({
        where: {
          candidacyId,
          status: { not: "PROJET" },
        },
      });
    } else {
      await prismaClient.candidacy.update({
        where: { id: candidacyId },
        data: {
          endAccompagnementStatus: "CONFIRMED_BY_CANDIDATE",
        },
      });
    }
  } else {
    await prismaClient.candidacy.update({
      where: { id: candidacyId },
      data: {
        endAccompagnementStatus: "NOT_REQUESTED",
        endAccompagnementDate: null,
      },
    });
  }

  const candidateFullName = `${candidacy.candidate?.firstname} ${candidacy.candidate?.lastname}`;
  const aapLabel = candidacy.organism?.label;
  const candidacyUrl = getBackofficeUrl({
    path: `/candidacies/${candidacyId}/summary`,
  });
  const organismEmail =
    candidacy.organism?.emailContact ||
    candidacy.organism?.contactAdministrativeEmail;

  if (organismEmail && aapLabel) {
    const endAccompagnementDateFormatted = format(
      endAccompagnementDate,
      "dd/MM/yyyy",
    );
    if (endAccompagnement) {
      await sendEndAccompagnementConfirmedToAap({
        email: organismEmail,
        aapLabel,
        candidateFullName,
        endAccompagnementDate: endAccompagnementDateFormatted,
        candidacyUrl,
      });
    }

    if (!endAccompagnement) {
      await sendEndAccompagnementRefusedToAap({
        email: organismEmail,
        aapLabel,
        candidateFullName,
        endAccompagnementDate: endAccompagnementDateFormatted,
        candidacyUrl,
      });
    }
  }

  await logCandidacyAuditEvent({
    candidacyId,
    tx: prismaClient,
    eventType: endAccompagnement
      ? "CANDIDATE_CONFIRMED_END_ACCOMPAGNEMENT"
      : "CANDIDATE_REFUSED_END_ACCOMPAGNEMENT",
    details: {
      organism: candidacy.organism
        ? { id: candidacy.organism.id, label: candidacy.organism.label }
        : undefined,
    },
    userKeycloakId,
    userEmail,
    userRoles,
  });

  return candidacy;
};
