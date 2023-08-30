import { Either, EitherAsync } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";
import { Candidacy } from "../candidacy.types";

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
