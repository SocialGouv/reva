import { prismaClient } from "../../database/postgres/client";

export const feasabilityResolvers = {
  Candidacy: {
    certificationAuthority: ({
      certificationId,
      departmentId,
    }: {
      certificationId: string;
      departmentId: string;
    }) =>
      prismaClient.certificationAuthority.findFirst({
        where: {
          certificationAuthorityOnDepartment: { some: { departmentId } },
          certificationAuthorityOnCertification: { some: { certificationId } },
        },
      }),
  },
};
