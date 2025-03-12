import { UpdateOrganimsAccountAndOrganismInput } from "../organism.types";
import { updateAccountById } from "../..//account/features/updateAccount";
import { prismaClient } from "../../../prisma/client";
import { getAccountById } from "../../account/features/getAccount";
import {
  AAPAuditLogUserInfo,
  logAAPAuditEvent,
} from "../../aap-log/features/logAAPAuditEvent";

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
