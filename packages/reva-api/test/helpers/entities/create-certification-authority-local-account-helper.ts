import { CertificationAuthorityLocalAccount } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { createAccountHelper } from "./create-account-helper";
import { createCertificationAuthorityHelper } from "./create-certification-authority-helper";

export const createCertificationAuthorityLocalAccountHelper = async (
  args?: Partial<CertificationAuthorityLocalAccount>,
) => {
  const certificationAuthority = await createCertificationAuthorityHelper();
  const account = await createAccountHelper();

  return prismaClient.certificationAuthorityLocalAccount.create({
    data: {
      certificationAuthorityId: certificationAuthority.id,
      accountId: account.id,
      ...args,
    },
    include: {
      account: true,
      certificationAuthority: {
        include: {
          Account: true,
          certificationAuthorityStructure: {
            include: { certifications: true },
          },
        },
      },
    },
  });
};
