import { sub } from "date-fns";
import { Either, Maybe, Right } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";
import { Candidacy } from "../candidacy.types";
import { unarchiveCandidacy } from "./unarchiveCandidacy";

const recentDate = new Date();
const oldDate = sub(recentDate, { days: 10 });

const addCreatedDateAndId = (s: any) => ({
  createdAt: oldDate,
  id: "123",
  ...s,
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
    createdAt: recentDate,
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

const candidacyArchived: Candidacy = {
  ...candidacyPriseEnCharge,
  id: "c3",
  candidacyStatuses: candidacyStatusesArchive,
};

const candidacyReoriented: Candidacy = {
  ...candidacyArchived,
  id: "c4",
  reorientationReason: {
    id: "r1",
    label: "well",
    createdAt: new Date(),
    updatedAt: null,
    disabled: false,
  },
};

const candidacyTable: Candidacy[] = [
  candidacyPriseEnCharge,
  candidacyArchived,
  candidacyReoriented,
];

const unarchivedCandidacyStatuses = [
  ...candidacyStatusesArchive.map((status) => ({
    ...status,
    isActive: false,
  })),
  {
    id: "123",
    status: "PRISE_EN_CHARGE",
    isActive: true,
    createdAt: recentDate,
  },
];

const getCandidacyById = (id: string): Either<string, Candidacy> =>
  Maybe.fromNullable(candidacyTable.find((c) => c.id === id)).toEither(
    "not found"
  );

const unarchiveWithRightRole = unarchiveCandidacy({
  getCandidacyFromId: (id) => Promise.resolve(getCandidacyById(id)),
  hasRole: () => true,
  unarchiveCandidacy: ({ candidacyId }) => {
    const candidacy = getCandidacyById(candidacyId).extract() as Candidacy;
    return Promise.resolve(
      Right({
        ...candidacy,
        candidacyStatuses: unarchivedCandidacyStatuses,
      })
    );
  },
});

describe("unarchive candidacy", () => {
  test("should fail with CANDIDACY_NOT_FOUND", async () => {
    const result = await unarchiveWithRightRole({
      candidacyId: "badId",
    });
    expect(result.isLeft()).toEqual(true);
    expect((result.extract() as FunctionalError).code).toEqual(
      FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST
    );
  });
  test("should fail with CANDIDACY_NOT_ARCHIVED", async () => {
    const result = await unarchiveWithRightRole({
      candidacyId: candidacyPriseEnCharge.id,
    });
    expect(result.isLeft()).toEqual(true);
    expect((result.extract() as FunctionalError).code).toEqual(
      FunctionalCodeError.CANDIDACIES_NOT_ARCHIVED
    );
  });

  test("should fail with CANDIDACY_IS_REORIENTATION", async () => {
    const result = await unarchiveWithRightRole({
      candidacyId: candidacyReoriented.id,
    });
    expect(result.isLeft()).toEqual(true);
    expect((result.extract() as FunctionalError).code).toEqual(
      FunctionalCodeError.CANDIDACY_IS_REORIENTATION
    );
  });

  test("should return an unarchived candidacy", async () => {
    const result = await unarchiveWithRightRole({
      candidacyId: candidacyArchived.id,
    });
    expect(result.isRight()).toBe(true);
    const candidacy = result.extract() as Candidacy;
    expect(candidacy.candidacyStatuses).toEqual(unarchivedCandidacyStatuses);
  });
});
