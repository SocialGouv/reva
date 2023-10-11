import { prismaClient } from "../../../prisma/client";
import { CertificationAuthority } from "../certification-authority.types";

export const updateCertificationAuthorityById = async (
  context: {
    hasRole: (role: string) => boolean;
  },
  params: {
    certificationAuthorityId: string;
    certificationAuthorityData: {
      label: string;
      contactFullName?: string;
      contactEmail?: string;
    };
  }
): Promise<CertificationAuthority> => {
  const { hasRole } = context;
  if (!hasRole("admin")) {
    throw new Error("Utilisateur non autorisé");
  }

  const { certificationAuthorityId, certificationAuthorityData } = params;

  // Check if certificationAuthority with certificationAuthorityId exsits
  const certificationAuthority =
    await prismaClient.certificationAuthority.findUnique({
      where: { id: certificationAuthorityId },
    });

  if (!certificationAuthority) {
    throw new Error(
      `Authorité de certification pour l'id ${certificationAuthorityId} non trouvé`
    );
  }

  // Update Business DB
  await prismaClient.certificationAuthority.update({
    where: { id: certificationAuthority.id },
    data: {
      label: certificationAuthorityData.label,
      contactFullName: certificationAuthorityData.contactFullName,
      contactEmail: certificationAuthorityData.contactEmail,
    },
  });

  return certificationAuthority;
};
