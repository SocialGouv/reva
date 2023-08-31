import { isBefore } from "date-fns";
import { Either, EitherAsync, Left, Maybe } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../domain/types/functionalError";
import { Admissibility } from "../candidacy.types";

interface UpdateAdmissibilityDeps {
  getAdmissibilityFromCandidacyId: (params: {
    candidacyId: string;
  }) => Promise<Either<string, Maybe<Admissibility>>>;
  updateAdmissibility: (params: {
    admissibilityId: string;
    admissibility: Admissibility;
  }) => Promise<Either<string, Admissibility>>;
}

const isBefore2019 = (date: Date) => isBefore(date, new Date(2019, 0));

export const updateAdmissibility =
  (deps: UpdateAdmissibilityDeps) =>
  async ({
    candidacyId,
    admissibility,
  }: {
    candidacyId: string;
    admissibility: Partial<Admissibility>;
  }): Promise<Either<FunctionalError, Admissibility>> => {
    if (
      admissibility.reportSentAt &&
      isBefore2019(admissibility.reportSentAt)
    ) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.TECHNICAL_ERROR,
          "La date d'envoi du dossier de la faisabilité doit être après 2019 "
        )
      );
    }
    if (
      admissibility.certifierRespondedAt &&
      isBefore2019(admissibility.certifierRespondedAt)
    ) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.TECHNICAL_ERROR,
          "La date du prononcé de la recevabilité doit être après 2019 "
        )
      );
    }
    if (
      admissibility.responseAvailableToCandidateAt &&
      isBefore2019(admissibility.responseAvailableToCandidateAt)
    ) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.TECHNICAL_ERROR,
          "La date de réception de l'avis de recevabilité doit être après 2019 "
        )
      );
    }

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
              ...admissibility,
            },
          }),

        Nothing: () =>
          Promise.resolve(
            Left("Erreur admissibilité non trouvé pour la candidature")
          ),
      });

    return EitherAsync.fromPromise(() =>
      deps.getAdmissibilityFromCandidacyId({ candidacyId: candidacyId })
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
