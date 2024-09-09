import { Candidacy } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";

import { FunctionalCodeError } from "../../shared/error/functionalError";
import { cancelDropOutCandidacy } from "./cancelDropOutCandidacy";
import { candidateJPL } from "../../../test/fixtures/people-organisms";

let parisDepartment,
  candidate,
  normalCandidacy: Candidacy,
  droppedoutCandidacy: Candidacy,
  dropoutReason;

beforeAll(async () => {
  parisDepartment = await prismaClient.department.findFirst({
    where: { code: "75" },
  });

  candidate = await prismaClient.candidate.create({
    data: { ...candidateJPL, departmentId: parisDepartment?.id || "" },
  });

  dropoutReason = await prismaClient.dropOutReason.findFirst({
    where: { isActive: true },
  });

  normalCandidacy = await prismaClient.candidacy.create({
    data: {
      candidateId: candidate.id,
      candidacyStatuses: {
        create: [{ status: "PROJET", isActive: true }],
      },
    },
  });

  droppedoutCandidacy = await prismaClient.candidacy.create({
    data: {
      candidateId: candidate.id,
      candidacyStatuses: {
        create: [{ status: "PROJET", isActive: true }],
      },
    },
  });

  await prismaClient.candidacyDropOut.create({
    data: {
      candidacyId: droppedoutCandidacy.id,
      status: "PARCOURS_ENVOYE",
      dropOutReasonId: dropoutReason!.id,
    },
  });
});

describe("cancel drop out candidacy", () => {
  test("should fail with CANDIDACY_NOT_FOUND", async () => {
    await expect(async () => {
      await cancelDropOutCandidacy({
        candidacyId: "wr0ng1d",
      });
    }).rejects.toThrow(FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST);
  });
  test("should fail with CANDIDACY_NOT_DROPPED_OUT", async () => {
    await expect(async () => {
      await cancelDropOutCandidacy({
        candidacyId: normalCandidacy.id,
      });
    }).rejects.toThrow(FunctionalCodeError.CANDIDACY_NOT_DROPPED_OUT);
  });

  test("should return candidacy with previous drop out reason", async () => {
    const cancelDropoutResult = await cancelDropOutCandidacy({
      candidacyId: droppedoutCandidacy.id,
    });
    expect(cancelDropoutResult.id).toEqual(droppedoutCandidacy.id);
    expect(cancelDropoutResult.candidacyDropOut).not.toBeNull();
    expect(cancelDropoutResult.candidacyDropOut?.dropOutReason.id).toEqual(
      dropoutReason!.id,
    );
  });

  test("should return empty dropout reasons for the candidacy", async () => {
    const candidacyDropOut = await prismaClient.candidacyDropOut.findUnique({
      where: {
        candidacyId: droppedoutCandidacy.id,
      },
      include: {
        dropOutReason: true,
      },
    });
    expect(candidacyDropOut).toBeNull();
  });
});
