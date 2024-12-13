import { CertificationAuthorityContestationDecision } from "@prisma/client";
import { isBefore, startOfToday } from "date-fns";
import { logCandidacyAuditEvent } from "../../../../modules/candidacy-log/features/logCandidacyAuditEvent";
import { prismaClient } from "../../../../prisma/client";
import { CreateCandidacyContestationCaduciteInput } from "../candidacy-contestation-caducite.types";

export const createCandidacyContestationCaducite = async ({
  input,
  context,
}: {
  input: CreateCandidacyContestationCaduciteInput;
  context: GraphqlContext;
}) => {
  const { candidacyId, contestationReason, readyForJuryEstimatedAt } = input;

  if (!contestationReason) {
    throw new Error("La raison de la contestation est obligatoire");
  }

  if (isBefore(readyForJuryEstimatedAt, startOfToday())) {
    throw new Error("La date prévisionnelle ne peut pas être dans le passé");
  }

  const candidacy = await prismaClient.candidacy.findUnique({
    where: {
      id: candidacyId,
    },
    include: { candidacyContestationCaducite: true },
  });

  if (!candidacy) {
    throw new Error("La candidature n'a pas été trouvée");
  }

  const hasConfirmedOrPendingContestation =
    candidacy.candidacyContestationCaducite.find(
      (contestation) =>
        contestation.certificationAuthorityContestationDecision ===
          CertificationAuthorityContestationDecision.CADUCITE_CONFIRMED ||
        contestation.certificationAuthorityContestationDecision ===
          CertificationAuthorityContestationDecision.DECISION_PENDING,
    );

  if (hasConfirmedOrPendingContestation) {
    throw new Error(
      "La caducité de la candidature a été confirmée ou est en attente de décision",
    );
  }

  await prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: {
      readyForJuryEstimatedAt,
    },
  });

  await logCandidacyAuditEvent({
    candidacyId,
    eventType: "CADUCITE_CONTESTED",
    userKeycloakId: context.auth.userInfo?.sub,
    userEmail: context.auth.userInfo?.email,
    userRoles: context.auth.userInfo?.realm_access?.roles || [],
  });

  return prismaClient.candidacyContestationCaducite.create({
    data: {
      candidacyId,
      contestationReason,
    },
  });
};
