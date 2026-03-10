import { CertificationStatus } from "@prisma/client";
import { addDays, subDays } from "date-fns";

import { createCertificationAuthorityStructureHelper } from "@/test/helpers/entities/create-certification-authority-structure-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";

import { validateCertification } from "./validateCertification";

const createPendingCertification = async ({
  status = CertificationStatus.A_VALIDER_PAR_CERTIFICATEUR,
}: {
  status?: CertificationStatus;
}) =>
  createCertificationHelper({
    status,
    availableAt: subDays(new Date(), 1),
    rncpExpiresAt: addDays(new Date(), 1),
  });

const createPendingReducedRequirementsCertification = async ({
  status = CertificationStatus.A_VALIDER_PAR_CERTIFICATEUR,
}: {
  status?: CertificationStatus;
}) => {
  const structure = await createCertificationAuthorityStructureHelper({
    hasReducedRequirements: true,
  });

  return createCertificationHelper({
    certificationAuthorityStructureId: structure.id,
    status,
    availableAt: subDays(new Date(), 1),
    rncpExpiresAt: addDays(new Date(), 1),
  });
};

describe("validateCertification", () => {
  it("requires a complete description before validation", async () => {
    const certification = await createPendingCertification({});

    await expect(
      validateCertification({
        certificationId: certification.id,
      }),
    ).rejects.toThrow("La description de la certification n'est pas complète");
  });

  it("validates reduced requirements certifications without jury information", async () => {
    const certification = await createPendingReducedRequirementsCertification(
      {},
    );

    const validatedCertification = await validateCertification({
      certificationId: certification.id,
    });

    expect(validatedCertification.status).toBe(
      CertificationStatus.VALIDE_PAR_CERTIFICATEUR,
    );
  });
});
