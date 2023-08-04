import { Either, EitherAsync, Left, Maybe } from "purify-ts";

import { Role } from "../../../../../domain/types/account";
import { PaymentRequest } from "../../../../../domain/types/candidacy";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../../domain/types/functionalError";

interface getPaymentRequestDeps {
  hasRole: (role: Role) => boolean;
  getPaymentRequestByCandidacyId: (params: {
    candidacyId: string;
  }) => Promise<Either<string, Maybe<PaymentRequest>>>;
}

export const getPaymentRequestByCandidacyId =
  (deps: getPaymentRequestDeps) =>
  async (params: {
    candidacyId: string;
  }): Promise<Either<FunctionalError, Maybe<PaymentRequest>>> => {
    if (!deps.hasRole("admin") && !deps.hasRole("manage_candidacy")) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.NOT_AUTHORIZED,
          `Vous n'avez pas accès à la recevabilité de cette candidature`
        )
      );
    }

    return EitherAsync.fromPromise(() =>
      deps.getPaymentRequestByCandidacyId({ candidacyId: params.candidacyId })
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.TECHNICAL_ERROR,
          `Erreur pendant la récupération de la demande de paiement de la candidature`
        )
    );
  };
