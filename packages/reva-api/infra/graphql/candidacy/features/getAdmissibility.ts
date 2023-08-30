import { Either, EitherAsync, Left, Maybe } from "purify-ts";

import { Admissibility } from "../../../../domain/types/candidacy";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";
import { Role } from "../../account/account.types";

interface GetAdmissibilityDeps {
  hasRole: (role: Role) => boolean;
  getAdmissibilityFromCandidacyId: (params: {
    candidacyId: string;
  }) => Promise<Either<string, Maybe<Admissibility>>>;
}

export const getAdmissibility =
  (deps: GetAdmissibilityDeps) =>
  async (params: {
    candidacyId: string;
  }): Promise<Either<FunctionalError, Maybe<Admissibility>>> => {
    if (!deps.hasRole("admin") && !deps.hasRole("manage_candidacy")) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.NOT_AUTHORIZED,
          `Vous n'avez pas accès à la recevabilité de cette candidature`
        )
      );
    }

    return EitherAsync.fromPromise(() =>
      deps.getAdmissibilityFromCandidacyId({ candidacyId: params.candidacyId })
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.TECHNICAL_ERROR,
          `Erreur pendant la récupération de la recevabilité de la candidature`
        )
    );
  };
