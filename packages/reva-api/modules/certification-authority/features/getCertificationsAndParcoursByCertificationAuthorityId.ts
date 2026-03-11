import { Certification, ParcoursCertification } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

export const getCertificationsAndParcoursByCertificationAuthorityId = ({
  certificationAuthorityId,
}: {
  certificationAuthorityId: string;
}): Promise<
  { certification: Certification; parcours: ParcoursCertification[] }[]
> =>
  prismaClient.certificationAuthority
    .findUnique({
      where: {
        id: certificationAuthorityId,
      },
      include: {
        certificationAuthorityOnCertification: {
          include: {
            certification: true,
            certificationAuthorityOnCertificationOnParcoursCertifications: {
              include: { parcoursCertification: true },
            },
          },
        },
      },
    })
    .then((certificationAuthority) => {
      return (
        certificationAuthority?.certificationAuthorityOnCertification || []
      ).map((cac) => ({
        certification: cac.certification,
        parcours:
          cac.certificationAuthorityOnCertificationOnParcoursCertifications.map(
            (cacopc) => cacopc.parcoursCertification,
          ),
      }));
    });
