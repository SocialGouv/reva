import { CertificationStatus } from "@prisma/client";
import { addDays, subDays } from "date-fns";

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

describe("validateCertification", () => {
  it("requires a complete description before validation", async () => {
    const certification = await createPendingCertification({});

    await expect(
      validateCertification({
        certificationId: certification.id,
      }),
    ).rejects.toThrow("La description de la certification n'est pas complète");
  });
});
