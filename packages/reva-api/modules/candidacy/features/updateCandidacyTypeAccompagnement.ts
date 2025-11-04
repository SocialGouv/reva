import { Candidacy, CandidacyTypeAccompagnement } from "@prisma/client";

import { isCandidacyStatusEqualOrAboveGivenStatus } from "@/modules/candidacy-menu/features/isCandidacyStatusEqualOrAboveGivenStatus";
import { getCertificationById } from "@/modules/referential/features/getCertificationById";
import { prismaClient } from "@/prisma/client";

import { getCandidacyById } from "./getCandidacyById";
import { updateCandidacyStatus } from "./updateCandidacyStatus";

export const updateCandidacyTypeAccompagnement = async ({
  candidacyId,
  typeAccompagnement,
}: {
  candidacyId: string;
  typeAccompagnement: CandidacyTypeAccompagnement;
}): Promise<Candidacy> => {
  const candidacy = await getCandidacyById({ candidacyId });

  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

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
