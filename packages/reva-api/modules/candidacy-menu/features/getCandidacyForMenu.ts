import { Prisma } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";

export const getCandidacyForMenu = ({ candidacyId }: { candidacyId: string }) =>
  prismaClient.candidacy
    .findFirstOrThrow({
      where: { id: candidacyId },
      include: {
        candidacyStatuses: { where: { isActive: true } },
        Feasibility: true,
        organism: true,
        candidacyDropOut: true,
      },
    })
    .catch(() => {
      throw new Error("La candidature n'a pas été trouvée.");
    });

export type CandidacyForMenu = Prisma.PromiseReturnType<
  typeof getCandidacyForMenu
>;
