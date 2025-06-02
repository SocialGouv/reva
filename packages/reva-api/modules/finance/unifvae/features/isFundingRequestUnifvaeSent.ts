import { prismaClient } from "../../../../prisma/client";

export const isFundingRequestUnifvaeSent = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const fundingRequest = await prismaClient.fundingRequestUnifvae.findUnique({
    where: { candidacyId },
  });
  return !!fundingRequest;
};
