import { Either, EitherAsync, Left, Maybe } from "purify-ts";

import { Role } from "../types/account";
import { Admissibility } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface UpdateAdmissibilityDeps {
  getAdmissibilityFromCandidacyId: (params: {
    candidacyId: string;
  }) => Promise<Either<string, Maybe<Admissibility>>>;
  updateAdmissibility: (params: {
    admissibilityId: string;
    admissibility: Admissibility;
  }) => Promise<Either<string, Admissibility>>;
}

export const updateAdmissibility =
  (deps: UpdateAdmissibilityDeps) =>
  async (params: {
    candidacyId: string;
    admissibility: Partial<Admissibility>;
  }): Promise<Either<FunctionalError, Admissibility>> => {
    const updateAdmissibilityOrRaiseError = (
      existingAdmissibility: Maybe<Admissibility>
    ): Promise<Either<string, Admissibility>> =>
      existingAdmissibility.caseOf({
        Just: (a) =>
          deps.updateAdmissibility({
            admissibilityId: a.id,
            admissibility: {
              ...a,
              certifierRespondedAt: null,
              reportSentAt: null,
              responseAvailableToCandidateAt: null,
              status: null,
              ...params.admissibility,
            },
          }),

        Nothing: () =>
          Promise.resolve(
            Left("Erreur admissibilité non trouvé pour la candidature")
          ),
      });

    return EitherAsync.fromPromise(() =>
      deps.getAdmissibilityFromCandidacyId({ candidacyId: params.candidacyId })
    )
      .chain(updateAdmissibilityOrRaiseError)
      .mapLeft(
        () =>
          new FunctionalError(
            FunctionalCodeError.TECHNICAL_ERROR,
            `Erreur pendant la création ou la mise à jour de la recevabilité de la candidature`
          )
      );
  };
