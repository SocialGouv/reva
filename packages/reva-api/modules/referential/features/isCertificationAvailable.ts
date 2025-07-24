import { prismaClient } from "@/prisma/client";

export const isCertificationAvailable = async ({
  certificationId,
}: {
  certificationId: string;
}): Promise<boolean> => {
  return !!(await prismaClient.certification.findUnique({
    where: { id: certificationId, visible: true },
  }));
};
