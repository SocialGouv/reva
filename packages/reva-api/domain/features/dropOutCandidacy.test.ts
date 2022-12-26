import { DropOutReason } from "@prisma/client";
import { Either, EitherAsync, Maybe, Right } from "purify-ts";

import { Candidacy } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";
import { dropOutCandidacy } from "./dropOutCandidacy";

const withTemporalInfo = (obj: any) => ({
  ...obj,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const dropOutReasonTable: DropOutReason[] = [
  withTemporalInfo({ id: "RaisonAbandonId1", label: "Raison d'abandon 1" }),
  withTemporalInfo({ id: "RaisonAbandonId2", label: "Raison d'abandon 2" }),
  withTemporalInfo({ id: "RaisonAbandonId3", label: "Raison d'abandon 3" }),
];

const blankCandidacy: Candidacy = {
  id: "",
  candidacyStatuses: [],
  createdAt: new Date(),
  department: null,
  deviceId: "",
  dropOutReason: null,
  email: null,
  experiences: [],
  goals: [],
  phone: null,
};

const candidacy1: Candidacy = {
  ...blankCandidacy,
  id: "abc123",
  candidacyStatuses: [{ createdAt: new Date(), id: "123", status: "COOL" }],
  createdAt: new Date(),
};

const candidacy2: Candidacy = {
  ...blankCandidacy,
  id: "def345",
  candidacyStatuses: [{ createdAt: new Date(), id: "124", status: "ABANDON" }],
  createdAt: new Date(),
};

const candidacyTable: Candidacy[] = [candidacy1, candidacy2];

const getCandidacyById = (id: string): Either<string, Candidacy> =>
  Maybe.fromNullable(candidacyTable.find((c) => c.id === id)).toEither(
    "not found"
  );
const getDropOutReasonById = (id: string): Maybe<DropOutReason> =>
  Maybe.fromNullable(dropOutReasonTable.find((r) => r.id === id));

const dropOutReasonWithRightRole = dropOutCandidacy({
  getCandidacyFromId: (id) => Promise.resolve(getCandidacyById(id)),
  getDropOutReasonById: ({ dropOutReasonId }) =>
    Promise.resolve(Right(getDropOutReasonById(dropOutReasonId))),
  hasRole: () => true,
  dropOutCandidacy: () => Promise.resolve(Right(candidacy1)),
});

describe("drop out candidacy", () => {
  test("should fail with CANDIDACY_NOT_FOUND", async () => {
    const result = await dropOutReasonWithRightRole({
      candidacyId: "wr0ng1d",
      dropOutDate: new Date(),
      dropOutReasonId: dropOutReasonTable[0].id,
    });
    expect(result.isLeft()).toEqual(true);
    expect((result.extract() as FunctionalError).code).toEqual(
      FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST
    );
  });
  test("should fail with CANDIDACY_ALREADY_DROPPED_OUT", async () => {
    const result = await dropOutReasonWithRightRole({
      candidacyId: candidacy2.id,
      dropOutDate: new Date(),
      dropOutReasonId: dropOutReasonTable[0].id,
    });
    expect(result.isLeft()).toEqual(true);
    expect((result.extract() as FunctionalError).code).toEqual(
      FunctionalCodeError.CANDIDACY_ALREADY_DROPPED_OUT
    );
  });
  test("should fail with CANDIDACY_INVALID_DROP_OUT_REASON error code", async () => {
    const result = await dropOutReasonWithRightRole({
      candidacyId: candidacy1.id,
      dropOutDate: new Date(),
      dropOutReasonId: "wr0ng1d",
    });
    expect(result.isLeft()).toEqual(true);
    expect((result.extract() as FunctionalError).code).toEqual(
      FunctionalCodeError.CANDIDACY_INVALID_DROP_OUT_REASON
    );
  });

  test.skip("should return updated status", async () => {
    const result = await dropOutReasonWithRightRole({
      candidacyId: candidacy1.id,
      dropOutDate: new Date(),
      dropOutReasonId: dropOutReasonTable[0].id,
    });
    expect(result.isRight()).toBe(true);
    const candidacy = result.extract() as Candidacy;
    expect(candidacy.candidacyStatuses.length).toEqual(1);
    expect(candidacy.candidacyStatuses[0].status).toBe("ABANDON");
  });

  test.skip("should return candidacy with drop out reason", async () => {
    const result = await dropOutReasonWithRightRole({
      candidacyId: candidacy1.id,
      dropOutDate: new Date(),
      dropOutReasonId: dropOutReasonTable[1].id,
    });
    expect(result.isRight()).toBe(true);
    const candidacy = result.extract() as Candidacy;
    expect(candidacy.dropOutReason).not.toBeNull();
    expect(candidacy.dropOutReason?.dropOutReason.id).toEqual(
      dropOutReasonTable[1].id
    );
  });
});
