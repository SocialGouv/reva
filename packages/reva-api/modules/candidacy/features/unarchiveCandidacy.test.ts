import {
  Candidate,
  Candidacy,
  Organism,
  ReorientationReason,
  Department,
} from "@prisma/client";
import { FunctionalCodeError } from "../../shared/error/functionalError";
import { unarchiveCandidacy } from "./unarchiveCandidacy";
import { prismaClient } from "../../../prisma/client";
import {
  organismIperia,
  candidateJPL,
} from "../../../test/fixtures/people-organisms";
import { sub } from "date-fns";

const reorientationReasonTable = [
  { label: "Droit commun" },
  {
    label: "Architecte de parcours neutre",
  },
  {
    label: "Une autre certification de France VAE",
  },
];

const recentDate = new Date();
const oldDate = sub(recentDate, { days: 10 });

const candidacyStatusesArchive = [
  {
    status: "PROJET",
    isActive: false,
    createdAt: oldDate,
  },
  {
    status: "PRISE_EN_CHARGE",
    isActive: false,
  },
  {
    status: "ARCHIVE",
    isActive: true,
  },
];

const unarchivedCandidacyStatuses = [
  ...candidacyStatusesArchive.map((status) => ({
    ...status,
    isActive: false,
  })),
  {
    status: "PRISE_EN_CHARGE",
    isActive: true,
  },
];

let organism: Organism,
  candidate: Candidate,
  candidacyPriseEnCharge: Candidacy,
  candidacyWithReorientationReason: Candidacy,
  candidacyArchived: Candidacy,
  reorientationReason: ReorientationReason,
  parisDepartment: Department;

beforeAll(async () => {
  reorientationReason = (await prismaClient.reorientationReason.findUnique({
    where: {
      label: reorientationReasonTable[1].label,
    },
  })) as ReorientationReason;

  parisDepartment = (await prismaClient.department.findFirst({
    where: { code: "75" },
  })) as Department;
  organism = await prismaClient.organism.create({ data: organismIperia });

  candidate = await prismaClient.candidate.create({
    data: { ...candidateJPL, departmentId: parisDepartment?.id || "" },
  });

  candidacyPriseEnCharge = await prismaClient.candidacy.create({
    data: {
      candidateId: candidate.id,
      organismId: organism.id,
      candidacyStatuses: {
        create: unarchivedCandidacyStatuses,
      },
    },
  });

  candidacyWithReorientationReason = await prismaClient.candidacy.create({
    data: {
      candidateId: candidate.id,
      organismId: organism.id,
      candidacyStatuses: {
        create: candidacyStatusesArchive,
      },
      reorientationReasonId: reorientationReason?.id,
    },
  });

  candidacyArchived = await prismaClient.candidacy.create({
    data: {
      candidateId: candidate.id,
      organismId: organism.id,
      candidacyStatuses: {
        create: candidacyStatusesArchive,
      },
    },
  });
});

afterAll(async () => {
  await prismaClient.candidacy.delete({ where: { id: candidacyArchived.id } });
  await prismaClient.candidacy.delete({
    where: { id: candidacyWithReorientationReason.id },
  });
  await prismaClient.candidacy.delete({
    where: { id: candidacyPriseEnCharge.id },
  });
  await prismaClient.candidate.delete({ where: { id: candidate.id } });
  await prismaClient.organism.delete({ where: { id: organism.id } });
});

describe("unarchive candidacy", () => {
  test("should fail with CANDIDACY_NOT_FOUND", async () => {
    await expect(async () => {
      await unarchiveCandidacy({
        candidacyId: "badId",
      });
    }).rejects.toThrow(FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST);
  });
  test("should fail with CANDIDACY_NOT_ARCHIVED", async () => {
    await expect(async () => {
      await unarchiveCandidacy({
        candidacyId: candidacyPriseEnCharge.id,
      });
    }).rejects.toThrow(FunctionalCodeError.CANDIDACIES_NOT_ARCHIVED);
  });

  test("should fail with CANDIDACY_IS_REORIENTATION", async () => {
    await expect(async () => {
      await unarchiveCandidacy({
        candidacyId: candidacyWithReorientationReason.id,
      });
    }).rejects.toThrow(FunctionalCodeError.CANDIDACY_IS_REORIENTATION);
  });

  test("should return an unarchived candidacy", async () => {
    const candidacy = await unarchiveCandidacy({
      candidacyId: candidacyArchived.id,
    });
    expect(candidacy.candidacyStatuses).toMatchObject(
      unarchivedCandidacyStatuses,
    );
  });
});
