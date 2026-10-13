import { prismaClient } from "@/prisma/client";

export const removeAllCertificationAuthorityCertifications = async ({
  certificationAuthorityId,
}: {
  certificationAuthorityId: string;
}) => {
  const certificationAuthority =
    await prismaClient.certificationAuthority.findUnique({
      where: { id: certificationAuthorityId },
    });

  if (!certificationAuthority) {
    throw new Error("Authorité de certification non trouvée");
  }

  await prismaClient.certificationAuthorityOnCertification.deleteMany({
    where: { certificationAuthorityId },
  });
};
