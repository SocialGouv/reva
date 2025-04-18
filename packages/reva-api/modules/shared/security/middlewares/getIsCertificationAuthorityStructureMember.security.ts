import { IFieldResolver, MercuriusContext } from "mercurius";
import { prismaClient } from "../../../../prisma/client";

const UNAUTHORIZED_ACCESS_ERROR =
  "Vous n'êtes pas autorisé à accéder à cette structure";

export const getIsCertificationAuthorityStructureMember =
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    const userKeycloakId = context.auth?.userInfo?.sub;

    const targetCertificationAuthorityId =
      args.certificationAuthorityId ||
      args.data?.certificationAuthorityId ||
      root.certificationAuthorityId ||
      root.id;

    const userAccount = await prismaClient.account.findUnique({
      where: {
        keycloakId: userKeycloakId,
      },
      select: {
        certificationAuthority: {
          select: {
            certificationAuthorityOnCertificationAuthorityStructure: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!userAccount) {
      throw new Error(UNAUTHORIZED_ACCESS_ERROR);
    }

    const targetCertificationAuthority =
      await prismaClient.certificationAuthority.findUnique({
        where: {
          id: targetCertificationAuthorityId,
        },
        select: {
          certificationAuthorityOnCertificationAuthorityStructure: {
            select: { id: true },
          },
        },
      });

    if (!targetCertificationAuthority) {
      throw new Error(UNAUTHORIZED_ACCESS_ERROR);
    }

    const hasMatchingAuthorityStructure =
      userAccount?.certificationAuthority
        ?.certificationAuthorityOnCertificationAuthorityStructure[0]?.id ===
      targetCertificationAuthority
        ?.certificationAuthorityOnCertificationAuthorityStructure[0]?.id;

    if (!hasMatchingAuthorityStructure) {
      throw new Error(UNAUTHORIZED_ACCESS_ERROR);
    }

    return next(root, args, context, info);
  };
