import { IFieldResolver, MercuriusContext } from "mercurius";

import { NOT_AUTHORIZED_CANDIDACY_ACCESS } from "@/modules/shared/security/messages";
import { prismaClient } from "@/prisma/client";

export const isCandidateOwnerOfCandidacyFeature = async ({
  candidacyId,
  keycloakId,
}: {
  candidacyId: string;
  keycloakId?: string;
}) =>
  !!keycloakId &&
  !!(await prismaClient.candidacy.findUnique({
    where: { id: candidacyId, candidate: { keycloakId } },
    select: { id: true },
  }));

export const isCandidateOwnerOfCandidacy =
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    const candidacyId =
      args.candidacyId || args.data?.candidacyId || root.candidacyId || root.id;

    if (
      !(await isCandidateOwnerOfCandidacyFeature({
        candidacyId: candidacyId,
        keycloakId: context.auth.userInfo?.sub,
      }))
    ) {
      throw new Error(NOT_AUTHORIZED_CANDIDACY_ACCESS);
    }
    return next(root, args, context, info);
  };
