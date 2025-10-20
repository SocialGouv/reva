import {
  AAPAuditLogUserInfo,
  logAAPAuditEvent,
} from "@/modules/aap-log/features/logAAPAuditEvent";
import { getAccountById } from "@/modules/account/features/getAccount";
import { updateAccountById } from "@/modules/account/features/updateAccount";
import { prismaClient } from "@/prisma/client";

import { UpdateOrganimsAccountAndOrganismInput } from "../organism.types";

import { updateOrganismOnAccountAssociation } from "./updateOrganismOnAccountAssociation";

export const updateOrganismAccountAndOrganism = async ({
  accountId,
  accountEmail,
  accountFirstname,
  accountLastname,
  organismId,
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

  const organism = await prismaClient.organism.findUnique({
    where: { id: organismId },
  });

  if (!organism) {
    throw Error("L'organisme n'a pas été trouvé");
  }

  await updateAccountById({
    accountId: account.id,
    accountData: {
      email: accountEmail,
      firstname: accountFirstname,
      lastname: accountLastname,
    },
  });

  const result = await prismaClient.account.update({
    where: { id: account.id },
    data: { organismId },
  });

  await updateOrganismOnAccountAssociation({
    accountId,
    organismIds: [organismId], //TODO update this when we allow on account to be linked to multiple organisms
  });

  if (organism.maisonMereAAPId) {
    await logAAPAuditEvent({
      eventType: "ORGANISM_ACCOUNT_UPDATED",
      maisonMereAAPId: organism.maisonMereAAPId,
      details: {
        accountEmail,
        organismId,
        organismLabel: organism.label,
      },
      userInfo,
    });
  }
  return result;
};
