import { prismaClient } from "../../../prisma/client";
import { UpdateMaisonMereLegalInformationInput } from "../organism.types";

export const updateMaisonMereLegalInformation = async ({
  maisonMereAAPId,
  raisonSociale,
  siret,
  statutJuridique,
  managerFirstname,
  managerLastname,
  gestionnaireFirstname,
  gestionnaireLastname,
  gestionnaireEmail,
  phone,
}: UpdateMaisonMereLegalInformationInput) => {
  const maisonMereAAPWithSiret = await prismaClient.maisonMereAAP.findFirst({
    where: { siret },
  });

  if (maisonMereAAPWithSiret && maisonMereAAPWithSiret.id !== maisonMereAAPId) {
    throw new Error(
      `Ce SIRET est déjà utilisé par la structure "${maisonMereAAPWithSiret.raisonSociale}"`,
    );
  }

  return prismaClient.maisonMereAAP.update({
    where: { id: maisonMereAAPId },
    data: {
      siret,
      statutJuridique,
      raisonSociale,
      managerFirstname,
      managerLastname,
      phone,
      gestionnaire: {
        update: {
          firstname: gestionnaireFirstname,
          lastname: gestionnaireLastname,
          email: gestionnaireEmail,
        },
      },
    },
  });
};
