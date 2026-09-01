import { prismaClient } from "@/prisma/client";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCertificationAuthorityHelper } from "@/test/helpers/entities/create-certification-authority-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";
import { getCandidateDepartmentIdOrThrow } from "@/test/helpers/entities/get-candidate-department-id-or-throw";

import { updateCertificationAuthorityDepartmentsAndCertifications } from "./updateCertificationAuthorityDepartmentsAndCertifications";

test("should assign the certification authority to a previously-unassigned candidacy that now falls within its coverage", async () => {
  const certification = await createCertificationHelper();
  const candidacy = await createCandidacyHelper({
    candidacyArgs: { certificationId: certification.id },
  });

  const certificationAuthority = await createCertificationAuthorityHelper();

  await updateCertificationAuthorityDepartmentsAndCertifications({
    certificationAuthorityId: certificationAuthority.id,
    certificationIds: [certification.id],
    departmentIds: [getCandidateDepartmentIdOrThrow(candidacy.candidate)],
  });

  const updated = await prismaClient.candidacy.findUnique({
    where: { id: candidacy.id },
  });
  expect(updated?.certificationAuthorityId).toEqual(certificationAuthority.id);
});

test("should not assign a candidacy that already has a certification authority", async () => {
  const certification = await createCertificationHelper();
  const candidacy = await createCandidacyHelper({
    candidacyArgs: { certificationId: certification.id },
  });
  const existingCa = await createCertificationAuthorityHelper();
  await prismaClient.candidacy.update({
    where: { id: candidacy.id },
    data: { certificationAuthorityId: existingCa.id },
  });

  const certificationAuthority = await createCertificationAuthorityHelper();

  await updateCertificationAuthorityDepartmentsAndCertifications({
    certificationAuthorityId: certificationAuthority.id,
    certificationIds: [certification.id],
    departmentIds: [getCandidateDepartmentIdOrThrow(candidacy.candidate)],
  });

  const updated = await prismaClient.candidacy.findUnique({
    where: { id: candidacy.id },
  });
  expect(updated?.certificationAuthorityId).toEqual(existingCa.id);
});

test("makes the certification visible once it is assigned a certification authority", async () => {
  const certification = await createCertificationHelper({ visible: false });
  const certificationAuthority = await createCertificationAuthorityHelper();

  await updateCertificationAuthorityDepartmentsAndCertifications({
    certificationAuthorityId: certificationAuthority.id,
    certificationIds: [certification.id],
    departmentIds: [],
  });

  const updated = await prismaClient.certification.findUnique({
    where: { id: certification.id },
  });
  expect(updated?.visible).toBe(true);
});

test("makes the certification invisible once its last certification authority is unassigned", async () => {
  const certification = await createCertificationHelper({ visible: true });
  const certificationAuthority = await createCertificationAuthorityHelper();
  await prismaClient.certificationAuthorityOnCertification.create({
    data: {
      certificationId: certification.id,
      certificationAuthorityId: certificationAuthority.id,
    },
  });

  await updateCertificationAuthorityDepartmentsAndCertifications({
    certificationAuthorityId: certificationAuthority.id,
    certificationIds: [],
    departmentIds: [],
  });

  const updated = await prismaClient.certification.findUnique({
    where: { id: certification.id },
  });
  expect(updated?.visible).toBe(false);
});
