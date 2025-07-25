import debug from "debug";
import { IFieldResolver, MercuriusContext } from "mercurius";

import { prismaClient } from "@/prisma/client";

const log = debug("gql:security");

export const isFeasibilityManager =
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    log("isFeasibilityManager");
    const candidacyId =
      args.candidacyId || args.data?.candidacyId || root.candidacyId || root.id;

    if (context.auth.hasRole("manage_certification_authority_local_account")) {
      // using candidacy.findUnique and fluent prisma api to let prisma batch the queries (graphql optimization)
      const candidacyFeasibility = (
        await prismaClient.candidacy
          .findUnique({ where: { id: candidacyId } })
          .Feasibility({ where: { isActive: true } })
      )?.[0];

      const account = await prismaClient.account.findUnique({
        where: { keycloakId: context.auth.userInfo.sub },
      });

      if (!candidacyFeasibility || !account) {
        throw new Error("Vous n'êtes pas autorisé à gérer cette candidature.");
      }

      if (
        candidacyFeasibility.certificationAuthorityId ===
        account.certificationAuthorityId
      ) {
        log("authorized");
        return next(root, args, context, info);
      }
    } else if (context.auth.hasRole("manage_feasibility")) {
      // using candidacy.findUnique and fluent prisma api to let prisma batch the queries (graphql optimization)
      const candidacyFeasibility = (
        await prismaClient.candidacy
          .findUnique({ where: { id: candidacyId } })
          .Feasibility({ where: { isActive: true } })
      )?.[0];

      if (!candidacyFeasibility) {
        throw new Error("Candidature inexistante.");
      }

      const account = await prismaClient.account.findUnique({
        where: { keycloakId: context.auth.userInfo.sub },
      });

      if (!account) {
        throw new Error("Vous n'êtes pas autorisé à gérer cette candidature.");
      }

      //use the accountId instead of account:{keycloadId ...} in order to be able to use a findUnique and let prisma batch the queries
      const certificationAuthorityLocalAccount =
        await prismaClient.certificationAuthorityLocalAccount.findUnique({
          where: { accountId: account.id },
        });

      if (!certificationAuthorityLocalAccount) {
        throw new Error("Vous n'êtes pas autorisé à gérer cette candidature.");
      }

      const hasCandidacy =
        await prismaClient.certificationAuthorityLocalAccountOnCandidacy.findUnique(
          {
            where: {
              certificationAuthorityLocalAccountId_candidacyId: {
                candidacyId: candidacyId,
                certificationAuthorityLocalAccountId:
                  certificationAuthorityLocalAccount.id,
              },
            },
          },
        );

      if (hasCandidacy) {
        log("authorized");
        return next(root, args, context, info);
      }
    }

    log("not authorized");
    throw new Error("Vous n'êtes pas autorisé à gérer cette candidature.");
  };
