import { prismaClient } from "@/prisma/client";

export const updateMaisonMereAndAapGestionBranch = async ({
  gestionBranch,
  maisonMereAAPId,
}: {
  gestionBranch: boolean;
  maisonMereAAPId: string;
}) => {
  const typologie = gestionBranch ? "expertBrancheEtFiliere" : "expertFiliere";
  const maisonMereAap = await prismaClient.maisonMereAAP.update({
    where: {
      id: maisonMereAAPId,
    },
    data: {
      typologie,
      organismes: {
        updateMany: {
          where: {
            maisonMereAAPId,
          },
          data: {
            typology: typologie,
          },
        },
      },
    },
  });

  if (!gestionBranch) {
    await prismaClient.maisonMereAAPOnConventionCollective.deleteMany({
      where: {
        maisonMereAAPId,
      },
    });
    await prismaClient.organismOnConventionCollective.deleteMany({
      where: {
        organism: {
          maisonMereAAPId,
        },
      },
    });
  }

  return maisonMereAap;
};
