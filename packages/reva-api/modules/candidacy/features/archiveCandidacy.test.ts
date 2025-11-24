import { CandidacyStatusStep } from "@prisma/client";

import { FunctionalCodeError } from "@/modules/shared/error/functionalError";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";

import { archiveCandidacy } from "./archiveCandidacy";

describe("archive candidacy", () => {
  test("should fail with CANDIDACY_NOT_FOUND", async () => {
    await expect(async () => {
      await archiveCandidacy({
        candidacyId: "badId",
        archivingReason: "INACTIVITE_CANDIDAT",
      });
    }).rejects.toThrow(FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST);
  });

  test("should fail with CANDIDACY_ALREADY_ARCHIVE", async () => {
    const candidacyArchived = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.ARCHIVE,
    });
    await expect(async () => {
      await archiveCandidacy({
        candidacyId: candidacyArchived.id,
        archivingReason: "INACTIVITE_CANDIDAT",
      });
    }).rejects.toThrow(FunctionalCodeError.CANDIDACY_ALREADY_ARCHIVED);
  });

  test("should return an archived candidacy", async () => {
    const candidacy = await createCandidacyHelper();
    const archivedCandidacy = await archiveCandidacy({
      candidacyId: candidacy.id,
      archivingReason: "INACTIVITE_CANDIDAT",
    });

    expect(archivedCandidacy.status).toBe("ARCHIVE");
  });

  test("should return the correct archiving reason when archiving a candidacy", async () => {
    const candidacy = await createCandidacyHelper();
    const archivedCandidacy = await archiveCandidacy({
      candidacyId: candidacy.id,
      archivingReason: "MULTI_CANDIDATURES",
    });

    expect(archivedCandidacy.archivingReason).not.toBeNull();
    expect(archivedCandidacy.archivingReason).toEqual("MULTI_CANDIDATURES");
  });

  test("should return the correct archiving reason additional information when archiving a candidacy", async () => {
    const candidacy = await createCandidacyHelper();
    const archivedCandidacy = await archiveCandidacy({
      candidacyId: candidacy.id,
      archivingReason: "AUTRE",
      archivingReasonAdditionalInformation: "additional information",
    });

    expect(archivedCandidacy.archivingReason).not.toBeNull();
    expect(archivedCandidacy.archivingReason).toEqual("AUTRE");
    expect(archivedCandidacy.archivingReasonAdditionalInformation).toEqual(
      "additional information",
    );
  });

  test("should fail when feasibility file has been sent", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
    });

    await expect(async () => {
      await archiveCandidacy({
        candidacyId: candidacy.id,
        archivingReason: "INACTIVITE_CANDIDAT",
      });
    }).rejects.toThrow(
      `La candidature ${candidacy.id} ne peut pas être archivée car le dossier de faisabilité est envoyé et une décision du certificateur est en attente`,
    );
  });
});
