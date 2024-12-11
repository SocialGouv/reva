import { CertificationAuthorityContestationDecision } from "@prisma/client";
import { isBefore, startOfToday } from "date-fns";
import { prismaClient } from "../../../../prisma/client";
import { CreateCandidacyContestationCaduciteInput } from "../candidacy-contestation-caducite.types";

export const createCandidacyContestationCaducite = async ({
  candidacyId,
  contestationReason,
  readyForJuryEstimatedAt,
}: CreateCandidacyContestationCaduciteInput) => {
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

  const contestationPending = candidacy.candidacyContestationCaducite.find(
    (contestation) =>
      contestation.certificationAuthorityContestationDecision ===
      CertificationAuthorityContestationDecision.DECISION_PENDING,
  );

  if (contestationPending) {
    throw new Error(
      "Une contestation est déjà en cours pour cette candidature",
    );
  }

  await prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: {
      readyForJuryEstimatedAt,
    },
  });

  return prismaClient.candidacyContestationCaducite.create({
    data: {
      candidacyId,
      contestationReason,
    },
  });
};
