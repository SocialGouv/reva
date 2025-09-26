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
    },
  });

  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  await prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: {
      endAccompagnementStatus: endAccompagnement
        ? "CONFIRMED_BY_CANDIDATE"
        : "NOT_REQUESTED",
      endAccompagnementDate: endAccompagnement
        ? candidacy.endAccompagnementDate
        : null,
    },
  });

  const candidateFullName = `${candidacy.candidate?.firstname} ${candidacy.candidate?.lastname}`;
  const aapLabel = candidacy.organism?.label;
  const candidacyUrl = getBackofficeUrl({
    path: `/candidacies/${candidacyId}/summary`,
  });
  const organismEmail =
    candidacy.organism?.emailContact ||
    candidacy.organism?.contactAdministrativeEmail;
  const endAccompagnementDate = candidacy.endAccompagnementDate;

  if (organismEmail && aapLabel && endAccompagnementDate) {
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
    userKeycloakId,
    userEmail,
    userRoles,
  });

  return candidacy;
};
