import { IFieldResolver, MercuriusContext } from "mercurius";

import { prismaClient } from "@/prisma/client";

const UNAUTHORIZED_ACCESS_ERROR =
  "Vous n'êtes pas autorisé à accéder à cette ressource";

export const isExperienceOfCandidacy =
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    const candidacyId =
      args.candidacyId ||
      args.input?.candidacyId ||
      root?.candidacyId ||
      root?.id;
    const experienceId =
      args.experienceId || args.input?.experienceId || root?.experienceId;

    if (!candidacyId || !experienceId) {
      throw new Error(UNAUTHORIZED_ACCESS_ERROR);
    }

    const experience = await prismaClient.experience.findUnique({
      where: {
        id: experienceId,
        candidacyId,
      },
      select: { id: true },
    });

    if (!experience) {
      throw new Error(UNAUTHORIZED_ACCESS_ERROR);
    }

    return next(root, args, context, info);
  };
