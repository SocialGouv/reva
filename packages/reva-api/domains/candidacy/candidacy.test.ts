import { Left, Right } from "purify-ts";
import { FunctionalCodeError, FunctionalError } from "../FunctionalError";
import { CandidacyInput, createCandidacy } from "./index";

describe("domain candidacy", () => {
  test("given an unknown companion, when createCandidacy is call, then an error COMPANION_NOT_FOUND should occured", async () => {
    const createCandidacyWithDeps = createCandidacy({
      existsCompanion: () => Promise.resolve(Left('Error')),
      getCandidacyFromDeviceId: (id: string) => Promise.resolve(Left('Not found')),
      createCandidacy: () => Promise.resolve(Right(
        {
          id: '123',
          deviceId: '12',
          companionId: '456',
          experiences: [],
          goals: [],
        }))
    });


    const result = await createCandidacyWithDeps({
      candidacy: {
        deviceId: '12',
        companionId: '456',
        experiences: [],
        goals: [],
      }
    });

    expect(result.extract()).toBeInstanceOf(FunctionalError);
    expect(result.extract()).toEqual(
      expect.objectContaining({
        code: FunctionalCodeError.COMPANION_NOT_FOUND
      }));
  });

  test("given an device with an existing candidacy, when createCandidacy is call, then an error CANDIDACY_ALREADY_EXISTS should occured", async () => {
    const createCandidacyWithDeps = createCandidacy({
      existsCompanion: () => Promise.resolve(Right({
        id: 'companion_123'
      })),
      getCandidacyFromDeviceId: (id: string) => Promise.resolve(Right(
        {
          id: '123',
          deviceId: '12',
          companionId: '456',
          experiences: [],
          goals: [],
        })),
      createCandidacy: () => Promise.resolve(Right(
        {
          id: '123',
          deviceId: '12',
          companionId: '456',
          experiences: [],
          goals: [],
        }))
    });


    const result = await createCandidacyWithDeps({
      candidacy: {
        deviceId: '12',
        companionId: '456',
        experiences: [],
        goals: [],
      }
    });

    expect(result.extract()).toBeInstanceOf(FunctionalError);
    expect(result.extract()).toEqual(
      expect.objectContaining({
        code: FunctionalCodeError.CANDIDACY_ALREADY_EXISTS
      }));
  });

  test("given an device without any candidacy, when createCandidacy is call and an error occurs, then an error CANDIDACY_NOT_CREATED should occured", async () => {
    const createCandidacyWithDeps = createCandidacy({
      existsCompanion: () => Promise.resolve(Right({
        id: 'companion_123'
      })),
      getCandidacyFromDeviceId: (id: string) => Promise.resolve(Left('Not found')),
      createCandidacy: () => Promise.resolve(Left('Error while saving'))
    });


    const result = await createCandidacyWithDeps({
      candidacy: {
        deviceId: '12',
        companionId: '456',
        experiences: [],
        goals: [],
      }
    });

    expect(result.extract()).toBeInstanceOf(FunctionalError);
    expect(result.extract()).toEqual(
      expect.objectContaining({
        code: FunctionalCodeError.CANDIDACY_NOT_CREATED
      }));
  });

  test("given an device without any candidacy, when createCandidacy is call, then ", async () => {
    const createCandidacyWithDeps = createCandidacy({
      existsCompanion: () => Promise.resolve(Right({
        id: 'companion_123'
      })),
      getCandidacyFromDeviceId: (id: string) => Promise.resolve(Left('Not found')),
      createCandidacy: (params: {candidacy: CandidacyInput}) => Promise.resolve(Right(
        {
          ...params.candidacy,
          id: '123',
        }))
    });


    const result = await createCandidacyWithDeps({
      candidacy: {
        deviceId: '12',
        companionId: '456',
        experiences: [],
        goals: [],
      }
    });

    expect(result.extract()).not.toBeInstanceOf(FunctionalError);
    expect(result.extract()).toEqual(
      expect.objectContaining({
          id: '123',
          deviceId: '12',
          companionId: '456',
          experiences: [],
          goals: [],
        }));
  });
});
