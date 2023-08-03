import { prismaClient } from "./client";

export const getCertificationAuthorityById = async (id: string) => {
  return await prismaClient.certificationAuthority.findUnique({
    where: {
      id,
    },
  });
};
