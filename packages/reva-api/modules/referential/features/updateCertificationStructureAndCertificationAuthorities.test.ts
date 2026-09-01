import { prismaClient } from "@/prisma/client";
import { createCertificationAuthorityHelper } from "@/test/helpers/entities/create-certification-authority-helper";
import { createCertificationAuthorityStructureHelper } from "@/test/helpers/entities/create-certification-authority-structure-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";

import { updateCertificationStructureAndCertificationAuthorities } from "./updateCertificationStructureAndCertificationAuthorities";

test("makes the certification visible when assigning it a certification authority under a new structure", async () => {
  const certification = await createCertificationHelper({ visible: false });
  const newStructure = await createCertificationAuthorityStructureHelper();
  const certificationAuthority = await createCertificationAuthorityHelper();

  await updateCertificationStructureAndCertificationAuthorities({
    certificationId: certification.id,
    certificationAuthorityStructureId: newStructure.id,
    certificationAuthorityIds: [certificationAuthority.id],
  });

  const updated = await prismaClient.certification.findUnique({
    where: { id: certification.id },
  });
  expect(updated?.visible).toBe(true);
});

test("makes the certification invisible when unassigning its last certification authority", async () => {
  const certification = await createCertificationHelper({ visible: true });
  const certificationAuthority = await createCertificationAuthorityHelper();
  await prismaClient.certificationAuthorityOnCertification.create({
    data: {
      certificationId: certification.id,
      certificationAuthorityId: certificationAuthority.id,
    },
  });

  await updateCertificationStructureAndCertificationAuthorities({
    certificationId: certification.id,
    certificationAuthorityStructureId:
      certification.certificationAuthorityStructureId as string,
    certificationAuthorityIds: [],
  });

  const updated = await prismaClient.certification.findUnique({
    where: { id: certification.id },
  });
  expect(updated?.visible).toBe(false);
});
