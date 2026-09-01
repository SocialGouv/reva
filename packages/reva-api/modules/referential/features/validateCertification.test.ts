import { CertificationStatus } from "@prisma/client";
import { addDays, subDays } from "date-fns";

import { prismaClient } from "@/prisma/client";
import { createCertificationAuthorityHelper } from "@/test/helpers/entities/create-certification-authority-helper";
import { createCertificationAuthorityStructureHelper } from "@/test/helpers/entities/create-certification-authority-structure-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";

import { validateCertification } from "./validateCertification";

const createPendingCertification = async () =>
  createCertificationHelper({
    status: CertificationStatus.A_VALIDER_PAR_CERTIFICATEUR,
    availableAt: subDays(new Date(), 1),
    rncpExpiresAt: addDays(new Date(), 1),
  });

const createPendingReducedRequirementsCertification = async () => {
  const structure = await createCertificationAuthorityStructureHelper({
    hasReducedRequirements: true,
  });

  return createCertificationHelper({
    certificationAuthorityStructureId: structure.id,
    status: CertificationStatus.A_VALIDER_PAR_CERTIFICATEUR,
    availableAt: subDays(new Date(), 1),
    rncpExpiresAt: addDays(new Date(), 1),
  });
};

describe("validateCertification", () => {
  it("requires a complete description before validation", async () => {
    const certification = await createPendingCertification();

    await expect(
      validateCertification({
        certificationId: certification.id,
      }),
    ).rejects.toThrow("La description de la certification n'est pas complète");
  });

  it("validates reduced requirements certifications without jury information", async () => {
    const certification = await createPendingReducedRequirementsCertification();

    const validatedCertification = await validateCertification({
      certificationId: certification.id,
    });

    expect(validatedCertification.status).toBe(
      CertificationStatus.VALIDE_PAR_CERTIFICATEUR,
    );
  });

  it("does not make the certification visible when no certification authority is assigned", async () => {
    const certification = await createPendingReducedRequirementsCertification();

    const validatedCertification = await validateCertification({
      certificationId: certification.id,
    });

    expect(validatedCertification.visible).toBe(false);
  });

  it("makes the certification visible once a certification authority is assigned", async () => {
    const certification = await createPendingReducedRequirementsCertification();
    const certificationAuthority = await createCertificationAuthorityHelper();
    await prismaClient.certificationAuthorityOnCertification.create({
      data: {
        certificationId: certification.id,
        certificationAuthorityId: certificationAuthority.id,
      },
    });

    const validatedCertification = await validateCertification({
      certificationId: certification.id,
    });

    expect(validatedCertification.visible).toBe(true);
  });
});
