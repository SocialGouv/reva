import { Left, Right } from "purify-ts";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";
// import { CandidacyInput, createCandidacy } from "./index";
import { createCandidacy } from "./createCandidacy"

describe("domain candidacy", () => {
  test("given an device with an existing candidacy, when createCandidacy is call, then an error CANDIDACY_ALREADY_EXISTS should occured", async () => {
    const createCandidacyWithDeps = createCandidacy({
      getCandidacyFromDeviceId: (id: string) => Promise.resolve(Right(
        {
          id: '123',
          deviceId: '12',
          regionId: '456',
          certification: {},
          experiences: [],
          goals: [],
          phone: '0600000000',
          email: 'john.doe@reva.beta.gouv.fr',
          createdAt: new Date(),
          certificationId: '1234',
          candidacyStatuses: [],
          region: {
            id: "",
            code: "",
            label: ""
          }
        })),
      createCandidacy: () => Promise.resolve(Right(
        {
          id: '123',
          deviceId: '12',
          regionId: '456',
          certification: {},
          experiences: [],
          goals: [],
          phone: '0600000000',
          email: 'john.doe@reva.beta.gouv.fr',
          createdAt: new Date(),
          certificationId: '1234',
          candidacyStatuses: [],
          region: {
            id: "",
            code: "",
            label: ""
          }
        }))
    });


    const result = await createCandidacyWithDeps({
      deviceId: '12',
      certificationId: '1234',
      regionId: '56'
    });

    expect(result.extract()).toBeInstanceOf(FunctionalError);
    expect(result.extract()).toEqual(
      expect.objectContaining({
        code: FunctionalCodeError.CANDIDACY_ALREADY_EXISTS
      }));
  });

  test("given an device without any candidacy, when createCandidacy is call and an error occurs, then an error CANDIDACY_NOT_CREATED should occured", async () => {
    const createCandidacyWithDeps = createCandidacy({
      getCandidacyFromDeviceId: (id: string) => Promise.resolve(Left('Not found')),
      createCandidacy: () => Promise.resolve(Left('Error while saving'))
    });


    const result = await createCandidacyWithDeps({
      deviceId: '12',
      certificationId: '1234',
      regionId: '56'
    });

    expect(result.extract()).toBeInstanceOf(FunctionalError);
    expect(result.extract()).toEqual(
      expect.objectContaining({
        code: FunctionalCodeError.CANDIDACY_NOT_CREATED
      }));
  });

  test("given an device without any candidacy, when createCandidacy is call, then ", async () => {
    const createCandidacyWithDeps = createCandidacy({
      getCandidacyFromDeviceId: (id: string) => Promise.resolve(Left('Not found')),
      createCandidacy: (params: { deviceId: string; certificationId: string }) => Promise.resolve(Right(
        {
          ...params,
          id: '123',
          regionId: '456',
          certification: {},
          experiences: [],
          goals: [],
          phone: '0600000000',
          email: 'john.doe@reva.beta.gouv.fr',
          candidacyStatuses: [],
          createdAt: new Date(),
          region: {
            id: "",
            code: "",
            label: ""
          }
        }))
    });


    const result = await createCandidacyWithDeps({
      deviceId: '12',
      certificationId: '1234',
      regionId: '56'
    });

    expect(result.extract()).not.toBeInstanceOf(FunctionalError);
    expect(result.extract()).toEqual(
      expect.objectContaining({
        id: '123',
        deviceId: '12',
        regionId: '456',
        certification: {},
        experiences: [],
        goals: [],
        candidacyStatuses: []
      }));
  });
});
