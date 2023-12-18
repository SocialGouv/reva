import { prismaClient } from "../../../prisma/client";

export const getDepartmentsByCertificationAuthorityId = ({
  certificationAuthorityId,
}: {
  certificationAuthorityId: string;
}) =>
  prismaClient.department.findMany({
    where: {
      certificationAuthorityOnDepartment: {
        some: { certificationAuthorityId },
      },
    },
  });
