import { prismaClient } from "../../../prisma/client";
import {
  AAPAuditLogUserInfo,
  logAAPAuditEvent,
} from "../../aap-log/features/logAAPAuditEvent";
import { createAccount } from "../../account/features/createAccount";
import { CreateOrganismAccountInput } from "../organism.types";

export const createOrganismAccount = async ({
  organismId,
  accountEmail,
  accountFirstname,
  accountLastname,
  userInfo,
}: CreateOrganismAccountInput & { userInfo: AAPAuditLogUserInfo }) => {
  const organism = await prismaClient.organism.findUnique({
    where: { id: organismId },
  });

  if (!organism) {
    throw new Error("L'organisme n'a pas été trouvé");
  }

  const result = await createAccount({
    email: accountEmail,
    username: accountEmail,
    firstname: accountFirstname,
    lastname: accountLastname,
    group: "organism",
    organismId,
  });

  if (organism.maisonMereAAPId) {
    logAAPAuditEvent({
      eventType: "ORGANISM_ACCOUNT_CREATED",
      maisonMereAAPId: organism.maisonMereAAPId,
      details: { organismId, organismLabel: organism?.label, accountEmail },
      userInfo,
    });
  }

  return result;
};
