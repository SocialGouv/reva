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
      deps.hasRole("manage_candidacy") || deps.hasRole("admin");
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

    // .chain((existsCandidacy) => {

    // );

    // const updateCandidacy = EitherAsync.fromPromise(() =>
    //   deps.updateCandidacyStatus({
    //     candidacyId: params.candidacyId,
    //     status: "PRISE_EN_CHARGE",
    //   })
    // ).mapLeft(
    //   () =>
    //     new FunctionalError(
    //       FunctionalCodeError.CANDIDACIES_NOT_TAKEN_OVER,
    //       `Erreur lors de la prise en charge de la candidature ${params.candidacyId}`
    //     )
    // );

    // return existsCandidacyInValidation.chain(() => updateCandidacy);
    return Right("yolo");
  };
