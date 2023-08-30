import { Either, EitherAsync } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";
import { Candidacy } from "../candidacy.types";

interface CreateCandidacyDeps {
  createCandidacy: (params: {
    deviceId: string;
    certificationId: string;
    regionId: string;
    departmentId: string;
  }) => Promise<Either<string, Candidacy>>;
  getCandidacyFromDeviceId: (
    deviceId: string
  ) => Promise<Either<string, Candidacy>>;
  notifyTeam: (candidacyId: string) => Promise<void>;
}

export const createCandidacy =
  (deps: CreateCandidacyDeps) =>
  async (params: {
    deviceId: string;
    certificationId: string;
    regionId: string;
    departmentId: string;
  }): Promise<Either<FunctionalError, Candidacy>> => {
    const checkIfCandidacyAlreadyExists = EitherAsync.fromPromise(() =>
      deps.getCandidacyFromDeviceId(params.deviceId)
    )
      .swap()
      .mapLeft(
        () =>
          new FunctionalError(
            FunctionalCodeError.CANDIDACY_ALREADY_EXISTS,
            `Une candidature existe déjà pour cet appareil`
          )
      );

    const createCandidacy = EitherAsync.fromPromise(() =>
      deps.createCandidacy(params)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.CANDIDACY_NOT_CREATED,
          `Erreur lors de la creation de la candidature`
        )
    );

    return checkIfCandidacyAlreadyExists
      .chain(() => createCandidacy)
      .ifRight(async (candidacy: any) => deps.notifyTeam(candidacy.id));
  };
