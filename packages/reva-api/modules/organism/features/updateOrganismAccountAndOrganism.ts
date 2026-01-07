import {
  AAPAuditLogUserInfo,
  logAAPAuditEvent,
} from "@/modules/aap-log/features/logAAPAuditEvent";
import { getAccountById } from "@/modules/account/features/getAccount";
import { updateAccountById } from "@/modules/account/features/updateAccount";
import { isFeatureActiveForUser } from "@/modules/feature-flipping/feature-flipping.features";
import { prismaClient } from "@/prisma/client";

import { UpdateOrganimsAccountAndOrganismInput } from "../organism.types";

import { updateOrganismOnAccountAssociation } from "./updateOrganismOnAccountAssociation";

export const updateOrganismAccountAndOrganism = async ({
  accountId,
  accountEmail,
  accountFirstname,
  accountLastname,
  organismId,
  maisonMereAAPId,
  userInfo,
}: UpdateOrganimsAccountAndOrganismInput & {
  userInfo: AAPAuditLogUserInfo;
}) => {
  const isAApUserAccountV2FeatureActive = await isFeatureActiveForUser({
    userKeycloakId: userInfo.userKeycloakId,
    feature: "AAP_USER_ACCOUNT_V2",
  });

  const account = await getAccountById({
    id: accountId,
  });

  if (!account) {
    throw Error("Compte utilisateur non trouvé");
  }

  if (isAApUserAccountV2FeatureActive) {
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
  } else {
    if (!organismId) {
      throw Error("L'identifiant de l'organisme est obligatoire");
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
  }
};
