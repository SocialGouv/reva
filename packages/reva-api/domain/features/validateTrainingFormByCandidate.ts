import { Either, EitherAsync, Left, Right } from "purify-ts";

import { Candidacy } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface ConfirmTrainingFormByCandidateDeps {
  existsCandidacyWithActiveStatus: (params: {
    candidacyId: string;
    status: "PARCOURS_ENVOYE";
  }) => Promise<Either<string, boolean>>;
  updateCandidacyStatus: (params: {
    candidacyId: string;
    status: "PARCOURS_CONFIRME";
  }) => Promise<Either<string, Candidacy>>;
}

export const confirmTrainingFormByCandidate =
  (deps: ConfirmTrainingFormByCandidateDeps) =>
  (params: { candidacyId: string }) => {
    const existsCandidacyInValidation = EitherAsync.fromPromise(() =>
      deps.existsCandidacyWithActiveStatus({
        candidacyId: params.candidacyId,
        status: "PARCOURS_ENVOYE",
      })
    )
      .chain((existsCandidacy) => {
        if (!existsCandidacy) {
          return EitherAsync.liftEither(
            Left(
              `Le parcours candidat de la candidature ${params.candidacyId} ne peut être confirmé`
            )
          );
        }
        return EitherAsync.liftEither(Right(existsCandidacy));
      })
      .mapLeft(
        (error: string) =>
          new FunctionalError(
            FunctionalCodeError.TRAINING_FORM_NOT_CONFIRMED,
            error
          )
      );

    const updateCandidacy = EitherAsync.fromPromise(() =>
      deps.updateCandidacyStatus({
        candidacyId: params.candidacyId,
        status: "PARCOURS_CONFIRME",
      })
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.TRAINING_FORM_NOT_CONFIRMED,
          `Erreur lors de la confirmation du parcours candidat de la candidature ${params.candidacyId}`
        )
    );

    return existsCandidacyInValidation.chain(() => updateCandidacy);
  };
