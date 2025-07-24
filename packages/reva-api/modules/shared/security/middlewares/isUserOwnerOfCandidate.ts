import { IFieldResolver, MercuriusContext } from "mercurius";

import { prismaClient } from "@/prisma/client";

const isUserOwnerOfCandidateFeature = async ({
  candidateId,
  keycloakId,
}: {
  candidateId: string;
  keycloakId?: string;
}) =>
  !!keycloakId &&
  !!(await prismaClient.candidate.findUnique({
    where: { id: candidateId, keycloakId },
    select: { id: true },
  }));

export const isUserOwnerOfCandidate =
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    const candidateId =
      args.candidateId || args.data?.candidateId || root.candidateId || root.id;

    if (
      !(await isUserOwnerOfCandidateFeature({
        candidateId,
        keycloakId: context.auth.userInfo?.sub,
      }))
    ) {
      throw new Error("Vous n'êtes pas autorisé à accéder à cette candidature");
    }
    return next(root, args, context, info);
  };
