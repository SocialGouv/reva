import { CandidacyStatusStep } from "@prisma/client";

import { CANDIDATURE_NON_TROUVEE } from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCertificationAuthorityHelper } from "@/test/helpers/entities/create-certification-authority-helper";

import { updateCandidacyCertificationAuthority } from "./updateCandidacyCertificationAuthority";

describe("updateCandidacyCertificationAuthority", () => {
  const allowedStatuses: CandidacyStatusStep[] = [
    "PROJET",
    "VALIDATION",
    "PRISE_EN_CHARGE",
    "PARCOURS_ENVOYE",
    "PARCOURS_CONFIRME",
    "DOSSIER_FAISABILITE_INCOMPLET",
  ];

  const blockedStatuses: CandidacyStatusStep[] = [
    "ARCHIVE",
    "DOSSIER_FAISABILITE_ENVOYE",
    "DOSSIER_FAISABILITE_COMPLET",
    "DOSSIER_FAISABILITE_RECEVABLE",
    "DOSSIER_FAISABILITE_NON_RECEVABLE",
    "DOSSIER_DE_VALIDATION_ENVOYE",
    "DOSSIER_DE_VALIDATION_SIGNALE",
    "DOSSIER_PRO",
    "CERTIFICATION",
  ];

  allowedStatuses.forEach((status) => {
    test(`should update certificationAuthorityId when candidacy status is ${status}`, async () => {
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: status,
      });
      const certificationAuthority = await createCertificationAuthorityHelper();

      const result = await updateCandidacyCertificationAuthority({
        candidacyId: candidacy.id,
        certificationAuthorityId: certificationAuthority.id,
      });

      expect(result.certificationAuthorityId).toEqual(
        certificationAuthority.id,
      );

      const updated = await prismaClient.candidacy.findUnique({
        where: { id: candidacy.id },
      });
      expect(updated?.certificationAuthorityId).toEqual(
        certificationAuthority.id,
      );
    });
  });

  blockedStatuses.forEach((status) => {
    test(`should throw when candidacy status is ${status}`, async () => {
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: status,
      });
      const certificationAuthority = await createCertificationAuthorityHelper();

      await expect(
        updateCandidacyCertificationAuthority({
          candidacyId: candidacy.id,
          certificationAuthorityId: certificationAuthority.id,
        }),
      ).rejects.toThrow(
        "Le statut de la candidature ne permet pas de changer de certificateur",
      );

      const updated = await prismaClient.candidacy.findUnique({
        where: { id: candidacy.id },
      });
      expect(updated?.certificationAuthorityId).toBeNull();
    });
  });

  test("should throw when candidacy does not exist", async () => {
    await expect(
      updateCandidacyCertificationAuthority({
        candidacyId: "00000000-0000-0000-0000-000000000000",
        certificationAuthorityId: "00000000-0000-0000-0000-000000000000",
      }),
    ).rejects.toThrow(CANDIDATURE_NON_TROUVEE);
  });

  test("should use the provided transaction client when given", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: "PARCOURS_CONFIRME",
    });
    const certificationAuthority = await createCertificationAuthorityHelper();

    await prismaClient.$transaction((tx) =>
      updateCandidacyCertificationAuthority({
        candidacyId: candidacy.id,
        certificationAuthorityId: certificationAuthority.id,
        tx,
      }),
    );

    const updated = await prismaClient.candidacy.findUnique({
      where: { id: candidacy.id },
    });
    expect(updated?.certificationAuthorityId).toEqual(
      certificationAuthority.id,
    );
  });
});
