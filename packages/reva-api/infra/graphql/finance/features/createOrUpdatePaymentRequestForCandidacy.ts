import { Decimal } from "@prisma/client/runtime";
import { Either, EitherAsync, Left, Maybe, Right } from "purify-ts";

import { PaymentRequest } from "../../../../domain/types/candidacy";
import { Candidate, FundingRequest } from "../../../../domain/types/candidate";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";
import {
  getTotalCost,
  validateIndividualCosts,
  validateTotalCost,
} from "./costValidationUtils";

interface CreateOrUpdatePaymentRequestDeps {
  getCandidateByCandidacyId: (id: string) => Promise<Either<string, Candidate>>;
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
  getAfgsuTrainingId: () => Promise<string | null>;
}

export const createOrUpdatePaymentRequestForCandidacy =
  (deps: CreateOrUpdatePaymentRequestDeps) =>
  async (params: {
    candidacyId: string;
    paymentRequest: PaymentRequest;
  }): Promise<Either<FunctionalError, PaymentRequest>> => {
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

    const afgsuTrainingId = await deps.getAfgsuTrainingId();

    return EitherAsync.fromPromise(() =>
      deps.getFundingRequestByCandidacyId({ candidacyId: params.candidacyId })
    )
      .map((fundingRequest) =>
        EitherAsync.fromPromise(() =>
          deps.getCandidateByCandidacyId(params.candidacyId)
        ).map((candidate) => ({ fundingRequest, candidate }))
      )
      .join()
      .chain((candidateAndFundingRequest) =>
        Promise.resolve(
          validatePaymentRequest(
            candidateAndFundingRequest.candidate,
            params.paymentRequest,
            candidateAndFundingRequest.fundingRequest,
            afgsuTrainingId
          )
        )
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
  candidate: Candidate,
  pr: PaymentRequest,
  fr: FundingRequest | null,
  afgsuTrainingId: string | null
): Either<FunctionalError, PaymentRequest> => {
  let errors: string[] = [];

  if (!fr) {
    errors.push("Demande de financement non trouvée");
  } else {
    const hoursAndCosts = {
      diagnosisHourCount: pr.diagnosisEffectiveHourCount,
      diagnosisCost: pr.diagnosisEffectiveCost,
      postExamHourCount: pr.postExamEffectiveHourCount,
      postExamCost: pr.postExamEffectiveCost,
      individualHourCount: pr.individualEffectiveHourCount,
      individualCost: pr.individualEffectiveCost,
      collectiveHourCount: pr.collectiveEffectiveHourCount,
      collectiveCost: pr.collectiveEffectiveCost,
      mandatoryTrainingsHourCount: pr.mandatoryTrainingsEffectiveHourCount,
      mandatoryTrainingsCost: pr.mandatoryTrainingsEffectiveCost,
      basicSkillsHourCount: pr.basicSkillsEffectiveHourCount,
      basicSkillsCost: pr.basicSkillsEffectiveCost,
      certificateSkillsHourCount: pr.certificateSkillsEffectiveHourCount,
      certificateSkillsCost: pr.certificateSkillsEffectiveCost,
      examHourCount: pr.examEffectiveHourCount,
      examCost: pr.examEffectiveCost,
      otherTrainingHourCount: pr.otherTrainingEffectiveHourCount,
      otherTrainingCost: pr.otherTrainingEffectiveCost,
    };
    const isCandidateBacNonFragile =
      (candidate.highestDegree?.level || 0) > 4 &&
      (candidate.vulnerabilityIndicator?.label || "Vide") === "Vide";

    errors = validateIndividualCosts({
      hoursAndCosts,
      isCandidateBacNonFragile,
      mandatoryTrainingContainAfgsu: fr.mandatoryTrainings.some(
        (mt: { training: { id: string } }) => mt.training.id === afgsuTrainingId
      ),
      numberOfMandatoryTrainings: fr.mandatoryTrainings.length,
    });

    const total = getTotalCost(hoursAndCosts);
    const totalCostErrorMessage = validateTotalCost(
      total,
      isCandidateBacNonFragile
    );
    totalCostErrorMessage && errors.push(totalCostErrorMessage);
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
