import { getAccountByKeycloakId } from "../../account/features/getAccountByKeycloakId";
import { getMaisonMereAAPById } from "./getMaisonMereAAPById";
import { getOrganismById } from "./getOrganism";

export const isUserGestionnaireMaisonMereAAPOfOrganism = async ({
  userRoles,
  userKeycloakId,
  organismId,
}: {
  userRoles: KeyCloakUserRole[];
  userKeycloakId: string;
  organismId: string;
}) => {
  if (userRoles.includes("gestion_maison_mere_aap")) {
    const organism = await getOrganismById({
      organismId,
    });
    const maisonMere = await getMaisonMereAAPById({
      maisonMereAAPId: organism.maisonMereAAPId || "",
    });
    const account = await getAccountByKeycloakId({
      keycloakId: userKeycloakId,
    });
    if (
      maisonMere &&
      account &&
      maisonMere.gestionnaireAccountId === account.id
    ) {
      return true;
    }
  }
  return false;
};
