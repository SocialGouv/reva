import {
  AAPAuditLogUserInfo,
  logAAPAuditEvent,
} from "@/modules/aap-log/features/logAAPAuditEvent";
import { createAccount } from "@/modules/account/features/createAccount";
import { isFeatureActiveForUser } from "@/modules/feature-flipping/feature-flipping.features";
import { prismaClient } from "@/prisma/client";

import { CreateOrganismAccountInput } from "../organism.types";

import { updateOrganismOnAccountAssociation } from "./updateOrganismOnAccountAssociation";

export const createOrganismAccount = async ({
  organismId,
  maisonMereAAPId,
  accountEmail,
  accountFirstname,
  accountLastname,
  userInfo,
}: CreateOrganismAccountInput & { userInfo: AAPAuditLogUserInfo }) => {
  const isAApUserAccountV2FeatureActive = await isFeatureActiveForUser({
    userKeycloakId: userInfo.userKeycloakId,
    feature: "AAP_USER_ACCOUNT_V2",
  });

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
  } else {
    if (!organismId) {
      throw new Error("L'identifiant de l'organisme est obligatoire");
    }

    const organism = await prismaClient.organism.findUnique({
      where: { id: organismId },
      select: {
        label: true,
        maisonMereAAPId: true,
        maisonMereAAP: {
          select: {
            raisonSociale: true,
          },
        },
      },
    });

    if (!organism) {
      throw new Error("L'organisme n'a pas été trouvé");
    }

    const account = await createAccount({
      email: accountEmail,
      username: accountEmail,
      firstname: accountFirstname,
      lastname: accountLastname,
      group: "organism",
      organismId,
      maisonMereAAPRaisonSociale: organism.maisonMereAAP?.raisonSociale,
    });

    await updateOrganismOnAccountAssociation({
      accountId: account.id,
      organismIds: [organismId],
    });

    await prismaClient.maisonMereAAPOnAccount.create({
      data: {
        accountId: account.id,
        maisonMereAAPId: maisonMereAAPId,
      },
    });

    if (organism.maisonMereAAPId) {
      await logAAPAuditEvent({
        eventType: "ORGANISM_ACCOUNT_CREATED",
        maisonMereAAPId: organism.maisonMereAAPId,
        details: { organismId, organismLabel: organism?.label, accountEmail },
        userInfo,
      });
    }

    return account;
  }
};
