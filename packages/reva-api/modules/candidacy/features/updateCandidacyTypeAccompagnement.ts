import { Candidacy, CandidacyTypeAccompagnement } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { getCandidacyById } from "./getCandidacyById";
import { getCertificationById } from "../../referential/features/getCertificationById";
import { updateCandidacyStatus } from "./updateCandidacyStatus";
import { isCandidacyStatusEqualOrAboveGivenStatus } from "../../candidacy-menu/features/isCandidacyStatusEqualOrAboveGivenStatus";
import { getActiveFeasibilityByCandidacyid } from "../../feasibility/feasibility.features";

export const updateCandidacyTypeAccompagnement = async ({
  candidacyId,
  typeAccompagnement,
  userIsAdmin,
}: {
  candidacyId: string;
  typeAccompagnement: CandidacyTypeAccompagnement;
  userIsAdmin: boolean;
}): Promise<Candidacy> => {
  const candidacy = await getCandidacyById({ candidacyId });

  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  if (userIsAdmin) {
    //admin can change the type of accompniement from ACCOMPAGNE to AUTONOME with more leaway than a candidate
    if (typeAccompagnement !== "AUTONOME") {
      throw new Error(
        "Impossible de modifier le type d'accompagnement. Seul le passage de ACCOMPAGNE à AUTONOME est autorisé",
      );
    }
    if (candidacy.financeModule !== "hors_plateforme") {
      throw new Error(
        "Impossible de modifier le type d'accompagnement si l'utilisateur n'est pas hors financement",
      );
    }
    if (candidacy.feasibilityFormat === "DEMATERIALIZED") {
      const activeFeasibility = await getActiveFeasibilityByCandidacyid({
        candidacyId,
      });

      if (!activeFeasibility || activeFeasibility.decision !== "ADMISSIBLE") {
        throw new Error(
          "Impossible de modifier le type d'accompagnement d'un DF dématérialisé si la recevabilité n'est pas valide",
        );
      }
    }
    return prismaClient.candidacy.update({
      where: { id: candidacyId },
      data: {
        typeAccompagnement: "AUTONOME",
        organism: { disconnect: true },
      },
    });
  } else {
    //user is a candidate and has more restrictions when changing the type of accompaniment
    if (
      candidacy.typeAccompagnement === "ACCOMPAGNE" &&
      isCandidacyStatusEqualOrAboveGivenStatus(candidacy.status)(
        "PARCOURS_CONFIRME",
      )
    ) {
      throw new Error(
        "Impossible de modifier le type d'accompagnement une fois le parcours confirmé",
      );
    }
  }

  if (
    candidacy.typeAccompagnement === "AUTONOME" &&
    candidacy.status !== "PROJET"
  ) {
    throw new Error(
      "Impossible de modifier le type d'accompagnement une fois le dossier de faisabilité envoyé",
    );
  }

  const certification = await getCertificationById({
    certificationId: candidacy.certificationId,
  });

  return prismaClient.$transaction(async (tx) => {
    await updateCandidacyStatus({ candidacyId, status: "PROJET", tx });
    return tx.candidacy.update({
      where: { id: candidacyId },
      data: {
        typeAccompagnement,
        organism: { disconnect: true },
        goals: { deleteMany: { candidacyId } },
        experiences: { deleteMany: { candidacyId } },
        basicSkills: { deleteMany: { candidacyId } },
        trainings: { deleteMany: { candidacyId } },
        candidacyOnCandidacyFinancingMethod: { deleteMany: { candidacyId } },
        certificateSkills: null,
        otherTraining: null,
        individualHourCount: null,
        collectiveHourCount: null,
        additionalHourCount: null,
        isCertificationPartial: null,
        firstAppointmentOccuredAt: null,
        typology: "NON_SPECIFIE",
        typologyAdditional: null,
        ccn: { disconnect: true },
        feasibilityFormat:
          typeAccompagnement === "AUTONOME"
            ? "UPLOADED_PDF"
            : certification?.feasibilityFormat,
      },
    });
  });
};
