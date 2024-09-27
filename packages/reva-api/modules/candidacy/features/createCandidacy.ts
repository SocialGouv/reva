import {
  CandidacyStatusStep,
  CandidacyTypeAccompagnement,
} from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";

export const createCandidacy = async ({
  candidateId,
  departmentId,
  typeAccompagnement,
}: {
  candidateId: string;
  departmentId: string;
  typeAccompagnement: CandidacyTypeAccompagnement;
}) => {
  const financementHorsPlateformeFeatureActive = await isFeatureActiveForUser({
    feature: "NOUVELLES_CANDIDATURES_EN_FINANCEMENT_HORS_PLATEFORME",
  });

  const financementHorsPlateforme =
    financementHorsPlateformeFeatureActive ||
    typeAccompagnement === "ACCOMPAGNE";

  return prismaClient.candidacy.create({
    data: {
      typeAccompagnement,
      departmentId,
      candidateId,
      admissibility: { create: {} },
      examInfo: { create: {} },
      status: "PROJET",
      financeModule: financementHorsPlateforme ? "hors_plateforme" : "unifvae",
      candidacyStatuses: {
        create: {
          status: CandidacyStatusStep.PROJET,
          isActive: true,
        },
      },
    },
  });
};
