import {
  CertificationJuryFrequency,
  CertificationJuryTypeOfModality,
  CertificationStatus,
} from "@prisma/client";
import { addDays, subDays } from "date-fns";

import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";

import { updateCertificationDescription } from "./updateCertificationDescription";

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

describe("updateCertificationDescription", () => {
  it("requires at least one jury modality", async () => {
    const certification = await createPendingCertification({});

    await expect(
      updateCertificationDescription({
        certificationId: certification.id,
        availableAt: subDays(new Date(), 2),
      }),
    ).rejects.toThrow("Renseigner au moins une modalité de jury");
  });

  it("requires a single jury frequency source", async () => {
    const certification = await createPendingCertification({});

    await expect(
      updateCertificationDescription({
        certificationId: certification.id,
        availableAt: subDays(new Date(), 2),
        juryTypeMiseEnSituationProfessionnelle:
          CertificationJuryTypeOfModality.PRESENTIEL,
        juryFrequency: CertificationJuryFrequency.MONTHLY,
        juryFrequencyOther: "Tous les mois",
      }),
    ).rejects.toThrow("Renseigner une seule fréquence de jury");
  });
});
