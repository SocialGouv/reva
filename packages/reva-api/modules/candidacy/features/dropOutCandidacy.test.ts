import { prismaClient } from "../../../prisma/client";
import { createCandidacyDropOutHelper } from "../../../test/helpers/entities/create-candidacy-drop-out-helper";
import { createCandidacyHelper } from "../../../test/helpers/entities/create-candidacy-helper";
import { createDropOutReasonHelper } from "../../../test/helpers/entities/create-drop-out-reason-helper";
import { FunctionalCodeError } from "../../shared/error/functionalError";
import { dropOutCandidacy } from "./dropOutCandidacy";

describe("drop out candidacy", () => {
  test("should fail with CANDIDACY_NOT_FOUND", async () => {
    const dropoutReason = await createDropOutReasonHelper();
    await expect(async () => {
      await dropOutCandidacy({
        candidacyId: "wr0ng1d",
        dropOutReasonId: dropoutReason!.id,
      });
    }).rejects.toThrow(FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST);
  });
  test("should fail with CANDIDACY_ALREADY_DROPPED_OUT", async () => {
    const dropoutReason = await createDropOutReasonHelper();
    const candidacyDropOut = await createCandidacyDropOutHelper();
    await expect(async () => {
      await dropOutCandidacy({
        candidacyId: candidacyDropOut.candidacy.id,
        dropOutReasonId: dropoutReason!.id,
      });
    }).rejects.toThrow(FunctionalCodeError.CANDIDACY_ALREADY_DROPPED_OUT);
  });
  test("should fail with CANDIDACY_INVALID_DROP_OUT_REASON error code", async () => {
    const candidacy = await createCandidacyHelper();
    await expect(async () => {
      await dropOutCandidacy({
        candidacyId: candidacy.id,
        dropOutReasonId: "wr0ng1d",
      });
    }).rejects.toThrow(FunctionalCodeError.CANDIDACY_INVALID_DROP_OUT_REASON);
  });

  test("should return candidacy with drop out reason", async () => {
    const dropoutReason = await createDropOutReasonHelper();
    const candidacy = await createCandidacyHelper();
    await dropOutCandidacy({
      candidacyId: candidacy.id,
      dropOutReasonId: dropoutReason.id,
    });
    const candidacyDropOut = await prismaClient.candidacyDropOut.findUnique({
      where: {
        candidacyId: candidacy.id,
      },
      include: {
        dropOutReason: true,
      },
    });
    expect(candidacyDropOut).not.toBeNull();
    expect(candidacyDropOut?.dropOutReason.id).toEqual(dropoutReason.id);
  });
});
