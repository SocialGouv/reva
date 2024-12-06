import { prismaClient } from "../../../prisma/client";
import { getAccountByKeycloakId } from "../../account/features/getAccountByKeycloakId";

export const isUserCertificationRegistryManagerOfCertification = async ({
  userRoles,
  userKeycloakId,
  certificationId,
}: {
  userRoles: KeyCloakUserRole[];
  userKeycloakId: string;
  certificationId: string;
}) => {
  if (!userRoles.includes("manage_certification_registry")) {
    return false;
  }

  const userAccount = await getAccountByKeycloakId({
    keycloakId: userKeycloakId,
  });

  if (!userKeycloakId || !userAccount || !certificationId) {
    return false;
  }

  const userIsRegistryManaerOfCertification =
    !!(await prismaClient.certificationRegistryManager.count({
      where: {
        accountId: userAccount.id,
        certificationAuthorityStructure: {
          certifications: { some: { id: certificationId } },
        },
      },
    }));

  return userIsRegistryManaerOfCertification;
};
