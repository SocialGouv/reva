import { prismaClient } from "../../../prisma/client";

export const isAapAvailableForCertificationId = async (params: {
  certificationId: string;
}): Promise<boolean> => {
  const { certificationId } = params;

  const organism =
    await prismaClient.activeOrganismByAvailableCertificationBasedOnFormacode.findFirst(
      { where: { certificationId } },
    );

  // return true if there is an active organism for a certificationId
  return organism ? true : false;
};
