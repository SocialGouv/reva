import { prismaClient } from "@/prisma/client";

export const getParcoursForCertificationAndCertificationAuthority = async ({
  certificationId,
  certificationAuthorityId,
}: {
  certificationId: string;
  certificationAuthorityId: string;
}) =>
  prismaClient.certificationAuthorityOnCertification

    .findUnique({
      where: {
        certificationAuthorityId_certificationId: {
          certificationAuthorityId,
          certificationId,
        },
      },
    })
    .certificationAuthorityOnCertificationOnParcoursCertifications({
      include: { parcoursCertification: true },
    })
    .then(
      (cacopcs) =>
        cacopcs?.map((cacopc) => cacopc?.parcoursCertification) || [],
    );
