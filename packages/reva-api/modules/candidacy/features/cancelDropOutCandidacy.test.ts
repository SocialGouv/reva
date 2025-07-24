import { CandidacyStatusStep } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { createCandidacyDropOutHelper } from "../../../test/helpers/entities/create-candidacy-drop-out-helper";
import { createCandidacyHelper } from "../../../test/helpers/entities/create-candidacy-helper";
import { FunctionalCodeError } from "../../shared/error/functionalError";

import { cancelDropOutCandidacy } from "./cancelDropOutCandidacy";

describe("cancel drop out candidacy", () => {
  test("should fail with CANDIDACY_NOT_FOUND", async () => {
    await expect(async () => {
      await cancelDropOutCandidacy({
        candidacyId: "wr0ng1d",
      });
    }).rejects.toThrow(FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST);
  });
  test("should fail with CANDIDACY_NOT_DROPPED_OUT", async () => {
    const candidacy = await createCandidacyHelper();
    await expect(async () => {
      await cancelDropOutCandidacy({
        candidacyId: candidacy.id,
      });
    }).rejects.toThrow(FunctionalCodeError.CANDIDACY_NOT_DROPPED_OUT);
  });

  test("should return candidacy with previous drop out reason", async () => {
    const candidacyDropOut = await createCandidacyDropOutHelper();
    const candidacy = candidacyDropOut.candidacy;
    const dropOutReason = candidacyDropOut.dropOutReason;

    const cancelDropoutResult = await cancelDropOutCandidacy({
      candidacyId: candidacy.id,
    });

    expect(cancelDropoutResult.id).toEqual(candidacy.id);
    expect(cancelDropoutResult.candidacyDropOut).not.toBeNull();
    expect(cancelDropoutResult.candidacyDropOut?.dropOutReason.id).toEqual(
      dropOutReason.id,
    );
  });

  test("should return empty dropout reasons for the candidacy", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.ARCHIVE,
    });
    const candidacyDropOut = await prismaClient.candidacyDropOut.findUnique({
      where: {
        candidacyId: candidacy.id,
      },
      include: {
        dropOutReason: true,
      },
    });
    expect(candidacyDropOut).toBeNull();
  });
});
