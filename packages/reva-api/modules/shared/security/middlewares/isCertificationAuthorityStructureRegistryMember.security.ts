import { IFieldResolver, MercuriusContext } from "mercurius";
import { prismaClient } from "../../../../prisma/client";

const UNAUTHORIZED_ACCESS_ERROR =
  "Vous n'êtes pas autorisé à accéder à cette structure";

export const isCertificationAuthorityStructureRegistryMember =
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
      throw new Error(UNAUTHORIZED_ACCESS_ERROR);
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
      throw new Error(UNAUTHORIZED_ACCESS_ERROR);
    }

    const hasMatchingAuthorityStructure =
      userRegistryManager.certificationAuthorityStructure?.id ===
      targetRegistryManager.certificationAuthorityStructure?.id;

    if (!hasMatchingAuthorityStructure) {
      throw new Error(UNAUTHORIZED_ACCESS_ERROR);
    }

    return next(root, args, context, info);
  };
