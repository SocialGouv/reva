import { prismaClient } from "@/prisma/client";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCertificationAuthorityHelper } from "@/test/helpers/entities/create-certification-authority-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";
import { getCandidateDepartmentIdOrThrow } from "@/test/helpers/entities/get-candidate-department-id-or-throw";

import { updateCertificationAuthorityDepartments } from "./updateCertificationAuthorityDepartments";

test("should assign the certification authority to a previously-unassigned candidacy that now falls within its coverage", async () => {
  const certification = await createCertificationHelper();
  const candidacy = await createCandidacyHelper({
    candidacyArgs: { certificationId: certification.id },
  });

  const certificationAuthority = await createCertificationAuthorityHelper({
    certificationAuthorityOnCertification: {
      create: { certificationId: certification.id },
    },
  });

  await updateCertificationAuthorityDepartments({
    certificationAuthorityId: certificationAuthority.id,
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

  const certificationAuthority = await createCertificationAuthorityHelper({
    certificationAuthorityOnCertification: {
      create: { certificationId: certification.id },
    },
  });

  await updateCertificationAuthorityDepartments({
    certificationAuthorityId: certificationAuthority.id,
    departmentIds: [getCandidateDepartmentIdOrThrow(candidacy.candidate)],
  });

  const updated = await prismaClient.candidacy.findUnique({
    where: { id: candidacy.id },
  });
  expect(updated?.certificationAuthorityId).toEqual(existingCa.id);
});
