import { CandidacyStatusStep } from "@prisma/client";

import { createCandidacyHelper } from "../../../test/helpers/entities/create-candidacy-helper";
import { createReorientationReasonHelper } from "../../../test/helpers/entities/create-reorientation-reason-helper";
import { FunctionalCodeError } from "../../shared/error/functionalError";

import { unarchiveCandidacy } from "./unarchiveCandidacy";
import { updateCandidacyStatus } from "./updateCandidacyStatus";

describe("unarchive candidacy", () => {
  test("should fail with CANDIDACY_NOT_FOUND", async () => {
    await expect(async () => {
      await unarchiveCandidacy({
        candidacyId: "badId",
      });
    }).rejects.toThrow(FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST);
  });
  test("should fail with CANDIDACY_NOT_ARCHIVED", async () => {
    const candidacy = await createCandidacyHelper();
    await expect(async () => {
      await unarchiveCandidacy({
        candidacyId: candidacy.id,
      });
    }).rejects.toThrow(FunctionalCodeError.CANDIDACIES_NOT_ARCHIVED);
  });

  test("should fail with CANDIDACY_IS_REORIENTATION", async () => {
    const reorientationReason = await createReorientationReasonHelper();
    const candidacy = await createCandidacyHelper({
      candidacyArgs: {
        reorientationReasonId: reorientationReason.id,
      },
      candidacyActiveStatus: CandidacyStatusStep.ARCHIVE,
    });
    await expect(async () => {
      await unarchiveCandidacy({
        candidacyId: candidacy.id,
      });
    }).rejects.toThrow(FunctionalCodeError.CANDIDACY_IS_REORIENTATION);
  });

  test("should return an unarchived candidacy", async () => {
    const candidacy = await createCandidacyHelper();
    const activeStatusBeforeArchive = candidacy.status;
    await updateCandidacyStatus({
      candidacyId: candidacy.id,
      status: "ARCHIVE",
    });
    await unarchiveCandidacy({
      candidacyId: candidacy.id,
    });

    const activeStatus = candidacy.status;
    expect(activeStatus).not.toBeNull();
    expect(activeStatus).toEqual(activeStatusBeforeArchive);
  });
});
