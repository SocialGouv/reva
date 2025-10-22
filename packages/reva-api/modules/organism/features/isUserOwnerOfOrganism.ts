import { getAccountByKeycloakId } from "@/modules/account/features/getAccountByKeycloakId";
import { prismaClient } from "@/prisma/client";

export const isUserOwnerOfOrganism = async ({
  userRoles,
  userKeycloakId,
  organismId,
}: {
  userRoles: KeyCloakUserRole[];
  userKeycloakId: string;
  organismId: string;
}) => {
  if (userRoles.includes("manage_candidacy")) {
    const account = await getAccountByKeycloakId({
      keycloakId: userKeycloakId,
    });

    if (!account) {
      return false;
    }

    const organismOnAccounts = await prismaClient.organismOnAccount.findMany({
      where: {
        accountId: account.id,
      },
    });

    if (organismOnAccounts.some((oa) => oa.organismId === organismId)) {
      return true;
    }
  }
  return false;
};
