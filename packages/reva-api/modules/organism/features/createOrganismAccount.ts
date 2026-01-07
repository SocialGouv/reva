import {
  AAPAuditLogUserInfo,
  logAAPAuditEvent,
} from "@/modules/aap-log/features/logAAPAuditEvent";
import { createAccount } from "@/modules/account/features/createAccount";
import { prismaClient } from "@/prisma/client";

import { CreateOrganismAccountInput } from "../organism.types";

export const createOrganismAccount = async ({
  maisonMereAAPId,
  accountEmail,
  accountFirstname,
  accountLastname,
  userInfo,
}: CreateOrganismAccountInput & { userInfo: AAPAuditLogUserInfo }) => {
  if (!maisonMereAAPId) {
    throw new Error("L'identifiant de la maison mère est obligatoire");
  }

  const maisonMereAAP = await prismaClient.maisonMereAAP.findUnique({
    where: { id: maisonMereAAPId },
  });

  if (!maisonMereAAP) {
    throw new Error("La maison mère n'a pas été trouvée");
  }

  const account = await createAccount({
    email: accountEmail,
    username: accountEmail,
    firstname: accountFirstname,
    lastname: accountLastname,
    group: "organism",
  });

  await prismaClient.maisonMereAAPOnAccount.create({
    data: {
      accountId: account.id,
      maisonMereAAPId,
    },
  });

  await logAAPAuditEvent({
    eventType: "ORGANISM_ACCOUNT_CREATED_V2",
    maisonMereAAPId: maisonMereAAP.id,
    details: {
      accountEmail,
      maisonMereAAPId,
      maisonMereAAPRaisonSociale: maisonMereAAP.raisonSociale,
    },
    userInfo,
  });

  return account;
};
