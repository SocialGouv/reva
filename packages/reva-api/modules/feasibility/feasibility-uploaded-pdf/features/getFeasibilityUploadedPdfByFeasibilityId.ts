import { prismaClient } from "../../../../prisma/client";

export const getFeasibilityUploadedPdfByFeasibilityId = async ({
  feasibilityId,
}: {
  feasibilityId: string;
}) =>
  prismaClient.feasibilityUploadedPdf.findUnique({
    where: {
      feasibilityId,
    },
  });
