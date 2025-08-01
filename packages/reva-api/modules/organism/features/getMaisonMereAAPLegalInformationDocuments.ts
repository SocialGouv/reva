import { prismaClient } from "@/prisma/client";

export const getMaisonMereAAPLegalInformationDocuments = async ({
  maisonMereAAPId,
}: {
  maisonMereAAPId: string;
}) => {
  return prismaClient.maisonMereAAPLegalInformationDocuments.findUnique({
    where: { maisonMereAAPId },
    include: {
      attestationURSSAFFile: true,
      justificatifIdentiteDirigeantFile: true,
      lettreDeDelegationFile: true,
      justificatifIdentiteDelegataireFile: true,
    },
  });
};
