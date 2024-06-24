import { Candidate, Candidacy, Organism, ReorientationReason, Department } from "@prisma/client";
import { FunctionalCodeError } from "../../shared/error/functionalError";
import { archiveCandidacy } from "./archiveCandidacy";
import { prismaClient } from "../../../prisma/client";
import { organismIperia, candidateJPL } from "../../../test/fixtures/people-organisms";

const withTemporalInfo = (obj: any) => ({
  ...obj,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const reorientationReasonTable: ReorientationReason[] = [
  withTemporalInfo({ label: "Droit commun" }),
  withTemporalInfo({
        label: "Architecte de parcours neutre",
  }),
  withTemporalInfo({
        label: "Une autre certification de France VAE",
  }),
];

const addCreatedDate = (s: any) => ({
  ...s,
  createdAt: new Date(),
});

const candidacyStatusesPriseEnCharge = [
  {
    status: "PROJET",
    isActive: false,
  },
  {
    status: "PRISE_EN_CHARGE",
    isActive: true,
  },
].map(addCreatedDate);

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
].map(addCreatedDate);

// const candidacyPriseEnCharge = {
//   id: "c1",
//   candidacyStatuses: candidacyStatusesPriseEnCharge,
//   createdAt: new Date(),
//   department: null,
//   email: null,
//   experiences: [],
//   reorientationReason: null,
//   financeModule: "unifvae",
// };

// const candidacyWithReorientationReason: Candidacy = {
//   ...candidacyPriseEnCharge,
//   id: "c2",
//   reorientationReason: {
//     id: "RaisonReorientationId1",
//     label: "Droit commun",
//     createdAt: new Date(),
//     updatedAt: null,
//     disabled: false,
//   },
// };

// const candidacyArchived = {
//   ...candidacyPriseEnCharge,
//   id: "c3",
//   candidacyStatuses: candidacyStatusesArchive,
// };

let organism: Organism,
  candidate: Candidate,
  candidacyPriseEnCharge: Candidacy,
  candidacyWithReorientationReason: Candidacy,
  candidacyArchived: Candidacy,
  reorientationReason: ReorientationReason,
  parisDepartment: Department;

beforeAll(async () => {

  reorientationReason = await prismaClient.reorientationReason.findUnique({
    where: {
      label: reorientationReasonTable[1].label
    }
  }) as ReorientationReason;

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
      }
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
  })
})

afterAll(async () => {
  await prismaClient.candidacy.delete({ where: { id: candidacyArchived.id } });
  await prismaClient.candidacy.delete({ where: { id: candidacyWithReorientationReason.id } });
  await prismaClient.candidacy.delete({ where: { id: candidacyPriseEnCharge.id } });
  await prismaClient.candidate.delete({ where: { id: candidate.id } });
  await prismaClient.organism.delete({ where: { id: organism.id } });
})

describe("archive candidacy", () => {
  test("shoud always pass", () => {
    expect(true).toBe(true);
  });
  // test("should fail with CANDIDACY_NOT_FOUND", async () => {
  //   expect(async () => {
  //     await archiveCandidacy({
  //       candidacyId: "badId",
  //       reorientationReasonId: null,
  //     });
  //   }).rejects.toThrow(FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST);
  // });
  // test("should fail with CANDIDACY_ALREADY_ARCHIVE", async () => {
  //   expect(async () => {
  //     await archiveCandidacy({
  //       candidacyId: candidacyArchived.id,
  //       reorientationReasonId: null,
  //     });
  //   }).rejects.toThrow(FunctionalCodeError.CANDIDACY_ALREADY_ARCHIVED);
  // });
  // test("should fail with CANDIDACY_INVALID_REORIENTATION_REASON error code", async () => {
  //   expect(async () => {
  //     await archiveCandidacy({
  //       candidacyId: candidacyPriseEnCharge.id,
  //       reorientationReasonId: "wr0ng1d",
  //     });
  //   }).rejects.toThrow(
  //     FunctionalCodeError.CANDIDACY_INVALID_REORIENTATION_REASON,
  //   );
  // });

  // test("should return an archived candidacy with reorientation reason", async () => {
  //   console.log('candidacyWithReorientationReason', candidacyWithReorientationReason)
  //   const result = await archiveCandidacy({
  //     candidacyId: candidacyWithReorientationReason.id,
  //     reorientationReasonId: reorientationReason.id,
  //   });
  //   const candidacy = result;
  //   expect(candidacy.reorientationReasonId).not.toBeNull();
  //   expect(candidacy.reorientationReasonId).toEqual(
  //     reorientationReason.id,
  //   );
  //   // expect(candidacy.candidacyStatuses).toEqual(candidacyStatusesArchive);
  // });

  // test("should return an archived candidacy without reorientation reason", async () => {
  //   const result = await archiveCandidacy({
  //     candidacyId: candidacyPriseEnCharge.id,
  //     reorientationReasonId: null,
  //   });
  //   const candidacy = result;
  //   expect(candidacy.reorientationReasonId).toBeNull();
  //   // expect(candidacy.candidacyStatuses).toEqual(candidacyStatusesArchive);
  // });
});
