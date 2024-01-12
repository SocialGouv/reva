import { prismaClient } from "../../../prisma/client";

export const getConventionCollectiveById = ({ ccnId }: { ccnId: string }) =>
  prismaClient.conventionCollective.findFirstOrThrow({
    where: { id: ccnId },
  });
