import { prismaClient } from "../../../prisma/client";
import { getKeycloakAdmin } from "./getKeycloakAdmin";

export const deleteAccount = async ({ accountId }: { accountId: string }) => {
  const account = await prismaClient.account.findUnique({
    where: { id: accountId },
  });
  if (!account?.keycloakId) {
    throw new Error(
      "Erreur pendant la suppresion du compte. Pas d'identifiant keycloak associé.",
    );
  }
  (await getKeycloakAdmin()).users.del({
    id: account?.keycloakId,
    realm: process.env.KEYCLOAK_ADMIN_REALM_REVA,
  });
  return prismaClient.account.delete({ where: { id: accountId } });
};
