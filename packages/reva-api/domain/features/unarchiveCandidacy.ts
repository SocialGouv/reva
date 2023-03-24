import { Either, EitherAsync, Left, Maybe } from "purify-ts";

import { Role } from "../types/account";
import { Candidacy } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface UnarchiveCandidacyDeps {
  getCandidacyFromId: (
    candidacyId: string
  ) => Promise<Either<string, Candidacy>>;
  hasRole: (role: Role) => boolean;
  unarchiveCandidacy: (params: {
    candidacyId: string;
  }) => Promise<Either<string, Candidacy>>;
}

interface UnarchiveCandidacyParams {
  candidacyId: string;
}

export const unarchiveCandidacy =
  (deps: UnarchiveCandidacyDeps) => (params: UnarchiveCandidacyParams) => {
    const hasRequiredRole =
      deps.hasRole("manage_candidacy") || deps.hasRole("admin") || true;

    if (!hasRequiredRole) {
      return EitherAsync.liftEither(
        Left(`Vous n'êtes pas autorisé à désarchiver cette candidature.`)
      ).mapLeft(
        (error: string) =>
          new FunctionalError(FunctionalCodeError.NOT_AUTHORIZED, error)
      );
    }

    const checkIfCandidacyExists = EitherAsync.fromPromise(() =>
      deps.getCandidacyFromId(params.candidacyId)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
          `Aucune candidature n'a été trouvée`
        )
    );

    const checkIfCandidacyIsArchived = (candidacy: Candidacy) => {
      const isArchived = Boolean(
        candidacy.candidacyStatuses.find(
          (status) => status.status === "ARCHIVE" && status.isActive
        )
      );
      return Promise.resolve(
        Maybe.fromFalsy(isArchived).toEither(
          new FunctionalError(
            FunctionalCodeError.CANDIDACIES_NOT_ARCHIVED,
            `La candidature n'est pas archivée`
          )
        )
      );
    };

    const unarchiveCandidacyResult = EitherAsync.fromPromise(() =>
      deps.unarchiveCandidacy(params)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.CANDIDACIES_NOT_ARCHIVED,
          `Erreur lors du désarchivage de la candidature ${params.candidacyId}`
        )
    );

    return checkIfCandidacyExists
      .chain(checkIfCandidacyIsArchived)
      .chain(() => unarchiveCandidacyResult);
  };
