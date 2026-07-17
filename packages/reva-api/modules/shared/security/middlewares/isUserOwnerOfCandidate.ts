import { IFieldResolver, MercuriusContext } from "mercurius";

import { NOT_AUTHORIZED_CANDIDACY_ACCESS } from "@/modules/shared/security/messages";
import { prismaClient } from "@/prisma/client";

const isUserOwnerOfCandidateFeature = async ({
  candidateId,
  keycloakId,
}: {
  candidateId: string;
  keycloakId?: string;
}) => {
  try {
    return (
      !!keycloakId &&
      !!(await prismaClient.candidate.findUnique({
        where: { id: candidateId, keycloakId },
        select: { id: true },
      }))
    );
  } catch (_error) {
    return null;
  }
};

export const isUserOwnerOfCandidate =
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    const candidateId =
      args.id ||
      args.candidateId ||
      args.data?.candidateId ||
      root.candidateId ||
      root.id;

    if (!candidateId) {
      throw new Error(NOT_AUTHORIZED_CANDIDACY_ACCESS);
    }

    if (
      !(await isUserOwnerOfCandidateFeature({
        candidateId,
        keycloakId: context.auth.userInfo?.sub,
      }))
    ) {
      throw new Error(NOT_AUTHORIZED_CANDIDACY_ACCESS);
    }
    return next(root, args, context, info);
  };
