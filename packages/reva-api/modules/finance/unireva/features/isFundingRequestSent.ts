import { prismaClient } from "@/prisma/client";

export const isFundingRequestSent = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const fundingRequest = await prismaClient.fundingRequest.findUnique({
    where: { candidacyId },
  });
  return !!fundingRequest;
};
