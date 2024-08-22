import { createAccount } from "../../account/features/createAccount";
import { prismaClient } from "../../../prisma/client";

export const createCertificationAuthority = async ({
  label,
  contactEmail,
  contactFullName,
  accountFirstname,
  accountLastname,
  accountEmail,
  certificationAuthorityStructureId,
  departmentIds,
  certificationIds,
}: {
  label: string;
  contactEmail: string;
  contactFullName: string;
  accountFirstname: string;
  accountLastname: string;
  accountEmail: string;
  certificationAuthorityStructureId: string;
  departmentIds: string[];
  certificationIds: string[];
}) => {
  const newCertificationAuthority =
    await prismaClient.certificationAuthority.create({
      data: {
        certificationAuthorityOnCertification: {
          createMany: {
            data: certificationIds.map((certificationId) => ({
              certificationId,
            })),
          },
        },
        certificationAuthorityOnDepartment: {
          createMany: {
            data: departmentIds.map((departmentId) => ({ departmentId })),
          },
        },
        certificationAuthorityStructureId,
        label,
        contactEmail,
        contactFullName,
      },
    });

  const account = await createAccount({
    firstname: accountFirstname,
    lastname: accountLastname,
    email: accountEmail,
    username: accountEmail,
    group: "certification_authority",
    certificationAuthorityId: newCertificationAuthority.id,
  });

  if (!account) {
    throw new Error("Erreur pendant la création du compte certificateur");
  }

  return newCertificationAuthority;
};
