import { CandidacyTypeAccompagnement } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { getCandidacyById } from "./getCandidacyById";

export const updateCandidacyTypeAccompagnement = async ({
  candidacyId,
  typeAccompagnement,
}: {
  candidacyId: string;
  typeAccompagnement: CandidacyTypeAccompagnement;
}) => {
  const candidacy = await getCandidacyById({ candidacyId });

  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  if (
    candidacy.typeAccompagnement === "ACCOMPAGNE" &&
    candidacy.status !== "PROJET"
  ) {
    throw new Error(
      "Impossible de modifier le type d'accompagnement une fois la candidature envoyée",
    );
  }

  if (
    candidacy.typeAccompagnement === "AUTONOME" &&
    candidacy.status !== "PROJET"
  ) {
    throw new Error(
      "Impossible de modifier le type d'accompagnement une fois le dossier de faisabilité envoyé",
    );
  }

  return prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: { typeAccompagnement },
  });
};
