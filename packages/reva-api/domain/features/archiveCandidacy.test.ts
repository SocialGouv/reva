import { ReorientationReason } from "@prisma/client";
import { Either, Maybe, Right } from "purify-ts";

import { Candidacy } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";
import { archiveCandidacy } from "./archiveCandidacy";

const withTemporalInfo = (obj: any) => ({
  ...obj,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const reorientationReasonTable: ReorientationReason[] = [
  withTemporalInfo({ id: "RaisonReorientationId1", label: "Droit commun" }),
  withTemporalInfo({
    id: "RaisonReorientationId2",
    label: "Architecte de parcours neutre",
  }),
  withTemporalInfo({
    id: "RaisonReorientationId3",
    label: "Une autre certification de France VAE",
  }),
];

const addCreatedDateAndId = (s: any) => ({
  ...s,
  createdAt: new Date(),
  id: "123",
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
].map(addCreatedDateAndId);

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
].map(addCreatedDateAndId);

const candidacyPriseEnCharge: Candidacy = {
  id: "c1",
  candidacyStatuses: candidacyStatusesPriseEnCharge,
  createdAt: new Date(),
  department: null,
  deviceId: "",
  email: null,
  experiences: [],
  goals: [],
  phone: null,
  reorientationReason: null,
};

const candidacyWithReorientationReason: Candidacy = {
  ...candidacyPriseEnCharge,
  id: "c2",
  reorientationReason: {
    id: "RaisonReorientationId1",
    label: "Droit commun",
    createdAt: new Date(),
    updatedAt: null,
    disabled: false,
  },
};

const candidacyArchived: Candidacy = {
  ...candidacyPriseEnCharge,
  id: "c3",
  candidacyStatuses: candidacyStatusesArchive,
};

const candidacyTable: Candidacy[] = [
  candidacyPriseEnCharge,
  candidacyArchived,
  candidacyWithReorientationReason,
];

const getCandidacyById = (id: string): Either<string, Candidacy> =>
  Maybe.fromNullable(candidacyTable.find((c) => c.id === id)).toEither(
    "not found"
  );
const getReorientationReasonById = (
  id: string | null
): Maybe<ReorientationReason> =>
  Maybe.fromNullable(reorientationReasonTable.find((r) => r.id === id));

const archiveWithRightRole = archiveCandidacy({
  getCandidacyFromId: (id) => Promise.resolve(getCandidacyById(id)),
  getReorientationReasonById: ({ reorientationReasonId }) =>
    Promise.resolve(Right(getReorientationReasonById(reorientationReasonId))),
  hasRole: () => true,
  archiveCandidacy: (params) =>
    Promise.resolve(
      Right({
        ...(getCandidacyById(params.candidacyId).extract() as Candidacy),
        candidacyStatuses: candidacyStatusesArchive,
        reorientationReason: getReorientationReasonById(
          params.reorientationReasonId
        ).extractNullable(),
      })
    ),
});

describe("archive candidacy", () => {
  test("should fail with CANDIDACY_NOT_FOUND", async () => {
    const result = await archiveWithRightRole({
      candidacyId: "badId",
      reorientationReasonId: null,
    });
    expect(result.isLeft()).toEqual(true);
    expect((result.extract() as FunctionalError).code).toEqual(
      FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST
    );
  });
  test("should fail with CANDIDACY_ALREADY_ARCHIVE", async () => {
    const result = await archiveWithRightRole({
      candidacyId: candidacyArchived.id,
      reorientationReasonId: null,
    });
    expect(result.isLeft()).toEqual(true);
    expect((result.extract() as FunctionalError).code).toEqual(
      FunctionalCodeError.CANDIDACY_ALREADY_ARCHIVED
    );
  });
  test("should fail with CANDIDACY_INVALID_REORIENTATION_REASON error code", async () => {
    const result = await archiveWithRightRole({
      candidacyId: candidacyPriseEnCharge.id,
      reorientationReasonId: "wr0ng1d",
    });
    expect(result.isLeft()).toEqual(true);
    expect((result.extract() as FunctionalError).code).toEqual(
      FunctionalCodeError.CANDIDACY_INVALID_REORIENTATION_REASON
    );
  });

  test("should return an archived candidacy with reorientation reason", async () => {
    const result = await archiveWithRightRole({
      candidacyId: candidacyPriseEnCharge.id,
      reorientationReasonId: reorientationReasonTable[1].id,
    });
    expect(result.isRight()).toBe(true);
    const candidacy = result.extract() as Candidacy;
    expect(candidacy.reorientationReason).not.toBeNull();
    expect(candidacy.reorientationReason?.id).toEqual(
      reorientationReasonTable[1].id
    );
    expect(candidacy.candidacyStatuses).toEqual(candidacyStatusesArchive);
  });

  test("should return an archived candidacy without reorientation reason", async () => {
    const result = await archiveWithRightRole({
      candidacyId: candidacyPriseEnCharge.id,
      reorientationReasonId: null,
    });
    expect(result.isRight()).toBe(true);
    const candidacy = result.extract() as Candidacy;
    expect(candidacy.reorientationReason).toBeNull();
    expect(candidacy.candidacyStatuses).toEqual(candidacyStatusesArchive);
  });
});
