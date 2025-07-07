import { prismaClient } from "../../../prisma/client";
import { getLastProfessionalCguCertificateur } from "./getLastProfessionalCguCertificateur";

export const certificationAuthorityAcceptCgu = async (context: {
  keycloakId: string;
  roles: KeyCloakUserRole[];
}): Promise<boolean> => {
  const { keycloakId, roles } = context;

  const lastProfessionalCgu = await getLastProfessionalCguCertificateur();
  if (!lastProfessionalCgu) {
    return true;
  }

  const account = await prismaClient.account.findUnique({
    where: { keycloakId },
  });

  if (!account) {
    throw new Error(`Compte utilisateur non trouvé`);
  }

  let userRegistryManager = null;
  if (roles.includes("manage_certification_registry")) {
    userRegistryManager =
      await prismaClient.certificationRegistryManager.findFirst({
        where: {
          accountId: account.id,
        },
        select: {
          certificationAuthorityStructure: {
            select: {
              id: true,
              cguVersion: true,
            },
          },
        },
      });
  }

  let certificationAuthorityAdmin = null;
  if (!userRegistryManager) {
    certificationAuthorityAdmin = await prismaClient.account.findFirst({
      where: {
        id: account.id,
      },
      select: {
        certificationAuthority: {
          select: {
            certificationAuthorityOnCertificationAuthorityStructure: {
              select: {
                id: true,
                certificationAuthorityStructure: {
                  select: {
                    id: true,
                    cguVersion: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  const certificationAuthorityStructure =
    userRegistryManager?.certificationAuthorityStructure ||
    certificationAuthorityAdmin?.certificationAuthority
      ?.certificationAuthorityOnCertificationAuthorityStructure[0]
      ?.certificationAuthorityStructure;
  if (!certificationAuthorityStructure) {
    throw new Error(`Structure de certification non trouvée`);
  }

  if (
    certificationAuthorityStructure.cguVersion == lastProfessionalCgu.version
  ) {
    throw new Error(`La dernière version des CGU a déjà été acceptée.`);
  }

  await prismaClient.certificationAuthorityStructure.update({
    where: { id: certificationAuthorityStructure.id },
    data: {
      cguVersion: lastProfessionalCgu.version,
      cguAcceptedAt: new Date(),
    },
  });

  return true;
};
