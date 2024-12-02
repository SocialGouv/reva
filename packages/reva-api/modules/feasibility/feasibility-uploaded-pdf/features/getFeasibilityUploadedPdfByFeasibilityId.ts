import { prismaClient } from "../../../../prisma/client";

export const getFeasibilityUploadedPdfByFeasibilityId = ({
  feasibilityId,
}: {
  feasibilityId: string;
}) =>
  prismaClient.feasibilityUploadedPdf.findUnique({
    where: {
      feasibilityId,
    },
    include: { Feasibility: true },
  });
