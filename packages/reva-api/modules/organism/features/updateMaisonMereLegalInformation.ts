import { prismaClient } from "../../../prisma/client";
import { UpdateMaisonMereLegalInformationInput } from "../organism.types";

export const updateMaisonMereLegalInformation = async ({
  maisonMereAAPId,
  raisonSociale,
  siret,
  statutJuridique,
}: UpdateMaisonMereLegalInformationInput) =>
  prismaClient.maisonMereAAP.update({
    where: { id: maisonMereAAPId },
    data: {
      siret,
      statutJuridique,
      raisonSociale,
    },
  });
