import { prismaClient } from "@/prisma/client";

export const createCertificationAuthorityStructure = async (label: string) => {
  const certificationAuthorityStructure =
    await prismaClient.certificationAuthorityStructure.findFirst({
      where: {
        label: {
          equals: label,
          mode: "insensitive",
        },
      },
    });

  if (certificationAuthorityStructure) {
    throw new Error("Cette structure certificatrice existe déjà");
  }

  return prismaClient.certificationAuthorityStructure.create({
    data: { label },
  });
};
