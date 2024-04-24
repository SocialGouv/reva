import { getAccountByKeycloakId } from "../../account/features/getAccountByKeycloakId";

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
    if (account && account.organismId === organismId) {
      return true;
    }
  }
  return false;
};
