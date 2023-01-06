import { Account } from "@prisma/client";
import { Either, EitherAsync, Left, Right } from "purify-ts";

import { Role } from "../types/account";
import { Candidacy } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";
import {
  CanManageCandidacyDeps,
  CanManageCandidacyParams,
} from "./canManageCandidacy";

interface SubmitTrainingDeps {
  hasRole: (role: Role) => boolean;
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
      isCertificationPartial: boolean;
    };
  }) => Promise<Either<string, Candidacy>>;
  canManageCandidacy: (
    deps: CanManageCandidacyDeps,
    params: CanManageCandidacyParams
  ) => Promise<Either<string, boolean>>;
  getCandidacyFromId: (
    candidacyId: string
  ) => Promise<Either<string, Candidacy>>;
  getAccountFromKeycloakId: (
    candidacyId: string
  ) => Promise<Either<string, Account>>;
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
    keycloakId: string;
    training: {
      basicSkillIds: string[];
      mandatoryTrainingIds: string[];
      certificateSkills: string;
      otherTraining: string;
      individualHourCount: number;
      collectiveHourCount: number;
      additionalHourCount: number;
      validatedByCandidate: boolean;
      isCertificationPartial: boolean;
    };
  }) => {
    const canManageCandidacy = EitherAsync.fromPromise(() =>
      deps.canManageCandidacy(
        {
          getAccountFromKeycloakId: deps.getAccountFromKeycloakId,
          getCandidacyFromId: deps.getCandidacyFromId,
          hasRole: deps.hasRole,
        },
        { candidacyId: params.candidacyId, keycloakId: params.keycloakId }
      )
    )
      .chain((isAllowed) =>
        EitherAsync.liftEither(
          isAllowed
            ? Right(true)
            : Left(`Vous n'êtes pas authorisé à traiter cette candidature.`)
        )
      )
      .mapLeft(
        (error: string) =>
          new FunctionalError(FunctionalCodeError.NOT_AUTHORIZED, error)
      );

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

    return existsCandidacyInValidation
      .chain(() => canManageCandidacy)
      .chain(() => updateTrainingInformations)
      .chain(() => updateCandidacy);
  };
