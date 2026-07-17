import {
  AAPAuditLogUserInfo,
  logAAPAuditEvent,
} from "@/modules/aap-log/features/logAAPAuditEvent";
import { getAccountById } from "@/modules/account/features/getAccount";
import { updateAccountById } from "@/modules/account/features/updateAccount";
import {
  COMPTE_UTILISATEUR_NON_TROUVE,
  IDENTIFIANT_MAISON_MERE_OBLIGATOIRE,
  MAISON_MERE_PAS_ETE_TROUVEE,
} from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";

import { UpdateOrganimsAccountInput } from "../organism.types";

export const updateOrganismAccount = async ({
  accountId,
  accountEmail,
  accountFirstname,
  accountLastname,
  maisonMereAAPId,
  userInfo,
}: UpdateOrganimsAccountInput & {
  userInfo: AAPAuditLogUserInfo;
}) => {
  const account = await getAccountById({
    id: accountId,
  });

  if (!account) {
    throw Error(COMPTE_UTILISATEUR_NON_TROUVE);
  }

  if (!maisonMereAAPId) {
    throw new Error(IDENTIFIANT_MAISON_MERE_OBLIGATOIRE);
  }

  const maisonMereAAP = await prismaClient.maisonMereAAP.findUnique({
    where: { id: maisonMereAAPId },
  });

  if (!maisonMereAAP) {
    throw new Error(MAISON_MERE_PAS_ETE_TROUVEE);
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
