import { prismaClient } from "@/prisma/client";

import { getDepartmentsByRegionIds } from "./features/getDepartmentsByRegionIds";

export const referentialLoaders = {
  Region: {
    departments: async (queries: { obj: { id: string } }[]) => {
      const regionIds: string[] = queries.map(({ obj }) => obj.id);
      const departments = await getDepartmentsByRegionIds({ regionIds });
      return regionIds.map((rid) =>
        departments.filter((d) => d.regionId === rid),
      );
    },
  },
  Certification: {
    parcoursByCertificationAuthorities: async (
      queries: { obj: { id: string } }[],
    ) => {
      const certificationIds: string[] = queries.map(({ obj }) => obj.id);
      const certificationAuthorityOnCertification =
        await prismaClient.certificationAuthorityOnCertification.findMany({
          where: {
            certificationId: { in: certificationIds },
            certificationAuthorityOnCertificationOnParcoursCertifications: {
              some: { id: { not: undefined } },
            },
          },
          include: {
            certificationAuthority: true,
            certificationAuthorityOnCertificationOnParcoursCertifications: {
              include: { parcoursCertification: true },
            },
          },
        });

      return certificationIds.map((id) =>
        certificationAuthorityOnCertification
          .filter((c) => c.certificationId === id)
          .map((c) => ({
            certificationAuthority: c.certificationAuthority,
            parcours:
              c.certificationAuthorityOnCertificationOnParcoursCertifications.map(
                (pc) => pc.parcoursCertification,
              ),
          })),
      );
    },
  },
};
