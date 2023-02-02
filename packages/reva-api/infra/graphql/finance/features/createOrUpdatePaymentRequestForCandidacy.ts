import { Either, EitherAsync, Left, Maybe, Right } from "purify-ts";

import { Role } from "../../../../domain/types/account";
import { PaymentRequest } from "../../../../domain/types/candidacy";
import { FundingRequest } from "../../../../domain/types/candidate";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";

interface CreateOrUpdatePaymentRequestDeps {
  hasRole: (role: Role) => boolean;
  getFundingRequestByCandidacyId: (params: {
    candidacyId: string;
  }) => Promise<Either<string, FundingRequest | null>>;
  getPaymentRequestByCandidacyId: (params: {
    candidacyId: string;
  }) => Promise<Either<string, Maybe<PaymentRequest>>>;
  createPaymentRequest: (params: {
    candidacyId: string;
    paymentRequest: PaymentRequest;
  }) => Promise<Either<string, PaymentRequest>>;
  updatePaymentRequest: (params: {
    paymentRequestId: string;
    paymentRequest: PaymentRequest;
  }) => Promise<Either<string, PaymentRequest>>;
}

export const createOrUpdatePaymentRequestForCandidacy =
  (deps: CreateOrUpdatePaymentRequestDeps) =>
  async (params: {
    candidacyId: string;
    paymentRequest: PaymentRequest;
  }): Promise<Either<FunctionalError, PaymentRequest>> => {
    if (!deps.hasRole("admin") && !deps.hasRole("manage_candidacy")) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.NOT_AUTHORIZED,
          `Vous n'avez pas accès à la demande de paiement de cette candidature`
        )
      );
    }

    const createOrUpdatePaymentRequest = (
      existingPaymentRequest: Maybe<PaymentRequest>
    ): Promise<Either<string, PaymentRequest>> =>
      existingPaymentRequest.caseOf({
        Just: (pr) =>
          deps.updatePaymentRequest({
            paymentRequestId: pr.id,
            paymentRequest: params.paymentRequest,
          }),

        Nothing: () =>
          deps.createPaymentRequest({
            candidacyId: params.candidacyId,
            paymentRequest: params.paymentRequest,
          }),
      });

    return EitherAsync.fromPromise(() =>
      deps.getFundingRequestByCandidacyId({ candidacyId: params.candidacyId })
    )
      .chain((fr) =>
        Promise.resolve(validatePaymentRequest(params.paymentRequest, fr))
      )
      .chain(() =>
        deps.getPaymentRequestByCandidacyId({ candidacyId: params.candidacyId })
      )
      .chain(createOrUpdatePaymentRequest)
      .mapLeft((v) =>
        v instanceof FunctionalError
          ? v
          : new FunctionalError(
              FunctionalCodeError.TECHNICAL_ERROR,
              `Erreur pendant la création ou la mise à jour de la demande de paiement pour la candidature ${params.candidacyId}`
            )
      );
  };

export const validatePaymentRequest = (
  pr: PaymentRequest,
  fr: FundingRequest | null
): Either<FunctionalError, PaymentRequest> => {
  const errors: string[] = [];
  if (!fr) {
    errors.push("Demande de financement non trouvée");
  } else {
    if (pr.basicSkillsEffectiveHourCount > fr.basicSkillsHourCount) {
      errors.push(
        "Le nombre d'heures réalisées pour les formations savoir de base doit être inférieur ou égal au nombre d'heures prévues dans la demande de prise en charge."
      );
    }
    if (
      pr.certificateSkillsEffectiveHourCount > fr.certificateSkillsHourCount
    ) {
      errors.push(
        "Le nombre d'heures réalisées pour les blocs de compétences certifiant doit être inférieur ou égal au nombre d'heures prévues dans la demande de prise en charge."
      );
    }
    if (pr.collectiveEffectiveHourCount > fr.collectiveHourCount) {
      errors.push(
        "Le nombre d'heures réalisées pour l'accompagnement collectif doit être inférieur ou égal au nombre d'heures prévues dans la demande de prise en charge."
      );
    }
    if (pr.diagnosisEffectiveHourCount > fr.diagnosisHourCount) {
      errors.push(
        "Le nombre d'heures réalisées pour l'entretien de faisabilité doit être inférieur ou égal au nombre d'heures prévues dans la demande de prise en charge."
      );
    }
    if (pr.examEffectiveHourCount > fr.examHourCount) {
      errors.push(
        "Le nombre d'heures réalisées pour la prestation jury  doit être inférieur ou égal au nombre d'heures prévues dans la demande de prise en charge."
      );
    }
    if (pr.individualEffectiveHourCount > fr.individualHourCount) {
      errors.push(
        "Le nombre d'heures réalisées pour l'accompagnement individuel doit être inférieur ou égal au nombre d'heures prévues dans la demande de prise en charge."
      );
    }
    if (
      pr.mandatoryTrainingsEffectiveHourCount > fr.mandatoryTrainingsHourCount
    ) {
      errors.push(
        "Le nombre d'heures réalisées pour les formations obligatoires doit être inférieur ou égal au nombre d'heures prévues dans la demande de prise en charge."
      );
    }
    if (pr.postExamEffectiveHourCount > fr.postExamHourCount) {
      errors.push(
        "Le nombre d'heures réalisées pour l'entretien post jury doit être inférieur ou égal au nombre d'heures prévues dans la demande de prise en charge."
      );
    }
  }
  return errors.length
    ? Left(
        new FunctionalError(
          FunctionalCodeError.FUNDING_REQUEST_NOT_POSSIBLE,
          `Une erreur est survenue lors de la validation du formulaire`,
          errors
        )
      )
    : Right(pr);
};
