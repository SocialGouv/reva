import { Either, EitherAsync, Left, Maybe, Right } from "purify-ts";

import { Role } from "../types/account";
import { PaymentRequest } from "../types/candidacy";
import { FundingRequest } from "../types/candidate";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

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
        "Le nombre d'heures demandé pour les formations savoir de base est supérieur au nombre d'heures de la demande de financement."
      );
    }
    if (
      pr.certificateSkillsEffectiveHourCount > fr.certificateSkillsHourCount
    ) {
      errors.push(
        "Le nombre d'heures demandé pour les blocs de compétences certifiant est supérieur au nombre d'heures de la demande de financement."
      );
    }
    if (pr.collectiveEffectiveHourCount > fr.collectiveHourCount) {
      errors.push(
        "Le nombre d'heures demandé pour l'accompagnement collectif est supérieur au nombre d'heures de la demande de financement."
      );
    }
    if (pr.diagnosisEffectiveHourCount > fr.diagnosisHourCount) {
      errors.push(
        "Le nombre d'heures demandé pour l'entretien de faisabilité est supérieur au nombre d'heures de la demande de financement."
      );
    }
    if (pr.examEffectiveHourCount > fr.examHourCount) {
      errors.push(
        "Le nombre d'heures demandé pour la prestation jury  est supérieur au nombre d'heures de la demande de financement."
      );
    }
    if (pr.individualEffectiveHourCount > fr.individualHourCount) {
      errors.push(
        "Le nombre d'heures demandé pour l'accompagnement individuel est supérieur au nombre d'heures de la demande de financement."
      );
    }
    if (
      pr.mandatoryTrainingsEffectiveHourCount > fr.mandatoryTrainingsHourCount
    ) {
      errors.push(
        "Le nombre d'heures demandé pour les formations obligatoires est supérieur au nombre d'heures de la demande de financement."
      );
    }
    if (pr.postExamEffectiveHourCount > fr.postExamHourCount) {
      errors.push(
        "Le nombre d'heures demandé pour l'entretien post jury est supérieur au nombre d'heures de la demande de financement."
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
