import { prismaClient } from "../../../prisma/client";
import { CertificationAuthority } from "../certification-authority.types";

export const updateCertificationAuthorityV2ById = async (params: {
  certificationAuthorityId: string;
  certificationAuthorityData: {
    label: string;
    contactFullName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    isGlobalContact: boolean;
  };
}): Promise<CertificationAuthority> => {
  const { certificationAuthorityId, certificationAuthorityData } = params;

  // Check if certificationAuthority with certificationAuthorityId exsits
  const certificationAuthority =
    await prismaClient.certificationAuthority.findUnique({
      where: { id: certificationAuthorityId },
    });

  if (!certificationAuthority) {
    throw new Error(
      `Authorité de certification pour l'id ${certificationAuthorityId} non trouvé`,
    );
  }

  const updatedCertificationAuthority =
    await prismaClient.certificationAuthority.update({
      where: { id: certificationAuthority.id },
      data: {
        label: certificationAuthorityData.label,
        contactFullName: certificationAuthorityData.contactFullName,
        contactEmail: certificationAuthorityData.contactEmail,
        contactPhone: certificationAuthorityData.contactPhone,
      },
    });

  if (certificationAuthorityData.isGlobalContact) {
    console.log(
      "Would assign contact to all local accounts of the certification authority",
    );
  }

  return updatedCertificationAuthority;
};
