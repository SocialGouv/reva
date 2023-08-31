import { ReorientationReason } from "@prisma/client";
import { Either, EitherAsync, Left, Maybe } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../domain/types/functionalError";
import { Role } from "../../account/account.types";
import { Candidacy } from "../candidacy.types";

interface ArchiveCandidacyDeps {
  getCandidacyFromId: (
    candidacyId: string
  ) => Promise<Either<string, Candidacy>>;
  getReorientationReasonById: (params: {
    reorientationReasonId: string | null;
  }) => Promise<Either<string, Maybe<ReorientationReason>>>;
  hasRole: (role: Role) => boolean;
  archiveCandidacy: (params: {
    candidacyId: string;
    reorientationReasonId: string | null;
  }) => Promise<Either<string, Candidacy>>;
}

interface ArchiveCandidacyParams {
  candidacyId: string;
  reorientationReasonId: string | null;
}

export const archiveCandidacy =
  (deps: ArchiveCandidacyDeps) => (params: ArchiveCandidacyParams) => {
    const hasRequiredRole =
      deps.hasRole("manage_candidacy") || deps.hasRole("admin") || true;

    if (!hasRequiredRole) {
      return EitherAsync.liftEither(
        Left(`Vous n'êtes pas autorisé à archiver cette candidature.`)
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

    const checkIfCandidacyIsNotArchived = (candidacy: Candidacy) => {
      const isArchived = Boolean(
        candidacy.candidacyStatuses.find(
          (status) => status.status === "ARCHIVE" && status.isActive
        )
      );
      return Promise.resolve(
        Maybe.fromFalsy(!isArchived).toEither(
          new FunctionalError(
            FunctionalCodeError.CANDIDACY_ALREADY_ARCHIVED,
            `La candidature est déjà archivée`
          )
        )
      );
    };

    const checkIfReorientationReasonExists = EitherAsync.fromPromise(() =>
      deps.getReorientationReasonById(params)
    )
      .mapLeft(
        (error: string) =>
          new FunctionalError(
            FunctionalCodeError.CANDIDACIES_NOT_ARCHIVED,
            error
          )
      )
      .chain(async (maybeReorientationReason: Maybe<ReorientationReason>) => {
        return maybeReorientationReason.toEither(
          new FunctionalError(
            FunctionalCodeError.CANDIDACY_INVALID_REORIENTATION_REASON,
            `La raison de réorientation n'est pas valide`
          )
        );
      });

    const archiveCandidacyResult = EitherAsync.fromPromise(() =>
      deps.archiveCandidacy(params)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.CANDIDACIES_NOT_ARCHIVED,
          `Erreur lors de l'archivage de la candidature ${params.candidacyId}`
        )
    );

    if (params.reorientationReasonId) {
      return checkIfCandidacyExists
        .chain(checkIfCandidacyIsNotArchived)
        .chain(() => checkIfReorientationReasonExists)
        .chain(() => archiveCandidacyResult);
    } else {
      return checkIfCandidacyExists
        .chain(checkIfCandidacyIsNotArchived)
        .chain(() => archiveCandidacyResult);
    }
  };
