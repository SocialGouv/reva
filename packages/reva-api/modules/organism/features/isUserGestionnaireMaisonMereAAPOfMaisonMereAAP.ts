import { getAccountByKeycloakId } from "@/modules/account/features/getAccountByKeycloakId";

import { getMaisonMereAAPById } from "./getMaisonMereAAPById";

export const isUserGestionnaireMaisonMereAAPOfMaisonMereAAP = async ({
  userRoles,
  userKeycloakId,
  maisonMereAAPId,
}: {
  userRoles: KeyCloakUserRole[];
  userKeycloakId: string;
  maisonMereAAPId: string;
}) => {
  if (userRoles.includes("gestion_maison_mere_aap")) {
    const maisonMereAAP = await getMaisonMereAAPById({ maisonMereAAPId });
    const userAccount = await getAccountByKeycloakId({
      keycloakId: userKeycloakId,
    });
    if (
      userAccount &&
      maisonMereAAP &&
      userAccount.id === maisonMereAAP?.gestionnaireAccountId
    ) {
      return true;
    }
  }
  return false;
};
