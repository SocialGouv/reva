import debug from "debug";
import { IFieldResolver, MercuriusContext } from "mercurius";

import { prismaClient } from "@/prisma/client";

const log = debug("gql:security");

export const isCertificationAuthorityLocalAccountOwner =
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    log("isCertificationAuthorityLocalAccountOwner");

    const localAccountId =
      args.input?.certificationAuthorityLocalAccountId || args.id;

    if (!localAccountId) {
      throw new Error('args "localAccountId" is missing');
    }

    const certificationAuthorityLocalAccount =
      await prismaClient.certificationAuthorityLocalAccount.findFirst({
        where: {
          account: {
            keycloakId: context.auth.userInfo.sub,
          },
          id: localAccountId,
        },
      });

    if (!certificationAuthorityLocalAccount) {
      log("not authorized");

      throw new Error(
        "Vous n'êtes pas autorisé à consulter ce compte collaborateur.",
      );
    }

    log("authorized");

    return next(root, args, context, info);
  };
