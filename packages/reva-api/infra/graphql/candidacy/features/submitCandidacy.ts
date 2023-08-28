import { Organism } from "@prisma/client";
import { Either, EitherAsync, Left, Maybe, Right } from "purify-ts";

import { Candidacy } from "../../../../domain/types/candidacy";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";

interface SubmitCandidacyDeps {
  updateCandidacyStatus: (params: {
    candidacyId: string;
    status: "VALIDATION";
  }) => Promise<Either<string, Candidacy>>;
  getCandidacyFromId: (id: string) => Promise<Either<string, Candidacy>>;
  getOrganismFromCandidacyId: (
    id: string
  ) => Promise<Either<string, Maybe<Organism>>>;
  existsCandidacyHavingHadStatus: (params: {
    candidacyId: string;
    status: "VALIDATION";
  }) => Promise<Either<string, boolean>>;
  sendNewCandidacyEmail: (to: string) => Promise<Either<string, string>>;
}

export const submitCandidacy =
  (deps: SubmitCandidacyDeps) => (params: { candidacyId: string }) => {
    const checkIfCandidacyExists = EitherAsync.fromPromise(() =>
      deps.getCandidacyFromId(params.candidacyId)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
          `Aucune candidature n'a été trouvée`
        )
    );

    const validateCandidacyNotAlreadySubmitted = EitherAsync.fromPromise(() =>
      deps.existsCandidacyHavingHadStatus({
        candidacyId: params.candidacyId,
        status: "VALIDATION",
      })
    )
      .chain((existsCandidacy) => {
        if (existsCandidacy) {
          return EitherAsync.liftEither(
            Left(`Cette candidature ne peut être soumise à nouveau.`)
          );
        }
        return EitherAsync.liftEither(Right(existsCandidacy));
      })
      .mapLeft(
        (error: string) =>
          new FunctionalError(FunctionalCodeError.STATUS_NOT_UPDATED, error)
      );

    const updateContact = EitherAsync.fromPromise(() =>
      deps.updateCandidacyStatus({
        candidacyId: params.candidacyId,
        status: "VALIDATION",
      })
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.STATUS_NOT_UPDATED,
          `Erreur lors de la mise à jour du status`
        )
    );

    const getCandidacyOrganism = (candidacy: Candidacy) =>
      EitherAsync.fromPromise(async () => {
        const eitherMaybeOrganism = await deps.getOrganismFromCandidacyId(
          candidacy.id
        );
        if (eitherMaybeOrganism.isLeft()) return eitherMaybeOrganism;
        return Right({
          candidacy,
          organism: eitherMaybeOrganism.extract() as Maybe<Organism>,
        });
      }).mapLeft(
        (message) =>
          new FunctionalError(
            FunctionalCodeError.TECHNICAL_ERROR,
            `Impossible de trouver l'organisme pour la candidature ${candidacy.id}: ${message}`
          )
      );

    const alertOrganism = ({
      organism,
      candidacy,
    }: {
      organism: Maybe<Organism>;
      candidacy: Candidacy;
    }) =>
      EitherAsync.fromPromise(async () =>
        organism.isNothing()
          ? Left(`Could not fetch organism for candidacy ${candidacy.id}.`)
          : deps.sendNewCandidacyEmail(
              (organism.extract() as Organism).contactAdministrativeEmail
            )
      )
        .map((_) => candidacy)
        .mapLeft(
          (message) =>
            new FunctionalError(
              FunctionalCodeError.NEW_CANDIDACY_MAIL_NOT_SENT,
              `Erreur lors de l'envoi du mail d'alerte de nouvelle candidature : ${message}`
            )
        );

    return checkIfCandidacyExists
      .chain(() => validateCandidacyNotAlreadySubmitted)
      .chain(() => updateContact)
      .chain(getCandidacyOrganism)
      .chain(alertOrganism);
  };
