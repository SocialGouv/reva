import { IFieldResolver, MercuriusContext } from "mercurius";

import { prismaClient } from "@/prisma/client";

const UNAUTHORIZED_ACCESS_ERROR =
  "Vous n'êtes pas autorisé à accéder à cette structure";

/**
 * Middleware de sécurité qui vérifie si l'utilisateur est soit un certificateur
 * soit un compte local membre de la structure de certification ciblée.
 */
export const getIsCertificationAuthorityAccountOrLocalAccountStructureMember =
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    const userKeycloakId = context.auth?.userInfo?.sub;

    const targetEntityId =
      args.certificationAuthorityId ||
      args.data?.certificationAuthorityId ||
      root.certificationAuthorityId ||
      root.id ||
      args.certificationAuthorityStructureId ||
      args.data?.certificationAuthorityStructureId ||
      root.certificationAuthorityStructureId;

    let userAccount;
    let userCertificationAuthorityId;
    let userAccountAuthorityStructureId;

    // Certificateur - Certification Authority
    if (context.auth?.hasRole("manage_certification_authority_local_account")) {
      userAccount = await prismaClient.account.findUnique({
        where: {
          keycloakId: userKeycloakId,
        },
        select: {
          certificationAuthority: {
            select: {
              id: true,
              certificationAuthorityOnCertificationAuthorityStructure: {
                select: { certificationAuthorityStructureId: true },
              },
            },
          },
        },
      });

      userAccountAuthorityStructureId =
        userAccount?.certificationAuthority
          ?.certificationAuthorityOnCertificationAuthorityStructure[0]
          ?.certificationAuthorityStructureId;

      userCertificationAuthorityId = userAccount?.certificationAuthority?.id;
    } else {
      // Compte local - Certification Authority Local Account
      userAccount = await prismaClient.account.findUnique({
        where: {
          keycloakId: userKeycloakId,
        },
        select: {
          certificationAuthorityLocalAccount: {
            select: {
              certificationAuthority: {
                select: {
                  id: true,
                  certificationAuthorityOnCertificationAuthorityStructure: {
                    select: { certificationAuthorityStructureId: true },
                  },
                },
              },
            },
          },
        },
      });

      userAccountAuthorityStructureId =
        userAccount?.certificationAuthorityLocalAccount?.[0]
          ?.certificationAuthority
          ?.certificationAuthorityOnCertificationAuthorityStructure[0]
          ?.certificationAuthorityStructureId;

      userCertificationAuthorityId =
        userAccount?.certificationAuthorityLocalAccount?.[0]
          ?.certificationAuthority?.id;
    }

    if (!userAccount) {
      throw new Error(UNAUTHORIZED_ACCESS_ERROR);
    }

    let targetCertificationAuthorityId;
    let targetCertificationAuthorityStructureId;

    // Selon le chemin utilisé dans le resolver, l'ID peut pointer vers :
    // 1. Un certificateur (première tentative)
    // 2. Une structure de certification (seconde tentative)
    // Cette double vérification permet de gérer les deux cas d'utilisation
    const targetCertificationAuthority =
      await prismaClient.certificationAuthority.findUnique({
        where: {
          id: targetEntityId,
        },
        select: {
          id: true,
          certificationAuthorityOnCertificationAuthorityStructure: {
            select: { certificationAuthorityStructureId: true },
          },
        },
      });

    if (targetCertificationAuthority) {
      targetCertificationAuthorityId = targetCertificationAuthority.id;
      targetCertificationAuthorityStructureId =
        targetCertificationAuthority
          ?.certificationAuthorityOnCertificationAuthorityStructure[0]
          ?.certificationAuthorityStructureId;
    } else {
      // Try to find as a structure
      const targetStructure =
        await prismaClient.certificationAuthorityStructure.findUnique({
          where: { id: targetEntityId },
          select: {
            id: true,
            certificationAuthorityOnCertificationAuthorityStructure: {
              select: { certificationAuthorityId: true },
            },
          },
        });

      if (targetStructure) {
        targetCertificationAuthorityStructureId = targetStructure.id;
        // Check if the structure is linked to the user's certification authority
        const structureLinkedToUserAuthority =
          targetStructure.certificationAuthorityOnCertificationAuthorityStructure.some(
            (link) =>
              link.certificationAuthorityId === userCertificationAuthorityId,
          );

        if (structureLinkedToUserAuthority) {
          return next(root, args, context, info);
        }
      }
    }

    if (
      !targetCertificationAuthority &&
      !targetCertificationAuthorityStructureId
    ) {
      throw new Error(UNAUTHORIZED_ACCESS_ERROR);
    }

    const hasMatchingAuthorityStructure =
      userAccountAuthorityStructureId ===
      targetCertificationAuthorityStructureId;

    const hasMatchingCertificationAuthority =
      userCertificationAuthorityId === targetCertificationAuthorityId;

    if (!hasMatchingAuthorityStructure && !hasMatchingCertificationAuthority) {
      throw new Error(UNAUTHORIZED_ACCESS_ERROR);
    }

    return next(root, args, context, info);
  };
