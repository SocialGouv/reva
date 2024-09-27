import { CandidacyTypeAccompagnement } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { getCandidacyById } from "./getCandidacyById";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

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

  const financementHorsPlateformeFeatureActive = await isFeatureActiveForUser({
    feature: "NOUVELLES_CANDIDATURES_EN_FINANCEMENT_HORS_PLATEFORME",
  });

  const financementHorsPlateforme =
    financementHorsPlateformeFeatureActive ||
    candidacy.typeAccompagnement === "ACCOMPAGNE";

  return prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: {
      typeAccompagnement,
      organism: { disconnect: true },
      goals: { deleteMany: { candidacyId } },
      experiences: { deleteMany: { candidacyId } },
      financeModule: financementHorsPlateforme ? "hors_plateforme" : "unifvae",
    },
  });
};
