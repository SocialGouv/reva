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
      isCertificationPartial: boolean;
    };
  }) => Promise<Either<string, Candidacy>>;
  existsCandidacyHavingHadStatus: (params: {
    candidacyId: string;
    status: "PRISE_EN_CHARGE" | "DEMANDE_FINANCEMENT_ENVOYE";
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
      isCertificationPartial: boolean;
    };
  }) => {
    const validateCandidacyNotAlreadyFunding = EitherAsync.fromPromise(() =>
      deps.existsCandidacyHavingHadStatus({
        candidacyId: params.candidacyId,
        status: "DEMANDE_FINANCEMENT_ENVOYE",
      })
    )
      .chain((existsCandidacy) => {
        if (existsCandidacy) {
          return EitherAsync.liftEither(
            Left(
              `Ce parcours ne peut pas être envoyé car la candidature fait l'objet d'une demande de financement.`
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

    const validateCandidacyIsTakeOver = EitherAsync.fromPromise(() =>
      deps.existsCandidacyHavingHadStatus({
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

    return validateCandidacyNotAlreadyFunding
      .chain(() => validateCandidacyIsTakeOver)
      .chain(() => updateTrainingInformations)
      .chain(() => updateCandidacy);
  };
