import {
  Candidacy,
  Candidate,
  Organism,
  OrganismTypology,
  ReorientationReason,
} from "@prisma/client";
import { prismaClient } from "../../../prisma/client";

import { createCandidateHelper } from "../../../test/helpers/entities/create-candidate-helper";
import { createOrganismHelper } from "../../../test/helpers/entities/create-organism-helper";
import { FunctionalCodeError } from "../../shared/error/functionalError";
import { archiveCandidacy } from "./archiveCandidacy";
import { getCandidacyStatusesByCandidacyId } from "./getCandidacyStatusesByCandidacyId";

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
        create: candidacyStatusesPriseEnCharge,
      },
    },
  });

  candidacyWithReorientationReason = await prismaClient.candidacy.create({
    data: {
      status: "PRISE_EN_CHARGE",
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
      status: "ARCHIVE",
      candidateId: candidate.id,
      organismId: organism.id,
      candidacyStatuses: {
        create: candidacyStatusesArchive,
      },
    },
  });
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
    const candidacyStatuses = await getCandidacyStatusesByCandidacyId({
      candidacyId: candidacy.id,
    });
    expect(candidacy.reorientationReasonId).not.toBeNull();
    expect(candidacy.reorientationReasonId).toEqual(reorientationReason.id);
    expect(candidacyStatuses).toMatchObject(candidacyStatusesArchive);
  });

  test("should return an archived candidacy without reorientation reason", async () => {
    const result = await archiveCandidacy({
      candidacyId: candidacyPriseEnCharge.id,
      reorientationReasonId: null,
    });
    const candidacy = result;
    const candidacyStatuses = await getCandidacyStatusesByCandidacyId({
      candidacyId: candidacy.id,
    });
    expect(candidacy.reorientationReasonId).toBeNull();
    expect(candidacyStatuses).toMatchObject(candidacyStatusesArchive);
  });
});
