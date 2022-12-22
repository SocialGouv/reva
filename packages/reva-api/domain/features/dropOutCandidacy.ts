import { Either, EitherAsync, Left, Right } from "purify-ts";

import { Role } from "../types/account";
import { Candidacy } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

// Check rights
// - role is admin or AP
// - current status is not abandon
// - (candidacy is related to AP)

interface DropOutCandidacyDeps {
  existsDropOutReason: (params: {
    dropOutReasonId: string;
  }) => Promise<Either<string, boolean>>;
  dropOutCandidacy: (params: {
    candidacyId: string;
    dropOutReasonId: string;
    dropOutDate: string;
    otherReasonContent?: string;
  }) => Promise<Either<string, Candidacy>>;
  hasRole: (role: Role) => boolean;
}

interface DropOutCandidacyParams {
  candidacyId: string;
  dropOutReasonId: string;
  dropOutDate: string;
  otherReasonContent?: string;
}
export const dropOutCandidacy =
  (deps: DropOutCandidacyDeps) => (params: DropOutCandidacyParams) => {
    const hasRequiredRole =
      deps.hasRole("manage_candidacy") || deps.hasRole("admin") || true;
    if (!hasRequiredRole) {
      return EitherAsync.liftEither(
        Left(
          `Vous n'êtes pas autorisé à déclarer l'abandon de cette candidature.`
        )
      ).mapLeft(
        (error: string) =>
          new FunctionalError(FunctionalCodeError.NOT_AUTHORIZED, error)
      );
    }

    const isCorrectDropOutReason = EitherAsync.fromPromise(() =>
      deps.existsDropOutReason(params)
    ).mapLeft(
      (error: string) =>
        new FunctionalError(
          FunctionalCodeError.CANDIDACY_INVALID_DROP_OUT_REASON,
          error
        )
    );

    const dropOutCandidacyResult = EitherAsync.fromPromise(() =>
      deps.dropOutCandidacy(params)
    ).mapLeft(
      (error: string) =>
        new FunctionalError(
          FunctionalCodeError.CANDIDACY_DROP_OUT_FAILED,
          error
        )
    );

    // return Right("yolo");

    return isCorrectDropOutReason.chain(() => dropOutCandidacyResult);
  };;
