import { IFieldResolver, MercuriusContext } from "mercurius";

import { prismaClient } from "@/prisma/client";

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

    const targetCertificationAuthorityStructureId =
      args.certificationAuthorityStructureId ||
      args.data?.certificationAuthorityStructureId ||
      root.certificationAuthorityStructureId ||
      root.id;

    const userAccount = await prismaClient.account.findUnique({
      where: {
        keycloakId: userKeycloakId,
      },
      select: {
        certificationAuthority: {
          select: {
            certificationAuthorityOnCertificationAuthorityStructure: {
              select: {
                certificationAuthorityStructureId: true,
              },
            },
          },
        },
      },
    });

    if (!userAccount) {
      throw new Error(UNAUTHORIZED_ACCESS_ERROR);
    }

    const targetCertificationAuthority =
      await prismaClient.certificationAuthorityStructure.findUnique({
        where: {
          id: targetCertificationAuthorityStructureId,
        },
      });

    if (!targetCertificationAuthority) {
      throw new Error(UNAUTHORIZED_ACCESS_ERROR);
    }

    const certificationAuthorityStructureIds =
      userAccount?.certificationAuthority?.certificationAuthorityOnCertificationAuthorityStructure?.map(
        (caocas) => caocas.certificationAuthorityStructureId,
      ) || [];

    const hasMatchingAuthorityStructure =
      certificationAuthorityStructureIds.includes(
        targetCertificationAuthority.id,
      );

    if (!hasMatchingAuthorityStructure) {
      throw new Error(UNAUTHORIZED_ACCESS_ERROR);
    }

    return next(root, args, context, info);
  };
