import { prismaClient } from "../../database/postgres/client";

export const feasibilityResolvers = {
  Candidacy: {
    certificationAuthority: ({
      certificationId,
      departmentId,
    }: {
      certificationId: string;
      departmentId: string;
    }) =>
      certificationId && departmentId
        ? prismaClient.certificationAuthority.findFirst({
            where: {
              certificationAuthorityOnDepartment: { some: { departmentId } },
              certificationAuthorityOnCertification: {
                some: { certificationId },
              },
            },
          })
        : null,
  },
};
