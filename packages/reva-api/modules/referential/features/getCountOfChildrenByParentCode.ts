import { prismaClient } from "@/prisma/client";

export const getCountOfChildrenByParentCode = async ({
  parentCode,
}: {
  parentCode: string;
}) => {
  const count = await prismaClient.formacode.count({
    where: {
      parentCode,
      version: "v14",
    },
  });
  return count;
};
