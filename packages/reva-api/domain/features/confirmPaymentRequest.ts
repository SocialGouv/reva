import { Either, EitherAsync, Left, Maybe, Right } from "purify-ts";

import { Role } from "../types/account";
import { Candidacy, PaymentRequest } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface ConfirmPaymentRequestDeps {
  hasRole: (role: Role) => boolean;
  existsCandidacyWithActiveStatus: (params: {
    candidacyId: string;
    status: "DEMANDE_FINANCEMENT_ENVOYE";
  }) => Promise<Either<string, boolean>>;
  getPaymentRequestByCandidacyId: (params: {
    candidacyId: string;
  }) => Promise<Either<string, Maybe<PaymentRequest>>>;
  updateCandidacyStatus: (params: {
    candidacyId: string;
    status: "DEMANDE_PAIEMENT_ENVOYEE";
  }) => Promise<Either<string, Candidacy>>;
}

export const confirmPaymentRequest =
  (deps: ConfirmPaymentRequestDeps) => (params: { candidacyId: string }) => {
    if (!deps.hasRole("admin") && !deps.hasRole("manage_candidacy")) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.NOT_AUTHORIZED,
          `Vous n'avez pas accès à la recevabilité de cette candidature`
        )
      );
    }

    const validateCandidacyStatus = EitherAsync.fromPromise(() =>
      deps.existsCandidacyWithActiveStatus({
        candidacyId: params.candidacyId,
        status: "DEMANDE_FINANCEMENT_ENVOYE",
      })
    )
      .chain((existsCandidacy) => {
        if (!existsCandidacy) {
          return EitherAsync.liftEither(
            Left(
              `La demande de paiement de la candidature ${params.candidacyId} ne peut être confirmée: statut invalide.`
            )
          );
        }
        return EitherAsync.liftEither(Right(existsCandidacy));
      })
      .mapLeft(
        (error: string) =>
          new FunctionalError(
            FunctionalCodeError.PAYMENT_REQUEST_NOT_CONFIRMED,
            error
          )
      );

    const validateCandidacyPaymentRequestExistence = async () =>
      (
        await deps.getPaymentRequestByCandidacyId({
          candidacyId: params.candidacyId,
        })
      )
        .chain((pr) =>
          pr.isJust()
            ? Right(true)
            : Left(
                `Aucune demande de paiement trouvée pour la candidature ${params.candidacyId}`
              )
        )
        .mapLeft(
          (error: string) =>
            new FunctionalError(
              FunctionalCodeError.PAYMENT_REQUEST_NOT_CONFIRMED,
              error
            )
        );

    const updateCandidacy = EitherAsync.fromPromise(() =>
      deps.updateCandidacyStatus({
        candidacyId: params.candidacyId,
        status: "DEMANDE_PAIEMENT_ENVOYEE",
      })
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.PAYMENT_REQUEST_NOT_CONFIRMED,
          `Erreur lors de la confirmation de la demande de paiement de la candidature ${params.candidacyId}`
        )
    );

    return validateCandidacyStatus
      .chain(validateCandidacyPaymentRequestExistence)
      .chain(() => updateCandidacy);
  };
