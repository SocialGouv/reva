import {
  Candidate,
  Candidacy,
  Organism,
  ReorientationReason,
  Department,
} from "@prisma/client";
import { FunctionalCodeError } from "../../shared/error/functionalError";
import { archiveCandidacy } from "./archiveCandidacy";
import { prismaClient } from "../../../prisma/client";
import {
  organismIperia,
  candidateJPL,
} from "../../../test/fixtures/people-organisms";

const reorientationReasonTable = [
  { label: "Droit commun" },
  {
    label: "Architecte de parcours neutre",
  },
  {
    label: "Une autre certification de France VAE",
  },
];

const candidacyStatusesPriseEnCharge = [
  {
    status: "PROJET",
    isActive: false,
  },
  {
    status: "PRISE_EN_CHARGE",
    isActive: true,
  },
];

const candidacyStatusesArchive = [
  {
    status: "PROJET",
    isActive: false,
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
      email: candidate.email,
      candidateId: candidate.id,
      organismId: organism.id,
      candidacyStatuses: {
        create: candidacyStatusesPriseEnCharge,
      },
    },
  });

  candidacyWithReorientationReason = await prismaClient.candidacy.create({
    data: {
      email: candidate.email,
      candidateId: candidate.id,
      organismId: organism.id,
      candidacyStatuses: {
        create: candidacyStatusesPriseEnCharge,
      },
      reorientationReasonId: reorientationReason?.id,
    },
  });

  candidacyArchived = await prismaClient.candidacy.create({
    data: {
      email: candidate.email,
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
    await expect(async () => {
      await archiveCandidacy({
        candidacyId: candidacyArchived.id,
        reorientationReasonId: null,
      });
    }).rejects.toThrow(FunctionalCodeError.CANDIDACY_ALREADY_ARCHIVED);
  });
  test("should fail with CANDIDACY_INVALID_REORIENTATION_REASON error code", async () => {
    await expect(async () => {
      await archiveCandidacy({
        candidacyId: candidacyPriseEnCharge.id,
        reorientationReasonId: "wr0ng1d",
      });
    }).rejects.toThrow(
      FunctionalCodeError.CANDIDACY_INVALID_REORIENTATION_REASON,
    );
  });

  test("should return an archived candidacy with reorientation reason", async () => {
    const result = await archiveCandidacy({
      candidacyId: candidacyWithReorientationReason.id,
      reorientationReasonId: reorientationReason.id,
    });
    const candidacy = result;
    expect(candidacy.reorientationReasonId).not.toBeNull();
    expect(candidacy.reorientationReasonId).toEqual(reorientationReason.id);
    expect(candidacy.candidacyStatuses).toMatchObject(candidacyStatusesArchive);
  });

  test("should return an archived candidacy without reorientation reason", async () => {
    const result = await archiveCandidacy({
      candidacyId: candidacyPriseEnCharge.id,
      reorientationReasonId: null,
    });
    const candidacy = result;
    expect(candidacy.reorientationReasonId).toBeNull();
    expect(candidacy.candidacyStatuses).toMatchObject(candidacyStatusesArchive);
  });
});
