import { Either, EitherAsync } from "purify-ts";

import { Candidacy } from "../../../../domain/types/candidacy";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";

interface GetDeviceCandidacyDeps {
  getCandidacyFromDeviceId: (
    deviceId: string
  ) => Promise<Either<string, Candidacy>>;
}

export const getDeviceCandidacy =
  (deps: GetDeviceCandidacyDeps) =>
  (params: { deviceId: string }): Promise<Either<FunctionalError, Candidacy>> =>
    EitherAsync.fromPromise(() =>
      deps.getCandidacyFromDeviceId(params.deviceId)
    )
      .mapLeft(
        () =>
          new FunctionalError(
            FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
            `Aucune candidature n'a été trouvée`
          )
      )
      .run();
