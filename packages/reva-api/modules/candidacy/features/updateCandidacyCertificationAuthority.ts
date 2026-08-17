import { CandidacyStatusStep, Prisma } from "@prisma/client";

import { CANDIDATURE_NON_TROUVEE } from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";

import { getCandidacy } from "./getCandidacy";

export const updateCandidacyCertificationAuthority = async ({
  candidacyId,
  certificationAuthorityId,
  tx,
}: {
  candidacyId: string;
  certificationAuthorityId: string;
  tx?: Prisma.TransactionClient; //optional transaction to use
}) => {
  const allowedCandidacyStatuses: CandidacyStatusStep[] = [
    "PROJET",
    "VALIDATION",
    "PRISE_EN_CHARGE",
    "PARCOURS_ENVOYE",
    "PARCOURS_CONFIRME",
    "DOSSIER_FAISABILITE_INCOMPLET",
  ];

  const candidacy = await getCandidacy({ candidacyId });
  if (!candidacy) {
    throw new Error(CANDIDATURE_NON_TROUVEE);
  }

  if (!allowedCandidacyStatuses.includes(candidacy.status)) {
    throw new Error(
      "Le statut de la candidature ne permet pas de changer de certificateur",
    );
  }

  const prisma = tx ?? prismaClient;
  return prisma.candidacy.update({
    where: { id: candidacyId },
    data: { certificationAuthorityId },
  });
};
