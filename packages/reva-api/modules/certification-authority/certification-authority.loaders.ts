import { prismaClient } from "@/prisma/client";

import { getCertificationRelationsByCertificationAuthorityLocalAccountIds } from "./features/getCertificationRelationsByCertificationAuthorityLocalAccountIds";
import { getDepartmentRelationsByCertificationAuthorityLocalAccountIds } from "./features/getDepartmentRelationsByCertificationAuthorityLocalAccountIds";

export const certificationAuthorityLoaders = {
  CertificationAuthorityLocalAccount: {
    departments: async (queries: { obj: { id: string } }[]) => {
      const calaIds: string[] = queries.map(({ obj }) => obj.id);

      const departmentRelations =
        await getDepartmentRelationsByCertificationAuthorityLocalAccountIds({
          certificationAuthorityLocalAccountIds: calaIds,
        });

      return calaIds.map((cid) =>
        departmentRelations
          .filter((dr) => dr.certificationAuthorityLocalAccountId === cid)
          .map((dr) => dr.department),
      );
    },

    certifications: async (queries: { obj: { id: string } }[]) => {
      const calaIds: string[] = queries.map(({ obj }) => obj.id);

      const certificationRelations =
        await getCertificationRelationsByCertificationAuthorityLocalAccountIds({
          certificationAuthorityLocalAccountIds: calaIds,
        });

      return calaIds.map((cid) =>
        certificationRelations
          .filter((cr) => cr.certificationAuthorityLocalAccountId === cid)
          .map((cr) => cr.certification),
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
