import { prismaClient } from "../../../prisma/client";
import { CertificationAuthority } from "../certification-authority.types";

export const getCertificationAuthorityById = async (
  context: {
    hasRole: (role: string) => boolean;
  },
  params: {
    id: string;
  }
): Promise<CertificationAuthority> => {
  const { hasRole } = context;
  if (!hasRole("admin")) {
    throw new Error("Utilisateur non autorisé");
  }

  const { id } = params;

  const certificationAuthority =
    await prismaClient.certificationAuthority.findUnique({
      where: { id },
    });

  if (!certificationAuthority) {
    throw new Error("Authorité de certification non trouvé");
  }

  return certificationAuthority;
};
