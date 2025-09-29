import { Prisma } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

export const getCandidacyForMenu = ({ candidacyId }: { candidacyId: string }) =>
  prismaClient.candidacy
    .findFirstOrThrow({
      where: { id: candidacyId },
      include: {
        candidacyStatuses: true,
        Feasibility: true,
        organism: true,
        candidacyDropOut: true,
        candidate: true,
        fundingRequestUnifvae: true,
        FundingRequest: true,
        appointments: true,
        paymentRequestUnifvae: true,
      },
    })
    .catch(() => {
      throw new Error("La candidature n'a pas été trouvée.");
    });

export type CandidacyForMenu = Prisma.PromiseReturnType<
  typeof getCandidacyForMenu
>;
