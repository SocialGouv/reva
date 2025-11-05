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
    return createAccount({
      email: accountEmail,
      username: accountEmail,
      firstname: accountFirstname,
      lastname: accountLastname,
      group: "organism",
    });
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
