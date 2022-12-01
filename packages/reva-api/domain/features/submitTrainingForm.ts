import { Either, EitherAsync, Left, Right } from "purify-ts";

import { Candidacy } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface SubmitTrainingDeps {
  updateTrainingInformations: (params: {
    candidacyId: string;
    training: {
      basicSkillIds: string[];
      mandatoryTrainingIds: string[];
      certificateSkills: string;
      otherTraining: string;
      individualHourCount: number;
      collectiveHourCount: number;
      additionalHourCount: number;
      validatedByCandidate: boolean;
    };
  }) => Promise<Either<string, Candidacy>>;
  hasRole: (role: string) => boolean;
  existsCandidacyWithActiveStatus: (params: {
    candidacyId: string;
    status: "PRISE_EN_CHARGE";
  }) => Promise<Either<string, boolean>>;
  updateCandidacyStatus: (params: {
    candidacyId: string;
    status: "PARCOURS_ENVOYE";
  }) => Promise<Either<string, Candidacy>>;
}

export const submitTraining =
  (deps: SubmitTrainingDeps) =>
  (params: {
    candidacyId: string;
    training: {
      basicSkillIds: string[];
      mandatoryTrainingIds: string[];
      certificateSkills: string;
      otherTraining: string;
      individualHourCount: number;
      collectiveHourCount: number;
      additionalHourCount: number;
      validatedByCandidate: boolean;
    };
  }) => {
    if (!deps.hasRole("manage_candidacy")) {
      return EitherAsync.liftEither(
        Left(`Vous n'êtes pas authorisé à traiter cette candidature.`)
      ).mapLeft(
        (error: string) =>
          new FunctionalError(FunctionalCodeError.NOT_AUTHORIZED, error)
      );
    }

    const existsCandidacyInValidation = EitherAsync.fromPromise(() =>
      deps.existsCandidacyWithActiveStatus({
        candidacyId: params.candidacyId,
        status: "PRISE_EN_CHARGE",
      })
    )
      .chain((existsCandidacy) => {
        if (!existsCandidacy) {
          return EitherAsync.liftEither(
            Left(
              `Ce parcours ne peut pas être envoyé car la candidature n'est pas encore prise en charge.`
            )
          );
        }
        return EitherAsync.liftEither(Right(existsCandidacy));
      })
      .mapLeft(
        (error: string) =>
          new FunctionalError(
            FunctionalCodeError.TRAINING_FORM_NOT_SUBMITTED,
            error
          )
      );

    const updateTrainingInformations = EitherAsync.fromPromise(() =>
      deps.updateTrainingInformations(params)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.TRAINING_FORM_NOT_SUBMITTED,
          `Erreur lors de la mise à jour du parcours candidat`
        )
    );

    const updateCandidacy = EitherAsync.fromPromise(() =>
      deps.updateCandidacyStatus({
        candidacyId: params.candidacyId,
        status: "PARCOURS_ENVOYE",
      })
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.TRAINING_FORM_NOT_SUBMITTED,
          `Erreur lors du changement de status de la candidature ${params.candidacyId}`
        )
    );

    // const updateCandidacyStatus =

    return existsCandidacyInValidation
      .chain(() => updateTrainingInformations)
      .chain(() => updateCandidacy);
  };
