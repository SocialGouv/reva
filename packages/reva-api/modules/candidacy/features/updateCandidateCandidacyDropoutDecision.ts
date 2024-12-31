import { prismaClient } from "../../../prisma/client";
import { logCandidacyAuditEvent } from "../../candidacy-log/features/logCandidacyAuditEvent";

export const updateCandidateCandidacyDropoutDecision = async ({
  candidacyId,
  dropOutConfirmed,
  userInfo,
}: {
  candidacyId: string;
  dropOutConfirmed: Date;
  userInfo: {
    userKeycloakId?: string;
    userEmail?: string;
    userRoles: KeyCloakUserRole[];
  };
}) => {
  const dropOut = await prismaClient.candidacyDropOut.findUnique({
    where: { candidacyId },
  });

  if (!dropOut) {
    throw new Error("Aucun abandon trouvé pour cette candidature");
  }

  if (dropOut.dropOutConfirmedByCandidate) {
    throw new Error(
      "La décision d'abandon a déjà été confirmée par le candidat",
    );
  }

  if (dropOutConfirmed) {
    const candidacy = await prismaClient.candidacy.update({
      where: { id: candidacyId },
      data: {
        candidacyDropOut: { update: { dropOutConfirmedByCandidate: true } },
      },
    });
    await logCandidacyAuditEvent({
      candidacyId,
      eventType: "CANDIDACY_DROPOUT_CONFIRMED_BY_CANDIDATE",
      ...userInfo,
    });
    return candidacy;
  } else {
    const candidacy = await prismaClient.candidacy.update({
      where: { id: candidacyId },
      data: {
        candidacyDropOut: { delete: true },
      },
    });
    await logCandidacyAuditEvent({
      candidacyId,
      eventType: "CANDIDACY_DROPOUT_CANCELED_BY_CANDIDATE",
      ...userInfo,
    });
    return candidacy;
  }
};
