import {
  AAPAuditLogUserInfo,
  logAAPAuditEvent,
} from "@/modules/aap-log/features/logAAPAuditEvent";
import { getAccountById } from "@/modules/account/features/getAccount";
import { updateAccountById } from "@/modules/account/features/updateAccount";
import { prismaClient } from "@/prisma/client";

import { UpdateOrganimsAccountAndOrganismInput } from "../organism.types";

export const updateOrganismAccountAndOrganism = async ({
  accountId,
  accountEmail,
  accountFirstname,
  accountLastname,
  maisonMereAAPId,
  userInfo,
}: UpdateOrganimsAccountAndOrganismInput & {
  userInfo: AAPAuditLogUserInfo;
}) => {
  const account = await getAccountById({
    id: accountId,
  });

  if (!account) {
    throw Error("Compte utilisateur non trouvé");
  }

  if (!maisonMereAAPId) {
    throw new Error("L'identifiant de la maison mère est obligatoire");
  }

  const maisonMereAAP = await prismaClient.maisonMereAAP.findUnique({
    where: { id: maisonMereAAPId },
  });

  if (!maisonMereAAP) {
    throw new Error("La maison mère n'a pas été trouvée");
  }
  const result = await updateAccountById({
    accountId: account.id,
    accountData: {
      email: accountEmail,
      firstname: accountFirstname,
      lastname: accountLastname,
    },
  });

  await logAAPAuditEvent({
    eventType: "ORGANISM_ACCOUNT_UPDATED_V2",
    maisonMereAAPId: maisonMereAAP.id,
    details: {
      accountEmail,
      maisonMereAAPId,
      maisonMereAAPRaisonSociale: maisonMereAAP.raisonSociale,
    },
    userInfo,
  });

  return result;
};
