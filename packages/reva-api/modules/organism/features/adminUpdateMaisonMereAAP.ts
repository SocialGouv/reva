import { prismaClient } from "../../../prisma/client";

export const adminUpdateMaisonMereAAP = async (params: {
  maisonMereAAPId: string;
  maisonMereAAPData: {
    zoneIntervention: {
      departmentId: string;
      isOnSite: boolean;
      isRemote: boolean;
    }[];
  };
}) => {
  const { maisonMereAAPId, maisonMereAAPData } = params;

  const maisonMereAAP = await prismaClient.maisonMereAAP.findUnique({
    where: { id: maisonMereAAPId },
  });

  if (!maisonMereAAP) {
    throw new Error(`Cette maison mère est introuvable`);
  }

  await prismaClient.$transaction([
    prismaClient.maisonMereAAPOnDepartement.deleteMany({
      where: { maisonMereAAPId: maisonMereAAPId },
    }),
    prismaClient.maisonMereAAPOnDepartement.createMany({
      data: maisonMereAAPData.zoneIntervention.map((department) => ({
        departementId: department.departmentId,
        maisonMereAAPId: maisonMereAAP.id,
        estSurPlace: department.isOnSite,
        estADistance: department.isRemote,
      })),
    }),
  ]);

  return "OK";
};
