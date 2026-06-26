import { prismaClient } from "@/prisma/client";
import { createCertificationAuthorityHelper } from "@/test/helpers/entities/create-certification-authority-helper";
import { createCertificationAuthorityLocalAccountHelper } from "@/test/helpers/entities/create-certification-authority-local-account-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";

import { getCertificationAuthorityLocalAccountByCertificationAuthorityId } from "./getCertificationAuthorityLocalAccountByCertificationAuthorityId";

const getDepartmentByCode = (code: string) =>
  prismaClient.department.findFirstOrThrow({ where: { code } });

test("should return all local accounts of a certification authority when no filter is provided", async () => {
  const certificationAuthority = await createCertificationAuthorityHelper();

  const localAccount1 = await createCertificationAuthorityLocalAccountHelper({
    certificationAuthorityId: certificationAuthority.id,
  });
  const localAccount2 = await createCertificationAuthorityLocalAccountHelper({
    certificationAuthorityId: certificationAuthority.id,
  });

  const localAccounts =
    await getCertificationAuthorityLocalAccountByCertificationAuthorityId({
      certificationAuthorityId: certificationAuthority.id,
    });

  expect(localAccounts?.map((a) => a.id).sort()).toEqual(
    [localAccount1.id, localAccount2.id].sort(),
  );
});

test("should return an empty array when the certification authority has no local accounts", async () => {
  const certificationAuthority = await createCertificationAuthorityHelper();

  const localAccounts =
    await getCertificationAuthorityLocalAccountByCertificationAuthorityId({
      certificationAuthorityId: certificationAuthority.id,
    });

  expect(localAccounts).toEqual([]);
});

test("should return null when the certification authority does not exist", async () => {
  const localAccounts =
    await getCertificationAuthorityLocalAccountByCertificationAuthorityId({
      certificationAuthorityId: "00000000-0000-0000-0000-000000000000",
    });

  expect(localAccounts).toBeNull();
});

test("should only return local accounts associated with the given departmentId", async () => {
  const certificationAuthority = await createCertificationAuthorityHelper();
  const parisDepartment = await getDepartmentByCode("75");
  const marseilleDepartment = await getDepartmentByCode("13");

  const localAccountInParis =
    await createCertificationAuthorityLocalAccountHelper({
      certificationAuthorityId: certificationAuthority.id,
      certificationAuthorityLocalAccountOnDepartment: {
        create: [{ departmentId: parisDepartment.id }],
      },
    });
  await createCertificationAuthorityLocalAccountHelper({
    certificationAuthorityId: certificationAuthority.id,
    certificationAuthorityLocalAccountOnDepartment: {
      create: [{ departmentId: marseilleDepartment.id }],
    },
  });

  const localAccounts =
    await getCertificationAuthorityLocalAccountByCertificationAuthorityId({
      certificationAuthorityId: certificationAuthority.id,
      departmentId: parisDepartment.id,
    });

  expect(localAccounts?.map((a) => a.id)).toEqual([localAccountInParis.id]);
});

test("should only return local accounts associated with the given certificationId", async () => {
  const certificationAuthority = await createCertificationAuthorityHelper();
  const certification1 = await createCertificationHelper();
  const certification2 = await createCertificationHelper();

  const localAccountForCertification1 =
    await createCertificationAuthorityLocalAccountHelper({
      certificationAuthorityId: certificationAuthority.id,
      certificationAuthorityLocalAccountOnCertification: {
        create: [{ certificationId: certification1.id }],
      },
    });
  await createCertificationAuthorityLocalAccountHelper({
    certificationAuthorityId: certificationAuthority.id,
    certificationAuthorityLocalAccountOnCertification: {
      create: [{ certificationId: certification2.id }],
    },
  });

  const localAccounts =
    await getCertificationAuthorityLocalAccountByCertificationAuthorityId({
      certificationAuthorityId: certificationAuthority.id,
      certificationId: certification1.id,
    });

  expect(localAccounts?.map((a) => a.id)).toEqual([
    localAccountForCertification1.id,
  ]);
});

test("should only return local accounts matching both departmentId and certificationId filters", async () => {
  const certificationAuthority = await createCertificationAuthorityHelper();
  const parisDepartment = await getDepartmentByCode("75");
  const marseilleDepartment = await getDepartmentByCode("13");
  const certification1 = await createCertificationHelper();
  const certification2 = await createCertificationHelper();

  const matchingLocalAccount =
    await createCertificationAuthorityLocalAccountHelper({
      certificationAuthorityId: certificationAuthority.id,
      certificationAuthorityLocalAccountOnDepartment: {
        create: [{ departmentId: parisDepartment.id }],
      },
      certificationAuthorityLocalAccountOnCertification: {
        create: [{ certificationId: certification1.id }],
      },
    });

  // same department but different certification
  await createCertificationAuthorityLocalAccountHelper({
    certificationAuthorityId: certificationAuthority.id,
    certificationAuthorityLocalAccountOnDepartment: {
      create: [{ departmentId: parisDepartment.id }],
    },
    certificationAuthorityLocalAccountOnCertification: {
      create: [{ certificationId: certification2.id }],
    },
  });

  // same certification but different department
  await createCertificationAuthorityLocalAccountHelper({
    certificationAuthorityId: certificationAuthority.id,
    certificationAuthorityLocalAccountOnDepartment: {
      create: [{ departmentId: marseilleDepartment.id }],
    },
    certificationAuthorityLocalAccountOnCertification: {
      create: [{ certificationId: certification1.id }],
    },
  });

  const localAccounts =
    await getCertificationAuthorityLocalAccountByCertificationAuthorityId({
      certificationAuthorityId: certificationAuthority.id,
      departmentId: parisDepartment.id,
      certificationId: certification1.id,
    });

  expect(localAccounts?.map((a) => a.id)).toEqual([matchingLocalAccount.id]);
});

test("should not return local accounts belonging to another certification authority", async () => {
  const certificationAuthority = await createCertificationAuthorityHelper();
  await createCertificationAuthorityLocalAccountHelper();

  const localAccounts =
    await getCertificationAuthorityLocalAccountByCertificationAuthorityId({
      certificationAuthorityId: certificationAuthority.id,
    });

  expect(localAccounts).toEqual([]);
});
