import { prismaClient } from "@/prisma/client";

export const getFormacodesByCertificationId = async ({
  certificationId,
}: {
  certificationId: string;
}) => {
  const formacodes = await prismaClient.certificationOnFormacode.findMany({
    where: {
      certificationId,
    },
    include: {
      formacode: true,
    },
  });

  return formacodes.map(({ formacode }) => formacode);
};
