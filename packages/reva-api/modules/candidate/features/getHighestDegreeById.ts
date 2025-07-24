import { prismaClient } from "@/prisma/client";

export const getHighestDegreeById = ({
  highestDegreeId,
}: {
  highestDegreeId?: string;
}) =>
  highestDegreeId
    ? prismaClient.degree.findFirst({
        where: {
          id: highestDegreeId,
        },
      })
    : null;
