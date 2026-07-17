import { IFieldResolver, MercuriusContext } from "mercurius";

import { NOT_AUTHORIZED_STRUCTURE_ACCESS } from "@/modules/shared/security/messages";
import { prismaClient } from "@/prisma/client";

export const getIsCertificationAuthorityStructureRegistryManagerMember =
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    const userKeycloakId = context.auth?.userInfo?.sub;

    const targetRegistryManagerId =
      args.certificationRegistryManagerId ||
      args.data?.certificationRegistryManagerId ||
      root?.certificationRegistryManagerId ||
      root?.id;

    if (!targetRegistryManagerId) {
      throw new Error(NOT_AUTHORIZED_STRUCTURE_ACCESS);
    }

    const userAccount = await prismaClient.account.findUnique({
      where: {
        keycloakId: userKeycloakId,
      },
    });

    const userRegistryManager =
      await prismaClient.certificationRegistryManager.findFirst({
        where: {
          accountId: userAccount?.id,
        },
        select: {
          certificationAuthorityStructure: {
            select: { id: true },
          },
        },
      });

    if (!userRegistryManager) {
      throw new Error(NOT_AUTHORIZED_STRUCTURE_ACCESS);
    }

    const targetRegistryManager =
      await prismaClient.certificationRegistryManager.findUnique({
        where: {
          id: targetRegistryManagerId,
        },
        select: {
          certificationAuthorityStructure: {
            select: { id: true },
          },
        },
      });

    if (!targetRegistryManager) {
      throw new Error(NOT_AUTHORIZED_STRUCTURE_ACCESS);
    }

    const hasMatchingAuthorityStructure =
      userRegistryManager.certificationAuthorityStructure?.id ===
      targetRegistryManager.certificationAuthorityStructure?.id;

    if (!hasMatchingAuthorityStructure) {
      throw new Error(NOT_AUTHORIZED_STRUCTURE_ACCESS);
    }

    return next(root, args, context, info);
  };
