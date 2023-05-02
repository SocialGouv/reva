import { Decimal } from "@prisma/client/runtime/library";
import { Left, Maybe, Right } from "purify-ts";

import { PaymentRequest } from "../../../../domain/types/candidacy";
import { Candidate, FundingRequest } from "../../../../domain/types/candidate";
import { createOrUpdatePaymentRequestForCandidacy } from "./createOrUpdatePaymentRequestForCandidacy";

const defaultValidPaymentRequest: PaymentRequest = {
  id: "1234",
  basicSkillsEffectiveHourCount: 1,
  basicSkillsEffectiveCost: new Decimal(1),
  certificateSkillsEffectiveHourCount: 2,
  certificateSkillsEffectiveCost: new Decimal(2),
  collectiveEffectiveHourCount: 3,
  collectiveEffectiveCost: new Decimal(3),
  diagnosisEffectiveHourCount: 2,
  diagnosisEffectiveCost: new Decimal(3),
  examEffectiveHourCount: 1,
  examEffectiveCost: new Decimal(5),
  individualEffectiveHourCount: 6,
  individualEffectiveCost: new Decimal(6),
  mandatoryTrainingsEffectiveHourCount: 7,
  mandatoryTrainingsEffectiveCost: new Decimal(7),
  postExamEffectiveHourCount: 1,
  postExamEffectiveCost: new Decimal(8),
  otherTrainingEffectiveHourCount: 2,
  otherTrainingEffectiveCost: new Decimal(25),
  invoiceNumber: "invoiceNumber_123",
};

const defaultValidFundingRequest: FundingRequest = {
  id: "5678",
  basicSkillsHourCount: 1,
  certificateSkillsHourCount: 2,
  collectiveHourCount: 3,
  diagnosisHourCount: 2,
  examHourCount: 1,
  individualHourCount: 6,
  mandatoryTrainingsHourCount: 7,
  postExamHourCount: 1,
  mandatoryTrainings: [],
} as FundingRequest;

describe("create or update payment request", () => {
  describe("create or update payment request", () => {
    test("should create a new valid payment request", async () => {
      const cpr = createOrUpdatePaymentRequestForCandidacy({
        createPaymentRequest: (params: {
          candidacyId: string;
          paymentRequest: PaymentRequest;
        }) => Promise.resolve(Right(params.paymentRequest)),

        getPaymentRequestByCandidacyId: () =>
          Promise.resolve(Right(Maybe.empty())),
        getFundingRequestByCandidacyId: () =>
          Promise.resolve(Right(defaultValidFundingRequest)),

        updatePaymentRequest: () =>
          Promise.resolve(Left("Test should not run update method")),
        getAfgsuTrainingId: () => Promise.resolve(null),
        getCandidateByCandidacyId: () =>
          Promise.resolve(
            Right({
              highestDegree: { level: 1 },
              vulnerabilityIndicator: { label: "Vide" },
            } as Candidate)
          ),
      });
      const result = await cpr({
        candidacyId: "1234",
        paymentRequest: defaultValidPaymentRequest,
      });
      console.log(result);
      expect(result.isRight()).toEqual(true);
    });
  });
  test("should update an existing valid payment request", async () => {
    const cpr = createOrUpdatePaymentRequestForCandidacy({
      createPaymentRequest: () =>
        Promise.resolve(Left("Test should not run create method")),
      getPaymentRequestByCandidacyId: () =>
        Promise.resolve(Right(Maybe.of(defaultValidPaymentRequest))),
      getFundingRequestByCandidacyId: () =>
        Promise.resolve(Right(defaultValidFundingRequest)),

      updatePaymentRequest: (params: { paymentRequest: PaymentRequest }) =>
        Promise.resolve(Right(params.paymentRequest)),
      getAfgsuTrainingId: () => Promise.resolve(null),
      getCandidateByCandidacyId: () =>
        Promise.resolve(
          Right({
            highestDegree: { level: 1 },
            vulnerabilityIndicator: { label: "Vide" },
          } as Candidate)
        ),
    });
    const result = await cpr({
      candidacyId: "1234",
      paymentRequest: defaultValidPaymentRequest,
    });
    expect(result.isRight()).toEqual(true);
  });
});
