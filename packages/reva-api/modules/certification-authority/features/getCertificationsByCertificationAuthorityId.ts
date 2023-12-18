import { prismaClient } from "../../../prisma/client";

export const getCertificationsByCertificationAuthorityId = ({
  certificationAuthorityId,
}: {
  certificationAuthorityId: string;
}) =>
  prismaClient.certification.findMany({
    where: {
      certificationAuthorityOnCertification: {
        some: { certificationAuthorityId },
      },
    },
  });
