import { prismaClient } from "../../../prisma/client";
import {
  AAPAuditLogUserInfo,
  logAAPAuditEvent,
} from "../../aap-log/features/logAAPAuditEvent";
import { updateAccountById } from "../../account/features/updateAccount";
import { UpdateMaisonMereLegalInformationInput } from "../organism.types";
import { updateMaisonMereAndAapGestionBranch } from "./updateMaisonMereAndAapGestionBranch";

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
  gestionBranch,
  userInfo,
}: UpdateMaisonMereLegalInformationInput & {
  userInfo: AAPAuditLogUserInfo;
}) => {
  const maisonMereAAPWithSiret = await prismaClient.maisonMereAAP.findFirst({
    where: { siret },
  });

  if (maisonMereAAPWithSiret && maisonMereAAPWithSiret.id !== maisonMereAAPId) {
    throw new Error(
      `Ce SIRET est déjà utilisé par la structure "${maisonMereAAPWithSiret.raisonSociale}"`,
    );
  }

  if (!siret.match(/^\d{14}$/)) {
    throw new Error("Le numéro de SIRET doit contenir 14 chiffres.");
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
      organismes: {
        updateMany: {
          where: {
            maisonMereAAPId,
          },
          data: {
            siret,
          },
        },
      },
    },
  });

  const mmTypologie = updatedMaisonMere.typologie;
  const manageBranch =
    mmTypologie === "expertBrancheEtFiliere" || mmTypologie === "expertBranche";

  const gestionBranchToUpdate =
    (mmTypologie === "expertFiliere" && gestionBranch) ||
    (manageBranch && !gestionBranch);

  if (gestionBranchToUpdate) {
    await updateMaisonMereAndAapGestionBranch({
      maisonMereAAPId,
      gestionBranch,
    });
  }
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

  await logAAPAuditEvent({
    eventType: "MAISON_MERE_LEGAL_INFORMATION_UPDATED",
    maisonMereAAPId,
    userInfo,
  });

  return updatedMaisonMere;
};
