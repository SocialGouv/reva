import {
  CertificationJuryFrequency,
  CertificationJuryTypeOfModality,
  CertificationStatus,
} from "@prisma/client";
import { addDays, subDays } from "date-fns";

import { createCertificationAuthorityStructureHelper } from "@/test/helpers/entities/create-certification-authority-structure-helper";
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

  it("allows missing jury fields when reduced requirements are enabled", async () => {
    const certification = await createPendingReducedRequirementsCertification(
      {},
    );

    const updatedCertification = await updateCertificationDescription({
      certificationId: certification.id,
      availableAt: subDays(new Date(), 2),
    });

    expect(updatedCertification.id).toBe(certification.id);
    expect(updatedCertification.juryTypeMiseEnSituationProfessionnelle).toBe(
      null,
    );
    expect(updatedCertification.juryTypeSoutenanceOrale).toBe(null);
    expect(updatedCertification.juryFrequency).toBe(null);
    expect(updatedCertification.juryFrequencyOther).toBe(null);
  });

  it("keeps jury frequency coherence when reduced requirements are enabled", async () => {
    const certification = await createPendingReducedRequirementsCertification(
      {},
    );

    await expect(
      updateCertificationDescription({
        certificationId: certification.id,
        availableAt: subDays(new Date(), 2),
        juryFrequency: CertificationJuryFrequency.MONTHLY,
        juryFrequencyOther: "Tous les mois",
      }),
    ).rejects.toThrow("Renseigner une seule fréquence de jury");
  });
});
