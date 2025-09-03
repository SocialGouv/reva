import debug from "debug";
import { IFieldResolver, MercuriusContext } from "mercurius";

import { prismaClient } from "@/prisma/client";

const log = debug("gql:security");

export const isCertificationAuthorityLocalAccountManager =
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    log("isCertificationAuthorityLocalAccountManager");

    const localAccountId = args.id;

    if (!localAccountId) {
      throw new Error('args "localAccountId" is missing');
    }

    if (!context.auth.hasRole("manage_certification_authority_local_account")) {
      log("not authorized");

      throw new Error(
        "Vous n'êtes pas autorisé à consulter ce compte collaborateur.",
      );
    }

    const account = await prismaClient.account.findUnique({
      where: {
        keycloakId: context.auth.userInfo.sub,
      },
    });

    if (!account?.certificationAuthorityId) {
      log("not authorized");

      throw new Error(
        "Vous n'êtes pas autorisé à consulter ce compte collaborateur.",
      );
    }

    const certificationAuthorityLocalAccount =
      await prismaClient.certificationAuthorityLocalAccount.findFirst({
        where: {
          certificationAuthorityId: account.certificationAuthorityId,
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
