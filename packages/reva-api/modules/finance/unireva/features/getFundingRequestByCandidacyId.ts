import { prismaClient } from "@/prisma/client";

export const getFundingRequestByCandidacyId = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.fundingRequest.findUnique({
    where: { candidacyId },
  });
