import { updateAccountById } from "../../account/features/updateAccount";
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

  const updatedMaisonMere = await prismaClient.maisonMereAAP.update({
    where: { id: maisonMereAAPId },
    data: {
      siret,
      statutJuridique,
      raisonSociale,
      managerFirstname,
      managerLastname,
      phone,
    },
  });

  if (updatedMaisonMere.gestionnaireAccountId) {
    await updateAccountById({
      accountId: updatedMaisonMere.gestionnaireAccountId,
      accountData: {
        email: gestionnaireEmail,
        firstname: gestionnaireFirstname,
        lastname: gestionnaireLastname,
      },
    });
  }

  return updatedMaisonMere;
};
