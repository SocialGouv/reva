import {
  Candidacy,
  Candidate,
  Organism,
  OrganismTypology,
  ReorientationReason,
} from "@prisma/client";
import { sub } from "date-fns";
import { prismaClient } from "../../../prisma/client";
import { createCandidateHelper } from "../../../test/helpers/entities/create-candidate-helper";
import { createOrganismHelper } from "../../../test/helpers/entities/create-organism-helper";
import { FunctionalCodeError } from "../../shared/error/functionalError";
import { getCandidacyStatusesByCandidacyId } from "./getCandidacyStatusesByCandidacyId";
import { unarchiveCandidacy } from "./unarchiveCandidacy";

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
  reorientationReason: ReorientationReason;

beforeAll(async () => {
  reorientationReason = (await prismaClient.reorientationReason.findUnique({
    where: {
      label: reorientationReasonTable[1].label,
    },
  })) as ReorientationReason;

  organism = await createOrganismHelper({
    typology: OrganismTypology.experimentation,
  });
  candidate = await createCandidateHelper();

  candidacyPriseEnCharge = await prismaClient.candidacy.create({
    data: {
      status: "PRISE_EN_CHARGE",
      candidateId: candidate.id,
      organismId: organism.id,
      candidacyStatuses: {
        create: unarchivedCandidacyStatuses,
      },
    },
  });

  candidacyWithReorientationReason = await prismaClient.candidacy.create({
    data: {
      status: "ARCHIVE",
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
      status: "ARCHIVE",
      candidateId: candidate.id,
      organismId: organism.id,
      candidacyStatuses: {
        create: candidacyStatusesArchive,
      },
    },
  });
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
    const candidacyStatuses = await getCandidacyStatusesByCandidacyId({
      candidacyId: candidacy.id,
    });
    expect(candidacyStatuses).toMatchObject(unarchivedCandidacyStatuses);
  });
});
