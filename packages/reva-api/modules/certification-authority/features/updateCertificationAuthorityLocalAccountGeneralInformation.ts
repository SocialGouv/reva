import { prismaClient } from "../../../prisma/client";
import { logger } from "../../shared/logger";
import { UpdateCertificationAuthorityLocalAccountGeneralInformationInput } from "../certification-authority.types";

export const updateCertificationAuthorityLocalAccountGeneralInformation =
  async ({
    certificationAuthorityLocalAccountId,
    accountFirstname,
    accountLastname,
    accountEmail,
    contactFullName,
    contactEmail,
    contactPhone,
  }: UpdateCertificationAuthorityLocalAccountGeneralInformationInput) => {
    logger.info({ accountFirstname, accountLastname, accountEmail });

    return prismaClient.certificationAuthorityLocalAccount.update({
      where: {
        id: certificationAuthorityLocalAccountId,
      },
      data: {
        contactFullName,
        contactEmail,
        contactPhone,
      },
    });
  };
