import { prismaClient } from "@/prisma/client";

export const getLastProfessionalCgu = (params?: { maxCreatedAt?: Date }) =>
  prismaClient.professionalCgu.findFirst({
    where: { createdAt: { lte: params?.maxCreatedAt } },
    orderBy: { createdAt: "desc" },
  });
