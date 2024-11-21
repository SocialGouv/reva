import { CandidacyStatusStep, ReorientationReason } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { createCandidacyHelper } from "../../../test/helpers/entities/create-candidacy-helper";
import { FunctionalCodeError } from "../../shared/error/functionalError";
import { archiveCandidacy } from "./archiveCandidacy";
import { getCandidacyStatusesByCandidacyId } from "./getCandidacyStatusesByCandidacyId";

describe("archive candidacy", () => {
  test("should fail with CANDIDACY_NOT_FOUND", async () => {
    await expect(async () => {
      await archiveCandidacy({
        candidacyId: "badId",
        reorientationReasonId: null,
      });
    }).rejects.toThrow(FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST);
  });
  test("should fail with CANDIDACY_ALREADY_ARCHIVE", async () => {
    const candidacyArchived = await createCandidacyHelper(
      {},
      CandidacyStatusStep.ARCHIVE,
    );
    await expect(async () => {
      await archiveCandidacy({
        candidacyId: candidacyArchived.id,
        reorientationReasonId: null,
      });
    }).rejects.toThrow(FunctionalCodeError.CANDIDACY_ALREADY_ARCHIVED);
  });
  test("should fail with CANDIDACY_INVALID_REORIENTATION_REASON error code", async () => {
    const candidacy = await createCandidacyHelper();
    await expect(async () => {
      await archiveCandidacy({
        candidacyId: candidacy.id,
        reorientationReasonId: "wr0ng1d",
      });
    }).rejects.toThrow(
      FunctionalCodeError.CANDIDACY_INVALID_REORIENTATION_REASON,
    );
  });

  test("should return an archived candidacy with reorientation reason", async () => {
    const reorientationReason =
      (await prismaClient.reorientationReason.findUnique({
        where: {
          label: "Architecte de parcours neutre",
        },
      })) as ReorientationReason;

    const candidacy = await createCandidacyHelper();
    const archivedCandidacy = await archiveCandidacy({
      candidacyId: candidacy.id,
      reorientationReasonId: reorientationReason.id,
    });

    const candidacyStatuses = await getCandidacyStatusesByCandidacyId({
      candidacyId: candidacy.id,
    });
    expect(archivedCandidacy.reorientationReasonId).not.toBeNull();
    expect(archivedCandidacy.reorientationReasonId).toEqual(
      reorientationReason.id,
    );
    const activeStatus = candidacyStatuses?.find((s) => s.isActive);
    expect(activeStatus?.status).toBe("ARCHIVE");
  });

  test("should return an archived candidacy without reorientation reason", async () => {
    const candidacy = await createCandidacyHelper();
    const archivedCandidacy = await archiveCandidacy({
      candidacyId: candidacy.id,
      reorientationReasonId: null,
    });

    const candidacyStatuses = await getCandidacyStatusesByCandidacyId({
      candidacyId: candidacy.id,
    });
    expect(archivedCandidacy.reorientationReasonId).toBeNull();
    const activeStatus = candidacyStatuses?.find((s) => s.isActive);
    expect(activeStatus?.status).toBe("ARCHIVE");
  });
});
