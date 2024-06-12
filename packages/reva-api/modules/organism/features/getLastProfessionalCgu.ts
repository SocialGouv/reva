import { prismaClient } from "../../../prisma/client";

export const getLastProfessionalCgu = () =>
  prismaClient.professionalCgu.findFirst({
    orderBy: { createdAt: "desc" },
  });
