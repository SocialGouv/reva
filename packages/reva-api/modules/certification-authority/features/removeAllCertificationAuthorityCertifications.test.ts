import { prismaClient } from "@/prisma/client";
import { createCertificationAuthorityHelper } from "@/test/helpers/entities/create-certification-authority-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";
import { createParcoursCertificationHelper } from "@/test/helpers/entities/create-parcours-certification-helper";

import { removeAllCertificationAuthorityCertifications } from "./removeAllCertificationAuthorityCertifications";

test("should throw when the certification authority does not exist", async () => {
  await expect(
    removeAllCertificationAuthorityCertifications({
      certificationAuthorityId: "00000000-0000-0000-0000-000000000000",
    }),
  ).rejects.toThrow("Authorité de certification non trouvée");
});

test("should remove every certification link of the certification authority", async () => {
  const certification = await createCertificationHelper();
  const otherCertification = await createCertificationHelper();
  const parcoursCertification = await createParcoursCertificationHelper({
    certificationId: certification.id,
  });
  const department = await prismaClient.department.findFirstOrThrow({
    where: { code: "75" },
  });

  const certificationAuthority = await createCertificationAuthorityHelper({
    certificationAuthorityOnCertification: {
      create: [
        {
          certificationId: certification.id,
          certificationAuthorityOnCertificationOnParcoursCertifications: {
            create: { parcoursCertificationId: parcoursCertification.id },
          },
        },
        { certificationId: otherCertification.id },
      ],
    },
    certificationAuthorityOnDepartment: {
      create: { departmentId: department.id },
    },
  });

  await removeAllCertificationAuthorityCertifications({
    certificationAuthorityId: certificationAuthority.id,
  });

  const remainingLinks =
    await prismaClient.certificationAuthorityOnCertification.findMany({
      where: { certificationAuthorityId: certificationAuthority.id },
    });
  expect(remainingLinks).toEqual([]);

  const remainingParcoursLinks =
    await prismaClient.certificationAuthorityOnCertificationOnParcoursCertification.findMany(
      {
        where: { parcoursCertificationId: parcoursCertification.id },
      },
    );
  expect(remainingParcoursLinks).toEqual([]);

  const certifications = await prismaClient.certification.findMany({
    where: { id: { in: [certification.id, otherCertification.id] } },
  });
  expect(certifications).toHaveLength(2);

  const parcours = await prismaClient.parcoursCertification.findUnique({
    where: { id: parcoursCertification.id },
  });
  expect(parcours).not.toBeNull();

  const departmentLinks =
    await prismaClient.certificationAuthorityOnDepartment.findMany({
      where: { certificationAuthorityId: certificationAuthority.id },
    });
  expect(departmentLinks).toHaveLength(1);
});

test("should not remove certification links of another certification authority", async () => {
  const certification = await createCertificationHelper();

  const certificationAuthority = await createCertificationAuthorityHelper({
    certificationAuthorityOnCertification: {
      create: { certificationId: certification.id },
    },
  });
  const otherCertificationAuthority = await createCertificationAuthorityHelper({
    certificationAuthorityOnCertification: {
      create: { certificationId: certification.id },
    },
  });

  await removeAllCertificationAuthorityCertifications({
    certificationAuthorityId: certificationAuthority.id,
  });

  const remainingLinks =
    await prismaClient.certificationAuthorityOnCertification.findMany({
      where: {
        certificationAuthorityId: {
          in: [certificationAuthority.id, otherCertificationAuthority.id],
        },
      },
    });

  expect(remainingLinks.map((link) => link.certificationAuthorityId)).toEqual([
    otherCertificationAuthority.id,
  ]);
});

test("should succeed when the certification authority has no certification", async () => {
  const certificationAuthority = await createCertificationAuthorityHelper();

  await expect(
    removeAllCertificationAuthorityCertifications({
      certificationAuthorityId: certificationAuthority.id,
    }),
  ).resolves.toBeUndefined();

  const remainingLinks =
    await prismaClient.certificationAuthorityOnCertification.findMany({
      where: { certificationAuthorityId: certificationAuthority.id },
    });
  expect(remainingLinks).toEqual([]);
});
