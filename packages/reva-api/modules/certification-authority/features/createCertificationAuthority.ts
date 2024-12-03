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
  certificationIds,
}: {
  label: string;
  contactEmail: string;
  contactFullName: string;
  accountFirstname: string;
  accountLastname: string;
  accountEmail: string;
  certificationAuthorityStructureId: string;
  certificationIds: string[];
}) => {
  const allDepartements = await prismaClient.department.findMany({
    select: { id: true },
  });

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
            data: allDepartements.map((d) => ({
              departmentId: d.id,
            })),
          },
        },
        oldCertificationAuthorityStructureId: certificationAuthorityStructureId,
        certificationAuthorityOnCertificationAuthorityStructure: {
          create: {
            certificationAuthorityStructureId:
              certificationAuthorityStructureId,
          },
        },
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
