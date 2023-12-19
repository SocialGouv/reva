import { prismaClient } from "../../../prisma/client";

export const getDepartmentRelationsByCertificationAuthorityLocalAccountIds = ({
  certificationAuthorityLocalAccountIds,
}: {
  certificationAuthorityLocalAccountIds: string[];
}) =>
  prismaClient.certificationAuthorityLocalAccountOnDepartment.findMany({
    where: {
      certificationAuthorityLocalAccountId: {
        in: certificationAuthorityLocalAccountIds,
      },
    },
    include: { department: true },
  });
