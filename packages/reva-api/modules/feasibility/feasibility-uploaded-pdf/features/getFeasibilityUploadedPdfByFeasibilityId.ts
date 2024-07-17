import { prismaClient } from "../../../../prisma/client";

export const getFeasibilityUploadedPdfByFeasibilityId = async ({
  feasibilityId,
}: {
  feasibilityId: string;
}) => {
  const f = await prismaClient.feasibilityUploadedPdf.findUnique({
    where: {
      feasibilityId,
    },
    include: { Feasibility: true },
  });

  return { ...f, candidacyId: f?.Feasibility.candidacyId };
};
