import { prismaClient } from "../../../prisma/client";

export const canUserManageCertificationAuthorityLocalAccount = async ({
  userKeycloakId,
  certificationAuthorityLocalAccountId,
  userRoles,
}: {
  userKeycloakId: string;
  certificationAuthorityLocalAccountId: string;
  userRoles: KeyCloakUserRole[];
}) => {
  if (!userRoles?.includes("manage_certification_authority_local_account")) {
    return false;
  }

  const userCertificationAuthority =
    await prismaClient.certificationAuthority.findFirstOrThrow({
      where: { Account: { some: { keycloakId: userKeycloakId } } },
      select: { id: true },
    });

  const certificationAuthorityLocalAccount =
    await prismaClient.certificationAuthorityLocalAccount.findFirstOrThrow({
      where: { id: certificationAuthorityLocalAccountId },
      select: { certificationAuthorityId: true },
    });

  return (
    certificationAuthorityLocalAccount.certificationAuthorityId ===
    userCertificationAuthority.id
  );
};
