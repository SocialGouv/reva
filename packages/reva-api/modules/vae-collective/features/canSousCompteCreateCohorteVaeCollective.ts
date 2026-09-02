import { getUserPermissionsSpecificToSousCompte } from "./getUserPermissionsSpecifictoSousCompte";

export const canSousCompteCreateCohorteVaeCollective = async ({
  sousCompteVaeCollectiveId,
}: {
  sousCompteVaeCollectiveId: string;
}) => {
  if (!sousCompteVaeCollectiveId) {
    return false;
  }
  const permissions = await getUserPermissionsSpecificToSousCompte({
    sousCompteVaeCollectiveId,
  });

  return permissions.includes("CREER_COHORTE");
};
