import { prismaClient } from "../../../prisma/client";

export const isCertificationAvailableInDepartment = async ({
  certificationId,
  departmentId,
}: {
  certificationId: string;
  departmentId: string;
}): Promise<boolean> => {
  return !!(await prismaClient.availableCertificationsByDepartments.findFirst({
    where: { departmentId, certificationId },
  }));
};
