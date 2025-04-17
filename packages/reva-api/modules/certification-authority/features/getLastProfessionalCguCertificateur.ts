import { prismaClient } from "../../../prisma/client";

export const getLastProfessionalCguCertificateur = () =>
  prismaClient.professionalCguCertificateur.findFirst({
    orderBy: { createdAt: "desc" },
  });
