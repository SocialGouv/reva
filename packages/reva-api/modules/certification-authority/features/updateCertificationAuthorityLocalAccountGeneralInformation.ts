import { prismaClient } from "../../../prisma/client";
import { UpdateCertificationAuthorityLocalAccountGeneralInformationInput } from "../certification-authority.types";

export const updateCertificationAuthorityLocalAccountGeneralInformation =
  async ({
    certificationAuthorityLocalAccountId,
    contactFullName,
    contactEmail,
    contactPhone,
  }: UpdateCertificationAuthorityLocalAccountGeneralInformationInput) =>
    prismaClient.certificationAuthorityLocalAccount.update({
      where: {
        id: certificationAuthorityLocalAccountId,
      },
      data: {
        contactFullName,
        contactEmail,
        contactPhone,
      },
    });
