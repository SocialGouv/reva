import { IFieldResolver, MercuriusContext } from "mercurius";

import { NOT_AUTHORIZED_RESOURCE_ACCESS } from "@/modules/shared/security/messages";
import { prismaClient } from "@/prisma/client";

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
      throw new Error(NOT_AUTHORIZED_RESOURCE_ACCESS);
    }

    const experience = await prismaClient.experience.findUnique({
      where: {
        id: experienceId,
        candidacyId,
      },
      select: { id: true },
    });

    if (!experience) {
      throw new Error(NOT_AUTHORIZED_RESOURCE_ACCESS);
    }

    return next(root, args, context, info);
  };
