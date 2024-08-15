import { Candidate } from "../../../candidate/candidate.types";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../shared/error/functionalError";
import { FundingRequest, PaymentRequest } from "../finance.types";
import {
  getTotalCost,
  validateIndividualCosts,
  validateTotalCost,
} from "./costValidationUtils";

import { getAfgsuTrainingId } from "../../../candidacy/training/features/getAfgsuTrainingId";
import { getFundingRequest } from "../database/fundingRequests";
import {
  createPaymentRequest,
  getPaymentRequestByCandidacyId,
  updatePaymentRequest,
} from "../database/paymentRequest";
import { getCandidacyById } from "../../../candidacy/features/getCandidacyById";
import { getCandidateById } from "../../../candidacy/features/getCandidateById";

export const createOrUpdatePaymentRequestForCandidacy = async ({
  candidacyId,
  paymentRequest,
}: {
  candidacyId: string;
  paymentRequest: PaymentRequest;
}) => {
  const afgsuTrainingId = await getAfgsuTrainingId();

  const fundingRequest = await getFundingRequest({
    candidacyId,
  });

  if (!fundingRequest) {
    throw new Error("Demande de financement non trouvée");
  }

  const candidacy = await getCandidacyById({ candidacyId });

  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  const candidate = await getCandidateById({
    candidateId: candidacy.candidateId || "",
  });

  if (!candidate) {
    throw new Error("Candidat non trouvé");
  }

  validatePaymentRequest(
    candidate,
    paymentRequest,
    fundingRequest,
    afgsuTrainingId,
  );

  const existingPaymentRequest = await getPaymentRequestByCandidacyId({
    candidacyId,
  });

  return existingPaymentRequest
    ? updatePaymentRequest({
        paymentRequestId: existingPaymentRequest.id,
        paymentRequest,
      })
    : createPaymentRequest({
        candidacyId,
        paymentRequest,
      });
};

const validatePaymentRequest = (
  candidate: Candidate,
  pr: PaymentRequest,
  fr: FundingRequest | null,
  afgsuTrainingId: string | null,
) => {
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
        (mt: { training: { id: string } }) =>
          mt.training.id === afgsuTrainingId,
      ),
      numberOfMandatoryTrainings: fr.mandatoryTrainings.length,
    });

    const total = getTotalCost(hoursAndCosts);
    const totalCostErrorMessage = validateTotalCost(
      total,
      isCandidateBacNonFragile,
    );
    totalCostErrorMessage && errors.push(totalCostErrorMessage);
  }

  if (errors.length) {
    throw new FunctionalError(
      FunctionalCodeError.FUNDING_REQUEST_NOT_POSSIBLE,
      `Une erreur est survenue lors de la validation du formulaire`,
      errors,
    );
  }

  return pr;
};
