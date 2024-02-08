import { prismaClient } from "../../../prisma/client";

export const getCertificationAuthoritiesByCertificationId = ({
  certificationId,
}: {
  certificationId: string;
}) =>
  prismaClient.certificationAuthority.findMany({
    where: {
      certificationAuthorityOnCertification: { some: { certificationId } },
    },
  });
