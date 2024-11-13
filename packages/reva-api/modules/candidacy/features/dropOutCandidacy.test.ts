import { Candidacy } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";

import { CANDIDATE_MAN } from "../../../test/fixtures";
import { FunctionalCodeError } from "../../shared/error/functionalError";
import { dropOutCandidacy } from "./dropOutCandidacy";

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
    data: { ...CANDIDATE_MAN, departmentId: parisDepartment?.id || "" },
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

describe("drop out candidacy", () => {
  test("should fail with CANDIDACY_NOT_FOUND", async () => {
    await expect(async () => {
      await dropOutCandidacy({
        candidacyId: "wr0ng1d",
        dropOutReasonId: dropoutReason!.id,
      });
    }).rejects.toThrow(FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST);
  });
  test("should fail with CANDIDACY_ALREADY_DROPPED_OUT", async () => {
    await expect(async () => {
      await dropOutCandidacy({
        candidacyId: droppedoutCandidacy.id,
        dropOutReasonId: dropoutReason!.id,
      });
    }).rejects.toThrow(FunctionalCodeError.CANDIDACY_ALREADY_DROPPED_OUT);
  });
  test("should fail with CANDIDACY_INVALID_DROP_OUT_REASON error code", async () => {
    await expect(async () => {
      await dropOutCandidacy({
        candidacyId: normalCandidacy.id,
        dropOutReasonId: "wr0ng1d",
      });
    }).rejects.toThrow(FunctionalCodeError.CANDIDACY_INVALID_DROP_OUT_REASON);
  });

  test("should return candidacy with drop out reason", async () => {
    const candidacy = await dropOutCandidacy({
      candidacyId: normalCandidacy.id,
      dropOutReasonId: dropoutReason!.id,
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
    expect(candidacyDropOut?.dropOutReason.id).toEqual(dropoutReason!.id);
  });
});
